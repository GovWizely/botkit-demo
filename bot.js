//  __   __  ___        ___
// |__) /  \  |  |__/ |  |  
// |__) \__/  |  |  \ |  |  

// This is the main file for the FAQ-botkit bot.

// Import Botkit's core features
const { Botkit, BotkitConversation } = require('botkit');
const { BotkitCMSHelper } = require('botkit-plugin-cms');

// Import a platform-specific adapter for web.
const { WebAdapter } = require('botbuilder-adapter-web');
const { MongoDbStorage } = require('botbuilder-storage-mongodb');

// Load process.env values from .env file
require('dotenv').config();

const wit = require('botkit-middleware-witai')({
    token: process.env.WIT_TOKEN,
});

let storage = null;
if (process.env.MONGO_URI) {
    storage = mongoStorage = new MongoDbStorage({
        url : process.env.MONGO_URI,
    });
}

const adapter = new WebAdapter({});

const controller = new Botkit({
    debug: true,
    webhook_uri: '/api/messages',
    adapter: adapter,
    storage
});

if (process.env.cms_uri) {
    controller.usePlugin(new BotkitCMSHelper({
        cms_uri: process.env.cms_uri,
        token: process.env.cms_token,
    }));
}

// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {

    // load traditional developer-created local custom feature modules
    controller.loadModules(__dirname + '/features');

    /* catch-all that uses the CMS to trigger dialogs */
    if (controller.plugins.cms) {
        controller.on('message,direct_message', async (bot, message) => {
            let results = false;
            results = await controller.plugins.cms.testTrigger(bot, message);

            if (results !== false) {
                // do not continue middleware!
                return false;
            }
        });
    }
});

/* use the Wit AI middleware to receive messages */
controller.middleware.receive.use(wit.receive);

const endpoint = "https://api.trade.gov/ita_faqs/search";
const api_key = process.env.API_KEY;

/* The Query Dialog */
let DIALOG_ID = 'my_dialog_1';
let query_dialog = new BotkitConversation(DIALOG_ID, controller);

// query_dialog.say(`Please hold while I search with: {{vars.word}}`);
query_dialog.before('default', async(query_dialog, bot) => {
    console.log(`Please hold while I search with: ${query_dialog.vars.word}`);
    return new Promise(function(resolve, reject) {
        fetch(`${endpoint}?api_key=${api_key}&q=${query_dialog.vars.word}`)
        .then((response) => response.json())
        .then((json) => {
            // console.log(`~~total number of results: ${json.total}~~`);
            query_dialog.setVar('total', json.total);
            if (json.total > 0 ) {
                query_dialog.setVar('results', json.results);
                // console.log(json.results);
            }
        })
        .then(resolve)
        .catch(error => console.log(error)).then(reject)
    });
});

query_dialog.say(`There were <b>{{vars.total}} results</b> <ol>{{#vars.results}}<li><a href={{url}} target="_blank" rel="noopener" rel="noreferrer">{{question}}</a></li>{{/vars.results}}</ol>`);
query_dialog.say(`You might also be interested in searching the <a href="https://www.export.gov/consolidated_screening_list" target="_blank" rel="noopener" rel="noreferrer">Consolidated Screening List</a>`);

controller.addDialog(query_dialog);
/* End Dialog */

/* Welcome the user on connect/reconnect */
controller.on(['hello'], async(bot, message) => {
    await bot.reply(message, 'What would you like to know about?');
});

controller.on(['welcome_back', 'reconnect'], async(bot, message) => {
    await bot.reply(message, 'Welcome back!');
});

/* interpret messages that seem to be searching for something and parse the keywords to trigger the dialog */
controller.hears(['.*'], ['message'], async function(bot, message) {
    try {
        // console.log(`💡 message.entities: ${JSON.stringify(message.entities)}`);
        if (!!message.entities.greetings) {
            await bot.reply(message, 'Hello!  How can I help you?');
        } else { 
            await bot.beginDialog(DIALOG_ID, {word: message.entities.search_query[0].value});
        }    
    }
    catch(e) {
        console.log('⚠️  Caught an error: ', e)
    }
});