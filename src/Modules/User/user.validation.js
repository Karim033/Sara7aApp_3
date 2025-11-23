import joi from "joi";
import { generalFields } from "../../Middlewares/validation.middelware.js";
import { fileValidation } from "../../Utils/multer/local.multer.js";

export const profileImgageSchema = {
  file: joi
    .object({
      fieldname: generalFields.file.fieldname.valid("profileImage").required(),
      originalname: generalFields.file.originalname.required(),
      mimetype: generalFields.file.mimetype
        .valid(...fileValidation.images)
        .required(),
      size: generalFields.file.size.max(5 * 1024 * 1024).required(),
      path: generalFields.file.path.required(),
      destination: generalFields.file.destination.required(),
      filename: generalFields.file.filename.required(),
      encoding: generalFields.file.encoding.required(),
      finalPath: generalFields.file.finalPath.required(),
    })
    .required(),
};

export const coverImagesSchema = {
  file: joi
    .object({
      fieldname: generalFields.file.fieldname.valid("coverImages").required(),
      originalname: generalFields.file.originalname.required(),
      mimetype: generalFields.file.mimetype
        .valid(...fileValidation.images)
        .required(),
      size: generalFields.file.size.max(5 * 1024 * 1024).required(),
      path: generalFields.file.path.required(),
      destination: generalFields.file.destination.required(),
      filename: generalFields.file.filename.required(),
      encoding: generalFields.file.encoding.required(),
      finalPath: generalFields.file.finalPath.required(),
    })
    .required(),
};

export const freezeAccountSchema = {
  params: joi.object({
    userId: generalFields.id,
  }),
};

export const restoreAccountSchema = {
  params: joi.object({
    userId: generalFields.id.required(),
  }),
};
