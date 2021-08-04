const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser')

app.use(cookieParser());
app.set("view engine", "ejs");


//Library will convert the request body from a Buffer into string that we can read.
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls/new", (req, res) => {
  
  const templateVars = {username: req.cookies.username}
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies.username};
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {

  const templateVars = { urls: urlDatabase, username: req.cookies.username}
  
  res.render("urls_index", templateVars);


});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  
  const newShortUrl = randomGenerator();
  urlDatabase[newShortUrl] = req.body.longURL; 

  //Redirect to /urls/:shortURL, where shortURL is the random string we generated
  res.redirect(`/urls/${newShortUrl}`); 
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = req.params.shortURL;
  const urlDatabaseLongUrl = urlDatabase[longURL];
  
  //Redirect based on the shortURL from our urlDataBase;
  res.redirect(urlDatabaseLongUrl);

});

//To delete the shortURL and longURL from the urlDataBase
app.post("/urls/:shortURL/delete", (req, res) => {
  const newShortUrl = req.params.shortURL;
  delete urlDatabase[newShortUrl];

  //Redirect to /urls/
  res.redirect('/urls/'); 
});

//Route to edit the longURL for the given shortURL

app.post("/urls/:id", (req, res) => {
  const newShortUrl = req.params.id;
  const newLongUrl = req.body.longURL;
  urlDatabase[newShortUrl] = newLongUrl; 
  
  //Redirect to /urls/
  res.redirect('/urls/'); 
});

//Storing Username as a cookie

app.post("/login", (req, res) => {

  res.cookie('username', req.body.username);
  
  const cookie = {'username': req.body.username};  
    //Redirect to /urls/
  res.redirect('/urls/'); 
});

//Logout Username by deleting the cookie

app.post("/logout", (req, res) => {
   
  res.clearCookie('username', req.body.username);
  //Redirect to /urls/
   res.redirect("/urls/")
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//Random Alphanumeric String Generator Function

function randomGenerator() {
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


