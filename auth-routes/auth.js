var express = require('express');
const bcrypt = require('bcrypt');
const shortId = require('shortid');
const transporter = require('./../mailer');
var router = express.Router();
function init(User){
  
  router.post('/signup', (req, res) => {
    const { username, fullName, email, password } = req.body;
    const userData = {
      username, 
      password: bcrypt.hashSync(password, 5),
      fullName,
      email
    };
    const user = new User(userData);
    user.save(error=>{
      if(!error){
        return res.status(201).json('signup success');
      }else{
        if(error.code === 11000){
          return res.status(409).send("user allready exists");
        } else {
          console.log(JSON.stringify(error, null, 2));
          return res.status(500).send('error signing up user');
        }
      }
    });

  });
  
  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    User.findOne({username}, 'username email password', (error, userData) =>{
      if(error === null && username && password){
        console.log(JSON.stringify(userData, null, 2));
        const passwordCheck = bcrypt.compareSync(password, userData.password);
        if(passwordCheck){
          req.session.user = {
            email: userData.email,
            username: userData.username,
            id: userData._id
          };
          req.session.user.expires = new Date(
            Date.now() + 3 * 24 * 3600 * 1000
          );
          res.status(200).json("You are logged in, welcome");
        }else{
          res.status(401).json("incorrect password");
        }
      }else{
        res.status(401).json("invalid login credentials");
      }
    });
  }); 
  router.all('/logout', (req, res) => {
    delete req.session.user;
    req.session.destroy();
    res.status(200).send('logout successful');
  });
  
  router.post('/forgot', (req, res) => {
    let { email } = req.body;
    User.findOne( { email: email }, (error, userData) => {
      console.log("err, userData", error, userData);
      if(!error) {
        userData.passwordResetKey = shortId.generate();
        userData.passwordKeyExpires = new Date().getTime() + 20*60*1000; //20 minutes
        userData.save().then(error => {
          console.log("ERR ", error);
          if(error) {
            console.log(transporter)
            const mailer = transporter.transporter(email, userData.passwordResetKey);
            console.log(2, mailer);
             try {
              mailer((error, response) => {
                if (error) {
                  console.log("error:\n", error, "\n");
                  res.status(500).send("could not send reset code");
                } else {
                  console.log("email sent:\n", response);
                  res.status(200).send("Reset Code sent");
                }
              });
            } catch (error) {
              console.log(error);
              res.status(500).send("could not sent reset code");
            }
          }
        });
        console.log("HERERE");
      }
      res.status(400).send('email is incorrect');
    });
  });
  
  router.post('/resetpass', (req, res) => {
  let {resetKey, newPassword} = req.body
    User.find({passResetKey: resetKey}, (err, userData) => {
    	if (!err) {
        	let now = new Date().getTime();
            let keyExpiration = userDate.passwordKeyExpires;
            if (keyExpiration > now) {
                userData.password = bcrypt.hashSync(newPassword, 5);
                userData.passwordResetKey = null; // remove passResetKey from user's records
                userData.passwordKeyExpires = null; 
                userData.save().then(err => { // save the new changes
                	if (!err) {
                    	res.status(200).send('Password reset successful')
                    } else {
                    	res.status(500).send('error resetting your password')
                    }
                })
            } else {
            	res.status(400).send('Sorry, pass key has expired. Please initiate the request for a new one');
            }
        } else {
        	res.status(400).send('invalid pass key!');
        }
    })
  })  
  
  return router;
}

module.exports = init;
