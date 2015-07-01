var routes = require('routes')(),
    fs = require('fs'),
    qs = require('qs'),
    db = require('monk')('localhost/music'), // Syncs up with mongo
    songs = db.get('songs'), // grabs a collection from the music database
    view = require('mustache'),
    mime = require('mime')

routes.addRoute('/songs', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {
    songs.find({}, {sort: {title: 1}}, function(err, docs) {
      if (err) console.log('no song')
      var file = fs.readFileSync('templates/songs/index.html')
      var template = view.render(file.toString(), {songs: docs}) // give property to docs, an array from mongo
      res.end(template)
    })
  }
  if (req.method === 'POST') {
    console.log(req.method)
    var data = ''
    req.on('data', function(chunk) {
      data += chunk
    })
    req.on('end', function(){
      var song = qs.parse(data)
      songs.insert(song, function(err, doc) {
        if (err) res.end('oops')
        res.writeHead(302, {'Location': '/songs'})
        res.end()
      })
    })
    console.log('Thanks for the data!')
  }
})
routes.addRoute('/songs/new', function (req,res,url) {
  console.log(req.url)
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {
    console.log(req.method)
    var file = fs.readFileSync('templates/songs/new.html')
    var template = view.render(file.toString(), {})
    res.end(template)
  }
})
routes.addRoute('/songs/:id', function(req, res, url) {
  console.log(req.url)
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {
    console.log(req.method);
    songs.findOne({_id: url.params.id}, function(err, doc) {
      if (err) res.end('It broke')
      var file = fs.readFileSync('templates/songs/show.html')
      var template = view.render(file.toString(), doc) 
      res.end(template)
    })
  }
})
routes.addRoute('/bands/:id/delete', (req, res, url) => {
  if (req.method === 'POST') {
    bands.remove({_id: url.params.id}, function(err, doc) {
      if (err) console.log(err)
      res.writeHead(302, {'Location': '/bands'})
      res.end()
    })
  }
})
routes.addRoute('/public/*', function (req, res, url) { // dynamically selecting public anything
  console.log(req.url)
  res.setHeader('Content-Type', mime.lookup(req.url)) // needed because of the splat
  fs.readFile('.'+ req.url, function (err, file) { // the dynamic part for our static files
    if (err) {
      res.setHeader('Content-Type', 'text/html')
      res.end('404')
    }
    res.end(file)
  })
})
module.exports = routes
