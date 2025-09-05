import mongoose from "mongoose";
import User from "../models/userSchema.js";

const MONGODB_URL = process.env.MONGODB_URL;

async function cleanup() {
  await mongoose.connect(MONGODB_URL);

  console.log("Connected to DB");

  // Delete all users with null username
  await User.deleteMany({ username: null });

  console.log("Deleted users with null username");

  // Drop old username index
  try {
    await User.collection.dropIndex("username_1");
    console.log("Dropped old username index");
  } catch (err) {
    console.log("No old index to drop:", err.message);
  }

  // Recreate unique + sparse index
  await User.collection.createIndex({ username: 1 }, { unique: true, sparse: true });

  console.log("Created new sparse unique index on username");

  await mongoose.disconnect();
}

cleanup();
