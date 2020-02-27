const AWS = require('aws-sdk');
const uuid = require('uuid');

// set up the express router
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.USERS;

module.exports = {
  getUsers: () => new Promise((resolve, reject) => {
      // params for db read
      const params = {
        TableName: TABLE_NAME,
      };

      // read from db then resolve or reject data
      dynamoDb.scan(params, (error, data) => {
        if (error) {
          reject({ code: error.statusCode || 501, payload: error })
        } else {
          resolve({ code: 200, payload: data })
        }
      });
  }),
  addUser: body => new Promise((resolve, reject) => {
      // validate the input
      if (typeof body.email !== 'string') {
        reject({ code: 400, payload: 'Email must be a string' });
      } else if (typeof body.phone !== 'string') {
        reject({ code: 400, payload: 'Phone number must be a string' });
      } else if (typeof body.role !== 'string') {
        reject({ code: 400, payload: 'Role must be a string' });
      } else if (!Array.isArray(body.contracts)) {
        reject({ code: 400, payload: 'Contracts number must be an array' });
      } 

      // timestamp for db
      const timestamp = new Date().getTime();
      
      // params for db write
      const params = {
        TableName: TABLE_NAME,
        Item: {
          id: JSON.stringify(uuid.v1()),
          name: body.name, 
          email: body.email,
          phone: body.phone,
          role: body.role,
          contracts: body.contracts,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      };

      // write to db then resolve or reject
      dynamoDb.put(params, error => {
        if (error) {
          reject({ code: error.statusCode || 501, payload: error })
        } else {
          resolve({ code: 200, payload: params.Item })
        }
      });
  })
}
