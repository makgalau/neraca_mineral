const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require("path")
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const util = require('util')
const { BlockDecoder } = require('fabric-common');
const Client = require('fabric-client');


const helper = require('./helper')
const qscc = async (channelName, chaincodeName, args, fcn, username, org_name) => {

    try {

        // load the network configuration
        // const ccpPath = path.resolve(__dirname, '..', 'config', 'connection-org1.json');
        // const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
        const ccp = await helper.getCCP(org_name) //JSON.parse(ccpJSON);

        // Create a new file system based wallet for managing identities.
        const walletPath = await helper.getWalletPath(org_name) //.join(process.cwd(), 'wallet');
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

        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet, identity: username, discovery: { enabled: true, asLocalhost: true }
        });

        const network = await gateway.getNetwork(channelName);

        const contract = network.getContract(chaincodeName);
        let result;
        console.log('tes qscc');
        if (fcn == 'GetBlockByNumber') {
            console.log('qscc 1');
            result = await contract.evaluateTransaction(fcn, channelName, args[0]);

            // const fs = require('fs')
            // fs.writeFileSync('./app/data/blockData.block', result)

            // let runScript = () => new Promise((resolve, reject) => {
            //     const { exec } = require('child_process');
            //     exec('sh ./app/block-decoder.sh',
            //         (error, stdout, stderr) => {
            //             console.log(stdout);
            //             console.log(stderr);
            //             if (error !== null) {
            //                 console.log(`exec error: ${error}`);
            //                 reject(false)
            //             } else {
            //                 resolve(true)
            //             }
            //         });
            // })

            // result = await runScript()
            // result = fs.readFileSync('./app/data/block.json')

            // result = JSON.parse(result.toString('utf-8'))
             result = BlockDecoder.decode(result);
             console.log('qscc 1');

        } else if (fcn == "GetTransactionByID") {
            console.log('qscc 2');
            result = await contract.evaluateTransaction(fcn, channelName, args[0]);

            

            // const fs = require('fs')
            // fs.writeFileSync('./app/data/transactionData.block', result)

            // let runScript = () => new Promise((resolve, reject) => {
            //     const { exec } = require('child_process');
            //     exec('sh ./app/transaction-decoder.sh',
            //         (error, stdout, stderr) => {
            //             console.log(stdout);
            //             console.log(stderr);
            //             if (error !== null) {
            //                 console.log(`exec error: ${error}`);
            //                 reject(false)
            //             } else {
            //                 resolve(true)
            //             }
            //         });
            // })

            // result = await runScript()
            // result = fs.readFileSync('./app/data/transaction.json')

            result = BlockDecoder.decodeTransaction(result);
            console.log('qscc 2');
            // result = JSON.parse(result)

        }
        console.log(result);
        return result
    } catch (error) {
        let erMssg = "exceptional";
        if (error instanceof Error) {
            erMssg  = error.message;
          }
        
        console.error(`Failed to evaluate transaction: ${erMssg}`);
        return erMssg;
    }
}

const getBlock = async ( username, org_name) => {
    try {
        const channelName = "nsdm";
        const chaincodeName = "nsdm_cc";
        console.log('1 -', username, org_name);
        const ccp = await helper.getCCP(org_name) //JSON.parse(ccpJSON);
        console.log('2 - ',ccp);
        // Create a new file system based wallet for managing identities.
        const walletPath = await helper.getWalletPath(org_name) //path.join(process.cwd(), 'wallet');
        console.log('3 - ',walletPath);

        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log('4');

        // Check to see if we've already enrolled the user.
        let myidentity = await wallet.get(username);
        if (!myidentity) {
            console.log('5');
            console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
            await helper.getRegisteredUser(username, org_name, true)
            myidentity = await wallet.get(username);
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        console.log('6');
        const connectOptions = {
            identity: username,
            wallet: wallet,  
            discovery: { enabled: true, asLocalhost: true } 
        }
        console.log('7');
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, connectOptions);         //error disini kyknya
        console.log('8');
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);
        console.log('9');
        const channel = network.getChannel();
        console.log('10');

        const client = new Client();

        // Initialize the client with the same user context
        await client.setUserContext({ username: username, password: 'mypassword' });

        // Query block by block number
        const blockNumber = 1;
        const block = await client.queryBlock(blockNumber, channel.getPeer('peer0.geologi.esdm.go.id'));
        console.log(`Block ${blockNumber}: ${JSON.stringify(block, null, 2)}`);
        console.log(block);
    
    } catch (error) {
        let erMssg = "exceptional";
        if (error instanceof Error) {
            erMssg  = error.message;
          }
        
        console.error(`Failed to evaluate transaction: ${erMssg}`);
        return erMssg;
    }
}
exports.qscc = qscc
exports.getBlock = getBlock