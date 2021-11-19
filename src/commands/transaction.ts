import { RPCResponse} from '@vite/vitejs/distSrc/utils/type';
import { viteClient } from '../index';
import { AccountBlockBlock } from '@vite/vitejs/distSrc/accountBlock/type';
import { printAccountBlock } from '../common';
import { getLogger } from '../logger';

const logger = getLogger();

module.exports = {
	name: 'transaction',
    aliases: ["tx","trans"],
	description: 'Display transaction information by hash',
	execute(message, args) {    
        let prefix = message.client.botConfig.prefix; 
        let txHash = "";
        // User passes in address
        if(args.length != 1) {
            message.channel.send("Usage: " + prefix + "transaction <hash>");
            return;
        } else {
            txHash = args[0].replace('@', '@​\u200b'); 
        }
        console.log("Looking up info for transaction hash: " + txHash);
        // Get account info for address
        showTxInformation(message, txHash)
        .catch(error => {
            let errorMsg = "Error grabbing data for transaction hash " + txHash + " : " + error;
            console.error(errorMsg);
            message.channel.send(errorMsg);
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
        let errorMsg = "Could not find transaction info for hash \"" + txHash + "\" : " + res.error.message;
        logger.error(errorMsg);
        console.log(errorMsg);
        throw res.error.message;
    });

    try {
        let chatMessage = "";
        if(accountBlock == null) {
            chatMessage = "No information for transaction " + txHash;
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
        console.error("Error displaying transaction info for " + txHash + " : " + err);
        console.error(err.stack);
    }

}
