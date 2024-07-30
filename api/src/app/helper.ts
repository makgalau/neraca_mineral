const mongo = require('../mongo/usercrud');
import User, { IUser }  from '../mongo/userscheme';
import connectToDatabase from '../mongo/config';
const ciphering = require('./ciphering');
var { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
import bcrypt from 'bcrypt';

const util = require('util');


const getCCP = async (org) => {         //CCP Command Connection Profile
    let ccpPath;
    if (org == "geologi") {
        ccpPath = path.resolve(__dirname, '../..', 'config', 'connection-geologi.json');

    } else if (org == "minerba") {
        ccpPath = path.resolve(__dirname, '../..', 'config', 'connection-minerba.json');
    
    } else if (org == "badanusaha1") {
        ccpPath = path.resolve(__dirname, '../..', 'config', 'connection-bu1.json');
    
    } else if (org == "badanusaha2") {
        ccpPath = path.resolve(__dirname, '../..', 'config', 'connection-bu2.json');
    
    } else if (org == "thirdparty") {
        ccpPath = path.resolve(__dirname, '../..', 'config', 'connection-thirdparty.json');
    
    } else
        return null
    const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
    const ccp = JSON.parse(ccpJSON);
    console.log('======================getCCP==================');
    // console.log(ccp)
    return ccp
}



const getCaUrl = async (org, ccp) => {
    let caURL;
    if (org == "geologi") {
        caURL = ccp.certificateAuthorities['ca.geologi.esdm.go.id'].url;

    } else if (org == "minerba") {
        caURL = ccp.certificateAuthorities['ca.minerba.esdm.go.id'].url;

    } else if (org == "badanusaha1") {
        caURL = ccp.certificateAuthorities['ca.bu1.example.com'].url;
        
    } else if (org == "badanusaha2") {
        caURL = ccp.certificateAuthorities['ca.bu2.example.com'].url;

    } else if (org == "thirdparty") {
        caURL = ccp.certificateAuthorities['ca.thirdparty.example.com'].url;

    } else
        return null

    console.log('===========getCaUrl===============');
    // console.log(caURL);
    return caURL

}

const getWalletPath = async (org) => {
    let walletPath;
    if (org == "geologi") {
        walletPath = path.join(process.cwd(), 'geologi-wallet');

    } else if (org == "minerba") {
        walletPath = path.join(process.cwd(), 'minerba-wallet');
    
    } else if (org == "badanusaha1") {
        walletPath = path.join(process.cwd(), 'bu1-wallet');
    
    } else if (org == "badanusaha2") {
        walletPath = path.join(process.cwd(), 'bu2-wallet');
    
    } else if (org == "thirdparty") {
        walletPath = path.join(process.cwd(), 'thirdparty-wallet');
    
    } else
        return null

    console.log('========================get Wallet======================')
    // console.log(walletPath);
    return walletPath

}

const getAffiliation = async (org: string) => {
    if (org === "geologi") {
        return 'geologi.department1';
    } else if (org == "minerba") {
        return 'minerba.department1';
    } else if (org == "badanusaha1") {
        return 'badanusaha1.department1';
    } else if (org == "badanusaha2") {
        return 'badanusaha2.department1';
    } else {
        return 'thirdparty.department1';
    }

}

const getEncKey = (username, userOrg, email, tipe_usr) => {
    let key;
    if (tipe_usr == "verifikator" || tipe_usr == "thirdparty") {
        //generate ABE key
        // key = ciphering.generateABEKey(tipe_usr,userOrg);
        key = ciphering.generateABEKey2Enc(tipe_usr,userOrg,username);
    } else {
        //generate IBE key
        key = ciphering.generateIBEKey(username+email);
    }
    console.log('key generated: ',key);
    return key;
}

const getRegisteredUser = async (username, userOrg, email, passwd,tipe_usr, isJson) => {

    //cek user di database
    await connectToDatabase();
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    console.log(existingUser);
    if (existingUser) {
        console.error('User with the same username or email already exists');
        var response = {
                success: false,
                message: username + ': User/email already exists',
            };
                
        return response; // Jika pengguna sudah ada, berhenti dan kembalikan
    }

    if (tipe_usr == "public"){          //klo tipe usernya public ga usah register ke walletnya
        try {
            let hashedPwd = await generateHash(passwd);
            mongo.createUser(username, userOrg, email, hashedPwd, tipe_usr,'');
            var response = {
                success: true,
                message: username + ' enrolled Successfully',
            };
            return response
        } catch (error : any) {
            return error.message
        }
       
    }

    let ccp = await getCCP(userOrg)

    const caURL = await getCaUrl(userOrg, ccp);
    const ca = new FabricCAServices(caURL);

    const walletPath = await getWalletPath(userOrg)
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userIdentity = await wallet.get(username);
    // console.log('error disini 1');
    if (userIdentity) {
        console.log(`An identity for the user ${username} already exists in the wallet`);

        var response = {
            success: true,
            message: username + ': enrolled User Already Exists',
        };
        return response
    }

    // Check to see if we've already enrolled the admin user.
    let adminIdentity = await wallet.get('admin');

    console.log(adminIdentity);
    if (!adminIdentity) {
        console.log('An identity for the admin user "admin" does not exist in the wallet');
        await enrollAdmin(userOrg, ccp);

        adminIdentity = await wallet.get('admin');
        console.log("Admin Enrolled Successfully")
    }
    // console.log('error disini 5');
    // console.log(adminIdentity);
    // build a user object for authenticating with the CA
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');
    let secret;

    // console.log(provider, adminUser);
    try {
        // Register the user, enroll the user, and import the new identity into the wallet.
        secret = await ca.register({ affiliation: await getAffiliation(userOrg), enrollmentID: username, role: 'client'}, adminUser);
       
        //setelah berhasil simpan data di wallet, generate key, baru masukin ke database
        let key;
        let hashedPassword;
        console.log('username: ',username);
        console.log('email: ',email);
        console.log("===================================");
        key = getEncKey(username, userOrg, email, tipe_usr);
        hashedPassword = await generateHash(passwd);
        mongo.createUser(username, userOrg, email, hashedPassword, tipe_usr,key);

        console.log("berhasil input data user ke database");
    } catch (error : any) {
        return error.message
    }

    // const enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret });
    const enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret });
    // console.log(enrollment);

    
    let x509Identity;
    if (userOrg == "geologi") {
        x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'GeologiMSP',
            type: 'X.509',
        };
    } else if (userOrg == "minerba") {
        x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'MinerbaMSP',
            type: 'X.509',
        };
    } else if (userOrg == "badanusaha1") {
        x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'BadanUsaha1MSP',
            type: 'X.509',
        };
    } else if (userOrg == "badanusaha2") {
        x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'BadanUsaha2MSP',
            type: 'X.509',
        };
    } else if (userOrg == "thirdparty") {
        x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'ThirdPartyMSP',
            type: 'X.509',
        };
    }

    await wallet.put(username, x509Identity);
    console.log(`Successfully registered and enrolled admin user ${username} and imported it into the wallet`);


    var response = {
        success: true,
        message: username + ' enrolled Successfully',
    };
    return response
}

const isUserRegistered = async (username, passwd) => {
    //cek mongodb
    let userOrg;
    await connectToDatabase();
    try {
        const user = await User.findOne({
            $or: [{ username: username }, { email: username }]
          });        
        
        if (!user) {
            console.error('User not found');
            return null; // Jika pengguna tidak ditemukan, kembalikan null
        }

        // const isPasswordValid = await user.comparePassword(passwd);
        const isMatch = await comparePassword(passwd, user.password);
        
        if (!isMatch) {
            console.error('Invalid password');
            return null; // Jika password tidak valid, kembalikan null
        }

        userOrg = user.organisasi;
        if (userOrg == "public") {
            return user;
        }
        //selain user, cek wallet
        const walletPath = await getWalletPath(userOrg)
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const userIdentity = await wallet.get(username);
        if (userIdentity) {
            console.log(`An identity for the user ${username} exists in the wallet`);
            return user;
        }
        return null
        
    } catch (error:any) {
        console.error('Error verifying login:', error);
        return false;
    }

    // const existingUser = await User.findOne({ $or: [{ username }, { email }] });


    
}

const getCaInfo = async (org, ccp) => {
    let caInfo
    if (org == "geologi") {
        caInfo = ccp.certificateAuthorities['ca.geologi.esdm.go.id'];

    } else if (org == "minerba") {
        caInfo = ccp.certificateAuthorities['ca.minerba.esdm.go.id'];
    } else if (org == "badanusaha1") {
        caInfo = ccp.certificateAuthorities['ca.bu1.example.com'];
    } else if (org == "badanusaha2") {
        caInfo = ccp.certificateAuthorities['ca.bu2.example.com'];
    } else if (org == "thirdparty") {
        caInfo = ccp.certificateAuthorities['ca.thirdparty.example.com'];
    } else
        return null
    return caInfo

}



const enrollAdmin = async (org, ccp) => {

    console.log('calling enroll Admin method')

    try {

        const caInfo = await getCaInfo(org, ccp) //ccp.certificateAuthorities['ca.org'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = await getWalletPath(org) //path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path (enroll admin): ${walletPath}`);

        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get('admin');
        if (identity) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        let x509Identity;
        if (org == "geologi") {
            x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'GeologiMSP',
                type: 'X.509',
            };
        } else if (org == "minerba") {
            x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'MinerbaMSP',
                type: 'X.509',
            };
        } else if (org == "badanusaha1") {
            x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'BadanUsaha1MSP',
                type: 'X.509',
            };
        } else if (org == "badanusaha2") {
            x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'BadanUsaha2MSP',
                type: 'X.509',
            };
        } else if (org == "thirdparty") {
            x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'ThirdPartyMSP',
                type: 'X.509',
            };
        }

        await wallet.put('admin', x509Identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
        return
    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
    }
}

const generateHash = async (input: string | Buffer) => {
    try {
      // Menghasilkan hash dari input menggunakan bcrypt
      const saltRounds = 7;
      const hash = await bcrypt.hash(input, saltRounds);
      return hash;
    } catch (error:any) {
      throw new Error('Error generating hash: ' + error.message);
    }
 }


const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    try {
        // Membandingkan password dengan hash yang disimpan menggunakan bcrypt
        return await bcrypt.compare(password, hash);
    } catch (error: any) {
        throw new Error('Error comparing password with hash: ' + error.message);
    }
}

exports.getRegisteredUser = getRegisteredUser

module.exports = {
    getCCP: getCCP,
    getWalletPath: getWalletPath,
    getRegisteredUser: getRegisteredUser,
    isUserRegistered: isUserRegistered
    // registerAndGetSecret: registerAndGetSecret

}