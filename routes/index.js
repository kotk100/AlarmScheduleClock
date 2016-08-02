var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session.userId)
    res.redirect('/login');

  //res.render('index', { title: res.__('siteTitle') });
});

module.exports = router;
