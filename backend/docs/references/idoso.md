# API Reference

## 👵 Idoso

Perfil do usuário idoso, com dados de saúde essenciais como tipo sanguíneo e PCD.

---

### ➕ Criar idoso

- Método: POST
- Caminho: http://localhost:8000/idosos

#### Corpo da requisição
```json
{
  "tipoSanguineo": "O+",
  "telefone": "19999182381",
  "pcd": "sim",
  "idUsuario": "string",
  "idImagem": "string"
}
```

#### Regras de Validação

| Campo | Regras |
|---|---|
| `tipoSanguineo` | Obrigatório. Mínimo de 2 caracteres |
| `telefone` | Obrigatório. Deve ser um telefone válido |
| `pcd` | Obrigatório. Valores aceitos: `sim`, `nao` |
| `idUsuario` | Obrigatório. O usuário deve existir. Só pode existir um idoso por usuário |
| `idImagem` | Opcional |

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

---

### ✅ Buscar idosos

- Método: GET
- Caminho: http://localhost:8000/idosos

#### Resposta de Sucesso
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

---

### 🆔 Buscar por ID

- Método: GET
- Caminho: http://localhost:8000/idosos/:id

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único do idoso |

#### Resposta de Sucesso
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

---

### ✏️ Editar idoso

- Método: PUT
- Caminho: http://localhost:8000/idosos/:id

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único do idoso |

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

---

### ❌ Deletar idoso

- Método: DELETE
- Caminho: http://localhost:8000/idosos/:id

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único do idoso |

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
  "errorMessage": "Idoso não encontrado"
}
```