import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Search, Edit, Trash2, Plus } from 'lucide-react';
import Modal from '../components/Modal';

const SuppliersPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.user_metadata?.role === 'admin';

    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [form, setForm] = useState({ name: '', contact: '', address: '', email: '' });
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);

    useEffect(() => {
        const fetchSuppliers = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase.from('suppliers').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                setSuppliers(data || []);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSuppliers();
    }, []);

    const filteredSuppliers = useMemo(() => {
        if (!searchTerm) return suppliers;
        return suppliers.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.address && s.address.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, suppliers]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setForm({ name: '', contact: '', address: '', email: '' });
        setEditingId(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email) {
            setError("Nama dan Email wajib diisi.");
            return;
        }
        try {
            let data, error;
            if (editingId) {
                ({ data, error } = await supabase.from('suppliers').update(form).eq('id', editingId).select().single());
                if (!error) setSuppliers(suppliers.map(s => (s.id === editingId ? data : s)));
            } else {
                ({ data, error } = await supabase.from('suppliers').insert(form).select().single());
                 if (!error) setSuppliers([data, ...suppliers]);
            }
            if (error) throw error;
            resetForm();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEditClick = (supplier) => {
        setEditingId(supplier.id);
        setForm({ name: supplier.name, contact: supplier.contact || '', address: supplier.address || '', email: supplier.email || '' });
    };

    const openDeleteModal = (id) => {
        setIdToDelete(id);
        setIsModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const { error } = await supabase.from('suppliers').delete().eq('id', idToDelete);
            if (error) throw error;
            setSuppliers(suppliers.filter(s => s.id !== idToDelete));
        } catch (error) {
            setError(error.message);
        } finally {
            setIsModalOpen(false);
            setIdToDelete(null);
        }
    };

    return (
        <>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleDeleteConfirm} title="Konfirmasi Penghapusan" message="Apakah Anda yakin ingin menghapus supplier ini?" />
            <div className="p-6 space-y-6">
                <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'w-full'} gap-6`}>
                    {isAdmin && (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-fit">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Plus className="w-5 h-5 mr-2" />
                                {editingId ? 'Edit Supplier' : 'Tambah Supplier Baru'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input name="name" value={form.name} onChange={handleFormChange} placeholder="Nama Supplier" className="w-full p-2 border rounded-md" required />
                                <input name="contact" value={form.contact} onChange={handleFormChange} placeholder="Kontak (No. HP)" className="w-full p-2 border rounded-md" />
                                <input name="address" value={form.address} onChange={handleFormChange} placeholder="Alamat" className="w-full p-2 border rounded-md" />
                                <input name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="Email" className="w-full p-2 border rounded-md" required />
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                <div className="flex space-x-2">
                                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 font-semibold">{editingId ? 'Update' : 'Simpan'}</button>
                                    {editingId && <button type="button" onClick={resetForm} className="w-full bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600">Batal</button>}
                                </div>
                            </form>
                        </div>
                    )}
                    <div className={isAdmin ? 'lg:col-span-2' : 'col-span-1'}>
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                                <h3 className="text-lg font-semibold text-gray-800">Daftar Supplier</h3>
                                <div className="relative w-full md:w-1/2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="text" placeholder="Cari supplier..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                {loading ? <p className="text-center p-4">Memuat data...</p> : (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50">
                                            <tr className="border-b">
                                                <th className="p-3 font-medium text-gray-600">Nama</th>
                                                <th className="p-3 font-medium text-gray-600">Kontak</th>
                                                <th className="p-3 font-medium text-gray-600">Alamat</th>
                                                <th className="p-3 font-medium text-gray-600">Email</th>
                                                {isAdmin && <th className="p-3 font-medium text-gray-600">Aksi</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSuppliers.map(s => (
                                                <tr key={s.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3 font-medium text-gray-800">{s.name}</td>
                                                    <td className="p-3">{s.contact}</td>
                                                    <td className="p-3">{s.address}</td>
                                                    <td className="p-3">{s.email}</td>
                                                    {isAdmin && (
                                                        <td className="p-3 flex space-x-3">
                                                            <button onClick={() => handleEditClick(s)} className="text-blue-600 hover:text-blue-800" title="Edit"><Edit size={18} /></button>
                                                            <button onClick={() => openDeleteModal(s.id)} className="text-red-600 hover:text-red-800" title="Hapus"><Trash2 size={18} /></button>
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

export default SuppliersPage;