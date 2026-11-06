# 👴 Dia a Dia Vovôs – Monitoramento de Idosos

Bem-vindo ao **Dia a Dia Vovôs**.
Sistema para acompanhamento e gestão da rotina de idosos, focado em segurança, organização de saúde e bem-estar.

## 💻 Sobre o Projeto

O **Dia a Dia Vovôs** é uma plataforma digital voltada para o acompanhamento da rotina de idosos, oferecendo recursos que promovem segurança e organização. O sistema permite que idosos registrem dados de saúde, enquanto familiares e cuidadores autorizados acompanham tudo em tempo real através de notificações e relatórios.

## 🛠️ Tecnologias Utilizadas

### 🌐 Front-end

* HTML
* CSS
* JavaScript
* React

### ⚙️ Back-end

* TypeScript
* Node.js
* Express

### 🗄️ Banco de Dados

* MySQL

## 📂 Documentação

A documentação do projeto está organizada por público e finalidade:

### 👨‍💻 Para Programadores

Contém informações técnicas para desenvolvimento e manutenção do sistema:

* 📄 [Guia do Programador](./programadores.md)
* 🧩 [Diagrama de Classes](./classes.md)
* 🗄️ [Banco de Dados (DER)](./database.md)

### 👤 Para Clientes e Idosos

Documentação voltada à visão do sistema e sua utilização:

* 📄 [Guia do Cliente](./clientes.md)
* 🎨 [Design System](./design-system.md)

### 🛠️ Para Administradores e Cuidadores

Informações sobre gerenciamento e operação do sistema:

* 📄 [Guia do Administrador](./administradores.md)

## ⭐ Principais Funcionalidades (Requisitos Funcionais)

* **Gestão de Saúde (RF-002, RF-005):** registro de medicamentos e visualização de informações médicas, como histórico de doenças e alergias.
* **Agendamentos (RF-003):** marcação de consultas e exames médicos com controle de data e local.
* **Segurança (RF-004, RF-006):** salvamento de contatos de emergência e botão de acionamento rápido para alertas.
* **Interface (RF-007):** visualização de compromissos em calendário integrado.

## 📏 Regras de Negócio (RN)

* **Acesso:** apenas administradores cadastram novos usuários (RN-001).
* **Cuidado:** somente perfis do tipo "Cuidador" podem gerenciar medicamentos e agendamentos (RN-002, RN-003).
* **Segurança:** todo perfil de idoso deve estar vinculado a pelo menos um cuidador (RN-004).
* **Saúde:** no primeiro acesso, é obrigatório preencher tipo sanguíneo, alergias e contato de emergência (RN-005).

## ⚙️ Requisitos Não Funcionais (RNF)

* **Conformidade:** o sistema cumpre as exigências da **LGPD** (RNF-003/005).
* **Compatibilidade:** acessível em celulares, tablets e computadores (RNF-001).
* **Performance e Disponibilidade:** funcionamento rápido e acesso contínuo (RNF-002, RNF-004).

## 👥 Equipe (FHAMN)

Projeto desenvolvido em Sumaré (2026) para o **SENAI** por:

* Ana Carolina Mota Diniz
* Beatriz Vasconcelos Alvez
* Bruno Davi Navarro
* Danielly Rodrigues Figuereido
* Fernanda Yuina Hirano da Silva

## 📌 Observações

Este projeto segue as diretrizes de documentação aprovadas entre as partes FHAMN e SENAI.