import { Request, Response } from "express";
import { UsuarioService } from "../services/usuario.services";

export class UsuarioController{
    constructor (private _service = new UsuarioService()){}

    selecionar = async(req: Request, res: Response)=>{
        try{
            const id = req.params.id ? Number(req.params.id) : null;
            const email = req.query.email ? String(req.query.email) : null;
            const cpf = req.query.cpf ? String(req.query.cpf) : null;

            let result = null
            if (id && id > 0) {
                result = await this._service.selecionarPorId(id);
                return res.status(200).json({ result });
            }  
            result = await this._service.selecionarTodos();
            res.status(200).json({ result });
        }catch  (error){
            console.error(error);
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            return res.status(500).json({ message: 'Ocorreu um erro no servidor', errorMessage: message });
        }
    }
}
