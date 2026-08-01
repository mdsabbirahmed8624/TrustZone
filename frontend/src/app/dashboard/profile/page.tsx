'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { 
  User, 
  MapPin, 
  Trash2, 
  Download, 
  Trash, 
  Plus, 
  Upload,
  CheckCircle2
} from 'lucide-react';

export default function ProfileSettings() {
  const { user, updateProfile, exportUserData, deleteAccount } = useAuth();
  const [fields, setFields] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  const [addresses, setAddresses] = useState(user?.savedAddresses || []);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'Home', address: '' });

  const [avatar, setAvatar] = useState<string | null>(null);
  const [marketingEmail, setMarketingEmail] = useState(true);
  const [analyticsDecline, setAnalyticsDecline] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      firstName: fields.firstName,
      lastName: fields.lastName,
      phone: fields.phone
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAddr.address) {
      const updated = [
        ...addresses,
        {
          id: `addr-${Math.floor(Math.random() * 1000)}`,
          label: newAddr.label,
          address: newAddr.address
        }
      ];
      setAddresses(updated);
      updateProfile({ savedAddresses: updated });
      setNewAddr({ label: 'Home', address: '' });
      setShowAddressForm(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    updateProfile({ savedAddresses: updated });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        updateProfile({ avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-foreground">Profile & Account</h1>
        <p className="text-sm text-muted-foreground">Manage profile picture, delivery addresses, and data exports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left column: Picture & GDPR */}
        <div className="space-y-8 lg:col-span-1">
          {/* Picture Upload card */}
          <div className="glass border border-border p-6 rounded-2xl bg-card/40 text-center space-y-4">
            <h4 className="font-extrabold text-sm text-foreground text-left uppercase tracking-wider border-b border-border pb-2">Profile Avatar</h4>
            
            <div className="relative h-28 w-28 mx-auto group">
              {avatar || user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={avatar || user?.avatarUrl || ''} 
                  alt="Profile Avatar Preview" 
                  className="h-full w-full rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-2xl border border-primary/20">
                  {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
                </div>
              )}
              <label 
                htmlFor="avatarInput"
                className="absolute inset-0 bg-slate-950/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold"
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </label>
              <input 
                id="avatarInput"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            
            <span className="text-[10px] text-muted-foreground block leading-tight">
              PNG/JPG up to 2MB. Drag & drop or click avatar to change.
            </span>
          </div>

          {/* GDPR Options card */}
          <div className="glass border border-border p-6 rounded-2xl bg-card/40 space-y-4">
            <h4 className="font-extrabold text-sm text-foreground uppercase tracking-wider border-b border-border pb-2">Data Privacy & GDPR</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Under Bangladesh Data Protection regulations and compliance rules, you hold full rights to export or wipe your portal logs.
            </p>
            <div className="space-y-3 pt-2 text-xs">
              <button
                onClick={exportUserData}
                className="w-full flex items-center justify-center gap-2 border border-border hover:bg-secondary/80 py-2.5 rounded-lg font-bold text-foreground transition-all"
              >
                <Download className="h-4 w-4" />
                Export My Data (JSON)
              </button>
              <button
                onClick={deleteAccount}
                className="w-full flex items-center justify-center gap-2 border border-red-500/20 hover:bg-red-500/10 py-2.5 rounded-lg font-bold text-red-500 transition-all"
              >
                <Trash className="h-4 w-4" />
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Right column: General Info & Addresses */}
        <div className="space-y-8 lg:col-span-2">
          {/* General info form */}
          <div className="glass border border-border p-6 sm:p-8 rounded-2xl bg-card/40 space-y-6">
            <h4 className="font-extrabold text-sm text-foreground uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              General Contact Info
            </h4>

            <form onSubmit={handleSaveInfo} className="space-y-5 text-xs">
              {savedSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Profile changes saved successfully.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground" htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={fields.firstName}
                    onChange={(e) => setFields({ ...fields, firstName: e.target.value })}
                    className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground" htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={fields.lastName}
                    onChange={(e) => setFields({ ...fields, lastName: e.target.value })}
                    className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground" htmlFor="email">Email (Cannot Change)</label>
                  <input
                    id="email"
                    type="email"
                    disabled
                    value={user?.email}
                    className="w-full bg-secondary/50 border border-border px-3.5 py-2.5 rounded-lg text-sm text-muted-foreground cursor-not-allowed focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground" htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={fields.phone}
                    onChange={(e) => setFields({ ...fields, phone: e.target.value })}
                    className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Privacy Toggles */}
              <div className="border-t border-border pt-4 space-y-3">
                <h5 className="font-extrabold text-foreground text-xs uppercase tracking-wider">Privacy & Communications</h5>
                <div className="flex items-center gap-3">
                  <input
                    id="marketingEmail"
                    type="checkbox"
                    checked={marketingEmail}
                    onChange={(e) => setMarketingEmail(e.target.checked)}
                    className="h-4 w-4 text-primary bg-secondary border-border rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <label htmlFor="marketingEmail" className="font-semibold text-muted-foreground text-xs cursor-pointer">
                    Receive repair logs & newsletter alerts via email
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="analyticsDecline"
                    type="checkbox"
                    checked={analyticsDecline}
                    onChange={(e) => setAnalyticsDecline(e.target.checked)}
                    className="h-4 w-4 text-primary bg-secondary border-border rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <label htmlFor="analyticsDecline" className="font-semibold text-muted-foreground text-xs cursor-pointer">
                    Limit analytical hardware telemetry logging
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-6 py-3 rounded-lg text-sm shadow-md transition-all"
              >
                Save Profile Details
              </button>
            </form>
          </div>

          {/* Addresses list */}
          <div className="glass border border-border p-6 sm:p-8 rounded-2xl bg-card/40 space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h4 className="font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Saved Delivery Addresses
              </h4>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-primary hover:text-accent font-bold text-xs flex items-center gap-1 focus:outline-none"
              >
                <Plus className="h-4 w-4" />
                New Address
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="glass p-4 rounded-xl border border-border/80 bg-secondary/20 space-y-4 text-xs animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 space-y-1.5">
                    <label className="font-bold text-muted-foreground" htmlFor="addrLabel">Label</label>
                    <select
                      id="addrLabel"
                      value={newAddr.label}
                      onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                      className="w-full bg-secondary border border-border px-3.5 py-2 rounded-lg text-sm text-foreground focus:outline-none"
                    >
                      <option>Home</option>
                      <option>Office</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="font-bold text-muted-foreground" htmlFor="addrFull">Street Address</label>
                    <input
                      id="addrFull"
                      type="text"
                      required
                      placeholder="Street, area, building..."
                      value={newAddr.address}
                      onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                      className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 text-xs">
                  <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 hover:bg-secondary rounded">Cancel</button>
                  <button type="submit" className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-4 py-2 rounded">Save Address</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr.id} className="flex justify-between items-start gap-4 p-4 rounded-xl border border-border/60 bg-secondary/10 text-xs">
                  <div>
                    <span className="font-bold text-foreground block">{addr.label} Address</span>
                    <p className="text-muted-foreground leading-relaxed mt-0.5">{addr.address}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-1.5 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors focus:outline-none"
                    title="Delete Address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
