import { AccountBlockBlock } from '@vite/vitejs/distSrc/utils/type';
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
        "\n**Block Type:** " + accountBlock.blockType +
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