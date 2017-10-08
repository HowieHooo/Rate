var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var secret = require('../secret/secret');

var User = require('../models/user');


//these two method from passport
passport.serializeUser((user, done) => {
	done(null, user.id);
});

//all of the user data will be saved in the user object on 12, findById is the method from mongoose, find id saved in the database.
passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, user);
	})
});


passport.use('local.signup', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true
}, (req, email, password, done) => {
	
	User.findOne({'email': email}, (err, user) => {
		if(err){
			return done(err);
		}
		
		if(user){
			return done(null, false);
		}
		
		var newUser = new User();
		newUser.fullname = req.body.fullname;
		newUser.email = req.body.email;
		newUser.password = newUser.encryptPassword(req.body.password);
		
		//the data is saved in the database
		newUser.save((err) =>{
			return done(null, newUser);
		});
	})
}));


passport.use('local.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {

    User.findOne({'email':email}, (err, user) => {
        if(err){
            return done(err);
        }
        
        var messages = [];
        
        if(!user || !user.validPassword(password)){
            messages.push('Email Does Not Exist Or Password is Invalid')
            return done(null, false, req.flash('error', messages));
        }
        
        return done(null, user); 
    });
}));


passport.use(new FacebookStrategy(secret.facebook, (req, token, refreshToken, profile, done) => {
    User.findOne({facebook:profile.id}, (err, user) => {
        if(err){
            return done(err);
        }

        if(user){
			//if user exists, return
            done(null, user);
        }else{
			//if user never used this to login before, create one
            var newUser = new User();
            newUser.facebook = profile.id;
            newUser.fullname = profile.displayName;
            newUser.email = profile._json.email;
            newUser.tokens.push({token:token});

            newUser.save(function(err) {
                if(err){
                    console.log(err);
                }
                done(null, newUser);
            });
        }
    })
}));



