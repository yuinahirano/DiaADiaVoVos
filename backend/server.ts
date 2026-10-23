import express from "express";
import cors from "cors";
import { EnvVar } from "./src/config/EnvVar.config";
import router from "./src/routes/routes";
import { connectMongo } from "./src/database/mongodb.database";

const app = express();
connectMongo();
app.use(cors());
app.use(express.json());
app.use("/", router);

app.listen(EnvVar.SERVER_PORT, () => {
  console.log(`Servidor rodando em http://localhost:${EnvVar.SERVER_PORT}`);
});