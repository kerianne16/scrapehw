// requiring all the packages we will be using
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const logger = require("morgan");

const express = require("express");
const app = express(); // start express

const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultlayout: "main" }) //handlebars
);
app.set("view engine", "handlebars");

mongoose.connect("mongodb://localhost/scrapehw", { useNewUrlParser: true }); // mongo connection
const db = mongoose.connection;

db.on("error", console.log.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Connected to Mongoose!")
});

const port = process.env.PORT || 3000; //setting up port
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