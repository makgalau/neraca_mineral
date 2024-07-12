import multer from 'multer';
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const mongo = require('./mongo/usercrud');
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const bodyParser = require('body-parser');
const http = require('http');
const util = require('util');
const express = require('express');
const upload = multer();
const app = express();
import axios from 'axios';
const cipher = require('./app/ciphering');
// const qscc = require('./app/qscc')
const crypto = require('crypto');
import dotenv, { decrypt } from 'dotenv';
dotenv.config();
const algorithm = process.env.ALGORITHM || "aes-256-cbc";
var { expressjwt: expjwt } = require("express-jwt");
const jwt = require('jsonwebtoken');
const bearerToken = require('express-bearer-token');
const cors = require('cors');
const constants = require('../config/constants.json')

const host = process.env.HOST || constants.host;
const port = process.env.PORT || constants.port;

const helper = require('./app/helper');
const invoke = require('./app/invoke');
const query = require('./app/query');
const ipfs = require('./app/ipfs');

interface IPFSResponse {
    Name: string;
    Hash: string;
    Size: string;
  }

app.options('*', cors());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('secret', process.env.SECRET);
app.use(expjwt({
    secret: process.env.SECRET, algorithms: ["HS256"]
}).unless({
    path: ['/users','/users/login', '/register','/getAll']
}));
app.use(bearerToken());

logger.level = 'debug';

app.use((req, res, next) => {
    logger.debug('New req for %s', req.originalUrl);
    if (req.originalUrl.indexOf('/users') >= 0 || req.originalUrl.indexOf('/users/login') >= 0 
    || req.originalUrl.indexOf('/register') >= 0 || req.originalUrl.indexOf('/getAll') >=0 ) {
        return next();
    }
    var token = req.token;
    console.log(token);
    jwt.verify(token, app.get('secret'), (err, decoded) => {
        if (err) {
            console.log(`Error ================:${err}`)
            res.send({
                success: false,
                message: 'Failed to authenticate token. Make sure to include the ' +
                    'token returned from /users call in the authorization header ' +
                    ' as a Bearer token'
            });
            return;
        } else {
            console.log("jwt verify berhasil");
            req.username = decoded.username;
            req.orgname = decoded.orgName;
            req.tipe_usr = decoded.tipe_usr;
            logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s, tipe user - %s', decoded.username, decoded.orgName,decoded.tipe_usr));
            return next();
        }
    });
});


var server = http.createServer(app).listen(port, function () { console.log(`Server started on ${port}`) });
logger.info('****************** SERVER STARTED ************************');
logger.info('***************  http://%s:%s  ******************', host, port);
server.timeout = 600000;

function getErrorMessage(field) {
    var response = {
        success: false,
        message: field + ' field is missing or Invalid in the request'
    };
    return response;
}

function getErrorMessage2(field) {
    var response = {
        success: false,
        message: field 
    };
    return response;
}

// =============register user =============================
app.post('/register', async function (req, res) {
    var username = req.body.username.toLowerCase();
    var orgName = req.body.orgName.toLowerCase();
    var email = req.body.email.toLowerCase();
    var passwd = req.body.password;
    var tipe_usr = req.body.tipe;
    logger.debug('End point : /register');
    logger.debug('User name : ' + username);
    logger.debug('Org name  : ' + orgName);
    if (!username) {
        res.json(getErrorMessage('\'username\''));
        return;
    }
    if (!orgName) {
        res.json(getErrorMessage('\'orgName\''));
        return;
    }
    if (!email) {
        res.json(getErrorMessage('\'email\''));
        return;
    }
    if (!passwd) {
        res.json(getErrorMessage('\'password\''));
        return;
    }
    if (!tipe_usr) {
        res.json(getErrorMessage('\'tipe user\''));
        return;
    }

    var token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
        username: username,
        orgName: orgName,
        tipe_usr: tipe_usr
     }, app.get('secret')); 
    
     let response = await helper.getRegisteredUser(username, orgName, email, passwd,tipe_usr, true);
     if (response.success==true) {
        logger.debug('Successfully registered the username %s for organization %s', username, orgName);
        response.token = token;
        res.json(response);
    } else {
        logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
        res.json({ success: false, message: response });
    }
})
//=====================================================================


//=============== user login ==========================
app.post('/users/login', async function (req, res) {
    const { username, password } = req.body;

    logger.debug('End point : /users');
    logger.debug('User name : ' + username);
    if (!username) {
        res.json(getErrorMessage('\'username or email\''));
        return;
    }
    if (!password) {
        res.json(getErrorMessage('\'password\''));
        return;
    }

    let isUserRegistered = await helper.isUserRegistered(username, password); 
    if (isUserRegistered) {
        var token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
            username: username,
            orgName: isUserRegistered.organisasi,
            tipe_usr: isUserRegistered.tipeUser
        }, app.get('secret'));
        res.json({ success: true, message: { token: token } });

    } else {
        res.json({ success: false, message: `User with username ${username} failed to login` });
    }
})
//=====================================================



//=================verifikasi asset ===========================
app.put('/verify/:id', upload.single('file'), async function (req, res) { 
    try {
        logger.debug('==================== Verifikasi Asset on Chaincode ==================');
            var peers= JSON.parse(req.body.peers);
            var chaincodeName = req.body.chaincodeName;
            var channelName = req.body.channelName;
            var arg = req.body.args;
            let message;
            let fcn = "UpdateAsset";
            if (req.tipe_usr=="verifikator") {
                arg[38] = "verifikator/thirdparty"
                arg[39] = req.username;
                const result = await invoke.invokeTransaction(channelName, chaincodeName, fcn, arg, req.username, req.orgname);
                console.log(`message result is : ${result.message}`);
                res.status(200).send(message);
            } else {
                res.json(getErrorMessage2('user bukan verifikator'));
                return;
            }
    } catch (error) {
        let erMssg = "exceptional";
        let erName = "";
        if (error instanceof Error) {
            erMssg  = error.message;
            erName = error.name;
          }
        const response_payload = {
            result: null,
            error: erName,
            errorData: erMssg
        }
        res.send(response_payload);
    }
});
//=============================================================

// ==============Update Asset============================
app.put('/updateAsset/:id', upload.single('file'), async function (req, res) { 
    try {
        logger.debug('==================== Update Asset on Chaincode ==================');
        const { peers, args: argsString, valid: validString, confidential: confidentialString, channelName: channelName, chaincodeName: chaincodeName } = req.body;
        const args = JSON.parse(argsString);
        let fcn = "UpdateAsset";
        const { username, tipe_usr, file } = req;
        args[35]=0;

        const pinCID2remove = args[30];

        logger.debug('channelName  : ' + channelName);
        logger.debug('chaincodeName : ' + chaincodeName);
        logger.debug('fcn  : '+fcn);
        logger.debug('args  : ' + args);
        logger.debug('user  : ' + username);
        logger.debug('tipe user : '+ tipe_usr);
        logger.debug('confidential:' + args[34]);

        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
            return;
        }
        if (!peers) {
            res.json(getErrorMessage('\'peers\''));
            return;
        }
        if (!args) {
            res.json(getErrorMessage('\'args\''));
            return;
        }

        if ((tipe_usr != "data_owner")&&(tipe_usr != "verifikator")) {
            res.json(getErrorMessage2('only data owner and verifikator can update asset'));
            return;
        }
        const owner = args[37];
       

        //cek apakah asset merupakan milik si data owner atau bukan
        if (tipe_usr == "data_owner"){         
            if (owner != username){
                res.json(getErrorMessage2('user is not the owner of the asset'));
                return;
            }
        }

        let key = await mongo.getKey(username);
        let cipheringKey;
        if (tipe_usr == 'data_owner' ){
            cipheringKey = cipher.multiplyHexStrings(args[32],key).padStart(64,'0');
        }else {
            let tempkey = cipher.generateABEKey2Dec(key,username);
            cipheringKey = cipher.multiplyHexStrings(args[33],tempkey).padStart(64,'0');
        }
        args[38] = "verifikator/thirdparty";
        args[39] = username;   //lastupdater

        //cek confidential
        if (args[34] ==1) {
            if (!cipheringKey){         //if no ciphering key generated
                res.json(getErrorMessage('\'generate key failed\''));
                return;
            }
     
            if((args[10])&&(args[10]!='')){        //klo jenis ijin ada isinya, maka dienkrip
                args[10] = await cipher.encryptText(args[10],cipheringKey);
                console.log('args[10]', args[10]);
            }
            if((args[26])&&(args[26]!='')){        //klo nama data acuan ada isinya, maka dienkrip
                args[26] = await cipher.encryptText(args[26],cipheringKey);
                console.log('args[26]', args[26]);
            }
            if((args[28])&&(args[28]!='')){        //klo competent person ada isinya, maka dienkrip
                args[28] = await cipher.encryptText(args[28],cipheringKey);
                console.log('args[28]', args[28]);
            }

            if(file){        //klo file data acuan ada isinya, maka diupdate
                try {
                 
                    const datafile = file.buffer;
                    // console.log(typeof datafile);
                    args[36] = file.originalname;
                    const encDatafile = await cipher.encryptFile(datafile, cipheringKey);


                    // Create a temporary file for encrypted data
                    const tempFilePath = path.join('/tmp', `encrypted_${Date.now()}`);
                    fs.writeFileSync(tempFilePath, encDatafile);

                    const formData = new FormData();
                    formData.append('file', fs.createReadStream(tempFilePath));

                    console.log("Encrypting and uploading to IPFS");
                    const ipfsResponse = await fetch('http://127.0.0.1:5001/api/v0/add?pin=true', {
                        method: 'POST',
                        body: formData,
                    });

                    const ipfsResult = await ipfsResponse.json();
                    console.log(ipfsResult);
                    args[30] = ipfsResult.Hash; // Update to use correct field
                    args[36] = file.originalname;
                    if (pinCID2remove) {
                        console.log("remove previous pin on IPFS");
                        const arg = new FormData();
                        arg.append('arg',pinCID2remove);
                        const removePinResponse = await fetch('http://127.0.0.1:5001/api/v0/pin/rm', {
                            method: 'POST',
                            body: arg,
                        });
                        console.log(removePinResponse);
                    }
                } catch (error:any) {
                    console.error('Error during IPFS upload', error);
                    res.status(500).json({ message: 'Error uploading to IPFS', error: error.message });
                    return;
                }
               
            }
        } else {  
           //data bersifat terbuka
            if(file){        
                try {
                    //cek klo data sebelumnya ada file acuan
                    
                    console.log("Uploading to IPFS without encryption");
                    const formData = new FormData();
                    formData.append('file', file.buffer, file.originalname);

                    const ipfsResponse = await fetch('http://127.0.0.1:5001/api/v0/add?pin=true', {
                        method: 'POST',
                        body: formData,
                    });

                    const ipfsResult = await ipfsResponse.json();
                    console.log(ipfsResult);
                    args[30] = ipfsResult.Hash; // Update to use correct field
                    args[36] = file.originalname;

                    if (pinCID2remove) {
                        // console.log("remove previous pin on IPFS");
                        // const arg = new FormData();
                        // arg.append('arg',pinCID2remove);
                        // const removePinResponse = await fetch('http://127.0.0.1:5001/api/v0/pin/rm', {
                        //     method: 'POST',
                        //     body: arg,
                        // });
                        const removePinResponse = await ipfs.removePINCID(pinCID2remove);
                        console.log(removePinResponse);
                    }
                } catch (error:any) {
                    console.error('Error during IPFS upload', error);
                    res.status(500).json({ message: 'Error uploading to IPFS', error: error.message });
                    return;
                }

            }
        }

        console.log(args);
        const result = await invoke.invokeTransaction(channelName, chaincodeName, fcn, args, req.username, req.orgname);
        console.log(`message result is : ${result.message}`);
        console.log(result);
        res.json({
            message: result.message,
            result: result.result,
            error: null,
            errorData: null
        });

    } catch (error) {
        let erMssg = "exceptional";
        let erName = "";
        if (error instanceof Error) {
            erMssg  = error.message;
            erName = error.name;
          }
        const response_payload = {
            result: null,
            error: erName,
            errorData: erMssg
        }
        res.send(response_payload);
    }
})
 
//=====================================================

// ==============Delete Asset============================
app.post('/delete', upload.any(), async function (req, res) { 
    try {
        logger.debug('==================== Delete Asset on Chaincode ==================');
        var peers= JSON.parse(req.body.peers);
        var chaincodeName = req.body.chaincodeName;
        var channelName = req.body.channelName;
        var args = req.body.args;       //untuk delete, args hanya berisi IDLogam dari asset yang akan di delete
        let message;
        let fcn = "DeleteAsset";

        logger.debug('channelName  : ' + channelName);
        logger.debug('chaincodeName : ' + chaincodeName);
        logger.debug('fcn  : '+fcn);
        logger.debug('args  : ' + args);
        logger.debug('user  : ' + req.username);
        logger.debug('tipe user : '+ req.tipe_usr);

        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
            return;
        }
        if (!peers) {
            res.json(getErrorMessage('\'peers\''));
            return;
        }
        if (!args) {
            res.json(getErrorMessage('\'args\''));
            return;
        }

        if (req.tipe_usr != "verifikator") {
            res.json(getErrorMessage('\'only verifikator can delete asset\''));
            return;
        }

        //cek CID ada atau tidak
        const myresult = await query.query(channelName, chaincodeName,args, "ReadAsset", req.username, req.orgname);
        message = await invoke.invokeTransaction(channelName, chaincodeName, fcn, args, req.username, req.orgname);
        // console.log(myresult);
        if (myresult.cid_dataacuan!=''){
            //remove pin CID
            const temp = await ipfs.removePINCID(myresult.cid_dataacuan);

      
        }
        res.status(200).send(message.message);

    } catch (error) {
        let erMssg = "exceptional";
        let erName = "";
        if (error instanceof Error) {
            erMssg  = error.message;
            erName = error.name;
          }
        const response_payload = {
            result: null,
            error: erName,
            errorData: erMssg
        }
        res.send(response_payload);
    }

})
// ==================================================

// ==============Query All Assets====================
    app.get('/getAll', upload.any(), async function (req, res) { 
    try {
        logger.debug('==================== QUERY BY CHAINCODE ==================');
        let chaincodeName = 'nsdm_cc';         // req.params.chaincodeName;
        let channelName = 'nsdm';                  //  req.params.channelName;
        let fcn = "GetAllAssets";

        logger.debug('channelName : ' + channelName);
        logger.debug('chaincodeName : ' + chaincodeName);
        logger.debug('fcn : ' + fcn);

        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
            return;
        }

        let response_payload;
        let myresult = await query.queryAll(channelName, chaincodeName,'', fcn, req.username, req.orgname);
        
        response_payload = {
            result: myresult,
            error: null,
            errorData: null
        }

        res.send(response_payload);
    } catch (error) {
        let erMssg = "exceptional";
        let erName = "";
        if (error instanceof Error) {
            erMssg  = error.message;
            erName = error.name;
          }
        const response_payload = {
            result: null,
            error: erName,
            errorData: erMssg
        }
        res.send(response_payload);
    }
})
// ==================================================

// ====================Read Asset====================
app.get('/readAsset', upload.any(), async function (req, res) {
    try {
        logger.debug('==================== QUERY BY CHAINCODE ==================');
        let chaincodeName = 'nsdm_cc';            // req.params.chaincodeName;
        let channelName = 'nsdm';                      //req.params.channelName;
        let fcn = "ReadAsset";
        let username = req.username;
        let orgname = req.orgname;
        let response_payload;
        const args = req.query.args;
        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
            return;
        }
        if (!args) {
            res.json(getErrorMessage('\'args\''));
            return;
        }

        
        if (req.orgname == "public")  {          //klo public ga boleh akses data rahasia
            const response_payload = {
                result: null,
                error: "Not allowed",
                errorData: "Not allowed"
            }
            res.send(response_payload);
            return;
        }

        logger.debug('channelName : ' + channelName);
        logger.debug('chaincodeName : ' + chaincodeName);
        logger.debug('fcn : ' + fcn);


        let myresult = await query.query(channelName, chaincodeName,args, fcn, username, orgname);
        console.log(myresult);
        //cek tipe user yang melakukan query, berhak atau tidak thd data confidential
        const user = await mongo.getUser(req.username);
        const keyuser = await mongo.getKey(username);
        let decryptKey;
        if ((req.username == myresult.username) || (user.tipeUser == "verifikator")||(user.tipeUser == "thirdparty")) {
            if (myresult.status_enc == 1) {
                if ((user.tipeUser == "verifikator")||(user.tipeUser=="thirdparty")) {
                    
                    const tempdecryptKey = cipher.generateABEKey2Dec(keyuser,username);
                    decryptKey =  cipher.multiplyHexStrings(tempdecryptKey,myresult.sk_bgn).padStart(64,'0');
                    console.log('decdrypt key 1',decryptKey);
                }else {
                    decryptKey = cipher.multiplyHexStrings(user.key,myresult.sk_agn).padStart(64,'0');
                                console.log('decdrypt key 2',decryptKey);
                }
                let temp;
                temp = await cipher.decryptText(myresult.DataAcuan,decryptKey);
                console.log(temp);
                myresult.DataAcuan = temp;
                myresult.CompetentPerson = await cipher.decryptText(myresult.CompetentPerson, decryptKey);
                myresult.JenisIjin = await cipher.decryptText(myresult.JenisIjin, decryptKey);
            }
        } else {
            myresult.DataAcuan = "[confidential]";
            myresult.CompetentPerson = "[confidential]";
            myresult.JenisIjin = "[confidential]";
        }

        response_payload = {
                result: myresult,
                error: null,
                errorData: null
            }
        res.send(response_payload);      
        return;
    } catch (error) {
        let erMssg = "exceptional";
        let erName = "";
        if (error instanceof Error) {
            erMssg  = error.message;
            erName = error.name;
          }
        const response_payload = {
            result: null,
            error: erName,
            errorData: erMssg
        }
        res.send(response_payload);
    }

})
// ==================================================


//==================get Asset History ========================
app.get('/getAssetHistory', upload.any(), async function (req, res) {  
    try {
        logger.debug('==================== QUERY BY CHAINCODE ==================');
        // var peers= JSON.parse(req.query.peers);
        let chaincodeName = 'nsdm_cc';            // req.params.chaincodeName;
        let channelName = 'nsdm';                      //req.params.channelName;
        let username = req.username;
        let orgname = req.orgname;
        const args = req.query.args;
        let fcn = "GetAssetHistory";
        let response_payload;
        console.log(req.username);
        console.log(req.orgname);
        console.log(req.tipe_usr);
        console.log(args);
        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
            return;
        }
        if (!args) {
            res.json(getErrorMessage('\'args\''));
            return;
        }

        if ((req.orgname == "public")||(req.orgname == "thirdparty"))  {          //klo public ga bolah akses data rahasia
            const response_payload = {
                result: null,
                error: "Not allowed",
                errorData: "Not allowed"
            }
            res.send(response_payload);
            return;
        }

        logger.debug('channelName : ' + channelName);
        logger.debug('chaincodeName : ' + chaincodeName);
        logger.debug('fcn : ' + fcn);

        let myresult2 = await query.query(channelName, chaincodeName,args, "ReadAsset", req.username, req.orgname);
        console.log(myresult2);
        //hanya pemilik data atau verifikator yg bisa ngeliat history assets
        if ((req.username == myresult2.username) || (req.tipe_usr == "verifikator")) {
            let myresult = await query.getAssetHistory(channelName, chaincodeName,args, fcn, req.username, req.orgname);
            response_payload = {
                result: myresult,
                error: null,
                errorData: null
            }
            res.send(response_payload);
            return;
        }
        
        response_payload = {
            result: null,
            error: "User Not Allowed",
            errorData: "User Not Allowed"
        }
        res.send(response_payload);

    } catch (error) {
        let erMssg = "exceptional";
        let erName = "";
        if (error instanceof Error) {
            erMssg  = error.message;
            erName = error.name;
          }
        const response_payload = {
            result: null,
            error: erName,
            errorData: erMssg
        }
        res.send(response_payload);
    }
})
//=============================================================

//================download file ipfs============================
app.post('/downloadfile', async (req, res) => {
    try {
        logger.debug('==================== Download IPFS ==================');
        const { cid, status_enc, sk_agn, sk_bgn } = req.body;
        console.log(cid);

        if (req.tipe_usr === 'public') {
            res.status(403).json({ message: 'User tidak berhak akses' });
            return;
        }

        let decryptkey;
        if (status_enc == 1) {
            // Generate decryption key
            const key = await mongo.getKey(req.username);

            if (req.tipe_usr === 'verifikator' || req.tipe_usr === 'thirdparty') {
                decryptkey = cipher.generateABEKey2Dec(key,req.username);
                decryptkey = cipher.multiplyHexStrings(sk_bgn, decryptkey).padStart(64, '0');
                console.log('decrypt key verifikator & thirdparty: ',decryptkey);
            } else if (req.tipe_usr === 'data_owner') {
                decryptkey = cipher.multiplyHexStrings(sk_agn, key).padStart(64, '0');
                console.log('decryptkey owner: ',decryptkey);
            } else {
                res.status(403).json({ message: 'User tidak berhak akses' });
                return;
            }
        }

        // const response = await axios.post(`http://127.0.0.1:5001/api/v0/cat`, null, {
        //     params: { arg: cid },
        //     responseType: 'arraybuffer'
        // });
        const response = await ipfs.downloadIpfs(cid);
        // console.log(response);
       
        let fileBuffer = Buffer.from(response.data);
        if (status_enc == 1) {
            const key = Buffer.from(decryptkey, 'hex'); // assuming key_enc is hex encoded
            const iv = fileBuffer.subarray(0, 16); // assuming the first 16 bytes are the IV
            const encryptedData = fileBuffer.subarray(16); // the rest is the encrypted data

            const decipher = crypto.createDecipheriv(algorithm, key, iv); // Ensure 'aes-256-cbc' is the algorithm used
            const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
            fileBuffer = decryptedData;
            // const resultfileBuffer = await cipher.decryptFile(fileBuffer,decryptkey);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${req.body.filename}`);
            res.send(fileBuffer);
        } else {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${req.body.filename}`);
            res.send(fileBuffer);
        }

        
    } catch (error: any) {
        console.error('API error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});


//=============================================================



//=========================================================================
app.post('/channels/:channelName/chaincodes/:chaincodeName/addAsset', upload.single('file'), async function (req, res) { 
    try {
        logger.debug('==================== Add Asset on Chaincode ==================');
        console.log(req.body);
        console.log("args = "+req.body.args);
        console.log(req.params);
        const { peers, args: argsString, valid: validString, confidential: confidentialString } = req.body;
        const { channelName, chaincodeName } = req.params;
        const args = JSON.parse(argsString);
        const valid = 0;
        const confidential = confidentialString ? confidentialString : 1;
        const fcn = "CreateAsset";
        const { username, tipe_usr, file } = req;

        logger.debug(`channelName: ${channelName}`);
        logger.debug(`chaincodeName: ${chaincodeName}`);
        logger.debug(`fcn: addAsset`);
        logger.debug(`args: ${args}`);
        logger.debug(`user: ${username}`);
        logger.debug(`tipe user: ${tipe_usr}`);

        // Validate input parameters
        if (!chaincodeName || !channelName || !peers || !args) {
            res.json(getErrorMessage('Missing required parameters'));
            return;
        }

        if (tipe_usr !== "data_owner") {
            res.json(getErrorMessage2('Only data owner can add asset'));
            return;
        }
        
        // Crypto key initialization
        const key = await cipher.initializedEncryption(username);
        args[31] = key.randNum;     // Random number
        args[32] = key.sk_agn;      // sk_agn
        args[33] = key.sk_bgn;      // sk_bgn
        args[34] = confidential;    // Confidential status
        args[35] = valid;           // Valid status
        console.log(key);

        if (confidential == 1) {
            if (!key.cipheringKey) {
                res.json(getErrorMessage2('Generate key failed'));
                return;
            }

            // Encrypt specific arguments if they are not empty
            const fieldsToEncrypt = [10, 26, 28];
            for (const field of fieldsToEncrypt) {
                if (args[field]) {
                    args[field] = await cipher.encryptText(args[field], key.cipheringKey);
                    console.log(`args[${field}]: ${args[field]}`);
                }
            }

            // Handle file encryption and upload to IPFS
            if (!file) {
                args[30] = "";  // cid
                args[36] = "";  // filename
                console.log("No reference file provided");
            } else {
                try {
                    const datafile = file.buffer;
                    console.log(typeof datafile);
                    args[36] = file.originalname;
                    const encDatafile = await cipher.encryptFile(datafile, key.cipheringKey);

                    // const ipfsResult = await ipfs.uploadEncFile2Ipfs(encDatafile);
                    // Create a temporary file for encrypted data
                    const tempFilePath = path.join('/tmp', `encrypted_${Date.now()}`);
                    fs.writeFileSync(tempFilePath, encDatafile);

                    const formData = new FormData();
                    formData.append('file', fs.createReadStream(tempFilePath));

                    console.log("Encrypting and uploading to IPFS");
                    const ipfsResponse = await fetch('http://127.0.0.1:5001/api/v0/add?pin=true', {
                        method: 'POST',
                        body: formData,
                    });

                    const ipfsResult = await ipfsResponse.json();
                    console.log(ipfsResult);
                    args[30] = ipfsResult.Hash; // Update to use correct field
                } catch (error:any) {
                    console.error('Error during IPFS upload', error);
                    res.status(500).json({ message: 'Error uploading to IPFS', error: error.message });
                    return;
                }
            }
        } else {
            // Handle non-confidential file upload to IPFS
            if (!file) {
                args[30] = "";  // cid
                args[36] = "";  // filename
            } else {
                try {
                    console.log("Uploading to IPFS without encryption");
                    const formData = new FormData();
                    formData.append('file', file.buffer, file.originalname);

                    const ipfsResponse = await fetch('http://127.0.0.1:5001/api/v0/add?pin=true', {
                        method: 'POST',
                        body: formData,
                    });

                    const ipfsResult = await ipfsResponse.json();
                    console.log(ipfsResult);
                    args[30] = ipfsResult.Hash; // Update to use correct field
                    args[36] = file.originalname;
                } catch (error:any) {
                    console.error('Error during IPFS upload', error);
                    res.status(500).json({ message: 'Error uploading to IPFS', error: error.message });
                    return;
                }
            }
        }

        args[37] = username;

        console.log(args);
        console.log(username);
        console.log(req.orgname);
        const message = await invoke.invokeTransaction(channelName, chaincodeName, fcn, args, username, req.orgname);
        console.log(`message result is: ${message}`);

        res.json({
            message: message.message,
            result: message.result,
            error: null,
            errorData: null
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Exceptional error';
        const errorName = error instanceof Error ? error.name : '';
        res.json({
            result: null,
            error: errorName,
            errorData: errorMessage
        });
    }
});
//============================================

//================download file ipfs============================
app.post('/downloadAllfile', async (req, res) => {
    try {
        logger.debug('==================== Download All IPFS files ==================');

        const { username, orgname } = req;
        const channelName = 'nsdm';
        const chaincodeName = 'nsdm_cc';
        const fcn = "ReadAsset";
        const downloadDir = path.join(__dirname, '../../pdf_testfile');

        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir, { recursive: true });
        }

        for (let id = 1; id <= 5370; id++) {
            const paddedId = id.toString().padStart(4, '0');
            const args = [paddedId];

            try {
                const myresult = await query.query(channelName, chaincodeName, args, fcn, username, orgname);

                if (myresult && myresult.cid_dataacuan) {
                    logger.debug(`Received result for ID: ${paddedId}, CID: ${myresult.cid_dataacuan}`);
                    const response = await ipfs.downloadIpfs(myresult.cid_dataacuan);

                    let fileBuffer = Buffer.from(response.data);
       
                    const filePath = path.join(downloadDir, `${paddedId}.pdf`);
                    fs.writeFileSync(filePath, fileBuffer);
                    logger.debug(`Successfully saved file: ${filePath}`);
                } else {
                    logger.error(`No valid result for ID: ${paddedId}`);
                }
            } catch (error: any) {
                logger.error(`Failed to query for ID: ${paddedId}`, error.message);
            }
        }

        res.status(200).send('All files have been downloaded and saved.');
    } catch (error: any) {
        logger.error('Failed to download all IPFS files', error.message);
        res.status(500).send('An error occurred while downloading files.');
    }
});

// //=============================================================
// app.get('/qscc/channels/:channelName/chaincodes/:chaincodeName', async function (req, res) {
//     try {
//         logger.debug('==================== QUERY BY CHAINCODE ==================');

//         var channelName = req.params.channelName;
//         var chaincodeName = req.params.chaincodeName;
//         console.log(`chaincode name is :${chaincodeName}`)
//         let args = req.query.args;
//         let fcn = req.query.fcn;
//         // let peer = req.query.peer;

//         logger.debug('channelName : ' + channelName);
//         logger.debug('chaincodeName : ' + chaincodeName);
//         logger.debug('fcn : ' + fcn);
//         logger.debug('args : ' + args);

//         if (!chaincodeName) {
//             res.json(getErrorMessage('\'chaincodeName\''));
//             return;
//         }
//         if (!channelName) {
//             res.json(getErrorMessage('\'channelName\''));
//             return;
//         }
//         if (!fcn) {
//             res.json(getErrorMessage('\'fcn\''));
//             return;
//         }
//         if (!args) {
//             res.json(getErrorMessage('\'args\''));
//             return;
//         }
//         console.log('args==========', args);
//         args = args.replace(/'/g, '"');
//         args = JSON.parse(args);
//         logger.debug(args);

//         let response_payload = await qscc.qscc(channelName, chaincodeName, args, fcn, req.username, req.orgname);

//         res.send(response_payload);
//     } catch (error:any) {
//         const response_payload = {
//             result: null,
//             error: error.name,
//             errorData: error.message
//         }
//         res.send(response_payload)
//     }
// });

// //=============================================================
// app.get('/getBlockNumber', async function (req, res) {
//     try {
//         logger.debug('==================== QUERY BLOCK DATA ==================');
       

//         let response_payload = await qscc.getBlock(req.username,req.orgname);

//         res.send(response_payload);

//     } catch (error:any) {
//         const response_payload = {
//             result: null,
//             error: error.name,
//             errorData: error.message
//         }
//         res.send(response_payload)
//     }

// })