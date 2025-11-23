import { Router } from "express";
import * as userService from "./user.service.js";
import {
  authentication,
  authorization,
  tokenTypeEnum,
} from "../../Middlewares/auth.middleware.js";
import { validation } from "../../Middlewares/validation.middelware.js";
import {
  fileValidation,
  localFileUpload,
} from "../../Utils/multer/local.multer.js";
import {
  coverImagesSchema,
  freezeAccountSchema,
  profileImgageSchema,
  restoreAccountSchema,
} from "./user.validation.js";
import { cloudFileUpload } from "../../Utils/multer/cloud.multer.js";
import { roleEnum } from "../../DB/models/user.model.js";
const router = Router();

router.get("/", userService.listAllUsers);

router.patch(
  "/update",
  authentication({ tokenType: tokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [roleEnum.USER] }),
  userService.updateProfile
);

router.patch(
  "/profile-image",
  authentication,
  authorization({ accessRoles: [roleEnum.ADMIN] }),
  cloudFileUpload({ validation: [...fileValidation.images] }).single(
    "profileImage"
  ),
  userService.profileImage
);

router.patch(
  "/cover-images",
  authentication,
  cloudFileUpload({ validation: [...fileValidation.images] }).array(
    "coverImages",
    4
  ),
  userService.coverImages
);

router.delete(
  "{/:userId}/freeze-account",
  authentication({ tokenType: tokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [roleEnum.USER, roleEnum.ADMIN] }),
  validation(freezeAccountSchema),
  userService.freezeAccount
);

router.patch(
  "/:userId/restore-account",
  authentication({ tokenType: tokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [roleEnum.USER, roleEnum.ADMIN] }),
  validation(restoreAccountSchema),
  userService.restoreAccount
);

export default router;
