import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'gu' | 'mr';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', flag: '🌾' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', flag: '🚜' },
];

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    gu: string;
    mr: string;
  };
}

// Global dictionary for common terms
export const translations: Translations = {
  // Navigation & Sections
  main: { en: 'MAIN', hi: 'मुख्य', gu: 'મુખ્ય', mr: 'मुख्य' },
  fieldOps: { en: 'FIELD OPS', hi: 'फ़ील्ड ऑपरेशंस', gu: 'ખેતર કામગીરી', mr: 'शेत कामकाज' },
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड', gu: 'ડેશબોર્ડ', mr: 'डॅशबोर्ड' },
  overview: { en: 'Overview', hi: 'अवलोकन', gu: 'વિહંગાવલોકન', mr: 'आढावा' },
  'voice-chatbot': { en: 'Voice Assistant', hi: 'वॉइस असिस्टेंट', gu: 'વોઇસ આસિસ્ટન્ટ', mr: 'व्हॉइस असिस्टंट' },
  security: { en: 'Security & Alerts', hi: 'सुरक्षा एवं अलर्ट', gu: 'સુરક્ષા અને એલર્ટ', mr: 'सुरक्षा आणि अलर्ट' },
  probes: { en: 'Sensors', hi: 'सेंसर', gu: 'સેન્સર્સ', mr: 'सेन्सर्स' },
  devices: { en: 'Sensors', hi: 'सेंसर', gu: 'સેન્સર્સ', mr: 'सेन्सर्स' },
  irrigation: { en: 'Irrigation', hi: 'सिंचाई', gu: 'સિંચાઈ', mr: 'सिंचन' },
  assistant: { en: 'AI Assistant', hi: 'AI सहायक', gu: 'AI સહાયક', mr: 'AI सहाय्यक' },
  profile: { en: 'Profile', hi: 'प्रोफ़ाइल', gu: 'પ્રોફાઇલ', mr: 'प्रोफाइल' },
  settings: { en: 'Settings', hi: 'सेटिंग्स', gu: 'સેટિંગ્સ', mr: 'सेटिंग्ज' },
  logout: { en: 'Logout', hi: 'लॉग आउट', gu: 'લોગ આઉટ', mr: 'लॉग आउट' },
  deployNode: { en: 'Deploy New Node', hi: 'नया नोड जोड़ें', gu: 'નવું નોડ ઉમેરો', mr: 'नवीन नोड जोडा' },
  systemLogs: { en: 'System Logs', hi: 'सिस्टम लॉग्स', gu: 'સિસ્ટમ લોગ્સ', mr: 'सिस्टम नोंदी' },

  // Topbar & System
  searchPlaceholder: { en: 'Search sensors, nodes, field ID…', hi: 'सेंसर, नोड या फ़ील्ड आईडी खोजें…', gu: 'સેન્સર, નોડ અથવા ખેતર શોધો…', mr: 'सेन्सर, नोड किंवा शेत शोधा…' },
  liveActive: { en: 'LIVE · ACTIVE', hi: 'लाइव · सक्रिय', gu: 'લાઇવ · સક્રિય', mr: 'लाइव्ह · सक्रिय' },
  selectLanguage: { en: 'Select Language', hi: 'भाषा चुनें', gu: 'ભાષા પસંદ કરો', mr: 'भाषा निवडा' },
  english: { en: 'English', hi: 'अंग्रेज़ी', gu: 'અંગ્રેજી', mr: 'इंग्रजी' },
  hindi: { en: 'Hindi', hi: 'हिंदी', gu: 'હિન્દી', mr: 'हिंदी' },
  gujarati: { en: 'Gujarati', hi: 'गुजराती', gu: 'ગુજરાતી', mr: 'गुजराती' },
  marathi: { en: 'Marathi', hi: 'मराठी', gu: 'મરાઠી', mr: 'मराठी' },

  // Greetings & Header
  goodMorning: { en: 'Good Morning', hi: 'शुभ प्रभात', gu: 'સુપ્રભાત', mr: 'शुभ प्रभात' },
  goodAfternoon: { en: 'Good Afternoon', hi: 'शुभ दोपहर', gu: 'શુભ બપોર', mr: 'शुभ दुपार' },
  goodEvening: { en: 'Good Evening', hi: 'शुभ संध्या', gu: 'શુભ સાંજ', mr: 'शुभ संध्याकाळ' },
  farmer: { en: 'Farmer', hi: 'किसान भाई', gu: 'ખેડૂત મિત્ર', mr: 'शेतकरी मित्र' },
  fetchingLiveData: { en: 'Fetching live data from your field nodes…', hi: 'खेत के नोड्स से लाइव डेटा लोड हो रहा है…', gu: 'ખેતરના નોડ્સમાંથી લાઇવ ડેટા લોડ થઈ રહ્યો છે…', mr: 'शेतातील नोड्समधून थेट डेटा लोड होत आहे…' },
  updated: { en: 'Updated', hi: 'अपडेटेड', gu: 'અપડેટ થયેલ', mr: 'अपडेट केले' },
  cycle5Min: { en: '5-min cycle', hi: '5 मिनट चक्र', gu: '5 મિનિટ ચક્ર', mr: '5 मिनिटांचे चक्र' },
  justNow: { en: 'Just now', hi: 'अभी', gu: 'હમણાં જ', mr: 'आत्ताच' },
  refreshNow: { en: 'Refresh now', hi: 'अभी रीफ़्रेश करें', gu: 'હમણાં રિફ્રેશ કરો', mr: 'आता रिफ्रेश करा' },
  extractReport: { en: 'Extract Report', hi: 'रिपोर्ट डाउनलोड करें', gu: 'રિપોર્ટ ડાઉનલોડ કરો', mr: 'अहवाल डाउनलोड करा' },
  downloadCsv: { en: 'Download CSV (Excel)', hi: 'CSV (एक्सेल) डाउनलोड करें', gu: 'CSV (એક્સેલ) ડાઉનલોડ કરો', mr: 'CSV (एक्सेल) डाउनलोड करा' },
  printPdf: { en: 'Print / Save PDF', hi: 'प्रिंट / PDF सेव करें', gu: 'પ્રિન્ટ / PDF સેવ કરો', mr: 'प्रिंट / PDF सेव्ह करा' },
  reportDownloaded: { en: 'Field report extracted successfully', hi: 'खेत की रिपोर्ट सफलतापूर्वक तैयार हो गई', gu: 'ખેતરનો રિપોર્ટ સફળતાપૂર્વક તૈયાર થયો', mr: 'शेताचा अहवाल यशस्वीरित्या तयार झाला' },

  // Crops & Field Cultivation ("खेती क्या हुई है")
  cropsPlanted: { en: 'Crops in Cultivation', hi: 'खेत की फसलें (खेती विवरण)', gu: 'ખેતરમાં વાવેતર થયેલ પાક', mr: 'शेतातील पिके (लागवड तपशील)' },
  cropSummary: { en: 'Crop & Growth Summary', hi: 'फसल एवं विकास स्थिति', gu: 'પાક અને વિકાસ વિગત', mr: 'पीक आणि वाढीचा तपशील' },
  wheat: { en: 'Wheat', hi: 'गेहूं', gu: 'ઘઉં', mr: 'गहू' },
  cotton: { en: 'Cotton', hi: 'कपास', gu: 'કપાસ', mr: 'कापूस' },
  mustard: { en: 'Mustard', hi: 'सरसों', gu: 'રાઈ (સરસવ)', mr: 'मोहरी' },
  sugarcane: { en: 'Sugarcane', hi: 'गन्ना', gu: 'શેરડી', mr: 'ऊस' },
  chickpea: { en: 'Gram (Chana)', hi: 'चना', gu: 'ચણા', mr: 'हरभरा' },
  cropStage: { en: 'Growth Stage', hi: 'वृद्धि अवस्था', gu: 'વિકાસ તબક્કો', mr: 'वाढीचा टप्पा' },
  sownDate: { en: 'Sown Date', hi: 'बुआई की तारीख', gu: 'વાવણી તારીખ', mr: 'पेरणी तारीख' },
  acreage: { en: 'Area', hi: 'क्षेत्रफल', gu: 'વિસ્તાર', mr: 'क्षेत्रफळ' },
  idealMoisture: { en: 'Ideal Moisture', hi: 'उचित नमी', gu: 'યોગ્ય ભેજ', mr: 'योग्य ओलावा' },
  cropReadings: { en: 'Crop Readings', hi: 'फसल स्तर रीडिंग', gu: 'પાક સેન્સર રીડિંગ', mr: 'पीक सेन्सर रीडिंग' },
  healthIndex: { en: 'Health Index', hi: 'स्वास्थ्य सूचकांक', gu: 'તંદુરસ્તી ઇન્ડેક્સ', mr: 'आरोग्य निर्देशांक' },
  daysSinceSowing: { en: 'Days After Sowing', hi: 'बुआई के बाद के दिन', gu: 'વાવણી પછીના દિવસો', mr: 'पेरणीनंतरचे दिवस' },
  optimal: { en: 'Optimal', hi: 'उत्तम', gu: 'ઉત્તમ', mr: 'उत्तम' },
  needsWater: { en: 'Needs Irrigation', hi: 'सिंचाई आवश्यक', gu: 'સિંચાઈ જરૂરી', mr: 'पाणी आवश्यक' },
  attention: { en: 'Attention', hi: 'ध्यान दें', gu: 'ધ્યાન આપો', mr: 'लक्ष द्या' },

  // Dashboard Stats
  soilMoisture: { en: 'Soil Moisture', hi: 'मिट्टी की नमी', gu: 'જમીનનો ભેજ', mr: 'जमिनीतील ओलावा' },
  temperature: { en: 'Temperature', hi: 'तापमान', gu: 'તાપમાન', mr: 'तापमान' },
  phLevel: { en: 'pH Level', hi: 'पीएच स्तर', gu: 'pH સ્તર', mr: 'pH पातळी' },
  conductivity: { en: 'Conductivity', hi: 'चालकता (EC)', gu: 'વિદ્યુત વાહકતા (EC)', mr: 'विद्युत वाहकता (EC)' },

  // Feed & Alerts
  activeIntelligence: { en: 'Active Intelligence', hi: 'सक्रिय अलर्ट एवं सूचनाएं', gu: 'સક્રિય એલર્ટ અને માહિતી', mr: 'सक्रिय सूचना आणि माहिती' },
  realTimeAlerts: { en: 'Real-time alerts and system diagnostics', hi: 'रीयल-टाइम अलर्ट और सिस्टम निगरानी', gu: 'રીઅલ-ટાઇમ એલર્ટ અને સિસ્ટમ મોનિટરિંગ', mr: 'थेट अलर्ट आणि सिस्टम निरीक्षण' },
  all: { en: 'ALL', hi: 'सभी', gu: 'બધા', mr: 'सर्व' },
  critical: { en: 'CRITICAL', hi: 'गंभीर', gu: 'ગંભીર', mr: 'गंभीर' },
  warning: { en: 'WARNING', hi: 'चेतावनी', gu: 'ચેતવણી', mr: 'इशारा' },
  criticalInterference: { en: 'CRITICAL INTERFERENCE', hi: 'गंभीर अलर्ट', gu: 'ગંભીર વિક્ષેપ', mr: 'गंभीर हस्तक्षेप' },
  resourceEnvironmental: { en: 'RESOURCE & ENVIRONMENTAL STATE', hi: 'संसाधन एवं पर्यावरण स्थिति', gu: 'સંસાધન અને પર્યાવરણીય સ્થિતિ', mr: 'संसाधन आणि पर्यावरणीय स्थिती' },
  systemUpdate: { en: 'SYSTEM UPDATE', hi: 'सिस्टम अपडेट', gu: 'સિસ્ટમ અપડેટ', mr: 'સિસ્ટમ અપડેટ' },
  dispatchSecurity: { en: 'Dispatch Security', hi: 'सुरक्षा भेजें', gu: 'સુરક્ષા મોકલો', mr: 'सुरक्षा पाठवा' },
  acknowledge: { en: 'Acknowledge', hi: 'स्वीकारें', gu: 'સ્વીકારો', mr: 'स्वीकारा' },
  dismiss: { en: 'Dismiss', hi: 'खारिज करें', gu: 'બંધ કરો', mr: 'बंद करा' },
  viewAllAlerts: { en: 'View all alerts', hi: 'सभी अलर्ट देखें', gu: 'બધા એલર્ટ જુઓ', mr: 'सर्व अलर्ट पहा' },
  allSystemsNominal: { en: 'All systems nominal', hi: 'सभी सिस्टम सामान्य हैं', gu: 'બધી સિસ્ટમ સામાન્ય છે', mr: 'सर्व यंत्रणा सुरळीत आहेत' },
  noActiveAlertsDetected: { en: 'No active alerts or anomalies detected', hi: 'कोई सक्रिय अलर्ट या समस्या नहीं है', gu: 'કોઈ સક્રિય એલર્ટ અથવા ક્ષતિ નથી', mr: 'कोणतीही सक्रिय चेतावणी नाही' },
  loadingIntelligence: { en: 'Loading intelligence feed…', hi: 'अलर्ट फ़ीड लोड हो रहा है…', gu: 'એલર્ટ લોડ થઈ રહ્યા છે…', mr: 'अलर्ट लोड होत आहेत…' },

  // Farm Health Score
  farmHealthScore: { en: 'Farm Health Score', hi: 'फार्म हेल्थ स्कोर', gu: 'ફાર્મ હેલ્થ સ્કોર', mr: 'शेत आरोग्य निर्देशांक' },
  thisWeekTrend: { en: '+2.4% this week', hi: '+2.4% इस सप्ताह', gu: 'આ અઠવાડિયે +2.4%', mr: 'या आठवड्यात +2.4%' },
  totalNodes: { en: 'Total Nodes', hi: 'कुल नोड्स', gu: 'કુલ નોડ્સ', mr: 'एकूण नोड्स' },
  online: { en: 'Online', hi: 'सक्रिय', gu: 'ઓનલાઇન', mr: 'सक्रिय' },
  activeAlertsCount: { en: 'Active Alerts', hi: 'सक्रिय अलर्ट', gu: 'સક્રિય એલર્ટ', mr: 'सक्रिय अलर्ट' },

  // Toggles
  smartWater: { en: 'Smart Water Pump', hi: 'स्मार्ट वाटर पंप', gu: 'સ્માર્ટ વોટર પંપ', mr: 'स्मार्ट वॉटर पंप' },
  smartKhaad: { en: 'Smart Khaad Pump', hi: 'स्मार्ट खाद पंप', gu: 'સ્માર્ટ ખાતર પંપ', mr: 'स्मार्ट खत पंप' },
  manualMode: { en: 'Manual mode', hi: 'मैनुअल मोड', gu: 'મેન્યુઅલ મોડ', mr: 'मॅन्युअल मोड' },
  activeBalanced: { en: 'Active · NPK balanced', hi: 'सक्रिय · NPK संतुलित', gu: 'સક્રિય · NPK સંતુલિત', mr: 'सक्रिय · NPK संतुलित' },
  manualAdj: { en: 'Manual adjustment', hi: 'मैनुअल समायोजन', gu: 'મેન્યુઅલ ગોઠવણ', mr: 'मॅन्युअल समायोजन' },
  enabled: { en: 'ENABLED', hi: 'सक्रिय', gu: 'સક્રિય', mr: 'सुरू' },
  disabled: { en: 'DISABLED', hi: 'निष्क्रिय', gu: 'નિષ્ક્રિય', mr: 'बंद' },
  nextCycle6am: { en: 'Next cycle · 06:00 AM', hi: 'अगला चक्र · सुबह 06:00 बजे', gu: 'આગામી ચક્ર · સવારે 06:00', mr: 'पुढील फेरी · सकाळी 06:00' },

  // Recommendations
  khaadAdvice: { en: 'Khaad (Fertilizer) Advice', hi: 'खाद की सलाह', gu: 'ખાતરની સલાહ', mr: 'खताचा सल्ला' },
  soilBased: { en: 'Based on your soil health', hi: 'आपकी मिट्टी के अनुसार', gu: 'જમીનની સ્થિતિ અનુસાર', mr: 'मातीच्या आरोग्यावर आधारित' },
  urea: { en: 'Urea', hi: 'यूरिया', gu: 'યૂરિયા', mr: 'युरिया' },
  ureaLowN: { en: 'Apply 20kg/acre. Your soil Nitrogen is currently low.', hi: '20kg/एकड़ डालें। मिट्टी में नाइट्रोजन की कमी है।', gu: '20 કિગ્રા/એકર નાખો. જમીનમાં નાઇટ્રોજન ઓછો છે.', mr: '20 किलो/एकर टाका. मातीत नायट्रोजनची कमतरता आहे.' },
  npk: { en: 'NPK 19:19:19', hi: 'NPK 19:19:19', gu: 'NPK 19:19:19', mr: 'NPK 19:19:19' },
  npkLowP: { en: 'Mix 5kg/acre in your drip irrigation for balanced crop growth.', hi: 'फसल की अच्छी वृद्धि के लिए 5kg/एकड़ ड्रिप से दें।', gu: 'પાકના સારા વિકાસ માટે ડ્રિપ દ્વારા 5 કિગ્રા/એકર આપો.', mr: 'पिकांच्या चांगल्या वाढीसाठी ठिबकद्वारे 5 किलो/एकर द्या.' },
  compost: { en: 'Desi Khaad (Compost)', hi: 'देसी खाद', gu: 'દેશી ખાતર (છાણીયું)', mr: 'शेणखत (कंपोસ્ટ)' },
  compostAdvice: { en: 'Put one tractor trolley before the next season to soften the soil.', hi: 'मिट्टी को नरम करने के लिए अगली फसल से पहले एक ट्रॉली डालें।', gu: 'જમીનને પોચી બનાવવા આગામી સીઝન પહેલા એક ટ્રોલી નાખો.', mr: 'जमीन भुसभुशीत करण्यासाठी पुढील हंगामापूर्वी एक ट्रॉली टाका.' },
  cropHealthy: { en: 'Crop is Healthy!', hi: 'फसल स्वस्थ है!', gu: 'પાક તંદુરસ્ત છે!', mr: 'पीक निरोगी आहे!' },
  cropHealthySub: { en: 'No additional fertilizers needed right now.', hi: 'अभी किसी अतिरिक्त खाद की आवश्यकता नहीं है।', gu: 'હાલમાં કોઈ વધારાના ખાતરની જરૂર નથી.', mr: 'सध्या कोणत्याही अतिरिक्त खताची गरज नाही.' },

  pestControl: { en: 'Keetnashak (Pest Control)', hi: 'कीटनाशक (Pest Control)', gu: 'જંતુનાશક દવા અને રક્ષણ', mr: 'कीटकनाशक आणि पीक संरक्षण' },
  protectCrop: { en: 'Protect your crop from insects', hi: 'अपनी फसल को कीड़ों से बचाएं', gu: 'પાકને જીવાતથી બચાવો', mr: 'पिकांचे किडींपासून रक्षण करा' },
  neemOil: { en: 'Neem ka Tel (Neem Oil)', hi: 'नीम का तेल', gu: 'લીમડાનું તેલ (નીમ ઓઇલ)', mr: 'कडुनिंबाचे तेल (नीम ऑइल)' },
  neemAdvice: { en: 'Organic spray. Use in the evening to keep whiteflies away.', hi: 'शाम को स्प्रे करें ताकि सफेद मक्खी दूर रहे।', gu: 'ઓર્ગેનિક છંટકાવ. સફેદ માખી રોકવા સાંજે છાંટો.', mr: 'सेंद्रिय फवारणी. पांढरी माशी रोखण्यासाठी संध्याकाळी फवारा.' },
  fungicide: { en: 'Fungicide Dawaai', hi: 'फफूंद नाशक दवाई', gu: 'ફૂગનાશક દવા', mr: 'बुरशीनाशक औषध' },
  fungiAdvice: { en: 'Apply if there\'s too much moisture in the air to stop leaf fungus.', hi: 'नमी ज्यादा होने पर पत्तों को फंगस से बचाने के लिए इस्तेमाल करें।', gu: 'ભેજ વધુ હોય ત્યારે પાન પર ફૂગ રોકવા છંટકાવ કરો.', mr: 'हवेत ओलावा जास्त असल्यास पानांवरील बुरशी रोखण्यासाठी वापरा.' },
  noPests: { en: 'No Pest Danger', hi: 'कोई कीड़े का खतरा नहीं', gu: 'જીવાતનો કોઈ ભય નથી', mr: 'किडींचा धोका नाही' },
  noPestsSub: { en: 'Conditions are not favorable for pests.', hi: 'अभी मौसम कीड़ों के लिए अनुकूल नहीं है।', gu: 'હાલનું વાતાવરણ જીવાતો માટે અનુકૂળ નથી.', mr: 'सध्याचे वातावरण किडींसाठी अनुकूल नाही.' },

  // Nutrients
  nutrientConcentration: { en: 'Nutrient Concentration', hi: 'पोषक तत्व सांद्रता', gu: 'પોષક તત્વોની સાંદ્રતા', mr: 'पोषक घटकांचे प्रमाण' },
  npkRealTime: { en: 'NPK · Real-time soil analysis', hi: 'NPK · रीयल-टाइम मिट्टी विश्लेषण', gu: 'NPK · રીઅલ-ટાઇમ જમીન વિશ્લેષણ', mr: 'NPK · रिअल-टाइम माती विश्लेषण' },
  fullNutrient: { en: 'FULL NUTRIENT', hi: 'पूर्ण पोषक तत्व', gu: 'સંપૂર્ણ પોષક તત્વ', mr: 'पूर्ण पोषण' },
  nitrogen: { en: 'Nitrogen', hi: 'नाइट्रोजन', gu: 'નાઇટ્રોજન (N)', mr: 'नायट्रोजन (N)' },
  phosphorus: { en: 'Phosphorus', hi: 'फॉस्फोरस', gu: 'ફોસ્ફરસ (P)', mr: 'फॉस्फरस (P)' },
  potassium: { en: 'Potassium', hi: 'पोटैशियम', gu: 'પોટેશિયમ (K)', mr: 'પોટૅશિયમ (K)' },
  loadingNutrient: { en: 'Loading nutrient data…', hi: 'पोषक तत्व डेटा लोड हो रहा है…', gu: 'પોષક તત્વ ડેટા લોડ થઈ રહ્યો છે…', mr: 'पोषक तत्वांचा डेटा लोड होत आहे…' },

  // Spatial Monitoring
  spatialMonitoring: { en: 'Spatial Monitoring', hi: 'स्थानिक निगरानी', gu: 'ક્ષેત્રીય સ્પેસિયલ મોનિટરિંગ', mr: 'स्थानिक शेत निरीक्षण' },
  geoNodeStreaming: { en: 'Geo-node streaming · 4 active zones', hi: 'जियो-नोड स्ट्रीमिंग · 4 सक्रिय ज़ोन', gu: 'જીઓ-નોડ સ્ટ્રીમિંગ · 4 સક્રિય ઝોન', mr: 'जिओ-નોડ સ્ટ્રીમિંગ · 4 સક્રિય ઝોન' },
  liveStream: { en: 'LIVE STREAM', hi: 'लाइव स्ट्रीम', gu: 'લાઇવ સ્ટ્રીમ', mr: 'थेट प्रवाह' },
  spatialView: { en: 'Spatial View', hi: 'स्थानिक दृश्य', gu: 'સ્પેસિયલ વ્યુ', mr: 'स्थानिक दृश्य' },
  activeZones4: { en: 'Active zones: 4', hi: 'सक्रिय ज़ोन: 4', gu: 'સક્રિય ઝોન: 4', mr: 'सक्रिय झोन: 4' },
  nodeManagement: { en: 'Node Management', hi: 'नोड प्रबंधन', gu: 'નોડ સંચાલન', mr: 'नोड व्यवस्थापन' },
  valleyRidge: { en: 'Valley Ridge · Sector 5', hi: 'वैली रिज · सेक्टर 5', gu: 'વેલી રિજ · સેક્ટર 5', mr: 'व्हॅली रिज · सेक्टर 5' },

  // AI CTA
  aiCropAdvisory: { en: 'AI Crop Advisory', hi: 'AI फसल सलाहकार', gu: 'AI પાક સલાહકાર', mr: 'AI पीक सल्लागार' },
  aiCtaSub: { en: 'VOICE + CHAT ASSISTANT · TAP TO OPEN', hi: 'वॉइस एवं चैट असिस्टेंट · खोलने के लिए टैप करें', gu: 'વોઇસ + ચેટ આસિસ્ટન્ટ · ખોલવા માટે ટેપ કરો', mr: 'व्हॉइस + चॅट सहाय्यक · उघडण्यासाठी टॅप करा' },

  // Right Column Mini-widgets
  liveFeed: { en: 'Live Feed', hi: 'लाइव कैमरा फ़ीड', gu: 'લાઇવ કેમેરા ફીડ', mr: 'थेट कॅमेरा फीड' },
  recording: { en: 'RECORDING', hi: 'रिकॉर्डिंग जारी', gu: 'રેકોર્ડિંગ શરૂ', mr: 'रेकॉर्डिंग सुरू' },
  recentAlerts: { en: 'Recent Alerts', hi: 'हाल के अलर्ट', gu: 'તાજેતરના એલર્ટ', mr: 'अलीकडील सूचना' },
  viewAll: { en: 'View all →', hi: 'सभी देखें →', gu: 'બધા જુઓ →', mr: 'सर्व पहा →' },
  noActiveAlerts: { en: 'No active alerts', hi: 'कोई सक्रिय अलर्ट नहीं', gu: 'કોઈ સક્રિય એલર્ટ નથી', mr: 'कोणतीही सक्रिय चेतावणी नाही' },
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
      return saved === 'hi' || saved === 'en' || saved === 'gu' || saved === 'mr' ? (saved as Language) : 'en';
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
      return translations[key][lang] || translations[key].en;
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
