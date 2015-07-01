var routes = require('routes')(),
  fs = require('fs'),
  mime = require('mime'),
  db = require('monk')('localhost/music'),
  songs = db.get('songs'),
  view = require('mustache'),
  qs = require('qs')

routes.addRoute('/songs', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {
    songs.find({}, function (err, docs) {
      if (err) res.end('404')
      var file = fs.readFileSync('templates/songs/index.html')
      var template = view.render(file.toString(), {songs: docs})
      res.end(template)
    })

  }
  if (req.method === 'POST') {
    var data = ''
    req.on('data', function (chunk) {
      data += chunk
    })
    req.on('end', function () {
      var song = qs.parse(data)
      songs.insert(song, function (err, doc) {
        if (err) res.end('404')
        res.writeHead(302, {'Location': '/songs'})
        res.end()
      })
    })
  }
})

routes.addRoute('/songs/new', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {
    var file = fs.readFileSync('templates/songs/new.html')
    var template = view.render(file.toString(), {title: 'add a new song!'})
    res.end(template)
  }
})

routes.addRoute('/songs/:id', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {
    songs.findOne({_id: url.params.id}, function (err, doc) {
      if (err) res.end('404')
      var file = fs.readFileSync('templates/songs/show.html')
      var template = view.render(file.toString(), doc)
      res.end(template)
    })

  }
})

routes.addRoute('/songs/:id/delete', (req, res, url) => {
  if (req.method === 'POST') {
    songs.remove({_id: url.params.id}, function (err, doc) {
      if (err) throw err
      res.writeHead(302, {'Location': '/songs'})
      res.end()
    })
  }
})

routes.addRoute('/public/*', (req, res, url) => {
  res.setHeader('Content-Type', mime.lookup(req.url))
  if (req.method === 'GET') {
    fs.readFile('.' + req.url, function (err, file) {
      if (err) throw err
      res.end(file)
    })
  }
})

module.exports = routes
