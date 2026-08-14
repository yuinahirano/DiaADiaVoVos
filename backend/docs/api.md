# API Reference

## 👤Usuário

### ➕Criar usuário

- Método: POST
- Caminho: `http://localhost:8000/usuarios`

#### Corpo de requisição: 
```json
 {
	"nome": "string",
	"cpf" : "string",
	"email": "string@email.com",
	"senha": "Senha@1234",
	"dataNascimento": 20000820,
	"estadoCivil": "Solteiro"
}
```

#### Regras de Validação

#### Nome
- Obrigatório

#### CPF
- Obrigatório
- Deve ter 11 caracteres
- O cpf deve obrigatoriamente existir 


#### Email
- Obrigatório
- Formato de e-mail válido
- Não pode estar cadastrado
- Contém "@"
- Máximo de 225 caracteres


#### Senha
- Obrigatório
- Deve conter no mínimo uma letra maiúscula
- Deve conter no mínimo uma letra minúscula
- Deve conter no mínimo um número
- Deve conter caracter especial
- Tamaho mínimo de 8 caracteres
- Tamanho máximo de 50 caracteres


#### Data de Nascimento
- Formato AAAAMMDD


#### Estado Civil
- Obrigatório
- Deve uma dessas opções: "Solteiro", "Casado", "Viúvo", "Divorciado", "Uniao"
- Deve estar exatamente escrito como nas opções apresentadas
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
#### Possíveis erros

```json
{
	"message": "Ocorreu um erro no servidor",
	"errorMessage": "CPF inválido"
}
```


```json
{
	"message": "Ocorreu um erro no servidor",
	"errorMessage": "Email deve conter @, Formato de email inválido"
}
```


```json
{
	"message": "Ocorreu um erro no servidor",
	"errorMessage": "Senha deve conter ao menos uma letra maiúscula, Senha deve conter ao menos um número, Senha deve conter ao menos um caractere especial (!@#$%^&*), Senha deve ter no mínimo 8 caracteres"
}
```
---


### ✅Buscar usuários

- Método: GET
- Caminho: `http://localhost:8000/usuarios`

#### Resposta de Sucesso: 
```json
{
	"result": [
		{
			"id": "6c808ab5-6673-11f1-88f9-0a0027000003",
			"nome": "user",
			"cpf": "49037627854",
			"email": "user@gmail.com",
			"senha": "senha_hash",
			"data_nascimento": "2000-08-20T03:00:00.000Z",
			"estado_civil": "solteiro"
		}
	]
}
```


#### Exemplo de requisição

```http
GET http://localhost:8000/usuarios/6c808ab5-6673-11f1-88f9-0a0027000003
```


### 🆔Buscar por ID
- Método: GET
- Caminho: `http://localhost:8000/usuarios/:id`


#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único do usuário |



#### Resposta de Sucesso:
```json
{
	"result": [
		{
			"id": "id",
			"nome": "user",
			"cpf": "49037627854",
			"email": "user@gmail.com",
			"senha": "senha_hash",
			"data_nascimento": "2000-08-20T03:00:00.000Z",
			"estado_civil": "solteiro"
		}
	]
}
```


---
### ✏️Editar usuário
- Método: PUT
- Caminho: `http://localhost:8000/usuarios/:id`


#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único do usuário |



#### Corpo da requisição
```json
 {
	"nome": "string",
	"cpf" : "string",
	"email": "string@email.com",
	"senha": "Senha@1234",
	"dataNascimento": 20000820,
	"estadoCivil": "Solteiro"
}
```


#### Regras de Validação

#### Nome
- Obrigatório


#### CPF
- Obrigatório
- Deve ter 11 caracteres
- O cpf deve obrigatoriamente existir


#### Email
- Obrigatório
- Formato de e-mail válido
- Não pode estar cadastrado
- Contém "@"
- Máximo de 225 caracteres


#### Senha
- Obrigatório
- Deve conter no mínimo uma letra maiúscula
- Deve conter no mínimo uma letra minúscula
- Deve conter no mínimo um número
- Deve conter caracter especial
- Tamaho mínimo de 8 caracteres
- Tamanho máximo de 50 caracteres


#### Data de Nascimento 
- Formato AAAAMMDD 


#### Estado Civil 
- Obrigatório 
- Deve uma dessas opções: "Solteiro", "Casado", "Viúvo", "Divorciado", "Uniao" 
- Deve estar exatamente escrito como nas opções apresentadas 


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


#### Possíveis erros

```json
{
	"message": "Ocorreu um erro no servidor",
	"errorMessage": "CPF inválido"
}
```


```json
{
	"message": "Ocorreu um erro no servidor",
	"errorMessage": "Email deve conter @, Formato de email inválido"
}
```


```json
{
	"message": "Ocorreu um erro no servidor",
	"errorMessage": "Senha deve conter ao menos uma letra maiúscula, Senha deve conter ao menos um número, Senha deve conter ao menos um caractere especial (!@#$%^&*), Senha deve ter no mínimo 8 caracteres"
}
```


---
### ➕Criar usuário

- Método: POST
- Caminho: `http://localhost:8000/usuarios/login`

#### Corpo de requisição: 
```json
{
	"email": "string@email.com",
	"senha": "string"
}
```


#### Regras de Validação

#### Email 
- Obrigatório 
- Formato de e-mail válido 
- Não pode estar cadastrado 
- Contém "@" 
- Máximo de 225 caracteres 


#### Senha 
- Obrigatório
- Deve conter no mínimo uma letra maiúscula
- Deve conter no mínimo uma letra minúscula
- Deve conter no mínimo um número
- Deve conter caracter especial 
- Tamaho mínimo de 8 caracteres 
- Tamanho máximo de 50 caracteres

---

#### Resposta de Sucesso: 
```json
{
	"login": {
		"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZjODA4YWI1LTY2NzMtMTFmMS04OGY5LTBhMDAyNzAwMDAwMyIsImVtYWlsIjoic3RyaW5nQGVtYWlsLmNvbSIsImlhdCI6MTc4MTI4MzUyMCwiZXhwIjoxNzgxMzEyMzIwfQ.d4B36RAF9lbh0z8Hh73acFB0BI2nmlHst8Dw4m6pkZ0"
	}
}
```
#### Possíveis erros

```json
{
	"message": "Ocorreu um erro no servidor",
	"errorMessage": "Email ou senha inválidos"
}
```


----

### ❌Deletar usuário
- Método: DEL
- Caminho: `http://localhost:8000/usuarios/:id`


#### Autenticação

Esta rota requer autenticação via JWT.

No Insomnia, selecione:

- Auth → Bearer Token
- Cole o token obtido no login



#### Exemplo de Header

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Exemplo:

![Imagem exemplo delete auth](image.png)


#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | Identificador único do usuário |



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


#### Possíveis erros

```json
{
	"erro": "Token não informado"
}
```


```json
{
	"message": "Ocorreu um erro no servidor",
	"errorMessage": "Usuário não encontrado"
}
```


```json
{
	"erro": "Token inválido ou expirado"
}
```
