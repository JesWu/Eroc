module.exports = {
	name: 'server',
    description: 'Displays information about the current server.',
    aliases: [],
    args: false,
    usage: '',
    cooldown: 5,
    guildOnly: true,
	execute(message) {
      message.channel.send(`\`\`\`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}\`\`\``);
      //console.log(message.client.guildData);
	},
};