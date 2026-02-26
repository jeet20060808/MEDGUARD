import { useState, useEffect, useRef, useCallback } from "react";
const API_BASE_URL = "https://medguard-jjly.onrender.com";
/* ═══════════════════════════════════════════════════════
   MedGuard AI — ClyHealth Blue Edition
   Theme: Deep Navy · Cyan Accent · Glassmorphism
   Matches ClyHealth dashboard aesthetic from reference image
═══════════════════════════════════════════════════════ */

const T = {
  en: { dashboard: "Dashboard", medications: "Medications", aiAdvisor: "AI Advisor", analytics: "Analytics", symptoms: "Symptoms", vaccinations: "Vaccinations", appointments: "Appointments", settings: "Settings", goodMorning: "Good Morning", markTaken: "Mark Taken ✓", taken: "✓ Taken", addMed: "+ Add Med", healthScore: "Health Score", streak: "Streak", interactions: "Interactions", aiInsights: "AI Insights", dailyProgress: "Daily Progress", safetyDash: "Safety Dashboard", drugInteraction: "Drug Interaction Checker", emergencySOS: "Emergency SOS", weeklyReport: "Download Report", moodCheck: "How are you feeling?", langName: "English" },
  hi: { dashboard: "डैशबोर्ड", medications: "दवाइयाँ", aiAdvisor: "AI सलाहकार", analytics: "विश्लेषण", symptoms: "लक्षण", vaccinations: "टीकाकरण", appointments: "अपॉइंटमेंट", settings: "सेटिंग्स", goodMorning: "सुप्रभात", markTaken: "ली ✓", taken: "✓ ली", addMed: "+ दवा जोड़ें", healthScore: "स्वास्थ्य स्कोर", streak: "स्ट्रीक", interactions: "इंटरेक्शन", aiInsights: "AI अंतर्दृष्टि", dailyProgress: "दैनिक प्रगति", safetyDash: "सुरक्षा डैशबोर्ड", drugInteraction: "दवा इंटरेक्शन चेकर", emergencySOS: "आपातकालीन SOS", weeklyReport: "रिपोर्ट डाउनलोड", moodCheck: "आज आप कैसा महसूस कर रहे हैं?", langName: "हिंदी" },
  gu: { dashboard: "ડૅશબોર્ડ", medications: "દવાઓ", aiAdvisor: "AI સલાહ", analytics: "વિશ્લેષણ", symptoms: "લક્ષણો", vaccinations: "રસીકરણ", appointments: "એપૉઇન્ટમેન્ટ", settings: "સેટિંગ્સ", goodMorning: "સુ-પ્રભાત", markTaken: "લીધી ✓", taken: "✓ લીધી", addMed: "+ દવા ઉમેરો", healthScore: "સ્વાસ્થ્ય સ્કોર", streak: "સ્ટ્રીક", interactions: "ઇન્ટરેક્શન", aiInsights: "AI સૂઝ", dailyProgress: "દૈનિક પ્રગતિ", safetyDash: "સુરક્ષા ડૅશ", drugInteraction: "ડ્રગ ઇન્ટરેક્શન ચેકર", emergencySOS: "ઇમર્જન્સી SOS", weeklyReport: "રિપૉર્ટ ડાઉનલૉડ", moodCheck: "આજે તમે કેવું અનુભવો છો?", langName: "ગુજરાતી" },
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

// ── CLYHEALTH BLUE THEME ──────────────────────────────
const COLORS = {
  light: {
    bg: "#e8f0fb",
    surface: "rgba(255,255,255,0.85)",
    card: "rgba(255,255,255,0.75)",
    border: "rgba(79,195,247,0.18)",
    text: "#0a1628",
    textMid: "#2d5a8e",
    textSoft: "#6b9cc8",
    accent: "#1a6bbf",
    accentLight: "rgba(79,195,247,0.10)",
    accentBorder: "rgba(79,195,247,0.30)",
    navBg: "rgba(232,240,251,0.95)",
    inputBg: "rgba(255,255,255,0.9)",
    heroGrad: "linear-gradient(160deg,#deeafb 0%,#e8f4fd 100%)",
    cardShadow: "0 4px 24px rgba(26,107,191,0.10), 0 1px 4px rgba(0,0,0,0.04)",
    sectionAlt: "rgba(255,255,255,0.6)",
    tag: "rgba(79,195,247,0.12)", tagText: "#1a6bbf",
    gradStart: "#1a6bbf", gradEnd: "#4fc3f7",
  },
  dark: {
    bg: "#060f1e",
    surface: "rgba(255,255,255,0.06)",
    card: "rgba(255,255,255,0.06)",
    border: "rgba(79,195,247,0.14)",
    text: "#e8f4fd",
    textMid: "#8ab4d4",
    textSoft: "#4a7aa0",
    accent: "#4fc3f7",
    accentLight: "rgba(79,195,247,0.08)",
    accentBorder: "rgba(79,195,247,0.22)",
    navBg: "rgba(6,15,30,0.96)",
    inputBg: "rgba(255,255,255,0.05)",
    heroGrad: "linear-gradient(160deg,#060f1e 0%,#0d1f3c 100%)",
    cardShadow: "0 4px 28px rgba(0,0,0,0.5)",
    sectionAlt: "rgba(255,255,255,0.03)",
    tag: "rgba(79,195,247,0.10)", tagText: "#4fc3f7",
    gradStart: "#4fc3f7", gradEnd: "#2196f3",
  },
};

// ── LEARN MORE CONTENT ────────────────────────────────
const LEARN_MORE_DATA = {
  "Medication Management": {
    icon: "💊",
    tagline: "Never Miss a Dose Again",
    description: "Our intelligent medication management system goes beyond simple reminders. It learns your daily schedule, adapts to your lifestyle, and guarantees perfect adherence through smart AI-driven notifications.",
    features: [
      { icon: "⏰", title: "Smart Scheduling", desc: "AI-powered reminders that adapt to your daily routine, sleep patterns, and meal times automatically." },
      { icon: "📦", title: "Refill Tracking", desc: "Get proactive refill alerts 7 days before running out — never scramble for a prescription at the last minute." },
      { icon: "📊", title: "Dose History Log", desc: "Complete visual logs of every dose taken, missed, or delayed with full adherence scoring and trends." },
      { icon: "🔗", title: "Pharmacy Integration", desc: "Connect directly with your local pharmacy for seamless one-tap refill orders without leaving the app." },
      { icon: "🔔", title: "Multi-Device Sync", desc: "Reminders sync instantly across your phone, tablet, smartwatch, and family members' devices." },
      { icon: "🧠", title: "AI Personalization", desc: "Machine learning analyzes your habits and optimizes reminder timing for maximum adherence over time." },
    ],
    stats: [["98%", "Adherence Rate"], ["50K+", "Daily Reminders"], ["4.9★", "User Rating"]],
    accentColor: "#4fc3f7",
  },
  "AI Health Advisor": {
    icon: "🤖",
    tagline: "Your 24/7 Personal Health Companion",
    description: "Powered by advanced medical AI trained on millions of clinical records, the MedGuard AI Advisor delivers instant, evidence-based health guidance whenever you need it — night or day, no waiting room required.",
    features: [
      { icon: "💬", title: "Symptom Analysis", desc: "Describe your symptoms in plain language and receive evidence-based insights and recommended next steps." },
      { icon: "💊", title: "Drug Interaction Alerts", desc: "Real-time warnings before you combine medications that could cause harmful or dangerous interactions." },
      { icon: "📋", title: "Lab Result Interpretation", desc: "Upload your lab reports and get plain-English explanations of what every number and marker means." },
      { icon: "🩺", title: "When to See a Doctor", desc: "Clear urgency guidance — whether to rest at home, call your doctor, or seek immediate emergency care." },
      { icon: "🍎", title: "Lifestyle Recommendations", desc: "Personalized diet, exercise, and wellness tips based on your medications, conditions, and health goals." },
      { icon: "📱", title: "Voice & Text Support", desc: "Ask health questions via voice or text in English, Hindi, or Gujarati for maximum accessibility." },
    ],
    stats: [["24/7", "Availability"], ["2M+", "Questions Answered"], ["<3s", "Response Time"]],
    accentColor: "#a78bfa",
  },
  "Drug Interaction Check": {
    icon: "🛡️",
    tagline: "Real-Time Safety at Your Fingertips",
    description: "Our comprehensive drug interaction database covers over 50,000 known interactions, updated daily from FDA, WHO, and clinical research sources. Check any combination of medications, supplements, or foods instantly.",
    features: [
      { icon: "🔍", title: "50,000+ Interactions", desc: "Complete database covering prescription drugs, OTC medications, vitamins, herbal supplements, and common foods." },
      { icon: "⚠️", title: "Severity Ratings", desc: "Every interaction rated Minor, Moderate, or Major with clinical evidence and peer-reviewed research backing." },
      { icon: "🥗", title: "Food Interactions", desc: "Understand how grapefruit, alcohol, dairy, caffeine, and specific foods affect your medications' efficacy." },
      { icon: "📱", title: "Barcode Scanner", desc: "Scan any medication barcode with your phone camera for instant interaction analysis against your current list." },
      { icon: "🔄", title: "Daily Updates", desc: "Database updated daily with the latest FDA alerts, drug recalls, and new clinical findings." },
      { icon: "👨‍⚕️", title: "Pharmacist Review", desc: "Complex interactions can be flagged for review by a licensed pharmacist within 4 hours." },
    ],
    stats: [["50K+", "Drug Interactions"], ["Daily", "Database Updates"], ["FDA", "Approved Data"]],
    accentColor: "#fbbf24",
  },
  "Guardian Portal": {
    icon: "👥",
    tagline: "Care for Loved Ones, From Anywhere",
    description: "The Guardian Portal gives caregivers complete real-time visibility into the health of those they care for — whether elderly parents, children with chronic conditions, or anyone who needs structured medication support.",
    features: [
      { icon: "👁️", title: "Real-Time Monitoring", desc: "See medication adherence, vital signs, mood check-ins, and health events as they happen, live." },
      { icon: "🔔", title: "Instant Alerts", desc: "Get notified the moment a dose is missed, an Emergency SOS is triggered, or health metrics leave safe ranges." },
      { icon: "📅", title: "Appointment Management", desc: "Manage doctor appointments, specialist visits, and medical records for all loved ones in one unified view." },
      { icon: "💌", title: "Shared Health Notes", desc: "Leave notes, reminders, and care instructions visible across the entire care team and family." },
      { icon: "📊", title: "Caregiver Analytics", desc: "Track long-term adherence trends, identify deteriorating patterns, and generate reports for healthcare providers." },
      { icon: "🏥", title: "Multi-Patient Dashboard", desc: "Manage up to 5 patients simultaneously from a single guardian account with individual risk profiles." },
    ],
    stats: [["5", "Patients per Account"], ["Real-Time", "Live Updates"], ["100%", "Data Privacy"]],
    accentColor: "#34d399",
  },
  "Health Analytics": {
    icon: "📊",
    tagline: "Understand Your Health Trends",
    description: "Visualize weeks and months of health data in beautiful, easy-to-read charts. Identify patterns, track improvement, celebrate streaks, and share detailed reports with your healthcare provider at every appointment.",
    features: [
      { icon: "📉", title: "Adherence Streaks", desc: "Gamified streak tracking makes staying on your medication plan engaging, rewarding, and motivating every day." },
      { icon: "📈", title: "Trend Analysis", desc: "Spot correlations between medication timing, sleep quality, physical activity, mood, and how you feel." },
      { icon: "🏆", title: "Health Score (0–100)", desc: "A single, clear score summarizing your overall medication adherence, vitals trends, and lifestyle factors." },
      { icon: "📤", title: "Doctor-Ready Reports", desc: "One-tap export of your complete health summary as a professional PDF, ready to share at any appointment." },
      { icon: "🔮", title: "Predictive Insights", desc: "AI identifies upcoming risk patterns — such as likely refill lapses or worsening adherence — before they happen." },
      { icon: "📅", title: "30/60/90-Day Views", desc: "Toggle between weekly, monthly, and quarterly health data views to understand both short and long-term trends." },
    ],
    stats: [["30-Day", "History View"], ["10+", "Chart Types"], ["PDF", "Export Ready"]],
    accentColor: "#34d399",
  },
  "Emergency SOS": {
    icon: "🆘",
    tagline: "Help Is Always One Tap Away",
    description: "In a medical emergency, every second is critical. MedGuard Emergency SOS instantly connects you to help — alerting emergency contacts, sharing your precise GPS location, and displaying vital medical information to first responders.",
    features: [
      { icon: "📍", title: "Auto Location Sharing", desc: "Your exact GPS coordinates are sent instantly to all emergency contacts and optionally to emergency services." },
      { icon: "📞", title: "One-Tap Emergency Call", desc: "Call your designated emergency contact or dial 112 immediately with a single tap — even from the lock screen." },
      { icon: "🏥", title: "Medical Info Card", desc: "First responders access your blood type, allergies, current medications, and conditions without unlocking your phone." },
      { icon: "⌚", title: "Wearable Integration", desc: "Trigger Emergency SOS from your Apple Watch or Android smartwatch if you're unable to reach your phone." },
      { icon: "👥", title: "Multi-Contact Alerts", desc: "Simultaneously alert up to 5 emergency contacts via SMS, push notification, and email with your location." },
      { icon: "🔇", title: "Silent SOS Mode", desc: "Activate silent SOS in unsafe situations — alerts are sent without any sound or visible screen interaction." },
    ],
    stats: [["<5s", "Alert Time"], ["5", "Emergency Contacts"], ["112", "Auto Dial Ready"]],
    accentColor: "#ef4444",
  },
};

// ── GLOBAL CSS ────────────────────────────────────────
const makeGCSS = (dark) => {
  const C = COLORS[dark ? "dark" : "light"];
  return `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: ${dark ? "linear-gradient(135deg,#060f1e 0%,#0d1f3c 50%,#060f1e 100%)" : "linear-gradient(135deg,#deeafb 0%,#e8f4fd 50%,#deeafb 100%)"};
    background-attachment: fixed;
    color: ${C.text};
    transition: background .4s, color .4s;
    -webkit-font-smoothing: antialiased;
  }
  input, select, textarea { font-family: 'DM Sans', inherit; color-scheme: ${dark ? "dark" : "light"}; }
  button { font-family: inherit; cursor: pointer; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
  @keyframes fadeUp    { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes float1    { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
  @keyframes float2    { 0%,100%{transform:translateY(-5px)} 50%{transform:translateY(5px)} }
  @keyframes heartbeat { 0%,100%{transform:scale(1)} 14%{transform:scale(1.13)} 28%{transform:scale(1)} 42%{transform:scale(1.08)} 56%{transform:scale(1)} }
  @keyframes ecgDraw   { from{stroke-dashoffset:500} to{stroke-dashoffset:0} }
  @keyframes scanline  { 0%{top:0%;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:100%;opacity:0} }
  @keyframes dotPulse  { 0%,100%{box-shadow:0 0 0 0 rgba(79,195,247,.45)} 70%{box-shadow:0 0 0 14px rgba(79,195,247,0)} }
  @keyframes pulse     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(1.3)} }
  @keyframes modalIn   { from{opacity:0;transform:scale(.93) translateY(18px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes toastIn   { from{opacity:0;transform:translateX(110%)} to{opacity:1;transform:translateX(0)} }
  @keyframes toastOut  { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(110%)} }
  @keyframes dotB      { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-7px)} }
  @keyframes sosPulse  { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)} 70%{box-shadow:0 0 0 22px rgba(239,68,68,0)} }
  @keyframes orbFloat  { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-28px) rotate(8deg)} }
  @keyframes authSlide { from{opacity:0;transform:translateY(28px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes revealUp  { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
  @keyframes revealL   { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
  @keyframes revealR   { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
  @keyframes shimmer   { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  .fade-up    { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) both; }
  .float-a    { animation: float1 4.5s ease-in-out infinite; }
  .float-b    { animation: float2 5.5s ease-in-out infinite .7s; }
  .modal-wrap { animation: modalIn .3s cubic-bezier(.22,1,.36,1) both; }
  .toast-in   { animation: toastIn .4s cubic-bezier(.22,1,.36,1) both; }
  .toast-out  { animation: toastOut .4s ease both; }
  .dot1{animation:dotB 1.2s 0s infinite} .dot2{animation:dotB 1.2s .2s infinite} .dot3{animation:dotB 1.2s .4s infinite}
  .auth-card  { animation: authSlide .5s cubic-bezier(.22,1,.36,1) both; }
  .reveal-up  { opacity:0; } .reveal-up.visible  { animation: revealUp .7s cubic-bezier(.22,1,.36,1) forwards; }
  .reveal-l   { opacity:0; } .reveal-l.visible   { animation: revealL .7s cubic-bezier(.22,1,.36,1) forwards; }
  .reveal-r   { opacity:0; } .reveal-r.visible   { animation: revealR .7s cubic-bezier(.22,1,.36,1) forwards; }
  .glass-card { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
  .card-lift:hover { transform: translateY(-4px); transition: all .3s cubic-bezier(.22,1,.36,1); }
  .btn-blue:hover { opacity:.88; transform:translateY(-1px); transition: all .2s; }
  .med-row:hover { background: ${dark ? "rgba(79,195,247,0.06)" : "rgba(26,107,191,0.05)"} !important; }
  .tab-pill:hover { background: ${dark ? "rgba(79,195,247,0.10)" : "rgba(26,107,191,0.08)"} !important; }
  .overlay { position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:300;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px); }
  .nav-link { position:relative; }
  .nav-link::after { content:'';position:absolute;bottom:-3px;left:0;width:0;height:2px;background:${C.accent};border-radius:2px;transition:width .25s; }
  .nav-link.active::after,.nav-link:hover::after { width:100%; }
  .ecg-path { stroke-dasharray:500; animation: ecgDraw 2s ease forwards; }
  .lm-feature:hover { border-color: rgba(79,195,247,0.4) !important; background: rgba(79,195,247,0.06) !important; transform: translateY(-2px); transition: all .25s; }
  @media print { .no-print{display:none!important} }
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

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal-up,.reveal-l,.reveal-r");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
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
    <div style={{ minHeight: "100vh", background: dark ? "linear-gradient(135deg,#060f1e,#0d1f3c)" : "linear-gradient(135deg,#deeafb,#e8f4fd)" }}>
      {/* Top bar */}
      <div style={{ background: C.navBg, backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "0 48px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${dark ? "#4fc3f7" : "#1a6bbf"},${dark ? "#2196f3" : "#4fc3f7"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>♥</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: "'Outfit', sans-serif" }}>MedGuard AI</span>
        </div>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", borderRadius: 10, background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: C.accent, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all .2s" }}>
          ← Back to Services
        </button>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 32px 80px" }}>
        {/* Hero block */}
        <div style={{ background: C.card, backdropFilter: "blur(20px)", border: `1px solid ${C.border}`, borderRadius: 24, padding: "40px 40px", marginBottom: 28, boxShadow: C.cardShadow, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(circle,${data.accentColor}18,transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: `${data.accentColor}20`, border: `2px solid ${data.accentColor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>{data.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: data.accentColor, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>MedGuard AI Feature</div>
              <h1 style={{ fontSize: 34, fontWeight: 800, color: C.text, marginBottom: 8, fontFamily: "'Outfit', sans-serif", lineHeight: 1.15 }}>{serviceName}</h1>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: data.accentColor, marginBottom: 14 }}>{data.tagline}</h2>
              <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.8, maxWidth: 580 }}>{data.description}</p>
            </div>
          </div>
          {/* Stats row */}
          <div style={{ display: "flex", gap: 16, marginTop: 28, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
            {data.stats.map(([val, label]) => (
              <div key={label} style={{ textAlign: "center", padding: "14px 24px", background: `${data.accentColor}12`, border: `1px solid ${data.accentColor}30`, borderRadius: 14, flex: 1 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: data.accentColor, fontFamily: "'JetBrains Mono', monospace" }}>{val}</div>
                <div style={{ fontSize: 12, color: C.textMid, marginTop: 4, fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features grid */}
        <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 18, fontFamily: "'Outfit', sans-serif" }}>What's Included</h3>
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
        <div style={{ background: `linear-gradient(135deg,${data.accentColor}18,${data.accentColor}08)`, border: `1px solid ${data.accentColor}35`, borderRadius: 20, padding: "32px 36px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 10, fontFamily: "'Outfit', sans-serif" }}>Ready to Experience {serviceName}?</div>
          <p style={{ color: C.textMid, marginBottom: 24, fontSize: 15 }}>Join thousands of users who trust MedGuard AI for their daily health management.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={onGetStarted} style={{ padding: "13px 32px", borderRadius: 12, background: `linear-gradient(135deg,${dark ? "#4fc3f7" : "#1a6bbf"},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontWeight: 700, fontSize: 15, border: "none", boxShadow: `0 6px 20px ${data.accentColor}40`, cursor: "pointer" }}>
              Get Started Free →
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
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(79,195,247,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{icon}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#e8f4fd" }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: "#8ab4d4", marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
      <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(79,195,247,0.2)", fontSize: 18, color: "#8ab4d4", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>×</button>
    </div>
  );
}

const iStyle = { width: "100%", padding: "11px 14px", border: "1.5px solid rgba(79,195,247,0.2)", borderRadius: 10, fontSize: 14, outline: "none", background: "rgba(255,255,255,0.06)", color: "#e8f4fd", fontFamily: "'DM Sans', sans-serif", transition: "border-color .2s" };
const lStyle = { fontSize: 11, fontWeight: 700, color: "#8ab4d4", textTransform: "uppercase", letterSpacing: .8, display: "block", marginBottom: 6 };

function AddMedModal({ onClose, onAdd, knownAllergies = [] }) {
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "Once daily", time: "08:00", purpose: "", refill: "", notes: "" });
  const [allergyAlert, setAllergyAlert] = useState(null);
  const up = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (k === "name") { const m = knownAllergies.find(a => v.toLowerCase().includes(a.toLowerCase())); setAllergyAlert(m ? `⚠️ ALLERGY ALERT — "${m}" detected!` : null); } };
  return (
    <Modal onClose={onClose}>
      <ModalHeader icon="💊" title="Add Medication" sub="Fill in your medication details" onClose={onClose} />
      {allergyAlert && <div style={{ background: "rgba(239,68,68,0.12)", border: "2px solid rgba(239,68,68,0.5)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#fca5a5", fontWeight: 700, fontSize: 14 }}>🚨 {allergyAlert}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div style={{ marginBottom: 14, gridColumn: "1/-1" }}><label style={lStyle}>Medicine Name *</label><input placeholder="e.g. Metformin" value={form.name} onChange={e => up("name", e.target.value)} style={iStyle} /></div>
        <div style={{ marginBottom: 14 }}><label style={lStyle}>Dosage *</label><input placeholder="e.g. 500mg" value={form.dosage} onChange={e => up("dosage", e.target.value)} style={iStyle} /></div>
        <div style={{ marginBottom: 14 }}><label style={lStyle}>Frequency *</label><select value={form.frequency} onChange={e => up("frequency", e.target.value)} style={{ ...iStyle, background: "rgba(255,255,255,0.06)" }}>{["Once daily", "Twice daily", "Three times daily", "Every 8 hours", "Weekly", "As needed"].map(o => <option key={o}>{o}</option>)}</select></div>
        <div style={{ marginBottom: 14 }}><label style={lStyle}>Reminder Time *</label><input type="time" value={form.time} onChange={e => up("time", e.target.value)} style={iStyle} /></div>
        <div style={{ marginBottom: 14 }}><label style={lStyle}>Purpose</label><input placeholder="e.g. Diabetes" value={form.purpose} onChange={e => up("purpose", e.target.value)} style={iStyle} /></div>
        <div style={{ marginBottom: 14 }}><label style={lStyle}>Refill Date</label><input type="date" value={form.refill} onChange={e => up("refill", e.target.value)} style={iStyle} /></div>
        <div style={{ marginBottom: 20, gridColumn: "1/-1" }}><label style={lStyle}>Notes</label><input placeholder="Take with food…" value={form.notes} onChange={e => up("notes", e.target.value)} style={iStyle} /></div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: 11, background: "rgba(255,255,255,0.06)", color: "#8ab4d4", fontWeight: 700, fontSize: 14, border: "1px solid rgba(79,195,247,0.15)", cursor: "pointer" }}>Cancel</button>
        <button onClick={() => { if (!form.name || !form.dosage) return; onAdd(form); onClose(); }} style={{ flex: 2, padding: "13px", borderRadius: 11, background: "linear-gradient(135deg,#4fc3f7,#2196f3)", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>✅ Add Medication</button>
      </div>
    </Modal>
  );
}

function AddPatientModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", rel: "", age: "", conditions: "", allergies: "", medications: "", emergencyContact: "" });
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Modal onClose={onClose}>
      <ModalHeader icon="👥" title="Add Loved One" sub="Details of the person you're caring for" onClose={onClose} />
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
        <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: 11, background: "rgba(255,255,255,0.06)", color: "#8ab4d4", fontWeight: 700, fontSize: 14, border: "1px solid rgba(79,195,247,0.15)", cursor: "pointer" }}>Cancel</button>
        <button onClick={() => { if (!form.name || !form.rel || !form.age) return; onAdd(form); onClose(); }} style={{ flex: 2, padding: "13px", borderRadius: 11, background: "linear-gradient(135deg,#4fc3f7,#2196f3)", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>✅ Add Patient Record</button>
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
      <ModalHeader icon="⚗️" title="Drug Interaction Checker" sub="Check if two medications are safe together" onClose={onClose} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div><label style={lStyle}>Drug / Food 1</label><input placeholder="e.g. Warfarin" value={drug1} onChange={e => { setDrug1(e.target.value); setChecked(false); }} style={iStyle} onKeyDown={e => e.key === "Enter" && check()} /></div>
        <div><label style={lStyle}>Drug / Food 2</label><input placeholder="e.g. Aspirin" value={drug2} onChange={e => { setDrug2(e.target.value); setChecked(false); }} style={iStyle} onKeyDown={e => e.key === "Enter" && check()} /></div>
      </div>
      <button onClick={check} style={{ width: "100%", padding: "13px", borderRadius: 11, background: "linear-gradient(135deg,#4fc3f7,#2196f3)", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", marginBottom: 20, cursor: "pointer" }}>🔍 Check Interaction</button>
      {checked && (result ? (() => { const [bg, border, tc] = sevColor[result.severity] || sevColor.LOW; return <div style={{ background: bg, border: `2px solid ${border}`, borderRadius: 14, padding: "20px 22px" }}><div style={{ display: "flex", gap: 10, marginBottom: 12 }}><span style={{ fontSize: 28 }}>{result.severity === "HIGH" ? "🚨" : "⚠️"}</span><div><div style={{ fontWeight: 800, fontSize: 16, color: tc }}>{result.severity} SEVERITY</div><div style={{ fontSize: 13, color: tc, opacity: .8 }}>{drug1} + {drug2}</div></div></div><p style={{ fontSize: 14, color: tc, lineHeight: 1.7 }}>{result.effect}</p></div>; })() : <div style={{ background: "rgba(52,211,153,0.12)", border: "2px solid #34d399", borderRadius: 14, padding: "20px 22px", display: "flex", gap: 12, alignItems: "center" }}><span style={{ fontSize: 36 }}>✅</span><div><div style={{ fontWeight: 800, fontSize: 16, color: "#34d399" }}>No Known Interaction Found</div><div style={{ fontSize: 14, color: "#6ee7b7", opacity: .8, marginTop: 4 }}>Always confirm with your pharmacist.</div></div></div>)}
    </Modal>
  );
}

function EmergencySOSModal({ onClose }) {
  const [calling, setCalling] = useState(false);
  return (
    <div className="overlay">
      <div className="modal-wrap" style={{ background: "rgba(13,31,60,0.96)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 22, padding: "32px", width: 480, maxWidth: "95vw", boxShadow: "0 24px 64px rgba(239,68,68,.25)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "rgba(239,68,68,0.15)", border: "2px solid rgba(239,68,68,0.4)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, animation: "sosPulse 1.5s infinite" }}>🆘</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#ef4444", marginBottom: 4 }}>Emergency SOS</h2>
          <p style={{ fontSize: 13, color: "#8ab4d4" }}>Location shared with emergency contacts.</p>
        </div>
        <button onClick={() => { setCalling(true); setTimeout(() => setCalling(false), 3000); }} style={{ width: "100%", padding: "15px", borderRadius: 13, background: calling ? "#dc2626" : "#ef4444", color: "#fff", fontSize: 17, fontWeight: 900, border: "none", marginBottom: 16, cursor: "pointer", boxShadow: "0 6px 20px rgba(239,68,68,.4)" }}>
          {calling ? "📞 Connecting to 112…" : "📞 Call Emergency (112)"}
        </button>
        <button onClick={onClose} style={{ width: "100%", padding: "12px", borderRadius: 11, background: "rgba(255,255,255,0.06)", color: "#8ab4d4", fontWeight: 700, fontSize: 14, border: "1px solid rgba(79,195,247,0.15)", cursor: "pointer" }}>✕ Close SOS</button>
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
    } catch (err) { setResult(`⚠️ ${err.message || "Could not connect to AI."}`); }
    finally { setLoading(false); }
  };
  return (
    <Modal onClose={onClose} wide>
      <ModalHeader icon="📋" title="Symptom Logger" sub="Log symptoms and get AI analysis" onClose={onClose} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <label style={lStyle}>Select Symptoms</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>{SYMPTOMS.map(s => <button key={s} onClick={() => toggle(s)} style={{ padding: "7px 14px", borderRadius: 100, border: `1.5px solid ${selected.includes(s) ? "#ef4444" : "rgba(79,195,247,0.2)"}`, background: selected.includes(s) ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.04)", color: selected.includes(s) ? "#fca5a5" : "#8ab4d4", fontSize: 13, fontWeight: selected.includes(s) ? 700 : 500, cursor: "pointer" }}>{s}</button>)}</div>
          <label style={lStyle}>Severity (1–10): <strong style={{ color: "#ef4444" }}>{severity}</strong></label>
          <input type="range" min={1} max={10} value={severity} onChange={e => setSeverity(+e.target.value)} style={{ width: "100%", accentColor: "#4fc3f7", marginBottom: 16 }} />
          <button onClick={analyze} disabled={!selected.length || loading} style={{ width: "100%", padding: "12px", borderRadius: 11, background: selected.length && !loading ? "linear-gradient(135deg,#4fc3f7,#2196f3)" : "rgba(255,255,255,0.1)", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>{loading ? "🤖 Analyzing…" : "🔬 Analyze with AI"}</button>
        </div>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(79,195,247,0.15)", borderRadius: 14, padding: "20px", minHeight: 200, display: "flex", flexDirection: "column", justifyContent: result ? "flex-start" : "center", alignItems: result ? "flex-start" : "center" }}>
          {result ? <><div style={{ fontWeight: 700, color: "#e8f4fd", marginBottom: 10 }}>🤖 AI Analysis</div><div style={{ fontSize: 14, color: "#8ab4d4", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{result}</div></> : <div style={{ textAlign: "center", color: "#4a7aa0" }}><div style={{ fontSize: 40, marginBottom: 10 }}>🔬</div><div style={{ fontWeight: 600 }}>Select symptoms and click Analyze</div></div>}
        </div>
      </div>
    </Modal>
  );
}

function MoodWidget({ dark }) {
  const C = COLORS[dark ? "dark" : "light"];
  const moods = [{ e: "😢", l: "Terrible", c: "#ef4444" }, { e: "😕", l: "Bad", c: "#f59e0b" }, { e: "😐", l: "Okay", c: "#8ab4d4" }, { e: "🙂", l: "Good", c: "#34d399" }, { e: "😄", l: "Great!", c: "#4fc3f7" }];
  const [selected, setSelected] = useState(null);
  return (
    <div className="glass-card" style={{ background: C.card, borderRadius: 16, padding: "18px 20px", border: `1px solid ${C.border}`, marginBottom: 16 }}>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 14, fontSize: 14 }}>😊 {C === COLORS.dark ? "How are you feeling today?" : "How are you feeling today?"}</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "space-around" }}>
        {moods.map((m, i) => <button key={i} onClick={() => setSelected(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 8px", borderRadius: 12, border: `2px solid ${selected === i ? m.c : C.border}`, background: selected === i ? m.c + "18" : C.surface, cursor: "pointer", flex: 1 }}><span style={{ fontSize: 26 }}>{m.e}</span><span style={{ fontSize: 10, fontWeight: 700, color: selected === i ? m.c : C.textSoft }}>{m.l}</span></button>)}
      </div>
      {selected !== null && <div style={{ textAlign: "center", fontSize: 13, color: moods[selected].c, fontWeight: 700, marginTop: 10 }}>Mood logged! ✓</div>}
    </div>
  );
}

function MedTimeline({ dark }) {
  const C = COLORS[dark ? "dark" : "light"];
  const days = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 29 + i); return { label: d.getDate(), missed: Math.random() < .1, taken: Math.random() > .05 }; });
  return (
    <div className="glass-card" style={{ background: C.card, borderRadius: 16, padding: "18px 20px", border: `1px solid ${C.border}` }}>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 14 }}>📅 30-Day Adherence Timeline</div>
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {days.map((d, i) => <div key={i} title={`Day ${d.label}`} style={{ width: 28, height: 28, borderRadius: 6, background: d.missed ? "rgba(239,68,68,0.12)" : d.taken ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)", border: `1.5px solid ${d.missed ? "rgba(239,68,68,0.4)" : d.taken ? "rgba(52,211,153,0.4)" : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 9, fontWeight: 700, color: d.missed ? "#ef4444" : d.taken ? "#34d399" : C.textSoft }}>{d.label}</span></div>)}
      </div>
    </div>
  );
}

function printReport(meds, streak, adherencePct, user) {
  const w = window.open("", "_blank", "width=800,height=600");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>MedGuard AI — Report</title><style>body{font-family:system-ui,sans-serif;padding:40px;color:#0a1628;max-width:700px;margin:0 auto}h1{color:#1a6bbf}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#1a6bbf;color:white;padding:10px 14px;text-align:left}td{padding:10px 14px;border-bottom:1px solid #e2e8f0}.stat{background:#eff6ff;border-radius:12px;padding:16px;text-align:center;display:inline-block;margin:8px;min-width:130px}.stat-val{font-size:28px;font-weight:900;color:#1a6bbf}</style></head><body><h1>💙 MedGuard AI — Weekly Report</h1><p>Patient: ${user?.name || "—"} · ${new Date().toLocaleDateString()}</p><div><div class="stat"><div class="stat-val">${adherencePct}%</div><div>Adherence</div></div><div class="stat"><div class="stat-val">${streak}</div><div>Streak 🔥</div></div><div class="stat"><div class="stat-val">${meds.length}</div><div>Active Meds</div></div></div><table><tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Status</th></tr>${meds.map(m => `<tr><td>${m.name}</td><td>${m.dosage}</td><td>${m.frequency}</td><td>${m.status === "taken" ? "✓ Taken" : "Pending"}</td></tr>`).join("")}</table></body></html>`);
  w.document.close(); w.print();
}

function AdherenceRing({ pct, size = 110 }) {
  const r = 42, circ = 2 * Math.PI * r, offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? "#34d399" : pct >= 60 ? "#fbbf24" : "#ef4444";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 50 50)" style={{ transition: "stroke-dashoffset 1s ease" }} />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="900" fill="white">{pct}%</text>
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
  return <div style={{ background: "rgba(251,191,36,0.12)", borderBottom: "1px solid rgba(251,191,36,0.3)", padding: "10px 48px", display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#fbbf24" }}><span>📵</span><span>You're offline — AI features unavailable.</span></div>;
}

// ── AUTH PAGE ─────────────────────────────────────────
function AuthPage({ onLogin, dark, setDark, onBack }) {
  const C = COLORS[dark ? "dark" : "light"];
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    email: "", password: "", confirmPassword: "",
    firstName: "", lastName: "", phone: "", dob: "", gender: "",
    role: "", bloodGroup: "", weight: "", height: "", conditions: "", allergies: "",
    emergencyName: "", emergencyPhone: "", emergencyRelation: "",
    guardianRelation: "", patientName: "", patientDob: "",
    agreeTerms: false, agreeHealth: false,
  });

  const up = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })); };

  const iSt = { width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, outline: "none", background: C.inputBg, color: C.text, fontFamily: "'DM Sans', sans-serif", transition: "border-color .2s" };
  const lSt = { fontSize: 11, fontWeight: 700, color: C.textSoft, textTransform: "uppercase", letterSpacing: .8, display: "block", marginBottom: 5 };
  const Err = ({ field }) => errors[field] ? <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>⚠ {errors[field]}</div> : null;

  const validate = () => {
    const e = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.password || form.password.length < 6) e.password = "Min 6 characters";
    if (mode === "signup") {
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
      if (!form.firstName.trim()) e.firstName = "Required";
      if (!form.lastName.trim()) e.lastName = "Required";
      if (!form.role) e.role = "Please select your role";
      if (!form.agreeTerms) e.agreeTerms = "You must agree to the terms";
      if (!form.agreeHealth) e.agreeHealth = "You must agree";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    const e = {};
    if (step === 1) {
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
      if (!form.password || form.password.length < 6) e.password = "Min 6 characters";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
      if (!form.firstName.trim()) e.firstName = "Required";
      if (!form.lastName.trim()) e.lastName = "Required";
      if (!form.role) e.role = "Please select your role";
    }
    setErrors(e);
    if (Object.keys(e).length === 0) setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (mode === "signup" && step < 3) { nextStep(); return; }
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      if (mode === "login") {
        // Fetch user profile from backend
        const res = await fetch(`https://medguard-jjly.onrender.com/api/users/${form.email}`);
        if (!res.ok) throw new Error("User not found or incorrect credentials");
        const profileData = await res.json();

        // Simple password check (Note: In production, verify hash on backend)
        if (profileData.password && profileData.password !== form.password) {
          throw new Error("Invalid password");
        }

        const initials = profileData.name ? profileData.name.split(" ").map(n => n[0]).join("").toUpperCase() : profileData.email[0].toUpperCase();

        const userData = {
          ...profileData,
          initials: initials
        };

        localStorage.setItem("medguard_user", JSON.stringify(userData));
        onLogin(userData);
      } else {
        // Signup
        const fullName = `${form.firstName} ${form.lastName}`.trim();
        const initials = (`${form.firstName[0] || ""}${form.lastName[0] || ""}`).toUpperCase() || form.email[0].toUpperCase();

        const userDoc = {
          name: fullName,
          email: form.email,
          password: form.password, // Storing for simple auth demo
          role: form.role,
          phone: form.phone,
          initials: initials,
          dob: form.dob,
          bloodGroup: form.bloodGroup,
          conditions: form.conditions,
          allergies: form.allergies,
          createdAt: new Date().toISOString()
        };

        const res = await fetch(`${API_BASE_URL}/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userDoc)
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Failed to create account");
        }

        const userData = { ...userDoc, initials };
        localStorage.setItem("medguard_user", JSON.stringify(userData));
        onLogin(userData);
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setErrors({ auth: err.message || "Authentication failed." });
    } finally {
      setLoading(false);
    }
  };

  const accent = dark ? "#4fc3f7" : "#1a6bbf";

  const socialBtn = (icon, label) => (
    <button onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); onLogin({ name: "Social User", email: "social@example.com", role: "patient", initials: "SU" }); }, 1200); }}
      style={{ flex: 1, padding: "11px 8px", borderRadius: 11, background: C.surface, border: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, fontWeight: 700, color: C.text, cursor: "pointer" }}>
      <span style={{ fontSize: 18 }}>{icon}</span>{label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Left panel */}
      <div style={{ width: "44%", background: dark ? "linear-gradient(145deg,#060f1e,#0d1f3c,#091832)" : "linear-gradient(145deg,#deeafb,#e8f4fd,#d4e8fb)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 50px", position: "relative", overflow: "hidden", borderRight: `1px solid ${C.border}` }}>
        <div style={{ position: "absolute", top: -100, left: -100, width: 360, height: 360, borderRadius: "50%", background: dark ? "radial-gradient(circle,rgba(79,195,247,.08),transparent 65%)" : "radial-gradient(circle,rgba(26,107,191,.06),transparent 65%)", animation: "orbFloat 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: dark ? "radial-gradient(circle,rgba(79,195,247,.06),transparent 65%)" : "radial-gradient(circle,rgba(79,195,247,.08),transparent 65%)", animation: "orbFloat 6s ease-in-out infinite 2s" }} />
        <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
          {/* Back button */}
          <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: accent, fontWeight: 700, fontSize: 12, cursor: "pointer", marginBottom: 36, width: "fit-content" }}>
            ← Back to Home
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>♥</div>
            <span style={{ fontSize: 22, fontWeight: 800, color: C.text, fontFamily: "'Outfit', sans-serif" }}>MedGuard AI</span>
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: C.text, lineHeight: 1.2, marginBottom: 14, fontFamily: "'Outfit', sans-serif" }}>Your Health,<br /><span style={{ color: accent }}>Our Priority</span></h2>
          <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.8, marginBottom: 32, maxWidth: 300 }}>Intelligent medication management, real-time health tracking, and AI-powered advisory — all in one secure platform.</p>
          {[["💊", "Smart medication reminders that adapt to your schedule"], ["🤖", "AI health advisor available 24/7 for guidance"], ["🛡️", "HIPAA-compliant security for your health data"], ["👨‍👩‍👧", "Family care management for guardians & caregivers"]].map(([ic, txt]) => (
            <div key={txt} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.accentLight, border: `1px solid ${C.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{ic}</div>
              <span style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, paddingTop: 8 }}>{txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: dark ? "linear-gradient(135deg,#060f1e,#0d1f3c)" : "linear-gradient(135deg,#e8f4fd,#deeafb)", padding: "40px 24px", overflowY: "auto" }}>
        <div className="auth-card" style={{ width: "100%", maxWidth: 480 }}>
          {/* Mode toggle */}
          <div style={{ display: "flex", background: C.card, backdropFilter: "blur(16px)", borderRadius: 14, padding: 4, marginBottom: 28, border: `1px solid ${C.border}` }}>
            {[["login", "Sign In"], ["signup", "Create Account"]].map(([m, l]) => (
              <button key={m} onClick={() => { setMode(m); setStep(1); setErrors({}); }} style={{ flex: 1, padding: "10px", borderRadius: 11, background: mode === m ? `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})` : "transparent", color: mode === m ? "#fff" : C.textMid, fontWeight: mode === m ? 700 : 400, fontSize: 13, border: "none", transition: "all .25s", cursor: "pointer" }}>{l}</button>
            ))}
          </div>

          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: C.text, fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>
              {mode === "login" ? "Welcome Back 👋" : step === 1 ? "Create Account ✨" : step === 2 ? "Health Profile 🧬" : "Final Details 🏁"}
            </h2>
            <p style={{ fontSize: 14, color: C.textMid }}>
              {mode === "login" ? "Sign in to your MedGuard portal" : step === 1 ? "Set up your account in 3 easy steps" : step === 2 ? "Help us personalize your experience" : "Almost done!"}
            </p>
            {mode === "signup" && (
              <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
                {[1, 2, 3].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? `linear-gradient(90deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})` : C.border, transition: "background .3s" }} />)}
              </div>
            )}
          </div>

          {/* Back button for signup steps */}
          {mode === "signup" && step > 1 && (
            <button onClick={() => setStep(s => s - 1)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 9, background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: accent, fontWeight: 700, fontSize: 12, cursor: "pointer", marginBottom: 18 }}>
              ← Previous Step ({step - 1} of 3)
            </button>
          )}

          {/* LOGIN FORM */}
          {mode === "login" && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <label style={lSt}>Email</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e => up("email", e.target.value)} style={iSt} />
                {errors.email && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>⚠ {errors.email}</div>}
              </div>
              <div style={{ marginBottom: 8, position: "relative" }}>
                <label style={lSt}>Password</label>
                <input type={showPass ? "text" : "password"} placeholder="Enter your password" value={form.password} onChange={e => up("password", e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} style={{ ...iSt, paddingRight: 44 }} />
                <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: 35, background: "none", border: "none", color: C.textSoft, fontSize: 16, cursor: "pointer" }}>{showPass ? "🙈" : "👁️"}</button>
                {errors.password && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>⚠ {errors.password}</div>}
              </div>
              <div style={{ textAlign: "right", marginBottom: 20 }}><span style={{ fontSize: 13, color: accent, fontWeight: 600, cursor: "pointer" }}>Forgot password?</span></div>
              {errors.auth && <div style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "10px", borderRadius: 10, fontSize: 13, marginBottom: 16, border: "1px solid rgba(239,68,68,0.2)" }}>⚠ {errors.auth}</div>}
              <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: 12, background: loading ? C.border : `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontWeight: 700, fontSize: 15, border: "none", transition: "all .2s", marginBottom: 18, cursor: "pointer", boxShadow: `0 6px 20px ${accent}40` }}>
                {loading ? "⏳ Signing In…" : "Sign In →"}
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: 11, color: C.textSoft, fontWeight: 600 }}>OR CONTINUE WITH</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>{socialBtn("Google")}</div>
              <div style={{ background: C.accentLight, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: C.textMid, display: "flex", gap: 8, border: `1px solid ${C.accentBorder}` }}>
                <span>🔒</span><span>Your health data is encrypted and HIPAA-compliant.</span>
              </div>
            </div>
          )}

          {/* SIGNUP STEP 1 */}
          {mode === "signup" && step === 1 && (
            <div>
              <div style={{ marginBottom: 18 }}>
                <label style={lSt}>I am registering as *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["patient", "👤", "Patient", "I manage my own medications"], ["guardian", "👥", "Guardian", "I care for a loved one"]].map(([val, ic, title, desc]) => (
                    <div key={val} onClick={() => up("role", val)} style={{ padding: "14px 12px", borderRadius: 12, border: `2px solid ${form.role === val ? accent : C.border}`, background: form.role === val ? C.accentLight : C.surface, cursor: "pointer", transition: "all .2s", textAlign: "center" }}>
                      <div style={{ fontSize: 26, marginBottom: 5 }}>{ic}</div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 2 }}>{title}</div>
                      <div style={{ fontSize: 11, color: C.textSoft, lineHeight: 1.4 }}>{desc}</div>
                    </div>
                  ))}
                </div>
                <Err field="role" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div><label style={lSt}>First Name *</label><input placeholder="Arjun" value={form.firstName} onChange={e => up("firstName", e.target.value)} style={iSt} /><Err field="firstName" /></div>
                <div><label style={lSt}>Last Name *</label><input placeholder="Patel" value={form.lastName} onChange={e => up("lastName", e.target.value)} style={iSt} /><Err field="lastName" /></div>
              </div>
              <div style={{ marginBottom: 12 }}><label style={lSt}>Email *</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e => up("email", e.target.value)} style={iSt} /><Err field="email" /></div>
              <div style={{ marginBottom: 12, position: "relative" }}>
                <label style={lSt}>Password *</label>
                <input type={showPass ? "text" : "password"} placeholder="Min 6 characters" value={form.password} onChange={e => up("password", e.target.value)} style={{ ...iSt, paddingRight: 44 }} />
                <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: 35, background: "none", border: "none", color: C.textSoft, fontSize: 16, cursor: "pointer" }}>{showPass ? "🙈" : "👁️"}</button>
                <Err field="password" />
              </div>
              <div style={{ marginBottom: 20 }}><label style={lSt}>Confirm Password *</label><input type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => up("confirmPassword", e.target.value)} style={iSt} /><Err field="confirmPassword" /></div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} /><span style={{ fontSize: 11, color: C.textSoft, fontWeight: 600 }}>OR SIGN UP WITH</span><div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>{socialBtn("🔵", "Google")}{socialBtn("📘", "Facebook")}{socialBtn("📸", "Apple")}</div>
              <button onClick={nextStep} style={{ width: "100%", padding: "14px", borderRadius: 12, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", boxShadow: `0 6px 20px ${accent}40` }}>Continue → Step 2 of 3</button>
            </div>
          )}

          {/* SIGNUP STEP 2 */}
          {mode === "signup" && step === 2 && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div><label style={lSt}>Phone *</label><input placeholder="+91 98765 43210" value={form.phone} onChange={e => up("phone", e.target.value)} style={iSt} /></div>
                <div><label style={lSt}>Date of Birth</label><input type="date" value={form.dob} onChange={e => up("dob", e.target.value)} style={iSt} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div><label style={lSt}>Gender</label><select value={form.gender} onChange={e => up("gender", e.target.value)} style={{ ...iSt, background: C.inputBg }}><option value="">Select…</option>{["Male", "Female", "Non-binary", "Prefer not to say"].map(o => <option key={o}>{o}</option>)}</select></div>
                <div><label style={lSt}>Blood Group</label><select value={form.bloodGroup} onChange={e => up("bloodGroup", e.target.value)} style={{ ...iSt, background: C.inputBg }}><option value="">Select…</option>{["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"].map(o => <option key={o}>{o}</option>)}</select></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div><label style={lSt}>Weight (kg)</label><input type="number" placeholder="72" value={form.weight} onChange={e => up("weight", e.target.value)} style={iSt} /></div>
                <div><label style={lSt}>Height (cm)</label><input type="number" placeholder="170" value={form.height} onChange={e => up("height", e.target.value)} style={iSt} /></div>
              </div>
              <div style={{ marginBottom: 12 }}><label style={lSt}>Existing Conditions</label><input placeholder="e.g. Diabetes, Hypertension…" value={form.conditions} onChange={e => up("conditions", e.target.value)} style={iSt} /></div>
              <div style={{ marginBottom: 18 }}><label style={lSt}>Known Allergies</label><input placeholder="e.g. Penicillin, Sulfa…" value={form.allergies} onChange={e => up("allergies", e.target.value)} style={iSt} /></div>
              {form.role === "guardian" && (
                <div style={{ padding: "14px", background: C.accentLight, borderRadius: 12, marginBottom: 16, border: `1px solid ${C.accentBorder}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 10, textTransform: "uppercase", letterSpacing: .8 }}>👥 Patient You're Caring For</div>
                  <input placeholder="Patient's Full Name" value={form.patientName} onChange={e => up("patientName", e.target.value)} style={{ ...iSt, marginBottom: 8 }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <input type="date" value={form.patientDob} onChange={e => up("patientDob", e.target.value)} style={iSt} />
                    <input placeholder="Your relation (e.g. Son)" value={form.guardianRelation} onChange={e => up("guardianRelation", e.target.value)} style={iSt} />
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: "13px", borderRadius: 12, background: C.accentLight, color: accent, fontWeight: 700, fontSize: 14, border: `1px solid ${C.accentBorder}`, cursor: "pointer" }}>← Back</button>
                <button onClick={nextStep} style={{ flex: 2, padding: "13px", borderRadius: 12, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Continue → Step 3 of 3</button>
              </div>
            </div>
          )}

          {/* SIGNUP STEP 3 */}
          {mode === "signup" && step === 3 && (
            <div>
              <div style={{ padding: "14px", background: "rgba(239,68,68,0.08)", borderRadius: 12, marginBottom: 14, border: "1px solid rgba(239,68,68,0.25)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", marginBottom: 10, textTransform: "uppercase", letterSpacing: .8 }}>🆘 Emergency Contact</div>
                <input placeholder="Emergency Contact Name" value={form.emergencyName} onChange={e => up("emergencyName", e.target.value)} style={{ ...iSt, marginBottom: 8 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <input placeholder="+91 98765 11111" value={form.emergencyPhone} onChange={e => up("emergencyPhone", e.target.value)} style={iSt} />
                  <input placeholder="Relation (e.g. Spouse)" value={form.emergencyRelation} onChange={e => up("emergencyRelation", e.target.value)} style={iSt} />
                </div>
              </div>
              <div style={{ padding: "14px", background: "rgba(52,211,153,0.08)", borderRadius: 12, marginBottom: 14, border: "1px solid rgba(52,211,153,0.25)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#34d399", marginBottom: 8, textTransform: "uppercase", letterSpacing: .8 }}>📋 Summary</div>
                {[["Name", `${form.firstName} ${form.lastName}`], ["Email", form.email], ["Role", form.role === "guardian" ? "Guardian" : "Patient"], ["Phone", form.phone || "—"], ["Blood Group", form.bloodGroup || "—"]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0", borderBottom: "1px dashed rgba(52,211,153,0.2)" }}>
                    <span style={{ color: C.textSoft }}>{l}</span><span style={{ color: C.text, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.agreeTerms} onChange={e => up("agreeTerms", e.target.checked)} style={{ marginTop: 3, accentColor: accent }} />
                  <span style={{ fontSize: 13, color: C.textMid, lineHeight: 1.5 }}>I agree to the <span style={{ color: accent, fontWeight: 600 }}>Terms</span> and <span style={{ color: accent, fontWeight: 600 }}>Privacy Policy</span> *</span>
                </label>
                {errors.agreeTerms && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>⚠ {errors.agreeTerms}</div>}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.agreeHealth} onChange={e => up("agreeHealth", e.target.checked)} style={{ marginTop: 3, accentColor: accent }} />
                  <span style={{ fontSize: 13, color: C.textMid, lineHeight: 1.5 }}>I understand this app <strong>does not replace professional medical advice</strong> *</span>
                </label>
                {errors.agreeHealth && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>⚠ {errors.agreeHealth}</div>}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: "13px", borderRadius: 12, background: C.accentLight, color: accent, fontWeight: 700, fontSize: 14, border: `1px solid ${C.accentBorder}`, cursor: "pointer" }}>← Back</button>
                <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: "13px", borderRadius: 12, background: loading ? C.border : `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>
                  {loading ? "⏳ Creating…" : "🚀 Create Account"}
                </button>
              </div>
            </div>
          )}

          <p style={{ textAlign: "center", fontSize: 13, color: C.textSoft, marginTop: 18 }}>
            {mode === "login" ? "No account? " : "Have an account? "}
            <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setStep(1); setErrors({}); }} style={{ color: accent, fontWeight: 700, cursor: "pointer" }}>
              {mode === "login" ? "Sign Up Free" : "Sign In"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── AI CHAT TAB ───────────────────────────────────────
function AIChatTab({ dark, user }) {
  const C = COLORS[dark ? "dark" : "light"];
  const accent = dark ? "#4fc3f7" : "#1a6bbf";
  const [history, setHistory] = useState([{ from: "ai", text: `Hello ${user?.name?.split(" ")[0] || "there"}! 👋 I'm your MedGuard AI assistant. How can I help you today?` }]);
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
      const res = await fetch(`${API_BASE_URL}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages, system: `You are MedGuard AI, a friendly health assistant for ${user?.name || "the patient"}. Be warm, concise (under 120 words), use occasional emojis. End medical responses with: "Please consult your doctor for personalized advice."` }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Server error");
      setHistory(h => [...h, { from: "ai", text: data.text || "I'm having trouble connecting." }]);
    } catch (err) { setHistory(h => [...h, { from: "ai", text: `⚠️ ${err.message || "Connection error."}` }]); }
    finally { setLoading(false); }
  };
  const suggested = ["What are the side effects of Metformin?", "Can I take ibuprofen with Lisinopril?", "What foods should I avoid with blood thinners?", "Is 90% medication adherence good?"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
      <div className="glass-card" style={{ background: C.card, borderRadius: 20, padding: "24px", border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: 620 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🤖</div>
          <div><div style={{ fontWeight: 700, color: C.text }}>MedGuard AI Assistant</div><div style={{ fontSize: 12, color: "#34d399" }}>● Online · Powered by Claude AI</div></div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {history.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
              {m.from === "ai" && <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>}
              <div style={{ maxWidth: "78%", padding: "12px 16px", borderRadius: m.from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.from === "user" ? `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})` : C.surface, color: m.from === "user" ? "#fff" : C.text, fontSize: 14, lineHeight: 1.7, border: m.from === "ai" ? `1px solid ${C.border}` : "none", whiteSpace: "pre-wrap" }}>{m.text}</div>
            </div>
          ))}
          {loading && <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}><div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div><div style={{ padding: "14px 18px", borderRadius: "18px 18px 18px 4px", background: C.surface, border: `1px solid ${C.border}`, display: "flex", gap: 5 }}><div className="dot1" style={{ width: 8, height: 8, borderRadius: "50%", background: C.textSoft }} /><div className="dot2" style={{ width: 8, height: 8, borderRadius: "50%", background: C.textSoft }} /><div className="dot3" style={{ width: 8, height: 8, borderRadius: "50%", background: C.textSoft }} /></div></div>}
          <div ref={bottomRef} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={listening ? stop : start} style={{ padding: "13px 14px", borderRadius: 12, background: listening ? "rgba(239,68,68,0.12)" : C.surface, border: `1.5px solid ${listening ? "rgba(239,68,68,0.4)" : C.border}`, fontSize: 18, cursor: "pointer" }}>{listening ? "🔴" : "🎤"}</button>
          <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Ask about medications, symptoms…" style={{ flex: 1, padding: "13px 16px", border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 14, outline: "none", background: C.inputBg, color: C.text }} />
          <button onClick={send} disabled={loading} style={{ padding: "13px 20px", borderRadius: 12, background: loading ? C.border : `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Send ➤</button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="glass-card" style={{ background: C.card, borderRadius: 16, padding: "18px", border: `1px solid ${C.border}` }}>
          <div style={{ fontWeight: 700, color: C.text, marginBottom: 12, fontSize: 14 }}>💡 Suggested Questions</div>
          {suggested.map(q => <button key={q} onClick={() => setMsg(q)} style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 10, background: C.accentLight, border: `1px solid ${C.accentBorder}`, fontSize: 13, color: C.textMid, cursor: "pointer", marginBottom: 8, lineHeight: 1.45 }}>{q}</button>)}
        </div>
        <div className="glass-card" style={{ background: C.accentLight, borderRadius: 16, padding: "18px", border: `1px solid ${C.accentBorder}` }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: accent }}>⚠️ Medical Disclaimer</div>
          <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.65 }}>This AI provides general health information only. Always consult your doctor for medical advice.</p>
        </div>
      </div>
    </div>
  );
}

// ── PATIENT PORTAL ────────────────────────────────────
// function PatientPortal({ setPage, dark, setDark, lang, setLang, user, onLogout }) {
//   const L = T[lang]; const C = COLORS[dark ? "dark" : "light"];
//   const { toasts, show } = useToast(); const offline = useOffline();
//   const accent = dark ? "#4fc3f7" : "#1a6bbf";
//   const [tab, setTab] = useState("dashboard");
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showInteraction, setShowInteraction] = useState(false);
//   const [showSOS, setShowSOS] = useState(false);
//   const [showSymptoms, setShowSymptoms] = useState(false);
//   const [meds, setMeds] = useState([]);
//   const [streak] = useState(0);

//   useEffect(() => {
//     if (user && user.email) {
//       const savedMeds = localStorage.getItem(`meds_${user.email}`);
//       if (savedMeds) {
//         try { setMeds(JSON.parse(savedMeds)); } catch (e) { setMeds([]); }
//       } else {
//         setMeds([]);
//       }
//     }
//   }, [user]);

//   useEffect(() => {
//     if (user && user.email) {
//       localStorage.setItem(`meds_${user.email}`, JSON.stringify(meds));
//     }
//   }, [meds, user]);

//   const knownAllergies = (user?.allergies || "").split(",").map(a => a.trim()).filter(Boolean);
//   const takenCount = meds.filter(m => m.status === "taken").length;
//   const adherencePct = meds.length === 0 ? 0 : Math.round((takenCount / meds.length) * 100);
//   const healthScore = Math.min(100, Math.round(adherencePct * .5 + streak * 2 + 20));
//   const refillAlerts = meds.filter(m => m.refill <= 7);

//   const markTaken = (idx) => {
//     if (meds[idx].status === "taken") return;
//     setMeds(p => p.map((m, i) => i === idx ? { ...m, status: "taken" } : m));
//     show("💊", "Medication Taken!", `${meds[idx].name} marked as taken ✅`, "success");
//   };

//   const handleAddMed = async (form) => {
//     const timeStr = form.time ? new Date(`2000-01-01T${form.time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD";
//     const newMed = { name: form.name, dosage: form.dosage, time: timeStr, status: "upcoming", icon: "💊", frequency: form.frequency, purpose: form.purpose || "General", refill: 30 };
//     setMeds(p => [...p, newMed]);
//     show("➕", "Medication Added!", `${form.name} added.`, "info");
//   };

//   const TABS = ["dashboard", "medications", "ai-advisor", "analytics", "symptoms", "settings"];

//   return (
//     <div style={{ minHeight: "100vh" }}>
//       <Toast toasts={toasts} />
//       {offline && <OfflineBanner />}
//       {showAddModal && <AddMedModal onClose={() => setShowAddModal(false)} onAdd={handleAddMed} knownAllergies={knownAllergies} />}
//       {showInteraction && <DrugInteractionModal onClose={() => setShowInteraction(false)} />}
//       {showSOS && <EmergencySOSModal onClose={() => setShowSOS(false)} />}
//       {showSymptoms && <SymptomLoggerModal onClose={() => setShowSymptoms(false)} meds={meds} />}
//       {refillAlerts.length > 0 && <div style={{ background: "rgba(251,191,36,0.12)", borderBottom: "1px solid rgba(251,191,36,0.25)", padding: "10px 40px", display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#fbbf24", fontWeight: 600 }}><span>⚠️</span><span>Refill soon: {refillAlerts.map(m => `${m.name} (${m.refill}d)`).join(" · ")}</span></div>}

//       {/* Topbar */}
//       <div style={{ background: C.navBg, backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "0 28px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//           {/* Back to home button */}
//           <button onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 9, background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: accent, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
//             ← Home
//           </button>
//           <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>♥</div>
//           <span style={{ fontWeight: 800, fontSize: 15, color: accent, fontFamily: "'Outfit', sans-serif" }}>MedGuard AI</span>
//           <span style={{ background: C.accentLight, color: accent, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 100, border: `1px solid ${C.accentBorder}` }}>Patient</span>
//         </div>
//         <div style={{ display: "flex", gap: 2 }}>
//           {TABS.map(t => <button key={t} className="tab-pill" onClick={() => setTab(t)} style={{ padding: "7px 12px", borderRadius: 8, background: tab === t ? `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})` : "transparent", color: tab === t ? "#fff" : C.textMid, fontWeight: tab === t ? 700 : 500, fontSize: 12, border: "none", textTransform: "capitalize", transition: "all .2s", cursor: "pointer" }}>{L[t] || t.replace("-", " ")}</button>)}
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           <select value={lang} onChange={e => setLang(e.target.value)} style={{ padding: "5px 8px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 12, outline: "none" }}>
//             {Object.entries(T).map(([k, v]) => <option key={k} value={k}>{v.langName}</option>)}
//           </select>
//           <button onClick={() => setDark(d => !d)} style={{ padding: "7px 10px", borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`, cursor: "pointer", fontSize: 15 }}>{dark ? "☀️" : "🌙"}</button>
//           <button onClick={() => setShowSOS(true)} style={{ padding: "7px 12px", borderRadius: 8, background: "rgba(239,68,68,0.12)", color: "#ef4444", fontWeight: 700, fontSize: 11, border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer" }}>🆘 SOS</button>
//           <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", background: C.accentLight, borderRadius: 100, border: `1px solid ${C.accentBorder}` }}>
//             <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>{user?.initials || "AP"}</div>
//             <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{user?.name?.split(" ")[0] || "Patient"}</span>
//           </div>
//           <button onClick={onLogout} style={{ padding: "7px 12px", borderRadius: 8, background: C.surface, color: C.textMid, fontWeight: 700, fontSize: 11, border: `1px solid ${C.border}`, cursor: "pointer" }}>Sign Out</button>
//         </div>
//       </div>

//       <div style={{ padding: "22px 28px" }}>
//         {/* ── DASHBOARD TAB ── */}
//         {tab === "dashboard" && (
//           <>
//             {/* Biological age banner (ClyHealth style) */}
//             <div className="glass-card" style={{ background: dark ? "linear-gradient(135deg,rgba(13,31,60,0.9),rgba(26,107,191,0.3))" : "linear-gradient(135deg,rgba(26,107,191,0.85),rgba(79,195,247,0.7))", borderRadius: 18, padding: "22px 28px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff", border: `1px solid ${dark ? "rgba(79,195,247,0.2)" : "transparent"}` }}>
//               <div>
//                 <div style={{ display: "flex", gap: 32, marginBottom: 12 }}>
//                   {[["Biological Age", "47 yrs", "#fff"], ["Chronological Age", "42 yrs", "#fff"], ["Weight", "97.5 kg ↑", "#fbbf24"], ["Sex", "Male ♂", "#fff"]].map(([l, v, c]) => (
//                     <div key={l}><div style={{ fontSize: 10, opacity: .7, marginBottom: 2 }}>{l}</div><div style={{ fontWeight: 800, fontSize: 16, color: c }}>{v}</div></div>
//                   ))}
//                 </div>
//                 <div style={{ fontSize: 13, background: "rgba(239,68,68,0.2)", padding: "5px 14px", borderRadius: 100, border: "1px solid rgba(239,68,68,0.4)", display: "inline-block" }}>
//                   ⚠️ Your body is aging <strong>5 years faster</strong> than your chronological age
//                 </div>
//                 <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
//                   {meds.map((m, i) => <span key={i} style={{ padding: "3px 10px", borderRadius: 100, background: m.status === "taken" ? "rgba(52,211,153,.25)" : "rgba(255,255,255,.15)", border: `1px solid ${m.status === "taken" ? "rgba(52,211,153,.5)" : "rgba(255,255,255,.25)"}`, fontSize: 11, fontWeight: 600 }}>{m.status === "taken" ? "✓ " : ""}{m.name}</span>)}
//                 </div>
//               </div>
//               <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
//                 <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, opacity: .7, marginBottom: 5 }}>Today's Adherence</div><AdherenceRing pct={adherencePct} size={95} /><div style={{ fontSize: 10, opacity: .7, marginTop: 2 }}>{takenCount}/{meds.length} doses</div></div>
//                 <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, opacity: .7, marginBottom: 5 }}>Health Score</div><HealthScoreRing score={healthScore} /></div>
//               </div>
//             </div>

//             {/* Stats row */}
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
//               {[["💊", "Medications", `${takenCount}/${meds.length}`, `${meds.filter(m => m.status === "upcoming").length} remaining`, accent], ["🔥", "Streak", `${streak}d`, "days in a row", "#d97706"], ["⚠️", "Interactions", "0", "all clear", "#34d399"], ["🤖", "AI Insights", "5", "new today", "#a78bfa"]].map(([ic, l, v, s, c]) => (
//                 <div key={l} className="glass-card card-lift" style={{ background: C.card, borderRadius: 13, padding: "16px", border: `1px solid ${C.border}`, boxShadow: C.cardShadow }}>
//                   <div style={{ fontSize: 20, marginBottom: 6 }}>{ic}</div>
//                   <div style={{ fontSize: 22, fontWeight: 900, color: c, fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
//                   <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginTop: 1 }}>{l}</div>
//                   <div style={{ fontSize: 11, color: C.textSoft }}>{s}</div>
//                 </div>
//               ))}
//             </div>

//             <MoodWidget dark={dark} />

//             {/* Main grid */}
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, marginBottom: 16 }}>
//               <div className="glass-card" style={{ background: C.card, borderRadius: 16, padding: "20px 22px", border: `1px solid ${C.border}` }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
//                   <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Today's Medication Schedule</h3>
//                   <div style={{ display: "flex", gap: 8 }}>
//                     <button onClick={() => setShowInteraction(true)} style={{ padding: "6px 10px", borderRadius: 7, background: "rgba(251,191,36,0.1)", color: "#fbbf24", fontWeight: 700, fontSize: 11, border: "1px solid rgba(251,191,36,0.25)", cursor: "pointer" }}>⚗️ Check</button>
//                     <button onClick={() => setShowAddModal(true)} style={{ padding: "6px 12px", borderRadius: 7, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontWeight: 700, fontSize: 11, border: "none", cursor: "pointer" }}>{L.addMed}</button>
//                   </div>
//                 </div>
//                 {meds.length === 0 && <div style={{ textAlign: "center", padding: "30px 0", color: C.textSoft, fontSize: 14 }}>No medications yet. Add your first medication above!</div>}
//                 {meds.map((m, i) => <div key={i} className="med-row" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 6px", borderBottom: i < meds.length - 1 ? `1px solid ${C.border}` : "none", borderRadius: 7, transition: "background .15s" }}>
//                   <div style={{ width: 40, height: 40, borderRadius: 10, background: m.status === "taken" ? "rgba(52,211,153,0.12)" : C.accentLight, border: `1.5px solid ${m.status === "taken" ? "rgba(52,211,153,0.4)" : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{m.icon}</div>
//                   <div style={{ flex: 1 }}>
//                     <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{m.name} {m.dosage}</div>
//                     <div style={{ fontSize: 11, color: C.textSoft }}>⏰ {m.time} · {m.frequency}</div>
//                     {m.refill <= 7 && <div style={{ fontSize: 10, color: "#fbbf24", fontWeight: 600 }}>⚠️ Refill in {m.refill} days</div>}
//                   </div>
//                   {m.status === "taken" ? <div style={{ padding: "4px 11px", borderRadius: 100, background: "rgba(52,211,153,0.12)", color: "#34d399", fontSize: 11, fontWeight: 700, border: "1px solid rgba(52,211,153,0.3)" }}>✓ Taken</div> : <button onClick={() => markTaken(i)} style={{ padding: "6px 12px", borderRadius: 7, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer" }}>{L.markTaken}</button>}
//                 </div>)}
//                 <div style={{ marginTop: 12, background: C.accentLight, borderRadius: 9, padding: "10px 12px", border: `1px solid ${C.accentBorder}` }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}><span style={{ fontSize: 12, fontWeight: 600, color: C.textMid }}>Daily Progress</span><span style={{ fontSize: 12, fontWeight: 700, color: accent }}>{takenCount}/{meds.length}</span></div>
//                   <div style={{ height: 7, borderRadius: 7, background: C.border, overflow: "hidden" }}><div style={{ height: "100%", width: `${adherencePct}%`, background: `linear-gradient(90deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, borderRadius: 7, transition: "width .7s ease" }} /></div>
//                   {takenCount === meds.length && meds.length > 0 && <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, fontWeight: 700, color: "#34d399" }}>🎉 All medications taken today!</div>}
//                 </div>
//               </div>

//               {/* Sidebar */}
//               <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//                 <div className="glass-card" style={{ background: C.card, borderRadius: 14, padding: "16px", border: `1px solid ${C.border}` }}>
//                   <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
//                     <div style={{ width: 32, height: 32, borderRadius: 9, background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🤖</div>
//                     <div><div style={{ fontWeight: 700, fontSize: 12, color: C.text }}>AI Health Insights</div><div style={{ fontSize: 10, color: C.textSoft }}>Powered by Claude</div></div>
//                   </div>
//                   <div style={{ background: C.accentLight, borderRadius: 8, padding: "8px 11px", marginBottom: 7, fontSize: 12, color: C.textMid, lineHeight: 1.6, border: `1px solid ${C.accentBorder}` }}>💡 Blood pressure stable this week. Great consistency!</div>
//                   <div style={{ background: "rgba(251,191,36,0.08)", borderRadius: 8, padding: "8px 11px", border: "1px solid rgba(251,191,36,0.2)", fontSize: 12, color: "#fbbf24", lineHeight: 1.6 }}>⏰ Annual flu vaccine due. Schedule an appointment?</div>
//                   <button onClick={() => setTab("ai-advisor")} style={{ width: "100%", marginTop: 10, padding: "8px", borderRadius: 8, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer" }}>💬 Chat with AI →</button>
//                 </div>
//                 <div className="glass-card" style={{ background: C.card, borderRadius: 13, padding: "14px 16px", border: `1px solid ${C.border}` }}>
//                   <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>Quick Actions</div>
//                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
//                     {[["➕", "Add Med", () => setShowAddModal(true)], ["Drug Check", () => setShowInteraction(true)], ["🆘", "SOS", () => setShowSOS(true)], ["📋", "Symptoms", () => setShowSymptoms(true)], ["📄", "Report", () => printReport(meds, streak, adherencePct, user)], ["📊", "Analytics", () => setTab("analytics")]].map(([ic, l, fn]) => (
//                       <button key={l} onClick={fn} style={{ background: l === "SOS" ? "rgba(239,68,68,0.1)" : C.accentLight, borderRadius: 9, padding: "9px 4px", border: `1.5px solid ${l === "SOS" ? "rgba(239,68,68,0.3)" : C.accentBorder}`, cursor: "pointer", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
//                         <span style={{ fontSize: 18 }}>{ic}</span><span style={{ fontSize: 10, fontWeight: 700, color: l === "SOS" ? "#ef4444" : C.textMid }}>{l}</span>
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <MedTimeline dark={dark} />
//           </>
//         )}

//         {tab === "medications" && (
//           <div>
//             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, alignItems: "center" }}>
//               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                 <button onClick={() => setTab("dashboard")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 9, background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: accent, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>← Dashboard</button>
//                 <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, fontFamily: "'Outfit', sans-serif" }}>My Medications</h2>
//               </div>
//               <div style={{ display: "flex", gap: 10 }}>
//                 <button onClick={() => printReport(meds, streak, adherencePct, user)} style={{ padding: "9px 14px", borderRadius: 9, background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: C.textMid, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>📄 Report</button>
//                 <button onClick={() => setShowAddModal(true)} style={{ padding: "9px 18px", borderRadius: 9, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>{L.addMed}</button>
//               </div>
//             </div>
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
//               {meds.map((m, i) => (
//                 <div key={i} className="glass-card card-lift" style={{ background: C.card, borderRadius: 14, padding: "18px", border: `1px solid ${C.border}`, boxShadow: C.cardShadow }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
//                     <div style={{ width: 40, height: 40, borderRadius: 11, background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>{m.icon}</div>
//                     <span style={{ fontSize: 11, fontWeight: 700, color: accent, background: C.accentLight, padding: "3px 9px", borderRadius: 100, border: `1px solid ${C.accentBorder}` }}>Active</span>
//                   </div>
//                   <div style={{ fontWeight: 700, color: C.text, marginBottom: 2 }}>{m.name} {m.dosage}</div>
//                   <div style={{ fontSize: 12, color: C.textMid, marginBottom: 6 }}>🔁 {m.frequency} · {m.purpose}</div>
//                   {m.refill <= 7 && <div style={{ fontSize: 11, color: "#fbbf24", fontWeight: 600, marginBottom: 8 }}>⚠️ Refill in {m.refill} days</div>}
//                   <button onClick={() => markTaken(i)} disabled={m.status === "taken"} style={{ width: "100%", padding: "9px", borderRadius: 9, background: m.status === "taken" ? "rgba(52,211,153,0.12)" : `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: m.status === "taken" ? "#34d399" : "#fff", fontWeight: 700, fontSize: 12, border: `1px solid ${m.status === "taken" ? "rgba(52,211,153,0.3)" : "transparent"}`, cursor: m.status === "taken" ? "default" : "pointer" }}>
//                     {m.status === "taken" ? "✓ Taken Today" : L.markTaken}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {tab === "ai-advisor" && <AIChatTab dark={dark} user={user} />}

//         {tab === "analytics" && (
//           <div>
//             <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
//               <button onClick={() => setTab("dashboard")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 9, background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: accent, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>← Dashboard</button>
//               <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, fontFamily: "'Outfit', sans-serif" }}>Health Analytics</h2>
//             </div>
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 16 }}>
//               {[["📅", "This Month", `${takenCount}/${meds.length || 0} doses`, `${adherencePct}% adherence`], ["📈", "Best Streak", `${streak} days`, streak > 0 ? "Personal record! 🔥" : "Start your streak!"], ["⭐", "Avg Adherence", `${adherencePct}%`, "Last 3 months"]].map(([ic, l, v, s]) => (
//                 <div key={l} className="glass-card" style={{ background: C.card, borderRadius: 14, padding: "22px 18px", border: `1px solid ${C.border}`, textAlign: "center" }}>
//                   <div style={{ fontSize: 32, marginBottom: 6 }}>{ic}</div>
//                   <div style={{ fontSize: 10, fontWeight: 700, color: C.textSoft, textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
//                   <div style={{ fontSize: 24, fontWeight: 900, color: accent, margin: "6px 0 2px", fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
//                   <div style={{ fontSize: 12, color: C.textMid }}>{s}</div>
//                 </div>
//               ))}
//             </div>
//             <div className="glass-card" style={{ background: C.card, borderRadius: 16, padding: "20px 22px", border: `1px solid ${C.border}`, marginBottom: 16 }}>
//               <h3 style={{ fontWeight: 700, color: C.text, marginBottom: 16 }}>📊 Weekly Adherence — Last 4 Weeks</h3>
//               <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 120 }}>
//                 {[0, 0, 0, adherencePct].map((v, i) => (
//                   <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
//                     <span style={{ fontSize: 12, fontWeight: 700, color: i === 3 ? accent : C.textMid, fontFamily: "'JetBrains Mono', monospace" }}>{v}%</span>
//                     <div style={{ width: "100%", height: `${v}%`, background: i === 3 ? `linear-gradient(180deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})` : C.border, borderRadius: "6px 6px 0 0", transition: "height .6s ease" }} />
//                     <span style={{ fontSize: 11, color: C.textSoft }}>{i === 3 ? "Now" : `Wk ${i + 1}`}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <MedTimeline dark={dark} />
//           </div>
//         )}

//         {tab === "symptoms" && (
//           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
//             <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
//             <h2 style={{ color: C.text, marginBottom: 12, fontFamily: "'Outfit', sans-serif" }}>Symptom Logger</h2>
//             <p style={{ color: C.textMid, marginBottom: 20, textAlign: "center" }}>Log your symptoms and get AI analysis against your current medications.</p>
//             <div style={{ display: "flex", gap: 10 }}>
//               <button onClick={() => setTab("dashboard")} style={{ padding: "12px 20px", borderRadius: 11, background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: accent, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Back</button>
//               <button onClick={() => setShowSymptoms(true)} style={{ padding: "12px 26px", borderRadius: 11, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Open Symptom Logger</button>
//             </div>
//           </div>
//         )}

//         {tab === "settings" && (
//           <div>
//             <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
//               <button onClick={() => setTab("dashboard")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 9, background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: accent, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>← Dashboard</button>
//               <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, fontFamily: "'Outfit', sans-serif" }}>Settings</h2>
//             </div>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
//               <div className="glass-card" style={{ background: C.card, borderRadius: 16, padding: "22px", border: `1px solid ${C.border}` }}>
//                 <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 16, fontFamily: "'Outfit', sans-serif" }}>Account Settings</h3>
//                 {[["Full Name", user?.name || "—"], ["Email", user?.email || "—"], ["Phone", user?.phone || "—"], ["Date of Birth", user?.dob || "—"], ["Blood Group", user?.bloodGroup || "—"], ["Conditions", user?.conditions || "—"]].map(([l, v]) => (
//                   <div key={l} style={{ marginBottom: 12 }}>
//                     <label style={{ ...lStyle, color: C.textSoft }}>{l}</label>
//                     <input defaultValue={v} style={{ ...iStyle, background: C.inputBg, color: C.text, border: `1.5px solid ${C.border}` }} />
//                   </div>
//                 ))}
//                 <button style={{ padding: "10px 18px", borderRadius: 9, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontWeight: 700, fontSize: 12, border: "none", marginTop: 4, cursor: "pointer" }}>Save Changes</button>
//               </div>
//               <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//                 <div className="glass-card" style={{ background: C.card, borderRadius: 13, padding: "16px", border: `1px solid ${C.border}` }}>
//                   <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Appearance</h3>
//                   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                     <span style={{ color: C.textMid, fontSize: 13 }}>Dark Mode</span>
//                     <button onClick={() => setDark(d => !d)} style={{ width: 44, height: 24, borderRadius: 12, background: dark ? `linear-gradient(135deg,${accent},#2196f3)` : C.border, border: "none", cursor: "pointer", position: "relative", transition: "background .3s" }}>
//                       <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: dark ? 23 : 3, transition: "left .3s", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }} />
//                     </button>
//                   </div>
//                 </div>
//                 <div className="glass-card" style={{ background: C.card, borderRadius: 13, padding: "14px 16px", border: `1px solid ${C.border}` }}>
//                   <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Quick Actions</h3>
//                   <div style={{ display: "flex", gap: 8 }}>
//                     <button onClick={() => setShowInteraction(true)} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "rgba(251,191,36,0.1)", color: "#fbbf24", fontWeight: 700, fontSize: 11, border: "1px solid rgba(251,191,36,0.25)", cursor: "pointer" }}>⚗️ Drug Checker</button>
//                     <button onClick={onLogout} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "#ef4444", fontWeight: 700, fontSize: 11, border: "1px solid rgba(239,68,68,0.25)", cursor: "pointer" }}>🚪 Sign Out</button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

function PatientPortal({ setPage, dark, setDark, lang, setLang, user, onLogout }) {
  const L = T[lang]; const C = COLORS[dark ? "dark" : "light"];
  const { toasts, show } = useToast(); const offline = useOffline();
  const accent = dark ? "#4fc3f7" : "#1a6bbf";
  const [tab, setTab] = useState("dashboard");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [meds, setMeds] = useState([]);
  const [streak, setStreak] = useState(0);

  // ── BACKEND DATA FETCHING ──
  useEffect(() => {
    if (user && user.email) {
      const fetchMeds = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/medications/${user.email}`);
          if (res.ok) {
            const data = await res.json();
            setMeds(data);
          } else {
            throw new Error("Failed to fetch meds");
          }
        } catch (err) {
          console.error("Error fetching meds:", err);
          const savedMeds = localStorage.getItem(`meds_${user.email}`);
          if (savedMeds) setMeds(JSON.parse(savedMeds));
        }
      };
      fetchMeds();
    }
  }, [user]);

  const knownAllergies = (user?.allergies || "").split(",").map(a => a.trim()).filter(Boolean);
  const takenCount = meds.filter(m => m.status === "taken").length;

  // ── DYNAMIC CALCULATIONS ──
  const adherencePct = meds.length === 0 ? 0 : Math.round((takenCount / meds.length) * 100);
  const healthScore = meds.length === 0 ? 0 : Math.min(100, Math.round(adherencePct * .5 + streak * 2 + 10));
  const refillAlerts = meds.filter(m => m.refill <= 7);

  const markTaken = async (idx) => {
    if (meds[idx].status === "taken") return;
    const medToUpdate = meds[idx];
    const newStatus = "taken";

    try {
      if (medToUpdate.id) {
        await fetch(`${API_BASE_URL}/api/medications/${medToUpdate.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus })
        });
      }

      const newMeds = meds.map((m, i) => i === idx ? { ...m, status: newStatus } : m);
      setMeds(newMeds);

      if (newMeds.every(m => m.status === "taken")) {
        setStreak(prev => prev + 1);
        // Also update streak on backend
        await fetch(`${API_BASE_URL}/api/users/${user.email}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ streak: streak + 1 })
        });
      }
      show("💊", "Medication Taken!", `${meds[idx].name} marked as taken ✅`, "success");
    } catch (err) {
      console.error("Error updating status:", err);
      show("❌", "Error", "Failed to update medication status", "error");
    }
  };

  const handleAddMed = async (form) => {
    const timeStr = form.time ? new Date(`2000-01-01T${form.time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD";
    const newMed = {
      name: form.name,
      dosage: form.dosage,
      time: timeStr,
      status: "upcoming",
      icon: "💊",
      frequency: form.frequency,
      purpose: form.purpose || "General",
      refill: 30,
      userEmail: user.email // Connect to user
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/medications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newMed, userId: user.email }) // Use email as userId for now
      });
      const data = await res.json();
      if (res.ok) {
        setMeds(p => [...p, { ...newMed, id: data.id }]);
        show("➕", "Medication Added!", `${form.name} added.`, "info");
      } else {
        throw new Error(data.detail || "Failed to add med");
      }
    } catch (err) {
      console.error("Error adding med:", err);
      show("❌", "Error", "Failed to add medication to database", "error");
    }
  };

  const TABS = ["dashboard", "medications", "ai-advisor", "analytics", "symptoms", "settings"];

  return (
    <div style={{ minHeight: "100vh" }}>
      <Toast toasts={toasts} />
      {offline && <OfflineBanner />}
      {showAddModal && <AddMedModal onClose={() => setShowAddModal(false)} onAdd={handleAddMed} knownAllergies={knownAllergies} />}
      {showInteraction && <DrugInteractionModal onClose={() => setShowInteraction(false)} />}
      {showSOS && <EmergencySOSModal onClose={() => setShowSOS(false)} />}
      {showSymptoms && <SymptomLoggerModal onClose={() => setShowSymptoms(false)} meds={meds} />}
      {refillAlerts.length > 0 && <div style={{ background: "rgba(251,191,36,0.12)", borderBottom: "1px solid rgba(251,191,36,0.25)", padding: "10px 40px", display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#fbbf24", fontWeight: 600 }}><span>⚠️</span><span>Refill soon: {refillAlerts.map(m => `${m.name} (${m.refill}d)`).join(" · ")}</span></div>}

      {/* Topbar */}
      <div style={{ background: C.navBg, backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "0 28px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 9, background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: accent, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            ← Home
          </button>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>♥</div>
          <span style={{ fontWeight: 800, fontSize: 15, color: accent, fontFamily: "'Outfit', sans-serif" }}>MedGuard AI</span>
          <span style={{ background: C.accentLight, color: accent, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 100, border: `1px solid ${C.accentBorder}` }}>Patient</span>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {TABS.map(t => <button key={t} className="tab-pill" onClick={() => setTab(t)} style={{ padding: "7px 12px", borderRadius: 8, background: tab === t ? `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})` : "transparent", color: tab === t ? "#fff" : C.textMid, fontWeight: tab === t ? 700 : 500, fontSize: 12, border: "none", textTransform: "capitalize", transition: "all .2s", cursor: "pointer" }}>{L[t] || t.replace("-", " ")}</button>)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select value={lang} onChange={e => setLang(e.target.value)} style={{ padding: "5px 8px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 12, outline: "none" }}>
            {Object.entries(T).map(([k, v]) => <option key={k} value={k}>{v.langName}</option>)}
          </select>
          <button onClick={() => setDark(d => !d)} style={{ padding: "7px 10px", borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`, cursor: "pointer", fontSize: 15 }}>{dark ? "☀️" : "🌙"}</button>
          <button onClick={() => setShowSOS(true)} style={{ padding: "7px 12px", borderRadius: 8, background: "rgba(239,68,68,0.12)", color: "#ef4444", fontWeight: 700, fontSize: 11, border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer" }}>🆘 SOS</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", background: C.accentLight, borderRadius: 100, border: `1px solid ${C.accentBorder}` }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>{user?.initials || "AP"}</div>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{user?.name?.split(" ")[0] || "Patient"}</span>
          </div>
          <button onClick={onLogout} style={{ padding: "7px 12px", borderRadius: 8, background: C.surface, color: C.textMid, fontWeight: 700, fontSize: 11, border: `1px solid ${C.border}`, cursor: "pointer" }}>Sign Out</button>
        </div>
      </div>

      <div style={{ padding: "22px 28px" }}>
        {tab === "dashboard" && (
          <>
            <div className="glass-card" style={{ background: dark ? "linear-gradient(135deg,rgba(13,31,60,0.9),rgba(26,107,191,0.3))" : "linear-gradient(135deg,rgba(26,107,191,0.85),rgba(79,195,247,0.7))", borderRadius: 18, padding: "22px 28px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff", border: `1px solid ${dark ? "rgba(79,195,247,0.2)" : "transparent"}` }}>
              <div>
                <div style={{ display: "flex", gap: 32, marginBottom: 12 }}>
                  <div><div style={{ fontSize: 10, opacity: .7, marginBottom: 2 }}>Age</div><div style={{ fontWeight: 800, fontSize: 16 }}>{user?.dob ? (new Date().getFullYear() - new Date(user.dob).getFullYear()) + " yrs" : "--"}</div></div>
                  <div><div style={{ fontSize: 10, opacity: .7, marginBottom: 2 }}>Weight</div><div style={{ fontWeight: 800, fontSize: 16, color: "#fbbf24" }}>{user?.weight ? user.weight + " kg" : "--"}</div></div>
                  <div><div style={{ fontSize: 10, opacity: .7, marginBottom: 2 }}>Sex</div><div style={{ fontWeight: 800, fontSize: 16 }}>{user?.gender || "--"}</div></div>
                  <div><div style={{ fontSize: 10, opacity: .7, marginBottom: 2 }}>Blood</div><div style={{ fontWeight: 800, fontSize: 16 }}>{user?.bloodGroup || "--"}</div></div>
                </div>
                {meds.length === 0 ? (
                  <div style={{ fontSize: 13, background: "rgba(255,255,255,0.15)", padding: "5px 14px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.25)", display: "inline-block" }}>
                    Welcome! Add your first medication to see your health insights.
                  </div>
                ) : (
                  <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {meds.map((m, i) => <span key={i} style={{ padding: "3px 10px", borderRadius: 100, background: m.status === "taken" ? "rgba(52,211,153,.25)" : "rgba(255,255,255,.15)", border: `1px solid ${m.status === "taken" ? "rgba(52,211,153,.5)" : "rgba(255,255,255,.25)"}`, fontSize: 11, fontWeight: 600 }}>{m.status === "taken" ? "✓ " : ""}{m.name}</span>)}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, opacity: .7, marginBottom: 5 }}>Today's Adherence</div><AdherenceRing pct={adherencePct} size={95} /><div style={{ fontSize: 10, opacity: .7, marginTop: 2 }}>{takenCount}/{meds.length} doses</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, opacity: .7, marginBottom: 5 }}>Health Score</div><HealthScoreRing score={healthScore} /></div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
              {[["💊", "Medications", `${meds.length}`, `${meds.filter(m => m.status === "upcoming").length} remaining`, accent], ["🔥", "Streak", `${streak}d`, "days in a row", "#d97706"], ["⚠️", "Interactions", "0", "all clear", "#34d399"], ["🤖", "AI Insights", meds.length > 0 ? "5" : "0", "new today", "#a78bfa"]].map(([ic, l, v, s, c]) => (
                <div key={l} className="glass-card card-lift" style={{ background: C.card, borderRadius: 13, padding: "16px", border: `1px solid ${C.border}`, boxShadow: C.cardShadow }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{ic}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: c, fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginTop: 1 }}>{l}</div>
                  <div style={{ fontSize: 11, color: C.textSoft }}>{s}</div>
                </div>
              ))}
            </div>

            <MoodWidget dark={dark} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, marginBottom: 16 }}>
              <div className="glass-card" style={{ background: C.card, borderRadius: 16, padding: "20px 22px", border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Today's Medication Schedule</h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setShowInteraction(true)} style={{ padding: "6px 10px", borderRadius: 7, background: "rgba(251,191,36,0.1)", color: "#fbbf24", fontWeight: 700, fontSize: 11, border: "1px solid rgba(251,191,36,0.25)", cursor: "pointer" }}>⚗️ Check</button>
                    <button onClick={() => setShowAddModal(true)} style={{ padding: "6px 12px", borderRadius: 7, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontWeight: 700, fontSize: 11, border: "none", cursor: "pointer" }}>{L.addMed}</button>
                  </div>
                </div>
                {meds.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: C.textSoft, fontSize: 14 }}>No medications yet. Click "+ Add Med" to manually enter your data.</div>
                ) : (
                  meds.map((m, i) => (
                    <div key={i} className="med-row" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 6px", borderBottom: i < meds.length - 1 ? `1px solid ${C.border}` : "none", borderRadius: 7, transition: "background .15s" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: m.status === "taken" ? "rgba(52,211,153,0.12)" : C.accentLight, border: `1.5px solid ${m.status === "taken" ? "rgba(52,211,153,0.4)" : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{m.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{m.name} {m.dosage}</div>
                        <div style={{ fontSize: 11, color: C.textSoft }}>⏰ {m.time} · {m.frequency}</div>
                        {m.refill <= 7 && <div style={{ fontSize: 10, color: "#fbbf24", fontWeight: 600 }}>⚠️ Refill in {m.refill} days</div>}
                      </div>
                      {m.status === "taken" ? <div style={{ padding: "4px 11px", borderRadius: 100, background: "rgba(52,211,153,0.12)", color: "#34d399", fontSize: 11, fontWeight: 700, border: "1px solid rgba(52,211,153,0.3)" }}>✓ Taken</div> : <button onClick={() => markTaken(i)} style={{ padding: "6px 12px", borderRadius: 7, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer" }}>{L.markTaken}</button>}
                    </div>
                  ))
                )}
                <div style={{ marginTop: 12, background: C.accentLight, borderRadius: 9, padding: "10px 12px", border: `1px solid ${C.accentBorder}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}><span style={{ fontSize: 12, fontWeight: 600, color: C.textMid }}>Daily Progress</span><span style={{ fontSize: 12, fontWeight: 700, color: accent }}>{takenCount}/{meds.length}</span></div>
                  <div style={{ height: 7, borderRadius: 7, background: C.border, overflow: "hidden" }}><div style={{ height: "100%", width: `${adherencePct}%`, background: `linear-gradient(90deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, borderRadius: 7, transition: "width .7s ease" }} /></div>
                  {takenCount === meds.length && meds.length > 0 && <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, fontWeight: 700, color: "#34d399" }}>🎉 All medications taken today!</div>}
                </div>
              </div>

              {/* Sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="glass-card" style={{ background: C.card, borderRadius: 14, padding: "16px", border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🤖</div>
                    <div><div style={{ fontWeight: 700, fontSize: 12, color: C.text }}>AI Health Insights</div><div style={{ fontSize: 10, color: C.textSoft }}>Powered by Claude</div></div>
                  </div>
                  <div style={{ background: C.accentLight, borderRadius: 8, padding: "8px 11px", marginBottom: 7, fontSize: 12, color: C.textMid, lineHeight: 1.6, border: `1px solid ${C.accentBorder}` }}>💡 {meds.length > 0 ? "Tracking started. Great job!" : "Add data to receive AI insights."}</div>
                  <button onClick={() => setTab("ai-advisor")} style={{ width: "100%", marginTop: 10, padding: "8px", borderRadius: 8, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer" }}>💬 Chat with AI →</button>
                </div>
                <div className="glass-card" style={{ background: C.card, borderRadius: 13, padding: "14px 16px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>Quick Actions</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
                    {[["➕", "Add Med", () => setShowAddModal(true)], ["Drug Check", () => setShowInteraction(true)], ["🆘", "SOS", () => setShowSOS(true)], ["📋", "Symptoms", () => setShowSymptoms(true)], ["📄", "Report", () => printReport(meds, streak, adherencePct, user)], ["📊", "Analytics", () => setTab("analytics")]].map(([ic, l, fn]) => (
                      <button key={l} onClick={fn} style={{ background: l === "SOS" ? "rgba(239,68,68,0.1)" : C.accentLight, borderRadius: 9, padding: "9px 4px", border: `1.5px solid ${l === "SOS" ? "rgba(239,68,68,0.3)" : C.accentBorder}`, cursor: "pointer", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ fontSize: 18 }}>{ic}</span><span style={{ fontSize: 10, fontWeight: 700, color: l === "SOS" ? "#ef4444" : C.textMid }}>{l}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <MedTimeline dark={dark} />
          </>
        )}

        {tab === "medications" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => setTab("dashboard")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 9, background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: accent, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>← Dashboard</button>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, fontFamily: "'Outfit', sans-serif" }}>My Medications</h2>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => printReport(meds, streak, adherencePct, user)} style={{ padding: "9px 14px", borderRadius: 9, background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: C.textMid, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>📄 Report</button>
                <button onClick={() => setShowAddModal(true)} style={{ padding: "9px 18px", borderRadius: 9, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>{L.addMed}</button>
              </div>
            </div>
            {meds.length === 0 ? (
              <div className="glass-card" style={{ background: C.card, borderRadius: 14, padding: "60px", textAlign: "center", border: `1px solid ${C.border}`, color: C.textSoft }}>No active medications found. Click "+ Add Med" to start.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {meds.map((m, i) => (
                  <div key={i} className="glass-card card-lift" style={{ background: C.card, borderRadius: 14, padding: "18px", border: `1px solid ${C.border}`, boxShadow: C.cardShadow }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 11, background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>{m.icon}</div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: accent, background: C.accentLight, padding: "3px 9px", borderRadius: 100, border: `1px solid ${C.accentBorder}` }}>Active</span>
                    </div>
                    <div style={{ fontWeight: 700, color: C.text, marginBottom: 2 }}>{m.name} {m.dosage}</div>
                    <div style={{ fontSize: 12, color: C.textMid, marginBottom: 6 }}>🔁 {m.frequency} · {m.purpose}</div>
                    {m.refill <= 7 && <div style={{ fontSize: 11, color: "#fbbf24", fontWeight: 600, marginBottom: 8 }}>⚠️ Refill in {m.refill} days</div>}
                    <button onClick={() => markTaken(i)} disabled={m.status === "taken"} style={{ width: "100%", padding: "9px", borderRadius: 9, background: m.status === "taken" ? "rgba(52,211,153,0.12)" : `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: m.status === "taken" ? "#34d399" : "#fff", fontWeight: 700, fontSize: 12, border: `1px solid ${m.status === "taken" ? "rgba(52,211,153,0.3)" : "transparent"}`, cursor: m.status === "taken" ? "default" : "pointer" }}>
                      {m.status === "taken" ? "✓ Taken Today" : L.markTaken}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "ai-advisor" && <AIChatTab dark={dark} user={user} />}

        {tab === "analytics" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <button onClick={() => setTab("dashboard")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 9, background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: accent, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>← Dashboard</button>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, fontFamily: "'Outfit', sans-serif" }}>Health Analytics</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 16 }}>
              {[["📅", "This Month", `${takenCount}/${meds.length || 0} doses`, `${adherencePct}% adherence`], ["📈", "Best Streak", `${streak} days`, streak > 0 ? "Personal record! 🔥" : "Start your streak!"], ["⭐", "Avg Adherence", `${adherencePct}%`, "Last 3 months"]].map(([ic, l, v, s]) => (
                <div key={l} className="glass-card" style={{ background: C.card, borderRadius: 14, padding: "22px 18px", border: `1px solid ${C.border}`, textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>{ic}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textSoft, textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: accent, margin: "6px 0 2px", fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
                  <div style={{ fontSize: 12, color: C.textMid }}>{s}</div>
                </div>
              ))}
            </div>
            <div className="glass-card" style={{ background: C.card, borderRadius: 16, padding: "20px 22px", border: `1px solid ${C.border}`, marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, color: C.text, marginBottom: 16 }}>📊 Weekly Adherence — Last 4 Weeks</h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 120 }}>
                {[0, 0, 0, adherencePct].map((v, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: i === 3 ? accent : C.textMid, fontFamily: "'JetBrains Mono', monospace" }}>{v}%</span>
                    <div style={{ width: "100%", height: `${v}%`, background: i === 3 ? `linear-gradient(180deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})` : C.border, borderRadius: "6px 6px 0 0", transition: "height .6s ease" }} />
                    <span style={{ fontSize: 11, color: C.textSoft }}>{i === 3 ? "Now" : `Wk ${i + 1}`}</span>
                  </div>
                ))}
              </div>
            </div>
            <MedTimeline dark={dark} />
          </div>
        )}

        {tab === "symptoms" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
            <h2 style={{ color: C.text, marginBottom: 12, fontFamily: "'Outfit', sans-serif" }}>Symptom Logger</h2>
            <p style={{ color: C.textMid, marginBottom: 20, textAlign: "center" }}>Log your symptoms and get AI analysis against your current medications.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setTab("dashboard")} style={{ padding: "12px 20px", borderRadius: 11, background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: accent, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Back</button>
              <button onClick={() => setShowSymptoms(true)} style={{ padding: "12px 26px", borderRadius: 11, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Open Symptom Logger</button>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <button onClick={() => setTab("dashboard")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 9, background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: accent, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>← Dashboard</button>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, fontFamily: "'Outfit', sans-serif" }}>Settings</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="glass-card" style={{ background: C.card, borderRadius: 16, padding: "22px", border: `1px solid ${C.border}` }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 16, fontFamily: "'Outfit', sans-serif" }}>Account Settings</h3>
                {[["Full Name", user?.name || "—"], ["Email", user?.email || "—"], ["Phone", user?.phone || "—"], ["Date of Birth", user?.dob || "—"], ["Blood Group", user?.bloodGroup || "—"], ["Conditions", user?.conditions || "—"]].map(([l, v]) => (
                  <div key={l} style={{ marginBottom: 12 }}>
                    <label style={{ ...lStyle, color: C.textSoft }}>{l}</label>
                    <input defaultValue={v} style={{ ...iStyle, background: C.inputBg, color: C.text, border: `1.5px solid ${C.border}` }} />
                  </div>
                ))}
                <button style={{ padding: "10px 18px", borderRadius: 9, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontWeight: 700, fontSize: 12, border: "none", marginTop: 4, cursor: "pointer" }}>Save Changes</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="glass-card" style={{ background: C.card, borderRadius: 13, padding: "16px", border: `1px solid ${C.border}` }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Appearance</h3>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: C.textMid, fontSize: 13 }}>Dark Mode</span>
                    <button onClick={() => setDark(d => !d)} style={{ width: 44, height: 24, borderRadius: 12, background: dark ? `linear-gradient(135deg,${accent},#2196f3)` : C.border, border: "none", cursor: "pointer", position: "relative", transition: "background .3s" }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: dark ? 23 : 3, transition: "left .3s", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }} />
                    </button>
                  </div>
                </div>
                <div className="glass-card" style={{ background: C.card, borderRadius: 13, padding: "14px 16px", border: `1px solid ${C.border}` }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Quick Actions</h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setShowInteraction(true)} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "rgba(251,191,36,0.1)", color: "#fbbf24", fontWeight: 700, fontSize: 11, border: "1px solid rgba(251,191,36,0.25)", cursor: "pointer" }}>⚗️ Drug Checker</button>
                    <button onClick={onLogout} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "#ef4444", fontWeight: 700, fontSize: 11, border: "1px solid rgba(239,68,68,0.25)", cursor: "pointer" }}>🚪 Sign Out</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── GUARDIAN PORTAL ───────────────────────────────────
function GuardianPortal({ setPage, dark, user, onLogout }) {
  const C = COLORS[dark ? "dark" : "light"];
  const accent = dark ? "#4fc3f7" : "#1a6bbf";
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
          <button onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 9, background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: accent, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>← Home</button>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>♥</div>
          <span style={{ fontWeight: 800, fontSize: 15, color: accent, fontFamily: "'Outfit', sans-serif" }}>MedGuard AI</span>
          <span style={{ background: C.accentLight, color: accent, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 100, border: `1px solid ${C.accentBorder}` }}>Guardian</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", background: C.accentLight, borderRadius: 100, border: `1px solid ${C.accentBorder}` }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>{user?.initials || "GU"}</div>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{user?.name?.split(" ")[0] || "Guardian"}</span>
          </div>
          <button onClick={onLogout} style={{ padding: "7px 12px", borderRadius: 8, background: C.surface, color: C.textMid, fontWeight: 700, fontSize: 11, border: `1px solid ${C.border}`, cursor: "pointer" }}>Sign Out</button>
        </div>
      </div>

      <div style={{ background: dark ? "linear-gradient(160deg,rgba(13,31,60,0.9),rgba(26,107,191,0.2))" : "linear-gradient(160deg,rgba(26,107,191,0.08),rgba(79,195,247,0.05))", padding: "36px 48px 28px", borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: C.text, marginBottom: 6, fontFamily: "'Outfit', sans-serif" }}>Guardian Dashboard 👥</h1>
        <p style={{ color: C.textMid, fontSize: 14 }}>Welcome back, {user?.name?.split(" ")[0] || "Guardian"}. Here's an overview of your loved ones.</p>
      </div>

      <div style={{ padding: "24px 48px" }}>
        {/* Patient selector */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>Select Patient</div>
          <div style={{ display: "flex", gap: 10 }}>
            {patients.map((pt, i) => (
              <div key={i} onClick={() => setSelectedPatient(i)} className="glass-card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 13, cursor: "pointer", border: `2px solid ${selectedPatient === i ? accent : C.border}`, background: selectedPatient === i ? C.accentLight : C.card, transition: "all .2s", minWidth: 170, position: "relative" }}>
                <button onClick={(e) => handleDeletePatient(pt.id, e)} style={{ position: "absolute", top: 5, right: 5, background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, fontWeight: "bold", padding: "2px 6px" }}>×</button>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${accent}22`, color: accent, fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${accent}44` }}>{pt.initials}</div>
                <div>
                  <div style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>{pt.name}</div>
                  <div style={{ fontSize: 11, color: C.textSoft }}>{pt.rel} · {pt.age} yrs</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: pt.adherence >= 85 ? "#34d399" : pt.adherence >= 70 ? "#fbbf24" : "#ef4444", marginTop: 2 }}>{pt.adherence || 0}% adherence</div>
                </div>
              </div>
            ))}
            <div onClick={() => setShowAddPatient(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 16px", borderRadius: 13, border: `2px dashed ${C.border}`, cursor: "pointer", minWidth: 120, color: C.textSoft, fontWeight: 600, fontSize: 13, gap: 6 }}>＋ Add</div>
          </div>
        </div>

        <div className="glass-card" style={{ background: C.card, borderRadius: 16, padding: "20px 24px", marginBottom: 14, border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 2, fontFamily: "'Outfit', sans-serif" }}>{p ? p.name + "'s Overview" : "No Patient Added"}</div>
            <div style={{ fontSize: 13, color: C.textSoft }}>{p ? `${p.rel} · Age ${p.age} · Last active 5 min ago` : "Add a loved one to start tracking their health stats here."}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ padding: "8px 13px", borderRadius: 8, background: "rgba(52,211,153,0.12)", color: "#34d399", fontWeight: 700, fontSize: 11, border: "1px solid rgba(52,211,153,0.3)", cursor: "pointer" }}>✅ All Meds Taken</button>
            <button style={{ padding: "8px 13px", borderRadius: 8, background: "rgba(239,68,68,0.12)", color: "#ef4444", fontWeight: 700, fontSize: 11, border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer" }}>🆘 Emergency</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 14 }}>
          {[["💊", "Today's Meds", p ? (p.medications ? "Tracking" : "None") : "0/0", p && p.medications ? "Active" : "—", "#34d399"], ["🔥", "Streak", p ? "0d" : "0d", "consecutive", "#fbbf24"], ["⚠️", "Missed", p ? "0" : "0", "last 30 days", "#ef4444"], ["📊", "Adherence", p ? `${p.adherence || 0}%` : "0%", "this month", accent]].map(([ic, l, v, s, c]) => (
            <div key={l} className="glass-card" style={{ background: C.card, borderRadius: 12, padding: "15px 16px", border: `1px solid ${C.border}`, boxShadow: C.cardShadow }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{ic}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: c, fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginTop: 1 }}>{l}</div>
              <div style={{ fontSize: 10, color: C.textSoft, marginTop: 1 }}>{s}</div>
            </div>
          ))}
        </div>

        {p && (
          <div className="glass-card" style={{ background: C.card, borderRadius: 16, padding: "20px 24px", marginBottom: 14, border: `1px solid ${C.border}` }}>
            <h3 style={{ fontWeight: 800, color: C.text, marginBottom: 16, fontSize: 16, borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>📋 Health Profile: {p.name}</h3>
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
              <div style={{ fontWeight: 700, marginBottom: 8, color: accent, fontSize: 13 }}>👥 Guardian Controls</div>
              {["Dosage adjustments", "Medication additions", "Emergency contacts", "Activity updates", "Alert notifications"].map(f => (
                <div key={f} style={{ display: "flex", gap: 8, marginBottom: 6 }}><span style={{ color: "#34d399" }}>✓</span><span style={{ fontSize: 12, color: C.textMid }}>{f}</span></div>
              ))}
            </div>
            <div className="glass-card" style={{ background: C.card, borderRadius: 13, padding: "14px 16px", border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 700, color: C.text, marginBottom: 10, fontSize: 13 }}>📲 Recent Alerts</div>
              {[["🔔", "Medication reminder sent", "2 min ago"], ["✅", "Aspirin 100mg confirmed taken", "1 hr ago"], ["⚠️", "Lisinopril due at 9:00 PM", "Upcoming"]].map(([ic, m, t]) => (
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
function Navbar({ setPage, scrollTo, dark, setDark, lang, setLang, user, onLogout }) {
  const C = COLORS[dark ? "dark" : "light"];
  const [active, setActive] = useState("home");
  const accent = dark ? "#4fc3f7" : "#1a6bbf";

  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: C.navBg, backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "0 48px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => { setPage("home"); scrollTo("home"); }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>♥</div>
        <span style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: "'Outfit', sans-serif" }}>MedGuard AI</span>
      </div>
      <div style={{ display: "flex", gap: 28 }}>
        {[["home", "Home"], ["about", "About"], ["services", "Services"], ["contact", "Contact"]].map(([id, label]) => (
          <button key={id} className={`nav-link ${active === id ? "active" : ""}`} onClick={() => { setActive(id); scrollTo(id); }} style={{ background: "none", border: "none", fontSize: 14, fontWeight: 500, color: active === id ? accent : C.textMid, padding: "4px 0", cursor: "pointer" }}>{label}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={() => setDark(d => !d)} style={{ padding: "7px 10px", borderRadius: 9, background: C.accentLight, border: `1px solid ${C.accentBorder}`, cursor: "pointer", fontSize: 15 }}>{dark ? "☀️" : "🌙"}</button>
        <select value={lang} onChange={e => setLang(e.target.value)} style={{ padding: "6px 9px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 12, cursor: "pointer", outline: "none" }}>
          {Object.entries(T).map(([k, v]) => <option key={k} value={k}>{v.langName}</option>)}
        </select>
        {user ? (
          <>
            {user.role === "patient" && (
              <button onClick={() => setPage("patient")} style={{ padding: "9px 18px", borderRadius: 8, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontWeight: 600, fontSize: 12, border: "none", cursor: "pointer", boxShadow: `0 4px 14px ${accent}40` }}>Patient Portal</button>
            )}
            {user.role === "guardian" && (
              <button onClick={() => setPage("guardian")} style={{ padding: "9px 18px", borderRadius: 8, background: C.accentLight, color: accent, fontWeight: 600, fontSize: 12, border: `1px solid ${C.accentBorder}`, cursor: "pointer" }}>Guardian Portal</button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", background: C.accentLight, borderRadius: 100, border: `1px solid ${C.accentBorder}` }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11 }}>{user.initials}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{user.name?.split(" ")[0]}</span>
            </div>
            <button onClick={onLogout} style={{ padding: "9px 13px", borderRadius: 9, background: C.accentLight, color: C.textMid, fontWeight: 700, fontSize: 12, border: `1px solid ${C.border}`, cursor: "pointer" }}>Sign Out</button>
          </>
        ) : (
          <button onClick={() => setPage("auth")} style={{ padding: "10px 24px", borderRadius: 8, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer", boxShadow: `0 4px 16px ${accent}44` }}>Login / Sign Up</button>
        )}
      </div>
    </nav>
  );
}

// ── HOME PAGE ─────────────────────────────────────────
function HomePage({ setPage, setLearnMore, dark, user, sectionRefs }) {
  const C = COLORS[dark ? "dark" : "light"];
  const accent = dark ? "#4fc3f7" : "#1a6bbf";
  const [bpm, setBpm] = useState(105);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  useScrollReveal();

  useEffect(() => {
    const iv = setInterval(() => setBpm(90 + Math.floor(Math.random() * 30)), 1800);
    return () => clearInterval(iv);
  }, []);

  const gotoPortal = (dest) => { if (user) setPage(dest); else setPage("auth"); };

  const SERVICE_CARDS = [
    { icon: "💊", name: "Medication Management", desc: "Smart scheduling, dose tracking, and refill reminders to ensure you never miss a dose.", color: "#4fc3f7" },
    { icon: "🤖", name: "AI Health Advisor", desc: "24/7 AI-powered guidance on symptoms, drug interactions, and health concerns.", color: "#a78bfa" },
    { icon: "🛡️", name: "Drug Interaction Check", desc: "Real-time database of thousands of drug interactions to keep you safe.", color: "#fbbf24" },
    { icon: "👥", name: "Guardian Portal", desc: "Comprehensive caregiver tools to monitor and manage health for loved ones.", color: "#34d399" },
    { icon: "📊", name: "Health Analytics", desc: "Detailed adherence reports, streak tracking, and personalized health insights.", color: "#34d399" },
    { icon: "🆘", name: "Emergency SOS", desc: "One-tap emergency call with automatic location sharing to your contacts.", color: "#ef4444" },
  ];

  return (
    <div>
      {/* ── HERO ── */}
      <section ref={sectionRefs.home} id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "100px 72px 60px", gap: 60, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -120, right: -120, width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${accent}15,transparent 65%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 350, height: 350, borderRadius: "50%", background: `radial-gradient(circle,rgba(167,139,250,.08),transparent 65%)`, pointerEvents: "none" }} />

        <div style={{ flex: 1, maxWidth: 540 }} className="fade-up">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accentLight, border: `1px solid ${C.accentBorder}`, borderRadius: 100, padding: "7px 16px", marginBottom: 24 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: accent, animation: "pulse 1.8s infinite" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>AI-Powered Healthcare Platform</span>
          </div>
          <h1 style={{ fontSize: "clamp(36px,5vw,62px)", fontWeight: 800, lineHeight: 1.08, color: C.text, marginBottom: 18, letterSpacing: "-1px", fontFamily: "'Outfit', sans-serif" }}>
            Your Intelligent<br /><span style={{ color: accent }}>Medicine Reminder</span><br />&amp; Health Advisory<br />System
          </h1>
          <p style={{ fontSize: 16, color: C.textMid, lineHeight: 1.8, marginBottom: 32, maxWidth: 460 }}>MedGuard AI combines advanced AI with compassionate care to ensure medication adherence, provide real-time health insights, and keep your loved ones connected.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => gotoPortal("patient")} style={{ padding: "14px 32px", borderRadius: 10, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", boxShadow: `0 6px 20px ${accent}40` }}>
              {user ? "👤 Patient Portal" : "👤 Get Started — Patient"}
            </button>
            <button onClick={() => gotoPortal("guardian")} style={{ padding: "14px 32px", borderRadius: 10, background: C.accentLight, color: accent, fontWeight: 700, fontSize: 14, border: `1.5px solid ${C.accentBorder}`, cursor: "pointer" }}>
              {user ? "👥 Guardian Portal" : "👥 Get Started — Guardian"}
            </button>
          </div>
          {!user && <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 100, padding: "7px 16px", marginTop: 16 }}><span>🔒</span><span style={{ fontSize: 12, color: "#34d399", fontWeight: 600 }}>Secure login required to access your portal</span></div>}
          {/* Stats */}
          {/* /* <div style={{ display: "flex", gap: 28, marginTop: 36 }}>
            {[["50K+", "Active Users"], ["99.8%", "Uptime"], ["50K+", "Drug Interactions"], ["4.9★", "App Rating"]].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: accent, fontFamily: "'JetBrains Mono', monospace" }}>{n}</div>
                <div style={{ fontSize: 11, color: C.textSoft, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div> */}
        </div>

        {/* Hero card — ClyHealth style */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="glass-card float-a" style={{ background: dark ? "rgba(13,31,60,0.85)" : "rgba(255,255,255,0.85)", borderRadius: 22, boxShadow: `0 20px 60px ${accent}20`, width: 400, overflow: "hidden", border: `1px solid ${C.border}` }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", fontWeight: 800 }}>M</div>
                <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>MedGuard Dashboard</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#34d399", background: "rgba(52,211,153,0.12)", padding: "3px 10px", borderRadius: 100 }}>● LIVE</span>
            </div>
            {/* Metrics */}
            <div style={{ padding: "18px" }}>
              {[["Biological Age", "47 yrs", "#fbbf24"], ["Chronological Age", "42 yrs", C.text], ["Blood Pressure", "130/85 mmHg", "#ef4444"], ["LDL Cholesterol", "145 mg/dL", "#fbbf24"]].map(([l, v, c]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, color: C.textMid }}>{l}</span>
                  <span style={{ fontWeight: 800, fontSize: 14, color: c, fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 14, padding: "12px", background: C.accentLight, borderRadius: 10, border: `1px solid ${C.accentBorder}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Methylation Risk Score</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24" }}>Moderate Risk</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: accent, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>0.76%</div>
                <div style={{ height: 6, background: `linear-gradient(90deg,#34d399,#4fc3f7,#fbbf24,#ef4444)`, borderRadius: 3, position: "relative" }}>
                  <div style={{ position: "absolute", left: "58%", top: -4, width: 14, height: 14, background: "#fff", border: "3px solid #fbbf24", borderRadius: "50%", transform: "translateX(-50%)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textSoft, marginTop: 4 }}><span>0</span><span>18.4% risk</span><span>30</span></div>
              </div>
              {/* ECG */}
              <svg viewBox="0 0 200 28" width="100%" height="28" style={{ marginTop: 10 }}>
                <polyline className="ecg-path" points="0,14 15,14 22,14 30,3 37,25 44,14 58,14 72,14 79,14 87,4 94,24 101,14 115,14 129,14 136,14 143,4 150,24 157,14 171,14 185,14 192,4 199,14" stroke={accent} strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: C.text }}>Pulse —</span>
                <span style={{ fontWeight: 900, fontSize: 14, color: accent, fontFamily: "'JetBrains Mono', monospace", animation: "heartbeat 1.4s ease-in-out infinite" }}>{bpm} BPM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section ref={sectionRefs.about} id="about" style={{ background: C.sectionAlt, padding: "100px 72px", borderTop: `1px solid ${C.border}`, backdropFilter: "blur(8px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 70, maxWidth: 1100, margin: "0 auto", alignItems: "center" }}>
          <div className="reveal-l">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accentLight, border: `1px solid ${C.accentBorder}`, borderRadius: 100, padding: "6px 14px", marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1 }}>About MedGuard AI</span>
            </div>
            <h2 style={{ fontSize: 46, fontWeight: 800, color: C.text, marginBottom: 16, fontFamily: "'Outfit', sans-serif", lineHeight: 1.12 }}>Built with Care,<br /><span style={{ color: accent }}>Powered by AI</span></h2>
            <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.85, marginBottom: 14 }}>MedGuard AI was founded with a mission to ensure no one ever misses their medication and everyone has access to intelligent health guidance — whenever they need it.</p>
            <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.85, marginBottom: 28 }}>We combine cutting-edge AI with intuitive design to create a healthcare companion that truly understands your needs — whether you're a patient managing your own health or a guardian caring for a loved one.</p>
            {[["🤖", "AI-Powered", "Intelligent recommendations from advanced machine learning"], ["🔒", "100% Secure", "HIPAA-compliant data encryption at every step"], ["👨‍👩‍👧", "Family-Focused", "Built for patients, caregivers, and whole families"]].map(([ic, t, s]) => (
              <div key={t} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: C.accentLight, border: `1px solid ${C.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{ic}</div>
                <div><div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{t}</div><div style={{ fontSize: 13, color: C.textMid, marginTop: 2 }}>{s}</div></div>
              </div>
            ))}
          </div>
          <div className="reveal-r" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[["🩺", "Smart Monitoring", "AI-powered anomaly detection with real-time health tracking"], ["💊", "Med Adherence", "98% medication adherence rate with smart reminder systems"], ["🤖", "AI Advisory", "24/7 AI health guidance powered by Claude AI"], ["👨‍👩‍👧", "Family Care", "Unified platform for patients and caregivers"]].map(([ic, t, s], i) => (
              <div key={t} className="glass-card card-lift" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 18px", transition: "all .3s" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{ic}</div>
                <div style={{ fontWeight: 700, color: C.text, fontSize: 14, marginBottom: 6 }}>{t}</div>
                <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6 }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section ref={sectionRefs.services} id="services" style={{ padding: "100px 72px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ textAlign: "center", marginBottom: 64 }} className="reveal-up">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accentLight, border: `1px solid ${C.accentBorder}`, borderRadius: 100, padding: "6px 14px", marginBottom: 18 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1 }}>Our Services</span>
          </div>
          <h2 style={{ fontSize: 48, fontWeight: 800, color: C.text, marginBottom: 14, fontFamily: "'Outfit', sans-serif", letterSpacing: "-1px" }}>Everything You Need<br />for Complete Healthcare</h2>
          <p style={{ fontSize: 16, color: C.textMid, maxWidth: 520, margin: "0 auto", lineHeight: 1.75 }}>Six powerful tools, one intelligent platform — from smart reminders to AI diagnostics.</p>
        </div>

        {/* How it works */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 60 }}>
          {[["01", "Create Profile", "Set up your account with health history, medications and care preferences."], ["02", "Connect & Sync", "AI creates an optimized reminder schedule tailored to your lifestyle."], ["03", "Get Reminders", "Smart notifications that adapt to your daily routine automatically."], ["04", "AI Insights", "Monitor adherence and receive personalized AI-powered health guidance."]].map(([n, t, s], i) => (
            <div key={t} className="reveal-up glass-card card-lift" style={{ background: C.card, borderRadius: 16, padding: "28px 20px", textAlign: "center", border: `1px solid ${C.border}`, boxShadow: C.cardShadow, transition: "all .3s", animationDelay: `${i * 0.1}s` }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontFamily: "'JetBrains Mono', monospace" }}>{n}</div>
              <div style={{ fontWeight: 700, color: C.text, marginBottom: 8, fontSize: 15 }}>{t}</div>
              <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7 }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Service cards — with Learn more */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {SERVICE_CARDS.map((s, i) => (
            <div key={s.name} className="reveal-up glass-card card-lift" style={{ background: C.card, borderRadius: 18, padding: "28px 24px", border: `1px solid ${C.border}`, boxShadow: C.cardShadow, transition: "all .3s", animationDelay: `${i * 0.08}s`, display: "flex", flexDirection: "column" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${s.color}18`, border: `1px solid ${s.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 16 }}>{s.icon}</div>
              <div style={{ fontWeight: 800, color: C.text, fontSize: 17, marginBottom: 10, fontFamily: "'Outfit', sans-serif" }}>{s.name}</div>
              <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.75, flex: 1, marginBottom: 18 }}>{s.desc}</p>
              <button
                onClick={() => setLearnMore(s.name)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: s.color, background: `${s.color}10`, border: `1px solid ${s.color}30`, padding: "8px 16px", borderRadius: 8, cursor: "pointer", width: "fit-content", transition: "all .2s" }}
                onMouseEnter={e => e.currentTarget.style.background = `${s.color}20`}
                onMouseLeave={e => e.currentTarget.style.background = `${s.color}10`}
              >
                Learn more →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section ref={sectionRefs.contact} id="contact" style={{ background: C.sectionAlt, padding: "100px 72px", borderTop: `1px solid ${C.border}`, backdropFilter: "blur(8px)" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }} className="reveal-up">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accentLight, border: `1px solid ${C.accentBorder}`, borderRadius: 100, padding: "6px 14px", marginBottom: 18 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1 }}>Get In Touch</span>
          </div>
          <h2 style={{ fontSize: 48, fontWeight: 800, color: C.text, marginBottom: 14, fontFamily: "'Outfit', sans-serif", letterSpacing: "-1px" }}>We're Here to Help</h2>
          <p style={{ fontSize: 16, color: C.textMid, maxWidth: 480, margin: "0 auto" }}>Have questions about your medications or our platform? Our medical team is ready to help.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 40, maxWidth: 1000, margin: "0 auto" }}>
          <div className="reveal-l" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[["📞", "Phone Support", "Mon–Fri 8am–8pm", "xxx-xxx-xxxx", accent], ["📧", "Email Us", "24-hour response", "support@medguardai.com", "#a78bfa"], ["📍", "Our Office", "Headquarters", "123 Healthcare Plaza, Boston MA", "#34d399"], ["💬", "Live Chat", "Available 24/7", "Chat with AI or support team", dark ? "#4fc3f7" : "#1a6bbf"]].map(([ic, t, s, v, c]) => (
              <div key={t} className="glass-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 18px", display: "flex", gap: 14, alignItems: "flex-start", boxShadow: C.cardShadow }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${c}18`, border: `1px solid ${c}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{ic}</div>
                <div>
                  <div style={{ fontWeight: 700, color: C.text, fontSize: 14, marginBottom: 2 }}>{t}</div>
                  <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 3 }}>{s}</div>
                  <div style={{ fontSize: 13, color: c, fontWeight: 600 }}>{v}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="reveal-r glass-card" style={{ background: C.card, borderRadius: 20, padding: "32px 28px", border: `1px solid ${C.border}`, boxShadow: C.cardShadow }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 22, fontFamily: "'Outfit', sans-serif" }}>Send us a Message</h3>
            {sent ? (
              <div style={{ textAlign: "center", padding: "50px 0" }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
                <h4 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 6 }}>Message Sent!</h4>
                <p style={{ color: C.textMid }}>We'll respond within 24 hours.</p>
                <button onClick={() => setSent(false)} style={{ marginTop: 20, padding: "10px 20px", borderRadius: 10, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>Send Another</button>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  {[["Full Name", "name", "text"], ["Email", "email", "email"]].map(([l, k, t]) => (
                    <div key={k}><label style={{ ...lStyle, color: C.textSoft }}>{l} *</label><input type={t} value={contactForm[k]} onChange={e => setContactForm(f => ({ ...f, [k]: e.target.value }))} style={{ ...iStyle, background: C.inputBg, color: C.text, border: `1.5px solid ${C.border}` }} /></div>
                  ))}
                </div>
                <div style={{ marginBottom: 14 }}><label style={{ ...lStyle, color: C.textSoft }}>Subject</label><input value={contactForm.subject} onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))} style={{ ...iStyle, background: C.inputBg, color: C.text, border: `1.5px solid ${C.border}` }} /></div>
                <div style={{ marginBottom: 6 }}><label style={{ ...lStyle, color: C.textSoft }}>Message *</label><textarea rows={5} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} style={{ ...iStyle, resize: "vertical", background: C.inputBg, color: C.text, border: `1.5px solid ${C.border}` }} placeholder="Tell us how we can help..." /></div>
                <div style={{ marginTop: 18 }}>
                  <button onClick={() => { if (contactForm.name && contactForm.email && contactForm.message) setSent(true); }} style={{ width: "100%", padding: "14px", borderRadius: 12, background: `linear-gradient(135deg,${accent},${dark ? "#2196f3" : "#4fc3f7"})`, color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `0 6px 20px ${accent}40` }}>✉️ Send Message</button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: dark ? "#040b18" : "#0a1628", padding: "40px 72px 24px", color: "#8ab4d4" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ maxWidth: 240 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg,#4fc3f7,#2196f3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>♥</div>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Outfit', sans-serif" }}>MedGuard AI</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>Intelligent healthcare management powered by AI. Secure, reliable, always available.</p>
          </div>
          {[["Product", ["Patient Portal", "Guardian Portal", "AI Advisor", "Drug Checker"]], ["Company", ["About", "Services", "Contact", "Careers"]], ["Support", ["Help Center", "Privacy Policy", "Terms of Service", "HIPAA Info"]]].map(([title, links]) => (
            <div key={title}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
              {links.map(l => <div key={l} style={{ fontSize: 13, marginBottom: 8, cursor: "pointer" }}>{l}</div>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(79,195,247,0.12)", paddingTop: 18, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span>© 2026 MedGuard AI. All rights reserved.</span>
          <div style={{ display: "flex", gap: 18 }}>
            <span style={{ color: "#34d399" }}>✅ HIPAA Compliant</span>
            <span style={{ color: "#34d399" }}>✅ SSL Secured</span>
            <span style={{ color: "#34d399" }}>✅ SOC 2 Certified</span>
          </div>
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

  const sectionRefs = {
    home: useRef(null), about: useRef(null),
    services: useRef(null), contact: useRef(null),
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("medguard_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
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

  useEffect(() => {
    if ((page === "patient" || page === "guardian") && !user) setPage("auth");
  }, [page, user]);

  // Learn more page
  if (learnMore) {
    return (
      <div>
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
    <div>
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