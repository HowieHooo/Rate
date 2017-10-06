module.exports = (app) => {
	//routes, use http get method, the '/'represents the index page.
//since we've used the view engine, it will directly look files in the 'views' folder
//changes made in the views we don't have to restart the server, otherwise we have to
	app.get('/', function(req, res, next){
		res.render('index', {title: 'Index || Rate'});
	});
	app.get('/signup', function(req, res){
		res.render('user/signup', {title: 'Signup || Rate'});
	});
	app.get('/login', function(req, res){
		res.render('user/login', {title: 'Login || Rate'});
	});
}
