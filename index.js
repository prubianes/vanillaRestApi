// Dependencies

const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

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

        // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        let data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
        }

        chosenHandler(data, (statusCode, payload) =>{
            // Use the status code returned from the handler, or set the default status code to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload returned from the handler, or set the default payload to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to a string
            let payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log(trimmedPath,statusCode);
        });
    });
};

let router = {
    'ping': handlers.ping,
    'users': handlers.users
}