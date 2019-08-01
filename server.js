// requiring all the packages we will be using
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var logger = require("morgan");

var express = require("express");
var app = express(); // start express

var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultlayout: "main" }) //handlebars
);
app.set("view engine", "handlebars");

mongoose.connect("mongodb://localhost/scrapehw", { useNewUrlParser: true }); // mongo connection
var db = mongoose.connection;

db.on("error", console.log.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Connected to Mongoose!")
});

var port = process.env.PORT || 3000; //setting up port
app.listen(port, () => {
    console.log(`Listening on PORT ${port}`);
});

app.use(logger("dev")); //using morgan
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

app.use(express.static(process.cwd() + "/public"));

//<link rel="shortcut icon" href="about:blank"></link>


