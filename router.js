var routes = require('routes')(),
    fs = require('fs'),
    db = require('monk')('localhost/songs'),
    songs = db.get('songs'),
    qs = require('qs'),
    view = require('mustache'),
    mime = require('mime')


routes.addRoute('/songs', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {
    songs.find({}, function(err, docs) {
      if (err) res.end ('404')
      var file = fs.readFileSync('templates/songs/index.html')
      var template = view.render(file.toString(), {songs: docs})
      res.end(template)
    })
  }
  if (req.method === 'POST') {
    var data = ''
    req.on('data', function(chunk) {
      data += chunk
    })
    req.on('end', function() {
      var song = qs.parse(data)
      var insertSong = songs.insert(song)
      insertSong.on('success', function() {
        res.writeHead(302, {'Location': '/songs'})
        res.end()
      })
    })
  }
})

routes.addRoute('/songs/:id', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET')
  songs.findOne({_id: url.params.id}, function(err, docs) {
    if (err) res.end('404')
    var file = fs.readFileSync('templates/songs/show.html')
    var template = view.render(file.toString(), {songs: docs})
    res.end(template)
  })
})

routes.addRoute('/songs/:id/delete', (req, res, url) => {
  if (req.method === 'POST') {
    songs.remove({_id: url.params.id}, function(err) {
      if (err) res.end('404')
      res.writeHead(302, {'Location': '/songs'})
      res.end()
    })
  }
})


routes.addRoute('/public/*', (req, res, url) => {
  res.setHeader('Content-Type', mime.lookup(req.url))
  fs.readFile('.' + req.url, function(err, file) {
    if (err) {
      res.setHeader('Content-Type', 'text/html')
      res.end('404')
    }
    res.end(file)
  })
})

module.exports = routes
