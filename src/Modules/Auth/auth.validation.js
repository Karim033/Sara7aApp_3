import joi from "joi";
import { generalFields } from "../../Middlewares/validation.middelware.js";
import { roleEnum } from "../../DB/models/user.model.js";

export const signupSchema = {
  body: joi.object({
    firstName: generalFields.firstName.required(),
    lastName: generalFields.lastName.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword,
    gender: generalFields.gender,
    phone: generalFields.phone,
    role: joi
      .string()
      .valid(...Object.values(roleEnum))
      .default(roleEnum.USER),
  }),
};

export const loginSchema = {
  body: joi.object({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
  }),
};

export const confirmEmailSchema = {
  body: joi.object({
    email: generalFields.email.required(),
    otp: generalFields.otp.required(),
  }),
};

export const forgetPasswordSchema = {
  body: joi.object({
    email: generalFields.email.required(),
  }),
};

export const resetPasswordSchema = {
  body: joi.object({
    email: generalFields.email.required(),
    otp: generalFields.otp.required(),
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword,
  }),
};

export const socialLoginSchema = {
  body: joi.object({
    idToken: joi.string().required(),
  }),
};
