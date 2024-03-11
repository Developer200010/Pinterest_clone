var express = require('express');
var router = express.Router();
const userModel = require('./users');
const passport = require('passport');
const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));

router.get('/login', function(req, res, next) {
  res.render('index');
});

router.get('/register', function(req,res,next){
 res.render('register');
});

router.get('/profile', isLoggedIn, function(req,res,next){
  res.render('profile');
});
 
router.post('/register', function(req,res,next){
    const user = new userModel({
      username: req.body.username,
      password: req.body.email,
      email: req.body.contact
    })
    userModel.register(user, req.body.password).then(function(){
      passport.authenticate('local')(req,res,function(){
        res.redirect("/profile");
      })
    })
})

router.post('/login',passport.authenticate("local",{
  failureRedirect:"/login",
  successRedirect:"/profile"
}), function(req,res,next){
})

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
    res.redirect("/");
}

module.exports = router;