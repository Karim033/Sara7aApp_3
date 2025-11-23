import * as dbService from "../DB/dbService.js";
import TokenModel from "../DB/models/token.model.js";
import UserModel from "../DB/models/user.model.js";
import { getSignature, verifyToken } from "../Utils/tokens/token.utils.js";

export const tokenTypeEnum = {
  ACCESS: "ACCESS",
  REFRESH: "REFRESH",
};

const decodedToken = async ({
  authorization,
  tokenType = tokenTypeEnum.ACCESS,
  next,
} = {}) => {
  const [Bearer, token] = authorization.split(" ") || [];

  if (!Bearer || !token) return next("Invalid Token", { cause: 400 });
  let signauters = await getSignature({ signatureLevel: Bearer });

  const decoded = verifyToken({
    token,
    secretKey:
      tokenType === tokenTypeEnum.ACCESS
        ? signauters.accessSignature
        : signauters.refershSignature,
  });

  if (!decoded.jti) return next(new Error("Invalid Token", { cause: 401 }));

  const revokedToken = await dbService.findOne({
    model: TokenModel,
    filter: { jwtid: decoded.jti },
  });
  if (revokedToken) return next(new Error("Token is Revoked ", { cause: 401 }));
  const user = await dbService.findById({
    model: UserModel,
    id: decoded.id,
  });
  if (!user) return next(new Error("Not Registered Account", { cause: 404 }));

  return { user, decoded };
};

export const authentication = ({ tokenType = tokenTypeEnum.ACCESS } = {}) => {
  return async (req, res, next) => {
    const { user, decoded } =
      (await decodedToken({
        authorization: req.headers.authorization,
        tokenType,
        next,
      })) || {};
    req.user = user;
    req.decoded = decoded;
    return next();
  };
};

export const authorization = ({ accessRoles = [] } = {}) => {
  return (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      return next(new Error("Unauthorized Access", { cause: 403 }));
    }
    return next();
  };
};
