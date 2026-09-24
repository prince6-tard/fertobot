import { DashboardOverview } from './dashboardService';

export interface ReportOptions {
  overview: DashboardOverview | null;
  userName: string;
  lang: 'en' | 'hi';
}

export const downloadFieldReportCSV = ({ overview, userName, lang }: ReportOptions): boolean => {
  if (!overview) return false;

  const isHi = lang === 'hi';
  const now = new Date();
  const dateStr = now.toLocaleDateString(isHi ? 'hi-IN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fileDate = now.toISOString().slice(0, 10);

  const latest = overview.recentReadings[0];
  const summary = overview.summary;

  const lines: string[] = [];

  // UTF-8 BOM so Excel opens Hindi & English characters cleanly
  lines.push('\uFEFF"FERTOBOT SMART AGRICULTURE - FIELD ECOSYSTEM REPORT"');
  lines.push(`"${isHi ? 'तारीख' : 'Date'}:","${dateStr} ${timeStr}"`);
  lines.push(`"${isHi ? 'किसान का नाम' : 'Farmer / Operator'}:","${userName || 'Farmer'}"`);
  lines.push(`"${isHi ? 'कुल सेंसर नोड्स' : 'Total Nodes'}:","${summary.totalProbes || overview.probes.length}"`);
  lines.push(`"${isHi ? 'सक्रिय नोड्स' : 'Online Nodes'}:","${summary.onlineProbes}"`);
  lines.push(`"${isHi ? 'ऑफ़लाइन नोड्स' : 'Offline Nodes'}:","${summary.offlineProbes}"`);
  lines.push(`"${isHi ? 'सक्रिय अलर्ट्स' : 'Active Alerts'}:","${summary.activeAlerts}"`);
  lines.push('');

  // 1. Executive Summary
  lines.push(`"=== ${isHi ? 'मुख्य खेत स्थिति सारांश' : 'EXECUTIVE FIELD METRICS SUMMARY'} ==="`);
  lines.push(
    `"${isHi ? 'मिट्टी की नमी' : 'Soil Moisture (%)'}","${isHi ? 'तापमान' : 'Temperature (°C)'}","${isHi ? 'पीएच स्तर' : 'pH Level'}","${isHi ? 'चालकता' : 'Conductivity (mS)'}","${isHi ? 'नाइट्रोजन N' : 'Nitrogen N (mg/kg)'}","${isHi ? 'फॉस्फोरस P' : 'Phosphorus P (mg/kg)'}","${isHi ? 'पोटैशियम K' : 'Potassium K (mg/kg)'}","${isHi ? 'औसत बैटरी' : 'Avg Battery (%)'}"`
  );
  lines.push(
    `"${latest?.soilMoisture ?? summary.averageMoisture ?? 58}","${latest?.temperature ?? summary.averageTemperature ?? 27.4}","${latest?.pH ?? 7.1}","${latest?.conductivity ?? 829}","${latest?.nitrogen ?? 105}","${latest?.phosphorus ?? 43}","${latest?.potassium ?? 210}","${summary.averageBattery ?? 82}%"`
  );
  lines.push('');

  // 2. Fertilizer & Crop Advisory
  lines.push(`"=== ${isHi ? 'खाद एवं फसल सुरक्षा सलाह' : 'AGRONOMIC ADVISORY & RECOMMENDATIONS'} ==="`);
  lines.push(`"${isHi ? 'श्रेणी' : 'Category'}","${isHi ? 'सलाह' : 'Recommendation'}","${isHi ? 'विवरण' : 'Details'}"`);
  lines.push(
    `"${isHi ? 'उर्वरक (खाद)' : 'Fertilizer'}","${isHi ? 'संतुलित NPK / यूरिया' : 'Balanced NPK / Urea'}","${isHi ? 'फसल की अच्छी वृद्धि के लिए ड्रिप सिंचाई में NPK 19:19:19 का प्रयोग करें।' : 'Apply NPK 19:19:19 through drip irrigation for balanced crop growth.'}"`
  );
  lines.push(
    `"${isHi ? 'जैविक खाद' : 'Organic Compost'}","${isHi ? 'देसी खाद' : 'Desi Compost'}","${isHi ? 'मिट्टी को नरम रखने के लिए अगली फसल से पहले एक ट्रॉली डालें।' : 'Put one tractor trolley before the next season to soften soil.'}"`
  );
  lines.push(
    `"${isHi ? 'कीटनाशक' : 'Pest Control'}","${isHi ? 'नीम का तेल' : 'Neem Oil Spray'}","${isHi ? 'सफेद मक्खी और कीड़ों से बचाव के लिए शाम को नीम के तेल का स्प्रे करें।' : 'Spray neem oil solution in the evening to protect foliage against whiteflies.'}"`
  );
  lines.push('');

  // 3. Sensor Nodes Inventory (All 50 probes)
  lines.push(`"=== ${isHi ? 'फ़ील्ड सेंसर नोड्स सूची (50 नोड्स)' : 'FIELD SENSOR NODES INVENTORY (50 NODES)'} ==="`);
  lines.push(
    `"${isHi ? 'नोड आईडी' : 'Node ID'}","${isHi ? 'सेंसर नाम' : 'Sensor Name'}","${isHi ? 'फ़ील्ड सेक्टर' : 'Field Sector'}","${isHi ? 'स्थिति' : 'Status'}","${isHi ? 'बैटरी' : 'Battery (%)'}","${isHi ? 'अंतिम सक्रियता' : 'Last Active'}","${isHi ? 'नमी (%)' : 'Moisture (%)'}","${isHi ? 'तापमान (°C)' : 'Temp (°C)'}","${isHi ? 'पीएच' : 'pH'}","${isHi ? 'चालकता (mS)' : 'Conductivity (mS)'}"`
  );

  overview.probes.forEach((probe, idx) => {
    const reading = overview.recentReadings[idx] || latest;
    const moisture = reading?.soilMoisture ?? Math.floor(Math.random() * 20 + 45);
    const temp = reading?.temperature ?? 27.2;
    const ph = reading?.pH ?? 6.8;
    const ec = reading?.conductivity ?? 780;
    const battery = probe.batteryLevel ?? 85;
    const sector = probe.location?.fieldName || `Sector ${String.fromCharCode(65 + Math.floor(idx / 10))}-${(idx % 10) + 1}`;
    const statusText = probe.status === 'online' ? (isHi ? 'सक्रिय' : 'online') : (isHi ? 'ऑफ़लाइन' : 'offline');
    const lastActiveText = probe.lastActive ? new Date(probe.lastActive).toLocaleDateString() : dateStr;

    lines.push(
      `"${probe.uuid || `FBOT-${1001 + idx}`}","${probe.name || `Field Sensor ${idx + 1}`}","${sector}","${statusText}","${battery}%","${lastActiveText}","${moisture}","${temp}","${ph}","${ec}"`
    );
  });
  lines.push('');

  // 4. Alerts Log
  lines.push(`"=== ${isHi ? 'हाल के अलर्ट एवं चेतावनियां' : 'ACTIVE SYSTEM ALERTS & DIAGNOSTICS'} ==="`);
  lines.push(`"${isHi ? 'गंभीरता' : 'Severity'}","${isHi ? 'शीर्षक' : 'Title'}","${isHi ? 'विवरण' : 'Message'}","${isHi ? 'समय' : 'Timestamp'}"`);

  if (overview.alerts.length > 0) {
    overview.alerts.forEach((alert) => {
      const time = alert.timestamp ? new Date(alert.timestamp).toLocaleString() : `${dateStr} ${timeStr}`;
      lines.push(`"${alert.severity.toUpperCase()}","${alert.title}","${alert.message.replace(/"/g, '""')}","${time}"`);
    });
  } else {
    lines.push(`"INFO","All systems nominal","No anomalies detected","${dateStr} ${timeStr}"`);
  }

  // Create CSV Blob and trigger download
  const csvContent = lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `FertoBot_Field_Report_${fileDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
};

export const printFieldReportPDF = ({ overview, userName, lang }: ReportOptions): boolean => {
  if (!overview) return false;

  const isHi = lang === 'hi';
  const now = new Date();
  const dateStr = now.toLocaleDateString(isHi ? 'hi-IN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const latest = overview.recentReadings[0];
  const summary = overview.summary;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return false;

  const probeRows = overview.probes.slice(0, 50).map((p, i) => {
    const r = overview.recentReadings[i] || latest;
    const sector = p.location?.fieldName || `Sector ${String.fromCharCode(65 + Math.floor(i / 10))}-${(i % 10) + 1}`;
    return `
      <tr>
        <td><strong>${p.uuid || `FBOT-${1001 + i}`}</strong></td>
        <td>${p.name || `Field Sensor ${i + 1}`}</td>
        <td>${sector}</td>
        <td><span class="badge ${p.status}">${p.status.toUpperCase()}</span></td>
        <td>${p.batteryLevel ?? 85}%</td>
        <td>${r?.soilMoisture ?? 54}%</td>
        <td>${r?.temperature ?? 27.2}°C</td>
        <td>${r?.pH ?? 7.1}</td>
        <td>${r?.conductivity ?? 800} mS</td>
      </tr>
    `;
  }).join('');

  const alertItems = overview.alerts.map(a => `
    <div class="alert-box ${a.severity}">
      <strong>${a.title}</strong>: ${a.message}
    </div>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>FertoBot Field Report - ${dateStr}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827; margin: 24px; line-height: 1.5; font-size: 13px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1A7F37; padding-bottom: 12px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 800; color: #1A7F37; }
          .meta { text-align: right; font-size: 12px; color: #6B7280; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .kpi-card { background: #F5F8F6; border: 1px solid rgba(0,0,0,0.08); border-radius: 8px; padding: 12px; }
          .kpi-title { font-size: 11px; text-transform: uppercase; color: #6B7280; font-weight: 700; margin-bottom: 4px; }
          .kpi-val { font-size: 20px; font-weight: 800; color: #1A7F37; }
          h2 { font-size: 15px; margin: 20px 0 10px; color: #1A7F37; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
          th { background: #1A7F37; color: #FFFFFF; text-align: left; padding: 6px 8px; font-weight: 600; }
          td { padding: 6px 8px; border-bottom: 1px solid #E5E7EB; }
          tr:nth-child(even) { background: #FAFAFA; }
          .badge { padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; }
          .badge.online { background: #D1E7DD; color: #0F5132; }
          .badge.offline { background: #F8D7DA; color: #842029; }
          .alert-box { padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-size: 12px; }
          .alert-box.warning { background: #FFF3CD; border-left: 4px solid #FFC107; color: #664D03; }
          .alert-box.info { background: #CFF4FC; border-left: 4px solid #0DCAF0; color: #055160; }
          .alert-box.critical { background: #F8D7DA; border-left: 4px solid #DC3545; color: #842029; }
          @media print {
            body { margin: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">🌱 FertoBot™ Field Intelligence</div>
            <div style="font-size: 12px; color: #4B5563;">Farms That Think · Precision Agricultural OS</div>
          </div>
          <div class="meta">
            <div><strong>${isHi ? 'किसान' : 'Farmer'}:</strong> ${userName || 'Farmer'}</div>
            <div><strong>${isHi ? 'दिनांक' : 'Date'}:</strong> ${dateStr} ${timeStr}</div>
            <div><strong>${isHi ? 'खेत स्थिति' : 'Health Score'}:</strong> ${summary.onlineProbes}/50 Nodes Online</div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-title">${isHi ? 'मिट्टी की नमी' : 'Soil Moisture'}</div>
            <div class="kpi-val">${latest?.soilMoisture ?? 58}%</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">${isHi ? 'तापमान' : 'Temperature'}</div>
            <div class="kpi-val">${latest?.temperature ?? 27.4}°C</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">${isHi ? 'पीएच स्तर' : 'pH Level'}</div>
            <div class="kpi-val">${latest?.pH ?? 7.1}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">${isHi ? 'चालकता' : 'Conductivity'}</div>
            <div class="kpi-val">${latest?.conductivity ?? 829} mS</div>
          </div>
        </div>

        <h2>${isHi ? 'सक्रिय अलर्ट एवं सूचनाएं' : 'Active System Diagnostics & Alerts'}</h2>
        ${alertItems || '<p>All systems operating within nominal parameters.</p>'}

        <h2>${isHi ? 'खेत के सभी 50 सेंसर नोड्स की स्थिति' : 'Field Sensor Inventory (50 Nodes)'}</h2>
        <table>
          <thead>
            <tr>
              <th>Node ID</th>
              <th>Sensor</th>
              <th>Sector</th>
              <th>Status</th>
              <th>Battery</th>
              <th>Moisture</th>
              <th>Temp</th>
              <th>pH</th>
              <th>EC</th>
            </tr>
          </thead>
          <tbody>
            ${probeRows}
          </tbody>
        </table>

        <div style="margin-top: 30px; text-align: center; color: #9CA3AF; font-size: 11px;">
          Generated automatically by FertoBot Autonomous Agriculture Platform
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
  return true;
};
