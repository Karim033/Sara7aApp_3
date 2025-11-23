import joi from "joi";
import { generalFields } from "../../Middlewares/validation.middelware.js";
export const sendMessageSchema = {
  body: joi.object({
    content: joi.string().min(2).max(500).required(),
  }),
  params: joi.object({
    receiverId: generalFields.id.required(),
  }),
};
