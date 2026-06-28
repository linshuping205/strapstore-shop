'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Upload, Globe, Mail, Type, Tag, ImageIcon, Loader2, CheckCircle } from 'lucide-react';

import { SiteSettings } from '@/types';

const DEFAULT_SETTINGS: SettingsForm = {
  siteTitle: 'Master Strap',
  tagline: 'Handcrafted Leather Watch Straps',
  adminEmail: 'hello@masterstrap.com',
  siteIcon: '',
};

export default function SettingsPage() {
  const [form, setForm] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setForm({
          siteTitle: data.siteTitle || DEFAULT_SETTINGS.siteTitle,
          tagline: data.tagline || DEFAULT_SETTINGS.tagline,
          adminEmail: data.adminEmail || DEFAULT_SETTINGS.adminEmail,
          siteIcon: data.siteIcon || DEFAULT_SETTINGS.siteIcon,
        });
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error('Failed to save settings:', e);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    setUploading(true);
    try {
      const filename = `site-icon-${Date.now()}-${file.name}`;
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: 'POST',
        body: file,
      });
      const data = await res.json();
      if (data.url) {
        setForm((prev) => ({ ...prev, siteIcon: data.url }));
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (e) {
      console.error('Upload error:', e);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your site identity and contact information</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saved ? (
            <CheckCircle size={16} />
          ) : (
            <Save size={16} />
          )}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Site Icon */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <ImageIcon size={16} className="text-amber-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Site Icon</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            This icon appears in the browser tab and bookmarks. Recommended size: 32x32 or 64x64 pixels.
          </p>
          <div className="flex items-center gap-4">
            {form.siteIcon ? (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img src={form.siteIcon} alt="Site icon" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                <ImageIcon size={24} className="text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
                <Upload size={16} />
                {uploading ? 'Uploading...' : 'Upload Icon'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
              {form.siteIcon && (
                <button
                  onClick={() => setForm((prev) => ({ ...prev, siteIcon: '' }))}
                  className="ml-2 text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Site Title */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Type size={16} className="text-amber-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Site Title</h2>
          </div>
          <p className="text-sm text-gray-500 mb-3">
            The name of your site. This appears in the header, browser tab, and SEO metadata.
          </p>
          <input
            type="text"
            value={form.siteTitle}
            onChange={(e) => setForm((prev) => ({ ...prev, siteTitle: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
            placeholder="Master Strap"
          />
        </div>

        {/* Tagline */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Tag size={16} className="text-amber-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Tagline</h2>
          </div>
          <p className="text-sm text-gray-500 mb-3">
            A short description that appears below your site title in the header and SEO descriptions.
          </p>
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => setForm((prev) => ({ ...prev, tagline: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
            placeholder="Handcrafted Leather Watch Straps"
          />
        </div>

        {/* Admin Email */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Mail size={16} className="text-amber-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Administration Email Address</h2>
          </div>
          <p className="text-sm text-gray-500 mb-3">
            The primary contact email for your site. This is used for customer inquiries and system notifications.
          </p>
          <input
            type="email"
            value={form.adminEmail}
            onChange={(e) => setForm((prev) => ({ ...prev, adminEmail: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
            placeholder="hello@masterstrap.com"
          />
        </div>
      </div>
    </div>
  );
}
