import ImagemMedicamento, { IImagemMedicamento } from '../models/imagemMedicamento.model';

export class ImagemMedicamentoRepository {
  async criar(medicamentoId: string, base64: string, mimetype: string) {
    return await ImagemMedicamento.create({ medicamentoId, base64, mimetype });
  }

  async selecionarPorMedicamentoId(medicamentoId: string) {
    return await ImagemMedicamento.findOne({ medicamentoId });
  }

  async editar(medicamentoId: string, base64: string, mimetype: string) {
    return await ImagemMedicamento.findOneAndUpdate(
      { medicamentoId },
      { base64, mimetype },
      { new: true }
    );
  }

  async deletar(medicamentoId: string) {
    return await ImagemMedicamento.findOneAndDelete({ medicamentoId });
  }
}