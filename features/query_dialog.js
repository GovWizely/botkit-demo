const { BotkitConversation } = require('botkit');

module.exports = function(controller) {

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
}
