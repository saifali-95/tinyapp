const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const e = require("express");
const users ={};
const urlDatabase = {};

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
app.set("view engine", "ejs");

//Library will convert the request body from a Buffer into string that we can read.
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));


//Random Alphanumeric String Generator Function

const randomGenerator = function() {
  const alphanumericCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = 6;
  let randomString = "";
  
  //Will loop through 6 times and will pick elements randomly from alphanumericCharacters.
  for (let i = 0; i < charactersLength; i++) {
    const randomNumber = Math.floor(Math.random() * alphanumericCharacters.length);
    randomString += alphanumericCharacters[randomNumber];
    
  }  
  return randomString;
}

//Finding User by helping function

const getUserByEmail = function(email, database) {

  for (const id in database) {
    if (database[id]['email'] === email) {
      const user = database[id];
      return user;
    }
  }
  return false;
};


//Account Registration Verification Function

const registerVerification = function(req) {
  
  const existingEmail = req.body.email;
  const user = getUserByEmail(existingEmail, users);

  //Applied a conditions to check whether the user's email already exist or not 
  if(!user) {
    
    const id = randomGenerator();
    const email = req.body.email;
    const password =  req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    users[id] = {
      id: id,
      email: email !== "" ? email : null, //Applied a conditions to check whether email is an empty string or not
      password: password !== "" ? hashedPassword : null //Applied a conditions to check whether password is an empty string or not
    }
    
    if (users[id]['email'] === null || users[id]['password'] === null) {
      return false;
    }
    
    req.session.user_id = id;
  
    return true;
  }
  
  return false;

}

//Login Authentication Function

const loginAuthentication = function(req) {
  const loginEmail = req.body.email;
  const loginUser = getUserByEmail(loginEmail, users);
  const loginID = loginUser.id;
  const password =  req.body.password;
  const hashedPassword = loginUser['password'];
  
  if (loginUser && bcrypt.compareSync(password, hashedPassword)) {
    req.session.user_id = loginID;
    return true;
  }
  return false;
}


// Short URL Verification Function

const shortURLVerification = function(req) {
  for(const item in urlDatabase) {
    if (item === req.params.shortURL) {
      return true;
    }
  }
  return false;
}

// Return user specific URLS

const urlsForUser = function(id) {
  let usersURL = {};
  
  for(const url in urlDatabase){
    
    if(urlDatabase[url].userId === id) {
      usersURL[url] =  urlDatabase[url];
    }
  } 
  return usersURL;

}

app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  const templateVars = {'user': users[id]}
  
  if(!id) {
    res.render("login", templateVars);
  }
  else{
    res.render("urls_new", templateVars);
  }
  
  
});

app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.send("invalid shortURL");
    return;
  }

  if(id !== urlDatabase[req.params.shortURL]['userId']) {
    res.redirect('/login');
    return;
  }
  else {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], 'user': users[id]};
    res.render("urls_show", templateVars);
    return;
  }  
});

app.get("/urls", (req, res) => {
  const id = req.session.user_id
  const currentUser = urlsForUser(id);
  const templateVars = { urls: urlDatabase, 'user': users[id], currentUser : currentUser}
  

  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  
  res.json(urlDatabase);

});

app.get("/hello", (req, res) => {
  
  res.send("<html><body>Hello <b>World</b></body></html>\n");

});

app.get("/u/:shortURL", (req, res) => {
  if (!shortURLVerification(req)) {
    res.sendStatus('404');
  }
  else{
    const urlDatabaseLongUrl = urlDatabase[req.params.shortURL].longURL;

    //Redirect based on the shortURL from our urlDataBase;
    res.redirect(urlDatabaseLongUrl);
  }
});

//Redirecting to Registration Page

app.get("/register", (req, res) => {
  const id = req.session.user_id;
  const templateVars = {'user': users[id]}
  res.render("register", templateVars);

});

//Redirecting to Login Page

app.get("/login", (req, res) => {
  const id = req.session.user_id;
  const templateVars = {'user': users[id]}
  res.render("login", templateVars);

});


app.post("/urls", (req, res) => {
 
  const id = req.session.user_id;
  const newShortUrl = randomGenerator();
  
  urlDatabase[newShortUrl] = {longURL :req.body.longURL, userId : id};
  
  //Redirect to /urls/:shortURL, where shortURL is the random string we generated
  res.redirect(`/urls/${newShortUrl}`); 

});

//To delete the shortURL and longURL from the urlDataBase
app.post("/urls/:shortURL/delete", (req, res) => {
  const newShortUrl = req.params.shortURL;

  if(req.session.user_id === urlDatabase[newShortUrl]['userId']) {
    delete urlDatabase[newShortUrl];
    //Redirect to /urls/
    res.redirect('/urls/');
    return;
  }
  else{
    res.redirect('login');
  }

});

//Route to edit the longURL for the given shortURL

app.post("/urls/:id", (req, res) => {
  const newShortUrl = req.params.id;
  const newLongUrl = req.body.longURL;
  
  if (req.session.user_id === urlDatabase[newShortUrl]['userId']) {
    urlDatabase[newShortUrl].longURL = newLongUrl; 
    
    //Redirect to /urls/
    res.redirect('/urls/'); 
    return;
  }
  else {
    res.redirect('login');
  }
});

//Storing Username as a cookie

app.post("/login", (req, res) => {
  
  if(loginAuthentication(req, res)){
    res.redirect('/urls');
  }
  else {
   res.sendStatus(404);
  } 

});

//Logout Username by deleting the cookie

app.post("/logout", (req, res) => {
   
  //Destory as session;
  req.session = null;
  
  //Redirect to /urls/
  res.redirect("/urls/");

});

app.post("/register", (req, res) => {

  if (registerVerification(req, res)) { 

    //Redirect to /urls/    
    res.redirect("/urls/");
  }

  else {
    res.sendStatus(404);
  }
  
 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});







