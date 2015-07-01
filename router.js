var routes = require('routes')(),
    fs = require('fs'),
    db = require('monk') ('localhost/songCollection'),
    songs = db.get('songCollection'),
    qs = require('qs'),
    view = require('mustache'),
    mime = require('mime');

//  CREATE -> route to new song form
routes.addRoute('/songs/new', function (req, res, url) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    var file = fs.readFileSync('templates/songs/new.html')
    var template = view.render(file.toString(), {})
    res.end(template)
  }

// POST request to add new information to the songCollection database
  if (req.method === 'POST') {
    var data = ''
    req.on('data', function (chunk) {
      data += chunk
    })
    var song = qs.parse(data)
    songs.insert(song, function (err, doc) {
      if (err) throw err
      res.writeHead(302, {'Location': '/songs'})
      res.end()
    })
  }
})

// READ -> adds a route to display the index view
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
//  READ -> route to the show page
routes.addRoute('/songs/:id', function (req, res, url) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    songs.findOne({_id: url.params.id}, function (err, song) {
      var file = fs.readFileSync('templates/songs/show.html')
      var template = view.render(file.toString(), {songs: song})
      if (err) throw err
      res.end(template)
    })
  }
})
//  This splat adds a route to a dynamic-static file server
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
routes.addRoute('/songs/:id/delete', function(req, res, url) {
  if (req.method === 'POST') {
    songs.remove({_id: url.params.id}, function (err, doc) {
      if (err) throw err
      res.writeHead(302, {'Location': '/songs'})
      res.end()
    })
  }
})

module.exports = routes
