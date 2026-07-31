# 🏗️ Arquitetura do Sistema - Dia a Dia Vovôs

Este documento descreve a organização técnica, as camadas do sistema e as responsabilidades de desenvolvimento para garantir a conformidade com os requisitos estabelecidos.

# 📊 Visão Geral

O sistema é uma plataforma digital desenvolvida para Sumaré (2026) sob a coordenação da equipe FHAMN e aprovação do SENAI. A arquitetura foi projetada para suportar a gestão de rotina, saúde e segurança de idosos através de notificações e relatórios em tempo real.

## 📌 Descrição Técnica

O projeto utiliza uma arquitetura em camadas para separar a interface do utilizador, a lógica de negócio e a persistência de dados, garantindo que o sistema seja eficiente, confiável e inclusivo.

# 🧩 Camadas da Arquitetura

## 🌐 Frontend (Interface e Usabilidade)

### 📌 Responsabilidade

* Fornecer uma interface gráfica intuitiva e acessível, priorizando a simplicidade para o público da terceira idade.


* Exibir o Calendário de compromissos (RF-007) e notificações de medicamentos.


* Implementar funcionalidades de estímulo cognitivo através de jogos.



### 🛠️ Tecnologias

* **React**: Para a construção de componentes modulares.
* **HTML5 / CSS3 / JavaScript**: Estrutura e estilo base seguindo o Design System.

### 📦 Estrutura de Pastas Sugerida

```plaintext
src/
 ├── assets/      # Ícones e imagens acessíveis
 ├── components/  # Botão de Emergência (RF-006), Cards de Medicamentos (RF-002)
 ├── pages/       # Calendário, Registro de Consultas (RF-003)
 ├── services/    # Consumo da API REST
 ╰── styles/      # Definições de cores (Roxo, Amarelo e Gelo)

```

## ⚙️ Backend (Lógica e Regras)

### 📌 Responsabilidade

* Processar as **Regras de Negócio (RN)**, como restringir o agendamento médico e o controlo de medicamentos apenas a utilizadores com perfil de "Cuidador".


* Gerir o registo e autenticação de utilizadores, onde apenas administradores podem criar novas contas (RN-001).


* Garantir a conformidade com a **LGPD** no processamento de dados sensíveis (RNF-003/005).



### 🛠️ Tecnologias

* **Node.js / Express**: Para a criação de uma API ágil e escalável.

### 📦 Estrutura do Back-end

```plaintext
src/
 ├── controllers/ # Lógica para Informações Médicas (RF-005) e Alertas
 ├── routes/      # Endpoints da API para dispositivos móveis e web
 ├── middlewares/ # Validação de segurança e permissões de acesso
 ╰── models/      # Definição dos esquemas para o MySQL

```

## 🗄️ Banco de Dados (Persistência)

### 📌 Responsabilidade

* Armazenar de forma segura o histórico de doenças, alergias e contactos de emergência.


* Garantir a disponibilidade contínua dos dados e o funcionamento rápido do sistema (RNF-002, RNF-004).



### 🛠️ Tecnologias

**MySQL**: Banco de dados relacional para gestão de informações estruturadas.



---

**Equipe FHAMN & SENAI** | Documentação Técnica | 2026.