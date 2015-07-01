var routes = require('routes')(),
        fs = require('fs'),
      view = require('mustache'),
      mime = require('mime'),
        db = require('monk')('localhost/music'),
     songs = db.get('songs'),
        qs = require('qs')

routes.addRoute('/songs', (req, res, url) => {
  console.log(url.route)
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {
    songs.find({}, function (err, docs) {
      var file = fs.readFileSync('templates/songs/index.html')
      var template = view.render(file.toString(), { songs: docs})
      res.end(template)
    })
  }

  if (req.method === 'POST') {
    var data = ''

    req.on('data', function (chunk) {
      data += chunk
    })

    req.on('end', function() {
      var song = qs.parse(data)
      songs.insert(song, function (err, doc) {
        if (err) res.end ('oops from insert')
        res.writeHead(302, {'Location': '/songs'})
        res.end()
      })
    })
  }
})

routes.addRoute('/songs/new', (req, res, url) => {
  console.log(url.route)
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    songs.find({}, function (err, docs) {
    console.log('Here')
      var file = fs.readfileSync('templates/songs/new.html')
      var template = view.render(file.toString(), {})
      res.end(template)
    })
  }
})

routes.addRoute('/songs/:id', (req, res, url) => {
  console.log(url.route)
  console.log(url.params.id)
  if (req.method === 'GET') {
    songs.findOne({_id: url.params.id}, function (err, doc) {
      if (err) console.log('fucked up')
      var file = fs.readFileSync('templates/songs/show.html')
      var template = view.render(file.toString(), doc)
      res.end(template)
    })
  }
})

routes.addRoute('/songs/:id/delete', (req, res, url) => {
  console.log(url.route)
  if (req.method === 'POST') {
    songs.remove({_id: url.params.id}, function (err, doc) {
      if (err) console.log(err)
      res.writeHead(302, {'Location': '/songs'})
      res.end()
    })
  }
})

routes.addRoute('/public/*', function (req, res, url) {
  res.setHeader('Content-Type', mime.lookup (req.url))
  fs.readFile('.' + req.url, function (err, file) {
    if (err) {
      res.setHeader('Content-Type', 'text/html')
      res.end('404')
    }
    res.end(file)
  })
})

module.exports = routes
