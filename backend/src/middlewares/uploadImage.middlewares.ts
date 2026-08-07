import createMulter from "../config/multer.config";

const uploadImage = createMulter({
  folder: "Images",
  allowedTypes: ["image/jpeg", "image/png"],
  fileSize: 10 * 1024 * 1024,
}).single("image");

export default uploadImage;