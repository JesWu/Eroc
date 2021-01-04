module.exports = {
    name: 'queue',
    description: 'lists queue of songs',
    aliases: [],
    args: false,
    usage: '',
    cooldown: 5,
    guildOnly: true,
    async execute(message) {
        var musicQueue = message.client.guildData.get(message.guild.id).musicQueue;
        if (musicQueue.length == 0) {
            message.channel.send("No music in queue.");
            return;
        }
        //if queue has more than 10 items construct a reaction collector.
        if (musicQueue.length > 10) {
            let page = 1;
            let queueStr = "Music in Queue:\n```";
            for (var i = (page - 1) * 10; i < page * 10; i++) {
                queueStr += (i + 1) + ". " + musicQueue[i].title + " " + musicQueue[i].length + "\n";
            }
            queueStr += "```\nPage " + page + " of " + (Math.ceil(musicQueue.length / 10));

            await message.channel.send(queueStr);
            var queuemessage = message.channel.lastMessage;
            await queuemessage.react('⬅️');
            await queuemessage.react('➡️');

            const filter = (reaction, user) => {
                return ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id;
            };

            const collector = queuemessage.createReactionCollector(filter, { time: 30000 });

            collector.on('collect', (reaction, user) => {
                if (reaction.emoji.name === '⬅️') {
                    if (page > 1) {
                        //go left
                        page -= 1;
                        let queueStr = "Music in Queue:\n```";
                        for (var i = (page - 1) * 10; i < (page * 10 < musicQueue.length ? page * 10 : musicQueue.length); i++) {
                            queueStr += (i + 1) + ". " + musicQueue[i].title + " " + musicQueue[i].length + "\n";
                        }
                        queueStr += "```\nPage " + page + " of " + (Math.ceil(musicQueue.length / 10));
                        queuemessage.edit(queueStr);
                    }
                    queuemessage.reactions.resolve('⬅️').users.remove(user.id)
                } else if (reaction.emoji.name === '➡️') {
                    if (page < (Math.ceil(musicQueue.length / 10))) {
                        //go right
                        page += 1;
                        let queueStr = "Music in Queue:\n```";
                        for (var i = (page - 1) * 10; i < (page * 10 < musicQueue.length ? page * 10 : musicQueue.length); i++) {
                            queueStr += (i + 1) + ". " + musicQueue[i].title + " " + musicQueue[i].length + "\n";
                        }
                        queueStr += "```\nPage " + page + " of " + (Math.ceil(musicQueue.length / 10));
                        queuemessage.edit(queueStr);
                    }
                    queuemessage.reactions.resolve('➡️').users.remove(user.id)
                }
            });

            collector.on('end', collected => {
                console.log(`Collected ${collected.size} items`);
            });
        } else {
            let queueStr = "Music in Queue:\n```";
            for (var i = 0; i < musicQueue.length; i++) {
                queueStr += (i + 1) + ". " + musicQueue[i].title + " " + musicQueue[i].length + "\n";
            }
            queueStr += "```";
            message.channel.send(queueStr);
        }
    },
};