const LAMBDA_NAME = 'phoneNumberConverter'
const dynamoDbHelper = require('./dynamoDbHelper.js')
const LambdaHelper = require('./LambdaHelper.js')
const checkWord = require('check-word')

words = checkWord('en') // Using check-word to determine if any of the letter combinations are actual English words. If they are, then they will be added to the "top 5" list to be saved to DynamoDb

exports.handler = async (event) => {
    const originalEvent = JSON.parse(JSON.stringify(event))

    try {
        // Here we'll want the process to go as follows
            // 1. Take in the phone number, validate, then format it to a uniform format that will go through the conversion process in
            console.log('PHONE', event)
            const receivedAttribute = event['Details']['Parameters'].phoneNumber
            console.log('RECEIVED ATTRIBUTE', receivedAttribute)
            // const number = phoneUtil.parseAndKeepRawInput(event.body.phoneNumber, 'US');
            // console.log('NUM', number)
            const validatedNumberResult = await validatedNumber(event)
            // 2. Use the formatted number and put it through the conversion logic into a vanity number
            const numberLetterCombosResults = await numberLetterCombos(validatedNumberResult)
            // 3. Once a list of possible vanity numbers is generated come up with a criteria that you can build to determine the top 5 vanity numbers in the list
            const searchForValidWordsResults = await searchForValidResults(numberLetterCombosResults, event)
            console.log('SEARCH FOR VALID', searchForValidWordsResults)
            // 4. Send that list over to DynamoDb
            // 5. DON'T FORGET to save the incoming number to DynamoDb as well
            LambdaHelper.formatResponseData(null, originalEvent, searchForValidWordsResults, LAMBDA_NAME)
            return searchForValidWordsResults
    } catch (error) {
        console.error('SOMETHING WENT WRONG', error)
        LambdaHelper.formatResponseData(error, originalEvent, null, LAMBDA_NAME)
    }
}

validatedNumber = async (event) => {
    try {
        const validNumber = event['Details']['Parameters'].phoneNumber
        const lastFour = validNumber.slice(-4)
        console.log('LAST FOUR DIGITS', lastFour)
        // If the number includes '1' or '0' break it up to separate those numbers from the others
        return lastFour
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
          console.log('RESULT', result)
            return result
          
    } catch (error) {
        return console.error(error)
    }
}

searchForValidResults = async (numberLetterCombosResults, event) => {
    const phoneNumber = event['Details']['Parameters'].phoneNumber
    const firstSix = phoneNumber.slice(2, 8)
    try {
        const conditions = ['0', '1'] // These numbers don't have letters in the alphabet attached to them in the phone dial system
        let validWords = []
        if(conditions.some(el => phoneNumber.includes(el))) { // Remove numbers from 
            numberLetterCombosResults.forEach(val => {
                const chars = {'1': '', '0': ''};
                val = val.replace(/[10]/g, m => chars[m])
                if(words.check(val)) {
                    console.log('FOUND ONE', val)
                    validWords.push(val)
                } else {
                    console.log('RETURN 5 VANITY NUMBERS')
                }
            })
        } else {
            numberLetterCombosResults.forEach(val => {
                // console.log('CHECKING FOR WORDS')
                if (words.check(val)) {
                  console.log('FOUND A WORD', val)
                  validWords.push(val)
                } else {
                  console.log('NO LEGIT WORDS FOUND')
                }
              })
        }
        if (validWords.length < 5) { // If 5 valid english words aren't found then fill the 5 list with letter combos
            const diff = 5 - validWords.length
            const fillRemainder = numberLetterCombosResults.slice(0, diff)
            console.log('FILL REMAINDER', fillRemainder)
            fillRemainder.forEach(val => {
                validWords.push(val)
            })
        }
        console.log('VALID WORDS', validWords)
        const sendToDynamo = await dynamoDbHelper.putItem('vanityPhoneNumbers', {
            "phoneNumber": event['Details']['Parameters'].phoneNumber,
            "topVanityResults": [validWords]
        })
        console.log('SENTTODYNAMO', sendToDynamo)
        const vantiyNumberList = {
            testList: validWords[0],
            testList2: validWords[1],
            testList3: validWords[2],
            testList4: validWords[3],
            testList5: validWords[4],
            first6Digits: firstSix
        }
        return vantiyNumberList
    } catch (error) {
        console.error(error)
    }
}