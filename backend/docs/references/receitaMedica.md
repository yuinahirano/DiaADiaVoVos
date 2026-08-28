# API Reference

## 📄Receita Médica

> ⚠️ Todas as rotas exigem autenticação via JWT (`authMiddleware`). As rotas de criar, editar e deletar são restritas a usuários com papel de **cuidador**.

#### Exemplo de Header (obrigatório em todas as rotas)

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```
<br>

### ➕Criar receita

- Método: POST
- Caminho: http://localhost:8000/receita
- 🔒 Restrito a cuidador

#### Corpo de requisição:
```json
{
	"idConsulta": "string",
	"descricao": "Uso contínuo de Losartana 50mg, 1 comprimido pela manhã",
	"dataEmissao": "2026-08-14",
	"dataVencimento": "2026-11-14"
}
```
<br>

#### Regras de Validação

| idConsulta |
|---------|
| Obrigatório |
| Mínimo de 3 caracteres |
<br>

| Descrição |
|---------|
| Obrigatório |
| Mínimo de 3 caracteres |
<br>

| Data de Emissão |
|---------|
| Obrigatório |
<br>

| Data de Vencimento |
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
	"errorMessage": "O campo descricao está incompleto"
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

### ✅Buscar receitas

- Método: GET
- Caminho: http://localhost:8000/receita

#### Resposta de Sucesso:
```json
{
	"result": [
		{
			"id": "id",
			"idConsulta": "id",
			"descricao": "string",
			"dataEmissao": "2026-08-14",
			"dataVencimento": "2026-11-14"
		}
	]
}
```
<br>

---

### 🆔Buscar por ID
- Método: GET
- Caminho: http://localhost:8000/receita/:id
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único da receita |

<br>

#### Resposta de Sucesso:
```json
{
	"result": [
		{
			"id": "id",
			"idConsulta": "id",
			"descricao": "string",
			"dataEmissao": "2026-08-14",
			"dataVencimento": "2026-11-14"
		}
	]
}
```
<br>

---

### ✏️Editar receita
- Método: PUT
- Caminho: http://localhost:8000/receita/:id
- 🔒 Restrito a cuidador
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único da receita |

<br>

#### Corpo da requisição
```json
{
	"idConsulta": "string",
	"descricao": "Uso de Losartana 50mg, 1 comprimido pela manhã",
	"dataEmissao": "2026-08-14",
	"dataVencimento": "2026-11-14"
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

### ❌Deletar receita
- Método: DEL
- Caminho: http://localhost:8000/receita/:id
- 🔒 Restrito a cuidador
<br>

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único da receita |

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