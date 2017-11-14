var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
var cookieSession = require('cookie-session');

const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['test'],

}));



const urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userId: "user1"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userId: "user1"
  }
};

const users = {
  "user1": {
    id: "user1",
    email: "user@example.com",
    password: "$2a$10$5qYQU42CDwNl6bP8ljy4UuUXOVUh6tbyv/ArWfZACKCMKJYCthq5S"
    //password: "1234"
  },
 "user2": {
    id: "user2",
    email: "user2@example.com",
    password: "1111"
  }
}

function findUser (userId) {
  return users[userId];
}

function findUserByEmail (email) {
  for (let user_id in users) {
    if (users[user_id].email === email) {
      return users[user_id];
    }
  }
}

function findUserURLs (userId) {
  const output = {};

  for (let key in urlDatabase) {
    if(userId === urlDatabase[key].userId){
      output[key] = urlDatabase[key].url;
    }

  }
  return output;
}

function generateRandomId () {
  return Math.random().toString(36).substring(7);
}

function generateRandomString () {
  return Math.random().toString(36).substring(7);
};

app.get("/", (request, response) => {
  const hashedPassword = bcrypt.hashSync("1111", 10);
  response.redirect('/urls');
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/hello", (request, response) => {
  response.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (request, response) => {


  let userSession = request.session.user_id;
  if(userSession){
    let user = findUser(request.session.user_id);
    let urls = findUserURLs(user.id);
    let templateVars = {
      urls: urls,
      user: user
    };

    response.render("urls_index", templateVars);
  } else {
    response.redirect('/login');
  }

});

app.get("/urls/new", (request, response) => {
  let user = findUser(request.session.userId);
  let userEmail = findUserByEmail(request.body.email);
  let templateVars = {
     user: user
  }
  if (!user && !userEmail) {
    response.redirect("/registration");
  }
  response.render("urls_new", templateVars);

});

app.get("/urls/:id", (request, response) => {
  let shortURL = request.params.id;
  let longURL = urlDatabase[shortURL];
  let templateVars = {
    "shortURL": request.params.id,
    longURL: longURL,
    user: users[request.session.userId],
    user_id: request.session.userId
  };
  response.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (request, response) => {
  let shortURL = request.params.shortURL
  let longURL = urlDatabase[shortURL].url
  response.redirect(longURL);
});

app.get("/registration", (request, response) => {
  let templateVars = {

    user_id: request.session.userId
  }
  response.render("registration", templateVars);
});


app.get("/login", (request, response) => {
  let user = findUser(request.session.userId || undefined)
  let templateVars = {
     user: user
  }
  response.render("login", templateVars);
});

app.post("/urls", (request, response) => {
  let shortURL = generateRandomString();
  let longURL = request.body["longURL"];
  urlDatabase[shortURL] = {
    url: longURL,
    userId: request.session.userId
  }
  response.redirect("/urls/" + shortURL)
});

app.post("/urls/:id/delete", (request, response) => {
  let shortURL = request.params.id;
  if (urlDatabase[shortURL].url === request.session.userId) {
    delete urlDatabase[shortURL];
    response.redirect("/urls");
  } else {
    return response.send(403, "You do not own this!");
  }

});

app.post("/urls/:id/update", (request, response) => {
  let shortURL = request.params.id;
  let longURL = request.body['longURL'];

  if (urlDatabase[shortURL].url === request.session.userId) {
     urlDatabase[shortURL];
  } else {
    return response.send(403, "Update complete!");

  } response.redirect("/");



  response.redirect("/urls");
});

app.post("/login", (request, response) => {

  let userEmail = request.body.email
  let userPassword = request.body.password
  let user = findUserByEmail(userEmail);

  if(user){

    if(bcrypt.compareSync(userPassword , user.password)){
      request.session.user_id = user.id;

      response.redirect("/urls");

    } else {
      response.status(403).send('Invalid Password');
    }

  } else {
    response.status(403).send('User does not exist!');
  }
});

app.post("/logout", (request, response) => {

  request.session = null;
  response.redirect("/login");

});

app.post("/registration", (request, response) => {
  let userId = generateRandomId();
  let userEmail = request.body.email;
  let userPassword = request.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);

  if(userEmail == '' || userPassword == '') {
    response.status(400).send('Bad Request');
    return;
  }

  for (let keyId in users) {
    let user = users[keyId];

    if(user.email == userEmail) {
      response.status(400).send('Email already exists!')
      return;
    }
  };

  users[userId] = {
    id: userId,
    email: userEmail,
    password: hashedPassword
  };
  request.session.userId = userId;


  response.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});