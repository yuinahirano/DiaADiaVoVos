# API Reference

## 🏠Endereço

> ⚠️ Todas as rotas exigem autenticação via JWT (`authMiddleware`). As rotas de criar, editar e deletar são restritas a usuários com papel de **cuidador**.

#### Exemplo de Header (obrigatório em todas as rotas)

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```
<br>

### ➕Criar endereço

- Método: POST
- Caminho: http://localhost:8000/enderecos
- 🔒 Restrito a cuidador

#### Corpo de requisição:
```json
{
	"numero": 123,
	"complemento": "Apto 45",
	"cep": "01310100",
	"idUsuario": "string"
}
```
<br>

#### Regras de Validação

| Número |
|---------|
| Obrigatório |
| Entre 1 e 8 caracteres |
<br>

| Complemento |
|---------|
| Obrigatório |
| Máximo de 150 caracteres |
<br>

| CEP |
|---------|
| Obrigatório |
| Deve conter exatamente 8 dígitos numéricos |
<br>

| idUsuario |
|---------|
| Obrigatório |
<br>

---

#### Resposta de Sucesso:
```json
{
	"novo": {
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
	"errorMessage": "CEP inválido"
}
```
<br>

```json
{
	"message": "Acesso restrito a cuidadores"
}
```
<br>

---

### ✅Buscar endereços

- Método: GET
- Caminho: http://localhost:8000/enderecos

#### Resposta de Sucesso:
```json
{
	"result": [
		{
			"id": "id",
			"numero": 123,
			"complemento": "Apto 45",
			"cep": "01310100",
			"idUsuario": "id"
		}
	]
}
```
<br>

---

### 🆔Buscar por ID
- Método: GET
- Caminho: http://localhost:8000/enderecos/:id
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único do endereço |

<br>

#### Resposta de Sucesso:
```json
{
	"result": [
		{
			"id": "id",
			"numero": 123,
			"complemento": "Apto 45",
			"cep": "01310100",
			"idUsuario": "id"
		}
	]
}
```
<br>

---

### ✏️Editar endereço
- Método: PUT
- Caminho: http://localhost:8000/enderecos/:id
- 🔒 Restrito a cuidador
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único do endereço |

<br>

#### Corpo da requisição
```json
{
	"numero": 123,
	"complemento": "predio fiesp",
	"cep": "01310100",
	"idUsuario": "string"
}
```
<br>

#### Regras de Validação

Mesmas regras da criação.
<br>

#### Resposta de Sucesso
```json
{
	"novo": {
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
> ⚠️ Nesta rota, diferente das demais, a chave de resposta é `novo` (não `editado`).
<br>

---

### ❌Deletar endereço
- Método: DEL
- Caminho: http://localhost:8000/enderecos/:id
- 🔒 Restrito a cuidador
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único do endereço |

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