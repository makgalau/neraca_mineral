import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import FileSaver from 'file-saver';
import { Asset } from '../../../app/types';
import { ThemeProvider } from "@material-tailwind/react";
import "../../../app/globals.css";


export default function AssetDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [asset, setAsset] = useState<Asset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tipe_user, setTipeUser] = useState('');
  const [username, setUsername] = useState('');

  interface MyToken {
    username: string;
    orgname: string;
    tipe_usr: string;
    // Tambahkan properti lain jika ada
  }

  useEffect(() => {
    const getToken = () => {
      return localStorage.getItem('token');
    };

    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    const decodedToken = jwtDecode<MyToken>(token);
    setTipeUser(decodedToken.tipe_usr);
    setUsername(decodedToken.username);

    if (tipe_user === "public") {
      router.push('/viewAssets');
      return;
    }
   

    const fetchAssetDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/readAsset`, {
          params: { args: id },
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('API response:', response.data); // Debugging log
        setAsset(response.data.result);
      } catch (error: any) {
        console.error('API error:', error); // Debugging log
        setError(error.response?.data?.message || error.message);
      }
    };

    

    if (id) {
      fetchAssetDetails();
    }
  }, [id, router, tipe_user]);

  const downloadFile = async (cid: string, status_enc: number, sk_agn: string, sk_bgn: string, filename: string) => {
    try {
      const token = localStorage.getItem('token');
      const formData = { cid, status_enc, sk_agn, sk_bgn };
      const response = await axios.post(`http://localhost:4000/downloadfile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob' // Important to set the response type to 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      FileSaver.saveAs(blob, filename);

      console.log(filename);
      console.log(response.data);
      // window.alert('File downloaded successfully');
    } catch (error: any) {
      console.error('Download error:', error);
      setError(error.response?.data?.message || error.message);
    }
  };

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (asset === null) {
    return <div className="p-4">Loading...</div>;
  }

  if (tipe_user === "data_owner" && username != asset?.username ){
    router.push('/viewAssets');
    return;
  }
  
  return (
    <ThemeProvider>
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Asset Details</h1>
      <button 
        className="fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-full shadow-lg" 
        onClick={() => router.push('/viewAssets')}
      >
        Back
      </button>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{asset.NamaObject}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>ID Logam:</strong> {asset.IdLogam}</p>
            <p><strong>Komoditi:</strong> {asset.JenisKomoditi} ({asset.LambangUnsur})</p>
            <p><strong>Kelompok Logam:</strong> {asset.KelompokLogam}</p>
            <p><strong>Lokasi:</strong> {asset.LokasiLogam}, {asset.Kecamatan}, {asset.Kabupaten}, {asset.Provinsi}</p>
            <p><strong>Status Penyelidikan:</strong> {asset.StatusPenyelidikan}</p>
            <p><strong>Jenis Ijin:</strong> {asset.JenisIjin}</p>
            <p><strong>Pemilik Data:</strong> {asset.username}</p>
            <p>&nbsp;</p>
            <p>Bijih Hipotetik: {asset.BijihHipotetik}</p>
            <p>Logam Hipotetik: {asset.LogamHipotetik}</p>
            <p>Bijih Tereka: {asset.BijihTereka}</p>
            <p>Logam Tereka: {asset.LogamTereka}</p>
            <p>Bijih Tertunjuk: {asset.BijihTertunjuk}</p>
            <p>Logam Tertunjuk: {asset.LogamTertunjuk}</p>
            <p>&nbsp;</p>
            <h4 className="font-semibold mb-4"><p>Status data : {asset.status_validasi === 1 ? "sudah diverifikasi" : "belum diverifikasi"}</p>
            <p>Sifat data : {asset.status_enc === 1 ? "rahasia" : "tidak rahasia"}</p></h4>
          </div>
          <div>
            <p><strong>Latitude:</strong> {asset.Latitude}</p>
            <p><strong>Longitude:</strong> {asset.Longitude}</p>
            <p><strong>Keterangan:</strong> {asset.Keterangan}</p>
            <p><strong>Tahun Update:</strong> {asset.TahunUpdate}</p>
            <p><strong>Data Acuan:</strong> {asset.DataAcuan}</p>
            <p><strong>Instansi Sumber:</strong> {asset.InstansiSumber}</p>
            <p><strong>Competent Person:</strong> {asset.CompetentPerson}</p>
            <p>&nbsp;</p>
            <p>Bijih Terukur: {asset.BijihTerukur}</p>
            <p>Logam Terukur: {asset.LogamTerukur}</p>
            <p>Bijih Terkira: {asset.BijihTerkira}</p>
            <p>Logam Terkira: {asset.LogamTerkira}</p>
            <p>Bijih Terbukti: {asset.BijihTerbukti}</p>
            <p>Logam Terbukti: {asset.LogamTerbukti}</p>
          </div>
        </div>
      </div>

      {(username === asset.username || tipe_user === "verifikator") && (
        <button 
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
          onClick={() => router.push(`/updt/${id}`)}
        >
          Update
        </button>
      )}

      {(asset.cid_dataacuan != '') && (<button
        className="mt-4 ml-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 inline-block"
        onClick={() => downloadFile(asset.cid_dataacuan, asset.status_enc, asset.sk_agn, asset.sk_bgn, asset.filename_acuan)}
      >
        Download PDF
      </button>)}
    </div>
    </ThemeProvider>
  );
}
