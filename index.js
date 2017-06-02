var express = require('express');
var app = express();
var httpProxy = require('http-proxy');
var apiProxy = httpProxy.createProxyServer({});

app.all("/api/*", function(req, res) {
    apiProxy.web(req, res, {target: 'http://api.repo.nypl.org', changeOrigin: true});
});

app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/dist', express.static(__dirname + '/dist'));

//app.use(express.static('./app')); // ← adjust

app.use(express.static('./app')); // ← adjust
console.log(__dirname);

app.get('/*', function (req, res) {
    res.sendfile(path.join(__dirname + '/app/index.html'));
});

app.listen(80, function () { console.log('listening'); });