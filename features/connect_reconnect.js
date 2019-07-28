module.exports = function(controller) {
    /* Welcome the user on connect/reconnect */
  controller.on(['hello'], async(bot, message) => {
    await bot.reply(message, 'What would you like to know about?');
  });

  controller.on(['welcome_back', 'reconnect'], async(bot, message) => {
    await bot.reply(message, 'Welcome back!');
  });
}