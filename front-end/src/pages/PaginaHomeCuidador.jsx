import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import {
  getIdosoCuidador,
  getUsuarios,
  getIdosos,
  getMeRequest,
  getCuidadores,
} from "../service/userApi";
import logoImg from "../assets/logo_DiaADia.png";
import "../App.css";

// Decodifica o payload do JWT salvo no localStorage (fallback quando /usuario/me falha)
function obterUsuarioDoToken() {
  try {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("@DiaADia:token") ||
      localStorage.getItem("@DiaADiaVoVos:token");
    if (!token) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Normaliza a resposta de getMeRequest(), que pode vir como objeto direto
// ou embrulhada em { result: [...] } ou { result: {...} }, dependendo da rota.
function normalizarUsuarioLogado(resposta) {
  if (!resposta) return null;

  let obj = resposta;

  if (obj.result) {
    obj = Array.isArray(obj.result) ? obj.result[0] : obj.result;
  }

  if (!obj) return null;

  return {
    id: obj.id || obj.idUsuario || obj.id_usuario || obj.sub || null,
  };
}

export default function PaginaHomeCuidador() {
  const { user } = useContext(AuthContext);
  const [idosos, setIdosos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const primeiroNome = user?.nome ? user.nome.split(" ")[0] : "cuidador";

  useEffect(() => {
    async function carregarIdososDoCuidadorLogado() {
      try {
        setLoading(true);

        // 1. Descobre o id_usuario do cuidador logado
        let idUsuarioLogado =
          user?.id || user?.idUsuario || user?.id_usuario || user?.sub || null;

        if (!idUsuarioLogado) {
          try {
            const respostaMe = await getMeRequest();
            const usuarioNormalizado = normalizarUsuarioLogado(respostaMe);
            idUsuarioLogado = usuarioNormalizado?.id || null;
          } catch (e) {
            const usuarioDoToken = obterUsuarioDoToken();
            idUsuarioLogado =
              usuarioDoToken?.id ||
              usuarioDoToken?.idUsuario ||
              usuarioDoToken?.id_usuario ||
              usuarioDoToken?.sub ||
              null;
          }
        }

        if (!idUsuarioLogado) {
          console.error("Não foi possível identificar o usuário logado.");
          setIdosos([]);
          return;
        }

        // 2. Busca todas as tabelas necessárias em paralelo
        const [dadosVinculos, dadosUsuarios, dadosTabelaIdoso, dadosCuidadores] =
          await Promise.all([
            getIdosoCuidador().catch(() => []),
            getUsuarios().catch(() => []),
            getIdosos().catch(() => []),
            getCuidadores().catch(() => []),
          ]);

        const listaVinculos = Array.isArray(dadosVinculos)
          ? dadosVinculos
          : dadosVinculos?.result || [];

        const listaUsuarios = Array.isArray(dadosUsuarios)
          ? dadosUsuarios
          : dadosUsuarios?.result || [];

        const listaTabelaIdoso = Array.isArray(dadosTabelaIdoso)
          ? dadosTabelaIdoso
          : dadosTabelaIdoso?.result || [];

        const listaCuidadores = Array.isArray(dadosCuidadores)
          ? dadosCuidadores
          : dadosCuidadores?.result || [];

        // 3. PASSO QUE FALTAVA: descobrir o id_cuidador real (tabela 'cuidador')
        //    a partir do id_usuario logado
        const registroCuidadorLogado = listaCuidadores.find(
          (c) => String(c.id_usuario ?? c.idUsuario) === String(idUsuarioLogado)
        );

        const idCuidadorLogado = registroCuidadorLogado?.id;

        // Se o usuário logado não tem registro na tabela 'cuidador',
        // ele não pode ter idosos vinculados -> mostra card vazio
        if (!idCuidadorLogado) {
          setIdosos([]);
          return;
        }

        // 4. Mapeia cada vínculo com o nome do idoso correspondente
        const listaMapeada = listaVinculos.map((vinculo) => {
          const idIdosoNoVinculo =
            vinculo.id_idoso || vinculo.idIdoso || vinculo.idosoId;

          const registroIdoso = listaTabelaIdoso.find(
            (i) => String(i.id) === String(idIdosoNoVinculo)
          );

          const idUsuarioDoIdoso = registroIdoso ? registroIdoso.id_usuario : null;

          const usuarioIdoso = listaUsuarios.find(
            (u) => String(u.id) === String(idUsuarioDoIdoso)
          );

          return {
            ...vinculo,
            idVinculo: vinculo.id,
            idIdosoReal: idIdosoNoVinculo,
            idUsuarioIdoso: idUsuarioDoIdoso,
            nomeExibicao: usuarioIdoso?.nome || vinculo.nome || "Idoso cadastrado",
          };
        });

        // 5. Filtra comparando id_cuidador do vínculo com o id_cuidador REAL
        const vinculosFiltrados = listaMapeada.filter((item) => {
          const idCuidadorNoVinculo =
            item.id_cuidador || item.idCuidador || item.cuidadorId;

          return String(idCuidadorNoVinculo) === String(idCuidadorLogado);
        });

        // 6. Remove duplicidades de idosos na renderização final
        const mapaSemDuplicados = new Map();
        vinculosFiltrados.forEach((item) => {
          const chaveUnica = item.idUsuarioIdoso || item.idIdosoReal || item.idVinculo;
          if (!mapaSemDuplicados.has(chaveUnica)) {
            mapaSemDuplicados.set(chaveUnica, item);
          }
        });

        setIdosos(Array.from(mapaSemDuplicados.values()));
      } catch (err) {
        console.error("Erro ao carregar idosos:", err);
        setIdosos([]);
      } finally {
        setLoading(false);
      }
    }

    carregarIdososDoCuidadorLogado();
  }, [user]);

  const handleSelecionarIdoso = (idoso) => {
    const idosoId = idoso.idIdosoReal || idoso.id_idoso || idoso.id;
    localStorage.setItem("idosoSelecionadoId", idosoId);
    navigate("/medicamentos");
  };

  const coresCards = ["#FFDF6D", "#C8B6E2", "#A8DADC", "#FFB7B2"];

  return (
    <div className="home-idoso-container d-flex flex-column min-vh-100">
      <header className="home-idoso-header w-100">
        <h1 className="home-idoso-titulo">Olá {primeiroNome}</h1>

        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="home-cuidador-btn-add-novo"
            onClick={() => navigate("/vincular-cuidador")}
          >
            + Adicionar idoso
          </button>

          <button
            type="button"
            className="home-idoso-icone-btn"
            aria-label="Configurações"
            onClick={() => navigate("/configuracoes")}
          >
            <i className="bi bi-gear-fill"></i>
          </button>
        </div>
      </header>

      <main className="w-100 my-auto d-flex justify-content-center align-items-center py-4">
        {loading && (
          <p className="text-center fw-bold text-secondary fs-5">
            Carregando idosos vinculados...
          </p>
        )}

        {!loading && idosos.length === 0 && (
          <div className="home-cuidador-vazio-card">
            <div className="home-cuidador-vazio-logo-circle">
              <img src={logoImg} alt="Dia a Dia Vovôs" />
            </div>
            <span>Nenhum idoso vinculado a você</span>
          </div>
        )}

        {!loading && idosos.length > 0 && (
          <div className="home-cuidador-grid-retangulos">
            {idosos.map((idoso, index) => (
              <button
                type="button"
                key={idoso.idVinculo || idoso.idUsuarioIdoso || index}
                className="home-cuidador-card-retangulo"
                style={{
                  backgroundColor: coresCards[index % coresCards.length],
                }}
                onClick={() => handleSelecionarIdoso(idoso)}
              >
                <span>{idoso.nomeExibicao}</span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}