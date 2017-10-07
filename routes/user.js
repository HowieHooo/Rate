module.exports = (app, passport) => {
	//routes, use http get method, the '/'represents the index page.
//since we've used the view engine, it will directly look files in the 'views' folder
//changes made in the views we don't have to restart the server, otherwise we have to
	app.get('/', function(req, res, next){
		res.render('index', {title: 'Index || Rate'});
	});
	app.get('/signup', function(req, res){
		var errors = req.flash('error');
        res.render('user/signup', {title: 'Sign Up || Rate', messages: errors, hasErrors: errors.length > 0});
	});
	
	app.post('/signup', validate, passport.authenticate('local.signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash: true
	}));
	
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
	
	app.get('/home', function(req, res){
		res.render('home', {title: 'Home || Rate'});
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
