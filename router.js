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
