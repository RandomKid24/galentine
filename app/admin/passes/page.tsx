'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Pass } from '@/app/lib/types';
import { Plus, Edit2, Trash2, Upload, X } from 'lucide-react';

export default function PassesPage() {
    const [passes, setPasses] = useState<Pass[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPass, setEditingPass] = useState<Pass | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        description: '',
        total_seats: '',
        max_people: '1',
        emoji: '🎫',
        upi_id: '',
        qr_code_base64: '',
        is_active: true,
        is_early_bird: false,
        display_order: '0'
    });

    useEffect(() => {
        fetchPasses();
    }, []);

    const fetchPasses = async () => {
        try {
            const { data, error } = await supabase
                .from('passes')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) {
                console.warn('Passes table not found. Please run the SQL migration.');
                setPasses([]);
            } else {
                setPasses(data || []);
            }
        } catch (error) {
            console.error('Error fetching passes:', error);
            setPasses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setFormData(prev => ({ ...prev, qr_code_base64: base64String }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const passData = {
            title: formData.title,
            price: parseFloat(formData.price),
            description: formData.description || null,
            total_seats: formData.total_seats ? parseInt(formData.total_seats) : 0,
            max_people: parseInt(formData.max_people),
            emoji: formData.emoji,
            upi_id: formData.upi_id || null,
            qr_code_base64: formData.qr_code_base64 || null,
            is_active: formData.is_active,
            is_early_bird: formData.is_early_bird,
            display_order: parseInt(formData.display_order),
            updated_at: new Date().toISOString()
        };

        try {
            if (editingPass) {
                const { error } = await supabase
                    .from('passes')
                    .update(passData)
                    .eq('id', editingPass.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('passes')
                    .insert([passData]);

                if (error) throw error;
            }

            await fetchPasses();
            closeModal();
        } catch (error) {
            console.error('Error saving pass:', error);
            alert('Failed to save pass. Please try again.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this pass?')) return;

        try {
            const { error } = await supabase
                .from('passes')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchPasses();
        } catch (error) {
            console.error('Error deleting pass:', error);
            alert('Failed to delete pass. Please try again.');
        }
    };

    const openModal = (pass?: Pass) => {
        if (pass) {
            setEditingPass(pass);
            setFormData({
                title: pass.title,
                price: pass.price.toString(),
                description: pass.description || '',
                total_seats: pass.total_seats.toString(),
                max_people: pass.max_people.toString(),
                emoji: pass.emoji,
                upi_id: pass.upi_id || '',
                qr_code_base64: pass.qr_code_base64 || '',
                is_active: pass.is_active,
                is_early_bird: pass.is_early_bird,
                display_order: pass.display_order.toString()
            });
        } else {
            setEditingPass(null);
            setFormData({
                title: '',
                price: '',
                description: '',
                total_seats: '',
                max_people: '1',
                emoji: '🎫',
                upi_id: '',
                qr_code_base64: '',
                is_active: true,
                is_early_bird: false,
                display_order: passes.length.toString()
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPass(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-rose-50 border-t-[#80183b] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Passes</h1>
                    <p className="text-sm text-gray-600 mt-1">Create and manage event passes</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#80183b] text-white rounded-lg hover:bg-[#60122c] transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Pass
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {passes.map((pass) => (
                    <div
                        key={pass.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{pass.emoji}</span>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{pass.title}</h3>
                                    <p className="text-sm text-gray-500">₹{pass.price.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openModal(pass)}
                                    className="p-1 text-gray-600 hover:text-[#80183b] transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(pass.id)}
                                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {pass.description && (
                            <p className="text-sm text-gray-600 mb-2">{pass.description}</p>
                        )}

                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 rounded">
                                {pass.total_seats} seats
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded">
                                Max {pass.max_people} people
                            </span>
                            <span className={`px-2 py-1 rounded ${pass.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {pass.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        {pass.qr_code_base64 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <img
                                    src={pass.qr_code_base64}
                                    alt="QR Code"
                                    className="w-20 h-20 object-contain"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>


            {passes.length === 0 && (
                <div className="text-center py-12 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg border-2 border-dashed border-rose-200">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="text-4xl">🎫</div>
                        <h3 className="text-lg font-semibold text-gray-900">No Passes Found</h3>
                        <p className="text-sm text-gray-600">
                            The passes table may not exist yet. Please run the SQL migration first.
                        </p>
                        <div className="bg-white rounded-lg p-4 text-left">
                            <p className="text-xs font-semibold text-gray-700 mb-2">Quick Setup:</p>
                            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                                <li>Go to your Supabase Dashboard → SQL Editor</li>
                                <li>Copy the SQL from <code className="bg-gray-100 px-1 rounded">database.sql</code> (lines 58-87)</li>
                                <li>Run the SQL to create the passes table</li>
                                <li>Click "Add Pass" to create your first pass</li>
                            </ol>
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="mt-4 px-6 py-2 bg-[#80183b] text-white rounded-lg hover:bg-[#60122c] transition-colors text-sm font-medium"
                        >
                            Try Adding a Pass Anyway
                        </button>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingPass ? 'Edit Pass' : 'Create New Pass'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80183b] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Emoji
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.emoji}
                                        onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80183b] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80183b] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total Seats (Optional)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.total_seats}
                                        onChange={(e) => setFormData({ ...formData, total_seats: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80183b] focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Max People per Pass <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.max_people}
                                        onChange={(e) => setFormData({ ...formData, max_people: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80183b] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.display_order}
                                        onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80183b] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80183b] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    UPI ID
                                </label>
                                <input
                                    type="text"
                                    value={formData.upi_id}
                                    onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                                    placeholder="example@upi"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80183b] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    QR Code Image
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80183b] focus:border-transparent"
                                    />
                                    {formData.qr_code_base64 && (
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={formData.qr_code_base64}
                                                alt="QR Preview"
                                                className="w-24 h-24 object-contain border border-gray-200 rounded"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, qr_code_base64: '' })}
                                                className="text-sm text-red-600 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4 text-[#80183b] border-gray-300 rounded focus:ring-[#80183b]"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                        Active (visible to users)
                                    </label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_early_bird"
                                        checked={formData.is_early_bird}
                                        onChange={(e) => setFormData({ ...formData, is_early_bird: e.target.checked })}
                                        className="w-4 h-4 text-[#80183b] border-gray-300 rounded focus:ring-[#80183b]"
                                    />
                                    <label htmlFor="is_early_bird" className="text-sm font-medium text-gray-700">
                                        Early Bird Pass (uses dedicated 15-seat pool)
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#80183b] text-white rounded-lg hover:bg-[#60122c] transition-colors font-medium"
                                >
                                    {editingPass ? 'Update Pass' : 'Create Pass'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
