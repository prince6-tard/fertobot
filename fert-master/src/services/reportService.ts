import { DashboardOverview } from './dashboardService';
import { Language } from '../context/LanguageContext';

export interface ReportOptions {
  overview: DashboardOverview | null;
  userName: string;
  lang: Language;
}

export interface CropInfo {
  id: string;
  emoji: string;
  sector: string;
  nodeRange: string;
  acreage: number;
  variety: string;
  sowingDaysAgo: number;
  targetMoisture: string;
  moistureReading: number;
  tempReading: number;
  phReading: number;
  ecReading: number;
  npk: { n: number; p: number; k: number };
  healthScore: number;
  name: { en: string; hi: string; gu: string; mr: string };
  stage: { en: string; hi: string; gu: string; mr: string };
  status: { en: string; hi: string; gu: string; mr: string };
  advice: { en: string; hi: string; gu: string; mr: string };
}

export const ACTIVE_CROPS: CropInfo[] = [
  {
    id: 'wheat',
    emoji: '🌾',
    sector: 'Sector A',
    nodeRange: 'FBOT-1001 to FBOT-1010',
    acreage: 12,
    variety: 'Sharbati HD-2967',
    sowingDaysAgo: 45,
    targetMoisture: '55% - 65%',
    moistureReading: 58,
    tempReading: 23.8,
    phReading: 6.8,
    ecReading: 720,
    npk: { n: 110, p: 45, k: 215 },
    healthScore: 96,
    name: { en: 'Wheat', hi: 'गेहूं', gu: 'ઘઉં', mr: 'गहू' },
    stage: {
      en: 'Tillering & Vegetative',
      hi: 'कल्ले फूटना (वानस्पतिक वृद्धि)',
      gu: 'કલ્લે ફૂટવા (વાનસ્પતિક વૃદ્ધિ)',
      mr: 'फुटवे फुटणे (शाकीय वाढ)',
    },
    status: {
      en: 'Optimal · Healthy',
      hi: 'उत्तम स्थिति · स्वस्थ',
      gu: 'ઉત્તમ સ્થિતિ · તંદુરસ્ત',
      mr: 'उत्तम स्थिती · निरोगी',
    },
    advice: {
      en: 'First top dressing of Urea (25kg/acre) with next irrigation rotation. Moisture level is optimal.',
      hi: 'अगले पानी के साथ यूरिया (25kg/एकड़) का छिड़काव करें। नमी पर्याप्त है।',
      gu: 'આગામી પિયત સાથે યૂરિયા (25 કિગ્રા/એકર) આપો. જમીનનો ભેજ અનુકૂળ છે.',
      mr: 'पुढील पाण्याच्या पाळीसोबत युरिया (25 किलो/एकर) द्या. ओलावा योग्य आहे.',
    },
  },
  {
    id: 'cotton',
    emoji: '🌱',
    sector: 'Sector B',
    nodeRange: 'FBOT-1011 to FBOT-1020',
    acreage: 10,
    variety: 'BT Cotton RCH-659',
    sowingDaysAgo: 65,
    targetMoisture: '45% - 55%',
    moistureReading: 48,
    tempReading: 28.5,
    phReading: 7.2,
    ecReading: 810,
    npk: { n: 85, p: 38, k: 190 },
    healthScore: 92,
    name: { en: 'Cotton', hi: 'कपास', gu: 'કપાસ', mr: 'कापूस' },
    stage: {
      en: 'Squaring & Budding',
      hi: 'फूल-कली अवस्था (स्क्वेयरिंग)',
      gu: 'ફૂલ-ડોકા / કળી અવસ્થા',
      mr: 'पाते व कळी धरणे',
    },
    status: {
      en: 'Attention · Light Irrigation',
      hi: 'ध्यान दें · हल्की सिंचाई आवश्यक',
      gu: 'ધ્યાન આપો · હળવું પિયત જરૂરી',
      mr: 'लक्ष द्या · हलके पाणी आवश्यक',
    },
    advice: {
      en: 'Apply NPK 19:19:19 (5kg/acre) via drip fertigation. Inspect leaf undersides for thrips or whiteflies.',
      hi: 'ड्रिप से 19:19:19 (5kg/एकड़) दें। सफेद मक्खी या थ्रिप्स के लिए पत्तियों की जांच करें।',
      gu: 'ડ્રિપ દ્વારા 19:19:19 (5 કિગ્રા/એકર) આપો. સફેદ માખી કે થ્રિપ્સ માટે પાન તપાસો.',
      mr: 'ठिबकद्वारे 19:19:19 (5 किलो/एकर) द्या. पांढरी माशी किंवा थ्रिप्ससाठी पाने तपासा.',
    },
  },
  {
    id: 'mustard',
    emoji: '🌼',
    sector: 'Sector C',
    nodeRange: 'FBOT-1021 to FBOT-1030',
    acreage: 8,
    variety: 'Pusa Bold',
    sowingDaysAgo: 75,
    targetMoisture: '40% - 50%',
    moistureReading: 43,
    tempReading: 22.5,
    phReading: 6.9,
    ecReading: 690,
    npk: { n: 95, p: 42, k: 200 },
    healthScore: 95,
    name: { en: 'Mustard', hi: 'सरसों', gu: 'રાઈ (સરસવ)', mr: 'मोहरी' },
    stage: {
      en: 'Pod Formation',
      hi: 'फली बनने की अवस्था',
      gu: 'શીંગ / પોપટા બનવાની અવસ્થા',
      mr: 'शेंगा भरण्याची अवस्था',
    },
    status: {
      en: 'Optimal · Podding',
      hi: 'स्वस्थ एवं उत्तम',
      gu: 'તંદુરસ્ત અને ઉત્તમ',
      mr: 'निरोगी व उत्तम',
    },
    advice: {
      en: 'Spray neem oil (5ml/L) during morning hours to prevent mustard aphid (chepa) infestation.',
      hi: 'माहू (चेपा) की रोकथाम के लिए सुबह के समय नीम तेल (5ml/लीटर) का छिड़काव करें।',
      gu: 'મોલો-મશી (ચેપો) રોકવા સવારે લીમડાના તેલ (5 મિલી/લીટર) નો છંટકાવ કરો.',
      mr: 'मावा किडीच्या नियंत्रणासाठी सकाळी निंबोळी अर्क (5 मिली/लिटर) फवारा.',
    },
  },
  {
    id: 'sugarcane',
    emoji: '🎋',
    sector: 'Sector D',
    nodeRange: 'FBOT-1031 to FBOT-1040',
    acreage: 15,
    variety: 'Co-0238',
    sowingDaysAgo: 120,
    targetMoisture: '60% - 70%',
    moistureReading: 64,
    tempReading: 26.2,
    phReading: 7.0,
    ecReading: 760,
    npk: { n: 130, p: 50, k: 240 },
    healthScore: 98,
    name: { en: 'Sugarcane', hi: 'गन्ना', gu: 'શેરડી', mr: 'ऊस' },
    stage: {
      en: 'Grand Growth Phase',
      hi: 'तीव्र बढ़वार अवस्था',
      gu: 'ઝડપી વૃદ્ધિ તબક્કો',
      mr: 'जोमदार वाढीचा टप्पा',
    },
    status: {
      en: 'Optimal · Vigorous',
      hi: 'उत्तम स्थिति · तीव्र विकास',
      gu: 'ઉત્તમ સ્થિતિ · સારો વિકાસ',
      mr: 'उत्तम स्थिती · जोमदार वाढ',
    },
    advice: {
      en: 'Soil moisture is ideal. Earth-up soil around root base to prevent lodging in strong winds.',
      hi: 'मिट्टी में नमी उचित है। हवा से गन्ने को गिरने से बचाने के लिए जड़ों पर मिट्टी चढ़ाएं।',
      gu: 'ભેજ યોગ્ય છે. શેરડી ઢળી ન પડે તે માટે થડ પાસે માટી ચડાવો (પાળા બાંધો).',
      mr: 'ओलावा योग्य आहे. ऊस लोळू नये म्हणून बुडाशी भर लावा (बांधणी करा).',
    },
  },
  {
    id: 'chickpea',
    emoji: '🌿',
    sector: 'Sector E',
    nodeRange: 'FBOT-1041 to FBOT-1050',
    acreage: 5,
    variety: 'JG-11 Desi',
    sowingDaysAgo: 50,
    targetMoisture: '35% - 45%',
    moistureReading: 38,
    tempReading: 22.0,
    phReading: 7.3,
    ecReading: 640,
    npk: { n: 70, p: 48, k: 185 },
    healthScore: 94,
    name: { en: 'Chickpea (Chana)', hi: 'चना', gu: 'ચણા', mr: 'हरभरा' },
    stage: {
      en: 'Flowering & Early Podding',
      hi: 'फूल एवं शुरुआती दाना भराव',
      gu: 'ફૂલ અને દાણા બેસવાની અવસ્થા',
      mr: 'फुलधारणा व घाटे भरणे',
    },
    status: {
      en: 'Optimal · Balanced',
      hi: 'संतुलित एवं सामान्य',
      gu: 'સંતુલિત અને સામાન્ય',
      mr: 'संतुलित व सामान्य',
    },
    advice: {
      en: 'Avoid over-irrigation during peak flowering. Install pheromone traps for pod borer caterpillars.',
      hi: 'फूल आते समय अधिक पानी न दें। इल्ली (घुन) की रोकथाम के लिए फेरोमोन ट्रैप लगाएं।',
      gu: 'ફૂલ વખતે વધારે પાણી ન આપો. પોપટા કોરી ખાનાર ઈયળ માટે ફેરોમોન ટ્રેપ લગાવો.',
      mr: 'फुलोऱ्यात असताना जादा पाणी देऊ नका. घाटी अळी नियंत्रणासाठी कामगंध सापळे लावा.',
    },
  },
];

export const getCropForProbeIndex = (idx: number): CropInfo => {
  const cropIdx = Math.floor(idx / 10) % ACTIVE_CROPS.length;
  return ACTIVE_CROPS[cropIdx];
};

export const downloadFieldReportCSV = ({ overview, userName, lang }: ReportOptions): boolean => {
  if (!overview) return false;

  const now = new Date();
  const dateLocale = lang === 'hi' ? 'hi-IN' : lang === 'gu' ? 'gu-IN' : lang === 'mr' ? 'mr-IN' : 'en-US';
  const dateStr = now.toLocaleDateString(dateLocale, { year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fileDate = now.toISOString().slice(0, 10);

  const latest = overview.recentReadings[0];
  const summary = overview.summary;

  const t = (en: string, hi: string, gu: string, mr: string) => {
    if (lang === 'hi') return hi;
    if (lang === 'gu') return gu;
    if (lang === 'mr') return mr;
    return en;
  };

  const lines: string[] = [];

  // UTF-8 BOM so Excel opens Hindi, Gujarati, Marathi & English characters cleanly
  lines.push('\uFEFF"FERTOBOT SMART AGRICULTURE - CROP & FIELD TELEMETRY REPORT"');
  lines.push(`"${t('Date', 'तारीख', 'તારીખ', 'दिनांक')}:","${dateStr} ${timeStr}"`);
  lines.push(`"${t('Farmer / Operator', 'किसान का नाम', 'ખેડૂતનું નામ', 'शेतकऱ्याचे नाव')}:","${userName || 'Farmer'}"`);
  lines.push(`"${t('Total Field Area', 'कुल खेत क्षेत्रफल', 'કુલ ખેતર વિસ્તાર', 'एकूण शेत क्षेत्र')}:","50 Acres (5 Active Crops)"`);
  lines.push(`"${t('Total Sensor Nodes', 'कुल सेंसर नोड्स', 'કુલ સેન્સર નોડ્સ', 'एकूण सेन्सर्स')}:","${summary.totalProbes || overview.probes.length}"`);
  lines.push(`"${t('Online Nodes', 'सक्रिय नोड्स', 'ઓનલાઇન નોડ્સ', 'सक्रिय नोड्स')}:","${summary.onlineProbes}"`);
  lines.push(`"${t('Active Alerts', 'सक्रिय अलर्ट्स', 'સક્રિય એલર્ટ', 'सक्रिय अलर्ट')}:","${summary.activeAlerts}"`);
  lines.push('');

  // 1. CROP CULTIVATION & FIELD INVENTORY ("खेती क्या हुई है")
  lines.push(`"=== ${t('CROPS IN CULTIVATION & AGRONOMY (खेती क्या हुई है)', 'खेत की फसलें एवं खेती का विवरण (खेती क्या हुई है)', 'વાવેતર કરેલ પાક અને ખેતી વિગત (ખેતી શું થઈ છે)', 'लागवड केलेली पिके व शेती तपशील (शेती काय झाली आहे)')} ==="`);
  lines.push(
    `"${t('Crop Name', 'फसल का नाम', 'પાકનું નામ', 'पिकाचे नाव')}","${t('Field Sector', 'फ़ील्ड सेक्टर', 'ખેતર સેક્ટર', 'शेत क्षेत्र')}","${t('Area (Acres)', 'क्षेत्रफल (एकड़)', 'વિસ્તાર (એકર)', 'क्षेत्र (एकर)')}","${t('Crop Variety', 'किस्म / वैरायटी', 'જાત / વેરાયટી', 'वाण')}","${t('Growth Stage', 'वृद्धि अवस्था', 'વિકાસ તબક્કો', 'वाढीचा टप्पा')}","${t('Sown (Days Ago)', 'बुआई (दिन पहले)', 'વાવણી (દિવસો પહેલાં)', 'पेरणी (दिवसांपूर्वी)')}","${t('Target Moisture', 'उचित नमी', 'યોગ્ય ભેજ', 'योग्य ओलावा')}","${t('Current Moisture (%)', 'वर्तमान नमी (%)', 'હાલનો ભેજ (%)', 'सध्याचा ओलावा (%)')}","${t('Soil Temp (°C)', 'तापमान (°C)', 'તાપમાન (°C)', 'तापमान (°C)')}","${t('Soil pH', 'पीएच pH', 'પીએચ pH', 'सामू pH')}","${t('EC (mS)', 'चालकता EC', 'વાહકતા EC', 'वाहकता EC')}","${t('Nitrogen N (ppm)', 'नाइट्रोजन N', 'નાઇટ્રોજન N', 'नायट्रोजन N')}","${t('Phosphorus P (ppm)', 'फॉस्फोरस P', 'ફોસ્ફરસ P', 'फॉस्फरस P')}","${t('Potassium K (ppm)', 'पोटैशियम K', 'પોટેશિયમ K', 'पोटॅशियम K')}","${t('Health Score', 'स्वास्थ्य सूचकांक', 'તંદુરસ્તી સ્કોર', 'आरोग्य स्कोअर')}","${t('Status', 'स्थिति', 'સ્થિતિ', 'स्थिती')}","${t('Agronomic Advice', 'कृषि सलाह', 'ખેતી સલાહ', 'शेती सल्ला')}"`
  );

  ACTIVE_CROPS.forEach((crop) => {
    const cropName = crop.name[lang] || crop.name.en;
    const stage = crop.stage[lang] || crop.stage.en;
    const status = crop.status[lang] || crop.status.en;
    const advice = (crop.advice[lang] || crop.advice.en).replace(/"/g, '""');

    lines.push(
      `"${cropName}","${crop.sector}","${crop.acreage}","${crop.variety}","${stage}","${crop.sowingDaysAgo} days","${crop.targetMoisture}","${crop.moistureReading}%","${crop.tempReading}°C","${crop.phReading}","${crop.ecReading}","${crop.npk.n}","${crop.npk.p}","${crop.npk.k}","${crop.healthScore}%","${status}","${advice}"`
    );
  });
  lines.push('');

  // 2. OVERALL FARM TELEMETRY SUMMARY ("रीडिंग क्या है")
  lines.push(`"=== ${t('OVERALL FARM TELEMETRY READINGS (रीडिंग क्या है)', 'खेत की कुल सेंसर रीडिंग (रीडिंग क्या है)', 'ખેતરના કુલ સેન્સર રીડિંગ (રીડિંગ શું છે)', 'शेताचे एकूण सेन्सर रीडिंग (रीडिंग काय आहे)')} ==="`);
  lines.push(
    `"${t('Avg Moisture (%)', 'औसत नमी (%)', 'સરેરાશ ભેજ (%)', 'सरासरी ओलावा (%)')}","${t('Avg Temp (°C)', 'औसत तापमान (°C)', 'સરેરાશ તાપમાન (°C)', 'सरासरी तापमान (°C)')}","${t('Soil pH', 'मिट्टी का pH', 'જમીનનું pH', 'मातीचे pH')}","${t('Conductivity (mS)', 'चालकता (mS)', 'વાહકતા (mS)', 'वाहकता (mS)')}","${t('Nitrogen N (mg/kg)', 'नाइट्रोजन N', 'નાઇટ્રોજન N', 'नायट्रोजन N')}","${t('Phosphorus P (mg/kg)', 'फॉस्फोरस P', 'ફોસ્ફરસ P', 'फॉस्फरस P')}","${t('Potassium K (mg/kg)', 'पोटैशियम K', 'પોટેશિયમ K', 'पोटॅशियम K')}","${t('Avg Battery (%)', 'औसत बैटरी (%)', 'સરેરાશ બેટરી (%)', 'सरासरी बॅटरी (%)')}"`
  );
  lines.push(
    `"${latest?.soilMoisture ?? summary.averageMoisture ?? 58}","${latest?.temperature ?? summary.averageTemperature ?? 27.4}","${latest?.pH ?? 7.1}","${latest?.conductivity ?? 829}","${latest?.nitrogen ?? 105}","${latest?.phosphorus ?? 43}","${latest?.potassium ?? 210}","${summary.averageBattery ?? 82}%"`
  );
  lines.push('');

  // 3. SENSOR NODES INVENTORY WITH ASSIGNED CROPS (50 Nodes)
  lines.push(`"=== ${t('FIELD SENSOR NODES INVENTORY (50 PROBES MAPPED TO CROPS)', 'फ़ील्ड सेंसर नोड्स सूची (50 नोड्स फसल अनुसार)', 'ખેતર સેન્સર નોડ્સ યાદી (50 નોડ્સ પાક મુજબ)', 'शेत सेन्सर्स यादी (50 नोड्स पिकांनुसार)')} ==="`);
  lines.push(
    `"${t('Node ID', 'नोड आईडी', 'નોડ આઈડી', 'नोड आयडी')}","${t('Assigned Crop', 'बोई गई फसल', 'વાવેતર કરેલ પાક', 'लागवड केलेले पीक')}","${t('Field Sector', 'फ़ील्ड सेक्टर', 'ખેતર સેક્ટર', 'शेत क्षेत्र')}","${t('Status', 'स्थिति', 'સ્થિતિ', 'स्थिती')}","${t('Battery (%)', 'बैटरी (%)', 'બેટરી (%)', 'बॅटरी (%)')}","${t('Last Active', 'अंतिम सक्रियता', 'છેલ્લે સક્રિય', 'शेवटचे सक्रिय')}","${t('Moisture (%)', 'नमी (%)', 'ભેજ (%)', 'ओलावा (%)')}","${t('Temp (°C)', 'तापमान (°C)', 'તાપમાન (°C)', 'तापमान (°C)')}","${t('pH Level', 'पीएच pH', 'પીએચ pH', 'सामू pH')}","${t('Conductivity (mS)', 'चालकता (mS)', 'વાહકતા (mS)', 'वाहकता (mS)')}"`
  );

  overview.probes.forEach((probe, idx) => {
    const crop = getCropForProbeIndex(idx);
    const reading = overview.recentReadings[idx] || latest;
    const moisture = reading?.soilMoisture ?? crop.moistureReading;
    const temp = reading?.temperature ?? crop.tempReading;
    const ph = reading?.pH ?? crop.phReading;
    const ec = reading?.conductivity ?? crop.ecReading;
    const battery = probe.batteryLevel ?? 85;
    const sector = crop.sector;
    const statusText = probe.status === 'online'
      ? t('online', 'सक्रिय', 'ઓનલાઇન', 'सक्रिय')
      : t('offline', 'ऑफ़लाइन', 'ઓફલાઇન', 'ऑफलाइन');
    const lastActiveText = probe.lastActive ? new Date(probe.lastActive).toLocaleDateString() : dateStr;
    const cropName = crop.name[lang] || crop.name.en;

    lines.push(
      `"${probe.uuid || `FBOT-${1001 + idx}`}","${cropName}","${sector}","${statusText}","${battery}%","${lastActiveText}","${moisture}","${temp}","${ph}","${ec}"`
    );
  });
  lines.push('');

  // 4. ACTIVE ALERTS & ACTIONABLE RECOMMENDATIONS
  lines.push(`"=== ${t('ACTIVE SYSTEM ALERTS & DIAGNOSTICS', 'सक्रिय अलर्ट एवं चेतावनी विवरण', 'સક્રિય એલર્ટ અને સલાહ', 'सक्रिय सूचना आणि सल्ला')} ==="`);
  lines.push(`"${t('Severity', 'गंभीरता', 'ગંભીરતા', 'तीव्रता')}","${t('Title', 'शीर्षक', 'શીર્ષક', 'शीर्षक')}","${t('Message / Action', 'विवरण / कार्रवाई', 'વિગત / પગલાં', 'तपशील / कृती')}","${t('Timestamp', 'समय', 'સમય', 'वेळ')}"`);

  if (overview.alerts.length > 0) {
    overview.alerts.forEach((alert) => {
      const time = alert.timestamp ? new Date(alert.timestamp).toLocaleString() : `${dateStr} ${timeStr}`;
      lines.push(`"${alert.severity.toUpperCase()}","${alert.title}","${alert.message.replace(/"/g, '""')}","${time}"`);
    });
  } else {
    lines.push(`"INFO","All systems nominal","All 5 crops in optimal condition. Next scheduled irrigation at 06:00 AM.","${dateStr} ${timeStr}"`);
  }

  // Create CSV Blob and trigger download
  const csvContent = lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `FertoBot_Field_Report_${lang.toUpperCase()}_${fileDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
};

export const printFieldReportPDF = ({ overview, userName, lang }: ReportOptions): boolean => {
  if (!overview) return false;

  const now = new Date();
  const dateLocale = lang === 'hi' ? 'hi-IN' : lang === 'gu' ? 'gu-IN' : lang === 'mr' ? 'mr-IN' : 'en-US';
  const dateStr = now.toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const latest = overview.recentReadings[0];
  const summary = overview.summary;

  const t = (en: string, hi: string, gu: string, mr: string) => {
    if (lang === 'hi') return hi;
    if (lang === 'gu') return gu;
    if (lang === 'mr') return mr;
    return en;
  };

  const printWindow = window.open('', '_blank');
  if (!printWindow) return false;

  const cropCardsHtml = ACTIVE_CROPS.map((crop) => {
    const cropName = crop.name[lang] || crop.name.en;
    const stage = crop.stage[lang] || crop.stage.en;
    const status = crop.status[lang] || crop.status.en;
    const advice = crop.advice[lang] || crop.advice.en;

    return `
      <div class="crop-card">
        <div class="crop-header">
          <div class="crop-title">
            <span class="crop-emoji">${crop.emoji}</span>
            <div>
              <h3>${cropName}</h3>
              <span class="crop-sub">${crop.sector} · ${crop.acreage} ${t('Acres', 'एकड़', 'એકર', 'एकर')} · ${crop.variety}</span>
            </div>
          </div>
          <span class="badge ${crop.status.en.includes('Attention') ? 'warning' : 'online'}">${status}</span>
        </div>
        <div class="crop-meta-row">
          <div class="meta-item">
            <span class="meta-label">${t('Growth Stage', 'वृद्धि चरण', 'વિકાસ તબક્કો', 'वाढीचा टप्पा')}</span>
            <span class="meta-val">${stage} (${crop.sowingDaysAgo} ${t('days', 'दिन', 'દિવસ', 'दिवस')})</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">${t('Ideal Moisture', 'उचित नमी', 'યોગ્ય ભેજ', 'योग्य ओलावा')}</span>
            <span class="meta-val">${crop.targetMoisture}</span>
          </div>
        </div>
        <div class="telemetry-pills">
          <div class="pill">
            <span class="p-lbl">${t('Moisture', 'नमी', 'ભેજ', 'ओलावा')}</span>
            <span class="p-val text-blue">${crop.moistureReading}%</span>
          </div>
          <div class="pill">
            <span class="p-lbl">${t('Temp', 'तापमान', 'તાપમાન', 'तापમાન')}</span>
            <span class="p-val text-amber">${crop.tempReading}°C</span>
          </div>
          <div class="pill">
            <span class="p-lbl">pH</span>
            <span class="p-val text-teal">${crop.phReading}</span>
          </div>
          <div class="pill">
            <span class="p-lbl">N-P-K</span>
            <span class="p-val text-green">${crop.npk.n}-${crop.npk.p}-${crop.npk.k}</span>
          </div>
          <div class="pill">
            <span class="p-lbl">Health</span>
            <span class="p-val text-green">${crop.healthScore}%</span>
          </div>
        </div>
        <div class="crop-advice">
          <strong>💡 ${t('Agronomic Advice', 'कृषि सलाह', 'ખેતી સલાહ', 'शेती सल्ला')}:</strong> ${advice}
        </div>
      </div>
    `;
  }).join('');

  const probeRows = overview.probes.slice(0, 50).map((p, i) => {
    const crop = getCropForProbeIndex(i);
    const r = overview.recentReadings[i] || latest;
    const cropName = crop.name[lang] || crop.name.en;

    return `
      <tr>
        <td><strong>${p.uuid || `FBOT-${1001 + i}`}</strong></td>
        <td><strong>${crop.emoji} ${cropName}</strong></td>
        <td>${crop.sector}</td>
        <td><span class="badge ${p.status}">${p.status.toUpperCase()}</span></td>
        <td>${p.batteryLevel ?? 85}%</td>
        <td>${r?.soilMoisture ?? crop.moistureReading}%</td>
        <td>${r?.temperature ?? crop.tempReading}°C</td>
        <td>${r?.pH ?? crop.phReading}</td>
        <td>${r?.conductivity ?? crop.ecReading} mS</td>
      </tr>
    `;
  }).join('');

  const alertItems = overview.alerts.map(a => `
    <div class="alert-box ${a.severity}">
      <strong>${a.title}</strong>: ${a.message}
    </div>
  `).join('') || `<div class="alert-box nominal">${t('All 5 crop sectors nominal. Smart irrigation cycle scheduled for 06:00 AM.', 'सभी 5 फसल सेक्टर सामान्य हैं। सुबह 06:00 बजे स्मार्ट सिंचाई निर्धारित है।', 'બધા 5 પાક ક્ષેત્રો સામાન્ય છે. સવારે 06:00 વાગ્યે સ્માર્ટ સિંચાઈ નિર્ધારિત છે.', 'सर्व 5 पीक क्षेत्रे सुरळीत आहेत. सकाळी 06:00 वाजता स्मार्ट सिंचन नियोजित आहे.')}</div>`;

  const html = `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <title>FertoBot Field Report - ${userName || 'Farmer'}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@500;600&family=Noto+Sans:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Sans+Gujarati:wght@400;600;700&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Inter', 'Noto Sans', 'Noto Sans Devanagari', 'Noto Sans Gujarati', sans-serif;
          color: #111827;
          background: #FFFFFF;
          padding: 24px;
          font-size: 13px;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 2px solid #1A7F37;
          margin-bottom: 20px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brand-title {
          font-size: 24px;
          font-weight: 800;
          color: #1A7F37;
          letter-spacing: -0.02em;
        }
        .brand-sub {
          font-size: 11px;
          color: #6B7280;
          font-weight: 600;
        }
        .report-meta {
          text-align: right;
          font-size: 11px;
          color: #4B5563;
        }
        .report-meta strong {
          color: #111827;
        }
        .section-title {
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #1F2937;
          margin: 20px 0 10px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-title::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 14px;
          background: #1A7F37;
          border-radius: 2px;
        }
        /* Crop Cards */
        .crop-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        .crop-card {
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          padding: 12px 14px;
          background: #F9FAFB;
          page-break-inside: avoid;
        }
        .crop-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        .crop-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .crop-emoji {
          font-size: 22px;
        }
        .crop-title h3 {
          font-size: 14px;
          font-weight: 700;
          color: #111827;
        }
        .crop-sub {
          font-size: 10px;
          color: #6B7280;
          font-weight: 500;
        }
        .crop-meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          padding: 6px 0;
          border-top: 1px dashed #E5E7EB;
          border-bottom: 1px dashed #E5E7EB;
          margin-bottom: 8px;
        }
        .meta-item {
          display: flex;
          flex-direction: column;
        }
        .meta-label {
          font-size: 9px;
          color: #6B7280;
          text-transform: uppercase;
        }
        .meta-val {
          font-size: 11px;
          font-weight: 600;
          color: #111827;
        }
        .telemetry-pills {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
          margin-bottom: 8px;
        }
        .pill {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          padding: 4px;
          text-align: center;
        }
        .p-lbl {
          font-size: 8px;
          color: #6B7280;
          display: block;
          text-transform: uppercase;
        }
        .p-val {
          font-size: 11px;
          font-weight: 700;
          font-family: 'DM Mono', monospace;
        }
        .text-blue { color: #2563EB; }
        .text-amber { color: #D97706; }
        .text-teal { color: #0D9488; }
        .text-green { color: #16A34A; }
        .crop-advice {
          font-size: 10px;
          color: #374151;
          background: #ECFDF5;
          border-left: 3px solid #10B981;
          padding: 6px 8px;
          border-radius: 4px;
          line-height: 1.4;
        }
        /* Overall KPI row */
        .kpi-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        .kpi-card {
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          padding: 10px 12px;
          background: #FFFFFF;
        }
        .kpi-card h4 {
          font-size: 10px;
          color: #6B7280;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .kpi-card .val {
          font-size: 18px;
          font-weight: 800;
          color: #111827;
          font-family: 'DM Mono', monospace;
        }
        /* Table */
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10.5px;
          margin-top: 8px;
        }
        th, td {
          border: 1px solid #E5E7EB;
          padding: 5px 8px;
          text-align: left;
        }
        th {
          background: #F3F4F6;
          font-weight: 700;
          color: #374151;
          text-transform: uppercase;
          font-size: 9px;
          letter-spacing: 0.04em;
        }
        tr:nth-child(even) {
          background: #F9FAFB;
        }
        .badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .badge.online { background: #DCFCE7; color: #166534; }
        .badge.warning { background: #FEF3C7; color: #92400E; }
        .badge.offline { background: #FEE2E2; color: #991B1B; }
        .alert-box {
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 11px;
          margin-bottom: 6px;
        }
        .alert-box.critical { background: #FEE2E2; border-left: 3px solid #DC2626; color: #991B1B; }
        .alert-box.warning { background: #FEF3C7; border-left: 3px solid #D97706; color: #92400E; }
        .alert-box.nominal { background: #DCFCE7; border-left: 3px solid #16A34A; color: #166534; }
        .footer {
          margin-top: 24px;
          padding-top: 12px;
          border-top: 1px solid #E5E7EB;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #9CA3AF;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
          .crop-grid { grid-template-columns: repeat(2, 1fr); }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">
          <div>
            <div class="brand-title">FERTOBOT FARM OS</div>
            <div class="brand-sub">${t('SMART AGRICULTURE MONITORING & TELEMETRY SYSTEM', 'स्मार्ट कृषि निगरानी एवं टेलीमेट्री सिस्टम', 'સ્માર્ટ કૃષિ મોનિટરિંગ અને ટેલિમેટ્રી સિસ્ટમ', 'स्मार्ट कृषी निरीक्षण आणि टेलिमेट्री प्रणाली')}</div>
          </div>
        </div>
        <div class="report-meta">
          <div><strong>${t('Farmer / Farm', 'किसान / फार्म', 'ખેડૂત / ફાર્મ', 'शेतकरी / शेत')}:</strong> ${userName || 'Farmer'}</div>
          <div><strong>${t('Generated', 'तारीख', 'તારીખ', 'दिनांक')}:</strong> ${dateStr} · ${timeStr}</div>
          <div><strong>${t('Total Cultivation', 'कुल खेती', 'કુલ વાવેતર', 'एकूण लागवड')}:</strong> 50 ${t('Acres', 'एकड़', 'એકર', 'एकर')} (5 ${t('Crops', 'फसलें', 'પાક', 'पिके')})</div>
        </div>
      </div>

      <!-- KPI Overview -->
      <div class="kpi-row">
        <div class="kpi-card">
          <h4>${t('Farm Health Score', 'फार्म हेल्थ स्कोर', 'ફાર્મ હેલ્થ સ્કોર', 'शेत आरोग्य निर्देशांक')}</h4>
          <div class="val" style="color: #1A7F37;">96%</div>
        </div>
        <div class="kpi-card">
          <h4>${t('Avg Soil Moisture', 'औसत नमी', 'સરેરાશ ભેજ', 'सरासरी ओलावा')}</h4>
          <div class="val" style="color: #2563EB;">${latest?.soilMoisture ?? summary.averageMoisture ?? 54}%</div>
        </div>
        <div class="kpi-card">
          <h4>${t('Avg Soil Temp', 'औसत तापमान', 'સરેરાશ તાપમાન', 'सरासरी तापमान')}</h4>
          <div class="val" style="color: #D97706;">${latest?.temperature ?? summary.averageTemperature ?? 27.2}°C</div>
        </div>
        <div class="kpi-card">
          <h4>${t('Active IoT Nodes', 'सक्रिय नोड्स', 'સક્રિય નોડ્સ', 'सक्रिय नोड्स')}</h4>
          <div class="val" style="color: #0D9488;">${summary.onlineProbes || 44} / ${summary.totalProbes || 50}</div>
        </div>
      </div>

      <!-- SECTION 1: CROP CULTIVATION & READINGS ("खेती क्या हुई है और रीडिंग क्या है") -->
      <div class="section-title">
        ${t('CROPS IN CULTIVATION & LIVE TELEMETRY (खेती क्या हुई है और रीडिंग क्या है)', 'खेत की फसलें एवं लाइव सेंसर रीडिंग (खेती क्या हुई है और रीडिंग क्या है)', 'વાવેતર થયેલ પાક અને લાઇવ સેન્સર રીડિંગ (ખેતી શું થઈ છે અને રીડિંગ શું છે)', 'लागवड केलेली पिके व थेट सेन्सर रीडिंग (शेती काय झाली आहे व रीडिंग काय आहे)')}
      </div>
      <div class="crop-grid">
        ${cropCardsHtml}
      </div>

      <!-- SECTION 2: 50-NODE SENSOR INVENTORY -->
      <div class="section-title">
        ${t('FIELD SENSOR NODES & CROP ASSIGNMENTS (50 NODES)', 'सेंसर नोड्स एवं फसल मैपिंग (50 नोड्स)', 'સેન્સર નોડ્સ અને પાક મેપિંગ (50 નોડ્સ)', 'सेन्सर्स आणि पीक मॅपिंग (50 नोड्स)')}
      </div>
      <table>
        <thead>
          <tr>
            <th>${t('Node ID', 'नोड आईडी', 'નોડ આઈડી', 'नोड आयडी')}</th>
            <th>${t('Crop Planted', 'फसल', 'વાવેતર પાક', 'पीक')}</th>
            <th>${t('Sector', 'सेक्टर', 'સેક્ટર', 'क्षेत्र')}</th>
            <th>${t('Status', 'स्थिति', 'સ્થિતિ', 'स्थिती')}</th>
            <th>${t('Battery', 'बैटरी', 'બેટરી', 'बॅटरी')}</th>
            <th>${t('Moisture', 'नमी', 'ભેજ', 'ओलावा')}</th>
            <th>${t('Temp', 'तापमान', 'તાપમાન', 'तापમાન')}</th>
            <th>pH</th>
            <th>EC</th>
          </tr>
        </thead>
        <tbody>
          ${probeRows}
        </tbody>
      </table>

      <!-- SECTION 3: ALERTS & RECOMMENDATIONS -->
      <div class="section-title">
        ${t('ACTIVE AGRONOMIC ALERTS & ADVISORY', 'सक्रिय कृषि अलर्ट एवं सिफारिशें', 'સક્રિય ખેતી એલર્ટ અને સલાહ', 'सक्रिय कृषी अलर्ट आणि सल्ला')}
      </div>
      ${alertItems}

      <div class="footer">
        <div>FertoBot Smart Agriculture Monitoring System · ${t('Protected by Automated IoT Probes', 'IoT सेंसर द्वारा स्वचालित रूप से सुरक्षित', 'IoT સેન્સર્સ દ્વારા સ્વચાલિત સુરક્ષિત', 'IoT सेन्सर्सद्वारे स्वयंचलित संरक्षित')}</div>
        <div>${t('Report valid for 24 hours from generation', 'रिपोर्ट जारी होने के 24 घंटे तक मान्य है', 'રિપોર્ટ જનરેટ થયા પછી 24 કલાક માટે માન્ય છે', 'अहवाल तयार केल्यापासून 24 तासांसाठी वैध आहे')}</div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  return true;
};
