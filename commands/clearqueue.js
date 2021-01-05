module.exports = {
    name: 'clearqueue',
    description: 'clears song queue',
    aliases: ['clear', 'empty'],
    args: false,
    usage: '',
    cooldown: 5,
    guildOnly: true,
    execute(message) {
        if (message.member.voice.channel && message.member.voice.channel === message.guild.voice.channel) {
            message.client.guildData.get(message.guild.id).musicQueue = [];
        }
        message.reply("Queue cleared.");
    },
};