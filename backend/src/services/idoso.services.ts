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
<<<<<<< HEAD
    const idosoExistente = await this._usuarioRepository.selecionarPorId(idUsuario);
    if (!idosoExistente)
      throw new Error("Este usuário não existe");

=======
    const usuarioExistente = await this._usuarioRepository.selecionarPorId(idUsuario);
    if (usuarioExistente.length === 0)
      throw new Error("Este usuário não existe");

    if (usuarioExistente[0].idIdoso)
      throw new Error("Já existe um idoso cadastrado para este usuário");

>>>>>>> 6267fb6640d639d94f17324c76df5f279f3f574f
    const idoso = Idoso.criar(tipoSanguineo, telefone, pcd, idUsuario, idImagem);

    return await this._repository.criar({
      tipoSanguineo: idoso.TipoSanguineo,
      telefone: TelefoneUtils.limpar(idoso.Telefone),
      pcd: idoso.Pcd,
      idImagem: idoso.IdImagem,
      idUsuario: idoso.IdUsuario,
    });
  }
<<<<<<< HEAD
  async editar(
    id:string,
=======

  async editar(
    id: string,
>>>>>>> 6267fb6640d639d94f17324c76df5f279f3f574f
    tipoSanguineo: string,
    telefone: string,
    pcd: Pcd,
    idUsuario: string,
    idImagem?: string,
  ) {
    const usuarioExistente = await this._usuarioRepository.selecionarPorId(idUsuario);
<<<<<<< HEAD
    if (!usuarioExistente)
      throw new Error("Usuario não encontrado");
=======
    if (usuarioExistente.length === 0)
      throw new Error("Usuario não encontrado");

>>>>>>> 6267fb6640d639d94f17324c76df5f279f3f574f
    const idosoExistente = await this._repository.selecionarPorId(id);
    if (!idosoExistente)
      throw new Error("idoso não encontrado");

<<<<<<< HEAD
    const idoso = Idoso.editar(id, tipoSanguineo, telefone, pcd, idUsuario, idImagem);

    return await this._repository.editar(id, {
    tipoSanguineo: idoso.TipoSanguineo,
    telefone: TelefoneUtils.limpar(idoso.Telefone),
    pcd: idoso.Pcd,
    idImagem: idoso.IdImagem,
    idUsuario: idoso.IdUsuario,
    });
    
}
=======
    if (usuarioExistente[0].idIdoso && usuarioExistente[0].idIdoso !== id)
      throw new Error("Já existe um idoso cadastrado para este usuário");

    const idoso = Idoso.editar(id, tipoSanguineo, telefone, pcd, idUsuario, idImagem);

    return await this._repository.editar(id, {
      tipoSanguineo: idoso.TipoSanguineo,
      telefone: TelefoneUtils.limpar(idoso.Telefone),
      pcd: idoso.Pcd,
      idImagem: idoso.IdImagem,
      idUsuario: idoso.IdUsuario,
    });
  }

>>>>>>> 6267fb6640d639d94f17324c76df5f279f3f574f
  async deletar(id: string) {
    const usuarioExistente = await this._repository.selecionarPorId(id);
    if (usuarioExistente.length === 0)
      throw new Error("Idoso não encontrado");

    return await this._repository.deletar(id);
  }
}