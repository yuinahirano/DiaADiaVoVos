// Dia a Dia Vovos - Pulseira ESP32 + MAX30102 + TFT ILI9341 (touch XPT2046)
//
// Telas: nome da rede da pulseira (teclado) -> configurar Wi-Fi (portal) -> conectando -> monitor -> historico
// Medicao: janelas de 100 amostras, mediana de varias janelas. Guarda na flash (LittleFS) e entrega ao app por HTTP.
//
// Endpoints (porta 80):
//   GET  /status                 -> { ok, registros, relogio, intervalo, nome, host, ip, hora }
//   GET  /leituras               -> { leituras: [{ seq, medidoEm, bpm, spo2 }, ...] } (ate 100, as mais antigas)
//   POST /confirmar?ate=<seq>    -> apaga os registros com seq <= ate
//   POST /config?intervalo=<seg> -> intervalo entre medicoes (20..86400, fica salvo)
//   POST /nome?valor=<nome>      -> NOVO: o app manda o nome vindo da API; vira o nome da rede, do mDNS e do /status
//   POST /esquecer-wifi          -> apaga o Wi-Fi salvo e reinicia
//
// Botao BOOT (GPIO0): ligada, segure 3 s para apagar o Wi-Fi salvo e a calibracao do toque.
// Bibliotecas: Adafruit GFX, Adafruit ILI9341, XPT2046_Touchscreen, SparkFun MAX3010x

// Bibliotecas
#include <Arduino.h>
#include <SPI.h>
#include <Wire.h>
#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <ESPmDNS.h>
#include <LittleFS.h>
#include <Preferences.h>
#include <sys/time.h>
#include <time.h>
#include <vector>
#include <algorithm>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <XPT2046_Touchscreen.h>
#include <Fonts/FreeSans9pt7b.h>
#include <Fonts/FreeSansBold12pt7b.h>
#include <Fonts/FreeSansBold24pt7b.h>
#include "MAX30105.h"
#include "spo2_algorithm.h"

// Tipos
struct __attribute__((packed)) Registro {
  uint32_t seq;
  uint32_t ts; // epoch UTC em segundos
  uint8_t  bpm;
  uint8_t  spo2;
};
static_assert(sizeof(Registro) == 10, "Registro deve ter 10 bytes");

enum ResConexao { CONN_OK, CONN_SEM_REDE, CONN_FALHA };
struct Tecla { int16_t x, y, w, h; char c; uint8_t tipo; };
enum { TK_CHAR, TK_SHIFT, TK_APAGA, TK_MODO, TK_ESPACO, TK_OK };
enum Fase : uint8_t { F_PARADO, F_ESPERA_RELOGIO, F_AGUARDA_INTERVALO, F_ESPERA_DEDO, F_MEDINDO, F_SENSOR_ERRO };
enum Tela : uint8_t { T_NOME, T_PORTAL, T_CONECTA, T_MONITOR, T_HIST };
enum View { V_SEM_RELOGIO, V_SENSOR_ERRO, V_ESPERA, V_PRONTO, V_FALHA, V_DEDO, V_MEDINDO };

// Defines
#define TFT_CS 5
#define TFT_RST 4
#define TFT_DC 2
#define TFT_MOSI 23
#define TFT_SCLK 18
#define TFT_MISO 19
#define TOUCH_CS 33
#define TOUCH_IRQ 27
#define I2C_SDA 21
#define I2C_SCL 22
#define PIN_RESET 0

// Ajuste aqui: intervalo padrao em segundos (o app muda via POST /config). A medicao leva ~15 s.
static const uint32_t INTERVALO_LEITURA_SEG = 60;
static const char*    TZ_STR = "<-03>3"; // Brasilia

static const uint32_t INTERVALO_MIN_SEG        = 20;
static const uint32_t INTERVALO_MAX_SEG        = 86400;
static const uint32_t INTERVALO_RETENTATIVA_MS = 20UL * 1000UL;
static const uint8_t  FALHAS_PARA_REINICIAR_SENSOR = 3;
static const uint32_t TIMEOUT_DEDO_MS = 30000;
static const uint32_t LIMIAR_IR       = 30000;
static const uint32_t EPOCH_MINIMO    = 1704067200UL; // 2024-01-01
static const size_t   MAX_REGISTROS   = 2000;
static const size_t   LOTE_HTTP       = 100;
static const char*    ARQUIVO         = "/registros.bin";
static const char*    ARQUIVO_TMP     = "/registros.tmp";
static const char*    AP_NOME_PADRAO  = "Pulseira-Config";
static const char*    AP_SENHA        = "pulseira123"; // minimo 8 caracteres
static const int      NOME_MAX        = 32;            // limite de SSID

constexpr uint16_t rgb565(uint8_t r, uint8_t g, uint8_t b) { return ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3); }
const uint16_t C_ICE    = rgb565(225, 245, 254);
const uint16_t C_WHITE  = rgb565(255, 255, 255);
const uint16_t C_BLACK  = rgb565(0, 0, 0);
const uint16_t C_YELLOW = rgb565(255, 214, 0);
const uint16_t C_PURPLE = rgb565(179, 157, 219);
const uint16_t C_GRAY   = rgb565(107, 107, 122);
const uint16_t C_GREEN  = rgb565(46, 160, 67);
const uint16_t C_RED    = rgb565(211, 47, 47);
const uint16_t C_LILAC  = rgb565(237, 231, 246);

// Variaveis globais
Adafruit_ILI9341 tft(TFT_CS, TFT_DC, TFT_RST);
XPT2046_Touchscreen ts(TOUCH_CS, TOUCH_IRQ);
MAX30105 sensor;
Preferences prefs;
WebServer servidor(80);
SemaphoreHandle_t mutexArquivo;
DNSServer dns;

uint32_t proximoSeq = 1;
bool sensorOk = false;
volatile uint32_t totalRegistros = 0;

// Estado compartilhado (task de medicao <-> tela)
volatile uint8_t  fase = F_PARADO;
volatile uint8_t  progresso = 0;
volatile uint32_t irAtual = 0;
volatile uint8_t  liveBpm = 0, liveSpo2 = 0;
volatile uint8_t  ultimoBpm = 0, ultimoSpo2 = 0;
volatile uint32_t ultimoTs = 0;
volatile uint8_t  falhaCod = 0; // 0 ok, 1 sem dedo, 2 dedo saiu, 3 leitura ruim, 4 sensor travou
volatile uint32_t proximaMedicaoMs = 0;
volatile bool     medirAgora = false;
volatile uint32_t intervaloSeg = INTERVALO_LEITURA_SEG;
volatile bool     intervaloMudou = false;
volatile bool     medicaoLiberada = false;

static Tela tela = T_NOME;
String wifiSsid, wifiSenha, entrada, opcoesRedes;
String nomeAp = "Pulseira-Config"; // nome da rede que a pulseira cria (e nome no app/mDNS)
bool servidorIniciado = false;
bool modoPortal = false, reiniciarEm = false, portalOcupado = false;
uint32_t reiniciarQuando = 0;

// Toque
static bool calibOk = false, calSwap = false;
static int calXr0 = 0, calXr1 = 4095, calYr0 = 0, calYr1 = 4095;

// Medicao
static uint16_t amostrasLidas = 0;

// Log da tela de conexao
static const int LOG_MAX = 11, LOG_Y0 = 66, LOG_PASSO = 20;
static char logTxt[LOG_MAX][34];
static uint16_t logCor[LOG_MAX];
static int logN = 0;

// Teclado
static Tecla teclas[56];
static int nTeclas = 0;
static uint8_t modoTeclado = 0; // 0 minusculo, 1 maiusculo, 2 simbolos
static const int KB_Y = 106, KB_PASSO = 40, KB_ALT = 36;

// Monitor
static const int SX = 10, SY = 40, SW = 220, SH = 88;
static const int BX = 10, BY = 138, BW = 105, BH = 108;
static const int OX = 125, OY = 138, OW = 105, OH = 108;
static const int PB_X = 40, PB_Y = SY + 60, PB_W = 160, PB_H = 14;
static const int BTN_Y = 254, BTN_H = 30, BTN_W = 105, BTN1_X = 10, BTN2_X = 125;
static int viewAtual = -1;
static char l2Atual[40] = "";
static int progDes = -1;
static uint32_t ultimoDots = 0;
static int dotStep = 0;
static String bpmDes, spoDes, rodapeDes;
static bool coracaoDesenhado = false, coracaoGrande = false;
static uint16_t coracaoCor = 0;
static uint32_t ultimoRodape = 0;

// Historico
static int histPagina = 0;
static const int HIST_POR_PAG = 7;
static const int HBTN_Y = 268, HBTN_H = 36;

// Portal
static int portalUltimoN = -1;
static const char PAGINA_CABECALHO[] =
  "<!DOCTYPE html><html><head><meta charset='utf-8'>"
  "<meta name='viewport' content='width=device-width,initial-scale=1'><title>Pulseira</title>"
  "<style>body{font-family:sans-serif;max-width:420px;margin:24px auto;padding:0 16px}"
  "input,button{width:100%;padding:12px;margin:8px 0;font-size:16px;box-sizing:border-box}"
  "button{background:#000;color:#fff;border:0;border-radius:8px}</style></head><body>";

// Prototipos
void abrirHistorico();
static size_t contarRegistros();
static void textoCentroPadrao(const char* txt, int cx, int top, uint8_t size, uint16_t cor, bool bold);
static bool iniciarSensor();
static void carregarCalibracao();
static void fazerCalibracao();
static void rotaStatus();
static void rotaLeituras();
static void rotaConfirmar();
static void rotaConfig();
static void rotaNome();
static void rotaEsquecerWifi();
static void rotaPortalRaiz();
static void rotaPortalSalvar();
static void rotaDesconhecida();
static void tarefaMedicao(void*);
static void carregarNomeAp();
static void carregarWifi();
static ResConexao conectarComNarracao(const String& ssid, const String& senha);
static void entrarMonitor();
static void abrirTecladoNome(const char* msg, uint16_t cor);
static void verificarReset();
static void tentarSalvoNoPortal();
static void manterWifi();
static bool lerToque(int& x, int& y);
static void aoTocarTeclado(int x, int y);
static void aoTocarPortal(int x, int y);
static void atualizarPortal();
static void aoTocarMonitor(int x, int y);
static void atualizarMonitor(uint32_t now);
static void aoTocarHistorico(int x, int y);

void setup()
{
  Serial.begin(115200);
  delay(500);
  Serial.println("\n=== Dia a Dia Vovos: pulseira BPM + SpO2 ===");
  pinMode(PIN_RESET, INPUT_PULLUP);

  mutexArquivo = xSemaphoreCreateMutex();
  if (!LittleFS.begin(true)) Serial.println("Falha ao montar LittleFS");
  prefs.begin("pulseira", false);
  proximoSeq = prefs.getUInt("seq", 1);
  uint32_t salvo = prefs.getUInt("intervalo", INTERVALO_LEITURA_SEG);
  if (salvo < INTERVALO_MIN_SEG || salvo > INTERVALO_MAX_SEG) salvo = INTERVALO_LEITURA_SEG;
  intervaloSeg = salvo;
  totalRegistros = contarRegistros();

  pinMode(TOUCH_CS, OUTPUT);
  digitalWrite(TOUCH_CS, HIGH);
  SPI.begin(TFT_SCLK, TFT_MISO, TFT_MOSI, TFT_CS);
  tft.begin(10000000);
  tft.setRotation(2);
  tft.fillScreen(C_ICE);
  textoCentroPadrao("Dia a Dia Vovos", 120, 130, 2, C_BLACK, true);
  textoCentroPadrao("Iniciando...", 120, 160, 1, C_GRAY, false);
  ts.begin();
  ts.setRotation(2);

  Wire.begin(I2C_SDA, I2C_SCL);
  sensorOk = iniciarSensor();
  Serial.println(sensorOk ? "MAX30102 ok" : "MAX30102 nao encontrado (confira a fiacao)");

  carregarCalibracao();
  if (!calibOk) fazerCalibracao();

  servidor.on("/status", HTTP_GET, rotaStatus);
  servidor.on("/leituras", HTTP_GET, rotaLeituras);
  servidor.on("/confirmar", HTTP_POST, rotaConfirmar);
  servidor.on("/config", HTTP_POST, rotaConfig);
  servidor.on("/nome", HTTP_POST, rotaNome);
  servidor.on("/esquecer-wifi", HTTP_POST, rotaEsquecerWifi);
  servidor.on("/", HTTP_GET, rotaPortalRaiz);          // so responde em modo portal
  servidor.on("/salvar", HTTP_POST, rotaPortalSalvar); // so responde em modo portal
  servidor.onNotFound(rotaDesconhecida);

  xTaskCreate(tarefaMedicao, "medicao", 10240, nullptr, 1, nullptr);

  // Com Wi-Fi salvo conecta narrando na tela; sem rede (ou se falhar) abre o teclado e o portal
  carregarNomeAp();
  carregarWifi();
  if (wifiSsid.length() > 0) {
    ResConexao r = conectarComNarracao(wifiSsid, wifiSenha);
    if (r == CONN_OK) { entrarMonitor(); Serial.println("Pulseira pronta."); return; }
    abrirTecladoNome("Nao conectou na rede salva", C_RED);
  } else {
    abrirTecladoNome("Esse sera o Wi-Fi que a pulseira cria", C_GRAY);
  }
  Serial.println("Aguardando configuracao do Wi-Fi.");
}

void loop()
{
  verificarReset();
  if (reiniciarEm && (int32_t)(millis() - reiniciarQuando) >= 0) ESP.restart();

  if (modoPortal) {
    dns.processNextRequest();
    servidor.handleClient();
    tentarSalvoNoPortal();
  } else if (servidorIniciado) {
    servidor.handleClient();
    manterWifi();
  }

  uint32_t now = millis();
  int tx = 0, ty = 0;
  bool toque = lerToque(tx, ty);
  if (toque) Serial.printf("Toque: x=%d y=%d\n", tx, ty);

  switch (tela) {
    case T_NOME:
      if (toque) aoTocarTeclado(tx, ty);
      break;
    case T_PORTAL:
      if (toque) aoTocarPortal(tx, ty);
      if (tela == T_PORTAL) atualizarPortal();
      break;
    case T_MONITOR:
      if (toque) aoTocarMonitor(tx, ty);
      if (tela == T_MONITOR) atualizarMonitor(now);
      break;
    case T_HIST:
      if (toque) aoTocarHistorico(tx, ty);
      break;
    default:
      break;
  }
  delay(2);
}

// Funcoes: texto e desenho
static void textoCentroFonte(const char* txt, int cx, int baseline, const GFXfont* f, uint16_t cor)
{
  tft.setFont(f); tft.setTextSize(1); tft.setTextColor(cor);
  int16_t x1, y1; uint16_t w, h;
  tft.getTextBounds(txt, 0, baseline, &x1, &y1, &w, &h);
  tft.setCursor(cx - (int)w / 2 - x1, baseline);
  tft.print(txt);
  tft.setFont();
}

static void textoEsqFonte(const char* txt, int x, int baseline, const GFXfont* f, uint16_t cor)
{
  tft.setFont(f); tft.setTextSize(1); tft.setTextColor(cor);
  tft.setCursor(x, baseline);
  tft.print(txt);
  tft.setFont();
}

static void textoCentroPadrao(const char* txt, int cx, int top, uint8_t size, uint16_t cor, bool bold)
{
  tft.setFont(); tft.setTextSize(size); tft.setTextColor(cor);
  int16_t x1, y1; uint16_t w, h;
  tft.getTextBounds(txt, 0, top, &x1, &y1, &w, &h);
  int x = cx - (int)w / 2;
  tft.setCursor(x, top); tft.print(txt);
  if (bold) { tft.setCursor(x + 1, top); tft.print(txt); }
  tft.setTextSize(1);
}

static void desenharCartao(int x, int y, int w, int h)
{
  tft.fillRoundRect(x, y, w, h, 14, C_WHITE);
  tft.drawRoundRect(x, y, w, h, 14, C_PURPLE);
  tft.drawRoundRect(x + 1, y + 1, w - 2, h - 2, 13, C_PURPLE);
}

static void desenharBotao(int x, int y, int w, int h, const char* t, uint16_t fundo)
{
  tft.fillRoundRect(x, y, w, h, 8, fundo);
  tft.drawRoundRect(x, y, w, h, 8, C_PURPLE);
  textoCentroFonte(t, x + w / 2, y + h / 2 + 6, &FreeSans9pt7b, C_BLACK);
}

static bool dentro(int px, int py, int x, int y, int w, int h)
{
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

static void desenharCoracaoIcone(int cx, int cy, int r, uint16_t c)
{
  tft.fillCircle(cx - r, cy - 1, r, c);
  tft.fillCircle(cx + r, cy - 1, r, c);
  tft.fillTriangle(cx - 2 * r, cy, cx + 2 * r, cy, cx, cy + 2 * r + 2, c);
}

static void desenharGota(int cx, int cy, uint16_t c)
{
  tft.fillCircle(cx, cy + 6, 9, c);
  tft.fillTriangle(cx - 8, cy + 3, cx + 8, cy + 3, cx, cy - 12, c);
  tft.fillCircle(cx - 3, cy + 6, 2, C_WHITE);
}

// Funcoes: toque e calibracao (3 pontos, salva na flash)
static void carregarCalibracao()
{
  Preferences p;
  p.begin("toque", true);
  calibOk = p.getBool("ok", false);
  calSwap = p.getBool("swap", false);
  calXr0 = p.getInt("x0", 0);
  calXr1 = p.getInt("x1", 4095);
  calYr0 = p.getInt("y0", 0);
  calYr1 = p.getInt("y1", 4095);
  p.end();
}

static void salvarCalibracao()
{
  Preferences p;
  p.begin("toque", false);
  p.putBool("ok", true);
  p.putBool("swap", calSwap);
  p.putInt("x0", calXr0);
  p.putInt("x1", calXr1);
  p.putInt("y0", calYr0);
  p.putInt("y1", calYr1);
  p.end();
}

static void apagarCalibracao()
{
  Preferences p;
  p.begin("toque", false);
  p.clear();
  p.end();
}

// Pixels de referencia: X em 20 e 220, Y em 20 e 300
static void mapearToque(int rx, int ry, int& x, int& y)
{
  int ax = calSwap ? ry : rx;
  int ay = calSwap ? rx : ry;
  long dx = calXr1 - calXr0; if (dx == 0) dx = 1;
  long dy = calYr1 - calYr0; if (dy == 0) dy = 1;
  x = 20 + (int)(((long)(ax - calXr0) * 200L) / dx);
  y = 20 + (int)(((long)(ay - calYr0) * 280L) / dy);
  x = constrain(x, 0, 239);
  y = constrain(y, 0, 319);
}

// Retorna true uma vez por toque (na descida do dedo), ja em pixels
static bool lerToque(int& x, int& y)
{
  static bool pressionado = false;
  static uint32_t visto = 0;
  uint32_t now = millis();
  if (ts.touched()) {
    visto = now;
    if (pressionado) return false;
    TS_Point p = ts.getPoint();
    long sx = p.x, sy = p.y; int n = 1;
    for (int i = 0; i < 3; i++) {
      delay(4);
      TS_Point q = ts.getPoint();
      sx += q.x; sy += q.y; n++;
    }
    pressionado = true;
    mapearToque((int)(sx / n), (int)(sy / n), x, y);
    return true;
  }
  if (pressionado && now - visto > 120) pressionado = false;
  return false;
}

// Bloqueia ate tocar e soltar; devolve a media dos valores brutos
static bool amostrarToque(int& rx, int& ry)
{
  while (!ts.touched()) delay(10);
  delay(40);
  long sx = 0, sy = 0; int n = 0;
  uint32_t t = millis();
  while (millis() - t < 120) {
    if (ts.touched()) {
      TS_Point p = ts.getPoint();
      sx += p.x; sy += p.y; n++;
    }
    delay(8);
  }
  uint32_t livre = millis();
  while (millis() - livre < 150) {
    if (ts.touched()) livre = millis();
    delay(5);
  }
  if (n < 3) return false;
  rx = (int)(sx / n); ry = (int)(sy / n);
  return true;
}

static void desenharCruz(int x, int y, uint16_t cor)
{
  tft.drawLine(x - 12, y, x + 12, y, cor);
  tft.drawLine(x, y - 12, x, y + 12, cor);
  tft.drawCircle(x, y, 6, cor);
}

static void fazerCalibracao()
{
  const int px[3] = {20, 220, 220};
  const int py[3] = {20, 20, 300};
  for (;;) {
    int rx[3] = {0, 0, 0}, ry[3] = {0, 0, 0};
    for (int i = 0; i < 3; i++) {
      tft.fillScreen(C_ICE);
      textoCentroFonte("Calibrar toque", 120, 130, &FreeSansBold12pt7b, C_BLACK);
      textoCentroPadrao("Toque no centro da cruz", 120, 150, 1, C_GRAY, false);
      char b[16]; snprintf(b, sizeof(b), "Ponto %d de 3", i + 1);
      textoCentroPadrao(b, 120, 166, 1, C_GRAY, false);
      desenharCruz(px[i], py[i], C_BLACK);
      while (!amostrarToque(rx[i], ry[i])) {}
    }
    // P1 -> P2 move so o X da tela: se o bruto que mais variou for o Y, os eixos estao trocados
    bool troca = abs(ry[1] - ry[0]) > abs(rx[1] - rx[0]);
    auto rawX = [&](int i) { return troca ? ry[i] : rx[i]; };
    auto rawY = [&](int i) { return troca ? rx[i] : ry[i]; };
    int x0 = rawX(0), x1 = rawX(1), y0 = rawY(1), y1 = rawY(2);
    if (abs(x1 - x0) < 400 || abs(y1 - y0) < 400) {
      tft.fillScreen(C_ICE);
      textoCentroFonte("Toque invalido", 120, 150, &FreeSansBold12pt7b, C_RED);
      textoCentroPadrao("Vamos repetir...", 120, 170, 1, C_GRAY, false);
      delay(1500);
      continue;
    }
    calSwap = troca; calXr0 = x0; calXr1 = x1; calYr0 = y0; calYr1 = y1;
    calibOk = true;
    salvarCalibracao();
    Serial.printf("Calibracao: swap=%d x[%d..%d] y[%d..%d]\n", troca, x0, x1, y0, y1);
    tft.fillScreen(C_ICE);
    textoCentroFonte("Toque calibrado!", 120, 160, &FreeSansBold12pt7b, C_GREEN);
    delay(900);
    return;
  }
}

// Funcoes: armazenamento (LittleFS). lerTodos/reescrever exigem o mutex tomado.
static void lerTodos(std::vector<Registro>& saida)
{
  saida.clear();
  File f = LittleFS.open(ARQUIVO, FILE_READ);
  if (!f) return;
  Registro r;
  while (f.read((uint8_t*)&r, sizeof(r)) == sizeof(r)) saida.push_back(r);
  f.close();
}

// Escreve num temporario e renomeia: se faltar energia, o arquivo antigo continua integro
static void reescrever(const std::vector<Registro>& v)
{
  File f = LittleFS.open(ARQUIVO_TMP, FILE_WRITE);
  if (!f) return;
  for (const auto& r : v) f.write((const uint8_t*)&r, sizeof(r));
  f.close();
  LittleFS.remove(ARQUIVO);
  LittleFS.rename(ARQUIVO_TMP, ARQUIVO);
}

static size_t contarRegistros()
{
  size_t total = 0;
  File f = LittleFS.open(ARQUIVO, FILE_READ);
  if (f) { total = f.size() / sizeof(Registro); f.close(); }
  return total;
}

static void salvarRegistro(uint8_t bpm, uint8_t spo2, uint32_t ts)
{
  xSemaphoreTake(mutexArquivo, portMAX_DELAY);
  Registro r = { proximoSeq++, ts, bpm, spo2 };
  prefs.putUInt("seq", proximoSeq);
  size_t antes = 0;
  File f = LittleFS.open(ARQUIVO, FILE_APPEND);
  if (f) {
    antes = f.size() / sizeof(Registro);
    f.write((const uint8_t*)&r, sizeof(r));
    f.close();
  }
  if (antes + 1 > MAX_REGISTROS) { // buffer circular: descarta os mais antigos
    std::vector<Registro> v;
    lerTodos(v);
    if (v.size() > MAX_REGISTROS) {
      v.erase(v.begin(), v.begin() + (v.size() - MAX_REGISTROS));
      reescrever(v);
    }
  }
  totalRegistros = (antes + 1 > MAX_REGISTROS) ? MAX_REGISTROS : (antes + 1);
  xSemaphoreGive(mutexArquivo);
}

static size_t apagarAte(uint32_t ackSeq)
{
  xSemaphoreTake(mutexArquivo, portMAX_DELAY);
  std::vector<Registro> v;
  lerTodos(v);
  v.erase(std::remove_if(v.begin(), v.end(),
                         [ackSeq](const Registro& r) { return r.seq <= ackSeq; }),
          v.end());
  reescrever(v);
  totalRegistros = v.size();
  xSemaphoreGive(mutexArquivo);
  Serial.printf("ACK %lu: restam %u registros\n", (unsigned long)ackSeq, (unsigned)v.size());
  return v.size();
}

static bool relogioAjustado()
{
  return time(nullptr) >= (time_t)EPOCH_MINIMO;
}

// Funcoes: sensor e medicao (task propria)
static bool iniciarSensor()
{
  if (!sensor.begin(Wire, I2C_SPEED_FAST)) return false;
  // brilho 60, media 4, vermelho+IR, 100 Hz (=25 amostras/s apos a media), pulso 411 us, ADC 16384
  sensor.setup(60, 4, 2, 100, 411, 16384);
  sensor.shutDown();
  return true;
}

static bool lerAmostra(uint32_t& red, uint32_t& ir)
{
  uint32_t inicio = millis();
  while (!sensor.available()) {
    sensor.check();
    if (millis() - inicio > 2000) return false; // sensor travado
    delay(1);
  }
  red = sensor.getRed();
  ir  = sensor.getIR();
  sensor.nextSample();
  return true;
}

// Total por medicao: 100 amostras iniciais + 10 ciclos x 25 = 350 (barra de progresso)
static bool lerAmostraP(uint32_t& red, uint32_t& ir)
{
  if (!lerAmostra(red, ir)) return false;
  amostrasLidas++;
  uint32_t p = (uint32_t)amostrasLidas * 100UL / 350UL;
  progresso = p > 100 ? 100 : (uint8_t)p;
  return true;
}

// true so se conseguiu uma leitura valida (mediana de varias janelas)
static bool medirInterno(uint8_t& bpmOut, uint8_t& spo2Out)
{
  falhaCod = 0; liveBpm = 0; liveSpo2 = 0; progresso = 0;
  fase = F_ESPERA_DEDO;
  sensor.wakeUp();

  uint32_t inicio = millis();
  uint32_t ultimoLog = 0;
  for (;;) {
    uint32_t irLido = sensor.getIR();
    irAtual = irLido;
    if (irLido >= LIMIAR_IR) break;
    if (millis() - ultimoLog > 1000) {
      ultimoLog = millis();
      Serial.printf("Aguardando o dedo... IR=%lu (precisa passar de %lu)\n",
                    (unsigned long)irLido, (unsigned long)LIMIAR_IR);
    }
    if (millis() - inicio > TIMEOUT_DEDO_MS) {
      sensor.shutDown();
      falhaCod = 1;
      Serial.println("Medicao descartada: sem contato");
      return false;
    }
    delay(250);
  }

  fase = F_MEDINDO;
  progresso = 0;
  amostrasLidas = 0;
  sensor.clearFIFO();
  static uint32_t ir[100], red[100];
  for (int i = 0; i < 100; i++) {
    if (!lerAmostraP(red[i], ir[i])) { sensor.shutDown(); falhaCod = 4; return false; }
  }

  int32_t fcs[10], spo2s[10];
  int validas = 0;
  for (int ciclo = 0; ciclo < 10; ciclo++) {
    int32_t spo2, fc;
    int8_t spo2Ok, fcOk;
    maxim_heart_rate_and_oxygen_saturation(ir, 100, red, &spo2, &spo2Ok, &fc, &fcOk);
    if (spo2Ok && fcOk && fc >= 30 && fc <= 220 && spo2 >= 50 && spo2 <= 100) {
      fcs[validas] = fc;
      spo2s[validas] = spo2;
      validas++;
      liveBpm = (uint8_t)fc;
      liveSpo2 = (uint8_t)spo2;
    }
    // Desliza a janela: descarta 25 amostras antigas e le 25 novas
    for (int i = 25; i < 100; i++) { red[i - 25] = red[i]; ir[i - 25] = ir[i]; }
    for (int i = 75; i < 100; i++) {
      if (!lerAmostraP(red[i], ir[i])) { sensor.shutDown(); falhaCod = 4; return false; }
    }
    uint32_t soma = 0;
    for (int i = 75; i < 100; i++) soma += ir[i];
    uint32_t media = soma / 25;
    irAtual = media;
    if (media < LIMIAR_IR) { // tirou o dedo no meio da medicao
      sensor.shutDown();
      falhaCod = 2;
      Serial.printf("Medicao descartada: contato perdido (IR medio=%lu, minimo=%lu)\n",
                    (unsigned long)media, (unsigned long)LIMIAR_IR);
      return false;
    }
  }
  sensor.shutDown();

  if (validas < 3) {
    falhaCod = 3;
    Serial.println("Medicao descartada: poucas janelas validas");
    return false;
  }
  std::sort(fcs, fcs + validas);
  std::sort(spo2s, spo2s + validas);
  bpmOut  = (uint8_t)fcs[validas / 2];
  spo2Out = (uint8_t)spo2s[validas / 2];
  progresso = 100;
  return true;
}

// Roda numa task propria para nao travar a tela nem o servidor HTTP
static void tarefaMedicao(void*)
{
  bool agendada = false;
  uint32_t proxima = 0;
  uint32_t base = 0; // quando terminou a ultima medicao boa
  uint8_t falhasSeguidas = 0;

  for (;;) {
    if (!medicaoLiberada) { vTaskDelay(pdMS_TO_TICKS(200)); continue; }

    if (!sensorOk) {
      fase = F_SENSOR_ERRO;
      vTaskDelay(pdMS_TO_TICKS(5000));
      sensorOk = iniciarSensor();
      continue;
    }

    // Sem hora certa nao da para carimbar as leituras: espera o NTP
    if (!relogioAjustado()) {
      fase = F_ESPERA_RELOGIO;
      vTaskDelay(pdMS_TO_TICKS(1000));
      continue;
    }

    // O app mudou o intervalo: reagenda a partir da ultima medicao boa
    if (intervaloMudou) {
      intervaloMudou = false;
      if (agendada && falhasSeguidas == 0) {
        proxima = base + intervaloSeg * 1000UL;
        proximaMedicaoMs = proxima;
      }
    }

    if (!agendada || medirAgora || (int32_t)(millis() - proxima) >= 0) {
      medirAgora = false;
      uint8_t bpm = 0, spo2 = 0;
      if (medirInterno(bpm, spo2)) {
        falhasSeguidas = 0;
        uint32_t agora = (uint32_t)time(nullptr);
        salvarRegistro(bpm, spo2, agora);
        ultimoBpm = bpm; ultimoSpo2 = spo2; ultimoTs = agora;
        Serial.printf("Leitura guardada: bpm=%u spo2=%u. Proxima em %lu s\n", bpm, spo2,
                      (unsigned long)intervaloSeg);
        base = millis();
        proxima = base + intervaloSeg * 1000UL;
      } else {
        if (++falhasSeguidas >= FALHAS_PARA_REINICIAR_SENSOR) {
          Serial.println("Varias falhas seguidas: reiniciando o sensor");
          sensorOk = iniciarSensor();
          falhasSeguidas = 0;
        }
        Serial.printf("Nova tentativa em %lu s\n", (unsigned long)(INTERVALO_RETENTATIVA_MS / 1000UL));
        proxima = millis() + INTERVALO_RETENTATIVA_MS;
      }
      proximaMedicaoMs = proxima;
      fase = F_AGUARDA_INTERVALO;
      agendada = true;
    } else if (fase != F_AGUARDA_INTERVALO) {
      proximaMedicaoMs = proxima;
      fase = F_AGUARDA_INTERVALO;
    }
    vTaskDelay(pdMS_TO_TICKS(200));
  }
}

// Funcoes: nome da pulseira (rede que ela cria, mDNS e /status)
static void carregarNomeAp()
{
  Preferences p;
  p.begin("ap", true);
  nomeAp = p.getString("nome", AP_NOME_PADRAO);
  p.end();
  if (nomeAp.length() == 0) nomeAp = AP_NOME_PADRAO;
}

static void salvarNomeAp()
{
  Preferences p;
  p.begin("ap", false);
  p.putString("nome", nomeAp);
  p.end();
}

// "Pulseira Dia a Dia Vovos" -> "pulseira-dia-a-dia-vovos". O app usa a MESMA regra (nomeParaHost):
// letras e numeros viram minusculos, qualquer outra coisa vira um unico "-".
static String hostnameDe(const String& nome)
{
  String h;
  for (size_t i = 0; i < nome.length(); i++) {
    char c = nome[i];
    if (c >= 'A' && c <= 'Z') c = c - 'A' + 'a';
    if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')) h += c;
    else if (h.length() > 0 && !h.endsWith("-")) h += '-';
  }
  while (h.endsWith("-")) h.remove(h.length() - 1);
  if (h.length() > 32) h = h.substring(0, 32);
  while (h.endsWith("-")) h.remove(h.length() - 1);
  if (h.length() == 0) h = "pulseira";
  return h;
}

// Anuncia <nome>.local na rede (reinicia o mDNS se o nome mudou)
static bool anunciarMdns()
{
  String host = hostnameDe(nomeAp);
  WiFi.setHostname(host.c_str());
  MDNS.end();
  if (!MDNS.begin(host.c_str())) return false;
  MDNS.addService("http", "tcp", 80);
  return true;
}

// Funcoes: HTTP
static String jsonEscapar(const String& s)
{
  String o;
  for (size_t i = 0; i < s.length(); i++) {
    char c = s[i];
    if (c == '"' || c == '\\') { o += '\\'; o += c; }
    else if ((uint8_t)c < 0x20) o += ' ';
    else o += c;
  }
  return o;
}

static void rotaStatus()
{
  xSemaphoreTake(mutexArquivo, portMAX_DELAY);
  size_t total = contarRegistros();
  xSemaphoreGive(mutexArquivo);
  String json = "{\"ok\":true,\"registros\":" + String((unsigned)total) +
                ",\"relogio\":" + (relogioAjustado() ? "true" : "false") +
                ",\"intervalo\":" + String((unsigned long)intervaloSeg) +
                ",\"nome\":\"" + jsonEscapar(nomeAp) + "\"" +
                ",\"host\":\"" + hostnameDe(nomeAp) + ".local\"" +
                ",\"ip\":\"" + WiFi.localIP().toString() + "\"" +
                ",\"hora\":" + String((unsigned long)time(nullptr)) + "}";
  servidor.send(200, "application/json", json);
}

static void rotaLeituras()
{
  std::vector<Registro> v;
  xSemaphoreTake(mutexArquivo, portMAX_DELAY);
  lerTodos(v);
  xSemaphoreGive(mutexArquivo);
  size_t n = std::min(v.size(), LOTE_HTTP);
  String json;
  json.reserve(20 + n * 60);
  json = "{\"leituras\":[";
  for (size_t i = 0; i < n; i++) {
    Registro r = v[i];
    if (i) json += ',';
    json += "{\"seq\":" + String((unsigned long)r.seq) +
            ",\"medidoEm\":" + String((unsigned long)r.ts) +
            ",\"bpm\":" + String(r.bpm) +
            ",\"spo2\":" + String(r.spo2) + "}";
  }
  json += "]}";
  servidor.send(200, "application/json", json);
  Serial.printf("Enviadas %u leituras\n", (unsigned)n);
}

static void rotaConfirmar()
{
  if (!servidor.hasArg("ate")) {
    servidor.send(400, "application/json", "{\"message\":\"parametro ate ausente\"}");
    return;
  }
  uint32_t ate = (uint32_t)strtoul(servidor.arg("ate").c_str(), nullptr, 10);
  size_t restantes = apagarAte(ate);
  servidor.send(200, "application/json", "{\"ok\":true,\"restantes\":" + String((unsigned)restantes) + "}");
}

static void rotaConfig()
{
  if (!servidor.hasArg("intervalo")) {
    servidor.send(400, "application/json", "{\"message\":\"parametro intervalo ausente\"}");
    return;
  }
  long v = strtol(servidor.arg("intervalo").c_str(), nullptr, 10);
  if (v < (long)INTERVALO_MIN_SEG || v > (long)INTERVALO_MAX_SEG) {
    servidor.send(400, "application/json", "{\"message\":\"intervalo deve ficar entre 20 e 86400 segundos\"}");
    return;
  }
  if ((uint32_t)v != intervaloSeg) {
    intervaloSeg = (uint32_t)v;
    prefs.putUInt("intervalo", (uint32_t)v);
    intervaloMudou = true;
    Serial.printf("Intervalo de leitura agora: %ld s\n", v);
  }
  servidor.send(200, "application/json", "{\"ok\":true,\"intervalo\":" + String(v) + "}");
}

// POST /nome?valor=<nome>: o app manda o nome da API (ex.: "Pulseira do Seu Jose")
static void rotaNome()
{
  if (!servidor.hasArg("valor")) {
    servidor.send(400, "application/json", "{\"message\":\"parametro valor ausente\"}");
    return;
  }
  String nome = servidor.arg("valor");
  nome.trim();
  if (nome.length() == 0 || (int)nome.length() > NOME_MAX) {
    servidor.send(400, "application/json", "{\"message\":\"nome deve ter de 1 a 32 caracteres\"}");
    return;
  }
  bool mudou = nome != nomeAp;
  if (mudou) { nomeAp = nome; salvarNomeAp(); }
  servidor.send(200, "application/json",
                "{\"ok\":true,\"nome\":\"" + jsonEscapar(nomeAp) + "\",\"host\":\"" + hostnameDe(nomeAp) + ".local\"}");
  if (mudou) {
    anunciarMdns();
    Serial.printf("Nome da pulseira agora: '%s' (%s.local)\n", nomeAp.c_str(), hostnameDe(nomeAp).c_str());
  }
}

// Fora do portal responde 404; no portal redireciona para a pagina de configuracao (captive portal)
static void rotaDesconhecida()
{
  if (modoPortal) {
    servidor.sendHeader("Location", "http://" + WiFi.softAPIP().toString() + "/", true);
    servidor.send(302, "text/plain", "");
    return;
  }
  servidor.send(404, "application/json", "{\"message\":\"rota nao encontrada\"}");
}

// Funcoes: Wi-Fi
static void carregarWifi()
{
  Preferences p;
  p.begin("wifi", true);
  wifiSsid  = p.getString("ssid", "");
  wifiSenha = p.getString("senha", "");
  p.end();
}

static void salvarWifi(const String& ssid, const String& senha)
{
  Preferences p;
  p.begin("wifi", false);
  p.putString("ssid", ssid);
  p.putString("senha", senha);
  p.end();
  wifiSsid = ssid;
  wifiSenha = senha;
}

static void apagarWifi()
{
  Preferences p;
  p.begin("wifi", false);
  p.clear();
  p.end();
}

// POST /esquecer-wifi: apaga o Wi-Fi salvo e reinicia. Leituras e calibracao NAO sao apagadas.
static void rotaEsquecerWifi()
{
  servidor.send(200, "application/json", "{\"ok\":true}");
  delay(300);
  Serial.println("Pedido do app: esquecendo o Wi-Fi...");
  apagarWifi();
  WiFi.disconnect(true, true);
  delay(200);
  ESP.restart();
}

static void manterWifi()
{
  static uint32_t ultima = 0;
  if (WiFi.status() == WL_CONNECTED) return;
  if (wifiSsid.length() == 0) return;
  if (millis() - ultima < 10000) return;
  ultima = millis();
  Serial.println("Wi-Fi caiu, reconectando...");
  WiFi.disconnect();
  WiFi.begin(wifiSsid.c_str(), wifiSenha.c_str());
}

// Segure o BOOT por 3 s (com a pulseira ligada) para apagar Wi-Fi e calibracao
static void verificarReset()
{
  static uint32_t inicio = 0;
  if (digitalRead(PIN_RESET) == LOW) {
    if (inicio == 0) inicio = millis();
    if (millis() - inicio > 3000) {
      Serial.println("Wi-Fi e calibracao apagados. Reiniciando...");
      apagarWifi();
      apagarCalibracao();
      delay(300);
      ESP.restart();
    }
  } else {
    inicio = 0;
  }
}

// Funcoes: tela de conexao (log narrado)
static void desenharTituloLog(const char* a, const char* b)
{
  tft.fillRect(0, 0, 240, LOG_Y0 - 2, C_ICE);
  textoCentroFonte(a, 120, 26, &FreeSansBold12pt7b, C_BLACK);
  textoCentroFonte(b, 120, 52, &FreeSansBold12pt7b, C_BLACK);
}

static void iniciarLog(const char* a, const char* b)
{
  tft.fillScreen(C_ICE);
  desenharTituloLog(a, b);
  logN = 0;
}

static void desenharLinhaLog(int i)
{
  int top = LOG_Y0 + i * LOG_PASSO;
  tft.fillRect(0, top, 240, LOG_PASSO, C_ICE);
  textoEsqFonte(logTxt[i], 10, top + 15, &FreeSans9pt7b, logCor[i]);
}

static void logAdd(const char* t, uint16_t cor)
{
  Serial.println(t);
  bool tudo = false;
  if (logN == LOG_MAX) {
    for (int i = 1; i < LOG_MAX; i++) {
      memcpy(logTxt[i - 1], logTxt[i], sizeof(logTxt[0]));
      logCor[i - 1] = logCor[i];
    }
    logN = LOG_MAX - 1;
    tudo = true;
  }
  snprintf(logTxt[logN], sizeof(logTxt[0]), "%s", t);
  logCor[logN] = cor;
  logN++;
  if (tudo) { for (int i = 0; i < logN; i++) desenharLinhaLog(i); }
  else desenharLinhaLog(logN - 1);
}

static void logTroca(const char* t, uint16_t cor)
{
  if (logN == 0) { logAdd(t, cor); return; }
  Serial.println(t);
  snprintf(logTxt[logN - 1], sizeof(logTxt[0]), "%s", t);
  logCor[logN - 1] = cor;
  desenharLinhaLog(logN - 1);
}

static ResConexao conectarComNarracao(const String& ssid, const String& senha)
{
  tela = T_CONECTA;
  medicaoLiberada = false;
  iniciarLog("Conectando", "a pulseira...");

  char buf[40];
  String curto = ssid;
  if (curto.length() > 16) curto = curto.substring(0, 15) + "~";
  snprintf(buf, sizeof(buf), "Rede: %s", curto.c_str());
  logAdd(buf, C_BLACK);

  logAdd("Procurando a rede...", C_GRAY);
  WiFi.setHostname(hostnameDe(nomeAp).c_str()); // nome na lista de aparelhos do roteador
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);
  int n = WiFi.scanNetworks();
  bool achou = false;
  for (int i = 0; i < n; i++) {
    if (WiFi.SSID(i) == ssid) { achou = true; break; }
  }
  WiFi.scanDelete();
  if (achou) {
    logTroca("Rede encontrada!", C_GREEN);
  } else {
    logTroca("Rede nao apareceu", C_RED);
    logAdd("Tentando mesmo assim", C_GRAY);
  }

  logAdd("Conectando", C_BLACK);
  WiFi.setAutoReconnect(true);
  WiFi.begin(ssid.c_str(), senha.c_str());
  uint32_t ini = millis(), ultimoPonto = 0;
  int pontos = 0;
  while (WiFi.status() != WL_CONNECTED && millis() - ini < 20000) {
    if (WiFi.status() == WL_CONNECT_FAILED) break;
    if (millis() - ultimoPonto > 500) {
      ultimoPonto = millis();
      pontos = (pontos + 1) % 4;
      char b[24]; snprintf(b, sizeof(b), "Conectando%.*s", pontos, "...");
      logTroca(b, C_BLACK);
    }
    delay(50);
  }

  if (WiFi.status() != WL_CONNECTED) {
    WiFi.disconnect();
    logTroca("Nao conectou!", C_RED);
    logAdd(achou ? "Senha incorreta?" : "Confira o nome da rede", C_RED);
    delay(2500);
    return achou ? CONN_FALHA : CONN_SEM_REDE;
  }

  logTroca("Wi-Fi conectado!", C_GREEN);
  salvarWifi(ssid, senha);
  String ip = WiFi.localIP().toString();
  snprintf(buf, sizeof(buf), "IP: %s", ip.c_str());
  logAdd(buf, C_BLACK);

  logAdd("Acertando o relogio...", C_BLACK);
  configTzTime(TZ_STR, "pool.ntp.org", "time.google.com"); // epoch continua UTC
  uint32_t t0 = millis();
  while (!relogioAjustado() && millis() - t0 < 10000) delay(100);
  if (relogioAjustado()) {
    time_t agora = time(nullptr);
    struct tm tmv; localtime_r(&agora, &tmv);
    snprintf(buf, sizeof(buf), "Relogio ok %02d:%02d", tmv.tm_hour, tmv.tm_min);
    logTroca(buf, C_GREEN);
  } else {
    logTroca("Sem relogio (sem net?)", C_RED);
  }

  logAdd("Iniciando servidor...", C_BLACK);
  if (!servidorIniciado) { servidor.begin(); servidorIniciado = true; }
  logTroca("Servidor pronto", C_GREEN);

  logAdd("Anunciando o nome...", C_BLACK);
  if (anunciarMdns()) {
    snprintf(buf, sizeof(buf), "Nome: %s", hostnameDe(nomeAp).c_str());
    logTroca(buf, C_GREEN);
  } else {
    logTroca("Nome na rede falhou", C_RED);
  }

  medicaoLiberada = true;

  desenharTituloLog("Pulseira", "conectada!");
  textoCentroFonte(ip.c_str(), 120, 290, &FreeSansBold12pt7b, C_BLACK);
  textoCentroPadrao("Use esse IP no app. Toque p/ seguir", 120, 304, 1, C_GRAY, false);

  uint32_t espera = millis();
  int tx, ty;
  while (millis() - espera < 8000) {
    servidor.handleClient();
    if (lerToque(tx, ty)) break;
    delay(5);
  }
  return CONN_OK;
}

// Funcoes: teclado na tela
static void addTecla(int x, int y, int w, int h, char c, uint8_t tipo)
{
  if (nTeclas >= 56) return;
  teclas[nTeclas++] = { (int16_t)x, (int16_t)y, (int16_t)w, (int16_t)h, c, tipo };
}

static void construirTeclas()
{
  nTeclas = 0;
  const char* r0 = "1234567890";
  const char* r1 = modoTeclado == 2 ? "@#$%&*-+=/" : (modoTeclado == 1 ? "QWERTYUIOP" : "qwertyuiop");
  const char* r2 = modoTeclado == 2 ? "!?.,;:_()\"" : (modoTeclado == 1 ? "ASDFGHJKL" : "asdfghjkl");
  const char* r3 = modoTeclado == 2 ? "'~^<>[]" : (modoTeclado == 1 ? "ZXCVBNM" : "zxcvbnm");
  const char* linhas[4] = {r0, r1, r2, r3};
  for (int i = 0; i < 4; i++) {
    int n = strlen(linhas[i]);
    int x0 = (i == 3) ? 37 : (240 - n * 24) / 2 + 1;
    for (int j = 0; j < n; j++) addTecla(x0 + j * 24, KB_Y + i * KB_PASSO, 22, KB_ALT, linhas[i][j], TK_CHAR);
  }
  int y3 = KB_Y + 3 * KB_PASSO, y4 = KB_Y + 4 * KB_PASSO;
  addTecla(1, y3, 33, KB_ALT, 0, TK_SHIFT);
  addTecla(205, y3, 34, KB_ALT, 0, TK_APAGA);
  addTecla(1, y4, 56, KB_ALT, 0, TK_MODO);
  addTecla(61, y4, 100, KB_ALT, ' ', TK_ESPACO);
  addTecla(165, y4, 74, KB_ALT, 0, TK_OK);
}

static void desenharTecla(const Tecla& t, bool pressionada)
{
  uint16_t fundo = C_WHITE;
  switch (t.tipo) {
    case TK_OK:    fundo = C_YELLOW; break;
    case TK_SHIFT: fundo = modoTeclado == 1 ? C_YELLOW : C_LILAC; break;
    case TK_APAGA:
    case TK_MODO:  fundo = C_LILAC; break;
    default: break;
  }
  if (pressionada) fundo = C_YELLOW;
  tft.fillRoundRect(t.x, t.y, t.w, t.h, 5, fundo);
  tft.drawRoundRect(t.x, t.y, t.w, t.h, 5, C_PURPLE);
  char lab[8] = {0};
  switch (t.tipo) {
    case TK_CHAR:   lab[0] = t.c; break;
    case TK_SHIFT:  strcpy(lab, "Aa"); break;
    case TK_APAGA:  strcpy(lab, "<-"); break;
    case TK_MODO:   strcpy(lab, modoTeclado == 2 ? "abc" : "123"); break;
    case TK_ESPACO: strcpy(lab, "espaco"); break;
    case TK_OK:     strcpy(lab, "OK"); break;
  }
  textoCentroFonte(lab, t.x + t.w / 2, t.y + t.h / 2 + 6, &FreeSans9pt7b, C_BLACK);
}

static void desenharTeclado()
{
  tft.fillRect(0, KB_Y - 4, 240, 320 - (KB_Y - 4), C_ICE);
  construirTeclas();
  for (int i = 0; i < nTeclas; i++) desenharTecla(teclas[i], false);
}

static void desenharCampo()
{
  tft.fillRoundRect(8, 40, 224, 38, 8, C_WHITE);
  tft.drawRoundRect(8, 40, 224, 38, 8, C_PURPLE);
  String s = entrada + "_";
  tft.setFont(&FreeSans9pt7b); tft.setTextSize(1);
  int16_t x1, y1; uint16_t w, h;
  while (s.length() > 1) {
    tft.getTextBounds(s.c_str(), 0, 0, &x1, &y1, &w, &h);
    if ((int)w <= 206) break;
    s.remove(0, 1);
  }
  tft.setTextColor(C_BLACK);
  tft.setCursor(16, 66);
  tft.print(s);
  tft.setFont();
}

static void desenharMsg(const char* m, uint16_t cor)
{
  tft.fillRect(0, 84, 240, 16, C_ICE);
  textoCentroPadrao(m, 120, 88, 1, cor, false);
}

static void desenharTelaTeclado(const char* msg, uint16_t cor)
{
  tft.fillScreen(C_ICE);
  textoCentroFonte("Nome da pulseira", 120, 26, &FreeSansBold12pt7b, C_BLACK);
  desenharCampo();
  desenharMsg(msg, cor);
  desenharTeclado();
}

static void abrirTecladoNome(const char* msg, uint16_t cor)
{
  tela = T_NOME;
  entrada = nomeAp;
  modoTeclado = 0;
  desenharTelaTeclado(msg, cor);
}

// Funcoes: monitor
static void desenharTrilhaProgresso()
{
  tft.fillRoundRect(PB_X, PB_Y, PB_W, PB_H, 7, C_ICE);
  tft.drawRoundRect(PB_X, PB_Y, PB_W, PB_H, 7, C_PURPLE);
}

static void atualizarProgresso(float f)
{
  if (f > 1) f = 1;
  int w = (int)((PB_W - 4) * f);
  if (w < 1) return;
  tft.fillRoundRect(PB_X + 2, PB_Y + 2, w, PB_H - 4, 5, C_YELLOW);
}

static void animarPontos()
{
  int cy = SY + 68;
  tft.fillRect(SX + 70, cy - 12, SW - 140, 24, C_WHITE);
  for (int i = 0; i < 3; i++) {
    int x = SX + SW / 2 - 24 + i * 24;
    bool a = i == dotStep % 3;
    tft.fillCircle(x, cy, a ? 8 : 5, a ? C_YELLOW : C_PURPLE);
  }
  dotStep++;
}

static void desenharCheck()
{
  int cx = SX + SW / 2, cy = SY + 68;
  tft.fillCircle(cx, cy, 14, C_YELLOW);
  for (int d = 0; d < 3; d++) {
    tft.drawLine(cx - 7, cy + d, cx - 2, cy + 5 + d, C_BLACK);
    tft.drawLine(cx - 2, cy + 5 + d, cx + 7, cy - 5 + d, C_BLACK);
  }
}

static void desenharCartaoStatus(int view, const char* l1)
{
  desenharCartao(SX, SY, SW, SH);
  textoCentroFonte(l1, SX + SW / 2, SY + 26, &FreeSansBold12pt7b, C_BLACK);
  if (view == V_MEDINDO) desenharTrilhaProgresso();
  else if (view == V_PRONTO) desenharCheck();
}

static void desenharL2(const char* l2)
{
  tft.fillRect(SX + 4, SY + 32, SW - 8, 20, C_WHITE);
  textoCentroFonte(l2, SX + SW / 2, SY + 46, &FreeSans9pt7b, C_GRAY);
}

static void desenharMonitorEstatico()
{
  tft.fillScreen(C_ICE);
  textoCentroPadrao("Dia a Dia Vovos", 120, 6, 2, C_BLACK, true);
  tft.fillRoundRect(70, 27, 50, 5, 2, C_YELLOW);
  tft.fillRoundRect(124, 27, 46, 5, 2, C_PURPLE);

  desenharCartao(BX, BY, BW, BH);
  textoEsqFonte("BPM", BX + 12, BY + 30, &FreeSansBold12pt7b, C_BLACK);
  tft.setFont(); tft.setTextSize(1); tft.setTextColor(C_GRAY);
  tft.setCursor(BX + 12, BY + 96); tft.print("batimentos/min");

  desenharCartao(OX, OY, OW, OH);
  textoEsqFonte("SpO2", OX + 12, OY + 30, &FreeSansBold12pt7b, C_BLACK);
  desenharGota(OX + OW - 18, OY + 22, C_PURPLE);
  tft.setFont(); tft.setTextSize(1); tft.setTextColor(C_GRAY);
  tft.setCursor(OX + 12, OY + 96); tft.print("% oxigenio");

  desenharBotao(BTN1_X, BTN_Y, BTN_W, BTN_H, "Medir agora", C_YELLOW);
  desenharBotao(BTN2_X, BTN_Y, BTN_W, BTN_H, "Historico", C_PURPLE);

  viewAtual = -1; l2Atual[0] = 0; progDes = -1;
  bpmDes = ""; spoDes = ""; rodapeDes = "";
  coracaoDesenhado = false;
  ultimoRodape = 0;
}

static void entrarMonitor()
{
  tela = T_MONITOR;
  desenharMonitorEstatico();
}

static void desenharValor(int x, int y, int w, const char* txt, uint16_t c)
{
  tft.fillRect(x + 6, y + 42, w - 12, 44, C_WHITE);
  textoCentroFonte(txt, x + w / 2, y + 80, &FreeSansBold24pt7b, c);
}

static void atualizarValores()
{
  uint8_t vb, vs;
  if (fase == F_MEDINDO) { vb = liveBpm; vs = liveSpo2; }
  else { vb = ultimoBpm; vs = ultimoSpo2; }
  char b[8], s[8];
  if (vb) snprintf(b, sizeof(b), "%d", vb); else snprintf(b, sizeof(b), "--");
  if (vs) snprintf(s, sizeof(s), "%d", vs); else snprintf(s, sizeof(s), "--");
  if (bpmDes != b) { bpmDes = b; desenharValor(BX, BY, BW, b, vb ? C_BLACK : C_PURPLE); }
  if (spoDes != s) { spoDes = s; desenharValor(OX, OY, OW, s, vs ? C_BLACK : C_PURPLE); }
}

// Coracao decorativo: pulsa no ritmo do BPM medido enquanto mede
static void atualizarCoracao(uint32_t now)
{
  uint8_t bpm = liveBpm;
  bool ativo = (fase == F_MEDINDO && bpm > 0);
  bool grande = false;
  if (ativo) { uint32_t periodo = 60000UL / bpm; grande = (now % periodo) < 160; }
  uint16_t cor = ativo ? C_YELLOW : C_PURPLE;
  if (coracaoDesenhado && grande == coracaoGrande && cor == coracaoCor) return;
  coracaoDesenhado = true; coracaoGrande = grande; coracaoCor = cor;
  int cx = BX + BW - 24, cy = BY + 20;
  tft.fillRect(cx - 19, cy - 15, 39, 36, C_WHITE);
  desenharCoracaoIcone(cx, cy, grande ? 7 : 5, cor);
}

static void atualizarRodape(uint32_t now)
{
  if (now - ultimoRodape < 500) return;
  ultimoRodape = now;
  char a[40], b[40];
  bool on = WiFi.status() == WL_CONNECTED;
  if (on) snprintf(a, sizeof(a), "IP %s", WiFi.localIP().toString().c_str());
  else snprintf(a, sizeof(a), "Sem Wi-Fi - reconectando");
  snprintf(b, sizeof(b), "Guardados: %lu", (unsigned long)totalRegistros);
  String k = String(a) + "|" + b;
  if (k == rodapeDes) return;
  rodapeDes = k;
  tft.fillRect(0, 288, 240, 32, C_ICE);
  textoCentroPadrao(a, 120, 290, 1, on ? C_GRAY : C_RED, false);
  textoCentroPadrao(b, 120, 304, 1, C_GRAY, false);
}

static void atualizarStatus(uint32_t now)
{
  int view;
  char l1[24] = "", l2[40] = "";
  int32_t restante = ((int32_t)(proximaMedicaoMs - now)) / 1000;
  if (restante < 0) restante = 0;

  switch (fase) {
    case F_SENSOR_ERRO:
      view = V_SENSOR_ERRO; strcpy(l1, "Sem sensor"); strcpy(l2, "veja SDA 21 / SCL 22");
      break;
    case F_ESPERA_DEDO:
      view = V_DEDO; strcpy(l1, "Coloque o dedo"); strcpy(l2, "no sensor, sem mexer");
      break;
    case F_MEDINDO:
      view = V_MEDINDO; strcpy(l1, "Medindo..."); strcpy(l2, "fique parado");
      break;
    case F_AGUARDA_INTERVALO:
      if (falhaCod) {
        const char* m = falhaCod == 1 ? "sem dedo" : falhaCod == 2 ? "dedo saiu" : falhaCod == 3 ? "leitura ruim" : "sensor travou";
        view = V_FALHA; strcpy(l1, "Nao deu certo");
        snprintf(l2, sizeof(l2), "%s (%lus)", m, (unsigned long)restante);
      } else if (ultimoBpm > 0) {
        view = V_PRONTO; strcpy(l1, "Pronto!");
        snprintf(l2, sizeof(l2), "proxima em %lus", (unsigned long)restante);
      } else {
        view = V_ESPERA; strcpy(l1, "Aguarde...");
        snprintf(l2, sizeof(l2), "proxima medida em %lus", (unsigned long)restante);
      }
      break;
    default: // F_PARADO / F_ESPERA_RELOGIO
      view = V_SEM_RELOGIO; strcpy(l1, "Aguarde..."); strcpy(l2, "acertando o relogio");
      break;
  }

  if (view != viewAtual) {
    viewAtual = view; l2Atual[0] = 0; progDes = -1;
    desenharCartaoStatus(view, l1);
    dotStep = 0; ultimoDots = 0;
  }
  if (strcmp(l2, l2Atual) != 0) {
    snprintf(l2Atual, sizeof(l2Atual), "%s", l2);
    desenharL2(l2);
  }
  if (view == V_MEDINDO) {
    int p = progresso;
    if (p != progDes) { progDes = p; atualizarProgresso(p / 100.0f); }
  }
  if (view == V_DEDO && now - ultimoDots >= 250) { ultimoDots = now; animarPontos(); }
}

static void atualizarMonitor(uint32_t now)
{
  atualizarStatus(now);
  atualizarValores();
  atualizarCoracao(now);
  atualizarRodape(now);
}

static void aoTocarMonitor(int x, int y)
{
  if (dentro(x, y, BTN1_X, BTN_Y, BTN_W, BTN_H)) {
    if (fase == F_AGUARDA_INTERVALO) medirAgora = true;
  } else if (dentro(x, y, BTN2_X, BTN_Y, BTN_W, BTN_H)) {
    abrirHistorico();
  }
}

// Funcoes: historico
static void desenharHistorico()
{
  std::vector<Registro> v;
  xSemaphoreTake(mutexArquivo, portMAX_DELAY);
  lerTodos(v);
  xSemaphoreGive(mutexArquivo);

  int total = (int)v.size();
  int paginas = std::max<int>(1, (total + HIST_POR_PAG - 1) / HIST_POR_PAG);
  histPagina = constrain(histPagina, 0, paginas - 1);

  tft.fillScreen(C_ICE);
  textoCentroFonte("Historico", 120, 26, &FreeSansBold12pt7b, C_BLACK);
  char sub[40];
  snprintf(sub, sizeof(sub), "pagina %d/%d - total %d", histPagina + 1, paginas, total);
  textoCentroPadrao(sub, 120, 34, 1, C_GRAY, false);

  if (total == 0) textoCentroFonte("Nenhuma leitura ainda", 120, 140, &FreeSans9pt7b, C_GRAY);
  for (int i = 0; i < HIST_POR_PAG; i++) {
    int idx = total - 1 - (histPagina * HIST_POR_PAG + i);
    if (idx < 0) break;
    Registro r = v[idx];
    int y = 48 + i * 30;
    tft.fillRoundRect(8, y, 224, 26, 6, C_WHITE);
    tft.drawRoundRect(8, y, 224, 26, 6, C_PURPLE);
    time_t t = (time_t)r.ts;
    struct tm tmv; localtime_r(&t, &tmv);
    char a[20], b[16], c[12];
    snprintf(a, sizeof(a), "%02d/%02d %02d:%02d", tmv.tm_mday, tmv.tm_mon + 1, tmv.tm_hour, tmv.tm_min);
    snprintf(b, sizeof(b), "%u bpm", (unsigned)r.bpm);
    snprintf(c, sizeof(c), "%u%%", (unsigned)r.spo2);
    textoEsqFonte(a, 14, y + 18, &FreeSans9pt7b, C_GRAY);
    textoEsqFonte(b, 112, y + 18, &FreeSans9pt7b, C_BLACK);
    textoEsqFonte(c, 184, y + 18, &FreeSans9pt7b, C_BLACK);
  }

  desenharBotao(8, HBTN_Y, 60, HBTN_H, "<", C_LILAC);
  desenharBotao(76, HBTN_Y, 88, HBTN_H, "Voltar", C_YELLOW);
  desenharBotao(172, HBTN_Y, 60, HBTN_H, ">", C_LILAC);
}

void abrirHistorico()
{
  tela = T_HIST;
  histPagina = 0;
  desenharHistorico();
}

static void aoTocarHistorico(int x, int y)
{
  if (!dentro(x, y, 0, HBTN_Y - 2, 240, HBTN_H + 4)) return;
  if (x < 70) { if (histPagina > 0) { histPagina--; desenharHistorico(); } }
  else if (x < 168) { entrarMonitor(); }
  else { histPagina++; desenharHistorico(); }
}

// Funcoes: portal de configuracao (rede que a pulseira cria)
static String escapar(const String& s)
{
  String o;
  for (size_t i = 0; i < s.length(); i++) {
    char c = s[i];
    if (c == '&') o += "&amp;";
    else if (c == '<') o += "&lt;";
    else if (c == '>') o += "&gt;";
    else if (c == '"') o += "&quot;";
    else o += c;
  }
  return o;
}

static String paginaMensagem(const String& titulo, const String& corpo)
{
  String p(PAGINA_CABECALHO);
  p += "<h2>" + titulo + "</h2>" + corpo + "</body></html>";
  return p;
}

static void portalStatus(const char* l1, const char* l2, uint16_t cor)
{
  desenharCartao(10, 170, 220, 70);
  textoCentroFonte(l1, 120, 198, &FreeSans9pt7b, cor);
  textoCentroPadrao(l2, 120, 214, 1, C_GRAY, false);
}

static void portalDesenharBase()
{
  tft.fillScreen(C_ICE);
  textoCentroFonte("Configurar Wi-Fi", 120, 26, &FreeSansBold12pt7b, C_BLACK);
  textoCentroPadrao("1) Conecte o celular nesta rede:", 120, 40, 1, C_GRAY, false);

  desenharCartao(10, 52, 220, 62);
  if (nomeAp.length() <= 15) textoCentroFonte(nomeAp.c_str(), 120, 80, &FreeSansBold12pt7b, C_BLACK);
  else textoCentroFonte(nomeAp.c_str(), 120, 80, &FreeSans9pt7b, C_BLACK);
  char b[40];
  snprintf(b, sizeof(b), "senha: %s", AP_SENHA);
  textoCentroFonte(b, 120, 102, &FreeSans9pt7b, C_GRAY);

  textoCentroPadrao("2) A pagina abre sozinha. Se nao,", 120, 124, 1, C_GRAY, false);
  snprintf(b, sizeof(b), "abra no navegador: %s", WiFi.softAPIP().toString().c_str());
  textoCentroPadrao(b, 120, 136, 1, C_BLACK, false);
  textoCentroPadrao("3) Escolha a sua rede e a senha dela", 120, 152, 1, C_GRAY, false);

  portalStatus("Aguardando o celular...", "conecte na rede acima", C_BLACK);
  desenharBotao(10, 258, 220, 40, "Trocar nome da rede", C_LILAC);
}

static void iniciarPortal()
{
  tela = T_PORTAL;
  medicaoLiberada = false;
  portalOcupado = false;

  tft.fillScreen(C_ICE);
  textoCentroFonte("Preparando...", 120, 150, &FreeSansBold12pt7b, C_BLACK);
  textoCentroPadrao("procurando redes por perto", 120, 170, 1, C_GRAY, false);

  modoPortal = true;
  WiFi.mode(WIFI_AP_STA);
  WiFi.disconnect();

  int n = WiFi.scanNetworks(); // redes proximas para escolher no celular
  opcoesRedes = "";
  for (int i = 0; i < n && i < 20; i++) opcoesRedes += "<option value=\"" + escapar(WiFi.SSID(i)) + "\">";
  WiFi.scanDelete();

  WiFi.softAP(nomeAp.c_str(), AP_SENHA);
  dns.start(53, "*", WiFi.softAPIP());
  if (!servidorIniciado) { servidor.begin(); servidorIniciado = true; }

  Serial.printf("Portal aberto. Rede: '%s' senha: '%s' -> http://%s\n",
                nomeAp.c_str(), AP_SENHA, WiFi.softAPIP().toString().c_str());
  portalDesenharBase();
  portalUltimoN = -1;
}

static void pararPortal()
{
  dns.stop();
  WiFi.softAPdisconnect(true);
  WiFi.mode(WIFI_STA);
  modoPortal = false;
}

static void atualizarPortal()
{
  if (portalOcupado || reiniciarEm) return;
  int n = WiFi.softAPgetStationNum();
  if (n == portalUltimoN) return;
  portalUltimoN = n;
  if (n > 0) portalStatus("Celular conectado!", "abra a pagina de configuracao", C_GREEN);
  else portalStatus("Aguardando o celular...", "conecte na rede acima", C_BLACK);
}

static void aoTocarPortal(int x, int y)
{
  if (portalOcupado || reiniciarEm) return;
  if (dentro(x, y, 10, 258, 220, 40)) {
    pararPortal();
    abrirTecladoNome("Esse sera o Wi-Fi que a pulseira cria", C_GRAY);
  }
}

// No portal, se ja havia Wi-Fi salvo (ex.: roteador desligado), continua tentando
static void tentarSalvoNoPortal()
{
  if (wifiSsid.length() == 0 || reiniciarEm || portalOcupado) return;
  static uint32_t ultima = 0;
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Wi-Fi voltou, reiniciando...");
    delay(500);
    ESP.restart();
  }
  if (millis() - ultima > 30000) {
    ultima = millis();
    WiFi.begin(wifiSsid.c_str(), wifiSenha.c_str());
  }
}

static void rotaPortalRaiz()
{
  if (!modoPortal) { servidor.send(404, "application/json", "{\"message\":\"rota nao encontrada\"}"); return; }
  String p(PAGINA_CABECALHO);
  p += "<h2>Wi-Fi da pulseira</h2>"
       "<form method='POST' action='/salvar'>"
       "<label>Nome da rede (2.4 GHz)</label>"
       "<input name='ssid' list='redes' required autocapitalize='none' autocorrect='off'>"
       "<datalist id='redes'>" + opcoesRedes + "</datalist>"
       "<label>Senha</label><input name='senha' type='password'>"
       "<button type='submit'>Salvar e conectar</button></form></body></html>";
  servidor.send(200, "text/html; charset=utf-8", p);
}

static void rotaPortalSalvar()
{
  if (!modoPortal) { servidor.send(404, "application/json", "{\"message\":\"rota nao encontrada\"}"); return; }

  String ssid = servidor.arg("ssid");
  String senha = servidor.arg("senha");
  ssid.trim();
  if (ssid.length() == 0) {
    servidor.send(400, "text/html; charset=utf-8",
                  paginaMensagem("Faltou o nome da rede", "<p><a href='/'>Voltar</a></p>"));
    return;
  }

  // Testa antes de salvar: com senha errada nao grava e deixa tentar de novo
  portalOcupado = true;
  if (tela == T_PORTAL) {
    char b[40]; snprintf(b, sizeof(b), "rede: %.28s", ssid.c_str());
    portalStatus("Testando o Wi-Fi...", b, C_BLACK);
  }
  Serial.printf("Testando Wi-Fi '%s'...\n", ssid.c_str());
  WiFi.begin(ssid.c_str(), senha.c_str());
  uint32_t ini = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - ini < 15000) delay(250);

  if (WiFi.status() != WL_CONNECTED) {
    WiFi.disconnect();
    portalOcupado = false;
    portalUltimoN = WiFi.softAPgetStationNum();
    servidor.send(200, "text/html; charset=utf-8",
                  paginaMensagem("Nao conectou",
                                 "<p>Confira o nome e a senha da rede e tente de novo.</p><p><a href='/'>Voltar</a></p>"));
    if (tela == T_PORTAL) portalStatus("Nao conectou", "confira nome e senha no celular", C_RED);
    return;
  }

  salvarWifi(ssid, senha);
  String ip = WiFi.localIP().toString();
  Serial.printf("Wi-Fi salvo. IP da pulseira: %s\n", ip.c_str());

  servidor.send(200, "text/html; charset=utf-8",
                paginaMensagem("Conectado!",
                               "<p>IP da pulseira: <b>" + ip + "</b></p>"
                               "<p>Anote esse numero, volte o celular para o seu Wi-Fi e digite-o no app. "
                               "A pulseira reinicia em instantes.</p>"));
  reiniciarEm = true;
  reiniciarQuando = millis() + 15000;

  if (tela == T_PORTAL) {
    char b[40]; snprintf(b, sizeof(b), "IP %s - reiniciando", ip.c_str());
    portalStatus("Conectou! Wi-Fi salvo", b, C_GREEN);
  }
}

// Funcoes: toque no teclado
static void confirmarEntrada()
{
  String s = entrada; s.trim();
  if (s.length() == 0) { desenharMsg("Digite um nome", C_RED); return; }
  nomeAp = s;
  salvarNomeAp();
  iniciarPortal();
}

static void aoTocarTeclado(int x, int y)
{
  for (int i = 0; i < nTeclas; i++) {
    const Tecla& t = teclas[i];
    if (!dentro(x, y, t.x - 1, t.y - 1, t.w + 2, t.h + 2)) continue;
    switch (t.tipo) {
      case TK_CHAR:
      case TK_ESPACO:
        desenharTecla(t, true); delay(35); desenharTecla(t, false);
        if ((int)entrada.length() < NOME_MAX) entrada += t.c;
        desenharCampo();
        if (modoTeclado == 1) { modoTeclado = 0; desenharTeclado(); } // maiuscula so para uma letra
        break;
      case TK_APAGA:
        desenharTecla(t, true); delay(35); desenharTecla(t, false);
        if (entrada.length() > 0) entrada.remove(entrada.length() - 1);
        desenharCampo();
        break;
      case TK_SHIFT:
        if (modoTeclado != 2) { modoTeclado = modoTeclado == 0 ? 1 : 0; desenharTeclado(); }
        break;
      case TK_MODO:
        modoTeclado = (modoTeclado == 2) ? 0 : 2;
        desenharTeclado();
        break;
      case TK_OK:
        desenharTecla(t, true); delay(60);
        confirmarEntrada();
        break;
    }
    return;
  }
}