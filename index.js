// Dependencies

const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

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
        res.end('Hello World\n');
    
        console.log('Request recieved on path:' + trimmedPath + ' With method: ' + method);
    })


})

server.listen(3000, () => {
    console.log('The server is listening on port 3000.');
})