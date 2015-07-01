var routes = require('routes')(),
    fs = require('fs'),
    mime = require('mime'),
    db = require('monk')('localhost/song'),
    song = db.get('song'),
    view = require('mustache'),
    qs = require('qs');

routes.addRoute('/songs', (req, res, url) => {
  var mimeType = mime.lookup(req.url);
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    song.find({}, function(err,docs){
      var file = fs.readFileSync('templates/songs/index.html')
      var template = view.render(file.toString(),{song: docs})
      res.end(template)
    })
  }
})

routes.addRoute('/songs/new', (req, res, url) =>{
  var mimeType = mime.lookup(req.url);
  res.setHeader('Content-Type','text/html')
  var file = fs.readFileSync('templates/songs/new.html')
  var template = view.render(file.toString(),{})
  res.end(template)
})

routes.addRoute('/songs/create',(req,res,url) =>{
  var data = ""
  req.on('data',function(chunk){
    data += chunk
  })
  req.on('end',function(){
    var track = qs.parse(data)
    song.insert(track,function(err,doc){
      res.writeHead(302,{'Location':'/songs'})
      res.end()
    })
  })
})


routes.addRoute('/songs/:id/edit',(req,res,url) =>{
  if(req.method === 'GET'){
    song.findOne({_id: url.params.id}, function(err,song){
      var file = fs.readFileSync('templates/songs/edit.html')
      var template = view.render(file.toString(),song)
      res.end(template)
    })
  }
})

routes.addRoute('/songs/:id/delete',(req,res,url) =>{
  if(req.method === 'POST'){
    song.remove({_id: url.params.id}, function(err,song){
      if(err)return err
      res.writeHead(302,{'Location': '/songs'})
      res.end()
    })
  }
})

routes.addRoute('/songs/:id/update', (req,res,url) =>{
  var data = ''
  req.on('data',function (chunk){
    data += chunk
  })
  req.on('end',function(){
    var track = qs.parse(data)
    song.update({_id: url.params.id}, track, function(err,song){
      res.writeHead(302,{'Location':'/songs'})
      res.end()
    })
  })
})

routes.addRoute('/songs/:id',(req,res,url) =>{
  if(req.method === 'GET'){
    song.findOne({_id: url.params.id}, function(err,song){
      var file = fs.readFileSync('templates/songs/show.html')
      var template = view.render(file.toString(),song)
      res.end(template)
    })
  }
})

routes.addRoute('/public/*',(req, res, url) =>{
  res.setHeader('Content-Type', mime.lookup(req.url))
  fs.readFile('./' + req.url, function(err,file){
    if(err){
      res.end('404')
    }
    res.end(file)
  })
})

routes.addRoute('/',(req,res,url) =>{
  res.writeHead(302,{'Location':'/songs'})
  res.end()
})

module.exports = routes
