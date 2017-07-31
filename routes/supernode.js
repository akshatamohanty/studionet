var express = require('express');
var router = express.Router();
var auth = require('./auth');
var db = require('seraph')({
	server: process.env.SERVER_URL || 'http://localhost:7474/', // 'http://studionetdb.design-automation.net'
	user: process.env.DB_USER,
	pass: process.env.DB_PASS
});

var superNodeId = {
	contributionId: -1,
	groupId: -1,
	tagId: -1
};

router.route('/')
	.get(auth.ensureAuthenticated, function(req, res){
		if (superNodeId.contributionId !== -1 && superNodeId.groupId !== -1 && superNodeId.tagId !== -1){
			console.log('Sending cached supernode id');
			return res.send(superNodeId);
		}

		var query = [
			'MATCH (c:contribution {superNode: true})',
			'WITH c',
			'MATCH (g:group {superNode: true})',
			'WITH c, g',
			'MATCH (t:tag) WHERE t.name = ""',
			'RETURN {contributionId: id(c), groupId: id(g), tagId: id(t)}'
		].join('\n');

		db.query(query, function(error, result){
			if (error){
				console.log(error);
				return res.send('Cannot get the supernode id. Try again later.');
			}
			else {
				console.log('[SUCCESS] Successfully retrieved supernode id');
				superNodeId.contributionId = result[0].contributionId;
				superNodeId.groupId = result[0].groupId;
				superNodeId.tagId = result[0].tagId;
				return res.send(result[0]);
			}
		});

	})

module.exports = router;