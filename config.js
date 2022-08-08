
let environments = {};

environments.staging = {
    'port' : 3000,
    'envName' : 'staging'
}

environments.production = {
    'port' : 6000,
    'envName' : 'production'
}

let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLocaleLowerCase() : '';

let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;