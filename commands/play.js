const ytdl = require("ytdl-core-discord");
const ytpl = require('ytpl');
const ytsr = require('ytsr');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'play',
    description: 'Plays music from designated youtube link.',
    aliases: ['p'],
    args: true,
    usage: '<youtube link>',
    cooldown: 5,
    guildOnly: true,
    async execute(message, args) {
        var musicQueue = message.client.guildData.get(message.guild.id).musicQueue;
        var playing = message.client.guildData.get(message.guild.id).playing;
        var searchID = message.client.guildData.get(message.guild.id).searchID;
        //console.log(musicQueue);

        if (message.member.voice.channel) {
            //if the url is not valid tell them to enter a valid url.
            if (!ytdl.validateURL(args[0])) return module.exports.search(message, args);

            //console.log(message.guild.voice);
            //case where the bot is not in the voice channel
            if (message.guild.voice == null || message.guild.voice.connection == null) {
                //if it is a playlist, start playing the first song and add the rest to the queue.
                if (ytpl.validateID(args[0])) {

                    await ytpl(args[0], { pages: Infinity, limit: Infinity }).catch((err) => {
                        return message.reply("" + err);
                    });

                    let playlistItems = await (await ytpl(args[0], { pages: Infinity, limit: Infinity })).items;
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

                playing = args[0];

                message.client.guildData.set(message.guild.id, { musicQueue: musicQueue, playing: playing, searchID: searchID});
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

                    let playlistItems = await (await ytpl(args[0], { pages: Infinity, limit: Infinity })).items;
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
        } else {
            message.reply("Make sure you are in a voice channel first.");
        }
    },
    async nextSong(connection, message) {
        var musicQueue = message.client.guildData.get(message.guild.id).musicQueue;
        var playing = message.client.guildData.get(message.guild.id).playing;
        var searchID = message.client.guildData.get(message.guild.id).searchID;

        if (musicQueue.length > 0) {
            message.channel.send("Moving to next song..");
            const dispatcher = connection.play(await ytdl(musicQueue[0].url).catch((err) => {
                message.reply("" + err);
            }), { type: 'opus' });
            message.channel.send(
                "Now playing: " + (await ytdl.getInfo(musicQueue[0].url)).videoDetails.title + " - " + musicQueue[0].length + " :musical_note:"
            );

            playing = musicQueue[0].url;
            musicQueue.shift();

            message.client.guildData.set(message.guild.id, { musicQueue: musicQueue, playing: playing, searchID: searchID});

            dispatcher.on('finish', function () {
                module.exports.nextSong(connection, message);
            });

        } else {
            musicQueue = [];
            playing = '';
            message.client.guildData.set(message.guild.id, { musicQueue: musicQueue, playing: playing, searchID: searchID});
            message.member.voice.channel.leave();
            message.channel.send("No music in queue, leaving channel.");
        }
    },
    async search(message, args) {
        var sr = [];
        var playing = message.client.guildData.get(message.guild.id).playing;
        var searchID = message.client.guildData.get(message.guild.id).searchID;
        var searchStr = "";

        for (arg of args) {
            searchStr += arg + " ";
        }

        const filters1 = await ytsr.getFilters(searchStr);
        const filter1 = filters1.get('Type').get('Video');
        const searchResults = await ytsr(filter1.url, { limit: 5 });

        //console.log(searchResults);
        var resultStr = "";

        for (var i = 0; i < searchResults.items.length; i++) {
            sr.push(searchResults.items[i]);
            resultStr += (i + 1) + `. [${searchResults.items[i].title}](${sr[i].url}) - ${searchResults.items[i].duration}\n`;
        }

        const embed = new MessageEmbed()
            // Set the title of the field
            .setTitle('Search results for: ' + searchStr)
            // Set the color of the embed
            .setColor(0xff0000)
            // Set the main content of the embed
            .setDescription(resultStr)
            // Send the embed to the same channel as the message
            .setAuthor(message.author.username, message.author.avatarURL())
            .setThumbnail(message.author.avatarURL())
            .setFooter('Select a song by # (Timeout in 30s) | Type cancel to cancel', message.author.avatarURL());

        const filter = response => {
            return (response.author.id === message.author.id && (!isNaN(response.content) && response.content <= sr.length && response.content >= 1) || response.content.toLowerCase() == 'cancel');
        };

        if(searchID.has(message.author.id)) return message.reply("Users can only query 1 search at a time. Type cancel to cancel your existing search.");
        searchID.add(message.author.id);

        message.channel.send(embed).then(() => {
            message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
                .then(async (collected) => {
                    //console.log(collected.first().content);

                    //remove here
                    searchID.delete(message.author.id);
                    if(collected.first().content == 'cancel') return message.reply("Search has been cancelled.");

                    const selectNum = (collected.first().content - 1);

                    var musicQueue = message.client.guildData.get(message.guild.id).musicQueue;
                    if (musicQueue.length == 0 && message.guild.voice == undefined || message.guild.voice.connection == null) {
                        const connection = await message.member.voice.channel.join();
                        const dispatcher = connection.play(await ytdl(sr[selectNum].url), { type: 'opus' });
                        //console.log(sr[selectNum].url);

                        message.channel.send(
                            "Now playing: " + sr[selectNum].title + " - " + sr[selectNum].duration + " :musical_note:"
                        );

                        playing = sr[selectNum].url;
                        dispatcher.on('finish', () => {
                            module.exports.nextSong(connection, message);
                        });

                    } else {
                        musicQueue.push({ url: "" + sr[selectNum].url, title: "" + sr[selectNum].title, length: sr[selectNum].duration });
                        message.reply(sr[selectNum].title + " has been added to the queue.");
                        //console.log(musicQueue);
                    }

                    message.client.guildData.set(message.guild.id, { musicQueue: musicQueue, playing: playing, searchID: searchID});
                }).catch(collected =>{
                    //remove here
                    searchID.delete(message.author.id);
                });
        });
    },
};