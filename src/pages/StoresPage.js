import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Search, Edit, Trash2, Plus } from 'lucide-react';
import Modal from '../components/Modal';

const StoresPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.user_metadata?.role === 'admin';

    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [form, setForm] = useState({ name: '', location: '', manager: '', phone: '' });
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);

    useEffect(() => {
        const fetchStores = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                setStores(data || []);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStores();
    }, []);

    const filteredStores = useMemo(() => {
        if (!searchTerm) return stores;
        return stores.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.location && s.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.manager && s.manager.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, stores]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setForm({ name: '', location: '', manager: '', phone: '' });
        setEditingId(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.location) {
            setError("Nama Toko dan Lokasi wajib diisi.");
            return;
        }
        try {
            let data, error;
            if (editingId) {
                ({ data, error } = await supabase.from('stores').update(form).eq('id', editingId).select().single());
                if (!error) setStores(stores.map(s => (s.id === editingId ? data : s)));
            } else {
                ({ data, error } = await supabase.from('stores').insert(form).select().single());
                 if (!error) setStores([data, ...stores]);
            }
            if (error) throw error;
            resetForm();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEditClick = (store) => {
        setEditingId(store.id);
        setForm({ name: store.name, location: store.location || '', manager: store.manager || '', phone: store.phone || '' });
    };

    const openDeleteModal = (id) => {
        setIdToDelete(id);
        setIsModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const { error } = await supabase.from('stores').delete().eq('id', idToDelete);
            if (error) throw error;
            setStores(stores.filter(s => s.id !== idToDelete));
        } catch (error) {
            setError(error.message);
        } finally {
            setIsModalOpen(false);
            setIdToDelete(null);
        }
    };

    return (
        <>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleDeleteConfirm} title="Konfirmasi Penghapusan" message="Apakah Anda yakin ingin menghapus data toko ini?" />
            <div className="p-6 space-y-6">
                <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'w-full'} gap-6`}>
                    {isAdmin && (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-fit">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Plus className="w-5 h-5 mr-2" />
                                {editingId ? 'Edit Toko' : 'Tambah Toko Baru'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input name="name" value={form.name} onChange={handleFormChange} placeholder="Nama Toko" className="w-full p-2 border rounded-md" required />
                                <input name="location" value={form.location} onChange={handleFormChange} placeholder="Lokasi (e.g., Jakarta Pusat)" className="w-full p-2 border rounded-md" required />
                                <input name="manager" value={form.manager} onChange={handleFormChange} placeholder="Nama Manager" className="w-full p-2 border rounded-md" />
                                <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="No. Telepon Toko" className="w-full p-2 border rounded-md" />
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
                                <h3 className="text-lg font-semibold text-gray-800">Daftar Toko</h3>
                                <div className="relative w-full md:w-1/2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="text" placeholder="Cari toko..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                {loading ? <p className="text-center p-4">Memuat data...</p> : (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50">
                                            <tr className="border-b">
                                                <th className="p-3 font-medium text-gray-600">Nama Toko</th>
                                                <th className="p-3 font-medium text-gray-600">Lokasi</th>
                                                <th className="p-3 font-medium text-gray-600">Manager</th>
                                                <th className="p-3 font-medium text-gray-600">Telepon</th>
                                                {isAdmin && <th className="p-3 font-medium text-gray-600">Aksi</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStores.map(s => (
                                                <tr key={s.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3 font-medium text-gray-800">{s.name}</td>
                                                    <td className="p-3">{s.location}</td>
                                                    <td className="p-3">{s.manager}</td>
                                                    <td className="p-3">{s.phone}</td>
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

export default StoresPage;