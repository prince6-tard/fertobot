import React, { useState } from 'react';
import { SensorTelemetry, FarmProfile } from '../types';
import {
  FileSpreadsheet,
  Download,
  Printer,
  CheckCircle2,
  Sprout,
  Activity
} from 'lucide-react';

interface ReportsViewProps {
  telemetry: SensorTelemetry;
  farmProfile: FarmProfile;
  healthScore: number;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  telemetry,
  farmProfile,
  healthScore,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleDownloadCSV = () => {
    const headers = [
      'Timestamp',
      'FarmName',
      'Region',
      'Crop',
      'SoilMoisture(%)',
      'SoilPH',
      'Nitrogen(ppm)',
      'Phosphorus(ppm)',
      'Potassium(ppm)',
      'EC(dS/m)',
      'Temperature(C)',
      'Humidity(%)'
    ];

    const row = [
      new Date().toISOString(),
      `"${farmProfile.farmName}"`,
      `"${farmProfile.region}"`,
      `"${farmProfile.primaryCrop}"`,
      telemetry.soilMoisture.toFixed(1),
      telemetry.pH.toFixed(1),
      telemetry.nitrogen,
      telemetry.phosphorus,
      telemetry.potassium,
      telemetry.conductivity,
      telemetry.temperature.toFixed(1),
      telemetry.humidity.toFixed(1),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), row.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fertobot_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('CSV Field Report downloaded.');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="matte-card rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 text-emerald-400 text-xs font-medium mb-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>SOIL HEALTH CARD AUDIT & EXPORT</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Soil Health Reports
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Generate and export official Soil Health Cards for agricultural record-keeping and fertilizer audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2 rounded-xl bg-[#0D131A] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3.5 rounded-xl bg-[#0D131A] border border-slate-700 text-slate-200 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Printable Sheet */}
      <div className="matte-card rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">FERTOBOT SOIL AUDIT REPORT</h2>
              <p className="text-xs text-slate-500 font-mono">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-mono sm:text-right">
            <div>Farm: <strong className="text-white">{farmProfile.farmName}</strong></div>
            <div>Lead: <strong className="text-emerald-400">{farmProfile.ownerName}</strong></div>
          </div>
        </div>

        {/* Top Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#0A0E13] rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Region</div>
            <div className="font-semibold text-white mt-0.5">{farmProfile.region}</div>
          </div>
          <div className="p-3 bg-[#0A0E13] rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Soil Type</div>
            <div className="font-semibold text-white mt-0.5">{farmProfile.soilType}</div>
          </div>
          <div className="p-3 bg-[#0A0E13] rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Crop</div>
            <div className="font-semibold text-white mt-0.5">{farmProfile.primaryCrop}</div>
          </div>
          <div className="p-3 bg-[#0A0E13] rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Health Score</div>
            <div className="font-bold text-emerald-400 font-mono mt-0.5">{healthScore} / 100</div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px] uppercase">
                <th className="py-2.5 px-3">Parameter</th>
                <th className="py-2.5 px-3">Current Value</th>
                <th className="py-2.5 px-3">Target Range</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-white">Soil pH</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">{telemetry.pH}</td>
                <td className="py-2.5 px-3 text-slate-400">6.0 - 7.5</td>
                <td className="py-2.5 px-3 font-sans text-emerald-400">Optimal Neutral</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-white">Available Nitrogen</td>
                <td className="py-2.5 px-3 text-amber-400 font-bold">{telemetry.nitrogen} ppm</td>
                <td className="py-2.5 px-3 text-slate-400">55 - 75 ppm</td>
                <td className="py-2.5 px-3 font-sans text-amber-400">Mild Deficit</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-white">Available Phosphorus</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">{telemetry.phosphorus} ppm</td>
                <td className="py-2.5 px-3 text-slate-400">25 - 40 ppm</td>
                <td className="py-2.5 px-3 font-sans text-emerald-400">Sufficient</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-white">Available Potassium</td>
                <td className="py-2.5 px-3 text-cyan-400 font-bold">{telemetry.potassium} ppm</td>
                <td className="py-2.5 px-3 text-slate-400">45 - 65 ppm</td>
                <td className="py-2.5 px-3 font-sans text-cyan-300">High Vigor</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-white">Conductivity (EC)</td>
                <td className="py-2.5 px-3 text-white font-bold">{telemetry.conductivity} dS/m</td>
                <td className="py-2.5 px-3 text-slate-400">&lt; 2.0 dS/m</td>
                <td className="py-2.5 px-3 font-sans text-emerald-400">Non-Saline</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
