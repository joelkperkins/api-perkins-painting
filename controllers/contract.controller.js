const AWS = require('aws-sdk');
const uuid = require('uuid')

// connect to db
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.CONTRACTS;

module.exports = {
  getContractsForUser: contracts => new Promise((resolve, reject) => {
      // get ids for contracts
      const idList = Object.keys(contracts);
      // build params for db read
      const params = {
        TableName:  TABLE_NAME,
      };
      
      // read db then resolve/reject
      return dynamoDb.scan(params, (error, data) => {
        if (error) {
          reject({ code: error.statusCode || 501, payload: error });
        } else {
          data = data.Items.filter(i =>  idList.find(id => id === i.id));
          resolve({ code: 200, payload: data });
        }
      });
  }),
  addContract: body => new Promise((resolve, reject) => {

    // gen timestamp for db
    const timestamp = new Date().getTime();
  
    // validate body
    if (typeof body.contract !== 'string') {
      reject({ code: 400, payload: 'Contract must be a string' });
    } else if (typeof body.builder !== 'string') {
      reject({ code: 400, payload: 'Builder number must be a string' });
    } else if (typeof body.contact !== 'string') {
      reject({ code: 400, payload: 'Contact must be a string' });
    } else if (typeof body.email !== 'string') {
      reject({ code: 400, payload: 'Email must be a string' });
    } else if (typeof body.phases !== 'number') {
      reject({ code: 400, payload: 'Phases must be a number' });
    } else if (typeof body.project !== 'string') {
      reject({ code: 400, payload: 'Project must be a string' });
    } else if (!Array.isArray(body.units)) {
      reject({ code: 400, payload: 'Contracts must be an array' });
    } 
  
    // params for db write
    const params = {
      TableName: TABLE_NAME,
      Item: {
        id: uuid.v1(),
        contract: body.contract,
        builder: body.builder,
        contact: body.contact,
        email: body.email,
        phases: body.phases,
        project: body.project,
        units: body.units,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
    }

    // write to db then resolve/reject
    dynamoDb.put(params, (error, data) => {
      if (error) {
        reject({ code: error.statusCode || 501, payload: error })
      } else {
        resolve({ code: 200, payload: params.Item })
      }
    })
  })
}
