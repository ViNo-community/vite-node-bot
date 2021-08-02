import { HTTP_RPC } from '@vite/vitejs-http';
import { ViteAPI } from '@vite/vitejs';
import { RPCResponse, TokenInfo } from '@vite/vitejs/distSrc/utils/type';
import { AccountInfo, BalanceInfo} from '../viteTypes';

// Grab data from .env
require('dotenv').config();

// Grab files from .env
const RPC_NET = process.env.RPC_NET;
const SBP_NAME = process.env.SBP_NAME || 'ViNo_Community_Node';

const httpProvider = new HTTP_RPC(RPC_NET);
let viteClient = new ViteAPI(httpProvider, () => {
    console.log('Vite client successfully connected: ');
});

module.exports = {
	name: 'account',
	description: 'Display account information for specified address',
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
    const accountInfo: AccountInfo = await viteClient.request('ledger_getAccountInfoByAddress', address);
    return accountInfo;
};

const showAccountInformation = async (message, address: string) => {

    let accountInfo: AccountInfo;
    let balanceInfoMap : ReadonlyMap<String, BalanceInfo>;

    // Get rewards pending info for specified SBP
    accountInfo = await getAccountInformation(address).catch((res: RPCResponse) => {
        console.log(`Could not account retrieve info for ${address} `, res);
        throw res.error;
    });

    try {
        let chatMessage = "";
        if(accountInfo == null) {
            chatMessage = "No information for account " + address;
        } else {
            chatMessage = "**Address:** " + accountInfo.address +
                "\n**Block Count:** " + accountInfo.blockCount + "\n";
            balanceInfoMap = accountInfo.balanceInfoMap;
            for(const tokenID in balanceInfoMap) {
                let balanceInfo : BalanceInfo = balanceInfoMap[tokenID];
                let tokenInfo : TokenInfo = balanceInfo.tokenInfo;
                let decimals = parseInt(tokenInfo.decimals);
                let balance = parseFloat(balanceInfo.balance);
                let readableBalance = balance/ Math.pow(10, decimals);
                chatMessage += "**" + tokenInfo.tokenSymbol + ":** " + 
                    readableBalance.toLocaleString(undefined, {minimumFractionDigits: 2}) + "\n";
            }
        }
        // Send response to chat
        message.channel.send(chatMessage);
    } catch(err) {
        console.error("Error displaying account info for " + address + " : " + err);
        console.error(err.stack);
    }


}
