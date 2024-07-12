import { useState } from 'react';
import router, { useRouter } from 'next/router';
import { ThemeProvider } from "@material-tailwind/react";
import "../../app/globals.css";
import Link from 'next/link'; // Import Link from Next.js

export default function Register() {
  const [username, setUsername] = useState('');
  const [orgName, setOrgName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipe, setTipe] = useState('');


  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const response = await fetch('http://localhost:4000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, orgName, email, password, tipe }),
    });
    const data = await response.json();
    console.log(data); // Do something with the response data

    if (data.success == true ) {
      const token = data.message.token;
      window.localStorage.setItem('token', token);
      window.alert("Register success");
      router.push('/login'); // Redirect to home page if login is successful
    } else {
      window.alert("Register failed : "+ data.message.message);
      
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create an account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="orgName" className="sr-only">
                Organisasi
              </label>
              <select
                id="orgName"
                name="orgName"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              >
                <option value="" disabled selected hidden>Organisasi</option>
                <option value="geologi">Badan Geologi</option>
                <option value="minerba">Ditjen Minerba</option>
                <option value="badanusaha1">Badan Usaha 1</option>
                <option value="badanusaha2">Badan Usaha 2</option>
                <option value="thirdparty">Third Party</option>
                <option value="public">Public</option>
              </select>
              
            </div>
          <div>
              <label htmlFor="tipe" className="sr-only">
                User Type
              </label>
              <select
                id="tipe"
                name="tipe"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={tipe}
                onChange={(e) => setTipe(e.target.value)}
                required
              >
                <option value="" disabled selected hidden>Tipe User</option>
                <option value="data_owner">Data Owner</option>
                <option value="verifikator">Verificator/Authority</option>
                <option value="thirdparty">Third Party</option>
                <option value="public">Public</option>
              </select>
            </div>
            </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Register
            </button>
          </div>

        </form>
        <div className="flex items-center justify-between">
            {/* Tautan ke halaman login */}
            <Link href="/login">
              <button type="button" className="text-indigo-600 hover:text-indigo-700">
                Login
              </button>
            </Link>
          </div>
      </div>
    </div>
    </ThemeProvider>

  );
}
