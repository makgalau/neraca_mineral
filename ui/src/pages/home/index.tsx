import { useRouter } from 'next/router';
import "../../app/globals.css";
import {jwtDecode} from 'jwt-decode';
import { useEffect, useState } from 'react';
import { ThemeProvider } from "@material-tailwind/react";
import "../../app/globals.css";

export default function Home() {
  const router = useRouter();
  interface MyToken {
    username: string;
    orgname: string;
    tipe_usr:string;
    // Tambahkan properti lain jika ada
  }
  const [tipe_user, setTipeUser] = useState('');
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

    if (!token) {
      router.push('/login'); // Redirect ke halaman login jika token tidak ada
    }

  }, [router]);

  const handleLogout = () => {
    window.localStorage.removeItem('token'); // Hapus token dari localStorage
    router.push('/login'); // Redirect ke halaman login
  };

  return (
    <ThemeProvider>
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Welcome to Mineral Resources Database</h2>
        </div>
        <p className="text-center text-lg text-gray-600">
          by Ministry of Energy and Mineral Resources.
        </p>
        <div className="flex justify-center space-x-4">
        {(tipe_user === "data_owner")&& (<span
            onClick={() => router.push('/addAsset')}
            className="cursor-pointer text-2xl text-gray-900 font-bold hover:text-blue-700"
          >
            Add Data
          </span>)}
          <span
            className="cursor-pointer text-2xl text-gray-900 font-bold"
          >
            |
          </span>
          <span
            onClick={() => router.push('/viewAssets')}
            className="cursor-pointer text-2xl text-gray-900 font-bold hover:text-green-700"
          >
            View Data
          </span>
        </div>
        <div className="flex justify-center mt-4">
          <span
            onClick={handleLogout}
            className="cursor-pointer text-red-600 hover:text-red-700"
          >
            Logout
          </span>
        </div>
      </div>
    </div>
    </ThemeProvider>
  );
}
