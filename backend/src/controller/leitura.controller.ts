import { Request, Response } from "express";
import { LeituraService, MAX_LOTE } from "../services/leitura.services";

export class LeituraController {
  constructor(private _service = new LeituraService()) {}

  selecionar = async (req: Request, res: Response) => {
    try {
      const id = req.params.id ? String(req.params.id) : null;
      let result = null;
      if (id) {
        result = await this._service.selecionarPorId(id);
        return res.status(200).json({ result });
      }
      result = await this._service.selecionarTodos();
      return res.status(200).json({ result });
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({
        message: "Ocorreu um erro no servidor",
        errorMessage: message,
      });
    }
  };

  criar = async (req: Request, res: Response) => {
    try {
      const { idPulseira, bpm, spo2 } = req.body;
      const novo = await this._service.criar(idPulseira, bpm, spo2);
      res.status(201).json({ novo });
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({
        message: "Ocorreu um erro no servidor",
        errorMessage: message,
      });
    }
  };

  // Chamado pelo ESP32: o idPulseira vem do token (middleware), não do body
  criarDoDispositivo = async (req: Request, res: Response) => {
    try {
      const idPulseira = (req as any).pulseiraId as string;
      const { bpm, spo2 } = req.body;
      const novo = await this._service.criar(idPulseira, bpm, spo2);
      res.status(201).json({ novo });
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({
        message: "Ocorreu um erro no servidor",
        errorMessage: message,
      });
    }
  };

  // Chamado pelo app depois de sincronizar com a pulseira por BLE.
  // Dois tokens:
  //   Authorization: Bearer <JWT do usuário>  -> authMiddleware (quem está enviando)
  //   x-device-token: <token da pulseira>     -> deviceAuthMiddleware (qual pulseira)
  // O idPulseira vem do token da pulseira; o usuário não informa id nenhum.
  // Qualquer 200 significa que o app pode apagar o lote da fila local.
  criarLote = async (req: Request, res: Response) => {
    try {
      const idUsuario = (req as any).usuario?.id as string | undefined;
      const idPulseira = (req as any).pulseiraId as string | undefined;
      if (!idUsuario)
        return res.status(401).json({ message: "Usuário não identificado" });
      if (!idPulseira)
        return res.status(401).json({ message: "Pulseira não identificada" });

      const { leituras } = req.body;

      if (!Array.isArray(leituras) || leituras.length === 0)
        return res
          .status(400)
          .json({ message: "Envie uma lista 'leituras' não vazia" });

      if (leituras.length > MAX_LOTE)
        return res
          .status(400)
          .json({ message: `Máximo de ${MAX_LOTE} leituras por lote` });

      // O usuário precisa ser o cuidador ou o idoso dessa pulseira
      const permitido = await this._service.usuarioTemAcesso(
        idUsuario,
        idPulseira,
      );
      if (!permitido)
        return res
          .status(403)
          .json({ message: "Você não tem acesso a esta pulseira" });

      const result = await this._service.criarLote(idPulseira, leituras);
      return res.status(200).json(result);
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({
        message: "Ocorreu um erro no servidor",
        errorMessage: message,
      });
    }
  };

  editar = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const { idPulseira, bpm, spo2 } = req.body;
      const editado = await this._service.editar(id, idPulseira, bpm, spo2);
      res.status(200).json({ editado });
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({
        message: "Ocorreu um erro no servidor",
        errorMessage: message,
      });
    }
  };

  deletar = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const deletado = await this._service.deletar(id);
      res.status(200).json({ deletado });
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({
        message: "Ocorreu um erro no servidor",
        errorMessage: message,
      });
    }
  };
}