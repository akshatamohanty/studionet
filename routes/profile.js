var express = require('express');
var router = express.Router();
var auth = require('./auth');
var db = require('seraph')({
  server: process.env.SERVER_URL || 'http://localhost:7474/', // 'http://studionetdb.design-automation.net'
  user: process.env.DB_USER,
  pass: process.env.DB_PASS
});

var constants = require('../datastructure/constants.js');
var weights = constants.activityWeights;

// route: /api/profile (profile summary)
// get information about the current user
router.get('/', auth.ensureAuthenticated, function(req, res){

  if(req.user.isGuest)
    res.send(req.user);

  var query = [
    'MATCH (u:user) WHERE ID(u)={userIdParam}',
    'WITH u',
    'OPTIONAL MATCH (u)-[f:FOLLOWS]->(s:space)',
    'WITH collect({id: id(s), name: f.name}) as follows, u',
    'OPTIONAL MATCH (u)-[c:FORKED]->(s:space)',
    'WITH follows, collect({id: id(s), name: c.name, posts: c.posts}) as forks, u',
    //'OPTIONAL MATCH p1=(g:group)-[r:MEMBER]->(u)',
    //'WITH collect({id: id(g), role: r.role, joinedOn: r.joinedOn}) as groups, u',
    'OPTIONAL MATCH p2=(u)-[r1:CREATED]->(c:contribution)',
    'OPTIONAL MATCH (c)-[:TAGGED]->(t:tag) WHERE NOT t.name = "" ',
    'WITH u, forks, follows, c, r1, collect (id(t)) as tags',
    'WITH forks, follows, u, collect({id: id(c), title: c.title, created_by: ID(u), created_on: r1.dateCreated, type: c.contentType, tags: tags }) as contributions',
    //'WITH groups, collect({id: id(c), title: c.title, rating: c.rating, rateCount: c.rateCount, views: c.views}) as contributions, u',
    //'OPTIONAL MATCH p3=(t:tag)<-[r1:CREATED]-(u)',
    //'WITH groups, collect({id: id(t)}) as tags, contributions, u',
    //'OPTIONAL MATCH p4=(c1:contribution)<-[b:BOOKMARKED]-(u)',
    //'WITH groups, collect({id: id(c1), title: c1.title, createdOn: b.createdOn}) as bookmarks, tags, contributions, u',
    //'OPTIONAL MATCH p5=(c5:contribution {createdBy: {userIdParam}})<-[:RELATED_TO]-(:contribution) WHERE c5.dateCreated > {userLastLoggedInParam}',
    //'WITH groups, bookmarks, tags, contributions, u',
    'RETURN {\
              nusOpenId: u.nusOpenId,\
              isAdmin: u.isAdmin, \
              name: u.name,\
              nickname: u.nickname,\
              avatar: u.avatar,\
              lastLoggedIn: u.lastLoggedIn,\
              id: id(u),\
              contributions: contributions,\
              follows: follows,\
              forked: forks \
    }'
  ].join('\n');

  var params = {
    userIdParam: req.user.id,
    userLastLoggedInParam: req.user.lastLoggedIn,
    viewWeightParam : weights[0],
    rateWeightParam : weights[1],
    createWeightParam : weights[2]
  };

  db.query(query, params, function(error, result){
    if (error){
      res.send(error);
      console.log('Error getting user profile: ' + req.user.nusOpenId + ', ' + error);
    }
    else
      // send back the profile with new login date
      res.send(result[0]);
  });
});

// route: PUT /api/profile
// edit user profile
// only edit name, avatar is under uploads
router.put('/', auth.ensureAuthenticated, function(req, res){

  var query = [
    'MATCH (u:user) WHERE ID(u)={userIdParam}',
    'WITH u',
    'SET u.nickname={nicknameParam}',
    'RETURN u'
  ].join('\n');

  var params = {
      nicknameParam: req.body.nickname,
      userIdParam: req.user.id
    };

    db.query(query, params, function(error, result){
      if (error){
        console.log('Error modifying user: ', error);
        res.send('Error editing user profile name');
      }
      else{
        res.send(result[0]);
      }
    });
});



// route: /api/profile/user
// get just the user data for this account
router.get('/user', auth.ensureAuthenticated, function(req, res){

  var query = [
    'MATCH (u:user)',
    'WHERE ID(u)={userIdParam}',
    'WITH u',
    'RETURN u'
  ].join('\n');

  var params = {
    userIdParam: req.user.id
  };

  db.query(query, params, function(error, result){
    if (error)
      console.log('Error getting user profile: ' + req.user.nusOpenId + ', ' + error);
    else
      res.send(result[0]);
  });

});


// route: /api/profile/groups
// get just the groups that this user is in
router.get('/groups', auth.ensureAuthenticated, function(req, res){
  
  var query = [
    'MATCH (u:user)<-[r:MEMBER]-(g:group)',
    'WHERE ID(u)={userIdParam}',
    'RETURN {id: id(g), name: g.name, role: r.role}'
  ].join('\n');

  var params = {
     userIdParam: parseInt(req.user.id)
  }

  db.query(query, params, function(error, result){
    if (error)
      console.log('Error getting current user\'s module');
    else
      res.send(result);
  });

})


// route: /api/profile/activity
// get the contributions that this user created
router.get('/activity', auth.ensureAuthenticated, function(req, res){
  
  var query = [
    'MATCH (u:user) WHERE ID(u)={userIdParam}',
    'OPTIONAL MATCH (u)-[rel]->(c:contribution)',
    'RETURN collect(rel)'
  ].join('\n');

  var params = {
     userIdParam: parseInt(req.user.id)
  }

  db.query(query, params, function(error, result){
    if (error)
      console.log('Error getting current user\'s activity');
    else
      res.send(result);
  });

});

// route: /api/profile/tags
// get the tags that this user created
router.get('/tags', auth.ensureAuthenticated, function(req, res){

  var query = [
    'MATCH (u:user)-[r:CREATED]->(t:tag)',
    'WHERE ID(u)={userIdParam}',
    'RETURN {id: id(t), createdOn: r.createdOn, name: t.name}'
  ].join('\n');

  var params = {
    userIdParam: req.user.id
  };

  db.query(query, params, function(error, result){
    if (error){
      console.log('Error getting current user created tags');
      return res.send('Error getting current user created tags');
    }

    else
      res.send(result);
  });

});

// route: /api/profile/filters
router.route('/filters')
  
  .get(auth.ensureAuthenticated, function(req, res){

    var query = [
      'MATCH (u:user) WHERE ID(u)={userIdParam}',
      'RETURN {filters: u.filters, filterNames: u.filterNames}'
    ].join('\n');

    var params = {
      userIdParam: req.user.id
    };

    db.query(query, params, function(error, result){
      if (error){
        console.log('Error getting current user filters');
        return res.send('Error getting current user filters');
      }
      else {
        return res.send(result);
      }
    });

  })

  .post(auth.ensureAuthenticated, function(req, res){

    if (!(req.body.filters instanceof Array) || !(req.body.filterNames instanceof Array)) {
      return res.send('filters or filterNames are not arrays');
    }

    if (req.body.filters.length != req.body.filterNames.length){
      return res.send('filters and filterNames must be same length')
    }

    var query = [
      'MATCH (u:user) WHERE ID(u)={userIdParam}',
      'SET u.filter={filtersParam}, u.filterNames: {filterNamesParam}'
    ].join('\n');

    var params = {
      userIdParam: req.user.id,
      filtersParam: req.body.filters,
      filterNamesParam: req.body.filterNames
    };

    db.query(query, params, function(error, result){
      if (error){
        console.log('Error posting filters for the user');
        return res.send('Error posting users for the user');
      }
      else {
        return res.send('Successfully updated user filters');
      }
    });
    
  });

module.exports = router;