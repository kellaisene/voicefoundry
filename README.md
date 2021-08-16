# voicefoundry

Contained is my code for a Lambda that takes in and converts a phone number to vanity numbers. It saves the best 5 numbers and the caller's number in a DynamoDB table.

Quick summary of what the code does is it takes in the incoming phone number from the caller calling into the AWS Connect Instance. My code will take the final 4 digits of the phone number and put it through a loop in the numberLetterCombos function. There it takes map of numbers and their corresponding letters, loops through digits and creates all possible letter combos for each digit. It then returns an array of all the possible combinations. 

Next my code moves the letter combos array to the searchForValidResults function which makes use of the check-word npm package to determine if any of the letter combos for an actual valid english word. Those words get saved to a validWords array. This function also takes into account the digits '1' and '0' not having any corresponding letters attached to them on a traditional phone dial. It makes sure to return those digits as themselves in the letter combos to avoid errors.

Once the top 5 'vanity' number words are saved to the validWords array they are sent to my 'vanityPhoneNumbers' DynamoDB table along with the caller's number.
The return object for the function is split into 6 key: value pairs representing the top five vanity phone number letter combos and the first six digits of the caller's number so the Amazon Connect Instance can access and read them back to the caller.


Reasons for implementing the solution the way I did:

  - After looking up what a vanity number was I looked online to see if there were other vanity phone number generators to go off of. I found a few like at: 'https://60tools.com/en/tool/vanity-calculator' for example. I then decided I was going to figure out how to write a function that would take a normal phone dial system with numbers assigned to digits 2-9 and create a list of possible word combinations based on the phone digits. 

  - My thoughts for categorizing the 'Best' vanity numbers was to look up to see if there was an npm package I could use to determine if a combination of letters formed an actual english word. 

  - I found the check-word package that did exactly that. I imported it to my Lambda and used it to loop through and determine which letters combos were actual words and those were automatically determined to be in the 'top-5' list. 

  - I ended up running into the issue of my loops taking too long to generate all possible combos for a 10-digit phone number so I decided to narrow it down to only generating letter combos for the last 4 digits of the phone number to save on that time. (I later discovered with the way I did the Lambda it would need to take less than 8 seconds or Amazon Connect would time out on the Invoke AWS Lambda box.)


Struggles faced, problems overcame, and shortcuts taken that would be bad practice in production

  - The first struggle was figuring out I needed to account for the amount of time the code took to execute loops to generate all possible letter combos for a 10 digit phone number. With the time I had I decided to just narrow it down to the last 4 digits.

  - I also ran into the issue of dealing with phone numbers with '1' or '0' in them. These digits don't have corresponding letters. My initial solution was to find a way to remove instances of those digits in the phone number so the word-check could find words without numbers in them. I eventually at the very end had the Lambda keep the digits in there so it would just read on Amazon Connect as: 480-334-1sps or 480-334-1rss for example. This was the shortcut I took to get the letter combos out to AWS Connect for reading in time. 

  - If there weren't any valid english words found for the top-5 list or enough valid words to fill the 5 spots I just had it take however many letter combos were needed to the 5 spots from the beginning of the letter combo array. With more time I would want to build some kind of algorithm to determine letter combos that would at least meet a criteria for a sudo-word. I'm not sure how I would do that at the moment.

  - Learning basics on Amazon Connect was a struggle since I haven't used it before. I watched a lot of Youtube examples on how to create Amazon Connect Instances and read a lot of documentations when I could about invoking Lambda functions.

  - I struggled for a while figuring out how to invoke a Lambda using attributes for input parameters. Actually reading the docs and helped me stumble through getting the Lambda to actually trigger. I used the CloudWatch logs and console.log a lot in my Lambda to figure out how the import parameters where getting through to the event handler. That also helped to find that I needed to include the permissions to Connect to invoke the Lambda function as well.

  - Once I figured out how to get the caller phone number through to the Lambda I found in the docs I had to make sure the Lambda returned a flat object for Connect to be able to read the key value pairs. Basically AWS documentation, Youtube, and a lot of Google-ing examples helped me get my Amazon Connect Instance to work with the Lambda I built.

  - Final struggle was just getting Connect to read the data coming back from Lambda. After a lot of testing the contact flow and trying different configurations I was finding in AWS docs and online I was able to get Connect to read 3 of the top vanity number combos and include the first 7 digits I took off at the beginning so it would read as a whole phone number instead of the just the word that was generated.

  - As far as bad practice I'm sure there's a lot I could do to improve my Lambda code to bring it up to best practice. I hope that eventually working with developers I can improve greatly in this area.


What would I like to do with more time?

  - I would have liked to have figured out a better way to get the letter combinations generated than through multiple loops. 
  - I would also have liked to figure out how to account for the '1' and '0' digits in a more elegant way. Maybe a way to generate the letter combos, remove the digit for the word-check to look at and then return the digit back after a valid word if found for the list to return.
  - After getting to play around with Amazon Connect a little bit I would love to create a better more ineractive contact flow. Like maybe having it ask you to select your favorite vanity number that was generated by pressing a number (Press 1 to select '303-667-yaba' as your vanity number, Press 2 to select ...etc)


Note: I left a majority of my console.logs in my Lambda to give you a better idea of how I was trying to figure things out and my thinking.


Wrap-up

I had a lot of fun figuring out my own solution to this challenge. There is a lot about AWS I have to learn so getting to play around with Amazon Connect was fun in that I got to generate a phone number to call that would take my number, send it to my Lambda, and read back my top 3 options for my own personal vanity number. I learned a lot and hope to continue learning more about the capabilities of AWS going forward.
