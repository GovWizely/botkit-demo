# Demo Chatbot for FAQs API

## Dependencies
* Node (I used v12.2.0)

## Run Locally
* `git clone` this repo and `cd` into it
* `npm install`
* `npm start`
* Navigate to http://localhost:3000.  Currently, the bot can do 2.5 things.  You can greet it in a variety of ways and it will greet you back.  If you type "query", it'll ask you what search term to use, and then (back in the console, unfortunately) tell you how many results were found.

* Note: changes to the code require restarting the server (`ctrl-c` and `npm start` again).
### Botkit Starter Kit

This is a Botkit starter kit for web, created with the [Yeoman generator](https://github.com/howdyai/botkit/tree/master/packages/generator-botkit#readme)

[Botkit Docs](https://botkit.ai/docs/v4)

This bot is powered by [a folder full of modules](https://botkit.ai/docs/v4/core.html#organize-your-bot-code). 
Edit the samples, and add your own in the [features/](features/) folder.
