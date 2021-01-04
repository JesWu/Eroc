module.exports = {
    name: 'volume',
    description: 'Changes volume of bot',
    aliases: [],
    args: false,
    usage: '<0-100>',
    cooldown: 5,
    guildOnly: true,
    execute(message, args) {
      //ensure user is in voice channel with bot
      if (message.member.voice.channel && message.member.voice.channel === message.guild.voice.channel) {
        if (isNaN(args[0]) || args[0] < 0 || args[0] > 100) {
            message.reply("Enter a valid number (0-100)");
          return;
        }
        message.guild.voice.connection.dispatcher.setVolume(args[0] / 100);
        message.reply("Volume set to: " + args[0]);
      } else {
        message.reply("You need to join the voice channel with the bot first!");
      }
    },
};