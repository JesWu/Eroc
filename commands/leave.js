module.exports = {
	name: 'leave',
    description: 'Make the bot leave the voice channel.',
    aliases: [],
    args: false,
    usage: '',
    cooldown: 5,
    guildOnly: true,
	execute(message) {

        if (message.member.voice.channel && message.member.voice.channel === message.guild.voice.channel) {
            message.client.guildData.get(message.guild.id).musicQueue = [];
            message.member.voice.channel.leave();
            message.reply("Left channel.");
          } else {
            message.reply("Error: Are you in the same voice channel as the bot?");
          }
	},
};