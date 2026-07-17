import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/kwickDocs`);
    console.log("Connected to MongoDB ✅");
  } catch (error) {
    console.log(error.message);
  }
};

export default connectDB;
