var routes = require('routes')();
var fs = require('fs');
var view = require('mustache');
var mime = require('mime');
var qs = require('qs');
var db = require('monk')('localhost/songs');
var songs = db.get('songs');

    routes.addRoute('/songs', function(req, res, url) {
        res.setHeader('Content-Type', 'text/html')
        if (req.method === 'GET') {
            songs.find({}, function(err, docs) {
                var file = fs.readFileSync('templates/songs/index.html')
                var template = view.render(file.toString(), {
                    songs: docs
                })
                res.end(template)
            })
        };
        if (req.method === 'POST') {
            var data = '';
            req.on('data', function(chunk) {
                data += chunk;
            })
            req.on('end', function() {
                var song = qs.parse(data);
                songs.insert(song, function(err, doc) {
                    if (err) res.end('oops');
                    res.writeHead(302, {'Location': '/songs'});
                    res.end();
                })
            })
        }
    })

    routes.addRoute('/songs/:id', function(req, res, url) {
    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'text/html');
      songs.findOne({'_id': url.params.id}, function(err, docs) {
      if (err) console.log(err);

          res.end();
      })
    }

});

routes.addRoute('/songs/:id/delete', (req, res, url) => {
  if (req.method === 'POST') {
    songs.remove({_id: url.params.id}, function(err, doc) {
      if (err) console.log(err)
      res.writeHead(302, {'Location': '/songs'})
      res.end()
    })
  }
})

  routes.addRoute('/public/*', function (req, res, url){
    res.setHeader('Content-Type', mime.lookup(req.url));
    fs.readFile('.' + req.url, function(err, file){
      if (err){
        res.setHeader('Content-Type', 'text/html');
        res.end('404');
      }
        res.end(file);
    })

})

module.exports = routes
