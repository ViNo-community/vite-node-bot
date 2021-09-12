import { RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import * as vite from "@vite/vitejs"
import { AccountBlockBlock} from '@vite/vitejs/distSrc/accountBlock/type';
import { viteClient } from '../index';
import { printAccountBlock } from '../common';
import { getLogger } from '../logger';

const logger = getLogger();

module.exports = {
	name: 'newest',
	description: 'Display newest account block info for specified address',
	execute(message, args) {    
        let prefix = message.client.botConfig.prefix; 
        let address = "";
        // User passes in address
        if(args.length != 1) {
            message.channel.send("Usage: " + prefix + "newest <address>");
            return;
        } 
        address = args[0];
        if(vite.wallet.isValidAddress(address) == vite.wallet.AddressType.Illegal) {
            message.channel.send("Invalid address");
            return;
        }
        console.log("Looking up newest account block for address: " + address);
        // Get account info for address
        showAccountInformation(message, address)
        .catch(error => {
            let errorMsg = "Error while grabbing newest account block for " + address + " :" + error.message;
            logger.error(errorMsg);
            console.error(errorMsg);
        });


	},
};

const getAccountInformation= async (address: string) => {
    const accountBlock: AccountBlockBlock = await viteClient.request('ledger_getLatestAccountBlock', address);
    return accountBlock;
};

const showAccountInformation = async (message, address: string) => {

    let accountBlock : AccountBlockBlock;
  
    accountBlock = await getAccountInformation(address).catch((res: RPCResponse) => {
        let errorMsg = "Could not grab newest block for " + address + " : " + res.error.message;
        logger.error(errorMsg);
        console.log(errorMsg);
        throw res.error;
    });

    try {
        let chatMessage = "";
        if(accountBlock == null) {
            chatMessage = "No information for account " + address;
        } else {
            chatMessage =  printAccountBlock(accountBlock);
        }
        // Send response to chat
        logger.info(chatMessage);
        message.channel.send(chatMessage);
    } catch(err) {
        console.error("Error displaying account info for " + address + " : " + err);
        console.error(err.stack);
    }


}
