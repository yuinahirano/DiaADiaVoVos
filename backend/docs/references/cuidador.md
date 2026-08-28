# API Reference

## 🧑‍⚕️Cuidador

### ➕Criar cuidador

- Método: POST
- Caminho: http://localhost:8000/cuidadores

#### Corpo de requisição:
```json
{
	"telefone": "19999182381",
	"idUsuario": "string",
	"idImagem": "string"
}
```
<br>

#### Regras de Validação

| Telefone |
|---------|
| Obrigatório |
| Deve ser um telefone válido |
<br>

| idUsuario |
|---------|
| Obrigatório |
| Mínimo de 3 caracteres |
| O usuário deve obrigatoriamente existir |
<br>

| idImagem |
|---------|
| Opcional |
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
	"errorMessage": "Este usuário não existe"
}
```
<br>

```json
{
	"message": "Ocorreu um erro no servidor",
	"errorMessage": "Telefone inválido"
}
```
<br>

---

### ✅Buscar cuidadores

- Método: GET
- Caminho: http://localhost:8000/cuidadores

#### Resposta de Sucesso:
```json
{
	"result": [
		{
			"id": "id",
			"telefone": "19999182381",
			"idImagem": null,
			"idUsuario": "id"
		}
	]
}
```
<br>

---

### 🆔Buscar por ID
- Método: GET
- Caminho: http://localhost:8000/cuidadores/:id
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único do cuidador |

<br>

#### Resposta de Sucesso:
```json
{
	"result": [
		{
			"id": "id",
			"telefone": "19999182381",
			"idImagem": null,
			"idUsuario": "id"
		}
	]
}
```
<br>

---

### ✏️Editar cuidador
- Método: PUT
- Caminho: http://localhost:8000/cuidadores/:id
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único do cuidador |

<br>

#### Corpo da requisição
```json
{
	"telefone": "19999182381",
	"idUsuario": "string",
	"idImagem": "string"
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

#### Possíveis erros

```json
{
	"message": "Ocorreu um erro no servidor",
	"errorMessage": "Cuidador não encontrado"
}
```
<br>

---

### ❌Deletar cuidador
- Método: DEL
- Caminho: http://localhost:8000/cuidadores/:id
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único do cuidador |

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
	"errorMessage": "Cuiador não encontrado"
}
```
<br>