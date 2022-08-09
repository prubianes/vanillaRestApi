const fs = require('fs');
const path = require('path');

let lib = {};

lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = (dir, file, data, callback) => {
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            let stringData = JSON.stringify(data);
            fs.writeFile(fileDescriptor, stringData, function (err) {
                if (!err) {
                    fs.close(fileDescriptor, function (err) {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }
                    })
                } else {
                    callback('Error writing to the new file');
                }
            });
        } else {
            callback('Could not create a new file, it may already exist');
        }
    })
}

lib.read = (dir, file, callback) => {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', function (err, data) {
        callback(err, data);
    })
}

lib.update = (dir, file, callback) => {
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            let stringData = JSON.stringify(data);
            fs.truncate(fileDescriptor, function (err) {
                if (!err) {
                    fs.writeFile(fileDescriptor, stringData, function (err) {
                        if (!err) {
                            fs.close(fileDescriptor, function (err) {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing file');
                                }
                            })
                        } else {
                            callback('Error writing to existing file');
                        }
                    })
                } else {
                    callback('Error truncating file');
                }
            })
        } else {
            callback('Could not open the file for updating');
        }
    })
}

lib.delete = (dir, file, callback) => {
    fs.unlink(lib.baseDir + dir + '/' + file + '.json', function (err) {
        if (!err) {
            callback(false);
        } else {
            callback('Error deleting file.')
        }
    })
}

module.exports = lib;