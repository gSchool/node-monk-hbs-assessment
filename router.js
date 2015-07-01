var routes = require('routes')(),
    fs = require('fs'),
    db = require('monk')('localhost/songs'),
    songs = db.get('songs'),
    qs = require('qs'),
    view = require ('mustache'),
    mime = require ('mime');


routes.addRoute('/songs', function (req, res, url) {

  if (req.method === 'GET') {
    console.log('hi')
  res.setHeader('Content-Type', 'text/html')
  songs.find({}, function (err, docs){
    var file=fs.readFileSync('templates/songs/index.html')
    var template = view.render(file.toString(), {songs: docs})
    res.end(template)
    })
  }

  if (req.method ==='POST'){

    var data=''
    req.on('data', function(chunk){
      data +=chunk
    })
    res.on('end', function(){
      var songs = qs.parse(data)
      songs.insert(songs, function(err,doc){
        if(err) res.end ('error')
        res.writeHead(302, {'Location': '/songs'})
        res.end()
      })
    })
  }
})

routes.addRoute('/songs/new', function(req,res,url){
  console.log('new')
  res.setHeader('Content-Type', 'text/html')
  fs.readFile('templates/songs/new.html', function(err,file){
    if (err) res.end('err')
    res.end(file.toString())
  })
})

routes.addRoute('/songs/:id', function (req, res, url) {

   if (req.method === "GET") {
       res.setHeader('Content-Type', 'text/html')
       songs.findOne({_id: url.params.id}, function (err, doc) {
           if (err) console.log(err)
           var file =fs.readFileSync('templates/songs/show.html')
           var template = view.render(file.toString(), doc)
           res.end(template);
       })
   }
 })

  routes.addRoute('/songs/:id/delete', function (req, res, url)  {

    if (req.method === 'POST') {
      songs.remove({_id: url.params.id}, function(err, doc) {
        if (err) console.log(err)
        res.writeHead(302, {'Location': '/songs'})
        res.end()
       })
     }
   })

   routes.addRoute('/public/*', function(req,res,url){

     res.setHeader('Content-Type', mime.lookup(req.url))
     fs.readFile('./' + req.url, function(err,file){
       if (err){
         res.setHeader('Content-Type', 'text/html')
         res.end('404')
       }
       res.end(file)
     })

})


module.exports = routes;
