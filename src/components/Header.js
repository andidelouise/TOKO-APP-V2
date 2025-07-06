import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Menu, LogOut } from 'lucide-react';

const Header = ({ currentPage, setIsSidebarOpen }) => {
    const { user, signOut } = useAuth();

    // Mengubah currentPage menjadi judul yang lebih rapi (misal: 'dashboard' -> 'Dashboard')
    const pageTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

    // Mendapatkan nama pengguna dari metadata, atau email jika nama tidak ada
    const userName = user?.user_metadata?.name || user?.email;

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6"> {/* Mengurangi padding di layar kecil */}
            <div className="flex items-center">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden text-gray-600 hover:text-gray-800 mr-3"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{pageTitle}</h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
                {/* --- PERBAIKAN ADA DI SINI --- */}
                {/* Div ini sekarang selalu flex, tidak lagi disembunyikan */}
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {/* Ambil huruf pertama dari nama pengguna */}
                        {userName?.charAt(0).toUpperCase()}
                    </div>
                    {/* Teks nama dan role disembunyikan di layar SANGAT kecil, dan muncul di layar kecil ke atas */}
                    <div className="hidden sm:block text-sm">
                        <div className="font-medium text-gray-800 truncate">{userName}</div>
                        <div className="text-gray-500 capitalize">{user?.user_metadata?.role || 'Pengguna'}</div>
                    </div>
                </div>
                {/* --- AKHIR PERBAIKAN --- */}

                <button
                    onClick={signOut}
                    className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
                    title="Keluar"
                >
                    <LogOut className="w-5 h-5" />
                    {/* Teks "Keluar" juga disembunyikan di mobile untuk menghemat ruang */}
                    <span className="ml-2 hidden sm:inline">Keluar</span>
                </button>
            </div>
        </header>
    );
};

export default Header;