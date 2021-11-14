import { RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import * as vite from "@vite/vitejs"
import { viteClient } from '../index';
import { getLogger } from '../logger';
import { AccountInfo } from 'viteTypes';

const logger = getLogger();

module.exports = {
	name: 'pending_count',
    aliases: ["pcnt"],
	description: 'Display number pending transactions for specified account',
	execute(message, args) {    
        let prefix = message.client.botConfig.prefix; 
        let address = "";
        const logger = getLogger();
        // Grab address and block height from user input
        if(args.length != 1) {
            message.channel.send("Usage: " + prefix + "pending_count <address>");
            return;
        } else {
            address = args[0];
            if(vite.wallet.isValidAddress(address) == vite.wallet.AddressType.Illegal) {
                let errorMsg : string = "Invalid address \"" + address + "\"";
                message.channel.send(errorMsg);
                logger.error(errorMsg);
                return;
            }
        }
        console.log("Looking up pending transaction count for " + address);
        // Get account info for address
        showUnreceivedCount(message, address)
        .catch(error => {
            let errorMsg = "Error while grabbing unreceived transactions count for " + address;
            message.channel.send(errorMsg);
            logger.error(errorMsg);
            console.error(errorMsg);
        });
	},
};

const getUnreceivedCount = async (address: string) => {
    const accountInfo: AccountInfo= await viteClient.request('ledger_getUnreceivedTransactionSummaryByAddress', address);
    return accountInfo;
};

const showUnreceivedCount = async (message, address: string) => {

    let accountInfo : AccountInfo;
  
    accountInfo= await getUnreceivedCount(address).catch((res: RPCResponse) => {
        let errorMsg = "Error while grabbing unreceived transcations  count for " + address + " : " + res.error.message;
        logger.error(errorMsg);
        console.log(errorMsg);
        throw res.error;
    });

    try {
        let chatMessage = "";
        if(accountInfo == null) {
            chatMessage = "No information for unreceived transactions for account " + address;
        } else {
            let count = accountInfo.blockCount;
            chatMessage = address + " has " + count + " unreceived transactions";
            // Send response to chat
            logger.info(chatMessage);
            message.channel.send(chatMessage);   
        }
    } catch(err) {
        console.error("Error displaying account info for " + address + " : " + err);
        console.error(err.stack);
    }
}
