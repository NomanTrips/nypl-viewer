var express = require('express');
var app = express();
var http = require('http');
var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({});

    proxy.on('proxyReq', function (proxyReq, req, res, options) {
 
        proxyReq.setHeader('origin', 'http://localhost:5050');
    });

var server = http.createServer(function (req, res) {
    // You can define here your custom logic to handle the request 
    // and then proxy the request.
    console.log(res.headers);
    //req.setHeader('origin', 'http://localhost:5050');
    //res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
    req.headers.origin = 'http://localhost:5050';
           console.log('King Jubba!!!');
//console.log(req.headers);
    proxy.web(req, res, { target: 'http://api.repo.nypl.org' });



});
server.listen(5050);



/*
proxy.on('proxyReq', function (proxyReq, req, res) {
    console.log('running proxy req');
  req.writeHead({
    'Access-Control-Allow-Origin': '*'
  });
 
 // res.end('Something went wrong. And we are reporting a custom error message.');
});
*/
//proxy.on('proxyReq', function (proxyReq, req, res) {
//res.writeHead(200,{
//'Access-Control-Allow-Origin': '*'
//});
//});


// 
// Create your custom server and just call `proxy.web()` to proxy 
// a web request to the target passed in the options 
// also you can use `proxy.ws()` to proxy a websockets request 
// 
/*
var server = http.createServer(function(req, res) {
  // You can define here your custom logic to handle the request 
  // and then proxy the request. 
  console.log(req.url);
  proxy.web(req, res, { target: 'http://api.repo.nypl.org' });
});
 
console.log("listening on port 5050")
server.listen(5050);
*/
/*
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
*/
app.use(express.static('./')); // ← adjust


app.listen(3000, function () { console.log('listening'); });

/*
var server = http.createServer(function(req, res) {
  // You can define here your custom logic to handle the request 
  // and then proxy the request. 
    console.log('running this');
      if (req.url.match('http://api.repo.nypl.org/*')) {
          console.log('proxying...');
            proxy.web(req, res, { target: 'http://api.repo.nypl.org' });
      }

});
 
console.log("listening on port 5050")
server.listen(5050);

//var proxy = new httpProxy.RoutingProxy();
/*
var proxy = httpProxy.createProxyServer({});

var server = http.createServer(function (req, res) {
    // You can define here your custom logic to handle the request 
    // and then proxy the request. 
    console.log(req);
    if (req.url.match(new RegExp('^\/api\/'))) {
        console.log('proxy request intercepted...');
        proxy.web(req, res, { target: 'http://api.repo.nypl.org' });
    } 
    
});
server.listen(3000);


function apiProxy(host, port) {
    return function (req, res, next) {
        if (req.url.match(new RegExp('^\/api\/'))) {
            console.log('proxy request intercepted...');
            proxy.proxyRequest(req, res, { host: host, port: port });
        } else {
            next();
        }
    }
}
/*
app.configure(function () {
    app.use(express.static('./')); // ← adjust
    app.use(apiProxy('localhost', 3000));
    app.use(express.bodyParser());
    app.use(express.errorHandler());
});

var apiProxy = function (host, port) {
    return function (req, res, next) {
        console.log('api proxy running');
        if (req.url.match(new RegExp('^\/api\/'))) {
            console.log('proxy request intercepted...');
            proxy.web(req, res, { target: 'http://api.repo.nypl.org' });
            // proxy.proxyRequest(req, res, { host: host, port: port });
        } else {
            next();
        }
    }
}
*/



//app.get("http://api.repo.nypl.org/*", function(req, res){
//  console.log('running');
//apiProxy.web(req, res, { target: 'http://api.repo.nypl.org' });
//});
