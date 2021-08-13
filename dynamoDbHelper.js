const AWS = require('aws-sdk')
AWS.config.region = 'us-west-2'
// const dynamodb = new AWS.DynamoDB();
const documentClient = new AWS.DynamoDB.DocumentClient();

module.exports = {
    putItem: putItem
}

function putItem(tableName, item) { // This is working fine as long as I get the right data format in the item key.
    var options = {
        TableName: tableName,
        Item: item
    }

    return new Promise(function (resolve, reject) {
        documentClient.put(options, function (err, data) {
            if (err) {
                console.log('ERR PUT ITEM', err)
                reject(err)
            } else {
                console.log('DATA PUT ITEM SUCCESS', data)
                resolve(data)
            }
        });
    });
}