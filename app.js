var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
//TODO remove
//var cookieParser = require('cookie-parser');
var helmet = require('helmet');
var i18n = require('i18n');
var session = require('express-session');
var exphbs  = require('express-handlebars');
var mysql = require('mysql');
var passport = require('./config/passport');
var flash = require('connect-flash');
var compression = require('compression')

var index = require('./routes/index');
var login = require('./routes/login');
var about = require('./routes/about');
var settings = require('./routes/settings');

var locales = ['en', 'sl'];
//Configure localization, currently there will be only 2 languages
i18n.configure({
  locales: locales,
  defaultLocale: 'en',
  directory: __dirname  + '/locales',
  syncFiles: true
});

//TODO unrelated: Retry querys if connection to server fails
//TODO retry other operations
//TODO modify DB model: add indexes for common searches (like by username/email)
//TODO setup nginx and let nginx handle ssl (tls to be specific)

//Define as global, TODO would using module.exports be better?
DBConnectionPool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'WakeMeUp',
  password        : '4020fcf487d41675f2ee0965c00f3cbc',
  database        : 'wakemeup'
});

var app = express();
app.use(compression());

//Configure express-session
app.use(session({
  secret: 'qeá°wn°»^:û¬*6hïÚé#ÐjºÝòÓ/®vó¿£q',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
	path: '/',
	httpOnly: true,
	secure: false, //TODO set to true after setting up ssl, if set to true and https is not used login will fail: https://stackoverflow.com/questions/11277779/passportjs-deserializeuser-never-called
	maxAge: 24*60*60*1000  //Sesion is active for 1 day
  }
}));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//use favicon located in public/images
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(helmet());
//app.use(cookieParser());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(i18n.init);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//TODO will it compile every time in production also? if yes change it!
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public/stylesheets/sass'),
    dest: path.join(__dirname, 'public/stylesheets'),
    force: true,
    indentedSyntax: true,
    sourceMap: true,
    outputStyle: 'compressed',
    prefix: '/public/stylesheets'
}));

//Serve static files
app.use('/public', express.static(__dirname + "/public"));

//Set language, if not defined redirect to default and check user permissions
app.use(function(req, res, next){
    //Split request url into language and url
    var match = req.url.match(/^\/((en|sl))?(\/?.*)?$/i);
    if(match){
        //Set language according to url or to default
        if(match[2]) {
            req.locale = match[2];
        } else {
            req.locale = req.locale && locales.indexOf(req.locale) > -1 ? req.locale : 'en';
            return res.redirect('/' + req.locale + req.url);
        }
        req.setLocale(req.locale);

        req.url = match[3] || '/';
    }
    //Do not allow user acces to login-only area! Non loged in users can only access /login and /about sub-domains.
    if(!req.user && !req.url.match(/^\/(login|about)/i))
        return res.redirect('/' + req.locale + '/login');

    return next();
});

app.use('/login', login);
app.use('/about', about);
app.use('/', index);
app.use('/settings', settings);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
	  message: err.message,
	  error: err
	});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
	message: err.message,
	error: {}
  });
});


module.exports = app;

