# API Reference

## 🩺Consulta

> ⚠️ Todas as rotas de consulta exigem autenticação via JWT (`authMiddleware`). As rotas de criar, editar e deletar são restritas a usuários com papel de **cuidador**.

#### Exemplo de Header (obrigatório em todas as rotas)

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```
<br>

### ➕Criar consulta

- Método: POST
- Caminho: http://localhost:8000/consulta
- 🔒 Restrito a cuidador

#### Corpo de requisição:
```json
{
	"nomeMedico": "string",
	"horario": "14:30",
	"localConsulta": "string",
	"idIdoso": "string"
}
```
<br>

#### Regras de Validação

| Nome do Médico |
|---------|
| Obrigatório |
| Mínimo de 3 caracteres |
<br>

| Horário |
|---------|
| Obrigatório |
| Mínimo de 4 caracteres |
<br>

| Local da Consulta |
|---------|
| Obrigatório |
| Mínimo de 3 caracteres |
<br>

| idIdoso |
|---------|
| Obrigatório |
| Mínimo de 3 caracteres |
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
	"errorMessage": "O campo nome médico está incompleto"
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

### ✅Buscar consultas

- Método: GET
- Caminho: http://localhost:8000/consulta

#### Resposta de Sucesso:
```json
{
	"result": [
		{
			"id": "id",
			"nomeMedico": "string",
			"horario": "14:30",
			"localConsulta": "string",
			"idIdoso": "id"
		}
	]
}
```
<br>

---

### 🆔Buscar por ID
- Método: GET
- Caminho: http://localhost:8000/consulta/:id
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único da consulta |

<br>

#### Resposta de Sucesso:
```json
{
	"result": [
		{
			"id": "id",
			"nomeMedico": "string",
			"horario": "14:30",
			"localConsulta": "string",
			"idIdoso": "id"
		}
	]
}
```
<br>

---

### ✏️Editar consulta
- Método: PUT
- Caminho: http://localhost:8000/consulta/:id
- 🔒 Restrito a cuidador
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único da consulta |

<br>

#### Corpo da requisição
```json
{
	"nomeMedico": "string",
	"horario": "14:30",
	"localConsulta": "string",
	"idIdoso": "string"
}
```
<br>

#### Regras de Validação

Mesmas regras da criação.
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

---

### ❌Deletar consulta
- Método: DEL
- Caminho: http://localhost:8000/consulta/:id
- 🔒 Restrito a cuidador
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único da consulta |

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
	"message": "Token não fornecido"
}
```
<br>

```json
{
	"message": "Token inválido ou expirado"
}
```
<br>