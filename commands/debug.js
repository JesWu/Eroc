const {MongoClient} = require('mongodb');
const { currency, uri } = require('../config.json');
const client = new MongoClient(uri, { useNewUrlParser: true });

module.exports = {
	name: 'debug',
    description: 'Developer testing command',
    aliases: [],
    args: false,
    usage: '',
    cooldown: 0,
    guildOnly: false,
	async execute(message) {
        try{
            await client.connect();

            // await module.exports.createUser(client, {
            //     _id: message.author.id,
            //     currency: 0
            // });

            const result = await module.exports.findUser(client, message.author.id);
            if(result){
                message.reply(`You have: ${result.currency} ${currency}`);
            }

        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    },
    async createUser(client, newUser) {
        const result = await client.db("erocdb").collection("users").insertOne(newUser);
        console.log(`New listing created with the following id: ${result.insertedId}`);
    },
    async findUser(client, userID) {
        const result = await client.db("erocdb").collection("users")
                            .findOne({ _id: userID });
        
        return result;
    }
};