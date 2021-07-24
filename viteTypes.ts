import { Hex, Uint8, Uint16, Int64, Uint64, TokenId, TokenInfo, Base64, 
    BlockType, RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import { Address, BigInt, AddressObj } from '@vite/vitejs/distSrc/accountBlock/type';

export interface SBPInfo {
	name: String;
	blockProducingAddress: Address;
	stakeAddress: Address;
	stakeAmount: BigInt;
	expirationHeight: Uint64;
	expirationTime: Int64;
	revokeTime: Int64;
}

export interface RewardInfo {
	totalReward: BigInt;
	blockProducingReward: BigInt;
	votingReward: BigInt;
	producedBlocks: BigInt;
	targetBlocks: BigInt;
}

export interface RewardPendingInfo {
	totalReward: BigInt;
	blockProducingReward: BigInt;
	votingReward: BigInt;
    allRewardWithdrawed: boolean;
}

export interface RewardByDayInfo {
	rewardMap: ReadonlyMap<string, RewardInfo>;
	startTime: Int64;
	endTime: Int64;
	cycle: Uint64;
}

export interface Receiver {
	address: Address;
	amount: BigInt;
}

export interface SBPVoteDetail {
	blockProducerName: string;
	totalVotes: BigInt;
	blockProducingAddress: Address;
	historyProducingAddresses: ReadonlyArray<Address>;
	addressVoteMap: AddressVoteMap;
}

export interface AccountInfo {
	name: string;
	address: Address;
	blockCount: Uint64;
	balanceInfoMap: ReadonlyMap<string, BalanceInfo>;
}

export interface BalanceInfo {
	tokenInfo: TokenInfo;
	balance: BigInt;
	transactionCount: Uint64;
}

export interface SBPVoteInfo {
	sbpName: string,
	blockProducingAddress: Address,
	votes: BigInt
}

export interface AddressVoteMap {
	[key: string]: string;
}

// Convert RAW units to VITE (18 decimal points)
export const rawToVite = function(raw) {
    return raw / 1e18;
}