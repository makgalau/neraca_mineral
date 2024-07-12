import React, { useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };
  

  const handleUpload = async () => {
    if (!file) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:4000/upload_enc', {
            method: 'POST',
            body: formData,
            headers: { Authorization: `Bearer ${token}` }
        });
      

      const result = await response.json();
      setMessage(result.message || 'File uploaded successfully');
    } catch (error) {
      setMessage('Error uploading file');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Upload and Encrypt File</h1>
        <input type="file" onChange={handleFileChange} className="mb-4" />
        <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
          Upload
        </button>
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
};

export default Home;
