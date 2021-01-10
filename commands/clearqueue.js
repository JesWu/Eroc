module.exports = {
    name: 'clearqueue',
    description: 'clears song queue',
    aliases: ['clear', 'empty', 'remove'],
    args: false,
    usage: '<number in queue>',
    cooldown: 5,
    guildOnly: true,
    execute(message, args) {
        if (message.member.voice.channel && message.member.voice.channel === message.guild.voice.channel) {
            var musicQueue = message.client.guildData.get(message.guild.id).musicQueue;
            if(musicQueue.length == 0) return message.reply("No music to clear");
            if(args.length == 0){
                musicQueue = [];
                message.reply("Queue cleared.");
            }else if(!isNaN(args[0])){
                if(args[0] >= 1 && args[0] <= musicQueue.length){
                    message.reply(`Removed \`\`\`${args[0]}. ${musicQueue[args[0] - 1].title} - ${musicQueue[args[0] - 1].length}\`\`\` from queue`);
                    musicQueue.splice(args[0] - 1, 1);
                }
            }else{
                message.reply(`Invalid use of clearqueue.`);
            }
            message.client.guildData.get(message.guild.id).musicQueue = musicQueue;
        }
    },
};