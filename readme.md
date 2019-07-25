# Demo Chatbot for FAQs API
Currently, the bot can do two things:
  * You can greet it in a variety of ways and it will greet you back.  
  * You can type in keywords, phrases, or sentences to search with, and it will retrieve a list of results from the FAQ API, and also suggest the CSL link.
  * This project is hosted at: https://ita-faq-bot.glitch.me/ ![Glitch Badge](https://badge.glitch.me/ita-faq-bot)
## Dependencies
* Node (I used v12.2.0)

## Run Locally
1. `git clone` this repo and `cd` into it
2. `npm install`
3. `npm start`
4. Navigate to http://localhost:3000
5. Any changes to the code require restarting the server (`ctrl-c` and `npm start` again) to see the update.

----------------------
### Botkit Starter Kit

This project was bootstrapped from the Botkit starter kit for web, created with the [Yeoman generator](https://github.com/howdyai/botkit/tree/master/packages/generator-botkit#readme)

[Botkit Docs](https://botkit.ai/docs/v4)

This bot is powered by [a folder full of modules](https://botkit.ai/docs/v4/core.html#organize-your-bot-code). 
Edit the samples, and add your own in the [features/](features/) folder.
