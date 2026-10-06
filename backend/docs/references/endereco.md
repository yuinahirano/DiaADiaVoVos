# API Reference

## 🏠 Endereço

Armazena os endereços dos usuários do sistema.

> ⚠️ Todas as rotas exigem autenticação via JWT (`authMiddleware`). As rotas de criar, editar e deletar são restritas a usuários com papel de **cuidador**.

#### Exemplo de Header (obrigatório em todas as rotas)

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

> ℹ️ O endereço completo (logradouro, bairro, cidade, UF) é armazenado na tabela `enderecos`; veja [database.md](./database.md).

---

### ➕ Criar endereço

- Método: POST
- Caminho: http://localhost:8000/enderecos
- 🔒 Restrito a cuidador

#### Corpo da requisição
```json
{
  "numero": 123,
  "complemento": "Apto 45",
  "cep": "01310100",
  "idUsuario": "string"
}
```

#### Regras de Validação

| Campo | Regras |
|---|---|
| `numero` | Obrigatório. Entre 1 e 8 caracteres |
| `complemento` | Obrigatório. Máximo de 150 caracteres |
| `cep` | Obrigatório. Exatamente 8 dígitos numéricos |
| `idUsuario` | Obrigatório |

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
  "errorMessage": "CEP inválido"
}
```
<br>

```json
{
  "message": "Acesso restrito a cuidadores"
}
```

---

### ✅ Buscar endereços

- Método: GET
- Caminho: http://localhost:8000/enderecos
- 🔒 Requer autenticação

#### Resposta de Sucesso
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

---

### 🆔 Buscar por ID

- Método: GET
- Caminho: http://localhost:8000/enderecos/:id
- 🔒 Requer autenticação

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único do endereço |

#### Resposta de Sucesso
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

---

### ✏️ Editar endereço

- Método: PUT
- Caminho: http://localhost:8000/enderecos/:id
- 🔒 Restrito a cuidador

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único do endereço |

#### Corpo da requisição
```json
{
  "numero": 123,
  "complemento": "Apto 45",
  "cep": "01310100",
  "idUsuario": "string"
}
```

#### Regras de Validação

Mesmas regras da criação.

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


---

### ❌ Deletar endereço

- Método: DELETE
- Caminho: http://localhost:8000/enderecos/:id
- 🔒 Restrito a cuidador

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único do endereço |

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



---

### 🔐 Erros de autenticação (comuns a todas as rotas protegidas)

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