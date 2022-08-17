/*
 * Request Handlers
 *
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Define all the handlers
let handlers = {};

//Ping
handlers.ping = (data, callback) => {
    callback(200);
}

// Not-Found
handlers.notFound = (data, callback) => {
    callback(404);
}

handlers.users = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
}

handlers._users = {};

/**
 *  Users - post
 * 
 *  Required data: firstName, lastName, phone, password, tosAgreement
 * 
 *  Optional data: none
 * 
 * @param {*} data 
 * @param {*} callback 
 */
handlers._users.post = (data, callback) => {
    // Check that all required fields are filled out
    let firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    let tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure the user doesnt already exist
        _data.read('users', phone, (err, data) => {
            if (err) {
                // Hash the password
                let hashedPassword = helpers.hash(password);
                // Create the user object
                if (hashedPassword) {
                    let userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    };

                    // Store the user
                    _data.create('users', phone, userObject, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, { 'Error': 'Could not create the new user' });
                        }
                    });
                } else {
                    callback(500, { 'Error': 'Could not hash the user\'s password.' });
                }

            } else {
                // User alread exists
                callback(400, { 'Error': 'A user with that phone number already exists' });
            }
        })
    }
}

/**
 * Users - get
 * 
 * Required data: phone
 * 
 * Optional data: none
 * @param {*} data 
 * @param {*} callback 
 */
handlers._users.get = (data, callback) => {
    // Check that phone number is valid
    let phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    if (phone) {
        // Lookup the user
        _data.read('users', phone,(err, data) => {
            if (!err && data) {
                // Remove the hashed password from the user user object before returning it to the requester
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field' })
    }
};

/**
 * 
 * Users - put 
 * 
 * Required data: phone
 * 
 * Optional data: firstName, lastName, password (at least one must be specified)
 */ 
handlers._users.put = (data,callback) => {
    // Check for required field
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  
    // Check for optional fields
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  
    // Error if phone is invalid
    if(phone){
      // Error if nothing is sent to update
      if(firstName || lastName || password){
        // Lookup the user
        _data.read('users',phone,(err,userData) => {
          if(!err && userData){
            // Update the fields if necessary
            if(firstName){
              userData.firstName = firstName;
            }
            if(lastName){
              userData.lastName = lastName;
            }
            if(password){
              userData.hashedPassword = helpers.hash(password);
            }
            // Store the new updates
            _data.update('users',phone,userData,function(err){
              if(!err){
                callback(200);
              } else {
                console.log(err);
                callback(500,{'Error' : 'Could not update the user.'});
              }
            });
          } else {
            callback(400,{'Error' : 'Specified user does not exist.'});
          }
        });
      } else {
        callback(400,{'Error' : 'Missing fields to update.'});
      }
    } else {
      callback(400,{'Error' : 'Missing required field.'});
    }
  
  };


  /**
   * Users - delete
   * 
   * Required data: phone
   * @param {*} data 
   * @param {*} callback 
   */
  handlers._users.delete = (data,callback) => {
    // Check that phone number is valid
    let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
      // Lookup the user
      _data.read('users',phone,(err,data) => {
        if(!err && data){
          _data.delete('users',phone,(err) =>{
            if(!err){
              callback(200);
            } else {
              callback(500,{'Error' : 'Could not delete the specified user'});
            }
          });
        } else {
          callback(400,{'Error' : 'Could not find the specified user.'});
        }
      });
    } else {
      callback(400,{'Error' : 'Missing required field'})
    }
  };


module.exports = handlers;