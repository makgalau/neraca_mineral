// pages/view-asset.tsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Asset } from '../../app/types';
import "../../app/globals.css";
import Link from 'next/link';
import {jwtDecode} from 'jwt-decode';
import router, { useRouter } from 'next/router';
import { ThemeProvider } from "@material-tailwind/react";


interface MyToken {
  username: string;
  orgname: string;
  tipe_usr:string;
  // Tambahkan properti lain jika ada
}

export default function ViewAsset() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tipe_user, setTipeUser] = useState('');
  const [username, setUsername] = useState('');
  useEffect(() => {
    const getToken = () => {
      return window.localStorage.getItem('token');
    };
    const token = getToken();
    console.log(token);
    if ((!token)||(token == undefined)) {
      router.push('/login');
      return;
    }

    if (token) {
      const decodedToken = jwtDecode<MyToken>(token);
      setTipeUser(decodedToken.tipe_usr);
      setUsername(decodedToken.username);
    }
    axios.get('http://localhost:4000/getAll')
      .then(response => {
        setAssets(response.data.result);
      })
      .catch(error => {
        setError(error.message);
      });
  }, []);

  const handleVerify = async (asset: Asset) => {
    const token = localStorage.getItem('token');
    try {
      asset.status_validasi = 1;
      const args = [asset.IdLogam,asset.NamaObject,asset.JenisKomoditi,asset.LambangUnsur,asset.KelompokLogam,
        asset.LokasiLogam,asset.Kecamatan,asset.Kabupaten,asset.Provinsi,asset.StatusPenyelidikan,asset.JenisIjin,
        asset.BijihHipotetik,asset.LogamHipotetik,asset.BijihTereka,asset.LogamTereka,asset.BijihTertunjuk,
        asset.LogamTertunjuk,asset.BijihTerukur,asset.LogamTerukur,asset.BijihTerkira,asset.LogamTerkira, asset.BijihTerbukti,
        asset.LogamTerbukti,asset.Keterangan,asset.Latitude,asset.Longitude,asset.DataAcuan,asset.InstansiSumber,
        asset.CompetentPerson,asset.TahunUpdate, asset.cid_dataacuan,asset.randGnum,asset.sk_agn,asset.sk_bgn,asset.status_enc,
        asset.status_validasi,asset.filename_acuan,asset.username];
  
      const updatedFormData = { args: args, peers: '["peer0.minerba.esdm.go.id"]', chaincodeName: 'nsdm_cc', channelName: 'nsdm',
        validasi: 1, confidential: asset.status_enc };
  
      const response = await axios.put(`http://localhost:4000/verify/${asset.IdLogam}`, updatedFormData, {
          headers: { Authorization: `Bearer ${token}` }
      });
      window.alert(`Verifikasi berhasil !`);
      router.push(`/viewAssets`);

    } catch (error:any) {
      setError(error.response?.data?.message || error.message);
    }
   
  };

  const handleDelete = async (IdLogam:string) => {
    const confirmDelete = window.confirm("Apakah anda benar-benar ingin menghapus data ini?");
    if (!confirmDelete) {
        return; // If the user cancels, exit the function
    }

    const token = localStorage.getItem('token');
    const updatedFormData = {
        args: IdLogam,
        peers: '["peer0.geologi.esdm.go.id"]',
        chaincodeName: 'nsdm_cc',
        channelName: 'nsdm'
    };
    try {
        const response = await axios.post(`http://localhost:4000/delete`, updatedFormData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        window.alert(`Delete berhasil!`);
        router.push('/viewAssets').then(() => {
            window.location.reload();
        });
    } catch (error) {
        console.error("There was an error deleting the data!", error);
        window.alert("Failed to delete the data.");
    }
};
  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <ThemeProvider>
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">View Asset</h1>
      <button 
        className="fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-full shadow-lg" 
        onClick={() => router.push('/home')}
      >
       Back
      </button>
      {((assets==null)||(assets.length==0))&&(<div className="space-y-4">Data tidak ditemukan</div> )}
      <div className="space-y-4">
        {assets.map((asset, index) => (
           <div key={index} className="bg-white p-4 rounded-lg shadow">
           <h2 className="text-xl font-semibold mb-4">{asset.NamaObject}</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <p><strong>ID Logam:</strong> {asset.IdLogam}</p>
                <p><strong>Komoditi:</strong> {asset.JenisKomoditi} ({asset.LambangUnsur})</p>
                <p><strong>Lokasi:</strong> {asset.LokasiLogam}, {asset.Kecamatan}, {asset.Kabupaten}, {asset.Provinsi}</p>
                <p><strong>Status Penyelidikan:</strong> {asset.StatusPenyelidikan}</p>
                <p>&nbsp;</p>
                <p>Bijih Hipotetik: {asset.BijihHipotetik}</p>
                <p>Logam Hipotetik: {asset.LogamHipotetik}</p>
                <p>Bijih Tereka: {asset.BijihTereka}</p>
                <p>Logam Tereka: {asset.LogamTereka}</p>
                <p>Bijih Tertunjuk: {asset.BijihTertunjuk}</p>
                <p>Logam Tertunjuk: {asset.LogamTertunjuk}</p>

             </div>
             <div>
                <p><strong>Latitude:</strong> {asset.Latitude}</p>
                <p><strong>Longitude:</strong> {asset.Longitude}</p>
                <p><strong>Keterangan:</strong> {asset.Keterangan}</p>
                <p><strong>Tahun Update:</strong> {asset.TahunUpdate}</p>
                <p>&nbsp;</p>
                <p>Bijih Terukur: {asset.BijihTerukur}</p>
                <p>Logam Terukur: {asset.LogamTerukur}</p>
                <p>Bijih Terkira:  {asset.BijihTerkira}</p>
                <p>Logam Terkira: {asset.LogamTerkira}</p>
                <p>Bijih Terbukti: {asset.BijihTerbukti}</p>
                <p>Logam Terbukti: {asset.LogamTerbukti}</p>
             </div>
             
           </div>
           <h4 className="font-semibold mb-4">Status data : {asset.status_validasi === 1 ? "sudah diverifikasi" : "belum diverifikasi"}</h4>
            <div>
            {(username === asset.username || tipe_user === "verifikator" || tipe_user === "thirdparty") && (
              <Link href={`/Asset/${asset.IdLogam}`} className="block m-2 mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block">
               View Details
              </Link>
              )}
       
            {(username === asset.username || tipe_user === "verifikator") && (
              <Link href={`/History/${asset.IdLogam}`} className="block m-2 mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block">
               View Asset History
              </Link>
              )}
              {(tipe_user ==="verifikator") && (asset.status_validasi==0) && (<button
                    onClick={() => handleVerify(asset)}
                    className="block m-2 mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 inline-block"
                  >
                    Verifikasi Data
                  </button>)
              }
              {(tipe_user ==="verifikator") && (<button
                    onClick={() => handleDelete(asset.IdLogam)}
                    className="block m-2 mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 inline-block"
                  >
                    Delete
                  </button>)
              }
            </div>
            
         </div>
        ))}
      </div>
    </div>
    </ThemeProvider>
  );
}
