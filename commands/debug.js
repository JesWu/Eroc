const {MongoClient} = require('mongodb');
const { currency, uri } = require('../config.json');
const client = new MongoClient(uri, { useNewUrlParser: true });
const{ MessageEmbed } = require('discord.js');

module.exports = {
	name: 'debug',
    description: 'Developer testing command',
    aliases: [],
    args: false,
    usage: '',
    cooldown: 0,
    guildOnly: false,
	execute(message) {
        const embed = new MessageEmbed()
        // Set the title of the field
        .setTitle('Title')
        // Set the color of the embed
        .setColor(0xff0000)
        // Set the main content of the embed
        .setDescription('Description')
        // Send the embed to the same channel as the message
        .setAuthor(message.author.username, message.author.avatarURL())
        .setThumbnail(message.author.avatarURL())
        .setFooter('Select a number', message.author.avatarURL());

        message.reply(embed);
    },
};