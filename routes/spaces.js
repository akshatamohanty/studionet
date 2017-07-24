var express = require('express');
var router = express.Router();
var auth = require('./auth');
var db = require('seraph')({
  server: process.env.SERVER_URL || 'http://localhost:7474/', // 'http://studionetdb.design-automation.net'
  user: process.env.DB_USER,
  pass: process.env.DB_PASS
});
var _ = require('underscore');

// route: /api/spaces/
router.route('/')

  // return all spaces
  .get(auth.ensureAuthenticated, function(req, res){
    
    var query = [
      'MATCH (s:space)',
      'OPTIONAL MATCH (s)<-[:FOLLOWS]-(f:user)',
      'WITH s, collect(ID(f)) as followers',
      'WITH s, followers', 
      'OPTIONAL MATCH (s)<-[:CURATES]-(c:user)',
      'WITH s, followers, collect(ID(c)) as curators',
      'RETURN {id: id(s), timed: s.timed, tags: s.tags, by: s.created_by, curators: curators, followers: followers }'
    ].join('\n'); 

    var params = {
      userIdParam : parseInt(req.user.id)
    }

    db.query(query, params, function(error, result){
      if (error){
        console.log('Error retrieving all spaces: ', error);
      }
      else{
        res.send(result);
      }
    });

  })

  // create a new space
  // properties with the space - the creator, created_at, timed
  // check that the user creating this space hasn't created more than 10 spaces today
  .post(auth.ensureAuthenticated, function(req, res){

      console.log(req.body);


      // Check for existing spaces with same tag connections and timed value
      // If space exists, return without doing anything
      // If space doesn't exist, return after creating the space

      //  tags: [ 3828, 4154 ],
      //  dates: [ 1497369600000, 1498579200000 ]
      var query = "MATCH (s:space)-[c:CONTAINS]->(t:tag) WHERE s.timed={datesParam}\
        WITH s, count(c) as total_tags\
        WITH s, total_tags\
        MATCH (s)-[:CONTAINS]->(mg:tag) WHERE ID(mg) in {tagsParam}\
        WITH s, total_tags, COUNT(mg) as matched_tags\
        RETURN \
        CASE COUNT(s)\
        WHEN 0\
        THEN CREATE (s:space {created_by: {userIdParam}, created_at: {now}, tags: {tagsParam}, timed: {datesParam}})-[:CONTAINS]->(t:tag) WHERE ID(t) in {tagsParam}\
        ELSE 'already exists' END as results";

      var params = {
        tagsParam : req.body.tags,
        datesParam : req.body.dates,
        userIdParam : parseInt(req.user.id),
        now: new Date()
      }

      /*db.query(query, params, function(error, result){
        if (error){
          console.log('Error retrieving all spaces: ', error);
        }
        else{
          res.send(result);
        }
      });*/

  });



module.exports = router;