var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
var cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString () {
  return Math.random().toString();
};

app.get("/", (request, response) => {
  response.redirect('/urls');
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/hello", (request, response) => {
  response.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (request, response) => {
  let templateVars = {
    urls: urlDatabase,
    username: request.cookies["username"]
  };
  response.render("urls_index", templateVars);
});

app.get("/urls/new", (request, response) => {
  let templateVars = {
    username: request.cookies["username"]
  };
  response.render("urls_new", templateVars);
});

app.get("/urls/:id", (request, response) => {
  let shortURL = request.params.id;
  let longURL = urlDatabase[shortURL];
  let templateVars = {
    "shortURL": request.params.id,
    longURL: longURL,
    username: request.cookies["username"]
  };
  response.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (request, response) => {
  let shortURL = request.params.shortURL
  let longURL = urlDatabase[shortURL]
  response.redirect(longURL);
});

app.post("/urls", (request, response) => {
  let shortURL = generateRandomString();
  let longURL = request.body["longURL"];
  urlDatabase[shortURL] = longURL
  response.redirect("/urls/" + shortURL)
});

app.post("/urls/:id/delete", (request, response) => {
  let shortURL = request.params.id;
  delete urlDatabase[shortURL];
  response.redirect("/urls");
});

app.post("/urls/:id/update", (request, response) => {
  let shortURL = request.params.id;
  let longURL = request.body['longURL'];
  urlDatabase[shortURL] = longURL
  response.redirect("/urls");
});

app.post("/login", (request, response) => {
  let username = request.body['username'];
  response.cookie("username", username);
  response.redirect("/urls");
});

app.post("/logout", (request, response) => {
  response.clearCookie("username");
  response.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});