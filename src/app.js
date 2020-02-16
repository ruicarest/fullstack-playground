import "dotenv/config";
import express from "express";
import cors from "cors";
import Twitter from "twitter";
import { MongoClient } from "mongodb";
import { writeFile } from "fs";
import models, { connectDb, disconnectDb } from "./models";
import credentials from "../config";
import routes from "./routes";

const eraseDatabaseOnSync = true;
const app = express();
var T = new Twitter(credentials);
//Cross-origin resource sharing
app.use(cors());

//Parses the text as JSON and exposes the resulting object on req.body.
app.use(express.json());

//Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
//and exposes the resulting object (containing the keys and values) on req.body
app.use(express.urlencoded({ extended: true }));

connectDb().then(async () => {
  if (eraseDatabaseOnSync) {
    await Promise.all([models.Tweet.deleteMany({})]);
  }
  app.listen(process.env.PORT, () =>
    console.log(`App listening on port ${process.env.PORT}!`)
  );

  insertNewTweet("This was not taken from the DB");
});

const insertNewTweet = async (text, topic = "none") => {
  const newTweet = new models.Tweet({
    text: text,
    topic: topic
  });
  await newTweet.save();
};

app.get("/user/", (req, res) => {
  getTweets();
  console.log("Received GET /user/");
  res.send(JSON.stringify("Hello World!"));
});

//Create
app.post("/user/:userId", (req, res) => {
  return res.send("Received a POST HTTP method");
});

//Update
app.put("/", (req, res) => {
  return res.send("Received a PUT HTTP method");
});
app.delete("/", (req, res) => {
  return res.send("Received a DELETE HTTP method");
});

const getTweets = (topic = "#1917", howMany = 1) => {
  var params = {
    q: topic,
    count: howMany,
    result_type: "recent",
    lang: "en",
    tweet_mode: "extended"
  };

  //POPULATE DB WITH NEW TWEET
  T.get("search/tweets", params, function(err, data, response) {
    if (err) {
    } else {
      //save response for debugging purposes
      writeFile("response.json", JSON.stringify(response), function(err) {
        if (err) {
          console.log(err);
        }
      });

      let text = JSON.parse(response.body).statuses[0].full_text;
      let limitNumber = response.headers["x-rate-limit-remaining"];

      insertNewTweet(text, topic);
      //db.close();
    }
  });
};

//GET TWEET FROM DB
var GetDBTweet = () => {
  MongoClient.connect(
    process.env.DB_URL,
    { useUnifiedTopology: true },
    function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");
      dbo
        .collection("tweets")
        .find()
        .toArray()
        .then(() => {
          db.close();
        });
    }
  );
};

// Ask node to run your function before exit:
// This will handle kill commands, such as CTRL+C:
process.on("SIGINT", disconnectDb).on("SIGTERM", disconnectDb);
process.on("SIGKILL", disconnectDb);
