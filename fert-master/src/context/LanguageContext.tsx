import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

// Global dictionary for common terms
export const translations: Translations = {
  // Navigation & Sections
  main: { en: 'MAIN', hi: 'मुख्य' },
  fieldOps: { en: 'FIELD OPS', hi: 'फ़ील्ड ऑपरेशंस' },
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  overview: { en: 'Overview', hi: 'अवलोकन' },
  'voice-chatbot': { en: 'Voice Assistant', hi: 'वॉइस असिस्टेंट' },
  security: { en: 'Security & Alerts', hi: 'सुरक्षा एवं अलर्ट' },
  probes: { en: 'Sensors', hi: 'सेंसर' },
  devices: { en: 'Sensors', hi: 'सेंसर' },
  irrigation: { en: 'Irrigation', hi: 'सिंचाई' },
  assistant: { en: 'AI Assistant', hi: 'AI सहायक' },
  profile: { en: 'Profile', hi: 'प्रोफ़ाइल' },
  settings: { en: 'Settings', hi: 'सेटिंग्स' },
  logout: { en: 'Logout', hi: 'लॉग आउट' },
  deployNode: { en: 'Deploy New Node', hi: 'नया नोड जोड़ें' },
  systemLogs: { en: 'System Logs', hi: 'सिस्टम लॉग्स' },

  // Topbar
  searchPlaceholder: { en: 'Search sensors, nodes, field ID…', hi: 'सेंसर, नोड या फ़ील्ड आईडी खोजें…' },
  liveActive: { en: 'LIVE · ACTIVE', hi: 'लाइव · सक्रिय' },

  // Greetings & Header
  goodMorning: { en: 'Good Morning', hi: 'शुभ प्रभात' },
  goodAfternoon: { en: 'Good Afternoon', hi: 'शुभ दोपहर' },
  goodEvening: { en: 'Good Evening', hi: 'शुभ संध्या' },
  farmer: { en: 'Farmer', hi: 'किसान भाई' },
  fetchingLiveData: { en: 'Fetching live data from your field nodes…', hi: 'खेत के नोड्स से लाइव डेटा लोड हो रहा है…' },
  updated: { en: 'Updated', hi: 'अपडेटेड' },
  cycle5Min: { en: '5-min cycle', hi: '5 मिनट चक्र' },
  justNow: { en: 'Just now', hi: 'अभी' },
  extractReport: { en: 'Extract Report', hi: 'रिपोर्ट डाउनलोड करें' },
  downloadCsv: { en: 'Download CSV (Excel)', hi: 'CSV (एक्सेल) डाउनलोड करें' },
  printPdf: { en: 'Print / Save PDF', hi: 'प्रिंट / PDF सेव करें' },
  reportDownloaded: { en: 'Field report extracted successfully', hi: 'खेत की रिपोर्ट सफलतापूर्वक तैयार हो गई' },

  // Dashboard Stats
  soilMoisture: { en: 'Soil Moisture', hi: 'मिट्टी की नमी' },
  temperature: { en: 'Temperature', hi: 'तापमान' },
  phLevel: { en: 'pH Level', hi: 'पीएच स्तर' },
  conductivity: { en: 'Conductivity', hi: 'चालकता' },

  // Feed & Alerts
  activeIntelligence: { en: 'Active Intelligence', hi: 'सक्रिय अलर्ट एवं सूचनाएं' },
  realTimeAlerts: { en: 'Real-time alerts and system diagnostics', hi: 'रीयल-टाइम अलर्ट और सिस्टम निगरानी' },
  all: { en: 'ALL', hi: 'सभी' },
  critical: { en: 'CRITICAL', hi: 'गंभीर' },
  warning: { en: 'WARNING', hi: 'चेतावनी' },
  criticalInterference: { en: 'CRITICAL INTERFERENCE', hi: 'गंभीर अलर्ट' },
  resourceEnvironmental: { en: 'RESOURCE & ENVIRONMENTAL STATE', hi: 'संसाधन एवं पर्यावरण स्थिति' },
  systemUpdate: { en: 'SYSTEM UPDATE', hi: 'सिस्टम अपडेट' },
  dispatchSecurity: { en: 'Dispatch Security', hi: 'सुरक्षा भेजें' },
  acknowledge: { en: 'Acknowledge', hi: 'स्वीकारें' },
  dismiss: { en: 'Dismiss', hi: 'खारिज करें' },
  viewAllAlerts: { en: 'View all alerts', hi: 'सभी अलर्ट देखें' },
  allSystemsNominal: { en: 'All systems nominal', hi: 'सभी सिस्टम सामान्य हैं' },
  noActiveAlertsDetected: { en: 'No active alerts or anomalies detected', hi: 'कोई सक्रिय अलर्ट या समस्या नहीं है' },
  loadingIntelligence: { en: 'Loading intelligence feed…', hi: 'अलर्ट फ़ीड लोड हो रहा है…' },

  // Farm Health Score
  farmHealthScore: { en: 'Farm Health Score', hi: 'फार्म हेल्थ स्कोर' },
  thisWeekTrend: { en: '+2.4% this week', hi: '+2.4% इस सप्ताह' },
  totalNodes: { en: 'Total Nodes', hi: 'कुल नोड्स' },
  online: { en: 'Online', hi: 'सक्रिय' },
  activeAlertsCount: { en: 'Active Alerts', hi: 'सक्रिय अलर्ट' },

  // Toggles
  smartWater: { en: 'Smart Water Pump', hi: 'स्मार्ट वाटर पंप' },
  smartKhaad: { en: 'Smart Khaad Pump', hi: 'स्मार्ट खाद पंप' },
  manualMode: { en: 'Manual mode', hi: 'मैनुअल मोड' },
  activeBalanced: { en: 'Active · NPK balanced', hi: 'सक्रिय · NPK संतुलित' },
  manualAdj: { en: 'Manual adjustment', hi: 'मैनुअल समायोजन' },
  enabled: { en: 'ENABLED', hi: 'सक्रिय' },
  disabled: { en: 'DISABLED', hi: 'निष्क्रिय' },
  nextCycle6am: { en: 'Next cycle · 06:00 AM', hi: 'अगला चक्र · सुबह 06:00 बजे' },

  // Recommendations
  khaadAdvice: { en: 'Khaad (Fertilizer) Advice', hi: 'खाद की सलाह' },
  soilBased: { en: 'Based on your soil health', hi: 'आपकी मिट्टी के अनुसार' },
  urea: { en: 'Urea', hi: 'यूरिया' },
  ureaLowN: { en: 'Apply 20kg/acre. Your soil Nitrogen is currently low.', hi: '20kg/एकड़ डालें। मिट्टी में नाइट्रोजन की कमी है।' },
  npk: { en: 'NPK 19:19:19', hi: 'NPK 19:19:19' },
  npkLowP: { en: 'Mix 5kg/acre in your drip irrigation for balanced crop growth.', hi: 'फसल की अच्छी वृद्धि के लिए 5kg/एकड़ ड्रिप से दें।' },
  compost: { en: 'Desi Khaad (Compost)', hi: 'देसी खाद' },
  compostAdvice: { en: 'Put one tractor trolley before the next season to soften the soil.', hi: 'मिट्टी को नरम करने के लिए अगली फसल से पहले एक ट्रॉली डालें।' },
  cropHealthy: { en: 'Crop is Healthy!', hi: 'फसल स्वस्थ है!' },
  cropHealthySub: { en: 'No additional fertilizers needed right now.', hi: 'अभी किसी अतिरिक्त खाद की आवश्यकता नहीं है।' },

  pestControl: { en: 'Keetnashak (Pest Control)', hi: 'कीटनाशक (Pest Control)' },
  protectCrop: { en: 'Protect your crop from insects', hi: 'अपनी फसल को कीड़ों से बचाएं' },
  neemOil: { en: 'Neem ka Tel (Neem Oil)', hi: 'नीम का तेल' },
  neemAdvice: { en: 'Organic spray. Use in the evening to keep whiteflies away.', hi: 'शाम को स्प्रे करें ताकि सफेद मक्खी दूर रहे।' },
  fungicide: { en: 'Fungicide Dawaai', hi: 'फफूंद नाशक दवाई' },
  fungiAdvice: { en: 'Apply if there\'s too much moisture in the air to stop leaf fungus.', hi: 'नमी ज्यादा होने पर पत्तों को फंगस से बचाने के लिए इस्तेमाल करें।' },
  noPests: { en: 'No Pest Danger', hi: 'कोई कीड़े का खतरा नहीं' },
  noPestsSub: { en: 'Conditions are not favorable for pests.', hi: 'अभी मौसम कीड़ों के लिए अनुकूल नहीं है।' },

  // Nutrients
  nutrientConcentration: { en: 'Nutrient Concentration', hi: 'पोषक तत्व सांद्रता' },
  npkRealTime: { en: 'NPK · Real-time soil analysis', hi: 'NPK · रीयल-टाइम मिट्टी विश्लेषण' },
  fullNutrient: { en: 'FULL NUTRIENT', hi: 'पूर्ण पोषक तत्व' },
  nitrogen: { en: 'Nitrogen', hi: 'नाइट्रोजन' },
  phosphorus: { en: 'Phosphorus', hi: 'फॉस्फोरस' },
  potassium: { en: 'Potassium', hi: 'पोटैशियम' },
  loadingNutrient: { en: 'Loading nutrient data…', hi: 'पोषक तत्व डेटा लोड हो रहा है…' },

  // Spatial Monitoring
  spatialMonitoring: { en: 'Spatial Monitoring', hi: 'स्थानिक निगरानी' },
  geoNodeStreaming: { en: 'Geo-node streaming · 4 active zones', hi: 'जियो-नोड स्ट्रीमिंग · 4 सक्रिय ज़ोन' },
  liveStream: { en: 'LIVE STREAM', hi: 'लाइव स्ट्रीम' },
  spatialView: { en: 'Spatial View', hi: 'स्थानिक दृश्य' },
  activeZones4: { en: 'Active zones: 4', hi: 'सक्रिय ज़ोन: 4' },
  nodeManagement: { en: 'Node Management', hi: 'नोड प्रबंधन' },
  valleyRidge: { en: 'Valley Ridge · Sector 5', hi: 'वैली रिज · सेक्टर 5' },

  // AI CTA
  aiCropAdvisory: { en: 'AI Crop Advisory', hi: 'AI फसल सलाहकार' },
  aiCtaSub: { en: 'VOICE + CHAT ASSISTANT · TAP TO OPEN', hi: 'वॉइस एवं चैट असिस्टेंट · खोलने के लिए टैप करें' },

  // Right Column Mini-widgets
  liveFeed: { en: 'Live Feed', hi: 'लाइव कैमरा फ़ीड' },
  recording: { en: 'RECORDING', hi: 'रिकॉर्डिंग जारी' },
  recentAlerts: { en: 'Recent Alerts', hi: 'हाल के अलर्ट' },
  viewAll: { en: 'View all →', hi: 'सभी देखें →' },
  noActiveAlerts: { en: 'No active alerts', hi: 'कोई सक्रिय अलर्ट नहीं' },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('fertobot_lang');
      return saved === 'hi' || saved === 'en' ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('fertobot_lang', newLang);
    } catch { /* silent */ }
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][lang];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
