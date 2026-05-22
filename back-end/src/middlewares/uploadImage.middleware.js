import createMulter from "../configs/upload.multer.js";

 const uploadImage = createMulter({
    pasta: 'imagens',
    tiposPermitidos: ['image/png', 'image/jpeg'],
    tamanhoArquivo: 10 * 1024 * 1024
}).single('imagem');

export default uploadImage;