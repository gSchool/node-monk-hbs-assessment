var routes = require('routes')()
var fs = require('fs')
var db = require('monk')('localhost/songs')
var songs = db.get('songs')
var qs = require('qs')
var view = require('mustache')
var mime = require('mime')
routes.addRoute('/songs', (req, res, url) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    if (req.method === 'GET') {
      songs.find({}, function (err, docs) {
        if (err) {
          console.log(err)
          res.end('shits broke yo')
          return
        }
        var file = fs.readFileSync('templates/index.html')
        var template = view.render(file.toString(), { songs: docs })
        res.end(template)
      })
    }
  }
  if (req.method === 'POST') {
    var data = ''
    req.on('data', function (chunk) {
      data += chunk
    })
    req.on('end', function () {
      var song = qs.parse(data)
      console.log(song, data)
      songs.insert(song, function (err, doc) {
        if (err) {
          console.log(err)
          res.end('It may have broke vOv')
          return
        }
        res.writeHead(302, {'Location': '/songs'})
        res.end()
      })
    })
  }
})
routes.addRoute('/songs/new', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  var file = fs.readFileSync('templates/new.html')
  var template = view.render(file.toString(), {})
  res.end(template)
})
routes.addRoute('/songs/:id', (req, res, url) => {
  if (req.method === 'GET') {
    songs.findOne({ _id: url.params.id }, function (err, doc) {
      if (err) {
        console.log('fucked up')
        res.end('welp')
        return
      }
      var file = fs.readFileSync('templates/show.html')
      var template = view.render(file.toString(), doc)
      res.end(template)
    })
  }
})
routes.addRoute('/public/*', function (req, res, url) {
  res.setHeader('Content-Type', mime.lookup(req.url))
  fs.readFile('./' + req.url, function (err, file) {
    if (err) {
      res.setHeader('Content-Type', 'text/html')
      res.end('404')
      return
    }
    res.end(file)
  })
})
routes.addRoute('/songs/:id/delete', (req, res, url) => {
  if (req.method === 'POST') {
    songs.remove({_id: url.params.id}, function (err, doc) {
      if (err) {
        console.log(err)
        res.end('well, fuck')
        return
      }
      res.writeHead(302, {'Location': '/songs'})
      res.end()
    })
  }
})
module.exports = routes
