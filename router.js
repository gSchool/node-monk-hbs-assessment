var routes = require('routes')(),
    fs = require('fs'),
    view = require('mustache'),
    qs = require('qs'),
    db = require('monk')('localhost/songs'),
    songs = db.get('songs'),

    mime = require('mime');



routes.addRoute('/songs', function (req, res, url) {
  res.setHeader('Content-Type', 'text/html');
  if (req.method === 'GET') {
    songs.find({}, function (err, docs) {
      if (err) {
        console.log(err)
      } else {
        var file = fs.readFileSync('./templates/songs/index.html');
        var template = view.render(file.toString(), {songs: docs});
        res.end(template)
      }

    })
  }
  if (req.method === 'POST') {

    var result = '';
    req.on('data', function (chunk) {

      result += chunk.toString();
    });
    req.on('end', function () {
      result = qs.parse(result);
      result.length = result.length + 'ms';
      songs.insert(result, function (err, code) {
        if (err) console.log(err);
        console.log(code);
        res.writeHead(302, {'Location': '/songs'});
        res.end()

      });

    });
  }
});
routes.addRoute('/songs/new',function(req,res,url){
  if(req.method ==='GET') {
    var file = fs.readFileSync('./templates/songs/new.html');
    var template = view.render(file.toString(), {});
    res.end(template);
  }
})
routes.addRoute('/songs/:id/delete', function (req, res, url) {
  if (req.method === 'POST') {
    console.log('del');
    songs.remove({_id: url.params.id});
    res.writeHead(302, {'Location': '/songs'});
    res.end();
  }
});
routes.addRoute('/songs/:id', function (req, res, url) {
  res.setHeader('Content-Type', 'text/html');
  if (req.method === 'GET') {
    songs.findOne({_id:url.params.id}, function (err, song) {
      if(err) {
        console.log(err)
      } else {
        var file = fs.readFileSync('./templates/songs/show.html');
        var template = view.render(file.toString(), song);
        res.end(template)
      }

    })
  }
});

routes.addRoute('/public/*',function(req,res,url){
  res.setHeader('Content-Type',mime.lookup(req.url));
  fs.readFile('.' + req.url, function (err, file) {
    if (err) {
      res.end('404');
    } else {
      res.end(file)
    }

  })
});

module.exports = routes;
