
const oldConfig = require('../config.json');   // Loads bot config file
const fs = require('fs');                   // Loads the Filesystem library

module.exports = {
	name: 'set_prefix',
	description: 'Set the bot prefix',
	execute(message, args) {
        
        prefix = message.client.botConfig.prefix;
        if(!args.length) {
            // No new prefix. Output usage
            message.channel.send("Usage: " + prefix + "set_prefix <new_prefix>");
            return;
        } else {
            // Read in new prefix
            newPrefix = args[0];
            // Create new config
            newConfig = {
                token: oldConfig.token,
                prefix: newPrefix,
            };
            try {
                // Write new config 
                fs.writeFileSync("config.json", JSON.stringify(newConfig, null, 2), function(err, result) {
                    if (err) throw err;
                });
            } catch(e) {
                console.error("Error writing new config.json: " + e);
                console.error(e.stack);
                message.channel.send("Could not set new command prefix: " + e);
            }

        }

        try {
            // Reload config
            console.log("Setting new prefix to " + newPrefix);
            // Reload config.json here
            delete require.cache[require.resolve('../config.json')]   // Delete cache
            config = require("../config.json");
            // Reload bot
            message.channel.send("Set new command prefix to \"" + newPrefix + "\"")
            .then(msg => message.client.destroy())
            .then(() => message.client.botConfig = config)
            .then(() => message.client.login(config.token)
            .then(() => { 
                let statusMessage = "say " + message.client.botConfig.prefix + "help | Online";
                // Set the client user's presence
                message.client.user.setPresence({ activity: { name: statusMessage}, status: "online" })
                .catch(console.error);
            }));
        } catch(e) {
            console.error("Error reloading bot: " + e);
            console.error(e.stack);
            message.channel.send("Could not reload bot with new config.json: " + e);
        }
	},
};