const cipher = require('./ciphering');
const fs = require('fs');

type Role = "verifikator" | "thirdparty";

function generateRandomEmail(): string {
    const domains = ["example.com", "test.com", "sample.com","esdm.go.id"];
    const name = Array.from({ length: 10 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${name}@${domain}`;
}

function generateRandomRole(): Role {
    const roles: Role[] = ["verifikator", "thirdparty"];
    return roles[Math.floor(Math.random() * roles.length)];
}
function generateRandomOrganization(): string {
    return Array.from({ length: 10 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
}


function checkKeys(): void {
    // Generate 1000 random emails users
    const emails: string[] = Array.from({ length: 1000000 }, () => generateRandomEmail());

    // Generate 1000 random emails Verifikator/thirdparty
    const emailsVer: string[] = Array.from({ length: 10 }, () => generateRandomEmail());

    // Generate 10 random roles
    const roles: string[] = Array.from({ length: 10 }, () => generateRandomRole());

    // Generate 10 random organizations
    const organizations: string[] = Array.from({ length: 10 }, () => generateRandomOrganization());

    // Generate keys from IBE
    const ibeKeys: string[] = emails.map(email => cipher.generateIBEKey(email));

    // Generate keys from ABE
    // const abeKeys: string[] = roles.flatMap(role => organizations.map(organization => cipher.generateABEKey(role, organization)));
    const abeKeys: string[] = roles.flatMap(role => organizations.map(organization => cipher.generateABEKey2Enc(role, organization,emailsVer)));
    // Set untuk menyimpan keys yang unik dari IBE
    const uniqueIbeKeys = new Set(ibeKeys);

    // Mencatat jumlah key yang sama dalam IBE
    const duplicateIbeKeys = ibeKeys.length - uniqueIbeKeys.size;

    // Mencatat jumlah key yang sama antara IBE dan ABE
    const sameKeysCount = ibeKeys.filter(key => abeKeys.includes(key)).length;

    let logData = `Jumlah input untuk generateIBEKey: ${emails.length}\n`;
    logData += `Jumlah input untuk generateABEKey: ${roles.length * organizations.length*emailsVer.length}\n\n`;

    logData += 'Input dan Output untuk generateIBEKey:\n';
    emails.forEach((email, index) => {
        logData += `User Identity: ${email}, Output: ${ibeKeys[index]}\n`;
    });

    logData += '\nInput dan Output untuk generateABEKey:\n';
    roles.forEach(role => {
        organizations.forEach(organization => {
            emailsVer.forEach(emailVer => {
            // const key = cipher.generateABEKey(role, organization);
            const key = cipher.generateABEKey2Enc(role, organization,emailVer);
            logData += `Role: ${role}, Organization: ${organization}, Output: ${key}\n`;
        });
        });
    });

    logData += `\nJumlah input untuk generateIBEKey: ${emails.length}\n`;
    logData += `Jumlah input untuk generateABEKey: ${roles.length * organizations.length*emailsVer.length}`;

    logData += `\nJumlah key yang sama dalam IBE: ${duplicateIbeKeys}\n`;
    logData += `Jumlah key yang sama antara IBE dan ABE: ${sameKeysCount}`;

    // Tulis hasil ke file log.txt
    fs.writeFileSync('log-1000000vs1000.txt', logData);

    // Print hasil pengecekan
    // console.log(logData);
}


function checkABEKeys(): void {

    const role = ["verifikator","thirdparty"];
    const id = ["memeng@kucing.com","odong@kucing.com"];
    const organization = ["aa","bb"];

    const abeKeys2enc = cipher.generateABEKey2Enc(role[0],organization[0],id[0]);
    console.log("key enc = ",abeKeys2enc);

    const abeKeys2dec = cipher.generateABEKey2Dec(abeKeys2enc,id[0]);
    console.log("key dec = ",abeKeys2dec);

    const realKey = cipher.generateABEKey(role[0],organization[0]);
    console.log("real key 1= ",realKey);
    if (realKey==abeKeys2dec) {
        console.log("user 1 ok");
    }
    console.log("\n");
    const abeKeys2enc2 = cipher.generateABEKey2Enc(role[1],organization[1],id[1]);
    console.log("key enc = ",abeKeys2enc2);

    const abeKeys2dec2 = cipher.generateABEKey2Dec(abeKeys2enc2,id[1]);
    console.log("key dec = ",abeKeys2dec2);

    const realKey2 = cipher.generateABEKey(role[1],organization[1]);
    console.log("real key 2= ",realKey2);
    if (realKey2==abeKeys2dec2) {
        console.log("user 2 ok");
    }

    if((realKey2==abeKeys2dec2)&&(realKey==realKey2)&&(abeKeys2enc!=abeKeys2enc2)){
        console.log("semua OK");
    }

}
// Panggil fungsi pengecekan
checkKeys();
// checkABEKeys();