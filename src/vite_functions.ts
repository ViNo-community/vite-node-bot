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
// Get price by tokenID (i.e. VINU-001)
export async function getTokenPriceByTokenID(tokenID: string) : Promise<number> {
    return getTokenPrice("tokenSymbols",tokenID);
}

// Get price by tti (i.e. tti_541b25bd5e5db35166864096 )
export async function getTokenPriceByTTI(tti: string) : Promise<number> {
    return getTokenPrice("tokenIds",tti);
}

export async function getTokenPrice(paramName: string, token: string) : Promise<number> {
    // Form url to get price
    const priceUrl = "https://api.vitex.net/api/v2/exchange-rate?" + paramName + "=" + token;
    console.log("Fetching price data from " + priceUrl);
    return fetch(priceUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(json => {
            if(json.code != 0) {
                throw new Error("Invalid Code " + json.code + " Msg: " + json.msg);
            }
            console.log("JSON returned: " + JSON.stringify(json));
            // Parse USD out of JSON
            if(json.data.length >= 1) {
                let data = json.data[0];
                return data.usdRate;
            } else {
                throw new Error("Could not find price data for " + token);
            }
        }) 
        .catch(function (error) {
            console.log(error);
        })
}
