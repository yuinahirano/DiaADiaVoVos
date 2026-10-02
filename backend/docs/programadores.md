# 🏗️ Arquitetura do Sistema - Dia a Dia Vovôs

Este documento descreve a organização técnica, as camadas do sistema e as responsabilidades de desenvolvimento para garantir a conformidade com os requisitos estabelecidos.

# 📊 Visão Geral

O sistema é uma plataforma digital desenvolvida em Sumaré (2026) pela equipe FHAMN, com aprovação do SENAI. A arquitetura foi projetada para suportar a gestão de rotina, saúde e segurança de idosos através de notificações e relatórios em tempo real.

## 📌 Descrição

O projeto segue uma arquitetura em camadas, separando a interface do usuário, a lógica de negócio e a persistência de dados, para que o sistema seja eficiente, confiável e inclusivo.

# 🧩 Camadas da Arquitetura

## 🌐 Frontend (Interface e Usabilidade)

### 📌 Responsabilidade
- Fornecer uma interface gráfica intuitiva e acessível, priorizando a simplicidade para o público da terceira idade
- Exibir o calendário de compromissos (RF-007) e as notificações de medicamentos
- Implementar funcionalidades de estímulo cognitivo através de jogos

### 🛠️ Tecnologias
- React
- HTML5 / CSS3 / JavaScript

### 📦 Estrutura do Front-end

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
- Processar as Regras de Negócio (RN), como restringir o agendamento médico e o controle de medicamentos apenas a usuários com perfil de "Cuidador"
- Gerenciar o registro e a autenticação de usuários, onde apenas administradores podem criar novas contas (RN-001)
- Garantir a conformidade com a LGPD no processamento de dados sensíveis (RNF-003/005)

### 🛠️ Tecnologias
- Node.js
- Express

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
- Armazenar de forma segura o histórico de doenças, alergias e contatos de emergência
- Garantir a disponibilidade contínua dos dados e o funcionamento rápido do sistema (RNF-002, RNF-004)

### 🛠️ Tecnologias
- MySQL

---

**Equipe FHAMN & SENAI** | Documentação Técnica | 2026.