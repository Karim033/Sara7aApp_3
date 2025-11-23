import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB Connected Suessfully");
  } catch (error) {
    console.log("MongoDB Connection Fail", error);
  }
};

export default connectDB;
