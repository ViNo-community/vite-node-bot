import { RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import { AccountInfo} from '../viteTypes';
import { viteClient } from '../index';
import { getLogger } from '../logger';
import { getTokenPriceByTTI } from '../vite_functions';

const logger = getLogger();

module.exports = {
	name: 'price',
  aliases: ["p","b"],
	description: 'Display price for specified tokenID',
	execute(message, args) {    
        let prefix = message.client.botConfig.prefix; 
        let tti = "";
        // User passes in address
        if(args.length != 1) {
            message.channel.send("Usage: " + prefix + "price <tti>");
            return;
        } 
        tti = args[0].replace('@', '@​\u200b');
        console.log("Looking up price info for " + tti);
        // Show price info for tti
        showPriceInformation(message, tti)
        .catch(error => {
            let errorMsg = "Error while price information for " + tti + " : " + error;
            message.channel.send(errorMsg);
            logger.error(errorMsg);
            console.error(errorMsg);
        });

	},
};

const showPriceInformation = async (message, tti: string) => {

  // Look up price for tokenID
  let price  = await getTokenPriceByTTI(tti).catch((res: RPCResponse) => {
    let errorMsg = "Could not get price for " + tti;
    logger.error(errorMsg);
    console.log(errorMsg, res);
    throw res.error;
  });
  // Send to chat
  if(price !== undefined) {
    let chatMsg : string = "Price of " + tti + " is $" + price.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    message.channel.send(chatMsg);
  }
}