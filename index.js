var express = require('express');
var app = express();
var httpProxy = require('http-proxy');
var apiProxy = httpProxy.createProxyServer({});

app.all("/api/*", function(req, res) {
    apiProxy.web(req, res, {target: 'http://api.repo.nypl.org', changeOrigin: true});
});

app.use(express.static('./')); // ← adjust

app.all('/app/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('index.html', { root: __dirname + '/app'});
});

app.listen(3000, function () { console.log('listening'); });