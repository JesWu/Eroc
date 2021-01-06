const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'server',
    description: 'Displays information about the current server.',
    aliases: [],
    args: false,
    usage: '',
    cooldown: 5,
    guildOnly: true,
    execute(message) {
        const embed = new MessageEmbed()
            // Set the title of the field
            .setTitle(`[${message.guild.nameAcronym}] ${message.guild.name}`)
            // Set the color of the embed
            .setColor(0xff0000)
            // Set the main content of the embed
            .setDescription(`Description: ${message.guild.description}`)
            // Send the embed to the same channel as the message
            .setAuthor(message.guild.name, message.guild.iconURL())
            .setThumbnail(message.guild.iconURL())
            .setFooter(`Region: ${message.guild.region}\nTotal members: ${message.guild.memberCount}\nCreated at:  ${message.guild.createdAt}`);
        message.channel.send(embed);
    },
};