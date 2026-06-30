'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tag, Plus, X, Check, Loader2, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount: number | null;
  maxDiscount: number | null;
  endDate: string | null;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minAmount: '',
    maxDiscount: '',
    endDate: '',
    maxUses: '',
    isActive: true,
  });

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('admin-auth');
      const res = await fetch('/api/admin/coupons', {
        headers: { 'x-admin-auth': token || '' },
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data || []);
      } else {
        setError(data.error || 'Failed to load coupons');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const resetForm = () => {
    setForm({
      code: '',
      type: 'percentage',
      value: '',
      minAmount: '',
      maxDiscount: '',
      endDate: '',
      maxUses: '',
      isActive: true,
    });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || form.code.trim().length < 3) {
      alert('Code must be at least 3 characters');
      return;
    }
    if (!form.value || parseFloat(form.value) <= 0) {
      alert('Valid value is required');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('admin-auth');
      const body = editing
        ? { id: editing.id, ...form, value: parseFloat(form.value) }
        : { ...form, value: parseFloat(form.value) };
      const res = await fetch('/api/admin/coupons', {
        method: editing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-auth': token || '',
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        resetForm();
        loadCoupons();
      } else {
        alert(data.error || 'Failed to save coupon');
      }
    } catch (e) {
      alert('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      const token = localStorage.getItem('admin-auth');
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-auth': token || '' },
      });
      if (res.ok) {
        loadCoupons();
      } else {
        alert('Failed to delete');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    try {
      const token = localStorage.getItem('admin-auth');
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-auth': token || '',
        },
        body: JSON.stringify({ id: coupon.id, isActive: !coupon.isActive }),
      });
      if (res.ok) {
        loadCoupons();
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const startEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minAmount: coupon.minAmount ? String(coupon.minAmount) : '',
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
      endDate: coupon.endDate ? coupon.endDate.slice(0, 10) : '',
      maxUses: coupon.maxUses ? String(coupon.maxUses) : '',
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  if (loading && coupons.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Tag className="w-6 h-6 text-amber-600" />
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Add Coupon'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editing ? 'Edit Coupon' : 'Create Coupon'}
          </h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="SUMMER2024"
                required
                minLength={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value {form.type === 'percentage' ? '(% off)' : '($ off)'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder={form.type === 'percentage' ? '20' : '10'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.minAmount}
                onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="Optional (for % coupons)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses (0 = unlimited)</label>
              <input
                type="number"
                min="0"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="0"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editing ? 'Update Coupon' : 'Create Coupon'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {coupons.length === 0 ? (
        <div className="text-center py-20">
          <Tag size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-lg">No coupons yet.</p>
          <p className="text-gray-400 text-sm mt-2">Create your first coupon to start promotions.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Code</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600">Value</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600">Used</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Expires</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <span className="font-mono font-medium text-gray-900">{c.code}</span>
                      {c.minAmount && (
                        <p className="text-xs text-gray-500">Min: ${Number(c.minAmount).toFixed(2)}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {c.type === 'percentage' ? 'Percentage' : 'Fixed'}
                      {c.maxDiscount && c.type === 'percentage' && (
                        <p className="text-xs text-gray-500">Max: ${Number(c.maxDiscount).toFixed(2)}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">
                      {c.type === 'percentage' ? `${c.value}%` : `$${Number(c.value).toFixed(2)}`}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-700">
                      {c.maxUses > 0 ? `${c.usedCount} / ${c.maxUses}` : `${c.usedCount}`}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {c.endDate ? new Date(c.endDate).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                      }`}>
                        {c.isActive ? <Check size={12} /> : <X size={12} />}
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(c)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          title={c.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {c.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={() => startEdit(c)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
