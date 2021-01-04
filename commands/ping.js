module.exports = {
	name: 'ping',
    description: 'pong',
    aliases: [],
    args: false,
    usage: '',
    cooldown: 5,
    guildOnly: false,
	execute(message) {
      message.reply("pong!");
	},
};