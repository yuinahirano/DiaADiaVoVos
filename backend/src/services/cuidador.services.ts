import { Cuidador } from "../models/cuiador.model";
import { CuidadorRepository } from "../repository/cuidador.repository";
import { UsuarioRepository } from "../repository/usuario.repository";
import { TelefoneUtils } from "../utils/validarTelefone";

export class CuidadorService {
  constructor(private _repository = new CuidadorRepository(),
    private _usuarioRepository = new UsuarioRepository()
) {}

  async selecionarTodos() {
    return await this._repository.selecionarTodos();
  }

  async selecionarPorId(id: string) {
    return await this._repository.selecionarPorId(id);
  }

  async criar(
    telefone: string,
    idUsuario: string,
    idImagem?: string,
  ) {
    const cuiadorExistente = await this._usuarioRepository.selecionarPorId(idUsuario);
    if (!cuiadorExistente)
      throw new Error("Este usuário não existe");

    const cuiador = Cuidador.criar( telefone, idUsuario, idImagem);

    return await this._repository.criar({
      telefone: TelefoneUtils.limpar(cuiador.Telefone),
      idImagem: cuiador.IdImagem,
      idUsuario: cuiador.IdUsuario,
    });
  }
  async editar(
    id:string,
    telefone: string,
    idUsuario: string,
    idImagem?: string,
  ) {
    const cuiadorExistente = await this._repository.selecionarPorId(id);
    if (!cuiadorExistente)
      throw new Error("Cuidador não encontrado");

    const cuiador = Cuidador.editar(id, telefone, idUsuario, idImagem);

    return await this._repository.editar(id, {
    telefone: TelefoneUtils.limpar(cuiador.Telefone),
    idImagem: cuiador.IdImagem,
    idUsuario: cuiador.IdUsuario,
    });
    
}
  async deletar(id: string) {
    const usuarioExistente = await this._repository.selecionarPorId(id);
    if (usuarioExistente.length === 0)
      throw new Error("Cuiador não encontrado");

    return await this._repository.deletar(id);
  }
}