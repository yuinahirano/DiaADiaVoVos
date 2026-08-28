# API Reference

## 🛡️Admin

> ⚠️ Todas as rotas de admin exigem autenticação via JWT (`autenticarToken`), exceto o login.

#### Exemplo de Header (obrigatório em todas as rotas, exceto login)

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```
<br>

### ➕Criar admin

- Método: POST
- Caminho: http://localhost:8000/admin
- 🔒 Requer autenticação

#### Corpo de requisição:
```json
{
	"nome": "string",
	"email": "string@email.com",
	"senha": "string"
}
```
<br>

#### Regras de Validação

| Email |
|---------|
| Obrigatório |
| Formato de e-mail válido |
<br>

> Os campos `nome` e `senha` são obrigatórios (a senha é armazenada como hash), mas não possuem regras adicionais de formato.

---

#### Resposta de Sucesso:
```json
{
	"novo": {
		"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	}
}
```
<br>

#### Possíveis erros

```json
{
	"message": "Ocorreu um erro no servidor",
	"errorMessage": "Formato de email inválido"
}
```
<br>

```json
{
	"erro": "Token não informado"
}
```
<br>

```json
{
	"erro": "Token inválido ou expirado"
}
```
<br>

---

### ✅Buscar admins

- Método: GET
- Caminho: http://localhost:8000/admin
- 🔒 Requer autenticação

#### Resposta de Sucesso:
```json
{
	"result": [
		{
			"id": "id",
			"nome": "admin",
			"email": "admin@gmail.com",
			"senha": "senha_hash"
		}
	]
}
```
<br>

---

### 🆔Buscar por ID
- Método: GET
- Caminho: http://localhost:8000/admin/:id
- 🔒 Requer autenticação
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único do admin |

<br>

#### Resposta de Sucesso:
```json
{
	"result": [
		{
			"id": "id",
			"nome": "admin",
			"email": "admin@gmail.com",
			"senha": "senha_hash"
		}
	]
}
```
<br>

---

### ✏️Editar admin
- Método: PUT
- Caminho: http://localhost:8000/admin/:id
<br>

#### Autenticação

Esta rota requer autenticação via JWT.

No Insomnia, selecione:

- Auth → Bearer Token
- Cole o token obtido no login

#### Exemplo de Header

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único do admin |

<br>

#### Corpo da requisição
```json
{
	"nome": "string",
	"email": "string@email.com",
	"senha": "string"
}
```
<br>

#### Regras de Validação

| Email |
|---------|
| Obrigatório |
| Formato de e-mail válido |
<br>

#### Resposta de Sucesso
```json
{
	"editado": {
		"fieldCount": 0,
		"affectedRows": 1,
		"insertId": 0,
		"info": "Rows matched: 1  Changed: 1  Warnings: 0",
		"serverStatus": 2,
		"warningStatus": 0,
		"changedRows": 1
	}
}
```
<br>

#### Possíveis erros

```json
{
	"message": "Ocorreu um erro no servidor",
	"errorMessage": "Admin não encontrado"
}
```
<br>

---

### ❌Deletar admin
- Método: DEL
- Caminho: http://localhost:8000/admin/:id
<br>

#### Autenticação

Esta rota requer autenticação via JWT.

No Insomnia, selecione:

- Auth → Bearer Token
- Cole o token obtido no login

#### Exemplo de Header

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único do admin |

<br>

#### Resposta de Sucesso
```json
{
	"deletado": {
		"fieldCount": 0,
		"affectedRows": 1,
		"insertId": 0,
		"info": "",
		"serverStatus": 2,
		"warningStatus": 0,
		"changedRows": 0
	}
}
```
<br>

#### Possíveis erros

```json
{
	"message": "Ocorreu um erro no servidor",
	"errorMessage": "Admin não encontrado"
}
```
<br>

---

### 🔑Login
- Método: POST
- Caminho: http://localhost:8000/admin/login

#### Corpo de requisição:
```json
{
	"email": "string@email.com",
	"senha": "string"
}
```
<br>

#### Resposta de Sucesso:
```json
{
	"login": {
		"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	}
}
```

> O token de admin expira em 999h (diferente do token de usuário comum, que expira em 1h).

#### Possíveis erros

```json
{
	"message": "Ocorreu um erro no servidor",
	"errorMessage": "Email ou senha inválidos"
}
```
<br>