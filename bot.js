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

// listen for a message containing the word "hello", and send a reply
controller.hears(['hi','hello','howdy','hey','aloha','hola','bonjour','oi'],'message',async(bot, message) => {
    // do something!
    await bot.reply(message, 'hello fellow human.  To search the FAQs, type "query".');
});

controller.interrupts('help', 'message', async(bot, message) => {
    // start a help dialog, then eventually resume any ongoing dialog
    await bot.beginDialog(HELP_DIALOG);
});

controller.interrupts('quit', 'message', async(bot, message) => {
    await bot.reply(message, 'Quitting!');

    // cancel any active dialogs
    await bot.cancelAllDialogs();
});

const endpoint = "https://api.trade.gov/ita_faqs/search";
const api_key = "K2w8mVRAu1zSW2aJw6P_3GK1";

/* The Query Dialog */
let DIALOG_ID = 'my_dialog_1';
let query_dialog = new BotkitConversation(DIALOG_ID, controller);
let total = 0;

query_dialog.ask('What search term would you like to search with?', async(queryTerm, query_dialog, bot) => {

    query_dialog.setVar('queryTerm', queryTerm);

    console.log(`user query is "${ queryTerm }".`);
    console.log(`fetching results from: ${endpoint}?api_key=${api_key}&q=${queryTerm}`);

    fetch(`${endpoint}?api_key=${api_key}&q=${queryTerm}`)
        .then((response) => response.json())
        .then((json) => {
            console.log(`~~total number of results: ${json.total}~~`);
            query_dialog.setVar('total', json.total);
            // bot.say(`there were {{vars.total}} results`);
            // bot.say(`there were ${total} results`); // this doesn't get called
            total = json.total;
        })
        // .then((json) => console.log(`~~total number of results: ${json.total}~~`)) // this shows: 2
        // .then((json) => query_dialog.setVar('total', json.total), () => (bot.say(`there were {{vars.total}} results`))) // this doesn't run
        .catch(error => console.log(error))
}, 'queryTerm');

query_dialog.say(`user query is {{vars.queryTerm}}.`);
query_dialog.say(`there were {{vars.total}} results`); // shows "" results
// query_dialog.say(`there were ${total} results`); // 0

controller.addDialog(query_dialog);
/* End Dialog */

/* Trigger the dialog */
controller.hears('query', 'message', async(bot, message) => {
    await bot.beginDialog(DIALOG_ID);
});