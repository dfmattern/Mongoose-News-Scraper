//Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");

//Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

//Require al models
var db = require("./models");

var PORT = process.env.PORT || 3000;

//initialize express
var app = express();

//config middleware

//Log requests
app.use(logger("dev"));
//parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//make public a static folder
app.use(express.static("public"));

//Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
  })
);
app.set("view engine", "handlebars");

var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

//connect to Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);
mongoose.Promise = Promise;

//Routes
app.get("/", function(req,res){
  res.render("index");
});

//GET route for scraping
app.get("/scrape", function (req, res) {
  axios.get("https://www.npr.org/sections/news/").then(function (response) {
    var $ = cheerio.load(response.data);
//console.log(response);

    $("article h2").each(function (i, element) {
      var result = {};

      
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      

      db.Article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });
    });
    res.send("Scrape Complete");
  });
});

//GET route for all Articles from the db
app.get("/articles", function (req, res) {
  db.Article.find({ _id: req.params.id })

    .populate("Note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

//POST route for creating an Article in the db
app.post("/api/saved", function (req, res) {
  db.Article.create(req.body)
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

//GET route for grabbing a specific Article by id, populate it with it's note
app.get("articles/:id", function (req, res) {
  db.Article.find({ _id: req.params.id });

  populate("Note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

//Route for deleting article from db
app.delete("/saved/:id", function (req, res) {
  db.Article.deleteOne({ _id: req.params.id })
    .then(function (removed) {
      res.json(removed);
    })
    .catch(function (err, removed) {
      res.json(err);
    });
});

//Route for deleting a note
app.delete("/articles/:id", function (req, res) {
  db.Note.deleteOne({ _id: req.params.id })
    .then(function (removed) {
      res.json(removed);
    })
    .catch(function (err, removed) {
      res.json(err);
    });
});

//Route for saving/updaing an Article's associated note
app.post("/articles/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function (dbNote) {
      db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { set: { note: dbNote._id } },
        { new: true }
      )

        .then(function (dbArticle) {
          console.log(dbArticle);
          res.json(dbArticle);
        })
        .catch(function (err) {
          res.json(err);
        });
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.listen(PORT, function () {
  console.log("Listening on port " + PORT + ".");
});

module.exports = app;
