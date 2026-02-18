
import React, { useMemo } from 'react';
import { Lead } from '../types.ts';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Button } from './Button.tsx';

interface ReportingViewProps {
  leads: Lead[];
}

export const ReportingView: React.FC<ReportingViewProps> = ({ leads }) => {
  const stats = useMemo(() => {
    const total = leads.length;
    const synced = leads.filter(l => l.status === 'processed').length;
    const avgQuality = total > 0 ? (leads.reduce((acc, l) => acc + l.qualityScore, 0) / total).toFixed(1) : 0;
    const syncedPercentage = total > 0 ? ((synced / total) * 100).toFixed(0) : 0;

    // Status Distribution
    const statusData = [
      { name: 'Synced', value: synced, color: '#10b981' },
      { name: 'Pending', value: total - synced, color: '#ef4444' }
    ].filter(d => d.value > 0);

    // Category Distribution (Top 8)
    const catMap: Record<string, number> = {};
    leads.forEach(l => {
      catMap[l.category] = (catMap[l.category] || 0) + 1;
    });
    const categoryData = Object.entries(catMap)
      .map(([name, value]) => ({ name: name.substring(0, 15), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Quality Heatmap
    const qualityRanges = [
      { name: 'High (80-100)', value: leads.filter(l => l.qualityScore >= 80).length, color: '#059669' },
      { name: 'Medium (50-79)', value: leads.filter(l => l.qualityScore >= 50 && l.qualityScore < 80).length, color: '#d97706' },
      { name: 'Low (0-49)', value: leads.filter(l => l.qualityScore < 50).length, color: '#dc2626' }
    ].filter(d => d.value > 0);

    return { total, synced, avgQuality, syncedPercentage, statusData, categoryData, qualityRanges };
  }, [leads]);

  const exportToCSV = () => {
    if (leads.length === 0) return;

    const headers = [
      "Company Name", "Category", "City", "Country", "Address", "Website", 
      "Phone", "Email", "LinkedIn", "Instagram", "Facebook", 
      "Rating", "Review Count", "Quality Score", "AI Reasoning", "Status"
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      const s = String(val).replace(/"/g, '""');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
    };

    const csvRows = leads.map(l => [
      escapeCSV(l.companyName),
      escapeCSV(l.category),
      escapeCSV(l.city),
      escapeCSV(l.country),
      escapeCSV(l.address),
      escapeCSV(l.website),
      escapeCSV(l.phoneNumber),
      escapeCSV(l.email),
      escapeCSV(l.linkedin),
      escapeCSV(l.instagram),
      escapeCSV(l.facebook),
      escapeCSV(l.rating),
      escapeCSV(l.reviewCount),
      l.qualityScore,
      escapeCSV(l.qualityReasoning),
      l.status
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().split('T')[0];
    
    link.setAttribute("href", url);
    link.setAttribute("download", `canvas_cartel_leads_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (leads.length === 0) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center p-12 md:p-20 border border-dashed border-zinc-800 rounded-[2rem] md:rounded-[3rem] text-center bg-zinc-900/20">
        <div className="w-16 h-16 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center mb-6 text-zinc-500">
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight">Intelligence Bank Empty</h2>
        <p className="text-zinc-500 mt-2 max-w-sm font-bold uppercase text-[10px] tracking-widest">Perform a scrape operation to populate reports.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight">Campaign Intelligence</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Real-time Lead Maturity Metrics</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
           <Button 
            variant="secondary" 
            onClick={exportToCSV}
            className="flex-1 md:flex-none bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
           >
             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
             CSV Export
           </Button>
           <div className="flex-1 md:flex-none bg-zinc-900/50 border border-zinc-800 px-6 py-3 rounded-2xl">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1 text-center md:text-left">Maturity Score</span>
              <span className="text-2xl font-black text-red-500 block text-center md:text-left">{stats.avgQuality}%</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Status Breakdown */}
        <div className="bg-zinc-900/50 rounded-[2rem] md:rounded-[2.5rem] border border-zinc-800 p-8 flex flex-col items-center">
           <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest self-start mb-8">Pipeline Maturity</h3>
           <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={stats.statusData}
                       innerRadius={60}
                       outerRadius={90}
                       paddingAngle={5}
                       dataKey="value"
                       stroke="none"
                    >
                       {stats.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#09090b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff' }}
                    />
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-3xl font-black text-white leading-none">{stats.syncedPercentage}%</span>
                 <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">Synced</span>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4 w-full mt-6">
              {stats.statusData.map(d => (
                 <div key={d.name} className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }}></div>
                    <div className="flex flex-col leading-none overflow-hidden">
                       <span className="text-[8px] font-black text-zinc-600 uppercase mb-0.5 truncate">{d.name}</span>
                       <span className="text-xs font-black text-white truncate">{d.value} Leads</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Quality Mix */}
        <div className="bg-zinc-900/50 rounded-[2rem] md:rounded-[2.5rem] border border-zinc-800 p-8">
           <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-8">Data Fidelity Tiers</h3>
           <div className="space-y-6">
              {stats.qualityRanges.map(range => (
                 <div key={range.name} className="space-y-2">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{range.name}</span>
                       <span className="text-xs font-black text-white">{range.value}</span>
                    </div>
                    <div className="w-full h-3 bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden">
                       <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${(range.value / stats.total) * 100}%`, backgroundColor: range.color }}
                       />
                    </div>
                 </div>
              ))}
           </div>
           <div className="mt-12 bg-red-600/5 border border-red-600/10 p-6 rounded-3xl">
              <p className="text-[10px] text-red-500/80 font-bold leading-relaxed uppercase tracking-widest italic">
                 "Confidence is calculated based on vitality signals and communication verification."
              </p>
           </div>
        </div>

        {/* Category Analysis */}
        <div className="bg-zinc-900/50 rounded-[2rem] md:rounded-[2.5rem] border border-zinc-800 p-8 md:col-span-2 lg:col-span-1">
           <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-8">Top Verticals</h3>
           <div className="h-full max-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={stats.categoryData} layout="vertical" margin={{ left: -20, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                       dataKey="name" 
                       type="category" 
                       fontSize={9} 
                       fontWeight={900} 
                       tick={{ fill: '#52525b' }} 
                       axisLine={false} 
                       tickLine={false} 
                    />
                    <Tooltip cursor={{ fill: '#18181b' }} contentStyle={{ backgroundColor: '#09090b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff' }} />
                    <Bar dataKey="value" fill="#dc2626" radius={[0, 8, 8, 0]} barSize={20} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};
