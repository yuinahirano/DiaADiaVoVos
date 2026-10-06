# Dia a Dia Vovôs — Monitoramento de Idosos

Sistema web desenvolvido como projeto acadêmico do Curso Técnico em Desenvolvimento de Sistemas da Escola SENAI “Dr. Celso Charuri” — Unidade Sumaré.

O **Dia a Dia Vovôs** foi criado para apoiar o acompanhamento e a organização da rotina de pessoas idosas, promovendo segurança, autonomia, bem-estar e comunicação entre idosos, familiares e cuidadores autorizados.

## Sobre o projeto

A plataforma reúne recursos relacionados à rotina e à saúde dos idosos. O sistema permite registrar informações e organizar atividades, enquanto cuidadores autorizados podem acompanhar os dados vinculados aos perfis.

A interface foi planejada para ser simples e acessível ao público idoso, considerando o uso em diferentes dispositivos.

## Funcionalidades implementadas

- **Login e cadastro de usuários**
- **Vinculação entre idoso e cuidador**
- **Cadastro e controle de medicamentos**
- **Consultas e agendamentos**
- **Cadastro e visualização de doenças**
- **Registro de saúde**
- **Notificações e lembretes**
- **Perfil e dados do idoso**
- **Painel do cuidador**
- **Jogos de memória**

## Tecnologias utilizadas

### Front-end

| Tecnologia/biblioteca | Utilização |
|---|---|
| React 19 | Construção da interface por componentes |
| Vite 8 | Servidor de desenvolvimento e build |
| JavaScript | Linguagem utilizada no front-end |
| HTML5 e CSS3 | Estrutura e estilos das páginas |
| Bootstrap 5 | Estilização e recursos de interface |
| Bootstrap Icons | Ícones |
| Lucide React | Ícones em componentes React |
| React Router DOM 7 | Navegação entre páginas |
| Axios | Requisições HTTP para a API |

### Back-end e banco de dados

Conforme a documentação do projeto, o back-end utiliza Node.js e Express, com MySQL para armazenamento de dados. Consulte o repositório para os detalhes e instruções de execução do back-end.

- Repositório: [DiaADiaVoVos no GitHub](https://github.com/yuinahirano/DiaADiaVoVos)

## Pré-requisitos

Para executar o front-end localmente, instale:

- [Node.js](https://nodejs.org/)
- npm (instalado junto com o Node.js)
- Git, caso deseje clonar o repositório

## Como executar o front-end

### 1. Clone o repositório

```bash
git clone https://github.com/yuinahirano/DiaADiaVoVos.git
```

### 2. Acesse a pasta do front-end

```bash
cd DiaADiaVoVos/front-end
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local da aplicação. Normalmente, o endereço padrão é:

```text
http://localhost:5173
```

Abra o endereço informado pelo terminal no navegador.

## Outros comandos disponíveis

Execute os comandos abaixo dentro da pasta `front-end`:

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a versão de produção na pasta `dist` |
| `npm run preview` | Executa uma prévia local da versão compilada |
| `npm run lint` | Executa a análise estática do ESLint |

## Estrutura do front-end

Estrutura baseada nas pastas e arquivos do projeto:

```text
front-end/
├── docs/
│   └── design-system.md
├── src/
│   ├── assets/          # Imagens e recursos visuais
│   ├── components/
│   │   ├── doencas/     # Componentes relacionados a doenças
│   │   ├── medicamentos/ # Componentes relacionados a medicamentos
│   │   └── styles/      # Estilos e componentes de interface
│   ├── contexts/        # Contextos de autenticação e tema
│   ├── hooks/           # Hooks personalizados
│   ├── pages/
│   │   ├── cuidador/    # Páginas da área do cuidador
│   │   └── idoso/       # Páginas da área do idoso
│   ├── service/         # Serviços de comunicação com a API
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
```

### Organização das pastas

- `docs/`: documentação, incluindo o design system.
- `src/assets/`: imagens e recursos visuais.
- `src/components/`: componentes reutilizáveis da interface.
- `src/contexts/`: contextos compartilhados, como autenticação e tema.
- `src/hooks/`: hooks personalizados para organizar a lógica das funcionalidades.
- `src/pages/`: páginas do sistema, separadas entre as áreas do cuidador e do idoso.
- `src/service/`: serviços responsáveis pela comunicação com a API.

## Documentação

A documentação complementar está no repositório, incluindo materiais sobre requisitos, banco de dados, regras de negócio e design da interface.

Consulte a pasta `docs/` e os arquivos disponíveis no repositório para obter os detalhes.

## Privacidade e proteção de dados

O projeto prevê o tratamento de dados pessoais e sensíveis em conformidade com a Lei Geral de Proteção de Dados (LGPD). O acesso às informações deve respeitar as permissões de cada tipo de usuário.

## Equipe

Projeto desenvolvido por estudantes do Curso Técnico em Desenvolvimento de Sistemas:

- Ana Carolina Mota Diniz
- Beatriz Vasconcelos Alves
- Bruno Davi Navarro
- Danielly Rodrigues Figueiredo
- Fernanda Yuina Hirano da Silva

## Metodologia

O projeto utiliza práticas de Scrum e Kanban para organizar as tarefas, acompanhar o desenvolvimento e realizar entregas em ciclos semanais (sprints), conforme definido no Termo de Abertura do Projeto (TAP).

## Instituição

**Escola SENAI “Dr. Celso Charuri” — Unidade Sumaré**  
Curso Técnico em Desenvolvimento de Sistemas  
Sumaré — 2026
