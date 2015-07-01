var routes = require('routes')();
var fs = require('fs');
var db = require('monk')('localhost/music');
var songs = db.get('songs');
var  qs = require('qs');
var view = require('mustache');
var mime = require('mime');


routes.addRoute('/songs', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {
    songs.find({}, function (err, docs) {
      var file = fs.readFileSync('templates/songs/index.html')
      var template = view.render(file.toString(), { songs: docs, pageTitle: 'List of Songs:' })
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
});

routes.addRoute('/songs/new', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
    var file = fs.readFileSync('templates/songs/new.html')
    var template = view.render(file.toString(), {})
    res.end(template)
});

routes.addRoute('/songs/:id', (req, res, url) => {
  if (req.method === 'GET') {
    songs.findOne({_id: url.params.id}, function (err, doc) {
      if (err) res.end('Sorry 404')
      var file = fs.readFileSync('templates/songs/show.html')
      var data = doc
      var template = view.render(file.toString(), doc)
      res.end(template)
    })
  }
});

routes.addRoute('/songs/:id/delete', (req, res, url) => {
  if (req.method === 'POST') {
    songs.remove({_id: url.params.id}, function (err, doc) {
      if (err) res.end('404 -- Didn\'t Delete')
      res.writeHead(302, {Location: '/songs'})
      res.end()
    })
  }
});

routes.addRoute('/public/*', (req, res, url) => {
  res.setHeader('Content-Type', mime.lookup(req.url))
  fs.readFile('.' + req.url, function (err, file) {
    if (err) res.end('404, page doesn\'t exist')
    res.end(file)
  })
})

routes.addRoute('/', (req, res, url) => {
  res.end('Type in the URL')
})

module.exports = routes
