//used to send email to user
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');

//used to generate random token for user to get password
var crypto = require('crypto');
var User = require('../models/user');
var secret = require('../secret/secret');

module.exports = (app, passport) => {
	//routes, use http get method, the '/'represents the index page.
//since we've used the view engine, it will directly look files in the 'views' folder
//changes made in the views we don't have to restart the server, otherwise we have to
	app.get('/', function(req, res, next){
		res.render('index', {title: 'Index || Rate'});
	});
	
	//signup
	app.get('/signup', function(req, res){
		var errors = req.flash('error');
        res.render('user/signup', {title: 'Sign Up || Rate', messages: errors, hasErrors: errors.length > 0});
	});
	
	app.post('/signup', validate, passport.authenticate('local.signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash: true
	}));
	
	
	//login
	app.get('/login', function(req, res){
		var errors = req.flash('error');
		res.render('user/login', {title: 'Login || Rate',
		messages: errors, hasErrors: errors.length > 0});
	});
	
	app.post('/login', loginValidation, passport.authenticate('local.login', {
		successRedirect: '/home',
		failureRedirect: '/login',
		failureFlash: true
	}));
	
	
	//home page
	app.get('/home', function(req, res){
		res.render('home', {title: 'Home || Rate'});
	});
	
	
	//forgot page
	app.get('/forgot', function(req, res){
		var errors = req.flash('error');
		var info = req.flash('info');
		res.render('user/forgot', {title: 'Reset Your Password Through Email', messages: errors, 
		hasErrors: errors.length > 0, info: info, noErrors: info.length > 0});
	});
	
	app.post('/forgot', (req, res, next) => {
		async.waterfall([
			//function to generate the random token
			function(callback){
				crypto.randomBytes(20, (err, buf) => {
					var rand = buf.toString('hex');
					callback(err, rand);
				});
			},
			
			//function to check if the email is valid and bind the token to the avaliable email
			function(rand, callback){
				User.findOne({'email':req.body.email}, (err, user) => {
					if(!user){
						req.flash('error', 'No Account With That Email Exist Or Email is Invalid');
						return res.redirect('/forgot');
					}
					
					//save the token and set it valid in 1 hour
					user.passwordResetToken = rand;
					user.passwordResetExpires = Date.now() + 60*60*1000;
					
					user.save((err) =>{
						callback(err, rand, user)
					});
				})
			},
			
			//function to send user the email
			function(rand, user, callback){
				var smtpTransport = nodemailer.createTransport({
					service: 'Gmail',
					auth: {
						user: secret.auth.user,
						pass: secret.auth.pass
					}
				});
				
				var mailOptions = {
					to: user.email,
					from: 'Rate' + '<'+secret.auth.user+'>',
					subject: 'Rate Web Application Password Reset Token',
					text: 'You have requested for the token to reset your password. \n\n' + 
					'Please click on the link to complete  the process: \n\n' +
					'http://localhost/reset/' + rand + '\n\n'
				};
				
				smtpTransport.sendMail(mailOptions, (err, response) => {
					req.flash('info', 'A password reset token has been sent to' + user.email);
					return callback(err, user);
				});
			}
		], (err) =>{
			if(err){
				return next(err);
			}
			
			res.redirect('/forgot');
		})
	});
	
}


function validate(req, res, next){
   req.checkBody('fullname', 'Fullname is Required').notEmpty();
   req.checkBody('fullname', 'Fullname Must Not Be Less Than 5').isLength({min:5});
   req.checkBody('email', 'Email is Required').notEmpty();
   req.checkBody('email', 'Email is Invalid').isEmail();
   req.checkBody('password', 'Password is Required').notEmpty();
   req.checkBody('password', 'Password Must Not Be Less Than 5').isLength({min:5});
   req.check("password", "Password Must Contain at least 1 Number.").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");

   var errors = req.validationErrors();

   if(errors){
       var messages = [];
       errors.forEach((error) => {
           messages.push(error.msg);
       });

       req.flash('error', messages);
       res.redirect('/signup');
   }else{
       return next();
   }
}

function loginValidation(req, res, next){
   req.checkBody('email', 'Email is Required').notEmpty();
   req.checkBody('email', 'Email is Invalid').isEmail();
   req.checkBody('password', 'Password is Required').notEmpty();
   req.checkBody('password', 'Password Must Not Be Less Than 5 Characters').isLength({min:5});
   req.check("password", "Password Must Contain at least 1 Number.").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");

   var loginErrors = req.validationErrors();

   if(loginErrors){
       var messages = [];
       loginErrors.forEach((error) => {
           messages.push(error.msg);
       });

       req.flash('error', messages);
       res.redirect('/login');
   }else{
       return next();
   }
}
