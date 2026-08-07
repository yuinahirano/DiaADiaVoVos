import { Idoso } from "../models/idoso.model";
import { IdosoRepository } from "../repository/idoso.repository";
import { TelefoneUtils } from "../utils/validarTelefone";
import { Pcd } from "../enums/pcd.enums";
import { UsuarioRepository } from "../repository/usuario.repository";

export class IdosoService {
  constructor(private _repository = new IdosoRepository(),
    private _usuarioRepository = new UsuarioRepository()
) {}

  async selecionarTodos() {
    return await this._repository.selecionarTodos();
  }

  async selecionarPorId(id: string) {
    return await this._repository.selecionarPorId(id);
  }

  async criar(
    tipoSanguineo: string,
    telefone: string,
    pcd: Pcd,
    idUsuario: string,
    idImagem?: string,
  ) {
    const idosoExistente = await this._usuarioRepository.selecionarPorId(idUsuario);
    if (!idosoExistente)
      throw new Error("Este usuário não existe");

    const idoso = Idoso.criar(tipoSanguineo, telefone, pcd, idUsuario, idImagem);

    return await this._repository.criar({
      tipoSanguineo: idoso.TipoSanguineo,
      telefone: TelefoneUtils.limpar(idoso.Telefone),
      pcd: idoso.Pcd,
      idImagem: idoso.IdImagem,
      idUsuario: idoso.IdUsuario,
    });
  }
  async editar(
    id:string,
    tipoSanguineo: string,
    telefone: string,
    pcd: Pcd,
    idUsuario: string,
    idImagem?: string,
  ) {
    const usuarioExistente = await this._usuarioRepository.selecionarPorId(idUsuario);
    if (!usuarioExistente)
      throw new Error("Usuario não encontrado");
    const idosoExistente = await this._repository.selecionarPorId(id);
    if (!idosoExistente)
      throw new Error("idoso não encontrado");

    const idoso = Idoso.editar(id, tipoSanguineo, telefone, pcd, idUsuario, idImagem);

    return await this._repository.editar(id, {
    tipoSanguineo: idoso.TipoSanguineo,
    telefone: TelefoneUtils.limpar(idoso.Telefone),
    pcd: idoso.Pcd,
    idImagem: idoso.IdImagem,
    idUsuario: idoso.IdUsuario,
    });
    
}
  async deletar(id: string) {
    const usuarioExistente = await this._repository.selecionarPorId(id);
    if (usuarioExistente.length === 0)
      throw new Error("Idoso não encontrado");

    return await this._repository.deletar(id);
  }
}