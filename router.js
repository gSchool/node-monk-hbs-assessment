var routes = require('routes')(),
    fs = require('fs'),
    db = require('monk')('localhost/music'),
    qs = require('qs'),
    mime = require('mime'),
    songs = db.get('songs'),
    view = require('mustache')

routes.addRoute('/songs/new', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {
    var file = fs.readFileSync('templates/songs/new.html')
    var template = view.render(file.toString(), {})
    res.end(template)
  }
  if(req.method === 'POST'){
    var data = ''
    req.on('data', function(chunk){
      data += chunk
    })
    req.on('end', function(){
      var song = qs.parse(data)
      songs.insert(song, function(err, doc){
        if(err) throw err
        res.writeHead(302, {'Location': '/songs'})
        res.end()
      })
    })
  }
})
routes.addRoute('/songs', function(req, res, url){
  res.setHeader('Content-Type', 'text/html')
  if(req.method === 'GET'){
    songs.find({}, {sort: {title:1}}, function(err, docs){
      if (err) throw err
      var file = fs.readFileSync('templates/songs/index.html')
      var template = view.render(file.toString(), {songs:docs})
      res.end(template)
    })
  }
})
routes.addRoute('/songs/:id', function(req, res, url){
  res.setHeader('Content-Type', 'text/html')
  if(req.method === 'GET'){
    songs.findOne({_id: url.params.id}, function(err, song){
      if(err) throw err
      var file = readFileSynch('templates/songs/show.html')
      var template = view.render(file.toString(), song)
      res.end(template)
    })
  }
})
routes.addRoute('/songs/:id/delete', function(req, res, url){
  if(req.method === 'POST'){
    res.setHeader('Content-Type', 'text/html')
    bands.remove({_id: url.params.id}, function(err, band){
      if (err) throw err
      res.writeHead(302,{'Location': '/songs'})
      res.end()
    })
  }
})
routes.addRoute('/public/*', function(req, res, url){
  res.setHeader('Content-Type', mime.lookup(req.url))
  fs.readFile('.' + req.url, function(err, file){
    if(err){
      res.setHeader('Content-Type', 'text/html')
      res.end('404')
    }
    res.end(file)
  })
})

module.exports = routes
