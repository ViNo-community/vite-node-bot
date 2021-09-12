import { Int32, RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import * as vite from "@vite/vitejs"
import { AccountBlockBlock} from '@vite/vitejs/distSrc/accountBlock/type';
import { viteClient } from '../index';
import { isValidBlockHeight, printAccountBlock } from '../common';

module.exports = {
	name: 'height',
	description: 'Display account block for specified account and block height',
	execute(message, args) {    
        let prefix = message.client.botConfig.prefix; 
        let address = "";
        let blockHeight = "";
        // Grab address and block height from user input
        if(args.length != 2) {
            message.channel.send("Usage: " + prefix + "height <address> <block height>");
            return;
        } else {
            address = args[0];
            if(vite.wallet.isValidAddress(address) == vite.wallet.AddressType.Illegal) {
                message.channel.send("Invalid address");
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
            console.error("Error while grabbing account summary :" + error.message);
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
        console.log(`Could not account retrieve info for ${address} at block height ${blockHeight}`, res);
        throw res.error;
    });

    try {
        let chatMessage = "";
        if(accountBlock == null) {
            chatMessage = "No information for account " + address + " at block height " + blockHeight;
        } else {
            chatMessage =  printAccountBlock(accountBlock);
        }
        // Send response to chat
        message.channel.send(chatMessage);
    } catch(err) {
        console.error("Error displaying account info for " + address + " : " + err);
        console.error(err.stack);
    }


}
