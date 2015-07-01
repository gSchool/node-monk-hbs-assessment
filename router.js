var routes = require('routes')(),
    fs = require('fs'),
    qs = require('qs'),
    db = require('monk')('localhost/music')
    songs = db.get('songs'),
    mime = require('mime'),
    view = require('mustache');

routes.addRoute('/songs', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {
    songs.find({}, function (err, docs) {
      if (err) console.log(err);
      var file = fs.readFileSync('templates/songs/index.html')
      var template = view.render(file.toString(), {songs: docs})
      res.end(template)
    })
  }
  if (req.method === 'POST') {
    var data = ''
    req.on('data', function (chunk) {
      data += chunk;
    })
    req.on('end', function() {
      var song = qs.parse(data)
      songs.insert(song, function (err, doc) {
        if (err)  console.log(error);
        res.writeHead(302, {'Location' :'/songs'})
        res.end()
      })
    })
  }
})

routes.addRoute('/songs/new', function (req, res, url) {
  res.setHeader('Content-Type', 'text/html')
  var file = fs.readFileSync('templates/songs/new.html');
  var template = view.render(file.toString(), {})
  res.end(template);
})

routes.addRoute('/public/*', function (req, res, url) {
  res.setHeader('Content-Type', mime.lookup(req.url));
  fs.readFile('.' + req.url, function (err, file) {
    if (err) {
      res.setHeader('Content-Type', 'text/html')
      res.end('404')
    }
    res.end(file)
  })
})

routes.addRoute('/songs/:id/delete', function (req, res, url) {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'POST') {
    songs.remove({_id: url.params.id}, function(err, doc) {
      if (err) return err;
      res.writeHead(302, {'Location': '/songs'})
      res.end()
    })
  }
})

routes.addRoute('/songs/:id', function (req, res, url) {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {
    songs.findOne({_id: url.params.id}, function (err, doc) {
      if (err) console.log (err)
      var file = fs.readFileSync('templates/songs/show.html')
      var template = view.render(file.toString(), doc)
      res.end(template)
    })
  }
})

module.exports = routes;
