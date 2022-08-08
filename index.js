// Dependencies

const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

let server = http.createServer((req, res) => {
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
        })
    })
})

server.listen(config.port, () => {
    console.log('The server is listening on port ' + config.port+' in '+ config.envName + ' mode');
})

let handlers = {};

handlers.sample = (data, callback) => {
    callback(406, {'name': 'sample handler'});
}

handlers.notFound = (data, callback) => {
    callback(404);
}

let router = {
    'sample': handlers.sample
}