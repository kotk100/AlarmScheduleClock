var express = require('express');
var router = express.Router();
var passport = require('../config/passport');
var User = require('../models/user');
var nodemailer = require('nodemailer');

//TODO configure, this is just an example
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'kotk.kern@gmail.com',
        pass: 'nywkjkmoqyhvzjhz'
    },
    tls: { //TODO remove when ssl is setup
        rejectUnauthorized: false
    }
});

// Render the login page at /login
router.get('/', function(req, res, next) {
    res.render('login', { layout: 'login', url: 'login', i18n: req.__, lang: req.locale, message: req.flash('error')});
});

//Get form data and authenticate user cridentials
router.post('/', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        //If an error occurred or no user is returned inform the user
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('error', req.__(info.message));
            return res.redirect('/' + req.locale + '/login');
        }

        //Save user in session
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            return res.redirect('/' + req.locale);
        });
    })(req, res, next);
});

//Render the register page located at /login/register
router.get('/register', function(req, res, next) {
    res.render('register', { layout: 'login', url: 'login/register', i18n: req.__, lang: req.locale, message: req.flash('error')});
});

router.get('/register/success', function(req, res, next){
    res.render('message', { layout: 'login', url: 'login/register/success', i18n: req.__, lang: req.locale, message: req.__('RegistrationSuccess'), redirectUrl: '/login'});
});

//TODO keep form data after redirect/refresh
//Get form data for user registration
router.post('/register', function(req, res, next){
    //Check if all the data is entered and available
    if(!req.body || !req.body.username || !req.body.password || !req.body.email){
        //Inform the user on next page
        req.flash('error', 'errorFillAllFields');
        return res.redirect('/' + req.locale + '/login/register');
    }

    //TODO add recover password option
    //TODO Confirm registration through email, use nodemailer, already installed

    //Check if email or username already exist in the DB
    DBConnectionPool.query('SELECT count(*) as ex FROM users WHERE UserName LIKE ?    UNION ALL   SELECT count(*) as ex FROM users WHERE Email LIKE ?', [req.body.username, req.body.email], function(err, rows, fields){
        if(err){
            return next(err);
        } else if (!rows || rows.length != 2){
            req.flash('error', 'errorChekingData');
            return res.redirect('/' + req.locale + '/login/register');
        } else if (rows[1].ex == 1){
            req.flash('error', 'errorEmailInUse');
            return res.redirect('/' + req.locale + '/login/register');
        } else if (rows[0].ex == 1){
            req.flash('error', 'errorUsernameInUse');
            return res.redirect('/' + req.locale + '/login/register');
        }

        sendVerificationEmail(req.body.email);

        //TODO Only save in database after verification
        //Create user
        User.prototype.createUser(req.body.username, req.body.password, req.body.email, function(err){
            if(err){
                req.flash('error', 'errorFailedCreatingUser');
                return res.redirect('/' + req.locale + '/login/register');
            }
            return res.redirect('/' + req.locale + '/login/register/success');
        });
    });
});

//TODO only tempororary for testing
var sendVerificationEmail = function(email){
    var mailOptions = {
        from: 'registracija@zbudim.se', // sender address
        to: 'kern.ziga@gmail.com', // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello world ✔', // plaintext body
        html: '<b>Hello world ✔</b>' // html body
    };

// send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
};

module.exports = router;