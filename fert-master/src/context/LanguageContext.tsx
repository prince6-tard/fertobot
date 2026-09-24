import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

// Global dictionary for common terms
export const translations: Translations = {
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  overview: { en: 'Overview', hi: 'अवलोकन' },
  probes: { en: 'Probes', hi: 'सेंसर' },
  irrigation: { en: 'Irrigation', hi: 'सिंचाई' },
  security: { en: 'Security', hi: 'सुरक्षा' },
  assistant: { en: 'Assistant', hi: 'सहायक' },
  profile: { en: 'Profile', hi: 'प्रोफ़ाइल' },
  settings: { en: 'Settings', hi: 'सेटिंग्स' },
  logout: { en: 'Logout', hi: 'लॉग आउट' },
  
  // Dashboard terms
  activeProbes: { en: 'Active Probes', hi: 'सक्रिय सेंसर' },
  criticalAlerts: { en: 'Critical Alerts', hi: 'महत्वपूर्ण अलर्ट' },
  soilHealth: { en: 'Avg Soil Health', hi: 'औसत मिट्टी स्वास्थ्य' },
  avgTemp: { en: 'Avg Temp', hi: 'औसत तापमान' },
  
  // Toggles
  smartWater: { en: 'Smart Water Pump', hi: 'स्मार्ट वाटर पंप' },
  smartKhaad: { en: 'Smart Khaad Pump', hi: 'स्मार्ट खाद पंप' },
  manualMode: { en: 'Manual mode', hi: 'मैनुअल मोड' },
  activeBalanced: { en: 'Active · NPK balanced', hi: 'सक्रिय · NPK संतुलित' },
  manualAdj: { en: 'Manual adjustment', hi: 'मैनुअल समायोजन' },
  
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
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');

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
