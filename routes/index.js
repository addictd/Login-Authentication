var Models = require('../models/auth_details');
var express = require('express');
var router = express.Router();
var passwordHash = require('password-hash');
let date = require('date-and-time');

function generateId(){
  var id =  date.format(new Date(), 'DD') +'dc'+date.format(new Date(), 'HHmmss');
  return id;
}

router.get('/', function(req, res) {
  res.render('index', { title: generateId() });
});

router.get('/flash', function(req, res){
  // Set a flash message by passing the key, followed by the value, to req.flash().
  req.flash('info', 'Flash is back!')
  res.redirect('/');
});

router.get('/signup', function(req, res){
	res.render('signup_form', {title: 'SignUp'});
});
router.post('/signup', function(req, res){
	console.log(req.body);

	Models.signup_user({_id: generateId(), 
                      email: req.body.email, 
                      password: passwordHash.generate(req.body.password)},
    function(){
		console.log("Data Successfully saved");
	})
	res.redirect('/login');
});




router.get('/login', function(req, res){
	res.render('login_form', {title: 'Login'});
});

var passport = require('passport'), 
    LocalStrategy = require('passport-local').Strategy;


passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(username, password, done) {
    console.log("Username : "+ username +'      Passsword : ' + password);

    Models.login_user({ email: username}, function (err, user) {
      console.log('inside callback.');
      console.log(user);

      if (err) { return done(err); }
      if (!user) {
        console.log('Invalid username.');
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!passwordHash.verify(password, user.password)) {
        console.log('Invalid Password.');
        return done(null, false, { message: 'Incorrect password.' });
      }
      console.log('correct credentials.');
      return done(null, user);
    });
  }
));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {

  Models.findById(id, function(err, user) {
    done(err, user);
  } )


});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }else{
    // Return error content: res.jsonp(...) or redirect: res.redirect('/login')
  console.log("there is error in ensuring authentication");
  res.redirect('/login');
  }
    
}
router.post('/login', passport.authenticate('local', { successRedirect: '/hidden',
                                                    failureRedirect: '/login',
                                                    failureFlash: true,
                                                    successFlash: 'welcome' }));

router.get('/hidden', ensureAuthenticated , function(req, res){
  
  Models.if_exists(req.user._id, function(err, docs){
    console.log("this is query from saved docs: "+ docs);
    res.render('hidden', {title: 'Restricted', details_avail: docs});

  })
  //console.log('This is the authentication details: '+ req.user);
})

router.get('/logout',function(req, res){
  req.logout();
  res.redirect('/login');
})

router.post('/hidden', function(req, res){

  Models.add_details( {_id: req.user._id,  
                        sex: req.body.sex, 
                        height: req.body.height, 
                        age: req.body.age },
 function(err, subdocs){
    console.log("these are the saved details: "+ subdocs);
    res.redirect('/hidden');
  });
  
})

module.exports = router;
