# API Reference

## 👵Idoso

### ➕Criar idoso

- Método: POST
- Caminho: http://localhost:8000/idosos

#### Corpo de requisição:
```json
{
	"tipoSanguineo": "O+",
	"telefone": "19999182381",
	"pcd": "sim",
	"idUsuario": "string",
	"idImagem": "string"
}
```
<br>

#### Regras de Validação

| Tipo Sanguíneo |
|---------|
| Obrigatório |
| Mínimo de 2 caracteres |
<br>

| Telefone |
|---------|
| Obrigatório |
| Deve ser um telefone válido |
<br>

| PCD |
|---------|
| Obrigatório |
| Deve ser uma dessas opções: "sim", "nao" |
<br>

| idUsuario |
|---------|
| Obrigatório |
| O usuário deve obrigatoriamente existir |
| Só pode existir um idoso vinculado por usuário |
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
	"errorMessage": "Já existe um idoso cadastrado para este usuário"
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

### ✅Buscar idosos

- Método: GET
- Caminho: http://localhost:8000/idosos

#### Resposta de Sucesso:
```json
{
	"result": [
		{
			"id": "id",
			"tipoSanguineo": "O+",
			"telefone": "19999182381",
			"pcd": "sim",
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
- Caminho: http://localhost:8000/idosos/:id
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único do idoso |

<br>

#### Resposta de Sucesso:
```json
{
	"result": [
		{
			"id": "id",
			"tipoSanguineo": "O+",
			"telefone": "19999182381",
			"pcd": "sim",
			"idImagem": null,
			"idUsuario": "id"
		}
	]
}
```
<br>

---

### ✏️Editar idoso
- Método: PUT
- Caminho: http://localhost:8000/idosos/:id
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único do idoso |

<br>

#### Corpo da requisição
```json
{
	"tipoSanguineo": "B-",
	"telefone": "19999182381",
	"pcd": "sim",
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
	"errorMessage": "idoso não encontrado"
}
```
<br>

```json
{
	"message": "Ocorreu um erro no servidor",
	"errorMessage": "Já existe um idoso cadastrado para este usuário"
}
```
<br>

---

### ❌Deletar idoso
- Método: DEL
- Caminho: http://localhost:8000/idosos/:id
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único do idoso |

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
	"errorMessage": "Idoso não encontrado"
}
```
<br>