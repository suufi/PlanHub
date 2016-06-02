var express = require('express');
var router = express.Router();

/* App home page. */
router.get('/', global.requireUser, global.getUserRecord, function(req, res, next) {
	res.render('app', { title: 'MyHomeworkSpace', carriers: require("../sms") });
});

module.exports = router;
