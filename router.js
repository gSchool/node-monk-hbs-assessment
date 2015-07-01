var routes = require('routes')(),
    fs = require('fs'),
    db = require('monk')('localhost/music'),
    songs = db.get('songs'),
    view = require('mustache'),
    qs = require('qs'),
    mime = require('mime');


routes.addRoute('/songs', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html');
  if (req.method === 'GET') {
    songs.find({}, (err, doc) => {
      if (err) throw new Error('cannot read songs');
      var file = fs.readFileSync('views/songs/index.html');
      var template = view.render(file.toString(), {songs: doc});
      res.end(template);
    });
  }

  if (req.method === 'POST') {
    var accum = '';
    req.on('data', (chunk) => {
      accum += chunk;
    });

    req.on('end', () => {
      var data = qs.parse(accum);

      songs.insert(data, (err, doc) => {
        if (err) throw new Error('cannot insert song');
        res.writeHead(302, {'Location': '/songs'});
        res.end();
      });
    });
  }
});

routes.addRoute('/songs/new', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html');
  if (req.method === 'GET') {
    var file = fs.readFileSync('views/songs/new.html');
    var template = view.render(file.toString(), {});
    res.end(template);
  }
});

routes.addRoute('/public/*', (req, res, url) => {
  res.setHeader('Content-Type', mime.lookup(req.url));
  if (req.method === 'GET') {
    fs.readFile('.' + req.url, (err, file) => {
      if (err) res.end("404");
      res.end(file)
    });

  }

});

routes.addRoute('/songs/:id', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html');
  if (req.method === 'GET') {
    songs.findOne({_id: url.params.id}, (err, doc) => {
      if (err) throw new Error('cannot find one id');
      var file = fs.readFileSync('views/songs/show.html');
      var template = view.render(file.toString(), doc);
      res.end(template);
    });
  }
});

routes.addRoute('/songs/:id/delete', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html');
  if (req.method === 'GET') {
    songs.remove({_id: url.params.id}, (err, doc) => {
      if (err) throw new Error('cannot remove song');
      res.writeHead(302, {'Location': '/songs'})
      res.end();
    });
  }
});


module.exports = routes
