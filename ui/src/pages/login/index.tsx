import { useState } from 'react';
import router, { useRouter } from 'next/router';
import Link from 'next/link'; // Import Link from Next.js
import { ThemeProvider } from "@material-tailwind/react";
import "../../app/globals.css";
import ReCAPTCHA from "react-google-recaptcha";

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // const [recaptchaToken, setRecaptchaToken] = useState(null);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    // if (!recaptchaToken) {
    //   window.alert("Silahkan lengkapi reCAPTCHA");
    //   return;
    // }

    const response = await fetch('http://localhost:4000/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify({ username, password, recaptchaToken }), // Include reCAPTCHA token
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    console.log(data);
    
    if (data.success == true ) {
      const token = data.message.token;
      window.localStorage.setItem('token', token);
      window.alert("Login success");
      router.push('/home'); // Redirect to home page if login is successful
    } else {
      window.alert("Login failed");
      
    }// Do something with the response data 
  };

  return (
    <ThemeProvider>
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
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
                type="username"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

            
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between">
            {/* Tautan ke halaman registrasi */}
            <Link href="/register">
              <button type="button" className="text-indigo-600 hover:text-indigo-700">
                Register
              </button>
            </Link>
          </div>
      </div>
    </div>
    </ThemeProvider>
  );
}
