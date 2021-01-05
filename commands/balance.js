const { currency } = require('../config.json');

module.exports = {
	name: 'balance',
    description: 'Displays your current balance.',
    aliases: ['money', 'bal'],
    args: false,
    usage: '',
    cooldown: 5,
    guildOnly: false,
	async execute(message, args, client) {

            const result = await module.exports.findUser(client, message.author.id);
            if(result){
                message.reply(`You have: ${result.currency} ${currency}`);
            }
    },
    async findUser(client, userID) {
        const result = await client.db("erocdb").collection("users")
                            .findOne({ _id: userID });
        
        return result;
    }
};