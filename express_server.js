var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
var cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "user1": {
    id: "user1",
    email: "user@example.com",
    password: "1234"
  },
 "user2": {
    id: "user2",
    email: "user2@example.com",
    password: "dishwasher-funk"
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

function generateRandomId () {
  return Math.random().toString(36).substring(7);
}

function generateRandomString () {
  return Math.random().toString(36).substring(7);
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
  let user = findUser(request.cookies["userId"])
  let templateVars = {
    urls: urlDatabase,
    user: user
  };
  console.log(user);
  response.render("urls_index", templateVars);
});

app.get("/urls/new", (request, response) => {
  let user = findUser(request.cookies.userId)
  let templateVars = {
     user: user
  }
  response.render("urls_new", templateVars);
});

app.get("/urls/:id", (request, response) => {
  let shortURL = request.params.id;
  let longURL = urlDatabase[shortURL];
  let templateVars = {
    "shortURL": request.params.id,
    longURL: longURL,
    user_id: request.cookies[userId]
  };
  response.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (request, response) => {
  let shortURL = request.params.shortURL
  let longURL = urlDatabase[shortURL]
  response.redirect(longURL);
});

app.get("/registration", (request, response) => {
  let templateVars = {
    user_id: request.cookies.userId
  }
  response.render("registration", templateVars);
});


app.get("/login", (request, response) => {
  let user = findUser(request.cookies.userId || undefined)
  let templateVars = {
     user: user
  }
  response.render("login", templateVars);
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

  let userEmail = request.body.email
  let userPassword = request.body.password

  if (userEmail && userPassword) {
    let user = findUserByEmail(userEmail);
    if (user) {
      if (user.password == userPassword) {
        response.cookie('userId', user.id);
        response.redirect("/");
        } else {
          response.status(403).send('Invalid Password');
        }
      } else {
        response.status(403).send('User does not exist!');
      }
    } else {
      response.status(403).send('Invalid Email or Password');
    }
  });

app.post("/logout", (request, response) => {
  response.clearCookie("userId");
  response.redirect("/urls");
});

app.post("/registration", (request, response) => {
  let userId = generateRandomId();
  let userEmail = request.body.email;
  let userPassword = request.body.password;

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
    password: userPassword
  };
  response.cookie('userId', userId);
  response.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});