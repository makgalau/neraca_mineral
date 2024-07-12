const { Gateway, Wallets, TxEventHandler, GatewayOptions, DefaultEventHandlerStrategies, TxEventHandlerFactory } = require('fabric-network');
const fs = require('fs');
const path = require("path")
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const util = require('util')

const helper = require('./helper')

// const invokeTransaction = async (channelName, chaincodeName, fcn, args, username, org_name, transientData) => {
const invokeTransaction = async (channelName, chaincodeName, fcn, args, username, org_name) => {
    try {
        logger.debug(util.format('\n============ invoke transaction on channel %s ============\n', channelName));
  
        // load the network configuration
        const ccp = await helper.getCCP(org_name) //JSON.parse(ccpJSON);

        // Create a new file system based wallet for managing identities.
        const walletPath = await helper.getWalletPath(org_name) //path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);


        // Check to see if we've already enrolled the user.
        let myidentity = await wallet.get(username);
        if (!myidentity) {
            console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
            await helper.getRegisteredUser(username, org_name, true)
            myidentity = await wallet.get(username);
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        const connectOptions = {
            identity: username,
            wallet: wallet,  
            discovery: { enabled: true, asLocalhost: true } 
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, connectOptions);         //error disini kyknya

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);
        const contract = await network.getContract(chaincodeName);
        
        let result
        let message;

        //=================pke fungsi di nsdm_cc ==========================
        if (fcn === "CreateAsset"){
            result = await contract.submitTransaction(fcn, args[0].toString(), args[1].toString(), args[2].toString(), args[3].toString(), args[4].toString(),args[5].toString(),args[6].toString(),args[7].toString(),args[8].toString(),args[9].toString(),args[10].toString(),
                args[11].toString(),args[12].toString(),args[13].toString(),args[14].toString(),args[15].toString(),args[16].toString(),args[17].toString(),args[18].toString(),args[19].toString(),args[20].toString(),args[21].toString(),args[22].toString(),args[23].toString(),
                args[24].toString(),args[25].toString(),args[26].toString(),args[27].toString(),args[28].toString(),args[29].toString(),args[30].toString(),args[31].toString(),args[32].toString(),args[33].toString(),args[34].toString(),args[35].toString(),args[36].toString(),
                args[37],args[38]);    
            message = `Successfully added asset with IDLogam ${args[0]}`;
            console.log(result);
        } else if  (fcn === "UpdateAsset") {    
            result = await contract.submitTransaction(fcn, args[0].toString(), args[1].toString(), args[2].toString(), args[3].toString(), args[4].toString(),args[5].toString(),args[6].toString(),args[7].toString(),args[8].toString(),args[9].toString(),args[10].toString(),
                args[11].toString(),args[12].toString(),args[13].toString(),args[14].toString(),args[15].toString(),args[16].toString(),args[17].toString(),args[18].toString(),args[19].toString(),args[20].toString(),args[21].toString(),args[22].toString(),args[23].toString(),
                args[24].toString(),args[25].toString(),args[26].toString(),args[27].toString(),args[28].toString(),args[29].toString(),args[30].toString(),args[31].toString(),args[32].toString(),args[33].toString(),args[34].toString(),args[35].toString(),args[36].toString(),
                args[37],args[38],args[39]);    
            message = `Successfully updated asset with IDLogam ${args[0]}`;
            console.log(result);

        } else if (fcn == "DeleteAsset"){
            result = await contract.submitTransaction(fcn, args)
            message = `Successfully deleted asset with IDLogam ${args}`
        } else {
            message = "Error function is not recognized"
        }

        await gateway.disconnect();

        let response = {
            message: message,
            result
        }
        console.log(response);
        return response;


    } catch (error ) {
        
        let erMssg = "exceptional";
        if (error instanceof Error) {
            erMssg  = error.message;
          }
        console.log(`Getting error: ${error}`)
        return erMssg

    }
}

exports.invokeTransaction = invokeTransaction;