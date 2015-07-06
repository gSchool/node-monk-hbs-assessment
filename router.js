var routes = require('routes')(),
    fs = require('fs'),
    db = require('monk')('localhost/songs'),
    mime = require('mime-types'),
    qs = require('qs'),
    songs = db.get('songs'),
    view = require('mustache');

routes.addRoute('/songs', (req, res, url) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    songs.find({}, function (err, docs) {
      var file = fs.readFileSync('templates/songs/index.html');
      var template = view.render(file.toString(), {songs: docs});
      res.end(template)
    })
  }

  if (req.method === 'POST') {
    var data = '';
    req.on('data', function(chunk) {
      data += chunk;
    })
    req.on('end', function(){
      var song = qs.parse(data);
      var milliseconds = (song.length/60000);
      song.length = milliseconds;
      songs.insert(song, function(err, doc) {
        if (err) {
          throw err
        }
        res.writeHead(302, {'Location': '/songs'});
        res.end();
      })
    })
  }
})

routes.addRoute('/songs/new', function(req, res, url) {
  if (req.method === 'GET') {
    fs.readFile('templates/songs/new.html', function(err, file) {
      if (err) {
        throw err
      }
      res.setHeader('Content-Type', mime.lookup(req.url))
      res.end(file)
    })
  }
})

routes.addRoute('/songs/:id', function(req, res, url) {
  if (req.method === 'GET') {
    songs.findOne({ _id: url.params.id }, function(err, doc) {
      if (err) {
        throw err
      }
      var file = fs.readFileSync('templates/songs/show.html');
      var template = view.render(file.toString(), doc)
      res.end(template)
    })
  }
})

routes.addRoute('/songs/:id/delete', function(req, res, url) {
  if (req.method === 'POST') {
    songs.remove({_id: url.params.id}, function(err, doc) {
      if (err) {
        throw err
      }
      res.writeHead(302, {'Location': '/songs'})
      res.end()
    })
  }
})

routes.addRoute('/public/*', function(req, res, url) {
  fs.readFile('.' + req.url, function(err, file) {
    if (err) {
      throw err
    }
    res.setHeader('Content-Type', mime.lookup(req.url))
    res.end(file)
  });
})

module.exports = routes
