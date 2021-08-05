const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser')
const users ={ NfVOt8: { id: 'NfVOt8', email: 'abc@abc.com', password: '123' } };

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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


app.use(cookieParser());
app.set("view engine", "ejs");


//Library will convert the request body from a Buffer into string that we can read.
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.get("/urls/new", (req, res) => {
  const id = req.cookies.user_id;
  const templateVars = {'user': users[id]}
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies.user_id;
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], 'user': users[id]};
  res.render("urls_show", templateVars);

});

app.get("/urls", (req, res) => {
  const id = req.cookies.user_id

  const templateVars = { urls: urlDatabase, 'user': users[id]}
  res.render("urls_index", templateVars);


});

app.get("/urls.json", (req, res) => {
  
  res.json(urlDatabase);

});

app.get("/hello", (req, res) => {
  
  res.send("<html><body>Hello <b>World</b></body></html>\n");

});

app.get("/u/:shortURL", (req, res) => {
  const longURL = req.params.shortURL;
  const urlDatabaseLongUrl = urlDatabase[longURL];
  
  //Redirect based on the shortURL from our urlDataBase;
  res.redirect(urlDatabaseLongUrl);

});

//Redirecting to registration page

app.get("/register", (req, res) => {
  const id = req.cookies.user_id;
  const templateVars = {'user': users[id]}
  res.render("register", templateVars);

});


app.post("/urls", (req, res) => {
  
  const newShortUrl = randomGenerator();
  urlDatabase[newShortUrl] = req.body.longURL; 

  //Redirect to /urls/:shortURL, where shortURL is the random string we generated
  res.redirect(`/urls/${newShortUrl}`); 

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
//let templateVars;

 for(const key in users){
    if (users[key]['email'] === req.body.user_email){
        res.cookie('user_id', key);
        //templateVars = {key: users[key]}
    }
  }

  //Redirect to /urls/
  res.redirect('/urls/'); 
});

//Logout Username by deleting the cookie

app.post("/logout", (req, res) => {
   
  res.clearCookie('user_id', req.body.user_id);
  //Redirect to /urls/
   res.redirect("/urls/")
});

app.post("/register", (req, res) => {

  const id = randomGenerator();
  users[id] = {
    id: id,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie('user_id', id);

  //Redirect to /urls/
  res.redirect("/urls/");
   
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//pass user object from the front end in the req.body;
//from that object, fetch the user ID and store it in the cookie.
//and let the user login




