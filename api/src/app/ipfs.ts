const fs = require('fs');
const path = require('path');
import axios from 'axios';

let message;
const createNode = async () =>{
    const {createHelia} = await import('helia');
    const {unixfs} = await import('@helia/unixfs');
    const helia = await createHelia();
    const fs = unixfs(helia);
    return fs;
}

const uploadEncFile2Ipfs = async (formData) => {
    try {
        // const tempFilePath = path.join('/tmp', `encrypted_${Date.now()}`);
        // fs.writeFileSync(tempFilePath, datafile);

        // const formData = new FormData();
        // formData.append('file', fs.createReadStream(tempFilePath));

        console.log("Uploading to IPFS");
        const ipfsResponse = await fetch('http://127.0.0.1:5001/api/v0/add?pin=true', {
            method: 'POST',
            body: formData,
        });

        const ipfsResult = await ipfsResponse.json();
        return ipfsResult;

    } catch (error) {
        console.error("Error during upload to IPFS: ", error);
        return null;
    }
}

const uploadIPFS = async (file) => {
    try {
        console.log("Uploading to IPFS without encryption");

         // Convert file buffer to Blob
         const blob = new Blob([file.buffer]);

        const formData = new FormData();
        formData.append('file', blob, file.originalname);

        const ipfsResponse = await fetch('http://127.0.0.1:5001/api/v0/add?pin=true', {
            method: 'POST',
            body: formData,
        });

        const ipfsResult = await ipfsResponse.json();
        return ipfsResult;
    } catch (error) {
        console.error("Error during upload to IPFS: ", error);
        return null;
    } 
}

const removePINCID = async(pinnedCID: string) => {
    try {
        console.log("remove previous pin on IPFS");
        const arg = new FormData();
        arg.append('arg',pinnedCID);
        const removePinResponse = await fetch('http://127.0.0.1:5001/api/v0/pin/rm', {
            method: 'POST',
            body: arg,
        });
        
        return removePinResponse;
    } catch (error) {
        console.error("Error during remove CID on IPFS: ", error);
        return null;
    }
}

const downloadIpfs = async (cid: string) =>{
    try {
        console.log("download from IPFS");
        const response = await axios.post(`http://127.0.0.1:5001/api/v0/cat`, null, {
            params: { arg: cid },
            responseType: 'arraybuffer'
        });
        return response;
    } catch (error) {
        console.error("Error during download from IPFS: ", error);
        return null;
    }
}


exports.downloadIpfs = downloadIpfs;
exports.uploadEncFile2Ipfs = uploadEncFile2Ipfs;
exports.uploadIPFS = uploadIPFS;
exports.removePINCID = removePINCID;