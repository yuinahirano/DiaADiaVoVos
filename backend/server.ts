import express from "express";
import { EnvVar } from "./src/config/EnvVar.config";
import router from "./src/routes/routes";

const app = express();
app.use(express.json());
app.use('/', router);

app.listen(EnvVar.SERVER_PORT, ()=>{
    console.log(`Servidor rodando em http://localhost:${EnvVar.SERVER_PORT}`);
})