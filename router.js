//**** I think my node_modules are being ignored? Installed mustache and monk in terminal project directory.*****

var routes = require('routes')(),
  fs = require('fs'),
  qs = require('qs'),
  view = require('mustache'),
  mime = require('mime'),
  db = require('monk')('localhost/songs'),
  songs = db.get('songs')

routes.addRoute('/songs', function (req, res, url) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    songs.find({}, function (err, docs) {
      if (err) throw err
      var file = fs.readFileSync('songs/index.html')
      var template = view.render(file.toString(), { songs: docs })
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
        if (err) res.end('oops')
        res.writeHead(302, {'Location': '/songs'})
        res.end()
      })
    })
  }
})
routes.addRoute('/songs', function (req, res, url) {
  res.setHeader('Content-Type', 'text/html')
  var file = fs.readFileSync('songs/new.html')
  var template = view.render(file.toString(), {})
  res.end(template)
})

routes.addRoute('/songs/:id', function (req, res, url) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    url = url.params.id
    songs.findOne({_id: url}, function (err, docs) {
      if (err) throw err
      var file = fs.readFileSync('songs/show.html')
      var template = view.render(file.toString(), { name: docs.name, _id: docs._id })
      res.end(template)
    })
  }
})
routes.addRoute('/public/*', function (req, res, url) {
  res.setHeader('Content-Type', mime.lookup(req.url))
  fs.readFile('.' + req.url, function (err, file) {
    if (err) {
      res.setHeader('Content-Type', 'text/html')
      res.end('404')
    }
    res.end(file)
  })
})

routes.addRoute('/songs/:id/delete', function (req, res, url) {
  if (req.method === 'POST') {
    res.setHeader('Content-Type', 'text/html')
    songs.remove({_id: url.params.id}, function (err, doc) {
      if (err) throw err
      res.writeHead(302, {'Location': '/songs'})
      res.end()
    })
  }
})

module.exports = routes
