var express = require('express');
var router = express.Router();

/* Send login page */
router.get('/', function(req, res, next) {
    
    res.render('login', { login: res.__('login') });
});

module.exports = router;