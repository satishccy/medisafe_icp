import algosdk,{ AtomicTransactionComposer, OnApplicationComplete } from "algosdk";
import { Buffer } from 'buffer';
import appspec from '../application.json'


function peraWalletSigner(peraWallet){
    return async (txnGroup, indexesToSign) => {
      return await peraWallet.signTransaction([
        txnGroup.map((txn, index) => {
          if (indexesToSign.includes(index)) {
            return {
              txn,
            };
          }
  
          return {
            txn,
            signers: [],
          };
        }),
      ]);
    };
  }

async function ski() {
const baseServer = 'https://testnet-algorand.api.purestake.io/ps2'
const port = '';
const token = {
    'X-API-Key': 'LFIoc7BZFY4CAAHfCC2at53vp5ZabBio5gAQ0ntL'
}
const algodclient = new algosdk.Algodv2(token, baseServer, port);
const suggestedParams = await algodclient.getTransactionParams().do();
console.log(algodclient);
const contract = new algosdk.ABIContract(appspec.contract);

const atc = new algosdk.AtomicTransactionComposer();
atc.addMethodCall({
    appID:480211975,
    method:algosdk.getMethodByName(contract.methods, 'account_optin'),
    methodArgs: ["Danger","PATIENT","44/44/44"],
    sender: "JVM6EULRE7GISC4MF4VP2SVWMCLHBXTXASRHMPI4WA6KTQACCMDKDWAM5U",
    suggestedParams:suggestedParams,
    signer: peraWalletSigner(peraWallet),
    onComplete: OnApplicationComplete.OptInOC
})
console.log(atc);

console.log(atc.execute(algodclient,4))
}

function Test(){
    ski();
    return (<h1>test</h1>);
}

export default Test;
