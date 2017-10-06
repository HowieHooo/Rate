var express = require('express');

//parse data from the front-end
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);

var app = express();

//create database
mongoose.connect('mongodb://localhost/rate');


//need to use this to display all the static files.
app.use(express.static('public'));

//specify the engine we use through out the project
app.engine('ejs', engine);

//set the view engine we use, the ejs
app.set('view engine', 'ejs');

//user middware
app.use(cookieParser());

//the type of data we want to pass through bodyparser is in json format
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//must add propaties, otherwise new versions of node.js or express cannot be used
app.use(session({
	//secret is the session ID, allows session to be passed through pages, it is the only
	//data that required to be stored in the cookies, others are stored in the database
	secret: 'Thisisthesessionkey',
	//we dont have to resave the session data when user reload or refresh pages.
	resave: false,
	saveUnitialized: false,
	//store the session data in the database so the user don't have to relogin when changing or  refreshing pages.
	store: new MongoStore({mongooseConnection: mongoose.connection})
}));


require('./routes/user')(app);


app.listen(3000, function(){
    console.log('The server is running on Port3000 now!');
})

