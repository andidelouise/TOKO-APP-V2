import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Store } from 'lucide-react';

const LoginPage = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('pengguna');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        const { error } = await signIn({ email, password });

        if (error) {
            setError(error.message);
        }
        setLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        const { error } = await signUp({
            email,
            password,
            options: {
                data: {
                    name: name,
                    role: role,
                }
            }
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
                <div className="text-center mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Store className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                        Toko App
                    </h1>
                    <p className="text-gray-400 mt-2">Sistem Manajemen Toko Terpadu</p>
                </div>

                <div className="flex mb-6 bg-gray-700 rounded-lg p-1">
                    <button onClick={() => { setIsLoginMode(true); setError(''); setMessage(''); }} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${isLoginMode ? 'bg-gray-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                        Masuk
                    </button>
                    <button onClick={() => { setIsLoginMode(false); setError(''); setMessage(''); }} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${!isLoginMode ? 'bg-gray-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                        Daftar
                    </button>
                </div>

                {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}
                {message && <p className="text-green-500 text-center text-sm mb-4">{message}</p>}

                {isLoginMode ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50">
                            {loading ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Nama Lengkap</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500" placeholder="Minimal 6 karakter" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500">
                                <option value="pengguna">Pengguna</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50">
                            {loading ? 'Memproses...' : 'Daftar'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoginPage;