# API Reference

## 🛡️ Admin

Gerencia as contas de administradores do sistema. Somente administradores criam novas contas de usuário (RN-001).

> ⚠️ Todas as rotas exigem autenticação via JWT (`autenticarToken`), exceto o login.

#### Exemplo de Header

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

### ➕ Criar admin

- Método: POST
- Caminho: http://localhost:8000/admin
- 🔒 Requer autenticação

#### Corpo da requisição
```json
{
  "nome": "string",
  "email": "string@email.com",
  "senha": "string"
}
```

#### Regras de Validação

| Campo | Regras |
|---|---|
| `nome` | Obrigatório |
| `email` | Obrigatório. Formato de e-mail válido |
| `senha` | Obrigatório. Armazenada como hash; sem regras adicionais de formato |

#### Resposta de Sucesso
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
  "errorMessage": "Formato de email inválido"
}
```

---

### ✅ Buscar admins

- Método: GET
- Caminho: http://localhost:8000/admin
- 🔒 Requer autenticação

#### Resposta de Sucesso
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

---

### 🆔 Buscar por ID

- Método: GET
- Caminho: http://localhost:8000/admin/:id
- 🔒 Requer autenticação

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único do admin |

#### Resposta de Sucesso
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

---

### ✏️ Editar admin

- Método: PUT
- Caminho: http://localhost:8000/admin/:id
- 🔒 Requer autenticação

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único do admin |

#### Corpo da requisição
```json
{
  "nome": "string",
  "email": "string@email.com",
  "senha": "string"
}
```

#### Regras de Validação

Mesmas regras da criação.

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
  "errorMessage": "Admin não encontrado"
}
```

---

### ❌ Deletar admin

- Método: DELETE
- Caminho: http://localhost:8000/admin/:id
- 🔒 Requer autenticação

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único do admin |

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
  "message": "Ocorreu um erro no servidor",
  "errorMessage": "Admin não encontrado"
}
```

---

### 🔑 Login

- Método: POST
- Caminho: http://localhost:8000/admin/login

#### Corpo da requisição
```json
{
  "email": "string@email.com",
  "senha": "string"
}
```

#### Resposta de Sucesso
```json
{
  "login": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

> O token de admin expira em **999 horas**. O token de usuário comum expira em **8 horas**.

#### Possíveis erros
```json
{
  "message": "Ocorreu um erro no servidor",
  "errorMessage": "Email ou senha inválidos"
}
```

---

### 🔐 Erros de autenticação (comuns a todas as rotas protegidas)

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