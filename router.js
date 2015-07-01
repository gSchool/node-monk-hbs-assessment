var routes = require('routes')(),
        fs = require('fs'),
        db = require('monk')('localhost/music'),
     songs = db.get('songs'),
        qs = require('qs'),
  mustache = require('mustache'),
      mime = require('mime');

routes.addRoute('/songs', function (req, res, url) {
  res.setHeader('Content-Type', 'text/html');
  if (req.method === 'GET') {
    songs.find({}, function(err, docs) {
      if (err) {throw err; }
      else {
        var file = fs.readFileSync('templates/songs/index.html');
        var template = mustache.render(file.toString(), {songs: docs});
        res.end(template);
      }
    });
  }
});

routes.addRoute('/songs/new', function (req, res, url) { // url is never used
  res.setHeader('Content-Type', 'text/html');
  if (req.method === 'GET') {
    var file = fs.readFileSync('templates/songs/new.html');
    var template = mustache.render(file.toString(), {});
    res.end(template);
  }
  if (req.method === 'POST') {
    var data = '';
    req.on('data', function(chunk){
      data += chunk;
    });
    req.on('end', function(){
      // console.log(data);
      var song = qs.parse(data);
      // console.log(song);
      // var length = qs.parse(data); // how to parse length from title?
      // console.log(length);
      songs.insert(song, function(err, doc) { // doc is never used
        if (err) {res.end('error'); }
        else {
          res.writeHead(302, {'Location': '/songs'});
          res.end();
        }
      });
    });
  }
});

routes.addRoute('/songs/:id', function (req, res, url) { // :_id?
  res.setHeader('Content-Type', 'text/html');
  if (req.method === 'GET') {
    songs.findOne({_id: url.params.id}, function(err, doc) { // just one doc
      if (err) {throw err; }
      else {
        var file = fs.readFileSync('templates/songs/edit.html'); // show.html?
        // var data = doc;
        var template = mustache.render(file.toString(), doc);
        res.end(template);
      }
    });
  }
  if (req.method === 'POST') {
    var data = '';
    req.on('data', function(chunk) {
      data += chunk;
    });
    req.on('end', function(){
      var song = qs.parse(data);
      songs.update({_id: url.params.id}, song, function(err, doc) { // doc is never used
        if (err) {res.end('error'); }
        else {
          res.writeHead(302, {'Location': '/songs'});
          res.end();
        }
      });
    });
  }
});

routes.addRoute('/songs/:id/delete', function (req, res, url) {
  if (req.method === 'POST') {
    songs.remove({_id: url.params.id}, function(err, doc) {
      if (err) {throw err; }
      else {
        res.writeHead(302, {'Location': '/songs'});
        var file = fs.readFileSync('templates/songs/show.html'); //bands?
        res.end();
      }
    });
  }
});

routes.addRoute('/songs/:id/show', function (req, res, url) {
  if (req.method === 'GET') { // POST?
    songs.findOne({_id: url.params.id}, function(err, doc) {
      if (err) {throw err; }
      else {
        var file = file.readFileSync('templates/songs/show.html');
        var template = mustache.render(file.toString(), doc);
        res.end(template);
      }
    });
  }
});

routes.addRoute('/public/*', function (req, res, url) {
  res.setHeader('Content-Type', mime.lookup(req.url));
  fs.readFile('./' + req.url, function (err, file) {
    if (err) {
      res.setHeader('Content-Type', 'text/html');
      res.end('404');
    }
    else {
      res.end(file);
    }
  });
});

module.exports = routes;
