var routes = require('routes')(),
    fs = require('fs'),
    qs = require('qs'),
    db = require('monk')('localhost/music'), // Syncs up with mongo
    songs = db.get('songs'), // grabs a collection from the music database
    view = require('mustache'),
    mime = require('mime')

routes.addRoute('/songs', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {

  }
})

module.exports = routes
