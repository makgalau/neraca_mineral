step by step:
1. cd ke folder artifacts/channel/, jalankan : ./create-artifacts.sh
2. cd ke folder artifacts/, jalankan perintah: docker-compose up -d
3. cd ke main folder, jalankan : ./createChannel.sh dan ./deployChaincode_v2.sh
4. pergi ke docker, update affiliation pada masing-masing ca yang ada di file etc/hyperledger/fabric-ca-server/fabric-ca-server-config.yaml sesuai dengan organisasi yang dibutuhkan
5. restart docker container
6. cd ke folder api/mongo/, jalankan perintah docker-compose up -d
7. jalankan aplikasi pada folder api dengan perintah : npm run dev
8. jalankan aplikasi pada folder ui dengan perintah : npm run dev
9. nyalakan ipfs
10. aplikasi dapat diakses pada http://localhost:3000
