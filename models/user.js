const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
  fullName:{
    type: String,
    required: true,
    trim: true
  },
  username :{
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true
  },
  password:{
    type: String,
    required: true
  },
  passwordResetKey: String,
  passwordKeyExpires: Number,
  createdAt: {
    type:Date,
    required: false
  },
  updatedAt: {
    type: Number,
    required: false
  }
}, {runSettersOnQuery: true});

userSchema.pre('save', function(next){
  this.email = this.email.toLowerCase();
  const currentDate = new Date().getTime();
  this.updatedAt = currentDate;
  console.log(JSON.stringify(this, null, 2));
  if (!this.created_at){
    this.createdAt = currentDate;
  }
  next();
});

var user = mongoose.model('user', userSchema);

module.exports = user;