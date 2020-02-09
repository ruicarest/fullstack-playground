import { createServer } from "http";
import Twitter from "twitter";
import { MongoClient } from "mongodb";
import credentials from "../config";
import { writeFile } from "fs";

const url = "mongodb://localhost:27017/mydb";

const hostname = "127.0.0.1";
const port = 3000;

//WEBSITE
const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello World");
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
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
