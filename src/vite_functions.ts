import { RPCResponse, TokenInfo } from '@vite/vitejs/distSrc/utils/type';
import * as vite from "@vite/vitejs";
import { convertRaw } from 'common';
import { viteClient } from './index';
import { getLogger } from './logger';
import fetch from 'node-fetch';

const logger = getLogger();

export async function getTokenInformation(tokenID: string)  {
    try {
        const tokenInfo: TokenInfo = await viteClient.request('contract_getTokenInfoById', tokenID);
        return tokenInfo;
    } catch(error) {
        const errorMsg = "Error while calling contract_getTokenInfoById \"" + tokenID + "\" : " + error;
        logger.error(errorMsg);
        console.error(errorMsg);
        throw error;
    }
}

export async function getTokenPrice(tti: string)  {
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
            if(json.code != 0) {
                console.log("Fetch " + priceUrl + " Response Code : " + json.code + " MSG: " + json.msg);
                return -1;
            }
            // Parse USD out of JSON
            if(json.data.length >= 1) {
                let data = json.data[0];
                return data.usdRate;
            } else {
                console.log("Could not find price data for " + tti);
                return -1;
            }
        }) 
        .catch(function (error) {
            console.log(error);
        })
}
