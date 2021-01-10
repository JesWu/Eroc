const ytdl = require("ytdl-core-discord");
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'playing',
    description: 'Displays information on currently playing song.',
    aliases: ['music'],
    args: false,
    usage: '',
    cooldown: 5,
    guildOnly: true,
    async execute(message) {
        var playing = message.client.guildData.get(message.guild.id).playing;
        if (ytdl.validateURL(playing)){
            var details = (await ytdl.getBasicInfo(playing)).videoDetails;
            let len = ("" + new Date(details.lengthSeconds * 1000).toISOString().substr(11, 8)).replace(/^0(?:0:0?)?/, '');
            //console.log(details);
            const embed = new MessageEmbed()
            // Set the title of the field
            .setTitle(details.title)
            // Set the color of the embed
            .setColor(0xff0000)
            .setURL(details.video_url)
            // Set the main content of the embed
            .setDescription(`Length: ` + len + `\nViews: ${details.viewCount}`)
            // Send the embed to the same channel as the message
            .setAuthor(details.author.name, details.author.thumbnails[1].url)
            .setThumbnail(details.thumbnails[0].url)
            .setFooter(`Likes: ${details.likes}\nDislikes: ${details.dislikes}`);
            message.channel.send(embed).catch(err => console.log(err));
        }else{
            message.channel.send("No music currently playing.");
        }
    }
};