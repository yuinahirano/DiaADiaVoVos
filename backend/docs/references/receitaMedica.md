# API Reference

## 📄 Receita Médica

Armazena as receitas emitidas em uma consulta.

> ⚠️ Todas as rotas exigem autenticação via JWT (`authMiddleware`). As rotas de criar, editar e deletar são restritas a usuários com papel de **cuidador**.

#### Exemplo de Header (obrigatório em todas as rotas)

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

### ➕ Criar receita

- Método: POST
- Caminho: http://localhost:8000/receita
- 🔒 Restrito a cuidador

#### Corpo da requisição
```json
{
  "idConsulta": "string",
  "descricao": "Uso contínuo de Losartana 50mg, 1 comprimido pela manhã",
  "dataEmissao": "2026-08-14",
  "dataVencimento": "2026-11-14"
}
```

#### Regras de Validação

| Campo | Regras |
|---|---|
| `idConsulta` | Obrigatório. Mínimo de 3 caracteres |
| `descricao` | Obrigatório. Mínimo de 3 caracteres |
| `dataEmissao` | Obrigatório. Formato `AAAA-MM-DD` |
| `dataVencimento` | Opcional. Formato `AAAA-MM-DD` |

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
  "errorMessage": "O campo descricao está incompleto"
}
```
<br>

```json
{
  "message": "Acesso restrito a cuidadores"
}
```

---

### ✅ Buscar receitas

- Método: GET
- Caminho: http://localhost:8000/receita
- 🔒 Requer autenticação

#### Resposta de Sucesso
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

---

### 🆔 Buscar por ID

- Método: GET
- Caminho: http://localhost:8000/receita/:id
- 🔒 Requer autenticação

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único da receita |

#### Resposta de Sucesso
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

---

### ✏️ Editar receita

- Método: PUT
- Caminho: http://localhost:8000/receita/:id
- 🔒 Restrito a cuidador

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único da receita |

#### Corpo da requisição
```json
{
  "idConsulta": "string",
  "descricao": "Uso contínuo de Losartana 50mg, 1 comprimido pela manhã",
  "dataEmissao": "2026-08-14",
  "dataVencimento": "2026-11-14"
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


---

### ❌ Deletar receita

- Método: DELETE
- Caminho: http://localhost:8000/receita/:id
- 🔒 Restrito a cuidador

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único da receita |

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