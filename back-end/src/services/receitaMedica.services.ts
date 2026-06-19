import { ReceitaMedica } from "../models/receitaMedica.model";
import { ReceitaMedicaRepository } from "../repository/receitaMedica.repository";
import { ConsultaRepository } from "../repository/consulta.repository";

export class ReceitaMedicaService {
  constructor(
    private _repository = new ReceitaMedicaRepository(),
    private _consultaRepository = new ConsultaRepository(),
  ) {}

  async selecionarTodos() {
    return await this._repository.selecionarTodos();
  }

  async selecionarPorId(id: string) {
    return await this._repository.selecionarPorId(id);
  }

  async criar(
    idConsulta: string,
    descricao: string,
    dataEmissao: string,
    dataVencimento?: string,
  ) {
    const receita = ReceitaMedica.criar(
      idConsulta,
      descricao,
      dataEmissao,
      dataVencimento,
    );
    return await this._repository.criar({
        descricao: receita.Descricao,
        dataEmissao: receita.DataEmissao,
        dataVencimento: receita.DataVencimento,
        idConsulta: receita.IdConsulta,
    });
  }
  async editar(
      descricao: string,
      dataEmissao: string,
      idConsulta: string,
      id: string,
      dataVencimento?: string,
  ) {
    console.log(descricao, dataEmissao, idConsulta, id, dataVencimento);
    
    const consultaExistente =
      await this._consultaRepository.selecionarPorId(idConsulta);
    if (consultaExistente.length === 0)
      throw new Error("Consulta não encontrado");
    const receitaExistente = await this._repository.selecionarPorId(id);
    if (receitaExistente.length === 0)
      throw new Error("Receita não encontrada");

const receita = ReceitaMedica.editar(
  id,
  idConsulta,
  descricao,
  dataEmissao,
  dataVencimento,
);
    return await this._repository.editar(id, {
        descricao: receita.Descricao,
        dataEmissao: receita.DataEmissao,
        dataVencimento: receita.DataVencimento,
        idConsulta: receita.IdConsulta,
    });
  }
  async deletar(id: string) {
    const receitaExistente = await this._repository.selecionarPorId(id);
    if (receitaExistente.length === 0)
      throw new Error("receita não encontrada");
    return await this._repository.deletar(id);
  }
}
