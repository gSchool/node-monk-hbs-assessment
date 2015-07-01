var routes = require('routes')(),
  fs = require('fs'),
  qs = require('qs'),
  view = require('mustache'),
  mime = require('mime'),
  db = require('monk')('localhost/music'),
  songs = db.get('songs')

// read
routes.addRoute('/songs', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {
    songs.find({}, function(err, docs) {
      if (err) {
        console.log('404')
      }
      var file = fs.readFileSync('templates/songs/index.html')
      var template = view.render(file.toString(), {
        songs: docs
      })
      res.end(template)
    })
  }
})

routes.addRoute('/songs/show', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {
    songs.find({}, function(err, docs) {
      if (err) {
        console.log('404')
      }
      var file = fs.readFileSync('templates/songs/show.html')
      var template = view.render(file.toString(), {
        songs: docs
      })
      res.end(template)
    })
  }
})

routes.addRoute('/songs/new', (req, res, url) => {
  console.log(req.url)
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    var file = fs.readFileSync('templates/songs/new.html')
    var template = view.render(file.toString(), {})
    res.end(template)
  }
  if (req.method === 'POST') {
    var data = ''
    req.on('data', function(chunk) {
      data += chunk
      console.log(data)
    })
    req.on('end', function() {
      var song = qs.parse(data)
      songs.insert(song, function(err, doc) {
        if (err) res.end('404')
        res.writeHead(302, {
          'Location': '/songs'
        })
        res.end()
      })
    })
  }
})

routes.addRoute('/songs/:id/delete', (req, res, url) => {
  if (req.method === 'POST') {
    songs.remove({
      _id: url.params.id
    }, function(err, doc) {
      if (err) console.log(err)
      res.writeHead(302, {
        'Location': '/songs'
      })
      res.end()
    })
  }
})

routes.addRoute('/public/*', function(req, res, url) {
  res.setHeader('Content-Type', mime.lookup(req.url))
  fs.readFile('./' + req.url, function(err, file) {
    if (err) {
      res.setHeader('Content-Type', 'text/html')
      res.end('404')
    }
    res.end(file)
  })
})

// routes.addRoute('/public/*', function(req, res, url) {
//   res.setHeader('Content-Type', 'text/css')
//   fs.readFile('./' + req.url, function(err, file) {
//     if (err) {
//       res.setHeader('Content-Type', 'text/html')
//       res.end('404')
//     }
//     res.end(file)
//   })
// })

module.exports = routes
