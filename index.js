var express = require('express');
var app = express();
var httpProxy = require('http-proxy');
var apiProxy = httpProxy.createProxyServer({});

app.all("/api/*", function(req, res) {
    apiProxy.web(req, res, {target: 'http://api.repo.nypl.org', changeOrigin: true});
});

//app.use('/js', express.static('./node_modules/*')); // ← adjust
app.use('/node_modules', express.static(__dirname + '/node_modules'));

//app.use(express.static('./app')); // ← adjust

app.use(express.static('./app')); // ← adjust
console.log(__dirname);



//app.use('/src', express.static(__dirname + '/app/src'));
//app.use('/assets', express.static(__dirname + '/app/assets'));
//app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.get('/*', function (req, res) {
    res.sendfile(path.join(__dirname + '/app/index.html'));
});

//app.all('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
  //  res.sendFile('index.html', { root: __dirname + '/app'});
//});

app.listen(3000, function () { console.log('listening'); });