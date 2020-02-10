import "dotenv/config";
import express from "express";
import cors from "cors";
import Twitter from "twitter";
import { MongoClient } from "mongodb";
import { writeFile } from "fs";

import credentials from "../config";

import routes from "./routes";

const url = "mongodb://localhost:27017/mydb";

const app = express();

//Cross-origin resource sharing
app.use(cors());

//Parses the text as JSON and exposes the resulting object on req.body.
app.use(express.json());
//Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
//and exposes the resulting object (containing the keys and values) on req.body
app.use(express.urlencoded({ extended: true }));

app.listen(process.env.PORT, () =>
  console.log(`App listening on port ${process.env.PORT}!`)
);

app.get("/user/", (req, res) => {
  res.send("Hello World!");
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

//DB
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var myobj = [{ name: "John", address: "Highway 71" }];

  dbo.collection("customers").insertMany(myobj, function(err, res) {
    if (err) throw err;
    console.log("Number of documents inserted: " + res.insertedCount, res);
    db.close();
  });
});

//TWITTER
var T = new Twitter(credentials);

// Set up your search parameters
var params = {
  q: "#1917",
  count: 1,
  result_type: "recent",
  lang: "en",
  tweet_mode: "extended"
};

T.get("search/tweets", params, function(err, data, response) {
  if (err) {
  } else {
    writeFile("response.json", JSON.stringify(response), function(err) {
      if (err) {
        console.log(err);
      }
    });
    console.log(
      "Rate Limit Remaining: " + response.headers["x-rate-limit-remaining"],
      "Tweet: " + JSON.parse(response.body).statuses[0].full_text
    );
  }
});
