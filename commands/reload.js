

const fs = require('fs');                   // Loads the Filesystem library

module.exports = {
	name: 'reload',
	description: 'Reload the bot',
	execute(message, args) {
        try {
            // Reload config here
            delete require.cache[require.resolve('../config.json')]   // Delete cache
            config = require("../config.json");

            console.log("New prefix " + config.prefix);
            message.channel.send("Reloading bot");
            /**message.client.destroy();
            message.client.login(config.token);
            message.channel.send("Reloaded bot");*/
            message.channel.send('Resetting...')
            .then(msg => message.client.destroy())
            .then(() => message.client.botConfig = config)
            .then(() => message.client.login(config.token)
            .then(() => { 
                let statusMessage = "say " + message.client.botConfig.prefix + "help | Online";
                // Set the client user's presence
                message.client.user.setPresence({ activity: { name: statusMessage}, status: "online" })
                .catch(console.error);
            }));

        } catch(err) {
            console.error(err);
            console.error(err.stack);
        }
	},
};