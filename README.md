# voicefoundry

Contained is my code for a Lambda that takes in and converts a phone number to vanity numbers. It saves the best 5 numbers and the caller's number in a DynamoDB table.

Quick summary of what the code does is it takes in the incoming phone number from the caller calling into the AWS Connect Instance. My code will take the final 4 digits of the phone number and put it through a loop in the numberLetterCombos function. There it takes map of numbers and their corresponding letters, loops through digits and creates all possible letter combos for each digit. It then returns an array of all the possible combinations. 

Next my code moves the letter combos array to the searchForValidResults function which makes use of the check-word npm package to determine if any of the letter combos for an actual valid english word. Those words get saved to a validWords array. This function also takes into account the digits '1' and '0' not having any corresponding letters attached to them on a traditional phone dial. It makes sure to return those digits as themselves in the letter combos to avoid errors.

Once the top 5 'vanity' number words are saved to the validWords array they are sent to my 'vanityPhoneNumbers' DynamoDB table along with the caller's number.
The return object for the function is split into 6 key: value pairs representing the top five vanity phone number letter combos and the first six digits of the caller's number so the Amazon Connect Instance can access and read them back to the caller.


Reasons for implementing the solution the way I did:
