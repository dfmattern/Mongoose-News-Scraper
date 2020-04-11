//dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");




//scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

var PORT = process.env.PORT || 3000;

//initialize express
var app = express();

//config middleware

//log requests
app.use(logger("dev"));
//parse request body as JSON
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
//make publis a static folder
app.use(express.static("public"));

//handlebars
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main"
    })
);
app.set("view engine", "handlebars");

var collection = "news-scraper";

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/" + collection;

//connect to Mongo DB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useFindAndModify: false
});

mongoose.Promise = Promise;
var db = mongoose.connection;

db.on("error", function (error){
    console.log("Mongoose Error: ", error);
    
});

db.once("open", function(){
    console.log("Mongoose connection to the " + collection + " collection successful!");
    
});

//routes
// require("./routes/apiRoutes")(app);
// require("./routes/htmlRoutes")(app);
// require("./routes/scraperRoutes")(app);

//display 404 error for unmatched routes
app.get("*", function (req,res){
    res.render("404");
});

app.listen(PORT, function (){
    console.log("Listening on port 3000.");
    
});

module.exports = app;




