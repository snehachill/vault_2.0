"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

function useCountUp(target = 0, duration = 900) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const step = target / (duration / 16 || 1);
    const t = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(t);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);

  return count;
}

const rangeOptions = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "all", label: "All time" },
];

export default function AdminDashboardClient({ initialData }) {
  const data = initialData || {};
  const stats = data.stats || {};
  const charts = data.charts || {};
  const pendingPreview = data.pendingPreview || [];
  const currentRange = data.range || "30d";

  const statCards = [
    { label: "Total Users", value: useCountUp(stats.users || 0), accent: "#25671E" },
    { label: "Total Papers", value: useCountUp(stats.papers || 0), accent: "#0f766e" },
    { label: "Pending", value: useCountUp(stats.pending || 0), accent: "#f59e0b" },
    { label: "Approved", value: useCountUp(stats.approved || 0), accent: "#10b981" },
    { label: "Rejected", value: useCountUp(stats.rejected || 0), accent: "#ef4444" },
    { label: "Unlocks", value: useCountUp(stats.unlocks || 0), accent: "#2563eb" },
    { label: "Saves", value: useCountUp(stats.saves || 0), accent: "#7c3aed" },
  ];

  const uploadsSeries = charts.uploadsByDay || [];
  const topUploaders = charts.topUploaders || [];
  const topPapers = charts.topPapers || [];
  const statusMix = charts.statusMix || [];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Admin Console</p>
          <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Monitor uploads, approvals, and engagement.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white border border-gray-200 px-2 py-1 shadow-sm">
            {rangeOptions.map((opt) => (
              <Link
                key={opt.key}
                href={`?range=${opt.key}`}
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                  currentRange === opt.key
                    ? "bg-emerald-600 text-white shadow"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
          <Link
            href="/admin/approval"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow hover:-translate-y-0.5 transition-transform"
          >
            Pending approvals →
          </Link>
        </div>
      </motion.div>

      {/* Stat strip */}
      <motion.div
        variants={fadeUp}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 bg-white border border-gray-200 rounded-2xl p-3 shadow-sm"
      >
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl bg-gray-50/60 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.16em] text-gray-500 font-semibold">{card.label}</div>
            <div className="text-2xl font-semibold" style={{ color: card.accent }}>
              {card.value}
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div variants={fadeUp} className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Uploads over time</h3>
              <p className="text-xs text-gray-500">By upload date · {currentRange === "all" ? "All time" : currentRange}</p>
            </div>
          </div>
          <div className="h-64">
            {uploadsSeries.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={uploadsSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <Tooltip cursor={{ stroke: "#d1d5db" }} />
                  <Area type="monotone" dataKey="count" stroke="#16a34a" fillOpacity={1} fill="url(#colorUploads)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartMessage label="No uploads in this range" />
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Status mix</h3>
            <p className="text-xs text-gray-500">Approved vs Pending vs Rejected</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            {statusMix.some((s) => s.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusMix} dataKey="value" nameKey="label" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {statusMix.map((entry, index) => (
                      <Cell key={entry.label} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartMessage label="No papers yet" />
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {statusMix.map((item) => (
              <div key={item.label} className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1">
                <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                <div className="text-gray-700 font-semibold">{item.value}</div>
                <div className="text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div variants={fadeUp} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top uploaders</h3>
              <p className="text-xs text-gray-500">By uploads · {currentRange}</p>
            </div>
          </div>
          <div className="h-64">
            {topUploaders.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topUploaders} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#111827" }} width={120} />
                  <Tooltip />
                  <Bar dataKey="uploads" fill="#10b981" radius={[6, 6, 6, 6]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartMessage label="No uploaders in this range" />
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top papers</h3>
              <p className="text-xs text-gray-500">By unlocks and saves</p>
            </div>
            <Link href="/user/browse" className="text-xs font-semibold text-emerald-700 hover:underline">
              View library
            </Link>
          </div>
          <div className="space-y-3">
            {topPapers.length ? (
              topPapers.map((paper) => (
                <div key={paper.id} className="flex items-start justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{paper.title}</div>
                    <div className="text-xs text-gray-500">{paper.program || "Program"}</div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white ${
                        paper.status === "approved"
                          ? "bg-emerald-600"
                          : paper.status === "pending"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}>
                        {paper.status}
                      </span>
                      <span>Unlocks: {paper.unlocks}</span>
                      <span>Saves: {paper.saves}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div className="font-semibold text-gray-900">{paper.unlocks}</div>
                    <div>total unlocks</div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyChartMessage label="No papers ranked yet" />
            )}
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pending approvals</h3>
            <p className="text-xs text-gray-500">Newest submissions awaiting review</p>
          </div>
          <Link href="/admin/approval" className="text-xs font-semibold text-emerald-700 hover:underline">
            Go to approval →
          </Link>
        </div>
        <div className="space-y-2">
          {pendingPreview.length ? (
            pendingPreview.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{item.subject}</div>
                  <div className="text-xs text-gray-500">{item.program}</div>
                  <div className="text-[11px] text-gray-500">By {item.uploader}</div>
                </div>
                <div className="text-right text-[11px] text-gray-500">
                  <div>{new Date(item.uploadedAt).toLocaleDateString()}</div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">
                    Pending
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyChartMessage label="No pending papers" />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function EmptyChartMessage({ label }) {
  return (
    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
      {label}
    </div>
  );
}
