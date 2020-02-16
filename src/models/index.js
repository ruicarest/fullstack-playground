import mongoose from "mongoose";

import Tweet from "./tweet";

const connectDb = () => {
  return mongoose.connect(process.env.DB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });
};

const disconnectDb = () => {
  console.log("MongoDb connection closing.");
  return mongoose.connection.close(() => {
    console.log("MongoDb connection closed.");
    process.exit(0);
  });
};

const models = { Tweet };

export { connectDb, disconnectDb };

export default models;
