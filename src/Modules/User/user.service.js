import * as dbService from "../../DB/dbService.js";
import UserModel, { roleEnum } from "../../DB/models/user.model.js";
import { asymmetricDecrypt } from "../../Utils/Encryption/encryption.utils.js";
import { cloudinaryConfig } from "../../Utils/multer/cloudinary.config.js";
import { successResponse } from "../../Utils/successResponse.utils.js";

export const listAllUsers = async (req, res, next) => {
  let users = await dbService.find({
    model: UserModel,
    populate: [{ path: "Messages" }],
  });
  return successResponse({
    res,
    statusCode: 200,
    message: "User Fetched Successfully",
    data: { users },
  });
};

export const updateProfile = async (req, res, next) => {
  const { firstName, lastName, gender } = req.body;
  const user = await dbService.findByIdAndUpdate({
    model: UserModel,
    id: req.user._id,
    data: { firstName, lastName, gender, $inc: { __v: 1 } },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "User Updated Successfully",
    data: { user },
  });
};

export const profileImage = async (req, res, next) => {
  const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(
    req.file.path,
    {
      folder: `Sara7aApp/Users/${req.user._id}`,
    }
  );
  const user = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: { _id: req.user._id },
    data: { profileCloudImage: { public_id, secure_url } },
  });

  if (req.user.profileCloudImage?.public_id) {
    await cloudinaryConfig().uploader.destroy(
      req.user.profileCloudImage.public_id
    );
  }
  return successResponse({
    res,
    statusCode: 200,
    message: "Image Updated Successfully",
    data: { user },
  });
};

export const coverImages = async (req, res, next) => {
  const attachmets = [];
  for (const file of req.files) {
    const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(
      file.path,
      {
        folder: `Sara7aApp/Users/${req.user._id}`,
      }
    );
    attachmets.push({ public_id, secure_url });
  }
  const user = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: { _id: req.user._id },
    data: {
      coverCloudImages: attachmets,
    },
  });
  return successResponse({
    res,
    statusCode: 200,
    message: "Cover Images Updated Successfully",
    data: { user },
  });
};

export const freezeAccount = async (req, res, next) => {
  const { userId } = req.params;
  if (userId && req.user.role !== roleEnum.ADMIN) {
    return next(new Error("You Are not authorized to freezed Account"));
  }

  const updatedUser = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: userId || req.user._id,
      freezedAt: { $exists: false },
    },
    data: {
      freezedAt: Date.now(),
      freezedBy: req.user._id,
    },
  });

  return updatedUser
    ? successResponse({
        res,
        statusCode: 200,
        message: "Profile Freezed Successfully",
        data: { user: updatedUser },
      })
    : next(new Error("Invalid Account"));
};

export const restoreAccount = async (req, res, next) => {
  const { userId } = req.params;

  const updatedUser = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: userId,
      freezedAt: { $exists: true },
      freezedBy: { $exists: true },
    },
    data: {
      $unset: {
        freezedAt: true,
        freezedBy: true,
      },
      restoredAt: Date.now(),
      restoredBy: req.user._id,
    },
  });

  return updatedUser
    ? successResponse({
        res,
        statusCode: 200,
        message: "Profile Retored Successfully",
        data: { user: updatedUser },
      })
    : next(new Error("Invalid Account"));
};
