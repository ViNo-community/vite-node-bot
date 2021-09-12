import { RPCResponse, TokenInfo } from '@vite/vitejs/distSrc/utils/type';
import * as vite from "@vite/vitejs"
import { AccountInfo, BalanceInfo} from '../viteTypes';
import { viteClient } from '../index';

module.exports = {
	name: 'balance',
	description: 'Display account balances for specified address',
	execute(message, args) {    
        let prefix = message.client.botConfig.prefix; 
        let address = "";
        // User passes in address
        if(args.length != 1) {
            message.channel.send("Usage: " + prefix + "balance <address>");
            return;
        } 
        address = args[0];
        if(vite.wallet.isValidAddress(address) == vite.wallet.AddressType.Illegal) {
            message.channel.send("Invalid address");
            return;
        }
        console.log("Looking up balance info for address: " + address);
        // Get account info for address
        showAccountInformation(message, address)
        .catch(error => {
            console.error("Error while grabbing balances for " + address + " :" + error.message);
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
            chatMessage = "**Address:** " + accountInfo.address + "\n"
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
        console.error("Error displaying balance info for " + address + " : " + err);
        console.error(err.stack);
    }


}
