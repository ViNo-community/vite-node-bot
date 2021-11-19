import { RPCResponse, TokenInfo } from '@vite/vitejs/distSrc/utils/type';
import { AccountInfo, BalanceInfo} from '../viteTypes';
import { viteClient } from '../index';
import { getLogger } from '../logger';
import { convertRaw } from '../common';
import fetch from 'node-fetch';

const logger = getLogger();

module.exports = {
	name: 'price',
  aliases: ["p","b"],
	description: 'Display price for specified tokenID',
	execute(message, args) {    
        let prefix = message.client.botConfig.prefix; 
        let tti = "";
        // User passes in address
        if(args.length != 1) {
            message.channel.send("Usage: " + prefix + "price <tti>");
            return;
        } 
        tti = args[0];
        console.log("Looking up price info for " + tti);
        // Form url to get price
        const priceUrl = "https://api.vitex.net/api/v2/exchange-rate?tokenSymbols=" + tti;
        fetch(priceUrl)
          .then(response => {
              if (!response.ok) {
                  throw new Error("HTTP error " + response.status);
              }
              return response.json();
          })
          .then(json => {
            // Output CSV file with holder data
            //message.channel.send("JSON  " + JSON.stringify(json));
            //message.channel.send("CODE: " + json.code + " MSG: " + json.msg)
            if(json.code != 0) {
              let errorMsg = "Code " + json.code + " : " + json.msg;
              message.channel.send(errorMsg)
              console.log(errorMsg);
              return;
            }
            //message.channel.send("JSON data " + JSON.stringify(json.data));
            //message.channel.send("Length of json.data " + json.data.length);
            // Parse USD r
            if(json.data.length >= 1) {
              let data = json.data[0];
              let price = data.usdRate;
              console.log("USD Rate: " + data.usdRate);
              message.channel.send("Price for " + tti + " : $" + 
                price.toLocaleString(undefined, {minimumFractionDigits: 2}));
            } else {
              message.channel.send("Could not find price data for " + tti);
            }
          }) 
          .catch(function (error) {
            console.log(error);
          })
        fetch(priceUrl)
          .then(res => res.text())
          .then(text => console.log(text));
	},
};

const getAccountInformation= async (address: string) => {
    const accountInfo: AccountInfo = await viteClient.request('ledger_getAccountInfoByAddress', address);
    return accountInfo;
};

const showPriceInformation = async (message, address: string) => {

    let accountInfo: AccountInfo;
    let balanceInfoMap : ReadonlyMap<String, BalanceInfo>;

    // Get account info for address
    accountInfo = await getAccountInformation(address).catch((res: RPCResponse) => {
        let errorMsg = "Could not retrieve account balances for " + address;
        logger.error(errorMsg);
        console.log(errorMsg, res);
        throw res.error.message;
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
                let readableBalance = convertRaw(balance, decimals);
                chatMessage += "**" + tokenInfo.tokenSymbol + ":** " + 
                    readableBalance.toLocaleString(undefined, {minimumFractionDigits: 2}) + "\n";
            }
        }
        // Send response to chat
        logger.info(chatMessage);
        message.channel.send(chatMessage);
    } catch(err) {
        console.error("Error displaying balance info for " + address + " : " + err);
        console.error(err.stack);
    }

}
