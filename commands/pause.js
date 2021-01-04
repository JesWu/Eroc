module.exports = {
	name: 'pause',
    description: 'Pauses currently playing song',
    aliases: ['stop'],
    args: false,
    usage: '',
    cooldown: 5,
    guildOnly: true,
	execute(message) {
      if (message.member.voice.channel && message.member.voice.channel === message.guild.voice.channel) {
        message.guild.voice.connection.dispatcher.pause();
        message.reply("Song paused.");
      } else {
        message.reply("You need to join the voice channel with the bot first!");
      }
	},
};