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

  console.log("New tweet saved on DB: " + text);

  await newTweet.save();
};

const fetchNewTweet = async () => {
  let tweet = await models.Tweet.findTweet();
  console.log("Fetched new tweet: " + tweet);

  return tweet;
};

app.get("/user/", async (req, res) => {
  var p1 = new Promise(resolve => resolve(getTweetsFromTwitter()))
    .then(() => fetchNewTweet())
    .catch(error => console.log(error))
    .then(newTweet => {
      console.log("sent answer to GET/");
      res.send(JSON.stringify(newTweet));
    })
    .catch(error => console.log(error));
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

const getTweetsFromTwitter = (topic = "#1917", howMany = 3) => {
  var params = {
    q: topic,
    count: howMany,
    result_type: "recent",
    lang: "en",
    tweet_mode: "extended"
  };

  T.get("search/tweets", params, function(err, data, response) {
    if (err) {
    } else {
      //save response for debugging purposes
      writeFile("response.json", response.body, function(err) {
        if (err) {
          console.log(err);
        }
      });

      var limitNumber;
      for (let i = 0; i < params.count; i++) {
        let text = JSON.parse(response.body).statuses[i].full_text;
        limitNumber = response.headers["x-rate-limit-remaining"];

        //populate db with new tweet
        insertNewTweet(text, params.q);
        //db.close();
      }

      console.log("LimitNumber: " + limitNumber);
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
