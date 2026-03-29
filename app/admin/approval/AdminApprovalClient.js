"use client";

import React from "react";
import Link from "next/link";

const STATUS_OPTIONS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function AdminApprovalClient({ initialQueue }) {
  const [items, setItems] = React.useState(initialQueue.items || []);
  const [actioningId, setActioningId] = React.useState(null);
  const [message, setMessage] = React.useState(null);
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [item.subject, item.program, item.specialization, item.uploader?.name]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(term))
    );
  }, [items, search]);

  const handleAction = async (paperId, action) => {
    setActioningId(paperId + action);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/papers/${paperId}/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Action failed");
      }
      setItems((prev) => prev.filter((item) => item.id !== paperId));
      setMessage({ type: "success", text: `Paper ${action}d successfully.` });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Something went wrong" });
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Admin Console</p>
          <h1 className="text-2xl font-semibold text-gray-900">Approval queue</h1>
          <p className="text-sm text-gray-500">Accept or reject new submissions. Rejecting deletes the file from Supabase.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white border border-gray-200 px-2 py-1 shadow-sm">
          {STATUS_OPTIONS.map((opt) => (
            <Link
              key={opt.key}
              href={`?status=${opt.key}`}
              className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                initialQueue.status === opt.key
                  ? "bg-emerald-700 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by subject, program, uploader"
          className="w-full sm:max-w-sm rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 shadow-sm focus:border-emerald-500 focus:outline-none"
        />
        {message && (
          <div
            className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
              message.type === "success"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-rose-100 text-rose-800 border border-rose-200"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="hidden md:grid grid-cols-12 gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
          <div className="col-span-3">Paper</div>
          <div className="col-span-2">Program</div>
          <div className="col-span-1">Sem</div>
          <div className="col-span-2">Uploaded</div>
          <div className="col-span-2">Uploader</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-gray-100">
          {filtered.length ? (
            filtered.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 px-4 py-3">
                <div className="md:col-span-3">
                  <div className="text-sm font-semibold text-gray-900">{item.subject}</div>
                  <div className="text-xs text-gray-500">{item.specialization || item.program}</div>
                  <div className="text-[11px] text-gray-500">Year {item.year}</div>
                </div>

                <div className="md:col-span-2 text-sm text-gray-800">{item.program}</div>
                <div className="md:col-span-1 text-sm text-gray-800">{item.semester}</div>
                <div className="md:col-span-2 text-sm text-gray-800">
                  <div>{new Date(item.uploadedAt).toLocaleDateString()}</div>
                  <div className="text-[11px] text-gray-500">Unlocks: {item.unlocks} · Saves: {item.saves}</div>
                </div>
                <div className="md:col-span-2 text-sm text-gray-800">
                  <div className="font-semibold text-gray-900">{item.uploader?.name || "Unknown"}</div>
                  <div className="text-[11px] text-gray-500">{item.uploader?.email}</div>
                </div>

                <div className="md:col-span-2 flex items-center justify-start md:justify-end gap-2">
                  {initialQueue.status === "approved" ? null : (
                    <button
                      onClick={() => handleAction(item.id, "approve")}
                      disabled={actioningId === item.id + "approve"}
                      className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold text-white shadow hover:-translate-y-0.5 transition-transform disabled:opacity-60"
                    >
                      {actioningId === item.id + "approve" ? "Approving..." : "Approve"}
                    </button>
                  )}
                  {initialQueue.status === "rejected" ? null : (
                    <button
                      onClick={() => handleAction(item.id, "reject")}
                      disabled={actioningId === item.id + "reject"}
                      className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow hover:-translate-y-0.5 transition-transform disabled:opacity-60"
                    >
                      {actioningId === item.id + "reject" ? "Rejecting..." : "Reject"}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-sm text-gray-500">No papers in this bucket.</div>
          )}
        </div>
      </div>
    </div>
  );
}
