
const oldConfig = require('../config.json');   // Loads bot config file
const fs = require('fs');                   // Loads the Filesystem library

module.exports = {
	name: 'mode',
	description: 'Set which network to connect to',
	execute(message, args) {

        if(!args.length) {
            const mode  = message.client.botConfig.mode;
            // No new prefix. Output usage
            message.channel.send("Currently in " + mode);
            return;
        }

        // Read in new mode
        const newMode = args[0];
        if(! (newMode == "TESTNET" || newMode == "MAINNET")) {
            message.channel.send("Invalid mode");
            message.channel.send("Usage: " + oldConfig.prefix + "mode [TESTNET | MAINNET]");
            return;
        }

        // Create new config
        var newConfig = {
            token: oldConfig.token,
            prefix: oldConfig.prefix,
            mode: newMode
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


        try {
            // Reload config
            console.log("Setting new mode to " + newMode);
            // Reload config.json here
            delete require.cache[require.resolve('../config.json')]   // Delete cache
            var config = require("../config.json");
            // Reload bot
            message.channel.send("Switching to " + newMode)
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