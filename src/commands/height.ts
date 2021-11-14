import { Int32, RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import * as vite from "@vite/vitejs"
import { AccountBlockBlock} from '@vite/vitejs/distSrc/accountBlock/type';
import { viteClient } from '../index';
import { isValidBlockHeight, printAccountBlock } from '../common';
import { getLogger } from '../logger';

const logger = getLogger();

module.exports = {
	name: 'height',
    aliases: ["h"],
	description: 'Display account block for specified account and block height',
	execute(message, args) {    
        let prefix = message.client.botConfig.prefix; 
        let address = "";
        let blockHeight = "";
        const logger = getLogger();
        // Grab address and block height from user input
        if(args.length != 2) {
            message.channel.send("Usage: " + prefix + "height <address> <block height>");
            return;
        } else {
            address = args[0];
            if(vite.wallet.isValidAddress(address) == vite.wallet.AddressType.Illegal) {
                let errorMsg : string = "Invalid address \"" + address + "\"";
                message.channel.send(errorMsg);
                logger.error(errorMsg);
                return;
            }
            blockHeight = args[1];
            if(! isValidBlockHeight(blockHeight)) {
                message.channel.send("Invalid block height");
                return;
            }
        }
        console.log("Looking up account block for " + address + " at block height " + blockHeight);
        // Get account info for address
        showAccountBlockAtHeight(message, address, blockHeight)
        .catch(error => {
            let errorMsg = "Error while grabbing " + address + " block height " + blockHeight + " : " + error;
            message.channel.send(errorMsg);
            logger.error(errorMsg);
            console.error(errorMsg);
        });
	},
};

const getAccountBlockAtHeight = async (address: string, blockHeight : Int32) => {
    const accountBlock: AccountBlockBlock = await viteClient.request('ledger_getAccountBlockByHeight', address, blockHeight);
    return accountBlock;
};

const showAccountBlockAtHeight = async (message, address: string, blockHeight : Int32 ) => {

    let accountBlock : AccountBlockBlock;
  
    accountBlock = await getAccountBlockAtHeight(address, blockHeight).catch((res: RPCResponse) => {
        let errorMsg = "Error while grabbing " + address + " block height " + blockHeight + " : " + res.error.message;
        logger.error(errorMsg);
        console.log(errorMsg);
        throw res.error;
    });

    try {
        let chatMessage = "";
        if(accountBlock == null) {
            chatMessage = "No information for account " + address + " at block height " + blockHeight;
        } else {
            printAccountBlock(accountBlock).then(res => {
                // Send response to chat
                logger.info(res);
                message.channel.send(res);
            });
        }
        // Send response to chat
        logger.info(chatMessage);
        message.channel.send(chatMessage);
    } catch(err) {
        console.error("Error displaying account info for " + address + " : " + err);
        console.error(err.stack);
    }
}
