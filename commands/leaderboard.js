const { currency } = require('../config.json');

module.exports = {
    name: 'leaderboard',
    description: 'Displays your current balance.',
    aliases: ['ldb', 'ranks'],
    args: false,
    usage: '',
    cooldown: 5,
    guildOnly: false,
    async execute(message, args, client) {
        const result = await client.db("erocdb").collection("users").find({}).toArray();
        //console.log(result);
        result.sort((a,b) => {return b.currency - a.currency});
        //console.log(result);
        var datastr = "Global Leaderboard:\n```"
        for(var i = 0; i < (result.length < 10 ? result.length : 10); i++){
            datastr += (i + 1) + ". " + result[i].name + " - " + result[i].currency + " " + currency + "\n";
        }
        datastr += "```";
        message.channel.send(datastr);
    },
};