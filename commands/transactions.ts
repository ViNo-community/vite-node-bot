
import { RPCResponse} from '@vite/vitejs/distSrc/utils/type';
import { viteClient } from '../index';
import { AccountBlockBlock } from '@vite/vitejs/distSrc/accountBlock/type';
import { printAccountBlock } from '../common';

// Grab data from .env
require('dotenv').config();

module.exports = {
	name: 'transaction',
	description: 'Display transaction information by hash',
	execute(message, args) {    
        let prefix = message.client.botConfig.prefix; 
        let txHash = "";
        // User passes in address
        if(!args.length) {
            message.channel.send("Usage: " + prefix + "transaction <hash>");
            return;
        } else {
            txHash = args[0];
        }
        console.log("Looking up info for transaction: " + txHash);
        // Get account info for address
        showTxInformation(message, txHash)
        .catch(error => {
            console.error("Error while grabbing transaction data")
            message.channel.send("Error looking up info for transaction: " + txHash);
        });


	},
};

const getTxInformation= async (txHash: string) => {
    const accountBlock: AccountBlockBlock  = await viteClient.request('ledger_getAccountBlockByHash', txHash);
    return accountBlock;
};

const showTxInformation = async (message, txHash: string) => {

    let accountBlock : AccountBlockBlock;

    // Get rewards pending info for specified SBP
    accountBlock = await getTxInformation(txHash).catch((res: RPCResponse) => {
        console.log(`Could not account transaction info for ${txHash} `, res);
        throw res.error;
    });

    try {
        let chatMessage = "";
        if(accountBlock == null) {
            chatMessage = "No information for transaction " + txHash;
        } else {
            chatMessage = printAccountBlock(accountBlock);
        }
        // Send response to chat
        message.channel.send(chatMessage);
    } catch(err) {
        console.error("Error displaying transaction info for " + txHash + " : " + err);
        console.error(err.stack);
    }

}
