// Dependencies
const config = require('./config');
const crypto = require('crypto');

// Container for all the helpers
let helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
    try {
        let obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};

// Create a SHA256 hash
helpers.hash = (str) => {
    if (typeof (str) == 'string' && str.length > 0) {
        let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};
// Export the module
module.exports = helpers;