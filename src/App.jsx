import { useState, useEffect, useRef, useCallback, useMemo } from "react";
const API_BASE_URL = "http://127.0.0.1:8001";

// ── PREMIUM SVG ICONS (Lucide Style) ───────────────────────────
const Icons = {
  Dash: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  Med: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>,
  AI: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>,
  Chart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>,
  Log: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M17.41 22H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.59a2 2 0 0 1 1.41.59l4.42 4.42a2 2 0 0 1 .58 1.41V20a2 2 0 0 1-2 2Z" /><path d="M16 14H8" /><path d="M16 18H8" /><path d="M9 10H8" /></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>,
  Sun: ({ color }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
  Moon: ({ color }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
  SOS: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
  Shield: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Back: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
  User: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Link: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10 13 4-4" /><path d="M12 7c.32 0 .63.03.95.09.84.14 1.5.58 2.33 1.41.41.41.59.59.7 1.05V10c0 .9-.36 1.76-1 2.4l-3 3a3.42 3.42 0 0 1-4.8 0 3.42 3.42 0 0 1 0-4.8l1-1" /><path d="m14 11-4 4" /><path d="M12 17c-.32 0-.63-.03-.95-.09-.84-.14-1.5-.58-2.33-1.41-.41-.41-.59-.59-.7-1.05V14c0-.9.36-1.76 1-2.4l3-3a3.42 3.42 0 0 1 4.8 0 3.42 3.42 0 0 1 0 4.8l-1 1" /></svg>,
  Eye: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  Heart: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  Leaf: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8a8 8 0 0 1-8 8h-2c0 1.1.9 2 2 2" /><path d="M19 2c-5.07 1.14-6 3.33-8 8" /></svg>,
  Palette: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" /><circle cx="8.5" cy="7.5" r=".5" /><circle cx="6.5" cy="12.5" r=".5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.39 2.3-1.03.61-.64 1.7-.33 2.7.73 1 .6 2 1 3 1a6 6 0 0 0 6-6c0-5.5-4.5-10-10-10Z" /></svg>,
  House: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  Call: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
  Diamond: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 12L2 9z" /><path d="M11 3 8 9l4 12 4-12-3-6" /><path d="M2 9h20" /></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Id: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M15 13H13a2 2 0 0 0-2 2v2" /></svg>,
  Flame: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.256 1.254-3.124" /></svg>,
  Quote: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" opacity="0.4"><path d="M14.017 21L14.017 18C14.017 16.899 14.899 16.017 16 16.017H19C19.552 16.017 20 15.569 20 15.017V10.017C20 9.465 19.552 9.017 19 9.017H15C14.448 9.017 14 8.569 14 8.017V5.017C14 4.465 14.448 4.017 15 4.017H20C21.105 4.017 22 4.912 22 6.017V15.017C22 18.33 19.33 21 16 21H14.017ZM3.017 21V18C3.017 16.899 3.899 16.017 5 16.017H8C8.552 16.017 9 15.569 9 15.017V10.017C9 9.465 8.552 9.017 8 9.017H4C3.448 9.017 3 8.569 3 8.017V5.017C3 4.465 3.448 4.017 4 4.017H9C10.105 4.017 11 4.912 11 6.017V15.017C11 18.33 8.33 21 5 21H3.017Z" /></svg>,
};


const T = {
  en: { dashboard: "Dashboard", medications: "Medications", aiAdvisor: "AI Advisor", analytics: "Analytics", symptoms: "Symptoms", vaccinations: "Vaccinations", appointments: "Appointments", settings: "Settings", goodMorning: "Good Morning", markTaken: "Mark Taken ", taken: " Taken", addMed: "Add Med", healthScore: "Health Score", streak: "Streak", interactions: "Interactions", aiInsights: "AI Insights", dailyProgress: "Daily Progress", safetyDash: "Safety Dashboard", drugInteraction: "Drug Interaction Checker", emergencySOS: "Emergency SOS", weeklyReport: "Download Report", moodCheck: "How are you feeling?", langName: "English" },
  hi: { dashboard: "डैशबोर्ड", medications: "दવાइयाँ", aiAdvisor: "AI सलाहकार", analytics: "विश्लेषण", symptoms: "लक्षण", vaccinations: "टीकाकरण", appointments: "अपॉइंटमेंट", settings: "सेटिंग्स", goodMorning: "सुप्रभात", markTaken: "ली ", taken: " ली", addMed: "दवा जोड़ें", healthScore: "स्वास्थ्य स्कोर", streak: "स्ट्रीक", interactions: "इंटरेक्शन", aiInsights: "AI अंतर्दृष्टि", dailyProgress: "दैनिक प्रगति", safetyDash: "सुरक्षा डैशबोर्ड", drugInteraction: "दवा इंटरेक्शन चेकर", emergencySOS: "आपातकालीन SOS", weeklyReport: "रिपोर्ट डाउनलोड", moodCheck: "आज आप कैसा महसूस कर रहे हैं?", langName: "हिंदी" },
  gu: { dashboard: "ડૅશબોર્ડ", medications: "દવાઓ", aiAdvisor: "AI સલાહ", analytics: "વિશ્લેષણ", symptoms: "લક્ષણો", vaccinations: "રસીકરણ", appointments: "એપૉઇન્ટમેન્ટ", settings: "સેટિંગ્સ", goodMorning: "સુ-પ્રભાત", markTaken: "લીધી ", taken: " લીધી", addMed: "દવા ઉમેરો", healthScore: "સ્વાસ્થ્ય સ્કોર", streak: "સ્ટ્રીક", interactions: "ઇન્ટરેક્શન", aiInsights: "AI સૂઝ", dailyProgress: "દૈનિક પ્રગતિ", safetyDash: "સુરક્ષા ડૅશ", drugInteraction: "ડ્રગ ઇન્ટરેક્શન ચેકર", emergencySOS: "ઇમર્જન્સી SOS", weeklyReport: "રિપૉર્ટ ડાઉનલૉડ", moodCheck: "આજે તમે કેવું અનુભવો છો?", langName: "ગુજરાતી" },
};

const DRUG_INTERACTIONS = [
  { drugs: ["warfarin", "aspirin"], severity: "HIGH", effect: "Major bleeding risk. Avoid unless prescribed together with monitoring." },
  { drugs: ["lisinopril", "ibuprofen"], severity: "HIGH", effect: "NSAIDs reduce ACE inhibitor effectiveness and can worsen kidney function." },
  { drugs: ["metformin", "alcohol"], severity: "HIGH", effect: "Risk of lactic acidosis. Avoid alcohol while taking Metformin." },
  { drugs: ["atorvastatin", "grapefruit"], severity: "MEDIUM", effect: "Grapefruit increases statin levels, raising risk of muscle damage." },
  { drugs: ["sertraline", "tramadol"], severity: "HIGH", effect: "Risk of serotonin syndrome. Seek immediate medical attention." },
  { drugs: ["methotrexate", "aspirin"], severity: "HIGH", effect: "Aspirin can increase Methotrexate toxicity dangerously." },
  { drugs: ["digoxin", "amiodarone"], severity: "HIGH", effect: "Amiodarone significantly increases Digoxin blood levels." },
  { drugs: ["clopidogrel", "omeprazole"], severity: "MEDIUM", effect: "Omeprazole may reduce Clopidogrel's antiplatelet effect." },
  { drugs: ["sildenafil", "nitrates"], severity: "HIGH", effect: "Severe drop in blood pressure. This combination can be fatal." },
  { drugs: ["fluoxetine", "maoi"], severity: "HIGH", effect: "Risk of life-threatening serotonin syndrome." },
  { drugs: ["lithium", "ibuprofen"], severity: "HIGH", effect: "NSAIDs can raise Lithium to toxic levels in the blood." },
  { drugs: ["ciprofloxacin", "antacids"], severity: "MEDIUM", effect: "Antacids reduce Ciprofloxacin absorption by up to 90%." },
  { drugs: ["warfarin", "ibuprofen"], severity: "HIGH", effect: "Dramatically increases bleeding risk. Avoid this combination." },
  { drugs: ["amlodipine", "simvastatin"], severity: "MEDIUM", effect: "Amlodipine increases Simvastatin exposure, raising myopathy risk." },
  { drugs: ["metformin", "contrast dye"], severity: "HIGH", effect: "Stop Metformin before contrast imaging to prevent kidney issues." },
  { drugs: ["aspirin", "naproxen"], severity: "MEDIUM", effect: "Both are NSAIDs — combined use increases GI bleeding risk." },
  { drugs: ["alcohol", "acetaminophen"], severity: "HIGH", effect: "Liver damage risk greatly increased. Avoid alcohol with Paracetamol." },
  { drugs: ["potassium", "spironolactone"], severity: "HIGH", effect: "Risk of dangerous hyperkalemia (high potassium)." },
  { drugs: ["levothyroxine", "calcium"], severity: "MEDIUM", effect: "Calcium supplements reduce Levothyroxine absorption. Take 4 hrs apart." },
  { drugs: ["azithromycin", "antacids"], severity: "LOW", effect: "Antacids may slightly reduce Azithromycin absorption." },
];

function checkInteraction(drug1, drug2) {
  const d1 = drug1.toLowerCase().trim(), d2 = drug2.toLowerCase().trim();
  return DRUG_INTERACTIONS.find(i =>
    (i.drugs[0].includes(d1) || d1.includes(i.drugs[0])) && (i.drugs[1].includes(d2) || d2.includes(i.drugs[1])) ||
    (i.drugs[1].includes(d1) || d1.includes(i.drugs[1])) && (i.drugs[0].includes(d2) || d2.includes(i.drugs[0]))
  );
}

// ── QUANTUM MEDICAL THEME (Premium & Unique) ─────────────────────
const COLORS = {
  light: {
    bg: "#f8fafc",
    surface: "rgba(255,255,255,0.9)",
    card: "rgba(255,255,255,0.7)",
    border: "rgba(15, 23, 42, 0.08)",
    text: "#0f172a",
    textMid: "#475569",
    textSoft: "#94a3b8",
    accent: "#0ea5e9", // Electric Blue
    accentLight: "rgba(14, 165, 233, 0.1)",
    accentBorder: "rgba(14, 165, 233, 0.2)",
    navBg: "rgba(255,255,255,0.8)",
    sidebarBg: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
    inputBg: "rgba(241, 245, 249, 0.8)",
    heroGrad: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
    cardShadow: "0 20px 50px rgba(0,0,0,0.05)",
    tag: "rgba(14, 165, 233, 0.1)", 
    tagText: "#0369a1",
    gradStart: "#0ea5e9", gradEnd: "#2dd4bf",
  },
  dark: {
    bg: "#050810",
    surface: "rgba(10, 15, 30, 0.8)",
    card: "rgba(15, 23, 42, 0.5)",
    border: "rgba(255, 255, 255, 0.06)",
    text: "#f8fafc",
    textMid: "#94a3b8",
    textSoft: "#475569",
    accent: "#00f5ff", // Neon Cyan
    accentLight: "rgba(0, 245, 255, 0.08)",
    accentBorder: "rgba(0, 245, 255, 0.25)",
    navBg: "rgba(5, 8, 16, 0.7)",
    sidebarBg: "linear-gradient(180deg, #020617 0%, #0c1a30 100%)",
    inputBg: "rgba(255,255,255,0.03)",
    heroGrad: "linear-gradient(145deg, #020617 0%, #0f172a 100%)",
    cardShadow: "0 25px 60px rgba(0,0,0,0.45)",
    tag: "rgba(0, 245, 255, 0.12)", 
    tagText: "#00f5ff",
    gradStart: "#00f5ff", gradEnd: "#2d5bff",
  },
};

// ── LEARN MORE CONTENT ────────────────────────────────
const LEARN_MORE_DATA = {
  "Medication Management": {
    icon: <Icons.Med />,
    tagline: "Never Miss a Dose Again",
    description: "Our intelligent medication management system goes beyond simple reminders. It learns your daily schedule, adapts to your lifestyle, and guarantees perfect adherence through smart AI-driven notifications.",
    features: [
      { icon: <Icons.AI />, title: "Smart Scheduling", desc: "AI-powered reminders that adapt to your daily routine, sleep patterns, and meal times automatically." },
      { icon: <Icons.Chart />, title: "Refill Tracking", desc: "Get proactive refill alerts 7 days before running out — never scramble for a prescription at the last minute." },
      { icon: <Icons.Log />, title: "Dose History Log", desc: "Complete visual logs of every dose taken, missed, or delayed with full adherence scoring and trends." },
      { icon: <Icons.Settings />, title: "Pharmacy Integration", desc: "Connect directly with your local pharmacy for seamless one-tap refill orders without leaving the app." },
      { icon: <Icons.Chart />, title: "Multi-Device Sync", desc: "Reminders sync instantly across your phone, tablet, smartwatch, and family members' devices." },
      { icon: <Icons.AI />, title: "AI Personalization", desc: "Machine learning analyzes your habits and optimizes reminder timing for maximum adherence over time." },
    ],
    stats: [["98%", "Adherence Rate"], ["50K+", "Daily Reminders"], ["4.9", "User Rating"]],
    accentColor: "#4ba6c7",
  },
  "AI Health Advisor": {
    icon: <Icons.AI />,
    tagline: "Your 24/7 Personal Health Companion",
    description: "Powered by advanced medical AI trained on millions of clinical records, the MedGuard AI Advisor delivers instant, evidence-based health guidance whenever you need it — night or day, no waiting room required.",
    features: [
      { icon: <Icons.Chart />, title: "Symptom Analysis", desc: "Describe your symptoms in plain language and receive evidence-based insights and recommended next steps." },
      { icon: <Icons.Shield />, title: "Drug Interaction Alerts", desc: "Real-time warnings before you combine medications that could cause harmful or dangerous interactions." },
      { icon: <Icons.Log />, title: "Lab Result Interpretation", desc: "Upload your lab reports and get plain-English explanations of what every number and marker means." },
      { icon: <Icons.SOS />, title: "When to See a Doctor", desc: "Clear urgency guidance — whether to rest at home, call your doctor, or seek immediate emergency care." },
      { icon: <Icons.Heart />, title: "Lifestyle Recommendations", desc: "Personalized diet, exercise, and wellness tips based on your medications, conditions, and health goals." },
      { icon: <Icons.AI />, title: "Voice & Text Support", desc: "Ask health questions via voice or text in English, Hindi, or Gujarati for maximum accessibility." },
    ],
    stats: [["24/7", "Availability"], ["2M+", "Questions Answered"], ["<3s", "Response Time"]],
    accentColor: "#a78bfa",
  },
  "Drug Interaction Check": {
    icon: <Icons.Shield />,
    tagline: "Real-Time Safety at Your Fingertips",
    description: "Our comprehensive drug interaction database covers over 50,000 known interactions, updated daily from FDA, WHO, and clinical research sources. Check any combination of medications, supplements, or foods instantly.",
    features: [
      { icon: <Icons.Check />, title: "50,000+ Interactions", desc: "Complete database covering prescription drugs, OTC medications, vitamins, herbal supplements, and common foods." },
      { icon: <Icons.Chart />, title: "Severity Ratings", desc: "Every interaction rated Minor, Moderate, or Major with clinical evidence and peer-reviewed research backing." },
      { icon: <Icons.Link />, title: "Food Interactions", desc: "Understand how grapefruit, alcohol, dairy, caffeine, and specific foods affect your medications' efficacy." },
      { icon: <Icons.Eye />, title: "Barcode Scanner", desc: "Scan any medication barcode with your phone camera for instant interaction analysis against your current list." },
      { icon: <Icons.Chart />, title: "Daily Updates", desc: "Database updated daily with the latest FDA alerts, drug recalls, and new clinical findings." },
      { icon: <Icons.User />, title: "Pharmacist Review", desc: "Complex interactions can be flagged for review by a licensed pharmacist within 4 hours." },
    ],
    stats: [["50K+", "Drug Interactions"], ["Daily", "Database Updates"], ["FDA", "Approved Data"]],
    accentColor: "#fbbf24",
  },
  "Guardian Portal": {
    icon: <Icons.Users />,
    tagline: "Care for Loved Ones, From Anywhere",
    description: "The Guardian Portal gives caregivers complete real-time visibility into the health of those they care for — whether elderly parents, children with chronic conditions, or anyone who needs structured medication support.",
    features: [
      { icon: <Icons.Eye />, title: "Real-Time Monitoring", desc: "See medication adherence, vital signs, mood check-ins, and health events as they happen, live." },
      { icon: <Icons.SOS />, title: "Instant Alerts", desc: "Get notified the moment a dose is missed, an Emergency SOS is triggered, or health metrics leave safe ranges." },
      { icon: <Icons.Log />, title: "Appointment Management", desc: "Manage doctor appointments, specialist visits, and medical records for all loved ones in one unified view." },
      { icon: <Icons.Med />, title: "Shared Health Notes", desc: "Leave notes, reminders, and care instructions visible across the entire care team and family." },
      { icon: <Icons.Chart />, title: "Caregiver Analytics", desc: "Track long-term adherence trends, identify deteriorating patterns, and generate reports for healthcare providers." },
      { icon: <Icons.Users />, title: "Multi-Patient Dashboard", desc: "Manage up to 5 patients simultaneously from a single guardian account with individual risk profiles." },
    ],
    stats: [["5", "Patients per Account"], ["Real-Time", "Live Updates"], ["100%", "Data Privacy"]],
    accentColor: "#34d399",
  },
  "Health Analytics": {
    icon: <Icons.Chart />,
    tagline: "Understand Your Health Trends",
    description: "Visualize weeks and months of health data in beautiful, easy-to-read charts. Identify patterns, track improvement, celebrate streaks, and share detailed reports with your healthcare provider at every appointment.",
    features: [
      { icon: <Icons.Flame />, title: "Adherence Streaks", desc: "Gamified streak tracking makes staying on your medication plan engaging, rewarding, and motivating every day." },
      { icon: <Icons.Chart />, title: "Trend Analysis", desc: "Spot correlations between medication timing, sleep quality, physical activity, mood, and how you feel." },
      { icon: <Icons.Heart />, title: "Health Score (0–100)", desc: "A single, clear score summarizing your overall medication adherence, vitals trends, and lifestyle factors." },
      { icon: <Icons.Log />, title: "Doctor-Ready Reports", desc: "One-tap export of your complete health summary as a professional PDF, ready to share at any appointment." },
      { icon: <Icons.AI />, title: "Predictive Insights", desc: "AI identifies upcoming risk patterns — such as likely refill lapses or worsening adherence — before they happen." },
      { icon: <Icons.Chart />, title: "30/60/90-Day Views", desc: "Toggle between weekly, monthly, and quarterly health data views to understand both short and long-term trends." },
    ],
    stats: [["30-Day", "History View"], ["10+", "Chart Types"], ["PDF", "Export Ready"]],
    accentColor: "#34d399",
  },
  "Emergency SOS": {
    icon: <Icons.SOS />,
    tagline: "Help Is Always One Tap Away",
    description: "In a medical emergency, every second is critical. MedGuard Emergency SOS instantly connects you to help — alerting emergency contacts, sharing your precise GPS location, and displaying vital medical information to first responders.",
    features: [
      { icon: <Icons.Link />, title: "Auto Location Sharing", desc: "Your exact GPS coordinates are sent instantly to all emergency contacts and optionally to emergency services." },
      { icon: <Icons.Call />, title: "One-Tap Emergency Call", desc: "Call your designated emergency contact or dial 112 immediately with a single tap — even from the lock screen." },
      { icon: <Icons.Id />, title: "Medical Info Card", desc: "First responders access your blood type, allergies, current medications, and conditions without unlocking your phone." },
      { icon: <Icons.Chart />, title: "Wearable Integration", desc: "Trigger Emergency SOS from your Apple Watch or Android smartwatch if you're unable to reach your phone." },
      { icon: <Icons.Users />, title: "Multi-Contact Alerts", desc: "Simultaneously alert up to 5 emergency contacts via SMS, push notification, and email with your location." },
      { icon: <Icons.Shield />, title: "Silent SOS Mode", desc: "Activate silent SOS in unsafe situations — alerts are sent without any sound or visible screen interaction." },
    ],
    stats: [["<5s", "Alert Time"], ["5", "Emergency Contacts"], ["112", "Auto Dial Ready"]],
    accentColor: "#ef4444",
  },
};

// ── GLOBAL CSS ────────────────────────────────────────
const makeGCSS = (dark) => {
  const C = COLORS[dark ? "dark" : "light"];
  return `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif;
    background: ${dark ? "#050810" : "#f8fafc"};
    background-attachment: fixed;
    color: ${C.text};
    transition: background 0.5s ease, color 0.5s ease;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  input, select, textarea { font-family: inherit; color-scheme: ${dark ? "dark" : "light"}; }
  button { font-family: inherit; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.accentBorder}; border-radius: 10px; }
  
  @keyframes fadeUp    { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
  @keyframes sideSlide { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
  @keyframes glow      { 0%,100%{box-shadow:0 0 15px rgba(0,245,255,0.2)} 50%{box-shadow:0 0 30px rgba(0,245,255,0.4)} }
  @keyframes pulse     { 0%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.05);opacity:0.4} 100%{transform:scale(1);opacity:0.8} }
  
  .glass-card { 
    backdrop-filter: blur(25px); 
    -webkit-backdrop-filter: blur(25px); 
    background: ${C.card};
    border: 1px solid ${C.border};
    box-shadow: ${C.cardShadow};
  }
  
  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    border-radius: 12px;
    color: ${C.textMid};
    text-decoration: none;
    transition: all 0.3s;
    margin-bottom: 8px;
    position: relative;
    border: 1px solid transparent;
  }
  
  .sidebar-item:hover {
    color: ${C.accent};
    background: ${C.accentLight};
    transform: translateX(4px);
  }
  
  .sidebar-item.active {
    color: ${C.accent};
    background: ${C.accentLight};
    border-color: ${C.accentBorder};
    font-weight: 700;
  }
  
  .sidebar-item.active::before {
    content: '';
    position: absolute;
    left: -20px;
    top: 15%;
    height: 70%;
    width: 4px;
    background: ${C.accent};
    border-radius: 0 4px 4px 0;
    box-shadow: 0 0 15px ${C.accent};
  }
  
  .stats-card {
    background: ${C.surface};
    border-radius: 20px;
    padding: 24px;
    border: 1px solid ${C.border};
    position: relative;
    overflow: hidden;
  }
  
  .stats-card::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, ${C.accentLight} 0%, transparent 70%);
    opacity: 0.3;
    pointer-events: none;
  }
  
  .btn-premium {
    padding: 12px 24px;
    border-radius: 12px;
    background: linear-gradient(135deg, ${C.gradStart}, ${C.gradEnd});
    color: white;
    font-weight: 700;
    border: none;
    box-shadow: 0 10px 20px ${C.accentLight};
    cursor: pointer;
  }
  
  .btn-premium:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px ${C.accentLight};
    opacity: 0.9;
  }
  
  .content-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }
`;
};

// ── TOAST ─────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((icon, title, msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, icon, title, msg, type, leaving: false }]);
    setTimeout(() => setToasts(t => t.map(x => x.id === id ? { ...x, leaving: true } : x)), 2800);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3300);
  }, []);
  return { toasts, show };
}

function useOffline() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on = () => setOffline(false), off = () => setOffline(true);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return offline;
}

function useSpeech(onResult) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported."); return; }
    const rec = new SR();
    rec.lang = "en-US"; rec.continuous = false; rec.interimResults = false;
    rec.onresult = e => { onResult(e.results[0][0].transcript); setListening(false); };
    rec.onerror = () => setListening(false); rec.onend = () => setListening(false);
    recRef.current = rec; rec.start(); setListening(true);
  }, [onResult]);
  const stop = useCallback(() => { recRef.current?.stop(); setListening(false); }, []);
  return { listening, start, stop };
}

function Toast({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
      {toasts.map(t => (
        <div key={t.id} className={t.leaving ? "toast-out" : "toast-in"} style={{ background: "rgba(13,31,60,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(79,195,247,0.25)", borderRadius: 14, padding: "14px 18px", minWidth: 280, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 8px 28px rgba(0,0,0,0.3)" }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#e8f4fd" }}>{t.title}</div>
            <div style={{ fontSize: 12, color: "#8ab4d4", marginTop: 2 }}>{t.msg}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── LEARN MORE PAGE ───────────────────────────────────
function LearnMorePage({ serviceName, dark, onBack, onGetStarted }) {
  const C = COLORS[dark ? "dark" : "light"];
  const data = LEARN_MORE_DATA[serviceName];
  if (!data) return null;

  return (
    <div style={{ minHeight: "100vh", background: dark ? "linear-gradient(145deg,#02070f 0%,#081525 55%,#09111f 100%)" : "linear-gradient(145deg,#f4f7fb 0%,#edf2f8 55%,#f7fafc 100%)" }}>
      {/* Top bar */}
      <div style={{ background: C.navBg, backdropFilter: "blur(24px)", borderBottom: `1px solid ${C.border}`, padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 14, background: dark ? "linear-gradient(135deg,#2a5b71,#115c7f)" : "linear-gradient(135deg,#1b6a8c,#3ea3c5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}></div>
          <span style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: "0.02em" }}>MedGuard AI</span>
        </div>
        <button onClick={onBack} style={{ padding: "10px 24px", borderRadius: 14, background: dark ? "rgba(255,255,255,0.08)" : "rgba(16,95,143,0.12)", border: `1px solid ${C.border}`, color: C.text, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all .2s" }}>
          Back to Services
        </button>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 32px 80px" }}>
        {/* Hero block */}
        <div style={{ background: C.card, backdropFilter: "blur(20px)", border: `1px solid ${C.border}`, borderRadius: 28, padding: "44px 42px", marginBottom: 30, boxShadow: "0 32px 90px rgba(15,23,42,0.08)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -120, right: -90, width: 240, height: 240, borderRadius: "50%", background: dark ? "rgba(28,140,186,0.14)" : "rgba(52,91,128,0.08)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
            <div style={{ width: 66, height: 66, borderRadius: 18, background: dark ? "rgba(28,140,186,0.12)" : "rgba(29,111,133,0.14)", border: `1px solid ${dark ? "rgba(28,140,186,0.22)" : "rgba(29,111,133,0.18)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: data.accentColor, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>MedGuard AI Service</div>
              <h1 style={{ fontSize: 36, fontWeight: 800, color: C.text, marginBottom: 8, fontFamily: "'Inter', sans-serif", lineHeight: 1.12 }}>{serviceName}</h1>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: C.textMid, marginBottom: 16, maxWidth: 620 }}>{data.tagline}</h2>
              <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.85, maxWidth: 620 }}>{data.description}</p>
            </div>
          </div>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 14, marginTop: 28, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
            {data.stats.map(([val, label]) => (
              <div key={label} style={{ textAlign: "center", padding: "18px 18px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, flex: 1 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 5 }}>{val}</div>
                <div style={{ fontSize: 12, color: C.textMid, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features grid */}
        <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 18, fontFamily: "'Inter', sans-serif" }}>What's Included</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 32 }}>
          {data.features.map((f, i) => (
            <div key={i} className="lm-feature glass-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 20px", transition: "all .25s", cursor: "default" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${data.accentColor}15`, border: `1px solid ${data.accentColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, color: C.text, fontSize: 15, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA block */}
        <div style={{ background: dark ? "rgba(15,24,44,0.75)" : "rgba(248,250,252,0.95)", border: `1px solid ${C.border}`, borderRadius: 22, padding: "34px 36px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 10, letterSpacing: "-0.02em" }}>Ready to Experience {serviceName}?</div>
          <p style={{ color: C.textMid, marginBottom: 24, fontSize: 15, maxWidth: 620, marginLeft: "auto", marginRight: "auto" }}>Join thousands of users who trust MedGuard AI for their daily health and medication management.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={onGetStarted} style={{ padding: "13px 34px", borderRadius: 14, background: dark ? "rgba(75,166,199,0.95)" : "rgba(29,111,133,0.95)", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", boxShadow: dark ? "0 16px 40px rgba(75,166,199,0.18)" : "0 16px 40px rgba(29,111,133,0.16)", cursor: "pointer" }}>
              Get Started Free
            </button>

            <button onClick={onBack} style={{ padding: "13px 24px", borderRadius: 12, background: C.card, border: `1px solid ${C.border}`, color: C.textMid, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              ← View All Features
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SHARED MODAL COMPONENTS ───────────────────────────
function Modal({ onClose, children, wide }) {
  useEffect(() => {
    const esc = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-wrap glass-card" style={{ background: "rgba(13,31,60,0.96)", border: "1px solid rgba(79,195,247,0.20)", borderRadius: 22, padding: "32px", width: wide ? 740 : 520, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.5)" }}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ icon, title, sub, onClose }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(29,111,133,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{icon}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#e8f4fd" }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: "#8ab4d4", marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
      <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(79,195,247,0.2)", fontSize: 18, color: "#8ab4d4", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>×</button>
    </div>
  );
}

const iStyle = { width: "100%", padding: "11px 14px", border: "1.5px solid rgba(79,195,247,0.2)", borderRadius: 10, fontSize: 14, outline: "none", background: "rgba(255,255,255,0.08)", color: "#e8f4fd", fontFamily: "'Inter', sans-serif", transition: "border-color .2s" };
const lStyle = { fontSize: 11, fontWeight: 700, color: "#8ab4d4", textTransform: "uppercase", letterSpacing: .8, display: "block", marginBottom: 6 };

function AddMedModal({ onClose, onAdd, knownAllergies = [] }) {
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "Once daily", time: "08:00", purpose: "", refill: "", notes: "" });
  const [allergyAlert, setAllergyAlert] = useState(null);
  const up = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (k === "name") { const m = knownAllergies.find(a => v.toLowerCase().includes(a.toLowerCase())); setAllergyAlert(m ? ` ALLERGY ALERT — "${m}" detected!` : null); } };
  return (
    <Modal onClose={onClose}>
      <ModalHeader icon={<Icons.Med />} title="Add Medication" sub="Fill in your medication details" onClose={onClose} />
      {allergyAlert && <div style={{ background: "rgba(239,68,68,0.12)", border: "2px solid rgba(239,68,68,0.5)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#fca5a5", fontWeight: 700, fontSize: 14 }}> {allergyAlert}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div style={{ marginBottom: 14, gridColumn: "1/-1" }}><label style={lStyle}>Medicine Name *</label><input placeholder="e.g. Metformin" value={form.name} onChange={e => up("name", e.target.value)} style={iStyle} /></div>
        <div style={{ marginBottom: 14 }}><label style={lStyle}>Dosage *</label><input placeholder="e.g. 500mg" value={form.dosage} onChange={e => up("dosage", e.target.value)} style={iStyle} /></div>
        <div style={{ marginBottom: 14 }}><label style={lStyle}>Frequency *</label><select value={form.frequency} onChange={e => up("frequency", e.target.value)} style={{ ...iStyle, background: "rgba(255,255,255,0.08)" }}>{["Once daily", "Twice daily", "Three times daily", "Every 8 hours", "Weekly", "As needed"].map(o => <option key={o}>{o}</option>)}</select></div>
        <div style={{ marginBottom: 14 }}><label style={lStyle}>Reminder Time *</label><input type="time" value={form.time} onChange={e => up("time", e.target.value)} style={iStyle} /></div>
        <div style={{ marginBottom: 14 }}><label style={lStyle}>Purpose</label><input placeholder="e.g. Diabetes" value={form.purpose} onChange={e => up("purpose", e.target.value)} style={iStyle} /></div>
        <div style={{ marginBottom: 14 }}><label style={lStyle}>Refill Date</label><input type="date" value={form.refill} onChange={e => up("refill", e.target.value)} style={iStyle} /></div>
        <div style={{ marginBottom: 20, gridColumn: "1/-1" }}><label style={lStyle}>Notes</label><input placeholder="Take with food…" value={form.notes} onChange={e => up("notes", e.target.value)} style={iStyle} /></div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: 11, background: "rgba(255,255,255,0.08)", color: "#8ab4d4", fontWeight: 700, fontSize: 14, border: "1px solid rgba(79,195,247,0.15)", cursor: "pointer" }}>Cancel</button>
        <button onClick={() => { if (!form.name || !form.dosage) return; onAdd(form); onClose(); }} style={{ flex: 2, padding: "13px", borderRadius: 11, background: "linear-gradient(135deg,#4ba6c7,#1f82a8)", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}> Add Medication</button>
      </div>
    </Modal>
  );
}

function AddPatientModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", rel: "", age: "", conditions: "", allergies: "", medications: "", emergencyContact: "" });
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Modal onClose={onClose}>
      <ModalHeader icon={<Icons.Users />} title="Add Loved One" sub="Details of the person you're caring for" onClose={onClose} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px" }}>
        <div style={{ gridColumn: "1/-1" }}><label style={lStyle}>Full Name *</label><input placeholder="e.g. Mary Smith" value={form.name} onChange={e => up("name", e.target.value)} style={iStyle} /></div>
        <div><label style={lStyle}>Relationship *</label><input placeholder="e.g. Mother" value={form.rel} onChange={e => up("rel", e.target.value)} style={iStyle} /></div>
        <div><label style={lStyle}>Age *</label><input type="number" placeholder="e.g. 72" value={form.age} onChange={e => up("age", e.target.value)} style={iStyle} /></div>
        <div style={{ gridColumn: "1/-1" }}><label style={lStyle}>Medical Conditions</label><input placeholder="e.g. Diabetes, Hypertension" value={form.conditions} onChange={e => up("conditions", e.target.value)} style={iStyle} /></div>
        <div style={{ gridColumn: "1/-1" }}><label style={lStyle}>Allergies</label><input placeholder="e.g. Penicillin, Peanuts" value={form.allergies} onChange={e => up("allergies", e.target.value)} style={iStyle} /></div>
        <div style={{ gridColumn: "1/-1" }}><label style={lStyle}>Main Medications & Doses</label><textarea placeholder="e.g. Metformin 500mg (8 AM), Aspirin 100mg (2 PM)" value={form.medications} onChange={e => up("medications", e.target.value)} style={{ ...iStyle, height: 80, padding: "12px", resize: "none" }} /></div>
        <div style={{ gridColumn: "1/-1" }}><label style={lStyle}>Emergency Contact</label><input placeholder="e.g. Dr. Wilson (555-0199)" value={form.emergencyContact} onChange={e => up("emergencyContact", e.target.value)} style={iStyle} /></div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: 11, background: "rgba(255,255,255,0.08)", color: "#8ab4d4", fontWeight: 700, fontSize: 14, border: "1px solid rgba(79,195,247,0.15)", cursor: "pointer" }}>Cancel</button>
        <button onClick={() => { if (!form.name || !form.rel || !form.age) return; onAdd(form); onClose(); }} style={{ flex: 2, padding: "13px", borderRadius: 11, background: "linear-gradient(135deg,#4ba6c7,#1f82a8)", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}> Add Patient Record</button>
      </div>
    </Modal>
  );
}

function DrugInteractionModal({ onClose }) {
  const [drug1, setDrug1] = useState(""), [drug2, setDrug2] = useState(""), [result, setResult] = useState(null), [checked, setChecked] = useState(false);
  const check = () => { if (!drug1.trim() || !drug2.trim()) return; setResult(checkInteraction(drug1, drug2) || null); setChecked(true); };
  const sevColor = { HIGH: ["rgba(239,68,68,0.12)", "#ef4444", "#fca5a5"], MEDIUM: ["rgba(251,191,36,0.12)", "#fbbf24", "#fde68a"], LOW: ["rgba(52,211,153,0.12)", "#34d399", "#a7f3d0"] };
  return (
    <Modal onClose={onClose}>
      <ModalHeader icon={<Icons.Shield />} title="Drug Interaction Checker" sub="Check if two medications are safe together" onClose={onClose} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div><label style={lStyle}>Drug / Food 1</label><input placeholder="e.g. Warfarin" value={drug1} onChange={e => { setDrug1(e.target.value); setChecked(false); }} style={iStyle} onKeyDown={e => e.key === "Enter" && check()} /></div>
        <div><label style={lStyle}>Drug / Food 2</label><input placeholder="e.g. Aspirin" value={drug2} onChange={e => { setDrug2(e.target.value); setChecked(false); }} style={iStyle} onKeyDown={e => e.key === "Enter" && check()} /></div>
      </div>
      <button onClick={check} style={{ width: "100%", padding: "13px", borderRadius: 11, background: "linear-gradient(135deg,#4ba6c7,#1f82a8)", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", marginBottom: 20, cursor: "pointer" }}> Check Interaction</button>
      {checked && (result ? (() => { const [bg, border, tc] = sevColor[result.severity] || sevColor.LOW; return <div style={{ background: bg, border: `2px solid ${border}`, borderRadius: 14, padding: "20px 22px" }}><div style={{ display: "flex", gap: 10, marginBottom: 12 }}><div style={{ color: tc }}><Icons.Shield /></div><div><div style={{ fontWeight: 800, fontSize: 16, color: tc }}>{result.severity} SEVERITY</div><div style={{ fontSize: 13, color: tc, opacity: .8 }}>{drug1} + {drug2}</div></div></div><p style={{ fontSize: 14, color: tc, lineHeight: 1.7 }}>{result.effect}</p></div>; })() : <div style={{ background: "rgba(52,211,153,0.12)", border: "2px solid #34d399", borderRadius: 14, padding: "20px 22px", display: "flex", gap: 12, alignItems: "center" }}><div style={{ color: "#34d399" }}><Icons.Check /></div><div><div style={{ fontWeight: 800, fontSize: 16, color: "#34d399" }}>No Known Interaction Found</div><div style={{ fontSize: 14, color: "#6ee7b7", opacity: .8, marginTop: 4 }}>Always confirm with your pharmacist.</div></div></div>)}
    </Modal>
  );
}

function EmergencySOSModal({ onClose }) {
  const [calling, setCalling] = useState(false);
  return (
    <div className="overlay">
      <div className="modal-wrap" style={{ background: "rgba(13,31,60,0.96)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 22, padding: "32px", width: 480, maxWidth: "95vw", boxShadow: "0 24px 64px rgba(239,68,68,.25)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "rgba(239,68,68,0.15)", border: "2px solid rgba(239,68,68,0.4)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", animation: "sosPulse 1.5s infinite" }}><Icons.SOS /></div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#ef4444", marginBottom: 4 }}>Emergency SOS</h2>
          <p style={{ fontSize: 13, color: "#8ab4d4" }}>Location shared with emergency contacts.</p>
        </div>
        <button onClick={() => { setCalling(true); setTimeout(() => setCalling(false), 3000); }} style={{ width: "100%", padding: "15px", borderRadius: 13, background: calling ? "#dc2626" : "#ef4444", color: "#fff", fontSize: 17, fontWeight: 900, border: "none", marginBottom: 16, cursor: "pointer", boxShadow: "0 6px 20px rgba(239,68,68,.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          {calling ? "Connecting to 112…" : <><Icons.SOS /> Call Emergency (112)</>}
        </button>
        <button onClick={onClose} style={{ width: "100%", padding: "12px", borderRadius: 11, background: "rgba(255,255,255,0.08)", color: "#8ab4d4", fontWeight: 700, fontSize: 14, border: "1px solid rgba(79,195,247,0.15)", cursor: "pointer" }}> Close SOS</button>
      </div>
    </div>
  );
}

function SymptomLoggerModal({ onClose, meds }) {
  const SYMPTOMS = ["Headache", "Dizziness", "Nausea", "Fatigue", "Vomiting", "Chest Pain", "Shortness of Breath", "Rash", "Dry Mouth", "Blurred Vision", "Muscle Pain", "Insomnia", "Anxiety", "Palpitations"];
  const [selected, setSelected] = useState([]), [severity, setSeverity] = useState(5), [result, setResult] = useState(null), [loading, setLoading] = useState(false);
  const toggle = s => setSelected(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const analyze = async () => {
    if (!selected.length) return; setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system: "You are MedGuard AI. Analyze reported symptoms against patient medications. Be concise, use bullet points, end with whether to consult a doctor. Under 150 words.", messages: [{ role: "user", content: `Medications: ${meds.map(m => m.name).join(", ")}. Symptoms: ${selected.join(", ")}. Severity: ${severity}/10.` }] }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Server error");
      setResult(data.text || "Analysis complete.");
    } catch (err) { setResult(` ${err.message || "Could not connect to AI."}`); }
    finally { setLoading(false); }
  };
  return (
    <Modal onClose={onClose} wide>
      <ModalHeader icon="" title="Symptom Logger" sub="Log symptoms and get AI analysis" onClose={onClose} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <label style={lStyle}>Select Symptoms</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>{SYMPTOMS.map(s => <button key={s} onClick={() => toggle(s)} style={{ padding: "7px 14px", borderRadius: 100, border: `1.5px solid ${selected.includes(s) ? "#ef4444" : "rgba(79,195,247,0.2)"}`, background: selected.includes(s) ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.04)", color: selected.includes(s) ? "#fca5a5" : "#8ab4d4", fontSize: 13, fontWeight: selected.includes(s) ? 700 : 500, cursor: "pointer" }}>{s}</button>)}</div>
          <label style={lStyle}>Severity (1–10): <strong style={{ color: "#ef4444" }}>{severity}</strong></label>
          <input type="range" min={1} max={10} value={severity} onChange={e => setSeverity(+e.target.value)} style={{ width: "100%", accentColor: "#4ba6c7", marginBottom: 16 }} />
          <button onClick={analyze} disabled={!selected.length || loading} style={{ width: "100%", padding: "12px", borderRadius: 11, background: selected.length && !loading ? "linear-gradient(135deg,#4ba6c7,#1f82a8)" : "rgba(255,255,255,0.1)", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>{loading ? " Analyzing…" : " Analyze with AI"}</button>
        </div>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(79,195,247,0.15)", borderRadius: 14, padding: "20px", minHeight: 200, display: "flex", flexDirection: "column", justifyContent: result ? "flex-start" : "center", alignItems: result ? "flex-start" : "center" }}>
          {result ? <><div style={{ fontWeight: 700, color: "#e8f4fd", marginBottom: 10 }}> AI Analysis</div><div style={{ fontSize: 14, color: "#8ab4d4", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{result}</div></> : <div style={{ textAlign: "center", color: "#4a7aa0" }}><div style={{ fontSize: 40, marginBottom: 10 }}></div><div style={{ fontWeight: 600 }}>Select symptoms and click Analyze</div></div>}
        </div>
      </div>
    </Modal>
  );
}

function MoodWidget({ dark }) {
  const C = COLORS[dark ? "dark" : "light"];
  const moods = [{ e: "", l: "Terrible", c: "#ef4444" }, { e: "", l: "Bad", c: "#f59e0b" }, { e: "", l: "Okay", c: "#8ab4d4" }, { e: "", l: "Good", c: "#34d399" }, { e: "", l: "Great!", c: "#4ba6c7" }];
  const [selected, setSelected] = useState(null);
  return (
    <div className="glass-card" style={{ background: C.card, borderRadius: 16, padding: "18px 20px", border: `1px solid ${C.border}`, marginBottom: 16 }}>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 14, fontSize: 14 }}> {C === COLORS.dark ? "How are you feeling today?" : "How are you feeling today?"}</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "space-around" }}>
        {moods.map((m, i) => <button key={i} onClick={() => setSelected(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 8px", borderRadius: 12, border: `2px solid ${selected === i ? m.c : C.border}`, background: selected === i ? m.c + "18" : C.surface, cursor: "pointer", flex: 1 }}><span style={{ fontSize: 26 }}>{m.e}</span><span style={{ fontSize: 10, fontWeight: 700, color: selected === i ? m.c : C.textSoft }}>{m.l}</span></button>)}
      </div>
      {selected !== null && <div style={{ textAlign: "center", fontSize: 13, color: moods[selected].c, fontWeight: 700, marginTop: 10 }}>Mood logged! </div>}
    </div>
  );
}

function MedTimeline({ dark }) {
  const C = COLORS[dark ? "dark" : "light"];
  const days = useState(() =>
    Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 29 + i); return { label: d.getDate(), missed: Math.random() < .1, taken: Math.random() > .05 }; })
  )[0];
  return (
    <div className="glass-card" style={{ background: C.card, borderRadius: 16, padding: "18px 20px", border: `1px solid ${C.border}` }}>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 14 }}> 30-Day Adherence Timeline</div>
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {days.map((d, i) => <div key={i} title={`Day ${d.label}`} style={{ width: 28, height: 28, borderRadius: 6, background: d.missed ? "rgba(239,68,68,0.12)" : d.taken ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.08)", border: `1.5px solid ${d.missed ? "rgba(239,68,68,0.4)" : d.taken ? "rgba(52,211,153,0.4)" : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 9, fontWeight: 700, color: d.missed ? "#ef4444" : d.taken ? "#34d399" : C.textSoft }}>{d.label}</span></div>)}
      </div>
    </div>
  );
}

function _printReport(meds, streak, adherencePct, user) {
  const w = window.open("", "_blank", "width=800,height=600");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>MedGuard AI — Report</title><style>body{font-family:system-ui,sans-serif;padding:40px;color:#102a43;max-width:700px;margin:0 auto}h1{color:#1d6f85}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#1d6f85;color:white;padding:10px 14px;text-align:left}td{padding:10px 14px;border-bottom:1px solid #e2e8f0}.stat{background:#eff6ff;border-radius:12px;padding:16px;text-align:center;display:inline-block;margin:8px;min-width:130px}.stat-val{font-size:28px;font-weight:900;color:#1d6f85}</style></head><body><h1> MedGuard AI — Weekly Report</h1><p>Patient: ${user?.name || "—"} · ${new Date().toLocaleDateString()}</p><div><div class="stat"><div class="stat-val">${adherencePct}%</div><div>Adherence</div></div><div class="stat"><div class="stat-val">${streak}</div><div>Streak </div></div><div class="stat"><div class="stat-val">${meds.length}</div><div>Active Meds</div></div></div><table><tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Status</th></tr>${meds.map(m => `<tr><td>${m.name}</td><td>${m.dosage}</td><td>${m.frequency}</td><td>${m.status === "taken" ? "Taken" : "Pending"}</td></tr>`).join("")}</table></body></html>`);
  w.document.close(); w.print();
}

function AdherenceRing({ pct, size = 110 }) {
  const r = 42, circ = 2 * Math.PI * r, offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? "#34d399" : pct >= 60 ? "#fbbf24" : "#ef4444";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 50 50)" style={{ transition: "stroke-dashoffset 1s ease" }} />
      <text x="50" y="55" textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="900" fill="white">{pct}%</text>
    </svg>
  );
}

function HealthScoreRing({ score, size = 90 }) {
  const r = 38, circ = 2 * Math.PI * r, offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#ef4444";
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 50 50)" style={{ transition: "stroke-dashoffset 1.2s ease" }} />
        <text x="50" y="48" textAnchor="middle" fontSize="18" fontWeight="900" fill={color}>{score}</text>
        <text x="50" y="63" textAnchor="middle" fontSize="10" fill="#8ab4d4">/ 100</text>
      </svg>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginTop: 4 }}>{score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Fair"}</div>
    </div>
  );
}

function OfflineBanner() {
  return <div style={{ background: "rgba(251,191,36,0.12)", borderBottom: "1px solid rgba(251,191,36,0.3)", padding: "10px 48px", display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#fbbf24" }}><span></span><span>You're offline — AI features unavailable.</span></div>;
}

// ── AUTH PAGE ─────────────────────────────────────────
function AuthPage({ onLogin, onBack, dark, setDark }) {
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ name: email.split("@")[0], email, role, initials: email[0].toUpperCase() });
    }, 1500);
  };

  return (
    <div style={{ minHeight: "100vh", background: dark ? "radial-gradient(circle at top left, #0f172a, #050810)" : "url('https://www.transparenttextures.com/patterns/cubes.png'), radial-gradient(circle at top left, rgba(20, 184, 166, 0.05), transparent), radial-gradient(circle at bottom right, rgba(251, 113, 133, 0.05), transparent)", backgroundColor: "var(--ivory)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative" }}>
      <button onClick={() => setDark(!dark)} style={{ position: "absolute", top: 40, right: 40, background: "none", border: "none", cursor: "pointer", zIndex: 10, color: dark ? "#fbbf24" : "#475569", display: "flex", alignItems: "center" }}>{dark ? <Icons.Moon /> : <Icons.Sun />}</button>
      <div className="glass-card animate-bloom" style={{ width: "100%", maxWidth: 460, padding: "60px 48px", borderRadius: "60px 15px 60px 60px", boxShadow: dark ? "0 40px 100px rgba(0,0,0,0.4)" : "0 40px 100px rgba(19, 78, 74, 0.05)", position: "relative", background: dark ? "rgba(15, 23, 42, 0.7)" : "var(--glass-white)" }}>
        
        <div style={{ textAlign: "center", marginBottom: 48 }}>
           <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                <path d="M20 5C22 5 32 10 32 20C32 30 22 35 20 35C18 35 8 30 8 20C8 10 18 5 20 5Z" stroke="var(--teal)" strokeWidth="3" />
                <path d="M14 20C14 20 17 23 20 23C23 23 26 20 26 20" stroke="var(--coral)" strokeWidth="3" className="animate-breathe" />
              </svg>
              <h2 className="font-heading" style={{ fontSize: 26, fontWeight: 900, color: "var(--deep-teal)" }}>MedGuard</h2>
           </div>
           <p style={{ color: "var(--text-soft)", fontSize: 15 }}>A secure, living care network.</p>
        </div>

        <div style={{ display: "flex", gap: 32, marginBottom: 40, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
           {["patient", "guardian"].map(r => (
             <button key={r} onClick={() => setRole(r)} style={{ background: "none", border: "none", padding: "12px 0", fontSize: 14, fontWeight: 700, color: role === r ? "var(--deep-teal)" : "#94a3b8", cursor: "pointer", position: "relative", textTransform: "capitalize" }}>
               I am a {r}
               {role === r && <div style={{ position: "absolute", bottom: -2, left: 0, width: "100%", height: 3, background: "var(--coral)", borderRadius: 10 }} />}
             </button>
           ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 10 }}>Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@care.com" style={{ width: "100%", padding: "16px 20px", borderRadius: "18px", border: dark ? "1.5px solid rgba(45, 212, 191, 0.2)" : "1.5px solid rgba(20, 184, 166, 0.1)", background: dark ? "rgba(255,255,255,0.03)" : "white", color: "var(--text-main)", fontSize: 15, outline: "none" }} />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>Password</label>
              <button type="button" style={{ background: "none", border: "none", fontSize: 11, fontWeight: 700, color: "var(--teal)", cursor: "pointer" }}>Forgot?</button>
            </div>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", padding: "16px 20px", borderRadius: "18px", border: dark ? "1.5px solid rgba(45, 212, 191, 0.2)" : "1.5px solid rgba(20, 184, 166, 0.1)", background: dark ? "rgba(255,255,255,0.03)" : "white", color: "var(--text-main)", fontSize: 15, outline: "none" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", background: "rgba(20, 184, 166, 0.03)", borderRadius: "18px", border: "1px dashed rgba(20, 184, 166, 0.2)" }}>
             <div style={{ color: "var(--teal)" }}><Icons.Id /></div>
             <span style={{ fontSize: 12, fontWeight: 600, color: "var(--teal-dark)", opacity: 0.8 }}>Secure Biometric ID is ready.</span>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", height: 56, marginTop: 12, animation: loading ? "pulse-coral 1s infinite" : "none" }}>
            {loading ? "Connecting..." : "Login to My Hub"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 40, fontSize: 15, color: "#64748b" }}>
          New here? <button onClick={onBack} style={{ background: "none", border: "none", fontWeight: 700, color: "var(--coral)", cursor: "pointer", padding: 0 }}>Create Account</button>
        </div>
      </div>

      <button onClick={onBack} style={{ position: "absolute", top: 40, left: 40, background: "none", border: "none", fontWeight: 700, color: "var(--text-soft)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
        <Icons.Back /> Back
      </button>
    </div>
  );

}

// ── AI CHAT TAB ───────────────────────────────────────
function AIChatTab({ dark, user }) {
  const C = COLORS[dark ? "dark" : "light"];
  const accent = dark ? "#4ba6c7" : "#1d6f85";
  const [history, setHistory] = useState([{ from: "ai", text: `Hello ${user?.name?.split(" ")[0] || "there"}!  I'm your MedGuard AI assistant. How can I help you today?` }]);
  const [msg, setMsg] = useState(""), [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const onVoiceResult = useCallback((text) => setMsg(text), []);
  const { listening, start, stop } = useSpeech(onVoiceResult);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history, loading]);
  const send = async () => {
    const m = msg.trim(); if (!m || loading) return;
    setMsg(""); setHistory(h => [...h, { from: "user", text: m }]); setLoading(true);
    try {
      const messages = history.map(x => ({ role: x.from === "user" ? "user" : "assistant", content: x.text }));
      messages.push({ role: "user", content: m });
      const res = await fetch(`${API_BASE_URL}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages, system: `You are MedGuard AI, a professional health assistant for ${user?.name || "the patient"}. Be warm, concise (under 120 words), and end medical responses with: "Please consult your doctor for personalized advice."` }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Server error");
      setHistory(h => [...h, { from: "ai", text: data.text || "I'm having trouble connecting." }]);
    } catch (err) { setHistory(h => [...h, { from: "ai", text: ` ${err.message || "Connection error."}` }]); }
    finally { setLoading(false); }
  };
  const suggested = ["What are the side effects of Metformin?", "Can I take ibuprofen with Lisinopril?", "What foods should I avoid with blood thinners?", "Is 90% medication adherence good?"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
      <div className="glass-card" style={{ background: C.card, borderRadius: 20, padding: "24px", border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: 620 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}></div>
          <div><div style={{ fontWeight: 700, color: C.text }}>MedGuard AI Assistant</div><div style={{ fontSize: 12, color: "#34d399" }}>● Online · Powered by Claude AI</div></div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {history.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
              {m.from === "ai" && <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${accent},${dark ? "#1f82a8" : "#4ba6c7"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}></div>}
              <div style={{ maxWidth: "78%", padding: "12px 16px", borderRadius: m.from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.from === "user" ? `linear-gradient(135deg,${accent},${dark ? "#1f82a8" : "#4ba6c7"})` : C.surface, color: m.from === "user" ? "#fff" : C.text, fontSize: 14, lineHeight: 1.7, border: m.from === "ai" ? `1px solid ${C.border}` : "none", whiteSpace: "pre-wrap" }}>{m.text}</div>
            </div>
          ))}
          {loading && <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}><div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${accent},${dark ? "#1f82a8" : "#4ba6c7"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}></div><div style={{ padding: "14px 18px", borderRadius: "18px 18px 18px 4px", background: C.surface, border: `1px solid ${C.border}`, display: "flex", gap: 5 }}><div className="dot1" style={{ width: 8, height: 8, borderRadius: "50%", background: C.textSoft }} /><div className="dot2" style={{ width: 8, height: 8, borderRadius: "50%", background: C.textSoft }} /><div className="dot3" style={{ width: 8, height: 8, borderRadius: "50%", background: C.textSoft }} /></div></div>}
          <div ref={bottomRef} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={listening ? stop : start} style={{ padding: "13px 14px", borderRadius: 12, background: listening ? "rgba(239,68,68,0.12)" : C.surface, border: `1.5px solid ${listening ? "rgba(239,68,68,0.4)" : C.border}`, fontSize: 18, cursor: "pointer" }}>{listening ? "" : ""}</button>
          <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Ask about medications, symptoms…" style={{ flex: 1, padding: "13px 16px", border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 14, outline: "none", background: C.inputBg, color: C.text }} />
          <button onClick={send} disabled={loading} style={{ padding: "13px 20px", borderRadius: 12, background: loading ? C.border : `linear-gradient(135deg,${accent},${dark ? "#1f82a8" : "#4ba6c7"})`, color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Send </button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="glass-card" style={{ background: C.card, borderRadius: 16, padding: "18px", border: `1px solid ${C.border}` }}>
          <div style={{ fontWeight: 700, color: C.text, marginBottom: 12, fontSize: 14 }}> Suggested Questions</div>
          {suggested.map(q => <button key={q} onClick={() => setMsg(q)} style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 10, background: C.accentLight, border: `1px solid ${C.accentBorder}`, fontSize: 13, color: C.textMid, cursor: "pointer", marginBottom: 8, lineHeight: 1.45 }}>{q}</button>)}
        </div>
        <div className="glass-card" style={{ background: C.accentLight, borderRadius: 16, padding: "18px", border: `1px solid ${C.accentBorder}` }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: accent }}> Medical Disclaimer</div>
          <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.65 }}>This AI provides general health information only. Always consult your doctor for medical advice.</p>
        </div>
      </div>
    </div>
  );
}

function PatientPortal({ dark, setDark, lang, user, onLogout }) {
  const L = T[lang]; 
  const C = COLORS[dark ? "dark" : "light"];  
  const { toasts, show } = useToast(); 
  const _offline = useOffline();
  const accent = dark ? "#00f5ff" : "#0ea5e9";
  const [tab, setTab] = useState("dashboard");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [meds, setMeds] = useState([]);
  const [streak, setStreak] = useState(user?.streak || 14);

  useEffect(() => {
    if (user?.email) {
      const fetchMeds = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/medications/${user.email}`);
          if (res.ok) setMeds(await res.json());
        } catch (err) { console.error(err); }
      };
      fetchMeds();
    }
  }, [user]);

  const markTaken = async (idx) => {
    if (meds[idx].status === "taken") return;
    try {
      if (meds[idx].id) {
        await fetch(`${API_BASE_URL}/api/medications/${meds[idx].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "taken" })
        });
      }
      const newMeds = meds.map((m, i) => i === idx ? { ...m, status: "taken" } : m);
      setMeds(newMeds);
      if (newMeds.every(m => m.status === "taken")) setStreak(s => s + 1);
      show("Success", "Dose Logged", `${meds[idx].name} recorded successfully.`, "success");
    } catch (err) { console.error(err); }
  };

  const handleAddMed = async (formData) => {
    const newMed = { ...formData, userEmail: user.email, status: "upcoming", refill: 30 };
    try {
      const res = await fetch(`${API_BASE_URL}/api/medications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMed)
      });
      if (res.ok) {
        const saved = await res.json();
        setMeds([...meds, { ...newMed, id: saved.id }]);
        show("Medication", "New Medication", `${newMed.name} added to schedule.`, "info");
      }
    } catch (err) { console.error(err); }
  };

  const navItems = [
    { id: "dashboard", label: L.dashboard, icon: <Icons.Dash /> },
    { id: "medications", label: L.medications, icon: <Icons.Med /> },
    { id: "ai-advisor", label: L.aiAdvisor, icon: <Icons.AI /> },
    { id: "analytics", label: "Analytics", icon: <Icons.Chart /> },
    { id: "symptoms", label: "Health Log", icon: <Icons.Log /> },
    { id: "settings", label: "Account", icon: <Icons.Settings /> },
  ];

  const takenCount = meds.filter(m => m.status === "taken").length;
  const adherencePct = meds.length === 0 ? 0 : Math.round((takenCount / meds.length) * 100);
  const healthScore = Math.min(100, Math.round(adherencePct * 0.6 + streak * 0.8 + 20));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg }}>
      <Toast toasts={toasts} />
      
      {/* ── SIDEBAR ── */}
      <aside style={{ width: 280, background: C.sidebarBg, borderRight: `1px solid ${C.border}`, padding: "40px 24px", position: "fixed", height: "100vh", display: "flex", flexDirection: "column", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 50, padding: "0 10px" }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: `linear-gradient(135deg, ${C.gradStart}, ${C.gradEnd})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Icons.Shield /></div>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>MedGuard AI</span>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map(btn => (
            <div key={btn.id} onClick={() => setTab(btn.id)} className={`sidebar-item ${tab === btn.id ? "active" : ""}`}>
              <span style={{ fontSize: 20 }}>{btn.icon}</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{btn.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ marginTop: "auto" }}>
          <button onClick={() => setShowSOS(true)} style={{ width: "100%", padding: "14px", borderRadius: 12, background: "rgba(239,68,68,0.1)", color: "#ef4444", fontWeight: 800, border: "1.5px solid rgba(239,68,68,0.2)", cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><Icons.SOS /> EMERGENCY SOS</button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#000" }}>{user?.initials}</div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{user?.name}</div>
              <div onClick={onLogout} style={{ fontSize: 11, color: C.textSoft, cursor: "pointer" }}>Sign Out →</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, marginLeft: 280, padding: "40px 60px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: C.text, letterSpacing: "-1.5px" }}>{navItems.find(i => i.id === tab)?.label}</h1>
            <p style={{ color: C.textMid, fontSize: 15, marginTop: 4 }}>System Status: <span style={{ color: "#34d399" }}>Secure & Connected</span></p>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
             <button onClick={() => setDark(!dark)} className="glass-card" style={{ width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: dark ? "#fbbf24" : "#475569" }}>{dark ? <Icons.Moon /> : <Icons.Sun />}</button>
             <div className="glass-card" style={{ padding: "0 20px", display: "flex", alignItems: "center", gap: 10, borderRadius: 14 }}>
               <span style={{ fontSize: 13, fontWeight: 800, color: "#fbbf24", display: "flex", alignItems: "center", gap: 6 }}><Icons.Flame /> {streak} DAY STREAK</span>
             </div>
          </div>
        </header>

        {tab === "dashboard" && (
          <div className="fade-up">
            <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 32, marginBottom: 32 }}>
              <div className="stats-card glass-card" style={{ background: `linear-gradient(135deg, ${dark ? '#0c1a30' : '#e0f2fe'}, ${dark ? '#020617' : '#f8fafc'})`, padding: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Quantum Health Integrity</div>
                    <div style={{ fontSize: 52, fontWeight: 900, color: C.text }}>{healthScore}<span style={{ fontSize: 20, color: C.textSoft }}>/100</span></div>
                    <p style={{ color: C.textMid, marginTop: 12, lineHeight: 1.6, maxWidth: 300 }}>Your medication adherence is improving your overall resilience score by 12% this week.</p>
                  </div>
                  <HealthScoreRing score={healthScore} size={140} />
                </div>
              </div>
              <div className="glass-card" style={{ padding: 32, display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
                 <div style={{ fontSize: 12, fontWeight: 800, color: C.textSoft, textTransform: "uppercase" }}>Quick Overview</div>
                 <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                   <AdherenceRing pct={adherencePct} size={80} />
                   <div>
                     <div style={{ fontSize: 24, fontWeight: 900, color: C.text }}>{takenCount}/{meds.length} <span style={{ fontSize: 14, color: C.textSoft, fontWeight: 400 }}>doses</span></div>
                     <div style={{ fontSize: 12, color: "#34d399", fontWeight: 700 }}>{adherencePct}% Completed</div>
                   </div>
                 </div>
                 <div style={{ height: 6, background: C.border, borderRadius: 10, overflow: "hidden" }}>
                   <div style={{ width: `${adherencePct}%`, height: "100%", background: accent, boxShadow: `0 0 12px ${accent}` }} />
                 </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 32 }}>
              <section className="glass-card" style={{ padding: 32, borderRadius: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Daily Timeline</h3>
                  <button className="btn-premium" onClick={() => setShowAddModal(true)}>+ Add Medicine</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {meds.length === 0 ? <p style={{ textAlign: "center", color: C.textSoft }}>No meds scheduled.</p> : meds.map((m, i) => (
                    <div key={i} className="glass-card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 20, borderRadius: 16 }}>
                       <div style={{ width: 50, height: 50, borderRadius: 14, background: m.status === 'taken' ? 'rgba(52,211,153,0.1)' : C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", color: m.status === 'taken' ? "#34d399" : accent, border: `1px solid ${m.status==='taken'?'transparent':C.accentBorder}` }}>{m.icon ? <span>{m.icon}</span> : <Icons.Med />}</div>
                       <div style={{ flex: 1 }}>
                         <h4 style={{ fontWeight: 800, color: C.text, fontSize: 16 }}>{m.name}</h4>
                         <div style={{ fontSize: 13, color: C.textMid }}>{m.dosage} · Scheduled for {m.time}</div>
                       </div>
                       {m.status === "taken" ? <span style={{ color: "#34d399", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}><Icons.Check /> LOGGED</span> : <button onClick={() => markTaken(i)} className="btn-premium" style={{ fontSize: 11, padding: "8px 16px" }}>MARK TAKEN</button>}
                    </div>
                  ))}
                </div>
              </section>

              <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div className="glass-card" style={{ background: `linear-gradient(135deg, ${C.accentLight}, transparent)`, padding: 28, border: `1px solid ${C.accentBorder}` }}>
                   <div style={{ fontSize: 14, fontWeight: 800, color: accent, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Icons.AI /> AI HEALTH AGENT</div>
                   <p style={{ fontSize: 15, color: C.textPrimary, lineHeight: 1.8, marginBottom: 20 }}>"You've maintained a <strong>{streak} day streak</strong>! Based on your history, I recommend continuing your hydration focus during morning dosage."</p>
                   <button onClick={() => setTab("ai-advisor")} style={{ width: "100%", padding: 12, borderRadius: 12, background: C.text, color: C.bg, fontWeight: 900, border: "none" }}>TALK TO ADVISOR</button>
                </div>
                <div className="glass-card" style={{ padding: 24 }}>
                   <h3 style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 16 }}>System Metrics</h3>
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 12 }}>
                        <div style={{ fontSize: 10, color: C.textSoft }}>ADHERENCE</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#34d399" }}>{adherencePct}%</div>
                      </div>
                      <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 12 }}>
                        <div style={{ fontSize: 10, color: C.textSoft }}>REFILLS DUE</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#fbbf24" }}>{meds.filter(m=>m.refill <= 7).length}</div>
                      </div>
                   </div>
                </div>
              </aside>
            </div>
          </div>
        )}

        {tab === "medications" && (
          <div className="fade-up">
             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
                {meds.map((m, i) => (
                  <div key={i} className="glass-card" style={{ padding: 28, borderRadius: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                      <div style={{ fontSize: 36 }}>{m.icon || "💊"}</div>
                      <span style={{ height: "fit-content", padding: "4px 12px", borderRadius: 100, background: C.accentLight, color: accent, fontSize: 10, fontWeight: 800, border: `1px solid ${C.accentBorder}` }}>ACTIVE</span>
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{m.name}</h3>
                    <p style={{ color: C.textMid, fontSize: 14, margin: "6px 0 20px" }}>{m.dosage} · {m.frequency}</p>
                    <div style={{ paddingTop: 20, borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textSoft, lineHeight: 1.6 }}>
                      Purpose: <span style={{ color: C.textMid }}>{m.purpose}</span><br />
                      Reminders: <span style={{ color: C.textMid }}>{m.time} Daily</span>
                    </div>
                  </div>
                ))}
                <div onClick={() => setShowAddModal(true)} style={{ border: `2px dashed ${C.border}`, borderRadius: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer", transition: "all .2s" }} onMouseEnter={e=>e.currentTarget.style.borderColor=accent} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                   <div style={{ fontSize: 32, color: C.textSoft }}>+</div>
                   <div style={{ fontWeight: 800, color: C.textSoft }}>ADD MEDICATION</div>
                </div>
             </div>
          </div>
        )}

        {tab === "ai-advisor" && <AIChatTab dark={dark} user={user} />}
        {tab === "analytics" && <div className="fade-up"><MedTimeline dark={dark} /></div>}
        {tab === "symptoms" && <div className="fade-up" style={{ textAlign: "center", padding: "100px 0" }}><button className="btn-premium" onClick={() => setShowSymptoms(true)}>Launch AI Symptom Logger</button></div>}
        {tab === "settings" && <div className="fade-up"><p style={{ color: C.textSoft }}>Account settings integration pending...</p></div>}
      </main>

      {/* ── MODALS ── */}
      {showAddModal && <AddMedModal onClose={() => setShowAddModal(false)} onAdd={handleAddMed} knownAllergies={user?.allergies?.split(",")} />}
      {showInteraction && <DrugInteractionModal onClose={() => setShowInteraction(false)} />}
      {showSOS && <EmergencySOSModal onClose={() => setShowSOS(false)} />}
      {showSymptoms && <SymptomLoggerModal onClose={() => setShowSymptoms(false)} meds={meds} />}
    </div>
  );
}

// ── GUARDIAN PORTAL ───────────────────────────────────
function GuardianPortal({ setPage, dark, user, onLogout }) {
  const C = COLORS[dark ? "dark" : "light"];
  const accent = dark ? "#4ba6c7" : "#1d6f85";
  const [selectedPatient, setSelectedPatient] = useState(0);
  const [patients, setPatients] = useState([]);
  const [showAddPatient, setShowAddPatient] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      if (user && user.email) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/patients/${user.email}`);
          if (res.ok) {
            const data = await res.json();
            setPatients(data);
            if (data.length > 0) setSelectedPatient(0);
            else setSelectedPatient(-1);
          }
        } catch (err) {
          console.error("Failed to fetch patients:", err);
        }
      }
    };
    fetchPatients();
  }, [user]);

  const handleAddPatient = async (form) => {
    const { name, rel, age: ageValue, conditions, allergies, medications, emergencyContact } = form;
    const age = parseInt(ageValue);
    const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();

    const newPatient = {
      guardianId: user.email,
      initials,
      name,
      rel,
      age,
      adherence: 0,
      conditions: conditions || "",
      allergies: allergies || "",
      medications: medications || "",
      emergencyContact: emergencyContact || ""
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient)
      });
      if (res.ok) {
        const data = await res.json();
        const savedPatient = { ...newPatient, id: data.id };
        setPatients(prev => [...prev, savedPatient]);
        setSelectedPatient(patients.length);
      }
    } catch (err) {
      console.error("Failed to save patient:", err);
      setPatients(prev => [...prev, newPatient]);
      setSelectedPatient(patients.length);
    }
  };

  const handleDeletePatient = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this patient record?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const newPatients = patients.filter(p => p.id !== id);
        setPatients(newPatients);
        if (selectedPatient >= newPatients.length) setSelectedPatient(newPatients.length - 1);
      }
    } catch (err) {
      console.error("Failed to delete patient:", err);
    }
  };

  const p = patients[selectedPatient];
  return (
    <div style={{ minHeight: "100vh" }}>
      {showAddPatient && <AddPatientModal onClose={() => setShowAddPatient(false)} onAdd={handleAddPatient} />}
      <div style={{ background: C.navBg, backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "0 36px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 9, background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: accent, fontWeight: 700, fontSize: 12, cursor: "pointer" }}><Icons.Back /> Home</button>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${accent},${dark ? "#1f82a8" : "#4ba6c7"})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Icons.Shield /></div>
          <span style={{ fontWeight: 800, fontSize: 15, color: accent, fontFamily: "'Inter', sans-serif" }}>MedGuard AI</span>
          <span style={{ background: C.accentLight, color: accent, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 100, border: `1px solid ${C.accentBorder}` }}>Guardian</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", background: C.accentLight, borderRadius: 100, border: `1px solid ${C.accentBorder}` }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${accent},${dark ? "#1f82a8" : "#4ba6c7"})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}><Icons.User /></div>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{user?.name?.split(" ")[0] || "Guardian"}</span>
          </div>
          <button onClick={onLogout} style={{ padding: "7px 12px", borderRadius: 8, background: C.surface, color: C.textMid, fontWeight: 700, fontSize: 11, border: `1px solid ${C.border}`, cursor: "pointer" }}>Sign Out</button>
        </div>
      </div>

      <div style={{ background: dark ? "linear-gradient(160deg,rgba(13,31,60,0.9),rgba(26,107,191,0.2))" : "linear-gradient(160deg,rgba(26,107,191,0.08),rgba(79,195,247,0.05))", padding: "36px 48px 28px", borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: C.text, marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>Guardian Dashboard </h1>
        <p style={{ color: C.textMid, fontSize: 14 }}>Welcome back, {user?.name?.split(" ")[0] || "Guardian"}. Here's an overview of your loved ones.</p>
      </div>

      <div style={{ padding: "24px 48px" }}>
        {/* Patient selector */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>Select Patient</div>
          <div style={{ display: "flex", gap: 10 }}>
            {patients.map((pt, i) => (
              <div key={i} onClick={() => setSelectedPatient(i)} className="glass-card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 13, cursor: "pointer", border: `2px solid ${selectedPatient === i ? accent : C.border}`, background: selectedPatient === i ? C.accentLight : C.card, transition: "all .2s", minWidth: 170, position: "relative" }}>
                <button onClick={(e) => handleDeletePatient(pt.id, e)} style={{ position: "absolute", top: 5, right: 5, background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, fontWeight: "bold", padding: "2px 6px" }}>&times;</button>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${accent}22`, color: accent, fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${accent}44` }}>{pt.initials}</div>
                <div>
                  <div style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>{pt.name}</div>
                  <div style={{ fontSize: 11, color: C.textSoft }}>{pt.rel} · {pt.age} yrs</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: pt.adherence >= 85 ? "#34d399" : pt.adherence >= 70 ? "#fbbf24" : "#ef4444", marginTop: 2 }}>{pt.adherence || 0}% adherence</div>
                </div>
              </div>
            ))}
            <div onClick={() => setShowAddPatient(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 16px", borderRadius: 13, border: `2px dashed ${C.border}`, cursor: "pointer", minWidth: 120, color: C.textSoft, fontWeight: 600, fontSize: 13, gap: 6 }}><Icons.Plus /> Add</div>
          </div>
        </div>

        <div className="glass-card" style={{ background: C.card, borderRadius: 16, padding: "20px 24px", marginBottom: 14, border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 2, fontFamily: "'Inter', sans-serif" }}>{p ? p.name + "'s Overview" : "No Patient Added"}</div>
            <div style={{ fontSize: 13, color: C.textSoft }}>{p ? `${p.rel} · Age ${p.age} · Last active 5 min ago` : "Add a loved one to start tracking their health stats here."}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ padding: "8px 13px", borderRadius: 8, background: "rgba(52,211,153,0.12)", color: "#34d399", fontWeight: 700, fontSize: 11, border: "1px solid rgba(52,211,153,0.3)", cursor: "pointer" }}> All Meds Taken</button>
            <button style={{ padding: "8px 13px", borderRadius: 8, background: "rgba(239,68,68,0.12)", color: "#ef4444", fontWeight: 700, fontSize: 11, border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer" }}> Emergency</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 14 }}>
          {[[<Icons.Med />, "Today's Meds", p ? (p.medications ? "Tracking" : "None") : "0/0", p && p.medications ? "Active" : "—", "#34d399"], [<Icons.Flame />, "Streak", p ? "0d" : "0d", "consecutive", "#fbbf24"], [<Icons.SOS />, "Missed", p ? "0" : "0", "last 30 days", "#ef4444"], [<Icons.Chart />, "Adherence", p ? `${p.adherence || 0}%` : "0%", "this month", accent]].map(([ic, l, v, s, c]) => (
            <div key={l} className="glass-card" style={{ background: C.card, borderRadius: 12, padding: "15px 16px", border: `1px solid ${C.border}`, boxShadow: C.cardShadow }}>
              <div style={{ color: c, marginBottom: 6 }}>{ic}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: c, fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginTop: 1 }}>{l}</div>
              <div style={{ fontSize: 10, color: C.textSoft, marginTop: 1 }}>{s}</div>
            </div>
          ))}
        </div>

        {p && (
          <div className="glass-card" style={{ background: C.card, borderRadius: 16, padding: "20px 24px", marginBottom: 14, border: `1px solid ${C.border}` }}>
            <h3 style={{ fontWeight: 800, color: C.text, marginBottom: 16, fontSize: 16, borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}> Health Profile: {p.name}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", marginBottom: 4 }}>Conditions</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{p.conditions || "None listed"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", marginBottom: 4 }}>Allergies</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{p.allergies || "None declared"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", marginBottom: 4 }}>Emergency Contact</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{p.emergencyContact || "Not set"}</div>
              </div>
            </div>
            {p.medications && (
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#34d399", textTransform: "uppercase", marginBottom: 6 }}>Medications Overview</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, background: C.accentLight, padding: "12px", borderRadius: 10, border: `1px solid ${C.accentBorder}` }}>{p.medications}</div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="glass-card" style={{ background: C.card, borderRadius: 14, padding: "18px 20px", border: `1px solid ${C.border}` }}>
            <h3 style={{ fontWeight: 700, color: C.text, marginBottom: 12, fontSize: 14 }}>Medication Schedule</h3>
            {p && p.medications ? (
              <div style={{ background: C.accentLight, padding: "12px", borderRadius: 10, color: C.textMid, fontSize: 12, border: `1px solid ${C.accentBorder}` }}>
                {p.medications}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: C.textSoft, padding: "20px 0", textAlign: "center" }}>No medication input given yet.</div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="glass-card" style={{ background: C.accentLight, borderRadius: 13, padding: "16px 18px", border: `1px solid ${C.accentBorder}` }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: accent, fontSize: 13 }}> Guardian Controls</div>
              {["Dosage adjustments", "Medication additions", "Emergency contacts", "Activity updates", "Alert notifications"].map(f => (
                <div key={f} style={{ display: "flex", gap: 8, marginBottom: 6 }}><span style={{ color: "#34d399" }}></span><span style={{ fontSize: 12, color: C.textMid }}>{f}</span></div>
              ))}
            </div>
            <div className="glass-card" style={{ background: C.card, borderRadius: 13, padding: "14px 16px", border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 700, color: C.text, marginBottom: 10, fontSize: 13 }}> Recent Alerts</div>
              {[["", "Medication reminder sent", "2 min ago"], ["", "Aspirin 100mg confirmed taken", "1 hr ago"], ["", "Lisinopril due at 9:00 PM", "Upcoming"]].map(([ic, m, t]) => (
                <div key={m} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span>{ic}</span><div style={{ flex: 1 }}><div style={{ fontSize: 11, color: C.text }}>{m}</div><div style={{ fontSize: 10, color: C.textSoft, marginTop: 1 }}>{t}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NAVBAR ────────────────────────────────────────────
function Navbar({ setPage, scrollTo, dark, setDark }) {
  const [active, setActive] = useState("home");
  const [_mobileOpen, _setMobileOpen] = useState(false);

  const links = [
    { id: "home", label: "Home" },
    { id: "features", label: "Features" },
    { id: "patients", label: "For Patients" },
    { id: "guardians", label: "For Guardians" },
    { id: "about", label: "About" },
    { id: "blog", label: "Blog" },
  ];

  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, height: 80, background: dark ? "rgba(5, 8, 16, 0.95)" : "var(--ivory)", borderBottom: dark ? "1px solid rgba(45, 212, 191, 0.1)" : "1px solid rgba(20, 184, 166, 0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 80px", zIndex: 1000, backdropFilter: "blur(20px)" }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => { setPage("home"); scrollTo("home"); }}>
        <div className="animate-breathe" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20 5C22 5 32 10 32 20C32 30 22 35 20 35C18 35 8 30 8 20C8 10 18 5 20 5Z" stroke="var(--teal)" strokeWidth="3" strokeLinecap="round" />
            <path d="M14 20C14 20 17 23 20 23C23 23 26 20 26 20" stroke="var(--coral)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <span className="font-heading" style={{ fontSize: 22, fontWeight: 900, color: "var(--deep-teal)", letterSpacing: "-0.5px" }}>MedGuard</span>
      </div>

      {/* Desktop Links */}
      <div style={{ display: "flex", gap: 32 }}>
        {links.map(l => (
          <a key={l.id} href={`#${l.id}`} className={`nav-link ${active === l.id ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setActive(l.id); scrollTo(l.id); }} style={{ cursor: "pointer" }}>{l.label}</a>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => setPage("auth")} className="btn-outline" style={{ borderColor: "var(--teal)", color: "var(--teal-dark)", fontSize: 13 }}>Patient Login</button>
        <button onClick={() => setPage("auth")} className="btn-coral" style={{ fontSize: 13, boxShadow: "0 4px 14px rgba(251, 113, 133, 0.2)" }}>Guardian Login</button>
        <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 10, color: dark ? "#fbbf24" : "#475569", display: "flex", alignItems: "center" }}>{dark ? <Icons.Moon /> : <Icons.Sun />}</button>
      </div>

      {/* Mobile Hamburger (Simulated) */}
      <div className="mobile-only" style={{ display: "none" }}>
         {/* Hamburger placeholder */}
      </div>
    </nav>
  );
}

// ── HOME PAGE ─────────────────────────────────────────
function HomePage({ setPage, dark, user, sectionRefs }) {
  const gotoPortal = (dest) => { if (user) setPage(dest); else setPage("auth"); };
  
  const STEPS = [
    { title: "Connect", desc: "Link your patient profile to guardians or loved ones.", icon: <Icons.Link /> },
    { title: "Monitor", desc: "Real-time updates on medication and health events.", icon: <Icons.Eye /> },
    { title: "Care", desc: "Engage with AI companions and medical insights.", icon: <Icons.Heart /> },
    { title: "Flourish", desc: "Achieve optimal adherence and peace of mind.", icon: <Icons.Leaf /> }
  ];

  const FEATURES = [
    { name: "Care Canvas", desc: "Visual timeline of medical history and daily health.", icon: <Icons.Palette /> },
    { name: "Family Hub", desc: "Coordinate multiple caregivers for specialized support.", icon: <Icons.House /> },
    { name: "Telehealth", desc: "One-tap connection to providers and pharmacists.", icon: <Icons.Call /> },
    { name: "AI Companion", desc: "Caring interaction for emotional and clinical support.", icon: <Icons.AI /> }
  ];

  return (
    <div style={{ background: dark ? "#050810" : "var(--ivory)", minHeight: "100vh", position: "relative" }}>
      {/* ── HERO SECTION ── */}
      <section ref={sectionRefs.home} id="home" style={{ height: "100vh", display: "flex", alignItems: "center", padding: "0 80px", position: "relative", overflow: "hidden" }} suppressHydrationWarning>
        
        {/* Abstract Illustration */}
        <div style={{ position: "absolute", right: "-5%", bottom: "0", width: "60%", height: "90%", pointerEvents: "none", zIndex: 1, opacity: 0.8 }}>
          <svg width="100%" height="100%" viewBox="0 0 800 800" fill="none">
             {/* Breathing Nodes */}
             <circle cx="300" cy="300" r="100" fill="var(--teal)" opacity="0.05" className="animate-breathe" />
             <circle cx="500" cy="500" r="150" fill="var(--coral)" opacity="0.03" className="animate-breathe" style={{ animationDelay: '1s' }} />
             <path d="M100 400 Q 400 100 700 400 T 1000 400" stroke="var(--teal)" strokeWidth="1" strokeDasharray="10 10" opacity="0.1" />
             <path d="M100 200 Q 450 500 800 200" stroke="var(--coral)" strokeWidth="1" strokeDasharray="5 5" opacity="0.1" />
             {/* Simplified Patient/Guardian figures (abstract) */}
             <rect x="250" y="250" width="100" height="150" rx="40" fill="var(--teal)" opacity="0.1" />
             <rect x="450" y="400" width="100" height="150" rx="40" fill="var(--coral)" opacity="0.1" />
          </svg>
        </div>

        <div style={{ flex: 1, position: "relative", zIndex: 2, paddingBottom: 60 }}>
          <h1 className="font-heading animate-bloom" style={{ fontSize: "clamp(48px, 6vw, 84px)", fontWeight: 900, lineHeight: 1.05, color: "var(--deep-teal)", marginBottom: 28, letterSpacing: "-2px" }}>
            Care That <span style={{ color: "var(--terracotta)" }}>Connects.</span><br />
            Lives That Flourish.
          </h1>
          <p className="animate-bloom" style={{ fontSize: 20, color: "var(--text-soft)", lineHeight: 1.6, marginBottom: 44, maxWidth: 540 }}>
            A secure, living platform linking patients and guardians with compassionate care.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            <button key="btn-pat" onClick={() => gotoPortal("patient")} className="btn-primary" style={{ padding: "18px 40px", fontSize: 16 }}>Enter as Patient</button>
            <button key="btn-gua" onClick={() => gotoPortal("guardian")} className="btn-outline" style={{ padding: "18px 40px", fontSize: 16 }}>Enter as Guardian</button>
          </div>

          <div style={{ display: "flex", gap: 32, marginTop: 80 }} className="animate-bloom">
            {[
              { label: "HIPAA Compliant", icon: <Icons.Shield /> },
              { label: "Secure Encryption", icon: <Icons.Diamond /> },
              { label: "Trusted by families & clinics", icon: <Icons.Users /> }
            ].map(signal => (
              <div key={signal.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", background: dark ? "rgba(15, 23, 42, 0.7)" : "white", borderRadius: "14px", border: dark ? "1px solid rgba(45, 212, 191, 0.12)" : "1px solid rgba(20, 184, 166, 0.08)", boxShadow: dark ? "0 10px 30px rgba(0,0,0,0.2)" : "0 10px 30px rgba(0,0,0,0.03)" }}>
                <span style={{ display: "flex", alignItems: "center", color: "var(--teal)" }}>{signal.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--teal-dark)", textTransform: "uppercase", letterSpacing: 0.5 }}>{signal.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "120px 80px", background: dark ? "#0a0f1a" : "white" }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
           <h2 className="font-heading" style={{ fontSize: 44, marginBottom: 20 }}>Living Care Network</h2>
           <p style={{ color: "var(--text-soft)" }}>Connecting the dots of your healthcare journey through a unified ecosystem.</p>
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
           {/* Connector line background */}
           <div style={{ position: "absolute", top: "25%", left: "10%", right: "10%", height: 2, background: "linear-gradient(90deg, transparent, var(--teal) 20%, var(--coral) 80%, transparent)", opacity: 0.1, zIndex: 0 }} />
           
           {STEPS.map((step, i) => (
             <div key={step.title} style={{ width: "22%", position: "relative", zIndex: 1 }}>
               <div className="glass-card animate-bloom" style={{ padding: "40px 30px", borderRadius: "30px 30px 40px 10px", textAlign: "center", height: "100%", border: "1.5px solid rgba(20, 184, 166, 0.05)" }}>
                  <div className="animate-breathe" style={{ width: 64, height: 64, background: i % 2 === 0 ? "var(--teal)" : "var(--coral)", borderRadius: "20px 5px 20px 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 24px", color: "white", boxShadow: "0 15px 30px rgba(0,0,0,0.08)" }}>{step.icon}</div>
                  <h3 className="font-heading" style={{ fontSize: 20, marginBottom: 12, color: "var(--deep-teal)" }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.6 }}>{step.desc}</p>
               </div>
             </div>
           ))}
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section style={{ padding: "120px 80px", background: dark ? "#050810" : "var(--ivory)" }}>
         <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 32 }}>
           {FEATURES.map(f => (
             <div key={f.name} className="glass-card" style={{ padding: "48px", display: "flex", gap: 32, alignItems: "center", borderRadius: "32px", border: dark ? "1.5px solid rgba(45,212,191,0.1)" : "1.5px solid white" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: dark ? "rgba(255,255,255,0.05)" : "white", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal)", boxShadow: dark ? "0 10px 40px rgba(0,0,0,0.3)" : "0 10px 40px rgba(20, 184, 166, 0.05)", flexShrink: 0 }}>{f.icon}</div>
                <div>
                   <h3 className="font-heading" style={{ fontSize: 22, color: "var(--deep-teal)", marginBottom: 10 }}>{f.name}</h3>
                   <p style={{ fontSize: 16, color: "var(--text-soft)", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
             </div>
           ))}
         </div>
      </section>

      {/* ── TESTIMONIALS (Simplified Carousel) ── */}
      <section style={{ padding: "120px 80px", background: dark ? "#0a0f1a" : "white", textAlign: "center" }}>
         <div className="glass-card" style={{ maxWidth: 800, margin: "0 auto", padding: "60px 40px", borderRadius: "40px" }}>
            <Icons.Quote />
            <p style={{ fontSize: 22, fontWeight: 500, color: "var(--text-main)", fontStyle: "italic", lineHeight: 1.6, marginBottom: 32 }}>
              MedGuard has changed how we care for my mother. I can see her adherence in real-time, and the AI advisor gives me the peace of mind I couldn't find elsewhere.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
               <div style={{ width: 48, height: 48, borderRadius: "50%", background: dark ? "rgba(255,255,255,0.1)" : "#e5e7eb" }}></div>
               <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>Sarah Henderson</div>
                  <div style={{ fontSize: 12, color: "var(--text-soft)" }}>Guardian, California</div>
               </div>
            </div>
         </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: dark ? "#020617" : "var(--deep-teal)", padding: "100px 80px 40px", color: dark ? "var(--text-main)" : "var(--ivory)", position: "relative", overflow: "hidden", borderTop: dark ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
        {/* BG Node animations */}
        <div style={{ position: "absolute", top: -50, right: 0, width: 200, height: 200, background: "radial-gradient(circle, var(--teal) 0%, transparent 70%)", opacity: 0.1 }} />
        
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 1, marginBottom: 80 }}>
           <div style={{ width: "30%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 4C18 4 24 8 24 16C24 24 18 28 16 28C14 28 8 24 8 16C8 8 14 4 16 4Z" stroke="white" strokeWidth="2.5" />
                </svg>
                <span className="font-heading" style={{ fontSize: 24, fontWeight: 900 }}>MedGuard</span>
              </div>
              <p style={{ opacity: 0.6, lineHeight: 1.6, fontSize: 14 }}>Linking patients and guardians with compassionate health intelligence.</p>
           </div>
           
           <div style={{ display: "flex", gap: 80 }}>
              <div>
                <h4 style={{ fontWeight: 800, marginBottom: 20 }}>Solutions</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: 0.6, fontSize: 14 }}>
                  <span>For Patients</span><span>For Families</span><span>Clinics</span><span>API</span>
                </div>
              </div>
              <div>
                <h4 style={{ fontWeight: 800, marginBottom: 20 }}>Company</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: 0.6, fontSize: 14 }}>
                  <span>About</span><span>Security</span><span>Privacy</span><span>Blog</span>
                </div>
              </div>
           </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 40, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, opacity: 0.4 }}>
           <span>© 2026 MedGuard Living Care Network.</span>
           <div style={{ display: "flex", gap: 24 }}><span>Privacy Policy</span><span>Terms of Service</span></div>
        </div>
      </footer>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [learnMore, setLearnMore] = useState(null); // name of service or null
  const [dark, setDark] = useState(false); // default light
  const [lang, setLang] = useState("en");
  const [user, setUser] = useState(null);
  const offline = useOffline();

  // Initialize refs using useMemo to avoid recreation on every render
  const sectionRefs = useMemo(() => ({
    home: useRef(null), about: useRef(null),
    services: useRef(null), contact: useRef(null),
  }), []);

  const hasLoadedUser = useRef(false);

  useEffect(() => {
    if (hasLoadedUser.current) return;
    hasLoadedUser.current = true;
    
    const savedUser = localStorage.getItem("medguard_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem("medguard_user");
      }
    }
  }, []);

  const scrollTo = (id) => {
    setTimeout(() => { sectionRefs[id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 50);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === "guardian") setPage("guardian");
    else setPage("patient");
  };

  const handleLogout = async () => {
    localStorage.removeItem("medguard_user");
    setUser(null);
    setPage("home");
  };

  const pageRef = useRef(page);
  
  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  
  useEffect(() => {
    if ((pageRef.current === "patient" || pageRef.current === "guardian") && !user) {
      setPage("auth");
    }
  }, [user]);

  // Learn more page
  if (learnMore) {
    return (
      <div className={dark ? "dark-mode" : ""}>
        <style>{makeGCSS(dark)}</style>
        <LearnMorePage
          serviceName={learnMore}
          dark={dark}
          onBack={() => setLearnMore(null)}
          onGetStarted={() => { setLearnMore(null); setPage("auth"); }}
        />
      </div>
    );
  }

  return (
    <div className={dark ? "dark-mode" : ""}>
      <style>{makeGCSS(dark)}</style>
      {offline && page === "home" && <OfflineBanner />}

      {page === "home" && (
        <Navbar setPage={setPage} scrollTo={scrollTo} dark={dark} setDark={setDark} lang={lang} setLang={setLang} user={user} onLogout={handleLogout} />
      )}

      {page === "auth" && <AuthPage onLogin={handleLogin} dark={dark} setDark={setDark} onBack={() => setPage("home")} />}
      {page === "home" && <HomePage setPage={setPage} setLearnMore={setLearnMore} dark={dark} user={user} sectionRefs={sectionRefs} />}
      {page === "patient" && user && <PatientPortal setPage={setPage} dark={dark} setDark={setDark} lang={lang} setLang={setLang} user={user} onLogout={handleLogout} />}
      {page === "guardian" && user && <GuardianPortal setPage={setPage} dark={dark} user={user} onLogout={handleLogout} />}
    </div>
  );
}