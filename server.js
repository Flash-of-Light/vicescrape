var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var PORT = process.env.PORT || 3000;
var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

app.get("assets/vicelogo.png", function (req, res) {
    res.sendFile(path.join(__dirname, "assets/vicelogo.png"));
 });

app.get("/scrape", function(req, res) {
  axios.get("http://www.vice.com/en_us").then(function(response) {
    var $ = cheerio.load(response.data);
    // console.log($("div.grid__wrapper grd-row").children("a"));
    // Now, we grab every h2 within an article tag, and do the following:
    $("div.grid__wrapper").children("a").each(function(i, element) {
        console.log("For each function");
// console.log(i);
console.log($(element).text());
console.log($(element).attr("href"));
    //   var result = {};
    //   result.title = $(this)
    //     .children("a")
    //     .text();
    //   result.link = $(this)
    //     .children("a")
    //     .attr("href");

      // Create a new Article using the `result` object built from scraping
    //   db.article.create(result)
    //     .then(function(dbarticle) {
    //       // View the added result in the console
    //       console.log(dbarticle);
    //     })
    //     .catch(function(err) {
    //       // If an error occurred, log it
    //       console.log(err);
    //     });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  }).catch(err => {
      console.log(err);
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.article.find({})
    .then(function(dbarticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbarticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbarticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbarticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});