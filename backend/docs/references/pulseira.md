# API Reference

## ⌚ Pulseira

Dispositivo de monitoramento vinculado a um idoso e a um cuidador. A pulseira envia [leituras](./leitura.md) de batimentos e saturação.

> ⚠️ Todas as rotas exigem autenticação via JWT (`authMiddleware`).

#### Exemplo de Header (obrigatório em todas as rotas)

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

> ℹ️ A tabela `pulseira` também armazena `device_token` (identificação do dispositivo) e `vinculada_em` (data do vínculo). Veja [database.md](./database.md).

---

### ➕ Criar pulseira

- Método: POST
- Caminho: http://localhost:8000/pulseira
- 🔒 Requer autenticação

#### Corpo da requisição
```json
{
  "idIdoso": "string",
  "idCuidador": "string",
  "nome": "Pulseira do Seu José"
}
```

#### Regras de Validação

| Campo | Regras |
|---|---|
| `idIdoso` | Obrigatório. Deve referenciar um idoso existente |
| `idCuidador` | Obrigatório. Deve referenciar um cuidador existente |
| `nome` | Obrigatório. Máximo de 100 caracteres |

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


---

### ✅ Buscar pulseiras

- Método: GET
- Caminho: http://localhost:8000/pulseira
- 🔒 Requer autenticação

#### Resposta de Sucesso
```json
{
  "result": [
    {
      "id": "id",
      "idIdoso": "id",
      "idCuidador": "id",
      "nome": "Pulseira do Seu José"
    }
  ]
}
```

---

### ✏️ Editar pulseira

- Método: PUT
- Caminho: http://localhost:8000/pulseira/:id
- 🔒 Requer autenticação

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único da pulseira |

#### Corpo da requisição
```json
{
  "idIdoso": "string",
  "idCuidador": "string",
  "nome": "Pulseira do Seu José"
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

### ❌ Deletar pulseira

- Método: DELETE
- Caminho: http://localhost:8000/pulseira/:id
- 🔒 Requer autenticação

#### Parâmetros da rota

| Parâmetro | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único da pulseira |

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