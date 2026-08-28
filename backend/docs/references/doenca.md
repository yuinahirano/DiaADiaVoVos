# API Reference

## 🦠Doença

> ⚠️ Todas as rotas exigem autenticação via JWT (`authMiddleware`). As rotas de criar, editar e deletar são restritas a usuários com papel de **cuidador**.

#### Exemplo de Header (obrigatório em todas as rotas)

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```
<br>

### ➕Criar doença

- Método: POST
- Caminho: http://localhost:8000/doenca
- 🔒 Restrito a cuidador

#### Corpo de requisição:
```json
{
	"idIdoso": "string",
	"nome": "string",
	"descricao": "string"
}
```
<br>

#### Regras de Validação

| idIdoso |
|---------|
| Obrigatório |
| Mínimo de 3 caracteres |
<br>

| Nome |
|---------|
| Obrigatório |
| Mínimo de 3 caracteres |
<br>

| Descrição |
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
	"errorMessage": "O campo nome está incompleto"
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

### ✅Buscar doenças

- Método: GET
- Caminho: http://localhost:8000/doenca

#### Resposta de Sucesso:
```json
{
	"result": [
		{
			"id": "id",
			"idIdoso": "id",
			"nome": "string",
			"descricao": "string"
		}
	]
}
```
<br>

---

### 🆔Buscar por ID
- Método: GET
- Caminho: http://localhost:8000/doenca/:id
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único da doença |

<br>

#### Resposta de Sucesso:
```json
{
	"result": [
		{
			"id": "id",
			"idIdoso": "id",
			"nome": "string",
			"descricao": "string"
		}
	]
}
```
<br>

---

### ✏️Editar doença
- Método: PUT
- Caminho: http://localhost:8000/doenca/:id
- 🔒 Restrito a cuidador
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único da doença |

<br>

#### Corpo da requisição
```json
{
	"idIdoso": "string",
	"nome": "string",
	"descricao": "string"
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

### ❌Deletar doença
- Método: DEL
- Caminho: http://localhost:8000/doenca/:id
- 🔒 Restrito a cuidador
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único da doença |

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