import { HTTP_RPC } from '@vite/vitejs-http';
import { ViteAPI } from '@vite/vitejs';
import { RPCResponse, TokenInfo } from '@vite/vitejs/distSrc/utils/type';
import { BalanceInfo} from '../viteTypes';
import { AccountBlockBlock} from '@vite/vitejs/distSrc/accountBlock/type';
import { viteClient } from '../index';

module.exports = {
	name: 'latest',
	description: 'Display latest account block info for specified address',
	execute(message, args) {    
        let prefix = message.client.botConfig.prefix; 
        let address = "";
        // User passes in address
        if(!args.length) {
            message.channel.send("Usage: " + prefix + "account <address>");
            return;
        } else {
            address = args[0];
        }
        console.log("Looking up info for address: " + address);
        // Get account info for address
        showAccountInformation(message, address)
        .catch(error => {
            console.error("Error while grabbing account summary :" + error.message);
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
        console.log(`Could not account retrieve info for ${address} `, res);
        throw res.error;
    });

    try {
        let chatMessage = "";
        if(accountBlock == null) {
            chatMessage = "No information for account " + address;
        } else {
            chatMessage = "**Address:** " + accountBlock.address +
                "\n**Block Height:** " + accountBlock.height + 
                "\n**Hash:** " + accountBlock.hash + 
                "\n**Previous Hash:** " + accountBlock.previousHash + 
                "\n**Public Key:** " + accountBlock.publicKey 
        }
        // Send response to chat
        message.channel.send(chatMessage);
    } catch(err) {
        console.error("Error displaying account info for " + address + " : " + err);
        console.error(err.stack);
    }


}
