import "dotenv/config";
import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  }
});

tweetSchema.statics.findByLogin = async function() {
  let tweet = await this.aggregate([{ $sample: { size: 1 } }]);

  // if (!tweet)

  return tweet;
};

const Tweet = mongoose.model("Tweet", tweetSchema);

export default Tweet;
