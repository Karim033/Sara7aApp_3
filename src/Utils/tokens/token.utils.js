import jwt from "jsonwebtoken";
import { roleEnum } from "../../DB/models/user.model.js";
import { v4 as uuid } from "uuid";
export const signatureEnum = {
  ADMIN: "ADMIN",
  USER: "USER",
};

export const generateToken = ({
  payload,
  secretKey = process.env.TOKEN_ACCESS_SECRET,
  options = { exipiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN },
}) => {
  return jwt.sign(payload, secretKey, options);
};

export const verifyToken = ({
  token,
  secretKey = process.env.TOKEN_ACCESS_SECRET,
}) => {
  return jwt.verify(token, secretKey);
};

export const getSignature = async ({ signatureLevel = signatureEnum.USER }) => {
  let signatures = { accessSignature: undefined, refershSignature: undefined };

  switch (signatureLevel) {
    case signatureEnum.ADMIN:
      signatures.accessSignature = process.env.TOKEN_ACCESS_ADMIN_SECRET;
      signatures.refershSignature = process.env.TOKEN_REFRESH_ADMIN_SECRET;
      break;
    default:
      signatures.accessSignature = process.env.TOKEN_ACCESS_USER_SECRET;
      signatures.refershSignature = process.env.TOKEN_REFRESH_USER_SECRET;
      break;
  }

  return signatures;
};

export const getNewLoginCredientials = async (user) => {
  const signatures = await getSignature({
    signatureLevel:
      user.role != roleEnum.USER ? signatureEnum.ADMIN : signatureEnum.USER,
  });

  const jwtid = uuid();

  const accessToken = generateToken({
    payload: { id: user._id, email: user.email },
    secretKey: signatures.accessSignature,
    options: {
      expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN),
      jwtid,
    },
  });

  const refreshToken = generateToken({
    payload: { id: user._id, email: user.email },
    secretKey: signatures.refershSignature,
    options: {
      expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN),
      jwtid,
    },
  });

  return { accessToken, refreshToken };
};
