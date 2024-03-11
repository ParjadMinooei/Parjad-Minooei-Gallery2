const express = require('express');
const exphbs  = require('express-handlebars');
const fs = require('fs');
const sessions = require('client-sessions');
const readline = require("linebyline");
const path = require("path");
const app = express();
const randomstring = require('randomstring');
const port = 3000;
const rl = readline("./images.txt");

app.engine(".hbs", exphbs.engine({											
  extname: ".hbs",                                                       
  defaultLayout: false,                                                  
  layoutsDir: path.join(__dirname, "./views")                              
}));
app.set('view engine', '.hbs');

let myRandomString = randomstring.generate(7);

app.use(sessions({
  secret: myRandomString,
  cookieName: 'session',
  duration: 24 * 60 * 60 * 1000,
  activeDuration: 1 * 60 * 1000,											
  httpOnly: true,                                                         
  secure: true,                                                        
  ephemeral: true
}));

let users = JSON.parse(fs.readFileSync('user.json', 'utf8'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('login');
});

app.post('/', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (!username || !password) {
    return res.render('login', { error: 'Username and password are required' });
  }

  if (!users[username]) {
    return res.render('login', { error: 'Not a registered username' });
  } else {
    if (password !== users[username]) {
      return res.render('login', { error: 'Invalid password' });
    } else {
      req.session.username = username;
      res.redirect('/main');
    }
  }
});


app.get('/gallery', (req, res) => {
  if (!req.session.username) {
    res.redirect('/');
  } else {
    res.render('viewData', { username: req.session.username });
  }
});

app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});

var textByLine = [];
let numArray;
var finalarr = [];

rl.on("line", (line, lineCount, byteCount) => {
  textByLine.push(line);
})
.on("error", (err) => {
  console.error(err);
})
.on("end", () =>{
numArray = textByLine.toString().split(",");
for (var i = 0; i < numArray.length; i++){
  var word = "";
  var finalword = "";
  word = numArray[i]
  for (var d = 0; d < word.length; d++){
      if (word[d] === "."){
          break;
        }
        else {
         finalword += word[d];
        }
      }
  finalarr.push(finalword); 
}
});

app.use(express.static('public'));

app.get("/main",express.urlencoded({ extended: true }), (req, res) => {
  if (!req.session.username) {
    res.redirect('/');
  } else {
    var imageList = [];
    var test = [];
    var result = "";
    var result2 = "";
    var passedVariable = req.session.image;
    if (passedVariable === undefined || passedVariable === null || passedVariable === `${undefined}` || passedVariable === 'undefined'){
      result = `./images/Waterfall.webp`;
      result2 = `Gallery`;
      
    }
    else {
      let rx = /\[(-?\d+)\]/;
      var num = 0;
      num = passedVariable.match(rx)[1];
      result = `./images/${textByLine[num]}`;
      result2 = finalarr[num];

    }
    var size = textByLine.length;
    for (var i =0; i < size; i++){
      imageList.push({src: `./images/${textByLine[i]}`, name:`${finalarr[i]}`});
    }
    var moreData = {
      number1: result
    };
    var someData = {
      number2: result2
    };
    res.render ('viewData', {
      username: req.session.username, 
      imageList:imageList,
      test:test,
      data1: moreData,
      data2: someData
    });
  }
});


app.post("/main",express.urlencoded({ extended: true }), (req, res) => {
  var test = req.body.images;
  req.session.image = test;
  res.redirect("/main");
});

app.use(function(req, res, next) {
  res.status(404).send("Sorry, we couldn't find that!");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});