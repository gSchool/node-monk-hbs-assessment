var routes = require('routes')(),
    fs = require('fs'),
    db = require('monk')('localhost/music'),
    songs = db.get('songs'),
    view = require('mustache'),
    url = require('url'),
    mime = require('mime'),
    qs = require('qs')

routes.addRoute('/songs', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {
    songs.find({}, function(err, files) {
       if(err) res.end('There no songs in here')
       var file = fs.readFileSync('templates/index.html')
       var template = view.render(file.toString() , {songs : files})
       res.end(template)
    })
  }
  if (req.method === 'POST') {
    var acum = ''
    req.on("data", function(chunk) {
      acum += chunk
    })

    req.on('end', function(){
      var song = qs.parse(acum)
      songs.insert(song, function(err, data) {
        if(err) res.end('Something went wrong')
        res.writeHead(302, {'Location' : '/songs'})
        res.end()
      })
    })
  }
})

routes.addRoute('/songs/new', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  if(req.method === 'GET') {
    var file = fs.readFileSync('templates/new.html')
    var template = view.render(file.toString(), {})
    res.end(template)
  }
})

 routes.addRoute('/songs/:id', (req, res, url) => {
   res.setHeader('Content-Type', 'text/html')
   if( req.method === 'GET') {
     songs.findOne({_id : url.params.id}, function(err, song) {
       if (err) res.end('Something went wrong')
       var file = fs.readFileSync('templates/show.html')
       var template = view.render(file.toString(), song)
       res.end(template)
     })
   }
 })


 routes.addRoute('/songs/:id/delete', (req, res, url) => {
   if(req.method === 'POST') {
     songs.remove({_id : url.params.id}, function(err, data){
       if (err) res.end('404')
       res.writeHead(302, {'Location' : '/songs'})
       res.end()
     })
   }
 })

 routes.addRoute('/public/*', (req, res, url) => {
   res.setHeader('Content-Type', mime.lookup(req.url))
   fs.readFile('.' + req.url, function(err, file) {
     if(err) res.end('Can\'t find it')
     res.end(file)
   })
 })

module.exports = routes
