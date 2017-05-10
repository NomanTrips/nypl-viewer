var express = require('express');
var app = express();
var httpProxy = require('http-proxy');
var apiProxy = httpProxy.createProxyServer({});

app.all("/api/*", function(req, res) {
  console.log(req.url);
    apiProxy.web(req, res, {target: 'http://api.repo.nypl.org', changeOrigin: true});
});

app.use(express.static('./')); // ← adjust

app.listen(3000, function () { console.log('listening'); });