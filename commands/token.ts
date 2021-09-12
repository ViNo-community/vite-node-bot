import { showTokenInformation } from '../tokenHelper';

module.exports = {
	name: 'token',
	description: 'Display token information for specified token ID',
	execute(message, args) {     
        // User can pass in optional SBP Name
        let prefix = message.client.botConfig.prefix; 
        let tokenID = "";
        // User passes in address
        if(!args.length) {
            message.channel.send("Usage: " + prefix + "token <tokenID>");
            return;
        } else {
            tokenID = args[0];
        }
        console.log("Looking up token info for " + tokenID);
        // Get token info for tokenID
        showTokenInformation(message, tokenID)
        .catch(error => {
            console.error("Error while grabbing token information: " + error.message);
        });
	},
};