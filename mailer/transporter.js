const nodemailer = require('nodemailer');
const mailOptions = require('./mail-options');

function initMail(email, passResetKey) {
  
  let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    auth: {
      user: '', // your gmail address
      pass: '' // your gmail password
    }
  });

  function sendMail(callback){
    try {
      transporter.sendMail(mailOptions(email, passResetKey), callback);
    } catch (error) {
      throw error;
    }
  }
  
  return sendMail;
}

module.exports = initMail;