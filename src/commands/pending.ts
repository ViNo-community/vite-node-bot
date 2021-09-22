import { Int32, RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import * as vite from "@vite/vitejs"
import { AccountBlockBlock} from '@vite/vitejs/distSrc/accountBlock/type';
import { viteClient } from '../index';
import { printAccountBlock } from '../common';
import { getLogger } from '../logger';

const logger = getLogger();

module.exports = {
	name: 'pending',
	description: 'Display pending transactions for specified account and block height',
	execute(message, args) {    
        let prefix = message.client.botConfig.prefix; 
        let address = "";
        let index = 0;
        let pageSize = 0;
        const logger = getLogger();
        // Grab address and block height from user input
        if(args.length != 3) {
            message.channel.send("Usage: " + prefix + "pending <address> <index> <pageSize>");
            return;
        } else {
            address = args[0];
            if(vite.wallet.isValidAddress(address) == vite.wallet.AddressType.Illegal) {
                let errorMsg : string = "Invalid address \"" + address + "\"";
                message.channel.send(errorMsg);
                logger.error(errorMsg);
                return;
            }
            index = parseInt(args[1]);
            if(index < 0) {
                message.channel.send("Invalid index. Must be greater than 0")
                return;
            }
            if(isNaN(index)) {
                message.channel.send("Invalid index. Must be integer")
                return;
            }
            pageSize = parseInt(args[2])
            if(pageSize < 0) {
                message.channel.send("Invalid page size. Must be greater than 0")
                return;
            }
            if(isNaN(pageSize)) {
                message.channel.send("Invalid page size. Must be integer")
                return;
            }
        }
        console.log("Looking up account block for " + address + " at index " + index);
        // Get account info for address
        showUnreceivedBlocks(message, address, index, pageSize)
        .catch(error => {
            let errorMsg = "Error while grabbing unreceived transactions for " + address + " index  " + index + " : " + error;
            message.channel.send(errorMsg);
            logger.error(errorMsg);
            console.error(errorMsg);
        });
	},
};

const getUnreceivedBlocks = async (address: string, index: number, pageSize : number) => {
    const accountBlocks: AccountBlockBlock[] = await viteClient.request('ledger_getUnreceivedBlocksByAddress', address, index, pageSize);
    return accountBlocks;
};

const showUnreceivedBlocks = async (message, address: string, index : number, pageSize : number) => {

    let accountBlocks : AccountBlockBlock[];
  
    accountBlocks = await getUnreceivedBlocks(address, index, pageSize).catch((res: RPCResponse) => {
        let errorMsg = "Error while grabbing unreceived transcations for " + address + " index " + index + " : " + res.error.message;
        logger.error(errorMsg);
        console.log(errorMsg);
        throw res.error;
    });

    try {
        let chatMessage = "";
        if(accountBlocks == null) {
            chatMessage = "No information for unreceived transactions for account " + address + " at index " + index;
        } else {
            // Loop thru account blocks
            for (let i =0;i < accountBlocks.length; i++) {
                chatMessage = "**Unreceived Transaction #" + (i + 1) + "**\n";
                chatMessage +=  printAccountBlock(accountBlocks[i]);
                // Send response to chat
                logger.info(chatMessage);
                message.channel.send(chatMessage);
            }
        }
    } catch(err) {
        console.error("Error displaying account info for " + address + " : " + err);
        console.error(err.stack);
    }


}
