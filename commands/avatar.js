const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'avatar',
    description: 'Displays avatar of mentioned users',
    aliases: ['icon'],
    args: true,
    usage: '<mention1> <mention2> ...',
    cooldown: 5,
    guildOnly: false,
	execute(message) {
      var mentions = message.mentions.users;
      for (const [key, value] of mentions) {
        var embed = new MessageEmbed()
          .setTitle(value.username)
          .setColor(0xff0000)
          .setImage(value.displayAvatarURL());
        message.channel.send(embed);
      }
	},
};