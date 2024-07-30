import dotenv from 'dotenv';
// import * as crypto from 'crypto';
const crypto = require('crypto');
import { SHA256, enc } from 'crypto-js';
dotenv.config();
// import connectToDatabase from '../mongo/config';
// import User, { IUser }  from '../mongo/userscheme';
const mongo = require('../mongo/usercrud');

const algorithm = process.env.ALGORITHM || "aes-256-cbc";
const G_NUM = process.env.G_NUM || "ffffffff";
const multiplyHexStrings = (hexString1: string, hexString2: string) => {
    // Parse kedua nilai heksadesimal ke dalam bentuk angka desimal
    const decimalValue1 = BigInt('0x' + hexString1); 
    const decimalValue2 = BigInt('0x' + hexString2);

    // Lakukan perkalian dari kedua nilai tersebut
    const resultDecimal = decimalValue1 * decimalValue2;
    // Konversi hasil perkalian ke format heksadesimal
    let hexResult = resultDecimal.toString(16);

    return hexResult;
    // return resultDecimal.toString();
}

const divideHexStrings = (hexString1:string, hexString2:string) => {
    // Parse kedua nilai heksadesimal ke dalam bentuk angka desimal
    const decimalValue1 = BigInt('0x' + hexString1); 
    const decimalValue2 = BigInt('0x' + hexString2);

    // Lakukan pembagian dari kedua nilai tersebut
    const resultDecimal = decimalValue1 / decimalValue2;
    
    // Konversi hasil pembagian ke format heksadesimal
    let hexResult = resultDecimal.toString(16);

    return hexResult;
}

const generateABEKey = (role: string, organization:string) => {
    // Define relevant attributes for access policy
    if (role == "verifikator" || role == "thirdparty"){
        const attributes = {
            type_user : "verifikator/thirdparty",
            accessSecret: true
          };
        const attributesJSON = JSON.stringify(attributes);
        const hash = SHA256(attributesJSON);
        const hexString = hash.toString(enc.Hex);

        const keyHex = hexString.slice(0,24);
        return keyHex;

    } else {
        let erMssg = "Error, role should use IBE generater";
        console.log(`Getting error: ${erMssg}`)
        return erMssg
    }
    
}  

const generateABEKey2Enc = (role: string, organization:string, id:string) => {
    // Define relevant attributes for access policy
    if (role == "verifikator" || role == "thirdparty"){
        const attributes = {
            type_user : "verifikator/thirdparty",
            accessSecret: true
          };
        const attributesJSON = JSON.stringify(attributes);
        const hash = SHA256(attributesJSON);
        let hexString = hash.toString(enc.Hex);

        let temp = SHA256(id).toString();
        temp = temp.slice(0,8);
        hexString = hexString.slice(0,24);
        const result = genRedHexKeyABE(hexString,temp).padStart(24,'0');
        return result;

    } else {
        let erMssg = "Error, role should use IBE generater";
        console.log(`Getting error: ${erMssg}`)
        return erMssg
    }
    
}  

const generateABEKey2Dec = (encKey:string, id:string) => {
        // console.log(encKey, " - ",id);
        const temp = SHA256(id).toString().slice(0,8);
        // console.log("hasil hash username :",temp);
        const result = genAddHexKeyABE(encKey, temp).padStart(24,'0');
        // console.log("key yang digenerate: ",result);
        return result;

}  



const genRedHexKeyABE= (hexString1:string, hexString2:string) =>{
    const decimalValue1 = BigInt('0x' + hexString1); 
    const decimalValue2 = BigInt('0x' + hexString2);
    const resultDecimal = decimalValue1 - decimalValue2;
    let hexResult = resultDecimal.toString(16).padStart(24, '0');
    return hexResult;

}

const genAddHexKeyABE= (hexString1:string, hexString2:string) =>{
    const decimalValue1 = BigInt('0x' + hexString1); 
    const decimalValue2 = BigInt('0x' + hexString2);
    const resultDecimal = decimalValue1 + decimalValue2;
    let hexResult = resultDecimal.toString(16).padStart(24, '0');
    return hexResult;

}

const generateIBEKey = (identity: string): string =>{
    // Menggunakan SHA-256 untuk menghasilkan hash dari email
    const hash = crypto.createHash('sha256');
    hash.update(identity);
    const hashedEmail = hash.digest('hex');
    // console.log(hashedEmail);

    // Mengambil 24 karakter pertama dari hash sebagai kunci
    const key = hashedEmail.substring(0,24);
    return key;
}


const encryptFile = async (buffer, key) => {
    try {
        const keyBuffer = Buffer.from(key, 'hex');
        // console.log(keyBuffer);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm,keyBuffer,iv);
        let encrypted = cipher.update(buffer);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        // const result = Buffer.concat([iv, chiper.update(buffer),chiper.final()]);
        return Buffer.concat([iv, encrypted]);
    } catch (error) {
        console.error("Error during encryption:", error);
        return null;
    }
    
}

const encryptText = async (text, key) => {
    try {
        const keyBuffer = Buffer.from(key, 'hex');
        const iv = crypto.randomBytes(16); // Inisialisasi vektor inisialisasi acak
        const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + encrypted; // Menggabungkan IV dengan teks terenkripsi
    } catch (error) {
        console.error("Error during encryption:", error);
        return null;
    }
}

const decryptText = async (encryptedText, key) => {
    try {
        const keyBuffer = Buffer.from(key, 'hex');
        
        // Mengambil IV dari awal teks terenkripsi
        const iv = Buffer.from(encryptedText.slice(0, 32), 'hex');
        
        // Mengambil teks terenkripsi setelah IV
        const encryptedData = encryptedText.slice(32);
        
        const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
        
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted.toString();
    } catch (error) {
        console.error("Error during decryption:", error);
        return null;
    }
}

const decryptFile = async (fileBuffer,decryptkey) => {
    try {
        // console.log(fileBuffer);
        const key = Buffer.from(decryptkey, 'hex'); // assuming key_enc is hex encoded
        const iv = fileBuffer.subarray(0, 16); // assuming the first 16 bytes are the IV
        const encryptedData = fileBuffer.subarray(16); // the rest is the encrypted data
        if (iv.length !== 16) {
            throw new Error('Invalid initialization vector length');
        }
        const decipher = crypto.createDecipheriv(algorithm, key, iv); // Ensure 'aes-256-cbc' is the algorithm used
        const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
        return decryptedData;

    } catch (error) {
        console.error("Error during decryption:", error);
        return null;
    }
    
}



const generateRand8digHex = () => {
    //return 8 digit hexa string
    // Generate random number between 0 to 4294967295 (FFFFFFFF in hexadecimal)
    const randomNumber = Math.floor(Math.random() * 4294967295);
    // Convert the random number to hexadecimal string
    const hexString = randomNumber.toString(16);
    // Pad the string with zeros if necessary to ensure it has 8 characters
    return hexString.padStart(8, '0');
}

const checkOwner = (username:string,sk_bgn:string,randNum: string) => {
    const user = mongo.getUser(username);
    let temp = multiplyHexStrings(G_NUM,randNum);
    temp = divideHexStrings(sk_bgn,temp);
    if (temp == user.key) {
        return true;
    }
    return false;
}

const initializedEncryption = async (id_user:string) => {
    // console.log('tes 1');
    const verKey = await mongo.getVerKey();
    const usrKey = await mongo.getKey(id_user);
    if (usrKey == null) {
        console.log('ga bisa add asset, user harus data owner');
        return;
    }
    // console.log(verKey);
    
    const randNum = generateRand8digHex();
    // console.log(randNum);
    const gNum = process.env.G_NUM || "FFFFFFFF";

    // console.log('tes 3');
    if (verKey==null){
        const response_payload = {
            result: null,
            error: "verifikator tidak ditemukan"
        }
        return response_payload;
    }

    const sk_agn = multiplyHexStrings(multiplyHexStrings(verKey,gNum),randNum);
    // console.log('sk_agn = ',sk_agn);
    const sk_bgn = multiplyHexStrings(multiplyHexStrings(usrKey,gNum),randNum);
    // console.log('sk_bgn = ',sk_bgn);
    const keyToCipher = multiplyHexStrings(sk_bgn,verKey).padStart(64,'0');

    const result = {
        randNum: randNum,
        sk_agn: sk_agn,
        sk_bgn: sk_bgn,
        cipheringKey: keyToCipher
    }
    return result;
}

exports.multiplyHexStrings = multiplyHexStrings;
exports.generateABEKey = generateABEKey;
exports.generateIBEKey = generateIBEKey;
exports.generateRand8digHex = generateRand8digHex;
exports.initializedEncryption = initializedEncryption;
exports.encryptText = encryptText;
exports.decryptText = decryptText;
exports.encryptFile = encryptFile;
exports.decryptFile = decryptFile;
exports.divideHexStrings = divideHexStrings;
exports.generateABEKey2Enc = generateABEKey2Enc;
exports.generateABEKey2Dec = generateABEKey2Dec;