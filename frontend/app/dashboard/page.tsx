'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [inbox, setInbox] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      fetchInbox(parsed.username);
    }
  }, []);

  const fetchInbox = async (username: string) => {
    const res = await axios.get(`http://localhost:1000/api/inbox/${username}`);
    setInbox(res.data.files);
  };

  const handleUpload = async () => {
    if (!files.length || recipients.length === 0) return;

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sender', user.username);
      formData.append('recipients', JSON.stringify(recipients));
      formData.append('description', description);

      try {
        await axios.post('http://localhost:1000/api/upload', formData, {
          onUploadProgress: (e) => {
            setUploadProgress(Math.round((e.loaded * 100) / (e.total || 1)));
          }
        });
        toast.success(`Uploaded: ${file.name}`);
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploadProgress(0);
    setDescription('');
    setFiles([]);
    fetchInbox(user.username);
  };

  const handleRecipientToggle = (name: string) => {
    setRecipients(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:1000/api/file/${id}`);
      toast.info('File deleted');
      fetchInbox(user.username);
    } catch {
      toast.error('Failed to delete file');
    }
  };

  const filteredInbox = inbox.filter(file =>
    file.fileName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <ToastContainer />
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full text-sm uppercase">
              {user?.username?.charAt(0)}
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.username}</h1>
          </div>
          <button
            className="text-sm text-red-500 border border-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white"
            onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </div>

        {/* Upload Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">📤 Send Files</h2>

          <input
            type="file"
            multiple
            accept="image/*,video/*,application/pdf"
            onChange={e => setFiles(e.target.files ? Array.from(e.target.files) : [])}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
          />

          <input
            type="text"
            placeholder="Optional description..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
          />

          <div className="flex flex-wrap gap-4 mb-3">
            {['user1', 'user2', 'user3', 'user4', 'user5', 'user6'].map(name => (
              name !== user?.username && (
                <label key={name} className="flex items-center space-x-2 text-gray-700">
                  <input
                    type="checkbox"
                    value={name}
                    checked={recipients.includes(name)}
                    onChange={() => handleRecipientToggle(name)}
                  />
                  <span>{name}</span>
                </label>
              )
            ))}
          </div>

          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          )}

          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Send
          </button>
        </section>

        <hr className="mb-6" />

        {/* Inbox */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">📥 Your Inbox</h2>
          </div>

          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
          />

          {filteredInbox.length === 0 ? (
            <p className="text-gray-500">No files found.</p>
          ) : (
            <ul className="space-y-4">
              {filteredInbox.map(file => {
                const isImage = file.fileName.match(/\.(jpg|jpeg|png|gif)$/i);
                const isVideo = file.fileName.match(/\.(mp4|mov|avi|webm)$/i);
                const isPdf = file.fileName.match(/\.pdf$/i);
                const sizeMB = (file.size || 0) / (1024 * 1024);
                const uploadDate = new Date(file.uploadedAt).toLocaleString();

                return (
                  <li key={file._id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-md border border-gray-200 shadow-sm">
                    <div className="w-16 h-16 flex-shrink-0">
                      {isImage ? (
                        <img
                          src={`http://localhost:1000/${file.filePath}`}
                          alt="preview"
                          className="w-full h-full object-cover rounded"
                        />
                      ) : isVideo ? (
                        <span className="text-3xl">🎬</span>
                      ) : isPdf ? (
                        <span className="text-3xl">📄</span>
                      ) : (
                        <span className="text-3xl">📁</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        <strong className="text-blue-600">{file.sender}</strong> sent:{" "}
                        <a
                          href={`http://localhost:1000/${file.filePath}`}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-blue-800"
                        >
                          {file.fileName}
                        </a>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">📅 {uploadDate} · 📁 {sizeMB.toFixed(2)} MB</p>
                      {file.description && (
                        <p className="text-sm text-gray-600 italic mt-1">💬 {file.description}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(file._id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      🗑️ Delete
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
