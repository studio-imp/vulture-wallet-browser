import localforage from "localforage";

export enum WebAppStates {
    ONBOARDING = 'ONBOARDING',
    CREATE_LEDGER_WALLET = 'CREATE_LEDGER_WALLET',

}
export async function setWebAppState(state: WebAppStates) {
    localforage.setItem('CurrentWebAppState', state);
}
export async function getWebAppState(): Promise<WebAppStates>{
    return new Promise(function(resolve, reject){
        localforage.getItem("CurrentWebAppState").then((value) => {
            if(value != null) {
                resolve(value as WebAppStates);
            }else {
                reject(WebAppStates.ONBOARDING);
            }
        });
    });
}