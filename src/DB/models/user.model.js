import mongoose from "mongoose";

export const genderEnum = {
  MALE: "MALE",
  FEMALE: "FEMALE",
};

export const providerEnum = {
  SYSTEM: "SYSTEM",
  GOOGLE: "GOOGLE",
};

export const roleEnum = {
  USER: "USER",
  ADMIN: "ADMIN",
};

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: [2, "First Name must be at least 2 characters long"],
      maxLength: [20, "First Name must be at most 20 characters long"],
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minLength: [2, "First Name must be at least 2 characters long"],
      maxLength: [20, "First Name must be at most 20 characters long"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return providerEnum.GOOGLE ? false : true;
      },
    },
    gender: {
      type: String,
      enum: {
        values: Object.values(genderEnum),
        message: "{VALUE} is not a valid gender",
      },
      default: genderEnum.MALE,
    },
    providers: {
      type: String,
      enum: {
        values: Object.values(providerEnum),
        message: "{VALUE} is not a valid gender",
      },
      default: providerEnum.SYSTEM,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(roleEnum),
        message: "{VALUE} is not a valid role",
      },
      default: roleEnum.USER,
    },
    profileImage: String,
    coverImages: [String],
    profileCloudImage: {
      public_id: String,
      secure_url: String,
    },
    coverCloudImages: [
      {
        public_id: String,
        secure_url: String,
      },
    ],
    freezedAt: Date,
    freezedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restoredAt: Date,
    restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    phone: String,
    confirmEmail: Date,
    confirmEmailOTP: String,
    forgetPasswordOTP: String,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.virtual("Messages", {
  localField: "_id",
  foreignField: "receiverId",
  ref: "Message",
});

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

export default UserModel;
