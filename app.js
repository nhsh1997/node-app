//importing node framework
var express = require('express');

var app = express();//Respond with "hello world" for requests that hit our root "/"
app.get('/', function (req, res) {
  res.send('hello world');
});

module.exports = app;
