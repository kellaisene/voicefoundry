const dynamoDbHelper = require('./dynamoDbHelper.js')
const LambdaHelper = require('./LambdaHelper.js')
const checkWord = require('check-word')
const { eventNames, send } = require('process')
words = checkWord('en')
// const phoneUtil = require('libphonenumber-js').PhoneNumberUtil.getInstance();

exports.handler = async (event) => {
    try {
        // Here we'll want the process to go as follows
            // 1. Take in the phone number, validate, then format it to a uniform format that will go through the conversion process in
            console.log('PHONE', event.body.phoneNumber)
            // const number = phoneUtil.parseAndKeepRawInput(event.body.phoneNumber, 'US');
            // console.log('NUM', number)
            const validatedNumberResult = await validatedNumber(event)
            // 2. Use the formatted number and put it through the conversion logic into a vanity number
            const numberLetterCombosResults = await numberLetterCombos(validatedNumberResult)
            // 3. Once a list of possible vanity numbers is generated come up with a criteria that you can build to determine the top 5 vanity numbers in the list
            const searchForValidWordsResults = await searchForValidResults(numberLetterCombosResults, event)
            console.log('SEARCH FOR VALID', searchForValidWordsResults)
            // 4. Send that list over to DynamoDb
            // 5. DON'T FOREGET to save the incoming number to DynamoDb as well
    } catch (error) {
        
    }
}

validatedNumber = async (event) => {
    try {
        const validNumber = event.body.phoneNumber
        // If the number includes '1' or '0' break it up to separate those numbers from the others
        return validNumber
    } catch (error) {
        return console.error(error)
    }
}

numberLetterCombos = async (digits) => {
    try {
            // global result
            const result = [];
          
            // alpha hash mapOfNumbers
            const alpha = {
              '1': '1',  
              '2': 'abc',
              '3': 'def',
              '4': 'ghi',
              '5': 'jkl',
              '6': 'mno',
              '7': 'pqrs',
              '8': 'tuv',
              '9': 'wxyz',
              '0': '0'
            };

          
            // dfs recursive helper
            const dfs = (i, digits, slate) => {
              // base case
              if(i === digits.length) {
                result.push(slate.join(''));
                return;
              }
          
              let chars = alpha[digits[i]];
              for(let char of chars) {
                slate.push(char);
                dfs(i + 1, digits, slate);
                slate.pop();
              }
            }
          
            dfs(0, digits, []);
          
            return result
          
    } catch (error) {
        return console.error(error)
    }
}
// console.log('LETTER COMBOS', numberLetterCombos("3101"))

searchForValidResults = async (numberLetterCombosResults, event) => {
    const phoneNumber = event.body.phoneNumber
    try {
        const conditions = ['0', '1']
        let validWords = []
        if(conditions.some(el => phoneNumber.includes(el))) {
            numberLetterCombosResults.forEach(val => {
                const chars = {'1': '', '0': ''};
                val = val.replace(/[10]/g, m => chars[m])
                // console.log('VAL', val)
                if(words.check(val)) {
                    console.log('FOUND ONE', val)
                    validWords.push(val)
                } else {
                    console.log('RETURN 5 VANITY NUMBERS')
                }
            })
        } else {
            numberLetterCombosResults.forEach(val => {
                console.log('CHECKING FOR WORDS')
                if (words.check(val)) {
                  console.log('FOUND A WORD', val)
                  validWords.push(val)
                } else {
                  console.log('NO LEGIT WORDS FOUND')
                }
              })
        }

        const sendToDynamo = await dynamoDbHelper.putItem('vanityPhoneNumbers', {
            "phoneNumber": event.body.phoneNumber,
            "topVanityResults": [validWords]
        })
        console.log('SENTTODYNAMO', sendToDynamo)
        return validWords
    } catch (error) {
        console.error(error)
    }
}