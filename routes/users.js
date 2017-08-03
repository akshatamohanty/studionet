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
var taglineFn = constants.taglineFn

// route: /api/users
router.route('/')

  // return all users
  .get(auth.ensureAuthenticated, function(req, res){

    var query = [
      'MATCH (u:user)',
      'RETURN { id: id(u), nickname: u.nickname, name: u.name, avatar: u.avatar, isAdmin: u.isAdmin,\
                lastLoggedIn: u.lastLoggedIn, \
                activityArr: [ SIZE((u)-[:VIEWED]->(:contribution)), SIZE((u)-[:RATED]->(:contribution)), SIZE((u)-[:CREATED]->(:contribution {contentType: "text"})), SIZE((u)-[:CREATED]->(:contribution {contentType: "comment"})), SIZE((u)-[:CREATED]->(:link)) ],  \
                level: {viewWeightParam}*(SIZE((u)-[:VIEWED]->(:contribution))) + {rateWeightParam}*(SIZE((u)-[:RATED]->(:contribution))) + {createWeightParam}*(SIZE((u)-[:CREATED]->(:contribution {contentType: "text"}))) }'
    ].join('\n');

    console.log(weights);
    var params = {
      viewWeightParam : weights[0],
      rateWeightParam : weights[1],
      createWeightParam : weights[2]
    }

    db.query(query, params, function(error, result){
      if (error) {
        console.log('Error retrieving all users: ', error);
      }
      else {
        res.send(result);
      }
    });
  })

  // add a new user
  .post(auth.ensureAuthenticated, function(req, res){
    
    // TODO: Create constraint on nusOpenId
    var query = [
      'CREATE (u:user {\
                        nusOpenId: {nusOpenIdParam},\
                        canEdit: {canEditParam},\
                        name: {nameParam},\
                        isAdmin: {isAdminParam},\
                        addedBy: {addedByParam},\
                        addedOn: {addedOnParam},\
                        avatar: {avatarParam},\
                        joinedOn: {joinedOnParam},\
                        lastLoggedIn: {lastLoggedInParam},\
                        filters: {filtersParam},\
                        filterNames: {filterNamesParam}\
                       })',
      'RETURN u'
    ].join('\n');

    var params = {
      nusOpenIdParam: req.body.nusOpenId,
      canEditParam: true, //req.body.canEdit,
      nameParam: req.body.name,
      isAdminParam: req.body.isAdmin, 
      addedByParam: req.user.id,
      addedOnParam: Date.now(),
      avatarParam: "/assets/images/avatar.png",
      joinedOnParam: -1,  // -1 as default
      lastLoggedInParam: -1, // -1 as default
      filtersParam: [],
      filterNamesParam: []
    };

    /*
     *
     *  Only for testing and creating synthetic data; 
     *  Remove in production
     *
     * 
     */
    if(auth.ensureSuperAdmin && req.body.addedBy && req.body.addedOn){

      params.addedByParam = parseInt(req.body.addedBy);
      params.addedOnParam = new Date(req.body.addedOn).getTime();

    }

    db.query(query, params, function(error, result){
      if (error)
        console.log('Error creating new user: ', error);
      else
        res.send(result[0]);
    });

  });

// route: /api/users/:userId
router.route('/:userId')

  // return a user
  .get(auth.ensureAuthenticated, function(req, res){
        var query = [
          'MATCH (u:user) WHERE ID(u)={userIdParam}',
          'WITH u',
          'OPTIONAL MATCH (u)-[f:FOLLOWS]->(s:space)',
          'WITH collect({id: id(s), name: f.name}) as follows, u',
          'OPTIONAL MATCH (u)-[c:FORKED]->(s:space)',
          'WITH follows, collect({id: id(s), name: c.name, posts: c.posts, timed: s.timed}) as forks, u',
          'OPTIONAL MATCH p2=(u)-[r1:CREATED]->(c:contribution)',
          'OPTIONAL MATCH (c)-[:TAGGED]->(t:tag) WHERE NOT t.name = "" ',
          'WITH u, forks, follows, c, r1, collect (id(t)) as tags',
          'OPTIONAL MATCH (c)<-[v:VIEWED]-(u1:user) WHERE NOT id(u1)={userIdParam} ',
          'WITH u, forks, follows, c, r1, tags, count(v) as vc',
          'OPTIONAL MATCH (c)<-[lk:RATED]-(u2:user) WHERE NOT id(u2)={userIdParam} ',
          'WITH u, forks, follows, c, r1, tags, vc, count(lk) as lk',
          'OPTIONAL MATCH (c)<-[bk:BOOKMARKED]-(u3:user) WHERE NOT id(u3)={userIdParam} ',
          'WITH u, forks, follows, c, r1, tags, vc, lk, count(bk) as bk',
          'WITH forks, follows, u, collect({id: id(c), title: c.title, type: c.contentType, tags: tags, bookmarks: bk, views: vc, likes: lk }) as contributions',
          'OPTIONAL MATCH (u)-[:CREATED]->(:contribution)<-[v:VIEWED]-(u1:user) WHERE NOT ID(u)=ID(u1)',
          'WITH forks, follows, u, contributions, count(v) as views',
          'OPTIONAL MATCH (u)-[:CREATED]->(:contribution)<-[r:RATED]-(u3:user) WHERE NOT ID(u)=ID(u3)',
          'WITH forks, follows, u, contributions, views, count(r) as thumbs',
          'RETURN {\
                    nusOpenId: u.nusOpenId,\
                    isAdmin: u.isAdmin, \
                    name: u.name,\
                    nickname: u.nickname,\
                    avatar: u.avatar,\
                    lastLoggedIn: u.lastLoggedIn,\
                    id: id(u),\
                    views: views,\
                    thumbs: thumbs,\
                    contributions: contributions,\
                    forked: forks \
          }'
        ].join('\n');

        var params = {
          userIdParam: parseInt(req.params.userId)
        };

        db.query(query, params, function(error, result){
          if (error){
            res.send(error);
            console.log('Error getting user profile: ' +  parseInt(req.params.userId) + ', ' + error);
          }
          else
            // send back the profile with new login date
            res.send(result[0]);
        });
  })

  // update a user
  .put(auth.ensureAuthenticated, auth.ensureSuperAdmin, function(req, res){
    var query = [
      'MATCH (u:user) WHERE ID(u)={userIdToEditParam}',
      'SET u.nusOpenId={nusOpenIdParam}, u.canEdit={canEditParam},',
      'u.name={nameParam}, u.isAdmin={isAdminParam}',
      'RETURN u'
    ].join('\n');

    var params = {
      userIdToEditParam: parseInt(req.params.userId),
      nusOpenIdParam: req.body.nusOpenId,
      canEditParam: req.body.canEdit,
      nameParam: req.body.name,
      isAdminParam: req.body.isAdmin, 
    };

    db.query(query, params, function(error, result){
      if (error){
        console.log('Error creating new user: ', error);
      }
      else{
        console.log('[SUCCESS] User id ' + req.params.userId + ' edited.');
        res.send(result[0]);
      }
    });
  })

  // delete a user
  .delete(auth.ensureAuthenticated, auth.ensureSuperAdmin, function(req, res){
    var query = [
      'MATCH (u:user) WHERE ID(u)={userIdToDeleteParam}',
      'OPTIONAL MATCH (u)-[r]-()',
      'DELETE u,r'
    ].join('\n');

    var params = {
      userIdToDeleteParam: parseInt(req.params.userId)
    };

    db.query(query, params, function(error,result){
      if (error){
        console.log(error);
      }
      else{
        console.log('[SUCCESS] User id ' + req.params.userId + ' deleted.');
        res.send('User id ' + req.params.userId + ' deleted.');
      }
    })
  });


module.exports = router;