# 🗄️ Banco de Dados - Dia a Dia Vovôs

Este documento detalha a modelagem de dados utilizada para garantir a persistência segura das informações de saúde, rotina e usuários do sistema.

# 📊 Modelo Entidade-Relacionamento (DER)

A estrutura foi desenhada para suportar perfis distintos (Idosos, Cuidadores, Administradores) e o monitoramento contínuo de dados vitais.

---

# 🧩 Estrutura das Tabelas

## 👤 Núcleo de Usuários

* **`usuario`**: Tabela central contendo `nome`, `cpf`, `email`, `senha` e `data_nascimento`.
* **`enderecos`**: Armazena a localização dos usuários, vinculada pelo `id_usuario`.
* **`idoso`**: Atributos específicos como `tipo_sanguineo`, `pcd` e `telefone`.


* **`cuidador`**: Identifica usuários com permissões de gestão de saúde.

* **`idoso_responsavel`**: Tabela associativa que vincula obrigatoriamente um idoso a um cuidador.



## 🏥 Gestão de Saúde e Rotina

* **`medicamento`**: Registro de `nome`, `dosagem`, `horario` e `frequencia` para controle do idoso.


* **`registroSaude`**: Histórico de sinais vitais como `pressao_arterial`, `glicemia`, `batimento_cardiaco`, `temperatura` e `peso`.


* **`doenca`**: Cadastro de patologias e descrições do histórico médico do idoso.


* **`consulta`**: Agendamento de compromissos com `nome_medico`, `horario` e `local_consulta`.


* **`receitaMedica`**: Armazena descrições e datas de emissão vinculadas às consultas médicas.

---

# 🛠️ Tecnologias e Regras

* **SGBD**: MySQL.


* **Integridade**:
* O preenchimento de `tipo_sanguineo`, `contato_emergencia` e `doenca` é obrigatório no primeiro acesso (RN-005).


* Relacionamentos via UUID para garantir a segurança e unicidade dos registros de saúde.


* **Segurança (LGPD)**: Todos os dados sensíveis são armazenados seguindo os protocolos de conformidade da Lei Geral de Proteção de Dados (RNF-005).



---

**FHAMN & SENAI** | Modelagem de Dados | Sumaré, 2026.