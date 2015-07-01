var routes = require('routes')(),
  fs = require('fs'),
  db = require('monk')('localhost/music'),
  qs = require('qs'),
  bars = require('handlebars'),
  songs = db.get('songs'),
  mime = require('mime')

function prep (file, obj, res) {
  res.setHeader('Content-Type', 'text/html');
  var file = fs.readFileSync(file)
  var template = bars.compile(file.toString())(obj)
  res.end(template)
}

routes.addRoute('/songs', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET'){
    songs.find({}, function(err, docs){
      console.log(docs)
      if (err) {
        console.log(err)
        res.end()
      }
      prep ('templates/songs/index.html', {songs: docs}, res)
    })
  }
  if (req.method === 'POST') {
    console.log('got post');
    var data = '';
    req.on('data', function (chunk) {
      data += chunk;
    });
    req.on('end', function () {
      //console.log(data)
      var song = qs.parse(data);
      songs.insert(song, function (err, doc) {
        res.writeHead(302, { 'Location': '/songs' });
        res.end();
      });
    });
  }
})

routes.addRoute('/songs/new', function (req, res, url) {
  prep('templates/songs/new.html', {}, res)
});

routes.addRoute('/songs/:id', function (req, res, url) {
  if (req.method === 'GET') {
    songs.findOne({ _id: url.params.id }, function (err, doc) {
      prep('templates/songs/show.html', doc, res)
    })
  }
  if (req.method === 'POST') {
    var data = '';
    req.on('data', function (chunk) {
      data += chunk;
    });
    req.on('end', function () {
      var song = qs.parse(data);
      songs.insert(song, function (err, doc) {
        res.writeHead(302, { 'Location': '/songs' });
        res.end();
      });
    });
  }
});

routes.addRoute('/songs/:id/delete', function (req, res, url) {
  if (req.method === 'POST') {
    console.log('delete ' + url.params.id)
    var data = '';
    req.on('data', function (chunk) {
    });
    req.on('end', function () {
      songs.remove({_id: url.params.id }, function (err, doc) {
        res.writeHead(302, { 'Location': '/songs' });
        res.end();
      });
    });
  }
});

routes.addRoute('/public/*', function (req, res, url) {
  fs.readFile('./' + req.url, function (err, file) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('404')
    } else {
      res.setHeader('Content-Type', mime.lookup(req.url))
      res.end(file)
    }
  })
})

module.exports = routes
