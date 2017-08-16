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
      'OPTIONAL MATCH (s)<-[:FORKED]-(c:user)',
      'WITH s, followers, collect(ID(c)) as forkers',
      'RETURN {id: id(s), timed: s.timed, tags: s.tags, by: s.created_by, forkers: forkers, followers: followers }'
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

      // sort the tags
      var _tags = req.body.tags.map(function(t){
        return parseInt(t);
      }).sort(function(a,b){ return a > b });

      // Check for existing spaces with same tag connections and timed value
      // If space exists, return without doing anything
      // If space doesn't exist, return after creating the space

      //  tags: [ 3828, 4154 ],
      //  dates: [ 1497369600000, 1498579200000 ]
      //  todo: the relationship between the creator and space is created even if it already exists
      var query = [ "MATCH (u:user) WHERE ID(u) = {userIdParam}  ",
                  "WITH u ",
                  "MERGE (s:space {timed: {datesParam}, tags: {tagsParam} }) ",
                  "ON CREATE SET s.created_by=0, s.created_at=timestamp()  ",
                  "WITH s, u ",
                  "UNWIND {tagsParam} as tag_id ",
                  "MATCH (t:tag) WHERE ID(t)=tag_id ",
                  "MERGE (s)-[:CONTAINS]->(t) ",
                  "WITH s, u ",
                  "MERGE (u)-[:CREATED {time: timestamp()}]-(s) "  ,
                  "RETURN s" ].join(" ");

      var params = {
        tagsParam : _tags,
        datesParam : req.body.dates,
        userIdParam : parseInt(req.user.id),
      }

      db.query(query, params, function(error, result){
        if (error){
          console.log('Error retrieving all spaces: ', error);
        }
        else{
          res.send(result);
        }
      });

  });

// route: /api/spaces/:spaceId
router.route('/:spaceId/fork')

  // return all spaces
  .post(auth.ensureAuthenticated, function(req, res){
      var query = [ 
                    "MATCH (u:user) WHERE ID(u) = {userIdParam}",
                    "WITH u",
                    "MATCH (s:space) WHERE ID(s) = {spaceIdParam}",
                    "MERGE (u)-[f:FORKED]->(s)",
                    "ON CREATE SET f.name={nameParam}, f.time=timestamp()",
                    "RETURN s" 
                  ].join(" ");

      var params = {
        nameParam: req.body.name,
        spaceIdParam : parseInt(req.params.spaceId),
        userIdParam : parseInt(req.user.id),
      }

      db.query(query, params, function(error, result){
        if (error){
          console.log('Error forking the space: ', error);
        }
        else{
          res.send(result);
        }
      });
      

  })

  .delete(auth.ensureAuthenticated, function(req, res){

      // delete the relationship between user and space
      // delete redundant bookmarks
      // delete the space if this was the only user
      var query = [ 
                    "MATCH (u:user)-[frk:FORKED]->(s:space) WHERE ID(u)={userIdParam} and ID(s)={spaceIdParam}",
                    "DELETE frk",
                    "WITH u, s",
                    "OPTIONAL MATCH (s)<-[f:FORKED]-(:user)",
                    "WITH u, s, count(f) as frk_count",
                    "WHERE frk_count = 0 DETACH DELETE s",
                    "WITH u",
                    "MATCH (u)-[forked:FORKED]->(sp:space)",
                    "MATCH (u)-[b:BOOKMARKED]->(c:contribution)  WHERE NOT ID(c) in forked.posts",
                    "DELETE b"
                  ].join(" ");

      var params = {
        spaceIdParam : parseInt(req.params.spaceId),
        userIdParam : parseInt(req.user.id),
      };

      db.query(query, params, function(error, result){
        if (error){
          console.log('Error forking the space: ', error);
        }
        else{
          res.send(result);
        }
      });

  });


// route: /api/spaces/:spaceId
router.route('/:spaceId/subscribe')

  // return all spaces
  .get(auth.ensureAuthenticated, function(req, res){

      var query = [ 
                    "MATCH (u:user) WHERE ID(u) = {userIdParam}",
                    "WITH u",
                    "MATCH (s:space) WHERE ID(s) = {spaceIdParam}",
                    "MERGE (u)-[f:FOLLOWS]->(s)",
                    "ON CREATE SET f.name={nameParam}, f.time=timestamp()",
                    "RETURN s" 
                  ].join(" ");

      var params = {
        nameParam: req.body.name,
        spaceIdParam : req.query.spaceId,
        userIdParam : parseInt(req.user.id),
      }

      db.query(query, params, function(error, result){
        if (error){
          console.log('Error forking the space: ', error);
        }
        else{
          res.send(result);
        }
      });
    
  });

  // route: /api/spaces/:spaceId/add
  router.route('/:spaceId/add')

    // add a post to a fork
    .post(auth.ensureAuthenticated, function(req, res){
        var query = [ 
                      "MATCH (u:user) WHERE ID(u) = {userIdParam}",
                      "WITH u",
                      "MATCH (s:space) WHERE ID(s) = {spaceIdParam}",
                      "MERGE (u)-[f:FORKED]->(s)",
                      'FOREACH(x in CASE WHEN {contributionIdParam} in f.posts THEN [] ELSE [1] END | ',
                      '   SET f.posts = coalesce(f.posts,[]) + {contributionIdParam}',
                      ')',
                      "RETURN s" 
                    ].join(" ");

        var params = {
          contributionIdParam: parseInt(req.body.contribution),
          spaceIdParam : parseInt(req.params.spaceId),
          userIdParam : parseInt(req.user.id),
        }

        db.query(query, params, function(error, result){
          if (error){
            console.log('Error forking the space: ', error);
          }
          else{
            res.send(result);
          }
        });
        

    });

  // route: /api/spaces/:spaceId
  // remove the id from posts property of space
  // note: removal of tags incase of undo is handled in the frontend. however, tags should remain 
  router.route('/:spaceId/remove')

    .delete(auth.ensureAuthenticated, function(req, res){
        var query = [ 
                      "MATCH (u:user)-[f:FORKED]->(s:space) WHERE ID(u)={userIdParam} AND ID(s)={spaceIdParam} AND EXISTS(f.posts)",
                      "SET f.posts = FILTER(x IN f.posts WHERE x <> {contributionIdParam})",
                      "RETURN s"
                    ].join(" ");

        var params = {
          contributionIdParam: parseInt(req.body.contribution),
          spaceIdParam : parseInt(req.params.spaceId),
          userIdParam : parseInt(req.user.id),
        }

        db.query(query, params, function(error, result){
          if (error){
            console.log('Error forking the space: ', error);
          }
          else{
            console.log(result);
            res.send(result);
          }
        });
        

    });

module.exports = router;