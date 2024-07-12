import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Asset } from '../../../app/types';
import {jwtDecode} from 'jwt-decode';
import { ThemeProvider } from "@material-tailwind/react";
import "../../../app/globals.css";;

interface AssetValue {
  BijihHipotetik: number;
  BijihTerbukti: number;
  BijihTereka: number;
  BijihTerkira: number;
  BijihTertunjuk: number;
  BijihTerukur: number;
  CompetentPerson: string;
  DataAcuan: string;
  IdLogam: string;
  InstansiSumber: string;
  JenisIjin: string;
  JenisKomoditi: string;
  Kabupaten: string;
  Kecamatan: string;
  KelompokLogam: string;
  Keterangan: string;
  LambangUnsur: string;
  Latitude: number;
  LogamHipotetik: number;
  LogamTerbukti: number;
  LogamTereka: number;
  LogamTerkira: number;
  LogamTertunjuk: number;
  LogamTerukur: number;
  LokasiLogam: string;
  Longitude: number;
  NamaObject: string;
  Provinsi: string;
  StatusPenyelidikan: string;
  TahunUpdate: number;
  cid_dataacuan: string;
  filename_acuan: string;
  randGnum: string;
  sk_agn: string;
  sk_bgn: string;
  status_enc: number;
  status_validasi: number;
  username: string;
  allowaccessto: string,
  last_updater:string;
}

interface AssetHistoryEntry {
  transactionId: string;
  timestamp: string;
  value: AssetValue;
}

export default function AssetHistory() {
  const router = useRouter();
  const { id } = router.query;
  const [assetHistory, setAssetHistory] = useState<AssetHistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  interface MyToken {
    username: string;
    orgname: string;
    tipe_usr:string;
    // Tambahkan properti lain jika ada
  }

  useEffect(() => {
    const getToken = () => {
      return window.localStorage.getItem('token');
    };

    const token = getToken();

    if (!token) {
      router.push('/login');
      return;
    }

    const fetchAssetHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/getAssetHistory`, {
          params: { args: id },
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = response.data;
        console.log(data);
        console.log(data.result);
        if (data.error) {
          setError(data.error);
        } else if (data.result) {
          const parsedData = data.result.map((entry: string) => {
            const [transactionId, timestamp, valueStr] = entry.split('; ');
            console.log(transactionId);
            console.log(timestamp);
            console.log(valueStr);
            let value = valueStr.substring(7,valueStr.length-2);
            // let value_temp = JSON.parse(valueStr.substring(7,valueStr.length-2));
            value = JSON.parse(value);
            console.log(value);
            // console.log(value_temp.sk_agn);
            return {
              transactionId: transactionId.replace('Transaction ID: ', ''),
              timestamp: timestamp.replace('Timestamp: ', ''),
              value
            };
          });
          // console.log(parsedData[0].value['sk_agn']);
          for (let i = 0; i < parsedData.length; i++) {
            parsedData[i].value['sk_agn'] = "xxxxxxxxxxxxxxxxxxx";
            parsedData[i].value['sk_bgn'] = "xxxxxxxxxxxxxxxxxxx";
            parsedData[i].value['randGnum'] = "xxxxxxxxxxxxxxxxxxx";
            
          }
          setAssetHistory(parsedData);
       
        } else {
          setError('No result found.');
        }
      } catch (err:any) {
        setError(err.message);
      }
    };

    fetchAssetHistory();
  }, []);

  return (
    <ThemeProvider>
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Asset History</h1>
      <button 
        className="fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-full shadow-lg" 
        onClick={() => router.push('/viewAssets')}
      >
       Back
      </button>
      {error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <ul className="space-y-4">
          {assetHistory.length > 0 ? (
            assetHistory.map((entry, index) => (
              <li key={index} className="p-4 border rounded shadow">
                <div><strong>Transaction ID:</strong> {entry.transactionId}</div>
                <div><strong>Timestamp:</strong> {entry.timestamp}</div>
                <div>
                  <strong>Details:</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-2">{JSON.stringify(entry.value, null, 2)}</pre>
                </div>
              </li>
            ))
          ) : (
            <div>No asset history available.</div>
          )}
        </ul>
      )}
    </div>
    </ThemeProvider>
  );
}
