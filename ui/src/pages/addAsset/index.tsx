import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { ThemeProvider } from "@material-tailwind/react";
import "../../app/globals.css";
import Link from 'next/link'; // Import Link from Next.js

interface FormValues {
  IdLogam: string,
  NamaObject: string,
  JenisKomoditi: string,
  LambangUnsur: string,
  KelompokLogam: string,
  LokasiLogam: string,
  Kecamatan: string,
  Kabupaten: string,
  Provinsi: string,
  StatusPenyelidikan: string,
  JenisIjin: string,
  BijihHipotetik: number | string,
  LogamHipotetik: number | string,
  BijihTereka: number | string,
  LogamTereka: number | string,
  BijihTertunjuk: number | string,
  LogamTertunjuk: number | string,
  BijihTerukur: number | string,
  LogamTerukur: number | string,
  BijihTerkira: number | string,
  LogamTerkira: number | string,
  BijihTerbukti: number | string,
  LogamTerbukti: number | string,
  Keterangan: string,
  Latitude: number | string,
  Longitude: number | string,
  DataAcuan: string,
  InstansiSumber: string,
  CompetentPerson: string,
  TahunUpdate: number | string,
  cid_dataacuan: string,
  randGnum: string,
  sk_agn: string,
  sk_bgn: string,
  status_enc: number,
  status_validasi: number,
  filename_acuan: string, 
  username: string,
  allowaccessto: string
}

export default function AddAsset() {
  const router = useRouter();
  const [formValues, setFormValues] = useState<FormValues>({
    IdLogam: '',
    NamaObject: '',
    JenisKomoditi: '',
    LambangUnsur: '',
    KelompokLogam: '',
    LokasiLogam: '',
    Kecamatan: '',
    Kabupaten: '',
    Provinsi: '',
    StatusPenyelidikan: '',
    JenisIjin: '',
    BijihHipotetik: '',
    LogamHipotetik: '',
    BijihTereka: '',
    LogamTereka: '',
    BijihTertunjuk: '',
    LogamTertunjuk: '',
    BijihTerukur: '',
    LogamTerukur: '',
    BijihTerkira: '',
    LogamTerkira: '',
    BijihTerbukti: '',
    LogamTerbukti: '',
    Keterangan: '',
    Latitude: '',
    Longitude: '',
    DataAcuan: '',
    InstansiSumber: '',
    CompetentPerson: '',
    TahunUpdate: '',
    cid_dataacuan: '',
    randGnum: '',
    sk_agn: '',
    sk_bgn: '',
    status_enc: 1,
    status_validasi: 0,
    filename_acuan: '', 
    username: '',
    allowaccessto: 'verifikator/thirdparty'
  });
  const [file, setFile] = useState<File | null>(null);
  const [confidential, setConfidential] = useState('');

  useEffect(() => {
    const token = window.localStorage.getItem('token');
    if (!token) {
      window.alert('You must be logged in to add an asset');
      router.push('/login'); // Redirect ke halaman login jika token tidak ada
    }
  }, [router]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    setFile(selectedFile);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = window.localStorage.getItem('token');
    // if (!token) {
    //   window.alert('You must be logged in to add an asset');
    //   router.push('/login');
    //   return;
    // }

    const args = [formValues.IdLogam, formValues.NamaObject, formValues.JenisKomoditi, formValues.LambangUnsur, 
          formValues.KelompokLogam,formValues.LokasiLogam, formValues.Kecamatan, formValues.Kabupaten, formValues.Provinsi,
          formValues.StatusPenyelidikan, formValues.JenisIjin, formValues.BijihHipotetik, formValues.LogamHipotetik,
          formValues.BijihTereka, formValues.LogamTereka, formValues.BijihTertunjuk, formValues.LogamTertunjuk,
          formValues.BijihTerukur, formValues.LogamTerukur, formValues.BijihTerkira, formValues.LogamTerkira, 
          formValues.BijihTerbukti, formValues.LogamTerbukti, formValues.Keterangan, formValues.Latitude, formValues.Longitude,
          formValues.DataAcuan, formValues.InstansiSumber, formValues.CompetentPerson, formValues.TahunUpdate, 
          formValues.cid_dataacuan, formValues.randGnum, formValues.sk_agn, formValues.sk_bgn, formValues.status_enc,
          formValues.status_validasi, formValues.filename_acuan, formValues.username, formValues.allowaccessto ];
    const formData = new FormData();
    formData.append('peers','["peer0.minerba.esdm.go.id"]');
    formData.append('chaincodeName', 'nsdm_cc');
    formData.append('channelName', 'nsdm');
    if (file) {
      formData.append('file', file);
    }
    formData.append('args', JSON.stringify(args));
    formData.append('valid', '0');
    formData.append('confidential', confidential);
    
    
    try {
      const response = await fetch('http://localhost:4000/channels/nsdm/chaincodes/nsdm_cc/addAsset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        window.alert(data.message);
        router.push('/home');
      } else {
        const errorData = await response.json();
        window.alert(errorData.message);
      }
    } catch (error) {
      window.alert('An error occurred. Please try again.');
    }
  };

  return (
    <ThemeProvider>
    <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4 flex justify-center">Tambah Data</h1>
    <button 
        className="fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-full shadow-lg" 
        onClick={() => router.push('/home')}
    >
      Back
    </button>
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block mb-2">
              Nama Objek*:
              <input
                id="NamaObject"
                type="text"
                name="NamaObject"
                value={formValues.NamaObject || ''}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </label>
            <label className="block mb-2">
              ID Logam*:
              <input
                id="IdLogam"
                type="text"
                name="IdLogam"
                value={formValues.IdLogam || ''}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </label>
            <label className="block mb-2">
              Komoditi*:
              <input
                type="text"
                name="JenisKomoditi"
                value={formValues.JenisKomoditi || ''}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </label>
            <label className="block mb-2">
              Lambang Unsur*:
              <input
                type="text"
                name="LambangUnsur"
                value={formValues.LambangUnsur || ''}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </label>
            <label className="block mb-2">
              Kelompok Logam*:
              <select
              id="KelompokLogam"
              name="KelompokLogam"
              required
              className="w-full p-2 border rounded"
              value={formValues.KelompokLogam}
              onChange={handleChange}
              >
                <option value="" disabled hidden>-- Pilih Kelompok Logam --</option>
                <option value="Logam Besi dan Paduan Besi">Logam Besi dan Paduan BesiLogam Besi dan Paduan Besi</option>
                <option value="Logam Dasar">Logam Dasar</option>
                <option value="Logam Mulia">Logam Mulia</option>
                <option value="Logam Ringan dan Langka">Logam Ringan dan Langka</option>
                <option value="Mineral Radioaktif">Mineral Radioaktif</option>
              </select>
            </label>
            <label className="block mb-2">
              Lokasi*:
              <input
                type="text"
                name="LokasiLogam"
                value={formValues.LokasiLogam || ''}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </label>
            <label className="block mb-2">
              Kecamatan*:
              <input
              type="text"
              name="Kecamatan"
              value={formValues.Kecamatan || ''}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
              />
            </label>
            <label className="block mb-2">
              Kabupaten*:
              <input
                type="text"
                name="Kabupaten"
                value={formValues.Kabupaten || ''}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </label>
            <label className="block mb-2">
              Provinsi*:
              <input
                type="text"
                name="Provinsi"
                value={formValues.Provinsi || ''}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </label>
            <label className="block mb-2">
              Status Penyelidikan*:
              <select
                id="StatusPenyelidikan"
                name="StatusPenyelidikan"
                required
                className="w-full p-2 border rounded"
                value={formValues.StatusPenyelidikan}
                onChange={handleChange}
              >
                <option value="" disabled hidden>-- Pilih Status Penyelidikan --</option>
                <option value="Studi Kelayakan">Studi Kelayakan</option>
                <option value="Prospeksi">Prospeksi</option>
                <option value="Survei Tinjau">Survei Tinjau</option>
                <option value="Konstruksi">Konstruksi</option>
                <option value="Eksplorasi">Eksplorasi</option>
                <option value="Eksplorasi Umum">Eksplorasi Umum</option>
                <option value="Eksplorasi Rinci">Eksplorasi Rinci</option>
                <option value="Eksploitasi">Eksploitasi</option>
                <option value="Operasi Produksi">Operasi Produksi</option>
              </select>
            </label>
            <label className="block mb-2">
              Jenis Ijin:
            <input
              type="text"
              name="JenisIjin"
              value={formValues.JenisIjin || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            </label>
            <label className="block mb-2">
              Latitude*:
              <input
                type="text"
                name="Latitude"
                value={formValues.Latitude || ''}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </label>
            <label className="block mb-2">
              Longitude*:
              <input
                type="text"
                name="Longitude"
                value={formValues.Longitude || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required  
              />
            </label>
            <label className="block mb-2">
              Keterangan:
              <textarea
                name="Keterangan"
                value={formValues.Keterangan || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </label>
            <label className="block mb-2">
              Instansi Sumber*:
              <input
                type="text"
                name="InstansiSumber"
                value={formValues.InstansiSumber || ''}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </label>
          <label className="block mb-2">
            Competent Person:
            <input
              type="text"
              name="CompetentPerson"
              value={formValues.CompetentPerson || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </label>
        </div>
        <div>
        <label className="block mb-2">
          Tahun Update*:
          <select
            id="TahunUpdate"
            name="TahunUpdate"
            required
            className="w-full p-2 border rounded"
            value={formValues.TahunUpdate}
            onChange={handleChange}
          >
            <option value="" disabled hidden>-- Pilih Tahun Data --</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2023</option>
            <option value="2020">2020</option>
            </select>
        </label>
        <label className="block mb-2">
          Bijih Hipotetik:
          <input
            type="number"
            name="BijihHipotetik"
            value={formValues.BijihHipotetik || '0'}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block mb-2">
          Logam Hipotetik:
          <input
            type="number"
            name="LogamHipotetik"
            value={formValues.LogamHipotetik || '0'}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block mb-2">
          Bijih Tereka:
          <input
            type="number"
            name="BijihTereka"
            value={formValues.BijihTereka || '0'}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block mb-2">
          Logam Tereka:
          <input
            type="number"
            name="LogamTereka"
            value={formValues.LogamTereka || '0'}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block mb-2">
          Bijih Tertunjuk:
          <input
            type="number"
            name="BijihTertunjuk"
            value={formValues.BijihTertunjuk || '0'}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block mb-2">
          Logam Tertunjuk:
          <input
            type="number"
            name="LogamTertunjuk"
            value={formValues.LogamTertunjuk || '0'}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block mb-2">
          Bijih Terukur:
          <input
            type="number"
            name="BijihTerukur"
            value={formValues.BijihTerukur || '0'}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block mb-2">
          Logam Terukur:
          <input
            type="number"
            name="LogamTerukur"
            value={formValues.LogamTerukur || '0'}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block mb-2">
          Bijih Terkira:
          <input
            type="number"
            name="BijihTerkira"
            value={formValues.BijihTerkira || '0'}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block mb-2">
          Logam Terkira:
          <input
            type="number"
            name="LogamTerkira"
            value={formValues.LogamTerkira || '0'}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block mb-2">
          Bijih Terbukti:
          <input
            type="number"
            name="BijihTerbukti"
            value={formValues.BijihTerbukti || '0'}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block mb-2">
          Logam Terbukti:
          <input
            type="number"
            name="LogamTerbukti"
            value={formValues.LogamTerbukti || '0'}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
        </label>
        <label className="block mb-2">
          Data Acuan*:
          <input
            type="text"
            name="DataAcuan"
            value={formValues.DataAcuan || ''}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </label>
        <label htmlFor="file" className="block mb-2">
              File Data Acuan :
          <input
              id="file"
              name="file"
              type="file"
              accept=".pdf"
              className="w-full p-2 border rounded"
              onChange={handleFileChange}
          />
        </label>
        <label htmlFor="confidential" className="block mb-2">
            Apakah data bersifat rahasia?
            </label>
            <select
                id="confidential"
                name="confidential"
                className="w-full p-2 border rounded"
                value={confidential}
                onChange={(e) => setConfidential(e.target.value)}
                required
              >
                <option value="1">Ya</option>
                <option value="0">Tidak</option>

              </select>
        <div>
            <button
              type="submit"
              className="mt-4 mx-auto flex justify-center bg-blue-500 text-white px-8 py-2 rounded hover:bg-blue-700 inline-block"
            >
              Submit
            </button>
        </div>
        </div>
        </div>
    </form>
    </div>
    </ThemeProvider>
  );
}
        

