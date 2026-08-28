import express from "express";
import cors from "cors";
import { EnvVar } from "./src/config/EnvVar.config";
import router from "./src/routes/routes";

const app = express();
app.use(cors()); //libera o acesso para qualquer origem/porta em desenvolvimento
app.use(express.json());
app.use('/', router);

app.listen(EnvVar.SERVER_PORT, ()=>{
    console.log(`Servidor rodando em http://localhost:${EnvVar.SERVER_PORT}`);
})