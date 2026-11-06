import express from "express";
import cors from "cors";
import { EnvVar } from "./src/config/EnvVar.config";
import router from "./src/routes/routes";
import { connectMongo } from "./src/database/mongodb.database";
import { inicializarBanco } from "./src/database/connection.database";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/", router);

async function iniciarServidor() {
  try {
    // Conecta ao TiDB ou, se falhar, tenta o banco local.
    await inicializarBanco();

    // Mantém a conexão com o MongoDB.
    await connectMongo();

    app.listen(EnvVar.SERVER_PORT, () => {
      console.log(
        `Servidor rodando em http://localhost:${EnvVar.SERVER_PORT}`
      );
    });
  } catch (erro) {
    console.error("Erro ao iniciar o servidor:", erro);
    process.exit(1);
  }
}

iniciarServidor();