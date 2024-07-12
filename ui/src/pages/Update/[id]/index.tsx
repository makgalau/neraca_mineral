import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import "../../../app/globals.css";
import { ThemeProvider } from "@material-tailwind/react";
import Link from 'next/link'; // Import Link from Next.js
import { Asset } from '../../../app/types';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

interface MyToken {
    username: string;
    orgname: string;
    tipe_usr:string;
    // Tambahkan properti lain jika ada
  }
  
export default function UpdateAsset() {
    const router = useRouter();
    const { id } = router.query;
    const [asset, setAsset] = useState<Asset | null>(null);
    const [formData, setFormData] = useState<Partial<Asset>>({});
    const [error, setError] = useState<string | null>(null);
    const [username, setUsername] = useState('');
    const [tipe_usr,setTipeUser] = useState('');

    useEffect(() => {
        const getToken = () => {
            return localStorage.getItem('token');
        };
        const token = getToken();
        if (token) {
            const decodedToken = jwtDecode<MyToken>(token);
            setTipeUser(decodedToken.tipe_usr);
            setUsername(decodedToken.username);
            if ((tipe_usr == 'public')||(tipe_usr == 'thirdparty')) {
                window.alert('User tidak memiliki akses ');
                router.push('/viewAssets');
                return;
            }
          }

        if (!token)  {
            window.alert('You must be logged in to update an asset');
            router.push('/login'); // Redirect to login page if token is not available
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
                setFormData(response.data.result);

                // Check access based on asset's username
                console.log(response.data.result.username);
                console.log(username);
             
            } catch (error: any) {
                console.error('API error:', error); // Debugging log
                setError(error.response?.data?.message || error.message);
            }
        };

        if (id) {
            fetchAssetDetails();
        }

        if (!token){
            // window.alert('User tidak memiliki akses');
            router.push('/viewAssets'); // Redirect to login page if token is not available
            return;
        }
    }, [id, router]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            // window.alert('You must be logged in to update an asset');
            router.push('/login');
            return;
        }

        try {
            const updatedFormData = { ...formData, peers: '["peer0.minerba.esdm.go.id"]', chaincodeName: 'nsdm_cc', channelName: 'nsdm', owner: asset?.username };

            const response = await axios.put(`http://localhost:4000/updateAsset/${id}`, updatedFormData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // console.log(response);
            window.alert(`Update Data:  ${response.data.message || 'Asset updated successfully!'}`);
            router.push(`/viewAssets`);
        } catch (error: any) {
            setError(error.response?.data?.message || error.message);
        }
    };

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    if (!asset) {
        return <div className="p-4">Loading...</div>;
    }
    // console.log(tipe_usr);
    if (( asset.username !== username)&&(tipe_usr != "verifikator")) {
        window.alert(`User tidak memiliki akses 1`);
        router.push('/viewAssets');
    }

    return (
        <ThemeProvider>
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Update Asset</h1>
            <button 
                className="fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-full shadow-lg" 
                onClick={() => router.push('/viewAssets')}
            >
              Back
            </button>
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2">
                            Nama Object:
                            <input
                                type="text"
                                name="NamaObject"
                                value={formData.NamaObject || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            ID Logam:
                            <input
                                type="text"
                                name="IdLogam"
                                value={formData.IdLogam || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                disabled
                            />
                        </label>
                        <label className="block mb-2">
                            Komoditi:
                            <input
                                type="text"
                                name="JenisKomoditi"
                                value={formData.JenisKomoditi || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Lambang Unsur:
                            <input
                                type="text"
                                name="LambangUnsur"
                                value={formData.LambangUnsur || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Kelompok Logam:
                            <input
                                type="text"
                                name="KelompokLogam"
                                value={formData.KelompokLogam || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Lokasi:
                            <input
                                type="text"
                                name="LokasiLogam"
                                value={formData.LokasiLogam || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Kecamatan:
                            <input
                                type="text"
                                name="Kecamatan"
                                value={formData.Kecamatan || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Kabupaten:
                            <input
                                type="text"
                                name="Kabupaten"
                                value={formData.Kabupaten || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Provinsi:
                            <input
                                type="text"
                                name="Provinsi"
                                value={formData.Provinsi || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Status Penyelidikan:
                            <input
                                type="text"
                                name="StatusPenyelidikan"
                                value={formData.StatusPenyelidikan || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Jenis Ijin:
                            <input
                                type="text"
                                name="JenisIjin"
                                value={formData.JenisIjin || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Latitude:
                            <input
                                type="text"
                                name="Latitude"
                                value={formData.Latitude || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Longitude:
                            <input
                                type="text"
                                name="Longitude"
                                value={formData.Longitude || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Keterangan:
                            <textarea
                                name="Keterangan"
                                value={formData.Keterangan || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Tahun Update:
                            <input
                                type="text"
                                name="TahunUpdate"
                                value={formData.TahunUpdate || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                    </div>
                    <div>
                        <label className="block mb-2">
                            Bijih Hipotetik:
                            <input
                                type="number"
                                name="BijihHipotetik"
                                value={formData.BijihHipotetik || '0'}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Logam Hipotetik:
                            <input
                                type="number"
                                name="LogamHipotetik"
                                value={formData.LogamHipotetik || '0'}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Bijih Tereka:
                            <input
                                type="number"
                                name="BijihTereka"
                                value={formData.BijihTereka || '0'}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Logam Tereka:
                            <input
                                type="number"
                                name="LogamTereka"
                                value={formData.LogamTereka || '0'}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Bijih Tertunjuk:
                            <input
                                type="number"
                                name="BijihTertunjuk"
                                value={formData.BijihTertunjuk || '0'}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Logam Tertunjuk:
                            <input
                                type="number"
                                name="LogamTertunjuk"
                                value={formData.LogamTertunjuk || '0'}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Bijih Terukur:
                            <input
                                type="number"
                                name="BijihTerukur"
                                value={formData.BijihTerukur || '0'}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Logam Terukur:
                            <input
                                type="number"
                                name="LogamTerukur"
                                value={formData.LogamTerukur || '0'}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Bijih Terkira:
                            <input
                                type="number"
                                name="BijihTerkira"
                                value={formData.BijihTerkira || '0'}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Logam Terkira:
                            <input
                                type="number"
                                name="LogamTerkira"
                                value={formData.LogamTerkira || '0'}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Bijih Terbukti:
                            <input
                                type="number"
                                name="BijihTerbukti"
                                value={formData.BijihTerbukti || '0'}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Logam Terbukti:
                            <input
                                type="number"
                                name="LogamTerbukti"
                                value={formData.LogamTerbukti || '0'}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Data Acuan:
                            <input
                                type="text"
                                name="DataAcuan"
                                value={formData.DataAcuan || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Instansi Sumber:
                            <input
                                type="text"
                                name="InstansiSumber"
                                value={formData.InstansiSumber || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Competent Person:
                            <input
                                type="text"
                                name="CompetentPerson"
                                value={formData.CompetentPerson || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                    </div>
                </div>
                <button type="submit" className="mt-4 bg-green-500 text-white p-2 rounded">Update</button>
            </form>
        </div>
        </ThemeProvider>
    );
}
