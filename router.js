var routes = require('routes')();
var fs = require('fs');
var db = require('monk')('localhost/music');
var qs = require('qs');
var songs = db.get('songs');
var view = require('mustache');
var mime = require('mime');

routes.addRoute('/songs', function (req, res, url) {
  res.setHeader('Content-Type', 'text/html');
  if (req.method === 'GET') {
    songs.find ({}, function (err, docs) {
      var file = fs.readFileSync('templates/songs/index.html');
      var template = view.render(file.toString(), {songs: docs});
      res.end(template);
    });
  }
  if (req.method === 'POST') {
    var data = '';
    req.on('data', function (chunk) {
      data += chunk;
    });
    req.on('end', function () {
      var song = qs.parse (data);
      songs.insert (song, function (err, doc) {
        if (err) throw (err);
        res.writeHead (302, {'location': '/songs'});
        res.end();
      });
    });
  }
});

routes.addRoute ('/songs/new', function (req, res, url) {
  res.setHeader('Content-Type', 'text/html');
  var file = fs.readFileSync('templates/songs/new.html');
  var template = view.render(file.toString(), {});
  res.end(template);
});

routes.addRoute ('/songs/:id', function (req, res, url) {
  res.setHeader('Content-Type', 'text/html');
    if (req.method === 'GET') {
      url = url.params.id;
      songs.findOne ({_id: url}, function (err, docs) {
        var file = fs.readFileSync ('templates/songs/show.html');
        var template = view.render (file.toString(), {title: docs.title});
        res.end(template);
      });
    }
});

routes.addRoute('/songs/:id/delete', function (req, res, url) {
  if (req.method === 'POST') {
    res.setHeader('Content-Type', 'text/html');
    songs.remove({_id: url.params.id}, function (err, doc) {
      if (err) throw (err);
      res.writeHead (302, {location: '/songs'});
      res.end();
    });
  }
});

routes.addRoute ('/public/*', function(req, res, url) {
  res.setHeader('Content-Type', mime.lookup(req.url));
  fs.readFile ('.' + req.url, function(err, file){
    if (err) throw (err);
    res.end(file);
  });
});

module.exports = routes;
