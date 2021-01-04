module.exports = {
    name: 'resume',
    description: 'Resumes paused song',
    aliases: [],
    args: false,
    usage: '',
    cooldown: 5,
    guildOnly: true,
    execute(message) {
        //ensure user is in voice channel with bot
        if (message.member.voice.channel && message.member.voice.channel === message.guild.voice.channel) {
            message.guild.voice.connection.dispatcher.resume();
            message.reply("Song resumed.");
        } else {
            message.reply("You need to join the voice channel with the bot first!");
        }
    },
};