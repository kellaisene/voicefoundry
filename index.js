const dynamoDbHelper = require('./dynamoDbHelper')
const 

exports.handler = async (event) => {
    try {
        // Here we'll want the process to go as follows
            // 1. Take in the phone number, validate, then format it to a uniform format that will go through the conversion process in
            // 2. Use the formatted number and put it through the conversion logic into a vanity number
            // 3. Once a list of possible vanity numbers is generated come up with a criteria that you can build to determine the top 5 vanity numbers in the list
            // 4. Send that list over to DynamoDb
            // 5. DON'T FOREGET to save the incoming number to DynamoDb as well
    } catch (error) {
        
    }
}