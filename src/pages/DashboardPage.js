import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Package, Truck, Store, TrendingUp } from 'lucide-react';

// Komponen Kartu Statistik
const StatCard = ({ title, value, icon, color }) => {
    const Icon = icon;
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${color}-100`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
            </div>
        </div>
    );
};

const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ products: 0, suppliers: 0, stores: 0, totalStock: 0 });
    const [salesData, setSalesData] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const userName = user?.user_metadata?.name || user?.email;
    const userRole = user?.user_metadata?.role || 'Pengguna';
    const capitalizedRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Ambil data secara paralel
                const [
                    { count: productsCount, error: pError },
                    { count: suppliersCount, error: supError },
                    { count: storesCount, error: stoError },
                    // --- PERBAIKAN DI SINI ---
                    // Ambil data produk terbaru, dan ambil nama kategori dari tabel 'categories'
                    { data: recentProductsData, error: recentProductsError },
                    { data: allProducts, error: allProductsError }, // Query baru untuk menghitung total stok
                    { data: sales, error: salesError }
                ] = await Promise.all([
                    supabase.from('products').select('*', { count: 'exact', head: true }),
                    supabase.from('suppliers').select('*', { count: 'exact', head: true }),
                    supabase.from('stores').select('*', { count: 'exact', head: true }),
                    supabase.from('products').select('name, price, stock, categories(name)').order('created_at', { ascending: false }).limit(5),
                    supabase.from('products').select('stock'), // Hanya butuh kolom stok untuk kalkulasi
                    supabase.from('sales').select('*').order('created_at', { ascending: true })
                ]);

                // Cek jika ada error pada salah satu query
                if (pError || supError || stoError || recentProductsError || allProductsError || salesError) {
                    console.error({ pError, supError, stoError, recentProductsError, allProductsError, salesError });
                    throw new Error("Gagal mengambil sebagian atau seluruh data dashboard.");
                }

                // Hitung total stok dari semua produk
                const totalStock = allProducts.reduce((sum, product) => sum + product.stock, 0);

                setStats({
                    products: productsCount,
                    suppliers: suppliersCount,
                    stores: storesCount,
                    totalStock: totalStock,
                });

                setRecentProducts(recentProductsData);
                setSalesData(sales.map(d => ({ ...d, sales: d.sales_amount, profit: d.profit_amount })));

            } catch (error) {
                console.error("Error fetching dashboard data:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="p-6 text-center">Memuat data dashboard...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Kartu Sambutan */}
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">
                    Selamat Datang, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{userName}!</span>
                </h2>
                <p className="mt-1 text-md text-gray-500">
                    Anda login sebagai: <strong>{capitalizedRole}</strong>
                </p>
            </div>

            {/* Kartu Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Barang" value={stats.products} icon={Package} color="blue" />
                <StatCard title="Total Stok Barang" value={stats.totalStock} icon={TrendingUp} color="green" />
                <StatCard title="Total Supplier" value={stats.suppliers} icon={Truck} color="purple" />
                <StatCard title="Total Toko" value={stats.stores} icon={Store} color="orange" />
            </div>

            {/* Grafik */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Penjualan Bulanan</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString()}`} />
                            <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Keuntungan Bulanan</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString()}`} />
                            <Bar dataKey="profit" fill="#8B5CF6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tabel Barang Terbaru */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Barang Terbaru</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Nama Barang</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Harga</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Stok</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Kategori</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentProducts.map((product, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-800">{product.name}</td>
                                    <td className="py-3 px-4 text-gray-600">Rp {product.price.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-gray-600">{product.stock}</td>
                                    {/* --- PERBAIKAN DI SINI --- */}
                                    {/* Tampilkan nama kategori dari data relasi */}
                                    <td className="py-3 px-4 text-gray-600">{product.categories?.name || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;