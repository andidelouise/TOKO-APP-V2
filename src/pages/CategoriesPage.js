import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Search, Edit, Trash2, Plus } from 'lucide-react';
import Modal from '../components/Modal';

const CategoriesPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.user_metadata?.role === 'admin';

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [form, setForm] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
                if (error) throw error;
                setCategories(data || []);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const filteredCategories = useMemo(() => {
        if (!searchTerm) return categories;
        return categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, categories]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setForm({ name: '', description: '' });
        setEditingId(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name) {
            setError("Nama kategori wajib diisi.");
            return;
        }
        try {
            let data, error;
            if (editingId) {
                ({ data, error } = await supabase.from('categories').update(form).eq('id', editingId).select().single());
                if (!error) setCategories(categories.map(c => (c.id === editingId ? data : c)));
            } else {
                ({ data, error } = await supabase.from('categories').insert(form).select().single());
                 if (!error) setCategories([data, ...categories].sort((a, b) => a.name.localeCompare(b.name)));
            }
            if (error) throw error;
            resetForm();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEditClick = (category) => {
        setEditingId(category.id);
        setForm({ name: category.name, description: category.description || '' });
    };

    const openDeleteModal = (id) => {
        setIdToDelete(id);
        setIsModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const { error } = await supabase.from('categories').delete().eq('id', idToDelete);
            if (error) throw error;
            setCategories(categories.filter(c => c.id !== idToDelete));
        } catch (error) {
            setError(error.message);
        } finally {
            setIsModalOpen(false);
            setIdToDelete(null);
        }
    };

    return (
        <>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleDeleteConfirm} title="Konfirmasi Penghapusan" message="Apakah Anda yakin ingin menghapus kategori ini?" />
            <div className="p-6 space-y-6">
                <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'w-full'} gap-6`}>
                    {isAdmin && (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-fit">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Plus className="w-5 h-5 mr-2" />
                                {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input name="name" value={form.name} onChange={handleFormChange} placeholder="Nama Kategori" className="w-full p-2 border rounded-md" required />
                                <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Deskripsi (opsional)" className="w-full p-2 border rounded-md" rows="3"></textarea>
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
                                <h3 className="text-lg font-semibold text-gray-800">Daftar Kategori</h3>
                                <div className="relative w-full md:w-1/2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="text" placeholder="Cari kategori..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                {loading ? <p className="text-center p-4">Memuat data...</p> : (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50">
                                            <tr className="border-b">
                                                <th className="p-3 font-medium text-gray-600">Nama Kategori</th>
                                                <th className="p-3 font-medium text-gray-600">Deskripsi</th>
                                                {isAdmin && <th className="p-3 font-medium text-gray-600">Aksi</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCategories.map(c => (
                                                <tr key={c.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3 font-medium text-gray-800">{c.name}</td>
                                                    <td className="p-3 text-gray-600">{c.description}</td>
                                                    {isAdmin && (
                                                        <td className="p-3 flex space-x-3">
                                                            <button onClick={() => handleEditClick(c)} className="text-blue-600 hover:text-blue-800" title="Edit"><Edit size={18} /></button>
                                                            <button onClick={() => openDeleteModal(c.id)} className="text-red-600 hover:text-red-800" title="Hapus"><Trash2 size={18} /></button>
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

export default CategoriesPage;