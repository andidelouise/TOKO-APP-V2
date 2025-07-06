import React from 'react';
import { Home, Package, Truck, Store, FileText, X, Bookmark } from 'lucide-react'; // Tambahkan Bookmark

const Sidebar = ({ currentPage, setCurrentPage, isSidebarOpen, setIsSidebarOpen }) => {
    // Daftar menu yang akan ditampilkan
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'products', label: 'Data Barang', icon: Package },
        { id: 'categories', label: 'Data Kategori', icon: Bookmark }, // <-- TAMBAHKAN INI
        { id: 'suppliers', label: 'Data Supplier', icon: Truck },
        { id: 'stores', label: 'Data Toko', icon: Store },
        { id: 'reports', label: 'Laporan', icon: FileText },
    ];

    return (
        <div
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 lg:static lg:inset-0`}
        >
            <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="flex items-center">
                    <Store className="w-8 h-8 text-white mr-3" />
                    <span className="text-xl font-bold text-white">Toko Modern</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden text-white hover:text-gray-200"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <nav className="mt-6">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                setCurrentPage(item.id);
                                setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center px-6 py-3 text-left text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                                currentPage === item.id ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600 font-semibold' : ''
                            }`}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default Sidebar;