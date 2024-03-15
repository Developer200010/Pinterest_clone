var express = require('express');
var router = express.Router();
const userModel = require('./users');
const passport = require('passport');
const upload = require("./multer");
const postModel = require('./post');

const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req, res, next) {
  res.render('index', {nav:false});
});

router.get('/register', function(req,res,next){
  res.render('register',{nav:false});
});

router.get('/add', function(req,res,next){
  res.render('add', {nav:true});
});



router.post('/createPost', isLoggedIn, upload.single('postImage'), async function(req,res,next){
  const user = await userModel.findOne({username : req.session.passport.user});
  const post=await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');
});

router.get('/profile', isLoggedIn, async function(req,res,next){
  const user = await userModel.findOne({username : req.session.passport.user}).populate("posts");
  res.render('profile', {user, nav:true})
});

router.get('/show/posts', isLoggedIn , async function(req,res,next){
  const user = await userModel.findOne({username : req.session.passport.user}).populate("posts");
  res.render('show', {user, nav:true});
});

router.get('/show/posts/cardDetails', isLoggedIn , async function(req,res,next){
  const user = await userModel.findOne({username : req.session.passport.user}).populate("posts");
  res.render('singlePost', {user, nav:false});
});

router.get('/feed', isLoggedIn , async function(req,res,next){
  const user = await userModel.findOne({username : req.session.passport.user});
  const posts = await postModel.find().populate("user");
  res.render('feed', {user,posts, nav:true});
});


router.post('/createPost', isLoggedIn,upload.single("postImage"), async function(req,res,next){
  const user = await userModel.findOne({username : req.session.passport.user});
  res.render('profile', {user, nav:true})
});

router.post('/uploadfile', isLoggedIn, upload.single('file'), async function(req,res,next){
  const user = await userModel.findOne({username : req.session.passport.user});
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect("/profile");
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
  failureRedirect:"/",
  successRedirect:"/profile"
}), function(req,res,next){
})

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
    res.redirect("/");
}

module.exports = router;
