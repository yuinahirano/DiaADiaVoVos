import mongoose, { Schema, Document } from 'mongoose';

export interface IImagemMedicamento extends Document {
  medicamentoId: string; 
  base64: string;
  mimetype: string;
  criadoEm: Date;
}

const ImagemSchema = new Schema<IImagemMedicamento>({
  medicamentoId: { type: String, required: true, unique: true },
  base64:        { type: String, required: true },
  mimetype:      { type: String, required: true },
  criadoEm:      { type: Date, default: Date.now },
});

export default mongoose.model<IImagemMedicamento>('ImagemMedicamento', ImagemSchema);