var routes = require('routes')();
var fs = require('fs');
var db = require('monk')('localhost/songs');
var qs = require('qs');
var titles = db.get('titles');
var view = require('mustache');
var mime = require('mime');


routes.addRoute('/songs', function (req, res, url) {
    res.setHeader('Content-Type', 'text/html');
    if (req.method === 'GET') {
        titles.find({}, function (err, docs) {
            var file = fs.readFileSync('templates/songs/index.html');
            var template = view.render(file.toString(), {pageTitle: 'Song Titles', titles: docs});
            res.end(template);
        })
    }
    if (req.method === "POST") {
        var result = '';
        req.on('data', function (chunk) {
            result += chunk;
        });
        req.on('end', function () {
            var title = qs.parse(result);
            titles.insert(title, function (err, doc) {
                if (err) {
                    res.end('ERROR!!!!!!!!UZHASNO!');
                }
                res.writeHead(302, {'Location': '/songs'});
                res.end();

            })
        })
    }
});

routes.addRoute('/songs/new', function (req, res, url) {
    if (req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html');
        titles.find({}, function (err, docs) {
            var file = fs.readFileSync('templates/songs/new.html');
            var template = view.render(file.toString(), docs);
            res.end(template);
        })
    }
});

routes.addRoute('/songs/:id', function (req, res, url) {
    if (req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html');
        titles.findOne({_id: url.params.id}, function (err, docs) {
            var file = fs.readFileSync('templates/songs/show.html');
            var template = view.render(file.toString(), {title: docs.title, length: docs.length});
            res.end(template);
        })
    }
});

routes.addRoute('/public/*', function (req, res, url) {
    res.setHeader('Content-Type', mime.lookup(req.url));
    fs.readFile('.' + req.url, function (err, file) {
        if (err) {
            res.setHeader('Content-Type', 'text/html');
            res.end('404')
        }
        res.end(file);
    })
});

routes.addRoute('/songs/:id/delete', function (req, res, url) {
    if (req.method === 'POST') {
        titles.remove({_id: url.params.id}, function (err, doc) {
            if (err) console.log(err);
            res.writeHead(302, {'Location': '/songs'});
            res.end()
        })
    }
});

module.exports = routes;
