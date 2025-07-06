import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, TrendingDown, BarChart3, AlertTriangle } from 'lucide-react';

// Kita bisa definisikan StatCard di sini lagi atau impor dari file terpisah
const StatCard = ({ title, value, icon, color, formatAsCurrency = false }) => {
    const Icon = icon;
    const formattedValue = formatAsCurrency ? `Rp ${Number(value).toLocaleString()}` : value;
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${color}-100`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
            </div>
        </div>
    );
};

const ReportsPage = () => {
    const [products, setProducts] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportData = async () => {
            setLoading(true);
            try {
                const { data: productsData, error: pError } = await supabase.from('products').select('*');
                if (pError) throw pError;

                const { data: sales, error: sError } = await supabase.from('sales').select('*').order('created_at');
                if (sError) throw sError;

                setProducts(productsData);
                setSalesData(sales.map(d => ({ ...d, sales: d.sales_amount, profit: d.profit_amount })));
            } catch (error) {
                console.error("Error fetching report data:", error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, []);

    // Memoized calculations for performance
    const reportStats = useMemo(() => {
        if (products.length === 0) {
            return { inventoryValue: 0, lowStockCount: 0, avgPrice: 0, lowStockProducts: [], categoryStock: [] };
        }

        const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
        const lowStockProducts = products.filter(p => p.stock < 30);
        const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;

        const categoryData = products.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + product.stock;
            return acc;
        }, {});

        const categoryStock = Object.entries(categoryData).map(([category, stock]) => ({ category, stock }));

        return {
            inventoryValue,
            lowStockCount: lowStockProducts.length,
            avgPrice,
            lowStockProducts,
            categoryStock
        };
    }, [products]);

    if (loading) {
        return <div className="p-6 text-center">Memuat data laporan...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Kartu Statistik Laporan */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Nilai Inventori" value={reportStats.inventoryValue} icon={Package} color="blue" formatAsCurrency />
                <StatCard title="Produk Stok Menipis (<30)" value={reportStats.lowStockCount} icon={TrendingDown} color="red" />
                <StatCard title="Rata-rata Harga Barang" value={reportStats.avgPrice} icon={BarChart3} color="green" formatAsCurrency />
            </div>

            {/* Grafik */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Stok per Kategori</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportStats.categoryStock}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="stock" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Tren Penjualan</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString()}`} />
                            <Line type="monotone" dataKey="sales" name="Penjualan" stroke="#8B5CF6" strokeWidth={2} />
                            <Line type="monotone" dataKey="profit" name="Keuntungan" stroke="#10B981" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tabel Peringatan Stok Menipis */}
            {reportStats.lowStockProducts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-red-200">
                    <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Peringatan Stok Menipis
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-red-50">
                                <tr className="border-b border-red-200">
                                    <th className="p-3 font-medium text-gray-600 text-left">Nama Barang</th>
                                    <th className="p-3 font-medium text-gray-600 text-left">Kategori</th>
                                    <th className="p-3 font-medium text-gray-600 text-left">Stok Tersisa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportStats.lowStockProducts.map((product) => (
                                    <tr key={product.id} className="border-b border-gray-100 hover:bg-red-50">
                                        <td className="p-3 font-medium text-gray-800">{product.name}</td>
                                        <td className="p-3 text-gray-600">{product.category}</td>
                                        <td className="p-3 font-bold text-red-600">{product.stock}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;