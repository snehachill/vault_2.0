"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getUserProfile,
  saveAllChanges,
  changePassword,
} from "@/app/actions/userActions";

// ─── TOAST ───────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (message, type) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };
  return {
    toasts,
    toast: {
      success: (m) => add(m, "success"),
      error:   (m) => add(m, "error"),
      info:    (m) => add(m, "info"),
    },
  };
}

function Toaster({ toasts }) {
  const cfg = {
    success: { bg: "#f0fdf4", border: "#86efac", dot: "#16a34a", text: "#14532d" },
    error:   { bg: "#fef2f2", border: "#fca5a5", dot: "#dc2626", text: "#7f1d1d" },
    info:    { bg: "#f0fdf4", border: "#86efac", dot: "#15803d", text: "#14532d" },
  };
  return (
    <div className="fixed top-5 right-5 z-[200] flex flex-col gap-2.5 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const c = cfg[t.type];
          return (
            <motion.div key={t.id}
              initial={{ opacity: 0, x: 64, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 64, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border pointer-events-auto min-w-[260px]"
              style={{ background: c.bg, borderColor: c.border, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.dot }} />
              <span className="text-sm font-semibold" style={{ color: c.text, fontFamily: "'Outfit', sans-serif" }}>
                {t.message}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ─── UTILS ───────────────────────────────────────────────────────────────────
function fmtDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDateTime(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const PROGRAMS = [
  "B.E. Computer Engineering", "B.E. Information Technology",
  "B.E. Electronics & Telecommunication", "B.E. Mechanical Engineering",
  "B.E. Civil Engineering", "B.Tech Computer Science",
  "B.Sc. Computer Science", "MCA", "M.Tech", "Other",
];
const NAV = [
  { id: "profile",  label: "Profile",  icon: "👤" },
  { id: "academic", label: "Academic", icon: "🎓" },
  { id: "account",  label: "Account",  icon: "◆"  },
  { id: "security", label: "Security", icon: "🔒" },
];

// ─── ATOMS ───────────────────────────────────────────────────────────────────
function GInput({ value, onChange, placeholder, type = "text", disabled, right }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <div className="rounded-xl border-2 transition-all duration-150"
        style={{
          background:  disabled ? "#f3f4f1" : "#fff",
          borderColor: focused  ? "#166534" : "#e2e8e2",
          boxShadow:   focused  ? "0 0 0 3px rgba(22,101,52,0.1)" : "none",
        }}>
        <input type={type} value={value} onChange={onChange}
          placeholder={placeholder} disabled={disabled}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full px-4 py-3 text-sm font-medium bg-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[#adb8ad]"
          style={{ color: "#1a2e1a", fontFamily: "'Outfit', sans-serif", paddingRight: right ? "3.5rem" : "1rem" }} />
      </div>
      {right && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
  );
}

function GSelect({ value, onChange, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="rounded-xl border-2 transition-all duration-150"
      style={{
        background:  "#fff",
        borderColor: focused ? "#166534" : "#e2e8e2",
        boxShadow:   focused ? "0 0 0 3px rgba(22,101,52,0.1)" : "none",
      }}>
      <select value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="w-full px-4 py-3 text-sm font-medium bg-transparent outline-none appearance-none cursor-pointer"
        style={{ color: "#1a2e1a", fontFamily: "'Outfit', sans-serif" }}>
        {children}
      </select>
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-semibold mb-2 uppercase tracking-[0.1em]"
      style={{ color: "#6b7a6b", fontFamily: "'Outfit', sans-serif" }}>
      {children}{required && <span style={{ color: "#dc2626" }} className="ml-1">*</span>}
    </label>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
      {hint && <p className="mt-1.5 text-[11px]" style={{ color: "#9aaa9a", fontFamily: "'Outfit', sans-serif" }}>{hint}</p>}
    </div>
  );
}

function GBadge({ children, color = "gray" }) {
  const map = {
    gray:   { bg: "#f3f4f1", border: "#e2e8e2", color: "#4a5a4a" },
    green:  { bg: "#f0fdf4", border: "#86efac", color: "#14532d" },
    amber:  { bg: "#fefce8", border: "#fde68a", color: "#78350f" },
    red:    { bg: "#fef2f2", border: "#fca5a5", color: "#7f1d1d" },
    forest: { bg: "#14532d", border: "#166534", color: "#f0fdf4" },
  };
  const s = map[color] || map.gray;
  return (
    <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full border"
      style={{ background: s.bg, borderColor: s.border, color: s.color, fontFamily: "'Outfit', sans-serif" }}>
      {children}
    </span>
  );
}

function Avatar({ name, pfpUrl, size = 80, onClick }) {
  const initials = (name || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
      onClick={onClick} className="relative cursor-pointer shrink-0" style={{ width: size, height: size }}>
      <div className="w-full h-full rounded-2xl overflow-hidden border-2"
        style={{ borderColor: "#86efac", boxShadow: "0 4px 20px rgba(22,101,52,0.15)" }}>
        {pfpUrl
          ? <img src={pfpUrl} alt="avatar" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center font-black text-white"
              style={{ fontSize: size * 0.32, background: "linear-gradient(145deg, #14532d, #166534)" }}>
              {initials}
            </div>}
      </div>
      <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
        style={{ background: "rgba(20,83,45,0.6)" }}>
        <span className="text-white text-xs font-bold">Edit</span>
      </div>
      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white"
        style={{ background: "#22c55e" }} />
    </motion.div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${className}`}
      style={{ background: "#fff", borderColor: "#e2e8e2", boxShadow: "0 2px 16px rgba(22,101,52,0.06)" }}>
      {children}
    </div>
  );
}

function CardHead({ title, icon }) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-4 border-b-2" style={{ borderColor: "#f0f4f0", background: "#fafcfa" }}>
      {icon && <span className="text-base">{icon}</span>}
      <h2 className="font-bold text-sm" style={{ color: "#1a2e1a", fontFamily: "'Outfit', sans-serif" }}>{title}</h2>
    </div>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: "#f3f4f1" }}>
      <span className="text-xs font-medium" style={{ color: "#8a9a8a" }}>{label}</span>
      <span className="text-xs font-semibold" style={{ color: "#1a2e1a", fontFamily: "'Outfit', sans-serif" }}>{value}</span>
    </div>
  );
}

// ─── PASSWORD MODAL ───────────────────────────────────────────────────────────
function PwModal({ onClose, toast }) {
  const [form, setForm] = useState({ cur: "", nxt: "", cfm: "" });
  const [show, setShow] = useState({ cur: false, nxt: false, cfm: false });
  const [loading, setLoading] = useState(false);

  const strength = form.nxt.length === 0 ? 0 : form.nxt.length < 6 ? 1 : form.nxt.length < 10 ? 2 : form.nxt.length < 14 ? 3 : 4;
  const sLabel = ["", "Too short", "Weak", "Good", "Strong"];
  const sColor = ["", "#dc2626", "#f97316", "#eab308", "#16a34a"];

  const EyeBtn = ({ k }) => (
    <button type="button" onClick={() => setShow((p) => ({ ...p, [k]: !p[k] }))} style={{ color: "#9aaa9a" }}>
      {show[k]
        ? <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
        : <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>}
    </button>
  );

  async function submit() {
    if (!form.cur || !form.nxt || !form.cfm) { toast.error("All fields are required"); return; }
    if (form.nxt.length < 8)                 { toast.error("Password must be at least 8 characters"); return; }
    if (form.nxt !== form.cfm)               { toast.error("New passwords don't match"); return; }
    setLoading(true);
    const res = await changePassword({ currentPassword: form.cur, newPassword: form.nxt });
    setLoading(false);
    if (res.success) { toast.success("Password updated successfully!"); onClose(); }
    else             { toast.error(res.error || "Something went wrong"); }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(20,83,45,0.35)", backdropFilter: "blur(12px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9, y: 24 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 24 }} transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full max-w-[400px] rounded-3xl border-2 overflow-hidden"
        style={{ background: "#fff", borderColor: "#86efac", boxShadow: "0 32px 80px rgba(20,83,45,0.2)" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b-2" style={{ borderColor: "#f0f4f0", background: "#fafcfa" }}>
          <div>
            <h3 className="font-bold text-base" style={{ color: "#1a2e1a", fontFamily: "'Outfit', sans-serif" }}>Change Password</h3>
            <p className="text-xs mt-0.5" style={{ color: "#9aaa9a" }}>Keep your account secure</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[#f0f4f0] transition-colors text-sm" style={{ color: "#9aaa9a" }}>✕</button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          {[
            { k: "cur", label: "Current Password", ph: "Enter current password" },
            { k: "nxt", label: "New Password",     ph: "At least 8 characters"  },
            { k: "cfm", label: "Confirm Password", ph: "Repeat new password"    },
          ].map(({ k, label, ph }) => (
            <div key={k}>
              <Field label={label}>
                <GInput type={show[k] ? "text" : "password"} value={form[k]} placeholder={ph}
                  onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))}
                  right={<EyeBtn k={k} />} />
              </Field>
              {k === "nxt" && form.nxt.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="h-1.5 flex-1 rounded-full transition-all"
                        style={{ background: i <= strength ? sColor[strength] : "#e2e8e2" }} />
                    ))}
                  </div>
                  <p className="text-[11px] font-semibold" style={{ color: sColor[strength] }}>{sLabel[strength]}</p>
                </div>
              )}
              {k === "cfm" && form.cfm.length > 0 && (
                <p className="text-[11px] mt-1.5 font-semibold"
                  style={{ color: form.nxt === form.cfm ? "#16a34a" : "#dc2626" }}>
                  {form.nxt === form.cfm ? "✓ Passwords match" : "✗ Passwords don't match"}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold border-2 hover:bg-[#f0f4f0] transition-all"
            style={{ color: "#4a5a4a", borderColor: "#e2e8e2" }}>Cancel</button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={submit} disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #14532d, #166534)" }}>
            {loading
              ? <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                  className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Updating…</>
              : "Update Password"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { toasts, toast } = useToast();

  const [dbUser,   setDbUser]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [fetchErr, setFetchErr] = useState(null);
  const [form,     setForm]     = useState({
    name: "", pfp_url: "", university: "", program: "", specialization: "", semester: 1,
  });
  const [dirty,  setDirty]  = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab,    setTab]    = useState("profile");
  const [showPw, setShowPw] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getUserProfile();
      if (res.success) {
        setDbUser(res.data);
        setForm({
          name:           res.data.name          ?? "",
          pfp_url:        res.data.pfp_url        ?? "",
          university:     res.data.university     ?? "",
          program:        res.data.program        ?? "",
          specialization: res.data.specialization ?? "",
          semester:       res.data.semester       ?? 1,
        });
      } else {
        setFetchErr(res.error);
        toast.error(res.error || "Failed to load profile");
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (f) => (e) => { setForm((p) => ({ ...p, [f]: e.target.value })); setDirty(true); };
  const setPfp   = (url)     => { setForm((p) => ({ ...p, pfp_url: url }));         setDirty(true); };

  async function save() {
    if (!form.name.trim())       { toast.error("Name cannot be empty");    return; }
    if (!form.university.trim()) { toast.error("University is required");  return; }
    setSaving(true);
    const res = await saveAllChanges(form);
    setSaving(false);
    if (res.success) { setDbUser((p) => ({ ...p, ...form })); setDirty(false); toast.success("Profile saved ✓"); }
    else             { toast.error(res.error || "Save failed"); }
  }

  function discard() {
    if (!dbUser) return;
    setForm({
      name: dbUser.name ?? "", pfp_url: dbUser.pfp_url ?? "",
      university: dbUser.university ?? "", program: dbUser.program ?? "",
      specialization: dbUser.specialization ?? "", semester: dbUser.semester ?? 1,
    });
    setDirty(false); toast.info("Changes discarded");
  }

  function copyRef() {
    navigator.clipboard?.writeText(`https://vaultpapers.app/join?ref=${dbUser?.referralCode}`).catch(() => {});
    setCopied(true); toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2500);
  }

  function pickFile(e) {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    const r = new FileReader();
    r.onload = () => { setPfp(r.result); toast.success("Photo updated — save to apply!"); };
    r.readAsDataURL(f);
  }

  const user = dbUser ? { ...dbUser, ...form } : null;

  const premiumExpiry   = user?.premiumExpiry ? new Date(user.premiumExpiry) : null;
  const isPremiumActive = user?.isPremium && premiumExpiry && premiumExpiry > new Date();
  const daysLeft        = premiumExpiry ? Math.max(0, Math.ceil((premiumExpiry - new Date()) / 86400000)) : null;

  // Completion (user-facing fields only)
  const completionItems = [
    { label: "Full Name",       done: !!form.name?.trim()          },
    { label: "Profile Photo",   done: !!form.pfp_url               },
    { label: "University",      done: !!form.university?.trim()     },
    { label: "Program",         done: !!form.program                },
    { label: "Specialization",  done: !!form.specialization?.trim() },
    { label: "Semester",        done: !!form.semester               },
  ];
  const completedCount  = completionItems.filter((d) => d.done).length;
  const completionPct   = Math.round((completedCount / completionItems.length) * 100);
  const R = 22, C = 2 * Math.PI * R;

  // ── Loading ──
  if (loading) return (
    <div className="w-full min-h-[60vh] flex items-center justify-center" style={{ background: "#f7faf7" }}>
      <div className="flex flex-col items-center gap-3">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
          className="w-9 h-9 rounded-full border-4"
          style={{ borderColor: "#e2e8e2", borderTopColor: "#166534" }} />
        <p className="text-sm font-medium" style={{ color: "#9aaa9a", fontFamily: "'Outfit', sans-serif" }}>Loading your profile…</p>
      </div>
    </div>
  );

  if (fetchErr && !user) return (
    <div className="w-full min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-3xl mb-3">🌿</p>
        <p className="font-bold text-lg" style={{ color: "#1a2e1a" }}>Couldn't load your profile</p>
        <p className="text-sm mt-1" style={{ color: "#9aaa9a" }}>{fetchErr}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen" style={{ background: "#f7faf7", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;}
        ::selection{background:#bbf7d0;}
        select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%239aaa9a'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;background-size:16px;padding-right:40px!important;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#c6d4c6;border-radius:99px;}
      `}</style>

      <Toaster toasts={toasts} />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />

      {/* ── UNSAVED BANNER ── */}
      <AnimatePresence>
        {dirty && (
          <motion.div initial={{ y: -52 }} animate={{ y: 0 }} exit={{ y: -52 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="fixed top-0 left-0 right-0 z-50"
            style={{ background: "linear-gradient(135deg, #14532d, #166534)", borderBottom: "2px solid #15803d" }}>
            <div className="max-w-5xl mx-auto h-[52px] flex items-center justify-between px-6">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
                <span className="text-sm font-semibold text-white">You have unsaved changes</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={discard}
                  className="text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-white/10 transition-all"
                  style={{ color: "#86efac" }}>Discard</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={save} disabled={saving}
                  className="text-xs font-bold px-5 py-2 rounded-lg bg-white flex items-center gap-2 disabled:opacity-50"
                  style={{ color: "#14532d" }}>
                  {saving
                    ? <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                        className="inline-block w-3.5 h-3.5 border-2 border-green-200 border-t-green-700 rounded-full" />Saving…</>
                    : "Save Changes"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-5xl mx-auto px-5 py-8 pb-24">

        {/* ── HERO CARD ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="mb-6 rounded-3xl border-2 overflow-hidden"
          style={{ background: "#fff", borderColor: "#e2e8e2", boxShadow: "0 4px 24px rgba(22,101,52,0.08)" }}>

          {/* Cover */}
          <div className="h-24 relative" style={{
            background: "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)",
            backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 60%)",
          }}>
            {/* Decorative dots */}
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          </div>

          {/* Profile info */}
          <div className="px-7 pb-6" style={{ background: "#fff" }}>
            <div className="flex items-end justify-between -mt-8 mb-4">
              <div className="p-1.5 rounded-2xl bg-white border-2" style={{ borderColor: "#e2e8e2" }}>
                <Avatar name={form.name} pfpUrl={form.pfp_url} size={72} onClick={() => fileRef.current?.click()} />
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-2 pb-1">
                {[
                  { label: "Coins",   value: user?.coinBalance ?? 0,                              icon: "🪙" },
                  { label: "Semester",value: user?.semester ? `Sem ${user.semester}` : "—",        icon: "📚" },
                  { label: "Plan",    value: user?.isPremium ? "Premium" : "Free",                 icon: user?.isPremium ? "👑" : "⭐" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-2xl border-2"
                    style={{ background: "#fafcfa", borderColor: "#e2e8e2" }}>
                    <span className="text-base leading-none">{s.icon}</span>
                    <span className="text-sm font-bold leading-tight" style={{ color: "#1a2e1a" }}>{s.value}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#9aaa9a" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-black truncate" style={{ color: "#1a2e1a" }}>{form.name || "Your Name"}</h1>
                <p className="text-sm mt-0.5" style={{ color: "#9aaa9a" }}>{user?.email}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  {user?.isPremium   && <GBadge color="amber">👑 Premium</GBadge>}
                  {user?.isOnboarded && <GBadge color="green">✓ Verified</GBadge>}
                  {form.program      && <GBadge color="gray">{form.program}</GBadge>}
                  {form.specialization && <GBadge color="gray">{form.specialization}</GBadge>}
                  <GBadge color="gray">Joined {fmtDate(user?.createdAt)}</GBadge>
                </div>
              </div>

              {/* Completion ring */}
              <div className="shrink-0 flex flex-col items-center gap-1.5">
                <div className="relative w-[56px] h-[56px]">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r={R} fill="none" stroke="#e2e8e2" strokeWidth="4" />
                    <motion.circle cx="28" cy="28" r={R} fill="none" stroke="#166534" strokeWidth="4"
                      strokeLinecap="round" strokeDasharray={C}
                      initial={{ strokeDashoffset: C }}
                      animate={{ strokeDashoffset: C * (1 - completionPct / 100) }}
                      transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[12px] font-black" style={{ color: "#1a2e1a" }}>{completionPct}%</span>
                  </div>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: "#9aaa9a" }}>Profile</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── NAV ── */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl border-2"
            style={{ background: "#fff", borderColor: "#e2e8e2" }}>
            {NAV.map((n) => (
              <button key={n.id} onClick={() => setTab(n.id)}
                className="relative px-5 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ color: tab === n.id ? "#fff" : "#6b7a6b" }}>
                {tab === n.id && (
                  <motion.div layoutId="navpill" className="absolute inset-0 rounded-xl"
                    style={{ background: "linear-gradient(135deg, #14532d, #166534)" }}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span>{n.icon}</span>
                  <span>{n.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENT GRID ── */}
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid gap-5"
            style={{ gridTemplateColumns: "1fr 1fr" }}>

            {/* ═══════════════ PROFILE TAB ═══════════════ */}
            {tab === "profile" && (
              <>
                {/* LEFT */}
                <Card>
                  <CardHead title="Personal Information" icon="👤" />
                  <div className="p-5 flex flex-col gap-5">
                    {/* Photo upload */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl border-2" style={{ borderColor: "#f0f4f0", background: "#fafcfa" }}>
                      <Avatar name={form.name} pfpUrl={form.pfp_url} size={56} onClick={() => fileRef.current?.click()} />
                      <div className="flex-1">
                        <p className="text-sm font-bold" style={{ color: "#1a2e1a" }}>Profile Photo</p>
                        <p className="text-xs mt-0.5 mb-3" style={{ color: "#9aaa9a" }}>JPG or PNG · max 5 MB</p>
                        <div className="flex items-center gap-2.5">
                          <motion.button whileTap={{ scale: 0.97 }} onClick={() => fileRef.current?.click()}
                            className="text-xs font-bold px-4 py-2 rounded-xl text-white"
                            style={{ background: "linear-gradient(135deg, #14532d, #166534)" }}>
                            Upload Photo
                          </motion.button>
                          {form.pfp_url && (
                            <button onClick={() => { setPfp(""); toast.info("Photo removed — save to apply"); }}
                              className="text-xs font-semibold" style={{ color: "#dc2626" }}>Remove</button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Name */}
                    <Field label="Full Name" required>
                      <GInput value={form.name} onChange={setField("name")} placeholder="Your full name" />
                    </Field>

                    {/* Email (read-only) */}
                    <Field label="Email Address" hint="Your email address cannot be changed. Contact support if needed.">
                      <GInput value={user?.email ?? ""} disabled
                        right={
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                            style={{ background: "#f0fdf4", color: "#14532d", border: "1px solid #86efac" }}>
                            Verified
                          </span>
                        } />
                    </Field>
                  </div>
                </Card>

                {/* RIGHT */}
                <div className="flex flex-col gap-5">
                  {/* Profile completion */}
                  <Card>
                    <CardHead title="Profile Completion" icon="📊" />
                    <div className="p-5">
                      <div className="flex items-center gap-4 mb-5 p-4 rounded-2xl"
                        style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "2px solid #86efac" }}>
                        <div className="relative w-[48px] h-[48px] shrink-0">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                            <circle cx="28" cy="28" r={R} fill="none" stroke="#bbf7d0" strokeWidth="5" />
                            <motion.circle cx="28" cy="28" r={R} fill="none" stroke="#16a34a" strokeWidth="5"
                              strokeLinecap="round" strokeDasharray={C}
                              initial={{ strokeDashoffset: C }}
                              animate={{ strokeDashoffset: C * (1 - completionPct / 100) }}
                              transition={{ duration: 1.2, delay: 0.3 }} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[11px] font-black" style={{ color: "#14532d" }}>{completionPct}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: "#14532d" }}>
                            {completionPct === 100 ? "Profile complete! 🎉" : `${completionItems.length - completedCount} field${completionItems.length - completedCount !== 1 ? "s" : ""} remaining`}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "#4ade80" }}>
                            {completedCount} of {completionItems.length} filled in
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0">
                        {completionItems.map((s, i) => (
                          <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0"
                            style={{ borderColor: "#f3f4f1" }}>
                            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black"
                              style={{ background: s.done ? "#14532d" : "#f0f4f0", color: s.done ? "#fff" : "#c6d4c6" }}>
                              {s.done ? "✓" : "·"}
                            </div>
                            <p className="text-xs font-semibold" style={{ color: s.done ? "#1a2e1a" : "#b0c0b0" }}>{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Account summary */}
                  <Card>
                    <CardHead title="Account Summary" icon="✦" />
                    <div className="px-5 py-2">
                      <DataRow label="Member since" value={fmtDate(user?.createdAt)} />
                      <DataRow label="Account type" value={user?.isPremium ? "Premium" : "Free"} />
                      <DataRow label="Coins balance" value={`${user?.coinBalance ?? 0} coins`} />
                    </div>
                  </Card>
                </div>
              </>
            )}

            {/* ═══════════════ ACADEMIC TAB ═══════════════ */}
            {tab === "academic" && (
              <>
                {/* LEFT — editable fields */}
                <Card>
                  <CardHead title="Academic Details" icon="🎓" />
                  <div className="p-5 flex flex-col gap-5">
                    <Field label="University / College" required>
                      <GInput value={form.university} onChange={setField("university")}
                        placeholder="e.g. Savitribai Phule Pune University" />
                    </Field>
                    <Field label="Program / Degree">
                      <GSelect value={form.program} onChange={setField("program")}>
                        <option value="">Select your program</option>
                        {PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </GSelect>
                    </Field>
                    <Field label="Specialization / Branch">
                      <GInput value={form.specialization} onChange={setField("specialization")}
                        placeholder="e.g. Artificial Intelligence, VLSI" />
                    </Field>
                    <Field label="Current Semester">
                      <GSelect value={form.semester}
                        onChange={(e) => { setForm((p) => ({ ...p, semester: Number(e.target.value) })); setDirty(true); }}>
                        {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
                      </GSelect>
                    </Field>
                  </div>
                </Card>

                {/* RIGHT — visual semester progress */}
                <Card>
                  <CardHead title="Semester Progress" icon="📅" />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-base font-bold" style={{ color: "#1a2e1a" }}>Semester {form.semester}</p>
                        <p className="text-xs" style={{ color: "#9aaa9a" }}>of 8 total semesters</p>
                      </div>
                      <GBadge color="green">{Math.round(((form.semester - 1) / 7) * 100)}% complete</GBadge>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-5">
                      <div className="h-2.5 rounded-full" style={{ background: "#e2e8e2" }}>
                        <motion.div className="h-full rounded-full"
                          style={{ background: "linear-gradient(90deg, #14532d, #16a34a)" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round(((form.semester - 1) / 7) * 100)}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }} />
                      </div>
                    </div>

                    {/* Semester grid */}
                    <div className="grid grid-cols-4 gap-2 mb-5">
                      {SEMESTERS.map((s) => (
                        <motion.div key={s} whileHover={{ scale: 1.08 }}
                          className="aspect-square rounded-2xl flex items-center justify-center text-sm font-black border-2 cursor-default"
                          style={{
                            background:  s < form.semester  ? "linear-gradient(135deg,#14532d,#166534)"
                                       : s === form.semester ? "linear-gradient(135deg,#166534,#15803d)"
                                       : "#fafcfa",
                            color:       s <= form.semester ? "#fff"    : "#c6d4c6",
                            borderColor: s === form.semester ? "#15803d" : s < form.semester ? "#14532d" : "#e2e8e2",
                            boxShadow:   s === form.semester ? "0 4px 16px rgba(22,101,52,0.3)" : "none",
                          }}>
                          {s}
                        </motion.div>
                      ))}
                    </div>

                    {/* Saved values */}
                    {(user?.university || user?.program || user?.specialization) && (
                      <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: "#e2e8e2" }}>
                        <div className="px-4 py-2.5 border-b-2" style={{ background: "#fafcfa", borderColor: "#e2e8e2" }}>
                          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#9aaa9a" }}>Current Info</p>
                        </div>
                        <div className="px-4 py-1">
                          {user?.university     && <DataRow label="University"      value={user.university} />}
                          {user?.program        && <DataRow label="Program"         value={user.program} />}
                          {user?.specialization && <DataRow label="Specialization"  value={user.specialization} />}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </>
            )}

            {/* ═══════════════ ACCOUNT TAB ═══════════════ */}
            {tab === "account" && (
              <>
                {/* LEFT */}
                <Card>
                  <CardHead title="Subscription" icon="◆" />
                  <div className="p-5 flex flex-col gap-4">
                    {/* Plan card */}
                    <div className="p-5 rounded-2xl border-2" style={{
                      background: user?.isPremium ? "linear-gradient(135deg, #f0fdf4, #dcfce7)" : "#fafcfa",
                      borderColor: user?.isPremium ? "#86efac" : "#e2e8e2",
                    }}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-lg font-black" style={{ color: "#1a2e1a" }}>
                            {user?.isPremium ? "👑 Premium Plan" : "Free Plan"}
                          </p>
                          {isPremiumActive && daysLeft !== null && (
                            <p className="text-xs font-semibold mt-1" style={{ color: "#16a34a" }}>
                              ✓ Active · {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
                            </p>
                          )}
                          {user?.isPremium && !isPremiumActive && (
                            <p className="text-xs font-semibold mt-1" style={{ color: "#dc2626" }}>✗ Subscription expired</p>
                          )}
                          {!user?.isPremium && (
                            <p className="text-xs mt-1" style={{ color: "#9aaa9a" }}>Unlock unlimited access</p>
                          )}
                        </div>
                        {user?.isPremium ? <GBadge color="amber">Active</GBadge> : <GBadge color="gray">Free</GBadge>}
                      </div>
                      {premiumExpiry && (
                        <p className="text-xs" style={{ color: "#6b7a6b" }}>
                          {user?.isPremium && isPremiumActive ? "Renews" : "Expired"}: {fmtDate(premiumExpiry)}
                        </p>
                      )}
                      {!user?.isPremium && (
                        <motion.button whileTap={{ scale: 0.98 }}
                          onClick={() => toast.info("Redirecting to checkout…")}
                          className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-white"
                          style={{ background: "linear-gradient(135deg, #14532d, #166534)" }}>
                          👑 Upgrade — ₹79/mo
                        </motion.button>
                      )}
                    </div>

                    {/* Coins */}
                    <div className="p-4 rounded-2xl border-2" style={{ borderColor: "#fde68a", background: "#fefce8" }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#78350f" }}>Coin Balance</p>
                          <p className="text-2xl font-black mt-1" style={{ color: "#1a2e1a" }}>
                            🪙 {user?.coinBalance ?? 0}
                          </p>
                        </div>
                        <motion.button whileTap={{ scale: 0.97 }}
                          onClick={() => toast.info("Earn more coins by uploading papers!")}
                          className="text-xs font-bold px-4 py-2 rounded-xl"
                          style={{ background: "#14532d", color: "#fff" }}>
                          Earn More
                        </motion.button>
                      </div>
                    </div>

                    {/* Member since */}
                    <div className="p-4 rounded-2xl border-2" style={{ borderColor: "#e2e8e2", background: "#fafcfa" }}>
                      <DataRow label="Member since" value={fmtDate(user?.createdAt)} />
                      <DataRow label="Login method"  value={user?.hashedPassword ? "Email & Password" : "Google / OAuth"} />
                    </div>
                  </div>
                </Card>

                {/* RIGHT — referral */}
                <Card>
                  <CardHead title="Referral Program" icon="🤝" />
                  <div className="p-5 flex flex-col gap-4">

                    {/* Referral code */}
                    <div className="p-5 rounded-2xl border-2" style={{ borderColor: "#86efac", background: "#f0fdf4" }}>
                      <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#166534" }}>Your Referral Code</p>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-black tracking-widest" style={{ color: "#1a2e1a" }}>
                          {user?.referralCode}
                        </p>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={copyRef}
                          className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
                          style={{ background: copied ? "#16a34a" : "linear-gradient(135deg, #14532d, #166534)" }}>
                          {copied ? "✓ Copied!" : "Copy Link"}
                        </motion.button>
                      </div>
                    </div>

                    {/* Referred by */}
                    <div className="p-4 rounded-2xl border-2" style={{ borderColor: "#e2e8e2", background: "#fafcfa" }}>
                      <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#9aaa9a" }}>Referred By</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold" style={{ color: "#1a2e1a" }}>
                          {user?.referredBy ? "You were referred by a friend" : "Not referred by anyone"}
                        </p>
                        {user?.referredBy ? <GBadge color="green">Referred</GBadge> : <GBadge color="gray">—</GBadge>}
                      </div>
                    </div>

                    {/* How it works */}
                    <div className="p-4 rounded-2xl border-2" style={{ borderColor: "#e2e8e2", background: "#fafcfa" }}>
                      <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9aaa9a" }}>How It Works</p>
                      {[
                        { icon: "🔗", text: "Share your unique referral link with friends" },
                        { icon: "🎓", text: "They sign up using your code" },
                        { icon: "🪙", text: "Both of you get +50 free coins!" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0" style={{ borderColor: "#f0f4f0" }}>
                          <span className="text-base shrink-0">{item.icon}</span>
                          <span className="text-xs font-medium" style={{ color: "#4a5a4a" }}>{item.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Full link */}
                    <div className="p-4 rounded-2xl border-2" style={{ borderColor: "#e2e8e2", background: "#fafcfa" }}>
                      <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#9aaa9a" }}>Your Referral Link</p>
                      <p className="text-xs font-medium break-all" style={{ color: "#6b7a6b" }}>
                        https://vaultpapers.app/join?ref={user?.referralCode}
                      </p>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* ═══════════════ SECURITY TAB ═══════════════ */}
            {tab === "security" && (
              <>
                {/* LEFT */}
                <Card>
                  <CardHead title="Password & Authentication" icon="🔒" />
                  <div className="p-5 flex flex-col gap-4">

                    {/* Password section */}
                    <div className="p-4 rounded-2xl border-2" style={{ borderColor: "#e2e8e2", background: "#fafcfa" }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold" style={{ color: "#1a2e1a" }}>
                            {user?.hashedPassword ? "Password is set" : "No password (OAuth login)"}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "#9aaa9a" }}>
                            {user?.hashedPassword ? "Last updated: unknown" : "You log in via Google or similar"}
                          </p>
                          <div className="mt-2">
                            {user?.hashedPassword ? <GBadge color="green">✓ Set</GBadge> : <GBadge color="gray">Not set</GBadge>}
                          </div>
                        </div>
                        <motion.button whileTap={{ scale: 0.97 }}
                          onClick={() => setShowPw(true)} disabled={!user?.hashedPassword}
                          className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ color: "#14532d", borderColor: "#86efac", background: "#f0fdf4" }}>
                          Change
                        </motion.button>
                      </div>
                    </div>

                    {/* Onboarding */}
                    <div className="p-4 rounded-2xl border-2" style={{ borderColor: "#e2e8e2", background: "#fafcfa" }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold" style={{ color: "#1a2e1a" }}>
                            {user?.isOnboarded ? "Account setup complete" : "Finish account setup"}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "#9aaa9a" }}>
                            {user?.isOnboarded ? "All onboarding steps done" : "Complete your profile to get started"}
                          </p>
                        </div>
                        {user?.isOnboarded ? <GBadge color="green">✓ Done</GBadge> : <GBadge color="amber">Pending</GBadge>}
                      </div>
                    </div>

                    {/* 2FA (coming soon) */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border-2"
                      style={{ borderColor: "#e2e8e2", background: "#fafcfa" }}>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#1a2e1a" }}>Two-Factor Authentication</p>
                        <p className="text-xs mt-0.5" style={{ color: "#9aaa9a" }}>Extra layer of security — coming soon</p>
                      </div>
                      <GBadge color="amber">Soon</GBadge>
                    </div>

                    {/* Security tips */}
                    <div className="p-4 rounded-2xl border-2" style={{ borderColor: "#e2e8e2", background: "#fafcfa" }}>
                      <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9aaa9a" }}>Security Tips</p>
                      {[
                        "Use a strong, unique password for your account",
                        "Never share your login credentials with anyone",
                        "Log out from devices you no longer use",
                      ].map((tip, i) => (
                        <div key={i} className="flex items-start gap-2.5 py-2 border-b last:border-0" style={{ borderColor: "#f0f4f0" }}>
                          <span className="text-xs font-bold" style={{ color: "#16a34a" }}>✓</span>
                          <span className="text-xs" style={{ color: "#4a5a4a" }}>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* RIGHT — sessions */}
                <Card>
                  <CardHead title="Active Sessions" icon="💻" />
                  <div className="p-5 flex flex-col gap-4">

                    {/* Session list */}
                    <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: "#e2e8e2" }}>
                      {[
                        { device: "Chrome · macOS",       loc: "Pune, MH",   time: "Active now",  active: true  },
                        { device: "Mobile App · Android", loc: "Pune, MH",   time: "2 days ago",  active: false },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-4 border-b last:border-0"
                          style={{ borderColor: "#f0f4f0", background: s.active ? "#fafcfa" : "#fff" }}>
                          <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.active ? "animate-pulse" : ""}`}
                              style={{ background: s.active ? "#22c55e" : "#e2e8e2" }} />
                            <div>
                              <p className="text-xs font-bold" style={{ color: "#1a2e1a" }}>{s.device}</p>
                              <p className="text-[11px] mt-0.5" style={{ color: "#9aaa9a" }}>{s.loc} · {s.time}</p>
                            </div>
                          </div>
                          {s.active
                            ? <GBadge color="green">Current</GBadge>
                            : <button className="text-[11px] font-bold" style={{ color: "#dc2626" }}>Revoke</button>}
                        </div>
                      ))}
                    </div>

                    {/* Account details */}
                    <div className="p-4 rounded-2xl border-2" style={{ borderColor: "#e2e8e2", background: "#fafcfa" }}>
                      <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9aaa9a" }}>Account Details</p>
                      <DataRow label="Account created" value={fmtDateTime(user?.createdAt)} />
                      <DataRow label="Login method"    value={user?.hashedPassword ? "Email / Password" : "OAuth provider"} />
                    </div>

                    {/* Danger zone */}
                    <div className="p-4 rounded-2xl border-2" style={{ borderColor: "#fca5a5", background: "#fef2f2" }}>
                      <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#dc2626" }}>Danger Zone</p>
                      <p className="text-xs mb-3" style={{ color: "#7f1d1d" }}>
                        Deleting your account is permanent and cannot be undone.
                      </p>
                      <button onClick={() => toast.error("Please contact support to delete your account")}
                        className="text-xs font-bold px-4 py-2 rounded-xl border-2"
                        style={{ color: "#dc2626", borderColor: "#fca5a5", background: "#fff" }}>
                        Delete Account
                      </button>
                    </div>
                  </div>
                </Card>
              </>
            )}

          </motion.div>
        </AnimatePresence>

        {/* ── BOTTOM SAVE BAR ── */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <AnimatePresence>
            {dirty && (
              <motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                onClick={discard}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border-2 hover:bg-[#f0f4f0] transition-all"
                style={{ color: "#4a5a4a", borderColor: "#e2e8e2" }}>
                Discard
              </motion.button>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={dirty ? { scale: 1.01 } : {}}
            whileTap={dirty ? { scale: 0.98 } : {}}
            onClick={save} disabled={saving || !dirty}
            className="px-7 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 disabled:opacity-30 transition-all"
            style={{ background: "linear-gradient(135deg, #14532d, #166534)" }}>
            {saving
              ? <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                  className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Saving…</>
              : "Save Profile"}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showPw && <PwModal onClose={() => setShowPw(false)} toast={toast} />}
      </AnimatePresence>
    </div>
  );
}