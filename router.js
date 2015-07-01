const routes = require('routes')();
const fs = require('fs');
const db = require('monk')('localhost/music');
const songs = db.get('songs');
const view = require('mustache');
const mime = require('mime');
const qs = require('qs');

routes.addRoute('/songs', (req, res, url) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    songs.find({}, (err, docs) => {
      var file = fs.readFileSync('templates/songs/index.html');
      var template = view.render(file.toString(), {
        pageTitle: 'List Of Songs',
        songs: docs
      });
      res.end(template);
    })
  }
});

routes.addRoute('/songs/new', (req, res, url) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    fs.readFile('./templates/songs/new.html', (err, file) => {
      if (err) throw err;
      res.end(file.toString())
    })
  }

  if (req.method === 'POST') {
    var body = '';
    req.on('data', (data) => {
      body += data;
    });
    req.on('end', () => {
      body = qs.parse(body);
      songs.insert({
        name: body.name,
        length: body.length,
        artist: body.artist
      }, (err, doc) => {
        if (err) throw err;
        res.writeHead(302, {
          'Location': '/songs'
        });
        res.end();
      })
    })
  }
});

routes.addRoute('/songs/:id', (req, res, url) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    songs.find({
      _id: url.params.id
    }, (err, docs) => {
      var file = fs.readFileSync('templates/songs/show.html');
      songs.find({}, (err, docs) => {
      });
      var template = view.render(file.toString(), {
        songs: docs
      });
      res.end(template);
    })
  }
});

routes.addRoute('/songs/:id/delete', (req, res, url) => {
  if (req.method === 'POST') {
    songs.remove({
      _id: url.params.id
    }, (err, doc) => {
      if (err) throw err;
      res.writeHead(302, {
        'Location': '/songs'
      });
      res.end()
    })
  }
});

routes.addRoute('/public/*', (req, res, url) => {
  res.setHeader('Content-Type', mime.lookup(req.url));
  fs.readFile('./' + req.url, (err, file) => {
    if (err) {
      res.setHeader('Content-Type', 'text/html');
      res.end('404');
    }
    res.end(file);
  });
});


module.exports = routes;