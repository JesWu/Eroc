const ytdl = require("ytdl-core-discord");
const ytpl = require('ytpl');

module.exports = {
    name: 'play',
    description: 'Plays music from designated youtube link.',
    aliases: [],
    args: true,
    usage: '<youtube link>',
    cooldown: 5,
    guildOnly: true,
    async execute(message, args) {
        var musicQueue = message.client.guildData.get(message.guild.id).musicQueue;
        //console.log(musicQueue);

        if (message.member.voice.channel) {
            //if the url is not valid tell them to enter a valid url.
            if (!ytdl.validateURL(args[0])) return message.reply("Enter a valid youtube link.");

            //console.log(message.guild.voice);
            //case where the bot is not in the voice channel
            if (message.guild.voice == null || message.guild.voice.connection == null) {
                //if it is a playlist, start playing the first song and add the rest to the queue.
                if (ytpl.validateID(args[0])) {

                    await ytpl(args[0], { pages: Infinity, limit: Infinity }).catch((err) => {
                        return message.reply("" + err);
                    });

                    let playlistItems = await(await ytpl(args[0], { pages: Infinity, limit: Infinity })).items;
                    let curSong = (await ytdl.getInfo(args[0])).videoDetails.title;
                    for (var i = 0; i < playlistItems.length; i++) {
                        if (curSong != playlistItems[i].title) musicQueue.push({ url: "" + playlistItems[i].shortUrl, title: playlistItems[i].title, length: playlistItems[i].duration });
                    }
                    message.channel.send("Playlist Detected! adding " + playlistItems.length + " songs to queue.");
                }

                //just play the song
                const connection = await message.member.voice.channel.join();
                const dispatcher = connection.play(await ytdl(args[0]).catch((err) => {
                    message.reply("" + err);
                    connection.disconnect();
                }), { type: 'opus' });

                //console.log((await ytdl.getInfo(args[0])).videoDetails);

                message.channel.send(
                    "Now playing: " + (await ytdl.getInfo(args[0])).videoDetails.title + " - " + ("" + new Date((await ytdl.getInfo(args[0])).videoDetails.lengthSeconds * 1000).toISOString().substr(11, 8)).replace(/^0(?:0:0?)?/, '') + " :musical_note:"
                );

                //on finish event attempt to play next song
                dispatcher.on('finish', () => {
                    module.exports.nextSong(connection, message);
                });
                //ensure that the user adding the songs is in the voice channel with the bot.
            } else if (message.member.voice.channel && message.member.voice.channel === message.guild.voice.channel) {
                //if it is a playlist then add the songs of the playlist to the queue
                if (ytpl.validateID(args[0])) {

                    await await ytpl(args[0], { pages: Infinity, limit: Infinity }).catch((err) => {
                        return message.reply("" + err);
                    });

                    let playlistItems = await(await ytpl(args[0], { pages: Infinity, limit: Infinity })).items;
                    for (var i = 0; i < playlistItems.length; i++) {
                        musicQueue.push({ url: "" + playlistItems[i].shortUrl, title: playlistItems[i].title, length: playlistItems[i].duration });
                    }
                    message.channel.send("Playlist Detected! adding " + playlistItems.length + " songs to queue.");
                    //or else just add the song to the queue
                } else {
                    //formatting for music queue
                    //console.log("Attempting to add song...");

                    await ytdl.getInfo(args[0]).catch((err) => {
                        return message.reply("" + err);
                    });

                    let title = (await ytdl.getInfo(args[0])).videoDetails.title;
                    message.reply(title + " has been added to the queue.");
                    let len = ("" + new Date((await ytdl.getInfo(args[0])).videoDetails.lengthSeconds * 1000).toISOString().substr(11, 8)).replace(/^0(?:0:0?)?/, '');
                    musicQueue.push({ url: "" + (await ytdl.getInfo(args[0])).videoDetails.video_url, title: title, length: len });
                }
            }
        }else{
            message.reply("Make sure you are in a voice channel first.");
        }
    },
    async nextSong(connection, message) {
        var musicQueue = message.client.guildData.get(message.guild.id).musicQueue;

        if (musicQueue.length > 0) {
            message.channel.send("Moving to next song..");
            const dispatcher = connection.play(await ytdl(musicQueue[0].url).catch((err) => {
                message.reply("" + err);
            }), { type: 'opus' });
            message.channel.send(
                "Now playing: " + (await ytdl.getInfo(musicQueue[0].url)).videoDetails.title + " - " + musicQueue[0].length + " :musical_note:"
            );

            musicQueue.shift();

            dispatcher.on('finish', function () {
                module.exports.nextSong(connection, message);
            });

        } else {
            musicQueue = [];
            message.member.voice.channel.leave();
            message.channel.send("No music in queue, leaving channel.");
        }
    }
};