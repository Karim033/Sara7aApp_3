import UserModel, {
  genderEnum,
  providerEnum,
} from "../../DB/models/user.model.js";
import { successResponse } from "../../Utils/successResponse.utils.js";
import * as dbService from "../../DB/dbService.js";
import { asymmetricEncrypt } from "../../Utils/Encryption/encryption.utils.js";
import { compare, hash } from "../../Utils/Hashing/hashing.utils.js";
import { eventEmitter } from "../../Utils/Events/email.event.utils.js";
import { customAlphabet } from "nanoid";
import {
  generateToken,
  getNewLoginCredientials,
  verifyToken,
} from "../../Utils/tokens/token.utils.js";
import { v4 as uuid } from "uuid";
import TokenModel from "../../DB/models/token.model.js";
import { OAuth2Client } from "google-auth-library";

export const signup = async (req, res, next) => {
  const { firstName, lastName, email, password, gender, phone, role } =
    req.body;

  const checkUser = await dbService.findOne({
    model: UserModel,
    filter: { email },
  });
  if (checkUser) return next(new Error("User Already Exists", { cause: 409 }));
  const otp = customAlphabet("0123456789qwertyuioplkjhgfdsa", 6)();
  const user = await dbService.create({
    model: UserModel,
    data: [
      {
        firstName,
        lastName,
        email,
        password: await hash({ plaintext: password }),
        phone: asymmetricEncrypt(phone),
        confirmEmailOTP: await hash({ plaintext: otp }),
        gender,
        role,
      },
    ],
  });
  eventEmitter.emit("confirmEmail", { to: email, otp, firstName });

  return successResponse({
    res,
    statusCode: 201,
    message: "User Created Successfully",
    data: { user },
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const checkUser = await dbService.findOne({
    model: UserModel,
    filter: { email, freezedAt: { $exists: false } },
  });
  if (!checkUser) return next(new Error("User Not Found", { cause: 404 }));

  if (!(await compare({ plaintext: password, hash: checkUser.password })))
    return next(new Error("Invalid Email or Password", { cause: 400 }));

  if (!checkUser.confirmEmail)
    return next(new Error("Confirm Your Email", { cause: 400 }));

  const creidentials = await getNewLoginCredientials(checkUser);

  return successResponse({
    res,
    statusCode: 200,
    message: "User LoggedIn Successfully",
    data: { creidentials },
  });
};

export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;
  const checkUser = await dbService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOTP: { $exists: true },
    },
  });
  if (!checkUser)
    return next(
      new Error("User Not Found or email already confirmed", { cause: 404 })
    );

  if (!(await compare({ plaintext: otp, hash: checkUser.confirmEmailOTP })))
    return next(new Error("Invalid OTP", { cause: 400 }));

  await dbService.updateOne({
    model: UserModel,
    filter: { email },
    data: {
      confirmEmail: Date.now(),
      $unset: { confirmEmailOTP: true },
      $inc: { __v: 1 },
    },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Email Confirmed Successfully",
  });
};

export const logout = async (req, res, next) => {
  await dbService.create({
    model: TokenModel,
    data: [
      {
        jwtid: req.decoded.jti,
        expiresIn: new Date(req.decoded.exp * 1000),
        userId: req.user._id,
      },
    ],
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Logged out Successfully",
  });
};

export const refreshToken = async (req, res, next) => {
  const user = req.user;

  const creidentials = await getNewLoginCredientials(user);

  return successResponse({
    res,
    statusCode: 200,
    message: "Token Refeshed Successfully",
    data: { creidentials },
  });
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  const otp = await customAlphabet("0123456789zxcvbnm", 6)();
  const hashOTP = await hash({ plaintext: otp });
  const user = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      freezedAt: { $exists: false },
    },
    data: {
      forgetPasswordOTP: hashOTP,
    },
  });
  if (!user)
    return next(
      new Error("User Not Found or email not confirmed", { cause: 404 })
    );

  eventEmitter.emit("forgetPassword", {
    to: email,
    firstName: user.firstName,
    otp,
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Check Your Box",
  });
};

export const resetPassword = async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await dbService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      freezedAt: { $exists: false },
    },
  });
  if (!user) return next(new Error("INvalid-Account", { cause: 404 }));

  if (!(await compare({ plaintext: otp, hash: user.forgetPasswordOTP })))
    return next(new Error("Invalid OTP", { cause: 400 }));

  await dbService.updateOne({
    model: UserModel,
    filter: { email },
    data: {
      password: await hash({ plaintext: password }),
      $unset: { forgetPasswordOTP: true },
      $inc: { __v: 1 },
    },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Password Reset Successfully",
  });
};

async function verifyGoogleAccount({ idToken }) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

export const loginWithGmail = async (req, res, next) => {
  const { idToken } = req.body;

  const { email, email_verified, given_name, family_name } =
    await verifyGoogleAccount({ idToken });

  if (!email_verified)
    return next(new Error("Email Not Verfied", { cause: 401 }));

  const user = await dbService.findOne({
    model: UserModel,
    filter: { email, freezedAt: { $exists: false } },
  });
  if (user) {
    if (user.providers === providerEnum.GOOGLE) {
      const creidentials = await getNewLoginCredientials(user);

      return successResponse({
        res,
        statusCode: 200,
        message: "Login Successfully",
        data: { creidentials },
      });
    }
  }

  const newUser = await dbService.create({
    model: UserModel,
    data: [
      {
        firstName: given_name,
        lastName: family_name,
        email,
        confirmEmail: Date.now(),
        providers: providerEnum.GOOGLE,
      },
    ],
  });

  const creidentials = await getNewLoginCredientials(newUser);

  return successResponse({
    res,
    statusCode: 200,
    message: "Login Successfully",
    data: { creidentials },
  });
};
