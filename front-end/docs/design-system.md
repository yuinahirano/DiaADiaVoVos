# 🎨 Design System - Dia a Dia Vovôs

Este documento define os padrões visuais e de interface do sistema "Dia a Dia Vovôs", com foco na simplicidade, consistência e acessibilidade para idosos, familiares e cuidadores.

---

# 🎨 Paleta de Cores

A paleta de cores prioriza uma interface clara, com contraste entre fundos, textos, bordas e elementos interativos.


## 📌 Cores principais

<div style="background-color:#EBF3FF; padding:10px; color:#1A2229; border:2px solid #1A2229; border-radius:10px; margin:2px;">
  Cor de Fundo (Background) - #EBF3FF
</div>

<div style="background-color:#FFFFFF; padding:10px; color:#1A2229; border:2px solid #1A2229; border-radius:10px; margin:2px;">
  Cor Secundária (Cards e Superfícies) - #FFFFFF
</div>

<div style="background-color:#FFD600; padding:10px; color:#1A2229; border:2px solid #1A2229; border-radius:10px; margin:2px;">
  Cor de Destaque (Botões Principais) - #FFD600
</div>

<div style="background-color:#FFDF6D; padding:10px; color:#1A2229; border:2px solid #1A2229; border-radius:10px; margin:2px;">
  Cor de Ação Secundária - #FFDF6D
</div>

<div style="background-color:#F0F4F8; padding:10px; color:#5A6A75; border:2px solid #1A2229; border-radius:10px; margin:2px;">
  Cor dos Campos de Formulário - #F0F4F8
</div>

<div style="background-color:#1A2229; padding:10px; color:#FFFFFF; border-radius:10px; margin:2px;">
  Cor de Texto e Contornos - #1A2229
</div>

<div style="background-color:#F44336; padding:10px; color:#FFFFFF; border-radius:10px; margin:2px;">
  Cor de Perigo e Emergência - #F44336
</div>

## 📌 Aplicação das cores

* **Fundo das páginas:** #EBF3FF.
* **Cards e áreas de conteúdo:** #FFFFFF.
* **Botões principais:** #FFD600.
* **Botões de adicionar:** #FFDF6D.
* **Campos de formulário:** #F0F4F8.
* **Textos e bordas:** #1A2229.
* **Ações de perigo e emergência:** #F44336.

---

# 🔤 Tipografia

A tipografia busca garantir a leitura simples e confortável das informações de saúde, consultas e medicamentos.


## 📌 Fonte principal

* **Font-family:** Arial, sans-serif.

## 📌 Hierarquia

* **H1:** 32px / Bold (Títulos de Seção).
* **H2:** 24px / SemiBold (Subtítulos e Títulos de Áreas).
* **H3:** 20px / Medium (Títulos de Cards e Informações).
* **Body:** 16px / Regular (Textos e Descrições).
* **Small:** 14px / Regular (Informações Secundárias).

---

# 🧩 Componentes

## 🔘 Button


### Variações

* **Primary:** Botão principal amarelo (#FFD600), com texto e borda escuros.
* **Secondary:** Botão de adicionar amarelo-claro (#FFDF6D).
* **Danger:** Botão de perigo ou emergência (#F44336).
* **Outline:** Botão com contorno escuro (#1A2229).

### Estados

* **Default:** Botão amarelo com contorno escuro.
* **Hover:** O botão principal utiliza a cor #FCEEA9; o botão de adicionar aumenta levemente de tamanho.
* **Active:** O botão principal desloca-se para baixo e reduz a sombra.
* **Disabled:** Não identificado no trecho de CSS fornecido.

## 📦 Card


### Uso

Container para agrupar informações, como dados do idoso, informações médicas e opções do painel do cuidador.

### Características

* Fundo branco (#FFFFFF).
* Cantos arredondados.
* Sombras leves para separar os cards do fundo.
* Efeito de elevação ao passar o cursor nos cards de usuários.

---

# 📐 Espaçamento


## 📏 Escala de Espaçamento

* 4px
* 8px
* 16px
* 24px
* 32px
* 48px

## 📌 Regra

Utilizar múltiplos de 8 para manter a consistência visual e facilitar a organização dos elementos. O CSS também utiliza espaçamentos específicos de componentes, como 5px, 10px, 15px e 20px.

---

# 📊 Grid

## 📌 Breakpoints

* **Mobile:** 320px (Foco em usabilidade em telas pequenas).
* **Tablet:** 768px.
* **Desktop:** 1024px+ (Uso administrativo e gestão).

## 📌 Comportamento Responsivo

O painel do cuidador utiliza um grid adaptável, que passa para uma única coluna em telas com largura máxima de 600px.

---

**FHAMN & SENAI** | Documentação de Interface | Sumaré, 2026.
