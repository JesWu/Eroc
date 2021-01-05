const play = require('./play');
const ytdl = require("ytdl-core-discord");

module.exports = {
    name: 'select',
    description: 'Select from search results',
    aliases: [],
    args: true,
    usage: '<number>',
    cooldown: 5,
    guildOnly: true,
    async execute(message, args, client) {
        var musicQueue = message.client.guildData.get(message.guild.id).musicQueue;
        var sr = message.client.guildData.get(message.guild.id).sr;
        if (isNaN(args[0])) {
            message.reply("Please enter a number.");
            return;
        }
        if (sr.length == 0) {
            message.reply("No search to select from.");
            return;
        }
        var selectNum = parseInt(args[0], 10) - 1;
        if (selectNum >= sr.length || selectNum < 0) {
            message.reply("Enter a valid number.");
            return;
        }
        if (message.member.voice.channel) {
            if (musicQueue.length == 0 && message.guild.voice == undefined || message.guild.voice.connection == null) {
                const connection = await message.member.voice.channel.join();
                const dispatcher = connection.play(await ytdl(sr[selectNum].url), { type: 'opus' });

                message.channel.send(
                    "Now playing: " + sr[selectNum].title + " - " + sr[selectNum].duration + " :musical_note:"
                );

                dispatcher.on('finish', () => {
                    play.nextSong(connection, message);
                });

            } else {
                message.reply(sr[selectNum].title + " has been added to the queue.");
                musicQueue.push({ url: "" + sr[selectNum].url, title: "" + sr[selectNum].title, length: sr[selectNum].duration });
                //console.log(musicQueue);
            }
            message.client.guildData.set(message.guild.id, { musicQueue: message.client.guildData.get(message.guild.id).musicQueue, sr: [] });
        } else {
            message.reply("You aren't in a voice channel.")
        }
    },
};