
export enum TransactionFormats {
    SubstrateExtrinsic,
    EVMTransactionData
}

export interface VultureTx {
    transactionData: any;
    transactionFormat: TransactionFormats;
}