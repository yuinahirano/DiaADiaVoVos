# API Reference

## 💊Medicamento

> ⚠️ Todas as rotas exigem autenticação via JWT (`authMiddleware`). As rotas de criar, editar e deletar são restritas a usuários com papel de **cuidador**.

#### Exemplo de Header (obrigatório em todas as rotas)

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```
<br>

### ➕Criar medicamento

- Método: POST
- Caminho: http://localhost:8000/medicamento
- 🔒 Restrito a cuidador

#### Corpo de requisição:
```json
{
	"nome": "string",
	"dosagem": "1mg",
	"horario": "10:00",
	"frequencia": "4 Vezes ao dia",
	"observacoes": "string",
	"idIdoso": "string"
}
```
<br>

#### Regras de Validação

| Nome |
|---------|
| Obrigatório |
| Mínimo de 3 caracteres |
<br>

| Dosagem |
|---------|
| Obrigatório |
| Mínimo de 3 caracteres |
<br>

| Frequência |
|---------|
| Obrigatório |
| Mínimo de 3 caracteres |
<br>

| Observações |
|---------|
| Opcional |
| Se informado, mínimo de 3 caracteres |
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
	"errorMessage": "O campo dosagem está incompleto"
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

### ✅Buscar medicamentos

- Método: GET
- Caminho: http://localhost:8000/medicamento

#### Resposta de Sucesso:
```json
{
	"result": [
		{
			"id": "id",
			"nome": "string",
			"dosagem": "1mg",
			"horario": "10:00",
			"frequencia": "4 Vezes ao dia",
			"observacoes": "string",
			"idIdoso": "id"
		}
	]
}
```
<br>

---

### 🆔Buscar por ID
- Método: GET
- Caminho: http://localhost:8000/medicamento/:id
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único do medicamento |

<br>

#### Resposta de Sucesso:
```json
{
	"result": [
		{
			"id": "id",
			"nome": "string",
			"dosagem": "1mg",
			"horario": "10:00",
			"frequencia": "4 Vezes ao dia",
			"observacoes": "string",
			"idIdoso": "id"
		}
	]
}
```
<br>

---

### 👵🔍Buscar por Idoso
- Método: GET
- Caminho: http://localhost:8000/medicamento/idosos/:idIdoso
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| idIdoso | UUID | Identificador único do idoso |

<br>

#### Resposta de Sucesso:
```json
{
	"result": [
		{
			"id": "id",
			"nome": "string",
			"dosagem": "1mg",
			"horario": "10:00",
			"frequencia": "4 Vezes ao dia",
			"observacoes": "string",
			"idIdoso": "id"
		}
	]
}
```
<br>

---

### ✏️Editar medicamento
- Método: PUT
- Caminho: http://localhost:8000/medicamento/:id
- 🔒 Restrito a cuidador
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único do medicamento |

<br>

#### Corpo da requisição
```json
{
	"nome": "string",
	"dosagem": "1mg",
	"horario": "10:00",
	"frequencia": "4 Vezes ao dia",
	"observacoes": "string",
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

### ❌Deletar medicamento
- Método: DEL
- Caminho: http://localhost:8000/medicamento/:id
- 🔒 Restrito a cuidador
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único do medicamento |

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