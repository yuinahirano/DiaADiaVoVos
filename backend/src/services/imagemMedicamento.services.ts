import { ImagemMedicamentoRepository } from '../repository/imagemMedicamento.repository';

export class ImagemMedicamentoService {
  constructor(private _repository = new ImagemMedicamentoRepository()) {}

  async criar(medicamentoId: string, file: Express.Multer.File) {
    const base64 = file.buffer.toString('base64');
    return await this._repository.criar(medicamentoId, base64, file.mimetype);
  }

  async buscar(medicamentoId: string) {
    const imagem = await this._repository.selecionarPorMedicamentoId(medicamentoId);
    if (!imagem) throw new Error('Imagem não encontrada');
    return imagem;
  }

  async editar(medicamentoId: string, file: Express.Multer.File) {
    const base64 = file.buffer.toString('base64');
    return await this._repository.editar(medicamentoId, base64, file.mimetype);
  }

  async deletar(medicamentoId: string) {
    return await this._repository.deletar(medicamentoId);
  }
}