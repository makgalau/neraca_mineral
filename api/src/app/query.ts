const { Gateway, Wallets, } = require('fabric-network');
const fs = require('fs');
const path = require("path")
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const util = require('util')
const mongo = require('../mongo/usercrud');
const cipher = require('./ciphering');

const helper = require('./helper')
const query = async (channelName, chaincodeName, args, fcn, username, org_name) => {

    try {
        logger.debug(util.format('\n============ query transaction on channel %s ============\n', channelName));
        console.log(username);
        console.log(org_name);
        // load the network configuration
        const ccp = await helper.getCCP(org_name) //JSON.parse(ccpJSON);
        // Create a new file system based wallet for managing identities.
        const walletPath = await helper.getWalletPath(org_name) //path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        // Check to see if we've already enrolled the user.
        let identity = await wallet.get(username);
        // console.log("tes disini 1");

        if (!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
            await helper.getRegisteredUser(username, org_name, true)
            identity = await wallet.get(username);
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        const connectOptions = {
            identity: username,
            wallet: wallet,  
            discovery: { enabled: true, asLocalhost: true } 
        }
        // console.log("tes disini 2");
       // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, connectOptions);

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(chaincodeName);
        let dataAsset,result ;
       

        //=================pke fungsi di nsdm_cc ==========================
        if (fcn == "ReadAsset"  || fcn =="getAssetTimestamp") {
            if (args.length > 0 && args != undefined) {
                result = JSON.parse(await contract.evaluateTransaction(fcn.toString(), args));
                console.log(result);

                if (fcn=="getAssetTimestamp"){
                    return result;
                }
            } else {
                // Tindakan alternatif jika args adalah undefined
                console.error("args tidak memiliki nilai yang valid.");
                return "args tidak memiliki nilai yang valid.";
            }

            // //cek tipe user yang melakukan query, berhak atau tidak thd data confidential
            // const user = await mongo.getUser(username);
            // console.log(user);
            // let decryptKey;
            // if ((username == result.username) || (user.tipeUser == "verifikator")||(user.tipeUser == "thirdparty")) {
            //     if (result.status_enc == 1) {
            //         if ((user.tipeUser == "verifikator")||(user.tipeUser=="thirdparty")) {
            //             decryptKey =  cipher.multiplyHexStrings(user.key,result.sk_bgn).padStart(64,'0');
            //             console.log('decdrypt key 1',decryptKey);
            //          }else {
            //             decryptKey = cipher.multiplyHexStrings(user.key,result.sk_agn).padStart(64,'0');
            //             console.log('decdrypt key 2',decryptKey);
            //          }
            //          result.DataAcuan = cipher.decryptText(result.DataAcuan,decryptKey);

            //          result.CompetentPerson = cipher.decryptText(result.CompetentPerson, decryptKey);
            //          result.JenisIjin = cipher.decryptText(result.JenisIjin, decryptKey);
            //     }
                
            //     return result;
            //  }          
            
         } 
         
        // console.log('*** Result:', result);

        return result;

    } catch (error) {
        let erMssg = "exceptional";
        if (error instanceof Error) {
            erMssg  = error.message;
          }
        console.error(`Failed to evaluate transaction: ${error}`);
        return erMssg;

    }
}

//===========query all asset========================
const queryAll = async (channelName, chaincodeName, args, fcn, username, org_name) => {
    try {
        if(!username) {
            username = 'admin';
        }
        if (!org_name) {
            org_name = 'geologi';
        }
        console.log(args);

        logger.debug(util.format('\n============ query transaction on channel %s ============\n', channelName));

        // load the network configuration
        const ccp = await helper.getCCP(org_name) //JSON.parse(ccpJSON);
        // Create a new file system based wallet for managing identities.
        const walletPath = await helper.getWalletPath(org_name) //path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        // Check to see if we've already enrolled the user.
        let identity = await wallet.get(username);
        if (!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
            await helper.getRegisteredUser(username, org_name, true)
            identity = await wallet.get(username);
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
        await gateway.connect(ccp, connectOptions);

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(chaincodeName);
        let result ;
       
        //(fcn == "GetAllAssets" || fcn == "GetNumOfAssets")
        result = JSON.parse(await contract.evaluateTransaction(fcn));
            // return result
        // console.log(result[0].cid_dataacuan);
        return result;

    } catch (error) {
        let erMssg = "exceptional";
        if (error instanceof Error) {
            erMssg  = error.message;
          }
        console.error(`Failed to evaluate transaction: ${error}`);
        return erMssg;
    }
}

//===================================================

//=========get Asset History=========================
const getAssetHistory = async (channelName, chaincodeName, args, fcn, username, org_name) => { 
    try {
        logger.debug(util.format('\n============ get Asset History on channel %s ============\n', channelName));
        let message;
        const ccp = await helper.getCCP(org_name) 
        const walletPath = await helper.getWalletPath(org_name) 
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        // Check to see if we've already enrolled the user.
        let identity = await wallet.get(username);
        if (!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
            await helper.getRegisteredUser(username, org_name, true)
            identity = await wallet.get(username);
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
        await gateway.connect(ccp, connectOptions);

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(chaincodeName);
        let result ;

        if (args.length > 0 && args != undefined) {
            result = JSON.parse(await contract.evaluateTransaction(fcn.toString(), args));
            console.log(result);
        } else {
            // Tindakan alternatif jika args adalah undefined
            console.error("args tidak memiliki nilai yang valid.");
            return "args tidak memiliki nilai yang valid.";
        }

        return result;
        // let decryptKey;
        // const user = await mongo.getUser(username);

        // if ((username == result.username) || (user.tipeUser == "verifikator")) {
        //     if (result.status_enc == 1) {
        //         if (user.tipeUser == "verifikator") {
        //             decryptKey =  cipher.multiplyHexStrings(user.key,result.sk_bgn);
        //          }else {
        //             decryptKey = cipher.multiplyHexStrings(user.key,result.sk_agn);
        //          }
        //          result.DataAcuan = cipher.decryptText(result.DataAcuan,decryptKey);
        //          result.CompetentPerson = cipher.decryptText(result.CompetentPerson, decryptKey);
        //          result.JenisIjin = cipher.decryptText(result.JenisIjin, decryptKey);
        //     }
            
        //     return result;
            
        // } else {
        //     message = "user is not allowed";
        //     return;
        // }
       
    } catch (error) {
        let erMssg = "exceptional";
        if (error instanceof Error) {
            erMssg  = error.message;
          }
        console.error(`Failed to evaluate transaction: ${error}`);
        return erMssg;
    }
}
//===================================================

exports.query = query
exports.queryAll = queryAll
exports.getAssetHistory = getAssetHistory