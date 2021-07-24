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