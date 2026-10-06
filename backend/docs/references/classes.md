# 🧩 Diagrama de Classes

Este documento descreve as principais classes do sistema **Dia a Dia Vovôs** e seus relacionamentos.

# 👤 Classe: Usuario

### 📌 Descrição
Representa o usuário geral do sistema, com dados pessoais e de acesso. Pode possuir perfil de idoso e/ou cuidador.

### 🧾 Atributos
- id: string
- nome: string
- cpf: string
- email: string
- senha: string
- dataNascimento: Date
- estadoCivil: string

### ⚙️ Métodos
- cadastrar()
- login()
- selecionar()
- editar()
- apagar()

# 🏠 Classe: Endereco

### 📌 Descrição
Representa o endereço de um usuário.

### 🧾 Atributos
- id: string
- logradouro: string
- numero: string
- complemento: string
- bairro: string
- cidade: string
- uf: string
- cep: string
- idUsuario: string

### ⚙️ Métodos
- criar()
- selecionar()
- editar()
- apagar()

# 👵 Classe: Idoso

### 📌 Descrição
Representa o perfil de idoso vinculado a um usuário, com informações de saúde essenciais.

### 🧾 Atributos
- id: string
- tipoSanguineo: string
- telefone: string
- pcd: string (`sim` ou `nao`)
- idUsuario: string
- idImagem: string (opcional)

### ⚙️ Métodos
- criar()
- selecionar()
- editar()
- apagar()

# 🧑‍⚕️ Classe: Cuidador

### 📌 Descrição
Representa o perfil de cuidador, responsável pela gestão de saúde dos idosos vinculados a ele.

### 🧾 Atributos
- id: string
- telefone: string
- idUsuario: string
- idImagem: string (opcional)

### ⚙️ Métodos
- criar()
- selecionar()
- editar()
- apagar()

# 🔗 Classe: IdosoCuidador

### 📌 Descrição
Representa o vínculo entre um idoso e um cuidador, com o contato de emergência.

### 🧾 Atributos
- id: string
- idIdoso: string
- idCuidador: string
- contatoEmergencia: string

### ⚙️ Métodos
- criar()
- selecionar()
- editar()
- apagar()

# 💊 Classe: Medicamento

### 📌 Descrição
Representa os medicamentos utilizados pelo idoso, com dosagem, horário e frequência.

### 🧾 Atributos
- id: string
- nome: string
- dosagem: string
- horario: string
- frequencia: string
- observacoes: string
- idIdoso: string

### ⚙️ Métodos
- criar()
- selecionar()
- selecionarPorIdoso()
- editar()
- deletar()

# 🦠 Classe: Doenca

### 📌 Descrição
Representa as doenças do histórico médico do idoso.

### 🧾 Atributos
- id: string
- nome: string
- descricao: string
- idIdoso: string

### ⚙️ Métodos
- criar()
- selecionar()
- editar()
- deletar()

# 🩺 Classe: Consulta

### 📌 Descrição
Representa uma consulta médica agendada ou realizada pelo idoso.

### 🧾 Atributos
- id: string
- nomeMedico: string
- horario: string
- localConsulta: string
- data: Date
- descricao: string
- compareceu: boolean
- idIdoso: string

### ⚙️ Métodos
- criar()
- selecionar()
- editar()
- deletar()
- registrarComparecimento()

# 📄 Classe: ReceitaMedica

### 📌 Descrição
Representa a receita emitida em uma consulta médica.

### 🧾 Atributos
- id: string
- descricao: string
- dataEmissao: Date
- dataVencimento: Date
- idConsulta: string

### ⚙️ Métodos
- criar()
- selecionar()
- editar()
- deletar()

# ❤️ Classe: RegistroSaude

### 📌 Descrição
Representa as medições de saúde do idoso ao longo do tempo.

### 🧾 Atributos
- id: string
- frequenciaCardiaca: string
- saturacaoSangue: string
- peso: number
- dataRegistro: Date
- idIdoso: string

### ⚙️ Métodos
- Sem rotas próprias na API atual

# 🔗 Relacionamentos

| Relacionamento | Descrição | Tipo |
|---|---|---|
| Usuario × Idoso | Um usuário pode ter um perfil de idoso | 1:1 |
| Usuario × Cuidador | Um usuário pode ter um perfil de cuidador | 1:1 |
| Usuario × Endereco | Um usuário pode ter vários endereços | 1:N |
| Idoso × Cuidador | Vínculo por meio de `IdosoCuidador` | N:N |
| Idoso × Medicamento | Um idoso usa vários medicamentos | 1:N |
| Idoso × Doenca | Um idoso possui várias doenças | 1:N |
| Idoso × Consulta | Um idoso possui várias consultas | 1:N |
| Idoso × RegistroSaude | Um idoso possui vários registros de saúde | 1:N |
| Consulta × ReceitaMedica | Uma consulta pode gerar várias receitas | 1:N |