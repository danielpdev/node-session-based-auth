const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const shortId = require('shortid');
const session = require('express-session');
const auth = require('./auth-routes');
const app = express();
const PORT = process.env.PORT || 4531 ;

const userModule = require('./models/');
mongoose.connect(process.ENV.MONGO_URL,{ useNewUrlParser: true }, (err, db) =>{
  
  if (err) {
      console.log("Couldn't connect to database");
    } else{
      console.log(`Connected To Database`);
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: false
}));

app.get('/', (req, res) => {
  res.send('Welcome to the Home of our APP');
})

app.use("/auth", auth.routes(userModule.user));

app.use((req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).send('Authrization failed! Please login');
  }
});

app.get('/protected', (req, res) => {
  res.send(`You are seeing this because you have a valid session.
    	Your username is ${req.session.user.username} 
        and email is ${req.session.user.email}.
    `)
});

app.listen(PORT, () => {
  console.log(`app running port ${PORT}`)
})
