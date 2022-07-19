
export interface SubstrateScheduledUnstake {
    balanceToUnlock: string,
    eraOfUnlock: string,
};

export interface SubstrateStakingInfo {
    stakingAddress: string,
    controllerAddress: string,

    nominationAddress?: string

    isStashAccountBonded: boolean,

    frozenBalance: string,
    stakedBalance: string,
    liquidBalance: string,

    minimumBondAmount: string,

    unlocking: SubstrateScheduledUnstake[]

    currentEra: string,
}

export interface SubstrateBondData {
    controllerAddress: string,
    stakingAddressDerivationPath: string,
    bondAmountWhole: string, // no decimals!!!
    //rewardDestination: 
}

export enum StakingInfo {
    Substrate = 'Substrate',
}