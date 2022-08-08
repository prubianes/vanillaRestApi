// Dependencies

const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');

// Instantiate the http Server
let httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
})

httpServer.listen(config.httpPort, () => {
    console.log('The HTTP server is listening on port ' + config.httpPort);
})

// Instantiate the https Server
let httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
}

let httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
})

httpsServer.listen(config.httpsPort, () => {
    console.log('The HTTPS server is listening on port ' + config.httpsPort);
})

let unifiedServer = (req, res) => {
    //Get the Url and Parse it
    let parseURL = url.parse(req.url, true);

    //Get the path
    let path = parseURL.pathname;
    let trimmedPath = path.replace(/^\/+|\+$/g, '');

    //Get the query string as an object
    let queryStringObject = parseURL.query;

    //Get the HTTP Method
    let method = req.method.toLowerCase();

    //Get the header as an object
    let headers = req.headers;

    //Get the payload, if any
    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    })

    req.on('end', () => {
        buffer += decoder.end();

        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        let data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffers
        }

        chosenHandler(data, (statusCode, payload) =>{
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};
            let payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log('Returning this response: ', statusCode, payloadString);
        });
    });
};

let handlers = {};

handlers.ping = (data, callback) => {
    callback(200);
}

handlers.notFound = (data, callback) => {
    callback(404);
}

let router = {
    'ping': handlers.ping
}