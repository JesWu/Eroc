const ytsr = require('ytsr');

module.exports = {
    name: 'search',
    description: 'Searches for given term',
    aliases: [],
    args: true,
    usage: '<search term>',
    cooldown: 5,
    guildOnly: true,
    async execute(message, args, client) {
        var sr = [];
        var searchStr = "";
        for(arg of args){
            searchStr += arg + " ";
        }
        let resultStr = "Results: \n```\n";
        sr = [];
        message.channel.send("Searching for: " + searchStr);

        const filters1 = await ytsr.getFilters(searchStr);
        const filter1 = filters1.get('Type').get('Video');
        const searchResults = await ytsr(filter1.url, { pages: 1 });

        for (var i = 0; i < searchResults.items.length; i++) {
            sr.push(searchResults.items[i]);
            resultStr += (i + 1) + `. ${searchResults.items[i].title} ${searchResults.items[i].duration}\n`;
        }
        resultStr += "```";
        message.reply(resultStr);
        message.client.guildData.set(message.guild.id, { musicQueue: message.client.guildData.get(message.guild.id).musicQueue, sr: sr });
        //console.log(message.client.guildData.get(message.guild.id).sr);
    },
};