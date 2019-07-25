// Parses our HTML and helps us find elements
const cheerio = require("cheerio");
// Makes HTTP request for HTML page
const axios = require("axios");

// First, tell the console what server.js is doing
console.log("\n***********************************\n" +
    "Grabbing every thread name and link\n" +
    "from Into the Gloss:" +
    "\n***********************************\n");

// Making a request via axios for reddit's "webdev" board. The page's HTML is passed as the callback's third argument
axios.get("https://intothegloss.com/").then(function (response) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(response.data);

    // An empty array to save the data that we'll scrape
    var results = [];

    // With cheerio, find each p-tag with the "title" class
    // (i: iterator. element: the current element)
    $("p.m-posts-item-intro").each(function (i, element) {

        // Save the text of the element in a "title" variable
        var title = $(element).text();

        // In the currently selected element, look at its child elements (i.e., its a-tags),
        // then save the values for any "href" attributes that the child elements may have
        var link = $(element).children().attr("href");

        // Save these results in an object that we'll push into the results array we defined earlier
        results.push({
            title: title,
            link: link
        });
    });

    // Log the results once you've looped through each of the elements found with cheerio
    console.log(results);
});