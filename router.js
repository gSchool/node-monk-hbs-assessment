var routes = require('routes')(),
    fs = require('fs'),
    db = require('monk') ('localhost/songCollection'),
    songs = db.get('songCollection'),
    qs = require('qs'),
    view = require('mustache'),
    mime = require('mime');

// Build an app that can create, read, and destroy song resources (edit / update is not needed)

//  CREATE -> route to new song form
routes.addRoute('/songs/new', function (req, res, url) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type')
  }
})

// READ -> display the index view
routes.addRoute('/songs', function (req, res, url) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    songs.find({}, function (err, docs) {
      var file = fs.readFileSync('templates/songs/index.html')
      var template = view.render(file.toString(), {songs: docs})
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
// DESTROY -> deletes a song from the collection
routes.addRoute('songs/:id/delete', function(req, res, url) {
  if (req.method === 'POST') {
    songs.remove({_id: url.params.id}, function (err, doc) {
      if (err) throw err
      res.writeHead(302, {'Location': '/bands'})
      res.end()
    })
  }
})


module.exports = routes
