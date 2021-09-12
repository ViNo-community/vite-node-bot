import { Int32 } from '@vite/vitejs/distSrc/accountBlock/type';
import { AccountBlockBlock, BlockType } from '@vite/vitejs/distSrc/utils/type';
import {DateTime} from 'luxon';

export const getLatestCycleTimestampFromNow = () => {
    const nowUtc = DateTime.utc();
    const midnightUtc = nowUtc.set({second: 0, minute: 0, hour: 0, millisecond: 0});
    return midnightUtc.toSeconds();
};

export const getTodayForFilename = () => {
    return DateTime.now().toFormat("yyyy-MM-dd");
}

export const getYYMMDD = () => {
    return DateTime.now().toFormat('yyyyMMddHHMMss');
};

export const epochToDate = (epoch) => {
    let d  = new Date(0);
    d.setUTCSeconds(epoch);
    return d;
};

export const quotaToUT = (quota) => {
    return quota / 21000
};

export const printAccountBlock = (accountBlock : AccountBlockBlock) => {
    return "**Block Height:** " + accountBlock.height + 
        "\n**Block Type:** " + printBlockType(accountBlock.blockType) +
        "\n**Address:** " + accountBlock.address +
        "\n**To Address:** " + accountBlock.toAddress +
        "\n**Token ID:** " + accountBlock.tokenId +
        "\n**Amount:** " + accountBlock.amount +
        "\n**Data:** " + accountBlock.data +
        "\n**Fee:** " + accountBlock.fee +
        "\n**Difficulty:** " + accountBlock.difficulty +
        "\n**Nonce:** " + accountBlock.nonce +
        "\n**Hash:** " + accountBlock.hash + 
        "\n**Previous Hash:** " + accountBlock.previousHash + 
        "\n**Public Key:** " + accountBlock.publicKey +
        "\n**Send Block Hash:** " + accountBlock.sendBlockHash +
        "\n**Signature:** " + accountBlock.signature;
};

// Convert block type into string 
export const printBlockType = (blockType : BlockType) => {
    switch(blockType) {
        case 1: return "CreateContractRequest";
        case 2: return "TransferRequest";
        case 3: return "ReIssueRequest";
        case 4: return "Response";
        case 5: return "ResponseFail";
        case 6: return "RefundByContractRequest";
        case 7: return "GenesisResponse";
        default: return "UnknownBlockType";
    }
};

// Returns true if block height is valid. False if invalid
export const isValidBlockHeight = (blockHeight : Int32) => {
    // Convert into number
    let blockHeightValue : number = parseInt(blockHeight);
    // Cannot parse integer value
    if(isNaN(blockHeightValue)) return false;
    // Block height must be greater than 0
    if(blockHeightValue <= 0) return false;
    // Else return true
    return true;
};


// Returns true if address is valid. False if invalid
export const isValidAddress = (address : string) => {
    // Check if empty string
    if(address == "") return false;
    // Check if correct length
    if(address.length != 55) return false;
    // Check if starts with "vite_"
    if(! address.startsWith("vite_")) return false;
    // Else return true
    return true;
};