var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var PORT = process.env.PORT || 3003;
var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

//Connect to Mongo DB
mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true, useCreateIndex: true  });

//My finished route for scraping articles
app.get("/scrape", function(req, res) {
  axios.get("http://www.vice.com/en_us").then(function(response) {
    var $ = cheerio.load(response.data);
    $("a.grid__wrapper__card").each(function(i, element) {

      var result = {};

      result.title = $(this).children("div.grid__wrapper__card__text").children("div").children("h2.grid__wrapper__card__text__title").text();
      result.body = $(this).children("div.grid__wrapper__card__text").children("div").children("div.grid__wrapper__card__text__summary").text();
      result.link = "https://www.vice.com" + $(this).attr("href");
        
    db.article.create(result)
      .then(function(dbarticle) {
        console.log(dbarticle);
      })
      .catch(function(err) {
        console.log(err);
      });
    });

  res.send("Scrape Complete");
  // }).catch(err => {
  //   console.log(err);
  });
});

// My finished route for showing the json of saved articles
app.get("/articles", function(req, res) {
  db.article.find({})
    .then(function(dbarticle) {
      res.json(dbarticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbarticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
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
  db.note.create(req.body)
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

//My finished route to delete saved articles!
app.get('/clear', function(req, res){
	db.article.deleteMany({}, 
	   function(err){
		if(err) res.json(err);
		else res.redirect('/');
	});
});

// Get to the chopper
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});