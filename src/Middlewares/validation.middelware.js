import joi from "joi";
import { genderEnum } from "../DB/models/user.model.js";
import { Types } from "mongoose";
export const validation = (schema) => {
  return (req, res, next) => {
    const validationError = [];
    for (const key of Object.keys(schema)) {
      const validationResults = schema[key].validate(req[key], {
        abortEarly: false,
      });
      if (validationResults.error) {
        validationError.push({
          key,
          details: validationResults.error.details,
        });
      }
    }
    if (validationError.length)
      return res
        .status(400)
        .json({ message: "Validation Error", details: validationError });

    return next();
  };
};

export const generalFields = {
  firstName: joi.string().min(2).max(20).messages({
    "any.required": "First Name is Madatory",
    "string.min": "First Name length must be at least 2 characters long",
    "string.max": "First Name length must be at most 20 characters long",
  }),
  lastName: joi.string().min(2).max(20).messages({
    "any.required": "Last Name is Madatory",
    "string.min": "Last Name length must be at least 2 characters long",
    "string.max": "Last Name length must be at most 20 characters long",
  }),
  email: joi.string().email(),
  password: joi.string(),
  confirmPassword: joi.ref("password"),
  gender: joi
    .string()
    .valid(...Object.values(genderEnum))
    .default(genderEnum.MALE),
  phone: joi.string().pattern(new RegExp(/^01[0125]\d{8}$/)),
  otp: joi.string(),
  id: joi.string().custom((value, helper) => {
    return (
      Types.ObjectId.isValid(value) || helper.message("Invalid ObjectId Format")
    );
  }),
  file: {
    fieldname: joi.string(),
    originalname: joi.string(),
    encoding: joi.string(),
    mimetype: joi.string(),
    size: joi.number().positive(),
    path: joi.string(),
    destination: joi.string(),
    filename: joi.string(),
    finalPath: joi.string(),
  },
};
