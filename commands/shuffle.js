module.exports = {
    name: 'shuffle',
    description: 'Shuffles songs in queue',
    aliases: [],
    args: false,
    usage: '',
    cooldown: 5,
    guildOnly: true,
    execute(message) {
        var musicQueue = message.client.guildData.get(message.guild.id).musicQueue;
        
        if (musicQueue.length >= 2) {
            for (var i = musicQueue.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * Math.floor(i + 1));
                var temp = musicQueue[j];
                musicQueue[j] = musicQueue[i];
                musicQueue[i] = temp;
            }
            message.reply("Queued music has been shuffled.")
        } else {
            message.reply("Unable to shuffle music.")
        }
    },
};