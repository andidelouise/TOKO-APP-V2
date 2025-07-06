import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext'; // 1. Impor useAuth
import { Search, Edit, Trash2, Plus } from 'lucide-react';
import Modal from '../components/Modal';

const ProductsPage = () => {
    const { user } = useAuth(); // 2. Dapatkan data user
    const isAdmin = user?.user_metadata?.role === 'admin'; // 3. Cek rolenya

    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [productForm, setProductForm] = useState({ name: '', price: '', stock: '', category_id: '', supplier_id: '' });
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productIdToDelete, setProductIdToDelete] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [
                    { data: productsData, error: productsError },
                    { data: suppliersData, error: suppliersError },
                    { data: categoriesData, error: categoriesError }
                ] = await Promise.all([
                    supabase.from('products').select(`*, suppliers(name), categories(name)`).order('created_at', { ascending: false }),
                    supabase.from('suppliers').select('id, name'),
                    supabase.from('categories').select('id, name')
                ]);

                if (productsError || suppliersError || categoriesError) throw new Error("Gagal memuat data.");

                setProducts(productsData || []);
                setSuppliers(suppliersData || []);
                setCategories(categoriesData || []);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.categories && p.categories.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.suppliers && p.suppliers.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, products]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setProductForm(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setProductForm({ name: '', price: '', stock: '', category_id: '', supplier_id: '' });
        setEditingId(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!productForm.name || !productForm.price || !productForm.supplier_id || !productForm.category_id) {
            setError("Semua field wajib diisi.");
            return;
        }
        try {
            let data, error;
            const productData = { ...productForm, price: parseFloat(productForm.price), stock: parseInt(productForm.stock, 10) || 0 };
            if (editingId) {
                ({ data, error } = await supabase.from('products').update(productData).eq('id', editingId).select('*, suppliers(name), categories(name)').single());
                if (!error) setProducts(products.map(p => (p.id === editingId ? data : p)));
            } else {
                ({ data, error } = await supabase.from('products').insert(productData).select('*, suppliers(name), categories(name)').single());
                 if (!error) setProducts([data, ...products]);
            }
            if (error) throw error;
            resetForm();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEditClick = (product) => {
        setEditingId(product.id);
        setProductForm({ name: product.name, price: product.price, stock: product.stock, category_id: product.category_id, supplier_id: product.supplier_id });
    };

    const openDeleteModal = (id) => {
        setProductIdToDelete(id);
        setIsModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const { error } = await supabase.from('products').delete().eq('id', productIdToDelete);
            if (error) throw error;
            setProducts(products.filter(p => p.id !== productIdToDelete));
        } catch (error) {
            setError(error.message);
        } finally {
            setIsModalOpen(false);
            setProductIdToDelete(null);
        }
    };

    return (
        <>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleDeleteConfirm} title="Konfirmasi Penghapusan" message="Apakah Anda yakin ingin menghapus produk ini?" />
            <div className="p-6 space-y-6">
                <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'w-full'} gap-6`}>
                    {isAdmin && (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-fit">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Plus className="w-5 h-5 mr-2" />
                                {editingId ? 'Edit Barang' : 'Tambah Barang Baru'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input name="name" value={productForm.name} onChange={handleFormChange} placeholder="Nama Barang" className="w-full p-2 border rounded-md" required />
                                <input name="price" type="number" value={productForm.price} onChange={handleFormChange} placeholder="Harga" className="w-full p-2 border rounded-md" required />
                                <input name="stock" type="number" value={productForm.stock} onChange={handleFormChange} placeholder="Stok" className="w-full p-2 border rounded-md" required />
                                <select name="category_id" value={productForm.category_id} onChange={handleFormChange} className="w-full p-2 border rounded-md" required>
                                    <option value="">Pilih Kategori</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <select name="supplier_id" value={productForm.supplier_id} onChange={handleFormChange} className="w-full p-2 border rounded-md" required>
                                    <option value="">Pilih Supplier</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                <div className="flex space-x-2">
                                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 font-semibold">{editingId ? 'Update Barang' : 'Simpan Barang'}</button>
                                    {editingId && <button type="button" onClick={resetForm} className="w-full bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600">Batal</button>}
                                </div>
                            </form>
                        </div>
                    )}
                    <div className={isAdmin ? 'lg:col-span-2' : 'col-span-1'}>
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                                <h3 className="text-lg font-semibold text-gray-800">Daftar Barang</h3>
                                <div className="relative w-full md:w-1/2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="text" placeholder="Cari barang..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                {loading ? <p className="text-center p-4">Memuat data...</p> : (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50">
                                            <tr className="border-b">
                                                <th className="p-3 font-medium text-gray-600">Nama</th>
                                                <th className="p-3 font-medium text-gray-600">Kategori</th>
                                                <th className="p-3 font-medium text-gray-600">Harga</th>
                                                <th className="p-3 font-medium text-gray-600">Stok</th>
                                                <th className="p-3 font-medium text-gray-600">Supplier</th>
                                                {isAdmin && <th className="p-3 font-medium text-gray-600">Aksi</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProducts.map(p => (
                                                <tr key={p.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3 font-medium text-gray-800">{p.name}</td>
                                                    <td className="p-3 text-gray-600">{p.categories?.name || 'N/A'}</td>
                                                    <td className="p-3 text-gray-600">Rp {Number(p.price).toLocaleString()}</td>
                                                    <td className="p-3 text-gray-600">{p.stock}</td>
                                                    <td className="p-3 text-gray-600">{p.suppliers?.name || 'N/A'}</td>
                                                    {isAdmin && (
                                                        <td className="p-3 flex space-x-3">
                                                            <button onClick={() => handleEditClick(p)} className="text-blue-600 hover:text-blue-800" title="Edit"><Edit size={18} /></button>
                                                            <button onClick={() => openDeleteModal(p.id)} className="text-red-600 hover:text-red-800" title="Hapus"><Trash2 size={18} /></button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductsPage;