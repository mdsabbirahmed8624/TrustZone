'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { 
  Smartphone, 
  Trash, 
  CheckCircle2,
  LockKeyhole,
  Info
} from 'lucide-react';

export default function SecuritySettings() {
  const { sessions, logoutAll, revokeSession, deleteAccount } = useAuth();
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (passwords.newPass !== passwords.confirm) {
      setError('New passwords do not match.');
      return;
    }

    if (passwords.newPass.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSuccess(true);
    setPasswords({ current: '', newPass: '', confirm: '' });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-foreground">Security Settings</h1>
        <p className="text-sm text-muted-foreground">Manage active device logins, passwords, and security options.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Password update */}
        <div className="glass border border-border p-6 sm:p-8 rounded-2xl bg-card/40 lg:col-span-2 space-y-6">
          <h4 className="font-extrabold text-sm text-foreground uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
            <LockKeyhole className="h-4 w-4 text-primary" />
            Update Account Password
          </h4>

          <form onSubmit={handleUpdatePassword} className="space-y-5 text-xs">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-xs font-semibold flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Password updated successfully.</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-bold text-muted-foreground" htmlFor="currPass">Current Password</label>
              <input
                id="currPass"
                type="password"
                required
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground" htmlFor="newPass">New Password</label>
                <input
                  id="newPass"
                  type="password"
                  required
                  value={passwords.newPass}
                  onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                  className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground" htmlFor="confirmPass">Confirm New Password</label>
                <input
                  id="confirmPass"
                  type="password"
                  required
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-6 py-3 rounded-lg text-sm shadow-md transition-all"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Right Column: Active Devices */}
        <div className="space-y-8 lg:col-span-1">
          <div className="glass border border-border p-6 rounded-2xl bg-card/40 space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h4 className="font-extrabold text-sm text-foreground uppercase tracking-wider">Active Devices</h4>
              {sessions.length > 1 && (
                <button
                  onClick={logoutAll}
                  className="text-red-500 hover:text-red-600 font-bold text-[10px] uppercase tracking-wider focus:outline-none"
                >
                  Kill All
                </button>
              )}
            </div>

            <div className="space-y-4 pt-1">
              {sessions.map((sess) => (
                <div key={sess.id} className="flex justify-between items-start gap-4 text-xs border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Smartphone className="h-4 w-4 text-primary shrink-0" />
                      {sess.device}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">IP: {sess.ip}</span>
                    <span className="text-[9px] text-muted-foreground/60 block">{sess.date}</span>
                  </div>
                  {sessions.length > 1 && (
                    <button
                      onClick={() => revokeSession(sess.id)}
                      className="text-muted-foreground hover:text-red-500 text-[10px] font-bold mt-1"
                      title="Revoke session"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delete account trigger */}
          <div className="glass border border-red-500/10 p-6 rounded-2xl bg-card/40 space-y-4">
            <h4 className="font-extrabold text-sm text-red-500 uppercase tracking-wider border-b border-border/40 pb-2">Danger Zone</h4>
            
            {showDeleteConfirm ? (
              <div className="space-y-3 text-xs">
                <p className="text-muted-foreground leading-relaxed">
                  Are you absolutely sure? This clears all diagnostics history, parts guarantees, and device logs instantly.
                </p>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 bg-secondary text-foreground rounded font-semibold">Cancel</button>
                  <button onClick={deleteAccount} className="px-3 py-1.5 bg-red-600 text-white rounded font-bold hover:bg-red-700">Yes, Wipe Account</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 border border-red-500/20 hover:bg-red-500/10 py-2.5 rounded-lg text-xs font-bold text-red-500 transition-all"
              >
                <Trash className="h-4 w-4" />
                Request Account Deletion
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
