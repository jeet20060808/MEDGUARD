import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   MedGuard AI — WITH AUTHENTICATION GATE
   Login/Signup required before accessing portals
═══════════════════════════════════════════════════════ */

const API_KEY = typeof process !== "undefined" ? process.env?.REACT_APP_ANTHROPIC_API_KEY : undefined;

// ── TRANSLATIONS ──────────────────────────────────────
const T = {
  en: { dashboard: "Dashboard", medications: "Medications", aiAdvisor: "AI Advisor", analytics: "Analytics", symptoms: "Symptoms", vaccinations: "Vaccinations", appointments: "Appointments", settings: "Settings", goodMorning: "Good Morning", markTaken: "Mark Taken ✓", taken: "✓ Taken", addMed: "+ Add Med", healthScore: "Health Score", streak: "Streak", interactions: "Interactions", aiInsights: "AI Insights", dailyProgress: "Daily Progress", safetyDash: "Safety Dashboard", drugInteraction: "Drug Interaction Checker", emergencySOS: "Emergency SOS", weeklyReport: "Download Report", moodCheck: "How are you feeling?", langName: "English" },
  hi: { dashboard: "डैशबोर्ड", medications: "दवाइयाँ", aiAdvisor: "AI सलाहकार", analytics: "विश्लेषण", symptoms: "लक्षण", vaccinations: "टीकाकरण", appointments: "अपॉइंटमेंट", settings: "सेटिंग्स", goodMorning: "सुप्रभात", markTaken: "ली ✓", taken: "✓ ली", addMed: "+ दवा जोड़ें", healthScore: "स्वास्थ्य स्कोर", streak: "स्ट्रीक", interactions: "इंटरेक्शन", aiInsights: "AI अंतर्दृष्टि", dailyProgress: "दैनिक प्रगति", safetyDash: "सुरक्षा डैशबोर्ड", drugInteraction: "दवा इंटरेक्शन चेकर", emergencySOS: "आपातकालीन SOS", weeklyReport: "रिपोर्ट डाउनलोड", moodCheck: "आज आप कैसा महसूस कर रहे हैं?", langName: "हिंदी" },
  gu: { dashboard: "ડૅશબોર્ડ", medications: "દવાઓ", aiAdvisor: "AI સલાહ", analytics: "વિશ્લેષણ", symptoms: "લક્ષણો", vaccinations: "રસીકરણ", appointments: "એપૉઇન્ટમેન્ટ", settings: "સેટિંગ્સ", goodMorning: "સુ-પ્રભાત", markTaken: "લીધી ✓", taken: "✓ લીધી", addMed: "+ દવા ઉમેરો", healthScore: "સ્વાસ્થ્ય સ્કોર", streak: "સ્ટ્રીક", interactions: "ઇન્ટરેક્શન", aiInsights: "AI સૂઝ", dailyProgress: "દૈનિક પ્રગતિ", safetyDash: "સુરક્ષા ડૅશ", drugInteraction: "ડ્રગ ઇન્ટરેક્શન ચેકર", emergencySOS: "ઇમર્જન્સી SOS", weeklyReport: "રિપૉર્ટ ડાઉનલૉડ", moodCheck: "આજે તમે કેવું અનુભવો છો?", langName: "ગુજરાતી" },
};

// ── DRUG INTERACTION DATABASE ─────────────────────────
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
  const d1 = drug1.toLowerCase().trim();
  const d2 = drug2.toLowerCase().trim();
  return DRUG_INTERACTIONS.find(i =>
    (i.drugs[0].includes(d1) || d1.includes(i.drugs[0])) &&
    (i.drugs[1].includes(d2) || d2.includes(i.drugs[1])) ||
    (i.drugs[1].includes(d1) || d1.includes(i.drugs[1])) &&
    (i.drugs[0].includes(d2) || d2.includes(i.drugs[0]))
  );
}

const COLORS = {
  light: { bg: "#EBF4FF", surface: "#FFFFFF", card: "#FFFFFF", border: "#E2E8F0", text: "#1a202c", textMid: "#4A5568", textSoft: "#94A3B8", blue: "#4e65be", purp: "#8b64ce", navBg: "#FFFFFF", inputBg: "#FAFBFC", bannerBg: "linear-gradient(160deg,#EBF4FF,#DBEAFE)" },
  dark: { bg: "#0F172A", surface: "#1E293B", card: "#1E293B", border: "#334155", text: "#F1F5F9", textMid: "#94A3B8", textSoft: "#64748B", blue: "#6B8EFF", purp: "#A78BFA", navBg: "#1E293B", inputBg: "#0F172A", bannerBg: "linear-gradient(160deg,#0F172A,#1E293B)" },
};

const makeGCSS = (dark) => `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: ${dark ? "#0F172A" : "#EBF4FF"}; color: ${dark ? "#F1F5F9" : "#1a202c"}; transition: background .3s, color .3s; }
  input, select, textarea { font-family: inherit; color-scheme: ${dark ? "dark" : "light"}; }
  button { font-family: inherit; cursor: pointer; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${dark ? "#0F172A" : "#EBF4FF"}; }
  ::-webkit-scrollbar-thumb { background: ${dark ? "#334155" : "#93C5FD"}; border-radius: 4px; }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes float2   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.25)} }
  @keyframes modalIn  { from{opacity:0;transform:scale(.93) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes toastIn  { from{opacity:0;transform:translateX(120%)} to{opacity:1;transform:translateX(0)} }
  @keyframes toastOut { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(120%)} }
  @keyframes dotB     { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }
  @keyframes sosPulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)} 70%{box-shadow:0 0 0 24px rgba(239,68,68,0)} }
  @keyframes heartbeat{ 0%,100%{transform:scale(1)} 14%{transform:scale(1.15)} 28%{transform:scale(1)} 42%{transform:scale(1.1)} 56%{transform:scale(1)} }
  @keyframes slideIn  { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes ringFill { from{stroke-dashoffset:283} }
  @keyframes authSlide { from{opacity:0;transform:translateY(30px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes orbFloat { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-30px) rotate(10deg)} }
  .fade-up   { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) both; }
  .float1    { animation: float  4s ease-in-out infinite; }
  .float2    { animation: float2 5s ease-in-out infinite .8s; }
  .float3    { animation: float  6s ease-in-out infinite 1.5s; }
  .modal-wrap{ animation: modalIn .3s cubic-bezier(.22,1,.36,1) both; }
  .toast-in  { animation: toastIn .4s cubic-bezier(.22,1,.36,1) both; }
  .toast-out { animation: toastOut .4s ease both; }
  .dot1{animation:dotB 1.2s 0s infinite} .dot2{animation:dotB 1.2s .2s infinite} .dot3{animation:dotB 1.2s .4s infinite}
  .auth-card { animation: authSlide .5s cubic-bezier(.22,1,.36,1) both; }
  .nav-link{position:relative}
  .nav-link::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:2px;background:#4e65be;border-radius:2px;transition:width .25s}
  .nav-link.active::after,.nav-link:hover::after{width:100%}
  .btn-blue:hover  {transform:translateY(-1px);filter:brightness(1.1);box-shadow:0 8px 24px rgba(78,101,190,.35)!important}
  .btn-purp:hover  {transform:translateY(-1px);filter:brightness(1.1)}
  .btn-red:hover   {transform:translateY(-1px);filter:brightness(1.1)}
  .card-hover:hover{transform:translateY(-4px);box-shadow:0 20px 48px rgba(0,0,0,.14)!important}
  .med-row:hover   {background:${dark ? "#334155" : "#F8FAFC"}}
  .tab-btn:hover   {background:rgba(78,101,190,.08)!important}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:300;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
  .social-btn:hover { transform:translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.15)!important; }
  .auth-input:focus { border-color: #4e65be !important; box-shadow: 0 0 0 3px rgba(78,101,190,.12); }
  .role-card:hover { border-color: #4e65be !important; transform: translateY(-2px); }
  .role-card.selected { border-color: #4e65be !important; background: rgba(78,101,190,.06) !important; }
  @media print{.no-print{display:none!important}body{background:white!important;color:black!important}}
`;

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
    const on = () => setOffline(false); const off = () => setOffline(true);
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
      {toasts.map(t => {
        const colors = { success: ["#ECFDF5", "#6EE7B7", "#16A34A"], warning: ["#FEF3C7", "#FCD34D", "#D97706"], info: ["#EBF4FF", "#93C5FD", "#3B82F6"], error: ["#FEE2E2", "#FCA5A5", "#EF4444"] };
        const [bg, border] = colors[t.type] || colors.info;
        return (
          <div key={t.id} className={t.leaving ? "toast-out" : "toast-in"} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 14, padding: "14px 18px", minWidth: 280, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 8px 28px rgba(0,0,0,.15)" }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
            <div><div style={{ fontWeight: 700, fontSize: 14, color: "#1E2A5A" }}>{t.title}</div><div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{t.msg}</div></div>
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// AUTH PAGE — LOGIN / SIGNUP
// ══════════════════════════════════════════════════════
function AuthPage({ onLogin, dark, setDark }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [step, setStep] = useState(1); // signup steps
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    // common
    email: "", password: "", confirmPassword: "",
    // signup basics
    firstName: "", lastName: "", phone: "", dob: "", gender: "",
    role: "", // "patient" | "guardian"
    // patient specific
    bloodGroup: "", weight: "", height: "", conditions: "", allergies: "",
    emergencyName: "", emergencyPhone: "", emergencyRelation: "",
    // guardian specific
    guardianRelation: "", patientName: "", patientDob: "", patientConditions: "",
    agreeTerms: false, agreeHealth: false,
  });

  const up = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })); };

  const validate = () => {
    const e = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.password || form.password.length < 6) e.password = "Min 6 characters";
    if (mode === "signup") {
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
      if (!form.firstName.trim()) e.firstName = "Required";
      if (!form.lastName.trim()) e.lastName = "Required";
      if (!form.phone.trim()) e.phone = "Required";
      if (!form.role) e.role = "Please select your role";
      if (!form.agreeTerms) e.agreeTerms = "You must agree to the terms";
      if (!form.agreeHealth) e.agreeHealth = "You must agree";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (mode === "signup" && step < 3) { nextStep(); return; }
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({
        name: mode === "signup" ? `${form.firstName} ${form.lastName}` : "Arjun Patel",
        email: form.email,
        role: form.role || "patient",
        initials: mode === "signup" ? `${form.firstName[0] || ""}${form.lastName[0] || ""}`.toUpperCase() : "AP",
        bloodGroup: form.bloodGroup || "B+",
        phone: form.phone || "+91 98765 43210",
        dob: form.dob || "1995-08-14",
        conditions: form.conditions || "Diabetes, Hypertension",
        allergies: form.allergies || "Penicillin",
      });
    }, 1400);
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

  const iStyle = {
    width: "100%", padding: "12px 14px",
    border: "1.5px solid #E2E8F0", borderRadius: 10,
    fontSize: 14, outline: "none", background: "#FAFBFC",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: "border-color .2s, box-shadow .2s",
  };
  const lStyle = { fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: .8, display: "block", marginBottom: 5 };
  const errStyle = { fontSize: 11, color: "#EF4444", marginTop: 4 };

  const Err = ({ field }) => errors[field] ? <div style={errStyle}>⚠ {errors[field]}</div> : null;

  const socialBtn = (icon, label, color, bg) => (
    <button className="social-btn" style={{ flex: 1, padding: "11px 8px", borderRadius: 11, background: bg, border: "1.5px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, fontWeight: 700, color, cursor: "pointer", transition: "all .2s", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}
      onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); onLogin({ name: "Social User", email: "social@example.com", role: form.role || "patient", initials: "SU" }); }, 1200); }}>
      <span style={{ fontSize: 18 }}>{icon}</span>{label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Left decorative panel */}
      <div style={{ width: "45%", background: "linear-gradient(145deg, #1E2A5A 0%, #4e65be 50%, #8b64ce 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 50px", position: "relative", overflow: "hidden" }}>
        {/* Floating orbs */}
        <div style={{ position: "absolute", top: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(139,100,206,.25)", animation: "orbFloat 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: -60, right: -60, width: 250, height: 250, borderRadius: "50%", background: "rgba(78,101,190,.2)", animation: "orbFloat 6s ease-in-out infinite 2s" }} />
        <div style={{ position: "absolute", top: "40%", right: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.07)", animation: "orbFloat 10s ease-in-out infinite 1s" }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 40 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, border: "1px solid rgba(255,255,255,.2)" }}>💙</div>
            <span style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: "'Syne', sans-serif" }}>MedGuard AI</span>
          </div>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>
            Your Health,<br />Our Priority
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.75)", lineHeight: 1.75, marginBottom: 40, maxWidth: 320 }}>
            Intelligent medication management, real-time health tracking, and AI-powered advisory — all in one secure platform.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[["💊", "Smart medication reminders that adapt to your schedule"], ["🤖", "AI health advisor available 24/7 for guidance"], ["🛡️", "HIPAA-compliant security for your health data"], ["👨‍👩‍👧", "Family care management for guardians & caregivers"]].map(([icon, text]) => (
              <div key={text} style={{ display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,.8)", lineHeight: 1.6, paddingTop: 9 }}>{text}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 48, padding: "18px 24px", background: "rgba(255,255,255,.08)", borderRadius: 16, border: "1px solid rgba(255,255,255,.12)", backdropFilter: "blur(8px)" }}>
            <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
              {[["50K+", "Users"], ["98%", "Adherence"], ["4.9★", "Rating"]].map(([v, l]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{v}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Auth form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", padding: "40px 24px", overflowY: "auto" }}>
        <div className="auth-card" style={{ width: "100%", maxWidth: 500 }}>
          {/* Mode toggle */}
          <div style={{ display: "flex", background: "#E2E8F0", borderRadius: 14, padding: 4, marginBottom: 28 }}>
            {[["login", "Sign In"], ["signup", "Create Account"]].map(([m, l]) => (
              <button key={m} onClick={() => { setMode(m); setStep(1); setErrors({}); }} style={{ flex: 1, padding: "10px", borderRadius: 11, background: mode === m ? "#fff" : "transparent", color: mode === m ? "#1E2A5A" : "#64748B", fontWeight: mode === m ? 700 : 500, fontSize: 14, border: "none", transition: "all .2s", boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,.1)" : "none" }}>{l}</button>
            ))}
          </div>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: "#1E2A5A", fontFamily: "'Syne', sans-serif", marginBottom: 6 }}>
              {mode === "login" ? "Welcome Back 👋" : step === 1 ? "Create Your Account" : step === 2 ? "Health Profile" : "Final Details"}
            </h2>
            <p style={{ fontSize: 14, color: "#64748B" }}>
              {mode === "login" ? "Sign in to access your MedGuard portal" : step === 1 ? "Let's get you set up — it only takes 2 minutes" : step === 2 ? "Help us personalize your experience" : "Almost done! A few more details"}
            </p>
            {mode === "signup" && (
              <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
                {[1, 2, 3].map(s => (
                  <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? "#4e65be" : "#E2E8F0", transition: "background .3s" }} />
                ))}
              </div>
            )}
          </div>

          {/* ── LOGIN FORM ── */}
          {mode === "login" && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={lStyle}>Email Address</label>
                <input className="auth-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => up("email", e.target.value)} style={iStyle} />
                <Err field="email" />
              </div>
              <div style={{ marginBottom: 8, position: "relative" }}>
                <label style={lStyle}>Password</label>
                <input className="auth-input" type={showPass ? "text" : "password"} placeholder="Enter your password" value={form.password} onChange={e => up("password", e.target.value)} style={{ ...iStyle, paddingRight: 44 }} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: 35, background: "none", border: "none", color: "#94A3B8", fontSize: 16 }}>{showPass ? "🙈" : "👁️"}</button>
                <Err field="password" />
              </div>
              <div style={{ textAlign: "right", marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: "#4e65be", fontWeight: 600, cursor: "pointer" }}>Forgot password?</span>
              </div>
              <button onClick={handleSubmit} className="btn-blue" disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: 12, background: loading ? "#94A3B8" : "#4e65be", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", transition: "all .2s", marginBottom: 18 }}>
                {loading ? "⏳ Signing In…" : "🔐 Sign In"}
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
                <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>OR CONTINUE WITH</span>
                <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                {socialBtn("🔵", "Google", "#4285F4", "#fff")}
                {socialBtn("📘", "Facebook", "#1877F2", "#fff")}
                {socialBtn("📸", "Instagram", "#C13584", "#fff")}
              </div>
              <div style={{ background: "#FEF3C7", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#92400E", display: "flex", gap: 8 }}>
                <span>🔒</span><span>Your health data is encrypted and HIPAA-compliant. We never share your information.</span>
              </div>
            </div>
          )}

          {/* ── SIGNUP STEP 1: Account + Role ── */}
          {mode === "signup" && step === 1 && (
            <div>
              {/* Role Selection */}
              <div style={{ marginBottom: 20 }}>
                <label style={lStyle}>I am registering as *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["patient", "👤", "Patient", "I manage my own medications"], ["guardian", "👥", "Guardian / Caregiver", "I manage care for a loved one"]].map(([val, icon, title, desc]) => (
                    <div key={val} className={`role-card ${form.role === val ? "selected" : ""}`} onClick={() => up("role", val)}
                      style={{ padding: "14px 12px", borderRadius: 12, border: `2px solid ${form.role === val ? "#4e65be" : "#E2E8F0"}`, background: form.role === val ? "rgba(78,101,190,.06)" : "#fff", cursor: "pointer", transition: "all .2s", textAlign: "center" }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1E2A5A", marginBottom: 3 }}>{title}</div>
                      <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.4 }}>{desc}</div>
                    </div>
                  ))}
                </div>
                <Err field="role" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={lStyle}>First Name *</label>
                  <input className="auth-input" placeholder="Arjun" value={form.firstName} onChange={e => up("firstName", e.target.value)} style={iStyle} />
                  <Err field="firstName" />
                </div>
                <div>
                  <label style={lStyle}>Last Name *</label>
                  <input className="auth-input" placeholder="Patel" value={form.lastName} onChange={e => up("lastName", e.target.value)} style={iStyle} />
                  <Err field="lastName" />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lStyle}>Email Address *</label>
                <input className="auth-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => up("email", e.target.value)} style={iStyle} />
                <Err field="email" />
              </div>
              <div style={{ marginBottom: 12, position: "relative" }}>
                <label style={lStyle}>Password *</label>
                <input className="auth-input" type={showPass ? "text" : "password"} placeholder="Min 6 characters" value={form.password} onChange={e => up("password", e.target.value)} style={{ ...iStyle, paddingRight: 44 }} />
                <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: 35, background: "none", border: "none", color: "#94A3B8", fontSize: 16 }}>{showPass ? "🙈" : "👁️"}</button>
                <Err field="password" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={lStyle}>Confirm Password *</label>
                <input className="auth-input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => up("confirmPassword", e.target.value)} style={iStyle} />
                <Err field="confirmPassword" />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
                <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>OR SIGN UP WITH</span>
                <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                {socialBtn("🔵", "Google", "#4285F4", "#fff")}
                {socialBtn("📘", "Facebook", "#1877F2", "#fff")}
                {socialBtn("📸", "Instagram", "#C13584", "#fff")}
              </div>
              <button onClick={nextStep} className="btn-blue" style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#4e65be", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", transition: "all .2s" }}>
                Continue → Step 2 of 3
              </button>
            </div>
          )}

          {/* ── SIGNUP STEP 2: Health Info ── */}
          {mode === "signup" && step === 2 && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={lStyle}>Phone Number *</label>
                  <input className="auth-input" placeholder="+91 98765 43210" value={form.phone} onChange={e => up("phone", e.target.value)} style={iStyle} />
                  <Err field="phone" />
                </div>
                <div>
                  <label style={lStyle}>Date of Birth</label>
                  <input className="auth-input" type="date" value={form.dob} onChange={e => up("dob", e.target.value)} style={iStyle} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={lStyle}>Gender</label>
                  <select value={form.gender} onChange={e => up("gender", e.target.value)} style={{ ...iStyle, background: "#fff" }}>
                    <option value="">Select…</option>
                    {["Male", "Female", "Non-binary", "Prefer not to say"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lStyle}>Blood Group</label>
                  <select value={form.bloodGroup} onChange={e => up("bloodGroup", e.target.value)} style={{ ...iStyle, background: "#fff" }}>
                    <option value="">Select…</option>
                    {["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={lStyle}>Weight (kg)</label>
                  <input className="auth-input" type="number" placeholder="e.g. 72" value={form.weight} onChange={e => up("weight", e.target.value)} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Height (cm)</label>
                  <input className="auth-input" type="number" placeholder="e.g. 170" value={form.height} onChange={e => up("height", e.target.value)} style={iStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lStyle}>Existing Health Conditions</label>
                <input className="auth-input" placeholder="e.g. Diabetes, Hypertension, Asthma…" value={form.conditions} onChange={e => up("conditions", e.target.value)} style={iStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={lStyle}>Known Allergies</label>
                <input className="auth-input" placeholder="e.g. Penicillin, Sulfa, Latex…" value={form.allergies} onChange={e => up("allergies", e.target.value)} style={iStyle} />
              </div>
              {form.role === "guardian" && (
                <div style={{ padding: "14px", background: "#F5F0FF", borderRadius: 12, marginBottom: 16, border: "1px solid #DDD6FE" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#8b64ce", marginBottom: 10, textTransform: "uppercase", letterSpacing: .8 }}>👥 Patient You're Caring For</div>
                  <input className="auth-input" placeholder="Patient's Full Name" value={form.patientName} onChange={e => up("patientName", e.target.value)} style={{ ...iStyle, marginBottom: 8 }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <input className="auth-input" type="date" value={form.patientDob} onChange={e => up("patientDob", e.target.value)} style={iStyle} />
                    <input className="auth-input" placeholder="Your relation (e.g. Son)" value={form.guardianRelation} onChange={e => up("guardianRelation", e.target.value)} style={iStyle} />
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: "13px", borderRadius: 12, background: "#F1F5F9", color: "#64748B", fontWeight: 700, fontSize: 14, border: "none" }}>← Back</button>
                <button onClick={nextStep} className="btn-blue" style={{ flex: 2, padding: "13px", borderRadius: 12, background: "#4e65be", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", transition: "all .2s" }}>Continue → Step 3 of 3</button>
              </div>
            </div>
          )}

          {/* ── SIGNUP STEP 3: Emergency + Consent ── */}
          {mode === "signup" && step === 3 && (
            <div>
              <div style={{ padding: "14px", background: "#FEE2E2", borderRadius: 12, marginBottom: 16, border: "1px solid #FECACA" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", marginBottom: 10, textTransform: "uppercase", letterSpacing: .8 }}>🆘 Emergency Contact</div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ ...lStyle, color: "#EF4444" }}>Emergency Contact Name *</label>
                  <input className="auth-input" placeholder="e.g. Priya Patel" value={form.emergencyName} onChange={e => up("emergencyName", e.target.value)} style={iStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ ...lStyle, color: "#EF4444" }}>Phone</label>
                    <input className="auth-input" placeholder="+91 98765 11111" value={form.emergencyPhone} onChange={e => up("emergencyPhone", e.target.value)} style={iStyle} />
                  </div>
                  <div>
                    <label style={{ ...lStyle, color: "#EF4444" }}>Relation</label>
                    <input className="auth-input" placeholder="e.g. Spouse, Parent…" value={form.emergencyRelation} onChange={e => up("emergencyRelation", e.target.value)} style={iStyle} />
                  </div>
                </div>
              </div>

              {/* Summary card */}
              <div style={{ padding: "14px", background: "#ECFDF5", borderRadius: 12, marginBottom: 16, border: "1px solid #BBF7D0" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", marginBottom: 10, textTransform: "uppercase", letterSpacing: .8 }}>📋 Account Summary</div>
                {[["Name", `${form.firstName} ${form.lastName}`], ["Email", form.email], ["Role", form.role === "guardian" ? "Guardian / Caregiver" : "Patient"], ["Phone", form.phone || "—"], ["Blood Group", form.bloodGroup || "—"], ["Conditions", form.conditions || "—"]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px dashed #BBF7D0" }}>
                    <span style={{ color: "#64748B", fontWeight: 600 }}>{l}</span>
                    <span style={{ color: "#1E2A5A", fontWeight: 700, maxWidth: "60%", textAlign: "right" }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Consent checkboxes */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.agreeTerms} onChange={e => up("agreeTerms", e.target.checked)} style={{ marginTop: 3, accentColor: "#4e65be", width: 16, height: 16 }} />
                  <span style={{ fontSize: 13, color: "#4A5568", lineHeight: 1.5 }}>I agree to the <span style={{ color: "#4e65be", fontWeight: 600 }}>Terms of Service</span> and <span style={{ color: "#4e65be", fontWeight: 600 }}>Privacy Policy</span> *</span>
                </label>
                <Err field="agreeTerms" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.agreeHealth} onChange={e => up("agreeHealth", e.target.checked)} style={{ marginTop: 3, accentColor: "#4e65be", width: 16, height: 16 }} />
                  <span style={{ fontSize: 13, color: "#4A5568", lineHeight: 1.5 }}>I understand this app provides health information support and is <strong>not a substitute for professional medical advice</strong> *</span>
                </label>
                <Err field="agreeHealth" />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: "13px", borderRadius: 12, background: "#F1F5F9", color: "#64748B", fontWeight: 700, fontSize: 14, border: "none" }}>← Back</button>
                <button onClick={handleSubmit} disabled={loading} className="btn-blue" style={{ flex: 2, padding: "13px", borderRadius: 12, background: loading ? "#94A3B8" : "#4e65be", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", transition: "all .2s" }}>
                  {loading ? "⏳ Creating Account…" : "🚀 Create My Account"}
                </button>
              </div>
            </div>
          )}

          <p style={{ textAlign: "center", fontSize: 13, color: "#94A3B8", marginTop: 20 }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setStep(1); setErrors({}); }} style={{ color: "#4e65be", fontWeight: 700, cursor: "pointer" }}>
              {mode === "login" ? "Sign Up Free" : "Sign In"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── SMALL SHARED COMPONENTS ────────────────────────────
function AdherenceRing({ pct, size = 110 }) {
  const r = 42, circ = 2 * Math.PI * r, offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? "#22C55E" : pct >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dashoffset 1s ease" }} />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="900" fill="white">{pct}%</text>
    </svg>
  );
}

function HealthScoreRing({ score, size = 90 }) {
  const r = 38, circ = 2 * Math.PI * r, offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#E2E8F0" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 1.2s ease" }} />
        <text x="50" y="48" textAnchor="middle" fontSize="18" fontWeight="900" fill={color}>{score}</text>
        <text x="50" y="63" textAnchor="middle" fontSize="10" fill="#94A3B8">/ 100</text>
      </svg>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginTop: 4 }}>{score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Attention"}</div>
    </div>
  );
}

function OfflineBanner() {
  return (
    <div style={{ background: "#FEF3C7", borderBottom: "1px solid #FCD34D", padding: "10px 48px", display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#92400E" }}>
      <span>📵</span><span>You're offline — AI features unavailable until you reconnect.</span>
    </div>
  );
}

function Modal({ onClose, children, wide }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-wrap" style={{ background: "#FFFFFF", borderRadius: 22, padding: "32px", width: wide ? 740 : 520, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.2)", position: "relative" }}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ icon, title, sub, onClose }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EBF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{icon}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#1E2A5A" }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
      <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", background: "#F1F5F9", border: "none", fontSize: 18, color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
    </div>
  );
}

const iStyle = { width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFBFC", fontFamily: "'Plus Jakarta Sans', sans-serif" };
const lStyle = { fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: .8, display: "block", marginBottom: 6 };

// ── ADD MEDICATION MODAL ──────────────────────────────
function AddMedModal({ onClose, onAdd, knownAllergies = [] }) {
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "Once daily", time: "08:00", purpose: "", refill: "", notes: "" });
  const [allergyAlert, setAllergyAlert] = useState(null);
  const up = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (k === "name") {
      const match = knownAllergies.find(a => v.toLowerCase().includes(a.toLowerCase()));
      setAllergyAlert(match ? `⚠️ ALLERGY ALERT — "${match}" detected!` : null);
    }
  };
  return (
    <Modal onClose={onClose}>
      <ModalHeader icon="💊" title="Add Medication" sub="Fill in your medication details" onClose={onClose} />
      {allergyAlert && <div style={{ background: "#FEE2E2", border: "2px solid #EF4444", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#991B1B", fontWeight: 700, fontSize: 14 }}>🚨 {allergyAlert}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div style={{ marginBottom: 14, gridColumn: "1/-1" }}>
          <label style={lStyle}>Medicine Name *</label>
          <input placeholder="e.g. Metformin" value={form.name} onChange={e => up("name", e.target.value)} style={iStyle} />
        </div>
        <div style={{ marginBottom: 14 }}><label style={lStyle}>Dosage *</label><input placeholder="e.g. 500mg" value={form.dosage} onChange={e => up("dosage", e.target.value)} style={iStyle} /></div>
        <div style={{ marginBottom: 14 }}>
          <label style={lStyle}>Frequency *</label>
          <select value={form.frequency} onChange={e => up("frequency", e.target.value)} style={{ ...iStyle, background: "#fff" }}>
            {["Once daily", "Twice daily", "Three times daily", "Every 8 hours", "Weekly", "As needed"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}><label style={lStyle}>Reminder Time *</label><input type="time" value={form.time} onChange={e => up("time", e.target.value)} style={iStyle} /></div>
        <div style={{ marginBottom: 14 }}><label style={lStyle}>Purpose</label><input placeholder="e.g. Diabetes" value={form.purpose} onChange={e => up("purpose", e.target.value)} style={iStyle} /></div>
        <div style={{ marginBottom: 14 }}><label style={lStyle}>Refill Date</label><input type="date" value={form.refill} onChange={e => up("refill", e.target.value)} style={iStyle} /></div>
        <div style={{ marginBottom: 20, gridColumn: "1/-1" }}><label style={lStyle}>Notes</label><input placeholder="Take with food…" value={form.notes} onChange={e => up("notes", e.target.value)} style={iStyle} /></div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: 11, background: "#F1F5F9", color: "#64748B", fontWeight: 700, fontSize: 14, border: "none" }}>Cancel</button>
        <button onClick={() => { if (!form.name || !form.dosage) return; onAdd(form); onClose(); }} className="btn-blue" style={{ flex: 2, padding: "13px", borderRadius: 11, background: "#4e65be", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", transition: "all .2s" }}>✅ Add Medication</button>
      </div>
    </Modal>
  );
}

function DrugInteractionModal({ onClose }) {
  const [drug1, setDrug1] = useState(""); const [drug2, setDrug2] = useState(""); const [result, setResult] = useState(null); const [checked, setChecked] = useState(false);
  const check = () => { if (!drug1.trim() || !drug2.trim()) return; const found = checkInteraction(drug1, drug2); setResult(found || null); setChecked(true); };
  const sevColor = { HIGH: ["#FEE2E2", "#EF4444", "#991B1B"], MEDIUM: ["#FEF3C7", "#F59E0B", "#92400E"], LOW: ["#ECFDF5", "#22C55E", "#166534"] };
  return (
    <Modal onClose={onClose}>
      <ModalHeader icon="⚗️" title="Drug Interaction Checker" sub="Check if two medications are safe together" onClose={onClose} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div><label style={lStyle}>Drug / Food 1</label><input placeholder="e.g. Warfarin" value={drug1} onChange={e => { setDrug1(e.target.value); setChecked(false); }} style={iStyle} onKeyDown={e => e.key === "Enter" && check()} /></div>
        <div><label style={lStyle}>Drug / Food 2</label><input placeholder="e.g. Aspirin" value={drug2} onChange={e => { setDrug2(e.target.value); setChecked(false); }} style={iStyle} onKeyDown={e => e.key === "Enter" && check()} /></div>
      </div>
      <button onClick={check} className="btn-blue" style={{ width: "100%", padding: "13px", borderRadius: 11, background: "#4e65be", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", marginBottom: 20, transition: "all .2s" }}>🔍 Check Interaction</button>
      {checked && (result ? (() => {
        const [bg, border, tc] = sevColor[result.severity] || sevColor.LOW;
        return <div style={{ background: bg, border: `2px solid ${border}`, borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}><span style={{ fontSize: 28 }}>{result.severity === "HIGH" ? "🚨" : "⚠️"}</span><div><div style={{ fontWeight: 800, fontSize: 16, color: tc }}>{result.severity} SEVERITY</div><div style={{ fontSize: 13, color: tc, opacity: .8 }}>{drug1} + {drug2}</div></div></div>
          <p style={{ fontSize: 14, color: tc, lineHeight: 1.7 }}>{result.effect}</p>
        </div>;
      })() : <div style={{ background: "#ECFDF5", border: "2px solid #22C55E", borderRadius: 14, padding: "20px 22px", display: "flex", gap: 12, alignItems: "center" }}><span style={{ fontSize: 36 }}>✅</span><div><div style={{ fontWeight: 800, fontSize: 16, color: "#166534" }}>No Known Interaction Found</div><div style={{ fontSize: 14, color: "#166534", opacity: .8, marginTop: 4 }}>Always confirm with your pharmacist.</div></div></div>)}
    </Modal>
  );
}

function EmergencySOSModal({ onClose }) {
  const [calling, setCalling] = useState(false);
  return (
    <div className="overlay">
      <div className="modal-wrap" style={{ background: "#fff", borderRadius: 22, padding: "32px", width: 480, maxWidth: "95vw", boxShadow: "0 24px 64px rgba(239,68,68,.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#EF4444", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, animation: "sosPulse 1.5s infinite, heartbeat 1.5s infinite" }}>🆘</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#EF4444", marginBottom: 4 }}>Emergency SOS Activated</h2>
          <p style={{ fontSize: 13, color: "#64748B" }}>Your location has been shared with emergency contacts.</p>
        </div>
        <button onClick={() => { setCalling(true); setTimeout(() => setCalling(false), 3000); }} className="btn-red" style={{ width: "100%", padding: "15px", borderRadius: 13, background: calling ? "#DC2626" : "#EF4444", color: "#fff", fontSize: 17, fontWeight: 900, border: "none", marginBottom: 18, transition: "all .2s", boxShadow: "0 6px 20px rgba(239,68,68,.4)" }}>
          {calling ? "📞 Connecting to 112…" : "📞 Call Emergency (112)"}
        </button>
        <button onClick={onClose} style={{ width: "100%", padding: "12px", borderRadius: 11, background: "#F1F5F9", color: "#64748B", fontWeight: 700, fontSize: 14, border: "none" }}>✕ Close SOS</button>
      </div>
    </div>
  );
}

function SymptomLoggerModal({ onClose, meds }) {
  const SYMPTOMS = ["Headache", "Dizziness", "Nausea", "Fatigue", "Vomiting", "Chest Pain", "Shortness of Breath", "Rash", "Dry Mouth", "Blurred Vision", "Muscle Pain", "Insomnia", "Anxiety", "Palpitations"];
  const [selected, setSelected] = useState([]);
  const [severity, setSeverity] = useState(5);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const toggle = (s) => setSelected(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const analyze = async () => {
    if (!selected.length) return;
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 600, system: "You are MedGuard AI. Analyze reported symptoms against a patient's medication list. Be concise, use bullet points, end with whether to consult a doctor. Under 150 words.", messages: [{ role: "user", content: `Medications: ${meds.map(m => m.name).join(", ")}. Symptoms: ${selected.join(", ")}. Severity: ${severity}/10.` }] })
      });
      const data = await res.json();
      setResult(data.content?.[0]?.text || "Analysis complete. Please consult your doctor.");
    } catch { setResult("⚠️ Could not connect to AI. Please consult your doctor."); }
    finally { setLoading(false); }
  };
  return (
    <Modal onClose={onClose} wide>
      <ModalHeader icon="📋" title="Symptom Logger" sub="Log symptoms and get AI analysis" onClose={onClose} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <label style={lStyle}>Select Symptoms</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {SYMPTOMS.map(s => <button key={s} onClick={() => toggle(s)} style={{ padding: "7px 14px", borderRadius: 100, border: `1.5px solid ${selected.includes(s) ? "#EF4444" : "#E2E8F0"}`, background: selected.includes(s) ? "#FEE2E2" : "#F8FAFC", color: selected.includes(s) ? "#DC2626" : "#4A5568", fontSize: 13, fontWeight: selected.includes(s) ? 700 : 500, cursor: "pointer", transition: "all .15s" }}>{s}</button>)}
          </div>
          <label style={lStyle}>Severity (1–10): <strong style={{ color: "#EF4444" }}>{severity}</strong></label>
          <input type="range" min={1} max={10} value={severity} onChange={e => setSeverity(+e.target.value)} style={{ width: "100%", accentColor: "#EF4444", marginBottom: 16 }} />
          <button onClick={analyze} disabled={!selected.length || loading} className="btn-blue" style={{ width: "100%", padding: "12px", borderRadius: 11, background: selected.length && !loading ? "#4e65be" : "#94A3B8", color: "#fff", fontWeight: 700, fontSize: 14, border: "none" }}>
            {loading ? "🤖 Analyzing…" : "🔬 Analyze with AI"}
          </button>
        </div>
        <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 14, padding: "20px", minHeight: 200, display: "flex", flexDirection: "column", justifyContent: result ? "flex-start" : "center", alignItems: result ? "flex-start" : "center" }}>
          {result ? <><div style={{ fontWeight: 700, color: "#1E2A5A", marginBottom: 10 }}>🤖 AI Analysis</div><div style={{ fontSize: 14, color: "#374151", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{result}</div></> : <div style={{ textAlign: "center", color: "#94A3B8" }}><div style={{ fontSize: 40, marginBottom: 10 }}>🔬</div><div style={{ fontWeight: 600 }}>Select symptoms and click Analyze</div></div>}
        </div>
      </div>
    </Modal>
  );
}

function MoodWidget({ dark }) {
  const moods = [{ e: "😢", l: "Terrible", c: "#EF4444" }, { e: "😕", l: "Bad", c: "#F59E0B" }, { e: "😐", l: "Okay", c: "#94A3B8" }, { e: "🙂", l: "Good", c: "#22C55E" }, { e: "😄", l: "Great!", c: "#10B981" }];
  const [selected, setSelected] = useState(null);
  const C = COLORS[dark ? "dark" : "light"];
  return (
    <div style={{ background: C.card, borderRadius: 16, padding: "18px 20px", border: `1px solid ${C.border}`, marginBottom: 16 }}>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 14, fontSize: 14 }}>😊 How are you feeling today?</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "space-around" }}>
        {moods.map((m, i) => <button key={i} onClick={() => setSelected(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 8px", borderRadius: 12, border: `2px solid ${selected === i ? m.c : C.border}`, background: selected === i ? m.c + "18" : C.surface, cursor: "pointer", flex: 1, transition: "all .2s" }}><span style={{ fontSize: 26 }}>{m.e}</span><span style={{ fontSize: 10, fontWeight: 700, color: selected === i ? m.c : C.textSoft }}>{m.l}</span></button>)}
      </div>
      {selected !== null && <div style={{ textAlign: "center", fontSize: 13, color: moods[selected].c, fontWeight: 700, marginTop: 10 }}>Mood logged! ✓</div>}
    </div>
  );
}

function MedTimeline({ dark }) {
  const C = COLORS[dark ? "dark" : "light"];
  const days = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 29 + i); return { label: d.getDate(), missed: Math.random() < .1, taken: Math.random() > .05 }; });
  return (
    <div style={{ background: C.card, borderRadius: 16, padding: "18px 20px", border: `1px solid ${C.border}` }}>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 14 }}>📅 30-Day Adherence Timeline</div>
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {days.map((d, i) => <div key={i} title={`Day ${d.label}`} style={{ width: 28, height: 28, borderRadius: 6, background: d.missed ? "#FEE2E2" : d.taken ? "#ECFDF5" : C.border, border: `1.5px solid ${d.missed ? "#FCA5A5" : d.taken ? "#86EFAC" : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 9, fontWeight: 700, color: d.missed ? "#EF4444" : d.taken ? "#16A34A" : C.textSoft }}>{d.label}</span></div>)}
      </div>
    </div>
  );
}

function printReport(meds, streak, adherencePct, user) {
  const w = window.open("", "_blank", "width=800,height=600");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>MedGuard AI — Weekly Report</title><style>body{font-family:system-ui,sans-serif;padding:40px;color:#1E2A5A;max-width:700px;margin:0 auto}h1{color:#4e65be}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#4e65be;color:white;padding:10px 14px;text-align:left}td{padding:10px 14px;border-bottom:1px solid #E2E8F0}.stat{background:#EBF4FF;border-radius:12px;padding:16px;text-align:center;display:inline-block;margin:8px;min-width:130px}.stat-val{font-size:28px;font-weight:900;color:#4e65be}</style></head><body><h1>💙 MedGuard AI — Weekly Report</h1><p>Patient: ${user?.name || "—"} · ${new Date().toLocaleDateString()}</p><div><div class="stat"><div class="stat-val">${adherencePct}%</div><div>Adherence</div></div><div class="stat"><div class="stat-val">${streak}</div><div>Streak 🔥</div></div><div class="stat"><div class="stat-val">${meds.length}</div><div>Active Meds</div></div></div><table><tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Status</th></tr>${meds.map(m => `<tr><td>${m.name}</td><td>${m.dosage}</td><td>${m.frequency}</td><td>${m.status === "taken" ? "✓ Taken" : "Pending"}</td></tr>`).join("")}</table></body></html>`);
  w.document.close(); w.print();
}

function AIChatTab({ dark, user }) {
  const C = COLORS[dark ? "dark" : "light"];
  const [history, setHistory] = useState([{ from: "ai", text: `Hello ${user?.name?.split(" ")[0] || "there"}! 👋 I'm your MedGuard AI assistant. I can help with medication info, drug interactions, symptom guidance, and health advice. What can I help you with today?` }]);
  const [msg, setMsg] = useState(""); const [loading, setLoading] = useState(false);
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
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: `You are MedGuard AI, a friendly health assistant for ${user?.name || "the patient"}. Help with medication info, drug interactions, symptom guidance. Be warm, concise (under 120 words), use occasional emojis. End medical responses with: "Please consult your doctor for personalized advice."`, messages }) });
      const data = await res.json();
      setHistory(h => [...h, { from: "ai", text: data.content?.[0]?.text || "I'm having trouble connecting. Please try again." }]);
    } catch { setHistory(h => [...h, { from: "ai", text: "⚠️ Connection error. Please check your network." }]); }
    finally { setLoading(false); }
  };
  const suggested = ["What are the side effects of Metformin?", "Can I take ibuprofen with Lisinopril?", "What foods should I avoid with blood thinners?", "Is 90% medication adherence good?"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
      <div style={{ background: C.card, borderRadius: 20, padding: "24px", border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: 620 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#4e65be,#8b64ce)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🤖</div>
          <div><div style={{ fontWeight: 700, color: C.text }}>MedGuard AI Assistant</div><div style={{ fontSize: 12, color: "#22C55E" }}>● Online · Powered by Claude AI</div></div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {history.map((m, i) => <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
            {m.from === "ai" && <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#4e65be,#8b64ce)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>}
            <div style={{ maxWidth: "78%", padding: "12px 16px", borderRadius: m.from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.from === "user" ? "#4e65be" : C.surface, color: m.from === "user" ? "#fff" : C.text, fontSize: 14, lineHeight: 1.7, border: m.from === "ai" ? `1px solid ${C.border}` : "none", whiteSpace: "pre-wrap" }}>{m.text}</div>
          </div>)}
          {loading && <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}><div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#4e65be,#8b64ce)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div><div style={{ padding: "14px 18px", borderRadius: "18px 18px 18px 4px", background: C.surface, border: `1px solid ${C.border}`, display: "flex", gap: 5 }}><div className="dot1" style={{ width: 8, height: 8, borderRadius: "50%", background: "#94A3B8" }} /><div className="dot2" style={{ width: 8, height: 8, borderRadius: "50%", background: "#94A3B8" }} /><div className="dot3" style={{ width: 8, height: 8, borderRadius: "50%", background: "#94A3B8" }} /></div></div>}
          <div ref={bottomRef} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={listening ? stop : start} style={{ padding: "13px 14px", borderRadius: 12, background: listening ? "#FEE2E2" : "#F1F5F9", border: `1.5px solid ${listening ? "#EF4444" : C.border}`, fontSize: 18, cursor: "pointer" }}>{listening ? "🔴" : "🎤"}</button>
          <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Ask about medications, symptoms…" style={{ flex: 1, padding: "13px 16px", border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 14, outline: "none", background: C.inputBg, color: C.text }} />
          <button onClick={send} disabled={loading} className="btn-blue" style={{ padding: "13px 20px", borderRadius: 12, background: loading ? "#94A3B8" : "#4e65be", color: "#fff", fontWeight: 700, fontSize: 14, border: "none" }}>Send ➤</button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: C.card, borderRadius: 16, padding: "18px", border: `1px solid ${C.border}` }}>
          <div style={{ fontWeight: 700, color: C.text, marginBottom: 12, fontSize: 14 }}>💡 Suggested Questions</div>
          {suggested.map(q => <button key={q} onClick={() => setMsg(q)} style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, fontSize: 13, color: C.textMid, cursor: "pointer", marginBottom: 8, lineHeight: 1.45 }}>{q}</button>)}
        </div>
        <div style={{ background: "linear-gradient(135deg,#4e65be,#8b64ce)", borderRadius: 16, padding: "18px", color: "#fff" }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>⚠️ Medical Disclaimer</div>
          <p style={{ fontSize: 12, opacity: .85, lineHeight: 1.65 }}>This AI provides general health information only. Always consult your doctor for medical advice.</p>
        </div>
      </div>
    </div>
  );
}

// ── PATIENT PORTAL ────────────────────────────────────
function PatientPortal({ setPage, dark, setDark, lang, setLang, user, onLogout }) {
  const L = T[lang]; const C = COLORS[dark ? "dark" : "light"];
  const { toasts, show } = useToast(); const offline = useOffline();
  const [tab, setTab] = useState("dashboard");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [meds, setMeds] = useState([
    { name: "Metformin", dosage: "500mg", time: "8:00 AM", status: "taken", icon: "💊", frequency: "Twice daily", purpose: "Diabetes management", refill: 5 },
    { name: "Aspirin", dosage: "100mg", time: "2:00 PM", status: "upcoming", icon: "💊", frequency: "Once daily", purpose: "Blood thinner", refill: 12 },
    { name: "Lisinopril", dosage: "10mg", time: "9:00 PM", status: "upcoming", icon: "💊", frequency: "Once daily", purpose: "Blood pressure", refill: 20 },
    { name: "Atorvastatin", dosage: "20mg", time: "10:00 PM", status: "upcoming", icon: "💊", frequency: "Once at night", purpose: "Cholesterol", refill: 3 },
  ]);
  const [streak] = useState(12);
  const knownAllergies = (user?.allergies || "Penicillin").split(",").map(a => a.trim());
  const takenCount = meds.filter(m => m.status === "taken").length;
  const adherencePct = Math.round((takenCount / meds.length) * 100);
  const healthScore = Math.min(100, Math.round(adherencePct * .5 + streak * 2 + 20));
  const refillAlerts = meds.filter(m => m.refill <= 7);
  const markTaken = (idx) => {
    if (meds[idx].status === "taken") return;
    setMeds(p => p.map((m, i) => i === idx ? { ...m, status: "taken" } : m));
    show("💊", "Medication Taken!", `${meds[idx].name} marked as taken ✅`, "success");
  };
  const handleAddMed = (form) => {
    const timeStr = form.time ? new Date(`2000-01-01T${form.time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD";
    setMeds(p => [...p, { name: form.name, dosage: form.dosage, time: timeStr, status: "upcoming", icon: "💊", frequency: form.frequency, purpose: form.purpose || "General", refill: 30 }]);
    show("➕", "Medication Added!", `${form.name} added.`, "info");
  };
  const TABS = ["dashboard", "medications", "ai-advisor", "analytics", "symptoms", "settings"];
  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Toast toasts={toasts} />
      {offline && <OfflineBanner />}
      {showAddModal && <AddMedModal onClose={() => setShowAddModal(false)} onAdd={handleAddMed} knownAllergies={knownAllergies} />}
      {showInteraction && <DrugInteractionModal onClose={() => setShowInteraction(false)} />}
      {showSOS && <EmergencySOSModal onClose={() => setShowSOS(false)} />}
      {showSymptoms && <SymptomLoggerModal onClose={() => setShowSymptoms(false)} meds={meds} />}
      {refillAlerts.length > 0 && <div style={{ background: "#FEF3C7", borderBottom: "1px solid #FCD34D", padding: "10px 40px", display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#92400E", fontWeight: 600 }}><span>⚠️</span><span>Refill soon: {refillAlerts.map(m => `${m.name} (${m.refill}d)`).join(" · ")}</span></div>}
      {/* Topbar */}
      <div style={{ background: C.navBg, borderBottom: `1px solid ${C.border}`, padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 8px rgba(0,0,0,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setPage("home")}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "#4e65be", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>💙</div>
          <span style={{ fontWeight: 800, fontSize: 17, color: "#4e65be" }}>MedGuard AI</span>
          <span style={{ background: C.bg, color: "#4e65be", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 100 }}>Patient</span>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {TABS.map(t => <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{ padding: "7px 12px", borderRadius: 9, background: tab === t ? "#4e65be" : "transparent", color: tab === t ? "#fff" : C.textMid, fontWeight: tab === t ? 700 : 500, fontSize: 12, border: "none", textTransform: "capitalize", transition: "all .2s" }}>{L[t] || t.replace("-", " ")}</button>)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select value={lang} onChange={e => setLang(e.target.value)} style={{ padding: "5px 8px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 12, cursor: "pointer", outline: "none" }}>
            {Object.entries(T).map(([k, v]) => <option key={k} value={k}>{v.langName}</option>)}
          </select>
          <button onClick={() => setDark(d => !d)} style={{ padding: "7px 10px", borderRadius: 9, background: C.surface, border: `1px solid ${C.border}`, cursor: "pointer", fontSize: 15 }}>{dark ? "☀️" : "🌙"}</button>
          <button onClick={() => setShowSOS(true)} style={{ padding: "7px 12px", borderRadius: 9, background: "#FEE2E2", color: "#EF4444", fontWeight: 700, fontSize: 12, border: "1px solid #FECACA", cursor: "pointer" }}>🆘 SOS</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: C.bg, borderRadius: 100, border: `1px solid ${C.border}` }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#4e65be,#8b64ce)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>{user?.initials || "AP"}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{user?.name?.split(" ")[0] || "Patient"}</span>
          </div>
          <button onClick={onLogout} style={{ padding: "7px 14px", borderRadius: 9, background: "#F1F5F9", color: "#64748B", fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer" }}>Sign Out</button>
        </div>
      </div>
      <div style={{ padding: "24px 32px" }}>
        {tab === "dashboard" && (
          <>
            <div style={{ background: "linear-gradient(135deg,#4e65be,#3a52b0)", borderRadius: 20, padding: "24px 32px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 5 }}>{L.goodMorning}, {user?.name?.split(" ")[0] || "there"}! 👋</div>
                <div style={{ fontSize: 14, opacity: .85 }}>{meds.filter(m => m.status === "upcoming").length} medications remaining · Streak: <strong>{streak} days 🔥</strong></div>
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {meds.map((m, i) => <span key={i} style={{ padding: "4px 11px", borderRadius: 100, background: m.status === "taken" ? "rgba(34,197,94,.25)" : "rgba(255,255,255,.15)", border: `1px solid ${m.status === "taken" ? "rgba(34,197,94,.5)" : "rgba(255,255,255,.25)"}`, fontSize: 11, fontWeight: 600 }}>{m.status === "taken" ? "✓ " : ""}{m.name}</span>)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, opacity: .7, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Today's Adherence</div><AdherenceRing pct={adherencePct} size={100} /><div style={{ fontSize: 10, opacity: .7, marginTop: 3 }}>{takenCount}/{meds.length} doses</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, opacity: .7, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Health Score</div><HealthScoreRing score={healthScore} /></div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 }}>
              {[["💊", "Medications", `${takenCount}/${meds.length}`, `${meds.filter(m => m.status === "upcoming").length} remaining`, "#4e65be"], ["🔥", "Streak", `${streak}d`, "days in a row", "#D97706"], ["⚠️", "Interactions", "0", "all clear", "#16A34A"], ["🤖", "AI Insights", "5", "new", "#8b64ce"]].map(([i, l, v, s, c]) => (
                <div key={l} style={{ background: C.card, borderRadius: 14, padding: "16px 18px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{i}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: c }}>{v}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginTop: 1 }}>{l}</div>
                  <div style={{ fontSize: 11, color: C.textSoft }}>{s}</div>
                </div>
              ))}
            </div>
            <MoodWidget dark={dark} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 18, marginBottom: 18 }}>
              <div style={{ background: C.card, borderRadius: 18, padding: "20px 22px", border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Today's Medication Schedule</h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setShowInteraction(true)} style={{ padding: "6px 10px", borderRadius: 8, background: "#FEF3C7", color: "#D97706", fontWeight: 700, fontSize: 11, border: "none", cursor: "pointer" }}>⚗️ Interactions</button>
                    <button onClick={() => setShowAddModal(true)} className="btn-blue" style={{ padding: "6px 12px", borderRadius: 8, background: "#4e65be", color: "#fff", fontWeight: 700, fontSize: 11, border: "none", transition: "all .2s" }}>{L.addMed}</button>
                  </div>
                </div>
                {meds.map((m, i) => <div key={i} className="med-row" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 8px", borderBottom: i < meds.length - 1 ? `1px solid ${C.border}` : "none", borderRadius: 8, transition: "background .15s" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: m.status === "taken" ? "#ECFDF5" : C.bg, border: `1.5px solid ${m.status === "taken" ? "#22C55E" : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{m.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{m.name} {m.dosage}</div>
                    <div style={{ fontSize: 11, color: C.textSoft }}>⏰ {m.time} · {m.frequency}</div>
                    {m.refill <= 7 && <div style={{ fontSize: 10, color: "#D97706", fontWeight: 600 }}>⚠️ Refill in {m.refill} days</div>}
                  </div>
                  {m.status === "taken" ? <div style={{ padding: "5px 12px", borderRadius: 100, background: "#ECFDF5", color: "#16A34A", fontSize: 12, fontWeight: 700 }}>✓ Taken</div> : <button onClick={() => markTaken(i)} className="btn-blue" style={{ padding: "7px 14px", borderRadius: 8, background: "#4e65be", color: "#fff", fontSize: 11, fontWeight: 700, border: "none", transition: "all .2s" }}>{L.markTaken}</button>}
                </div>)}
                <div style={{ marginTop: 14, background: C.bg, borderRadius: 10, padding: "11px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 12, fontWeight: 600, color: C.textMid }}>Daily Progress</span><span style={{ fontSize: 12, fontWeight: 700, color: "#4e65be" }}>{takenCount}/{meds.length}</span></div>
                  <div style={{ height: 8, borderRadius: 8, background: C.border, overflow: "hidden" }}><div style={{ height: "100%", width: `${adherencePct}%`, background: "linear-gradient(90deg,#4e65be,#3a52b0)", borderRadius: 8, transition: "width .7s ease" }} /></div>
                  {takenCount === meds.length && <div style={{ textAlign: "center", marginTop: 9, fontSize: 13, fontWeight: 700, color: "#16A34A" }}>🎉 All medications taken today!</div>}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: "linear-gradient(135deg,#1E2A5A,#3a52b0)", borderRadius: 16, padding: "16px 18px", color: "#fff" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#4e65be,#8b64ce)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🤖</div>
                    <div><div style={{ fontWeight: 700, fontSize: 12 }}>AI Health Insights</div><div style={{ fontSize: 10, opacity: .6 }}>Powered by Claude</div></div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 9, padding: "9px 12px", marginBottom: 8, fontSize: 12, color: "#CBD5E1", lineHeight: 1.6 }}>💡 Blood pressure stable this week. Great consistency!</div>
                  <div style={{ background: "rgba(245,158,11,.15)", borderRadius: 9, padding: "9px 12px", border: "1px solid rgba(245,158,11,.3)", fontSize: 12, color: "#FCD34D", lineHeight: 1.6 }}>⏰ Annual flu vaccine due. Schedule an appointment?</div>
                  <button onClick={() => setTab("ai-advisor")} style={{ width: "100%", marginTop: 10, padding: "8px", borderRadius: 9, background: "#4e65be", color: "#fff", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>💬 Chat with AI →</button>
                </div>
                <div style={{ background: C.card, borderRadius: 16, padding: "14px 16px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>Quick Actions</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {[["➕", "Add Med", () => setShowAddModal(true)], ["⚗️", "Drug Check", () => setShowInteraction(true)], ["🆘", "SOS", () => setShowSOS(true)], ["📋", "Symptoms", () => setShowSymptoms(true)], ["📄", "Report", () => printReport(meds, streak, adherencePct, user)], ["📅", "Appts", () => setShowAppointments(true)]].map(([i, l, fn]) => (
                      <button key={l} onClick={fn} style={{ background: C.bg, borderRadius: 10, padding: "10px 5px", border: `1.5px solid ${l === "SOS" ? "#FCA5A5" : C.border}`, cursor: "pointer", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 19 }}>{i}</span><span style={{ fontSize: 10, fontWeight: 700, color: l === "SOS" ? "#EF4444" : C.textMid }}>{l}</span>
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
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text }}>My Medications</h2>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => printReport(meds, streak, adherencePct, user)} style={{ padding: "9px 16px", borderRadius: 9, background: C.surface, border: `1px solid ${C.border}`, color: C.textMid, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>📄 Report</button>
                <button onClick={() => setShowAddModal(true)} className="btn-blue" style={{ padding: "9px 18px", borderRadius: 9, background: "#4e65be", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", transition: "all .2s" }}>{L.addMed}</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {meds.map((m, i) => {
                const colorMap = [["#ECFDF5", "#16A34A"], ["#EBF4FF", "#4e65be"], ["#FEF3C7", "#D97706"], ["#F5F0FF", "#8b64ce"]];
                const [bg, c] = colorMap[i % colorMap.length];
                return <div key={i} style={{ background: C.card, borderRadius: 16, padding: "18px", border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{m.icon}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: c, background: bg, padding: "3px 9px", borderRadius: 100 }}>Active</span>
                  </div>
                  <div style={{ fontWeight: 700, color: C.text, marginBottom: 2 }}>{m.name} {m.dosage}</div>
                  <div style={{ fontSize: 12, color: C.textMid, marginBottom: 6 }}>🔁 {m.frequency} · {m.purpose}</div>
                  {m.refill <= 7 && <div style={{ fontSize: 11, color: "#D97706", fontWeight: 600, marginBottom: 8 }}>⚠️ Refill in {m.refill} days</div>}
                  <button onClick={() => markTaken(i)} disabled={m.status === "taken"} className={m.status !== "taken" ? "btn-blue" : ""} style={{ width: "100%", padding: "9px", borderRadius: 9, background: m.status === "taken" ? "#ECFDF5" : "#4e65be", color: m.status === "taken" ? "#16A34A" : "#fff", fontWeight: 700, fontSize: 13, border: `1px solid ${m.status === "taken" ? "#6EE7B7" : "transparent"}`, cursor: m.status === "taken" ? "default" : "pointer", transition: "all .2s" }}>
                    {m.status === "taken" ? "✓ Taken Today" : L.markTaken}
                  </button>
                </div>;
              })}
            </div>
          </div>
        )}
        {tab === "ai-advisor" && <AIChatTab dark={dark} user={user} />}
        {tab === "analytics" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
              {[["📅", "This Month", "27/30 doses", "90% adherence"], ["📈", "Best Streak", "14 days", "Personal record!"], ["⭐", "Avg Adherence", "92%", "Last 3 months"]].map(([i, l, v, s]) => (
                <div key={l} style={{ background: C.card, borderRadius: 16, padding: "24px 20px", border: `1px solid ${C.border}`, textAlign: "center" }}>
                  <div style={{ fontSize: 34, marginBottom: 8 }}>{i}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.textSoft, textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#4e65be", margin: "7px 0 3px" }}>{v}</div>
                  <div style={{ fontSize: 12, color: C.textMid }}>{s}</div>
                </div>
              ))}
            </div>
            <div style={{ background: C.card, borderRadius: 18, padding: "22px", border: `1px solid ${C.border}`, marginBottom: 18 }}>
              <h3 style={{ fontWeight: 700, color: C.text, marginBottom: 18 }}>📊 Weekly Adherence — Last 4 Weeks</h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 130 }}>
                {[85, 92, 78, adherencePct].map((v, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: i === 3 ? "#4e65be" : C.textMid }}>{v}%</span>
                    <div style={{ width: "100%", height: `${v}%`, background: i === 3 ? "linear-gradient(180deg,#4e65be,#3a52b0)" : C.border, borderRadius: "7px 7px 0 0", transition: "height .6s ease" }} />
                    <span style={{ fontSize: 11, color: C.textSoft }}>{i === 3 ? "Now" : `Wk ${i + 1}`}</span>
                  </div>
                ))}
              </div>
            </div>
            <MedTimeline dark={dark} />
          </div>
        )}
        {tab === "symptoms" && <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}><div style={{ fontSize: 60, marginBottom: 18 }}>📋</div><h2 style={{ color: C.text, marginBottom: 14 }}>Symptom Logger</h2><p style={{ color: C.textMid, marginBottom: 22, textAlign: "center" }}>Log your symptoms and get AI analysis against your medications.</p><button onClick={() => setShowSymptoms(true)} className="btn-blue" style={{ padding: "13px 28px", borderRadius: 12, background: "#4e65be", color: "#fff", fontWeight: 700, fontSize: 15, border: "none" }}>Open Symptom Logger</button></div>}
        {tab === "settings" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div style={{ background: C.card, borderRadius: 18, padding: "24px", border: `1px solid ${C.border}` }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 18 }}>Account Settings</h3>
              {[["Full Name", user?.name || "—"], ["Email", user?.email || "—"], ["Phone", user?.phone || "—"], ["Date of Birth", user?.dob || "—"], ["Blood Group", user?.bloodGroup || "—"], ["Conditions", user?.conditions || "—"]].map(([l, v]) => (
                <div key={l} style={{ marginBottom: 13 }}>
                  <label style={{ ...lStyle, color: C.textSoft }}>{l}</label>
                  <input defaultValue={v} style={{ ...iStyle, background: C.inputBg, color: C.text, border: `1.5px solid ${C.border}` }} />
                </div>
              ))}
              <button className="btn-blue" style={{ padding: "11px 20px", borderRadius: 10, background: "#4e65be", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", marginTop: 6, transition: "all .2s" }}>Save Changes</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: C.card, borderRadius: 14, padding: "18px", border: `1px solid ${C.border}` }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>Known Allergies</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {knownAllergies.map(a => <span key={a} style={{ padding: "5px 12px", borderRadius: 100, background: "#FEE2E2", color: "#EF4444", fontWeight: 700, fontSize: 12, border: "1px solid #FCA5A5" }}>{a} ✕</span>)}
                </div>
              </div>
              <div style={{ background: C.card, borderRadius: 14, padding: "18px", border: `1px solid ${C.border}` }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>Appearance</h3>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ color: C.textMid, fontSize: 14 }}>Dark Mode</span>
                  <button onClick={() => setDark(d => !d)} style={{ width: 46, height: 25, borderRadius: 13, background: dark ? "#4e65be" : "#E2E8F0", border: "none", cursor: "pointer", position: "relative", transition: "background .3s" }}>
                    <div style={{ width: 19, height: 19, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: dark ? 24 : 3, transition: "left .3s", boxShadow: "0 2px 4px rgba(0,0,0,.2)" }} />
                  </button>
                </div>
              </div>
              <div style={{ background: C.card, borderRadius: 14, padding: "18px", border: `1px solid ${C.border}` }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>Account</h3>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setShowInteraction(true)} style={{ flex: 1, padding: "10px", borderRadius: 9, background: "#FEF3C7", color: "#D97706", fontWeight: 700, fontSize: 12, border: "1px solid #FCD34D", cursor: "pointer" }}>⚗️ Drug Checker</button>
                  <button onClick={onLogout} style={{ flex: 1, padding: "10px", borderRadius: 9, background: "#FEE2E2", color: "#EF4444", fontWeight: 700, fontSize: 12, border: "1px solid #FECACA", cursor: "pointer" }}>🚪 Sign Out</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── GUARDIAN PORTAL ────────────────────────────────────
function GuardianPortal({ setPage, dark, user, onLogout }) {
  const C = COLORS[dark ? "dark" : "light"];
  const [selectedPatient, setSelectedPatient] = useState(0);
  const patients = [
    { initials: "MS", name: "Mary Smith", rel: "Mother", age: 72, color: "#8b64ce", bg: "#F5F0FF", adherence: 94 },
    { initials: "JS", name: "John Smith", rel: "Father", age: 75, color: "#4e65be", bg: "#EBF4FF", adherence: 88 },
    { initials: "RJ", name: "Rose Johnson", rel: "Grandmother", age: 89, color: "#0891B2", bg: "#E0F7FA", adherence: 72 },
  ];
  const p = patients[selectedPatient];
  return (
    <div style={{ minHeight: "100vh", background: "#F5F0FF" }}>
      {/* Topbar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 8px rgba(0,0,0,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setPage("home")}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "#8b64ce", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>💙</div>
          <span style={{ fontWeight: 800, fontSize: 17, color: "#8b64ce" }}>MedGuard AI</span>
          <span style={{ background: "#F5F0FF", color: "#8b64ce", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 100 }}>Guardian</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "#F5F0FF", borderRadius: 100, border: "1px solid #DDD6FE" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#8b64ce,#6D28D9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>{user?.initials || "GU"}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1E2A5A" }}>{user?.name?.split(" ")[0] || "Guardian"}</span>
          </div>
          <button onClick={onLogout} style={{ padding: "7px 14px", borderRadius: 9, background: "#F1F5F9", color: "#64748B", fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer" }}>Sign Out</button>
        </div>
      </div>

      <div style={{ background: "linear-gradient(160deg,#EDE9FE,#DDD6FE)", padding: "40px 60px 32px" }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: "#1E2A5A", marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Guardian Dashboard 👥</h1>
        <p style={{ color: "#4A5568", fontSize: 15 }}>Welcome back, {user?.name?.split(" ")[0] || "Guardian"}. Here's an overview of your loved ones.</p>
      </div>

      <div style={{ padding: "28px 60px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#1E2A5A", marginBottom: 14 }}>Select Patient</div>
          <div style={{ display: "flex", gap: 12 }}>
            {patients.map((pt, i) => (
              <div key={i} onClick={() => setSelectedPatient(i)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderRadius: 14, cursor: "pointer", border: `2px solid ${selectedPatient === i ? "#8b64ce" : "#E2E8F0"}`, background: selectedPatient === i ? "#F5F0FF" : "#fff", transition: "all .2s", minWidth: 180 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: pt.bg, color: pt.color, fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${pt.color}` }}>{pt.initials}</div>
                <div>
                  <div style={{ fontWeight: 700, color: "#1E2A5A", fontSize: 13 }}>{pt.name}</div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>{pt.rel} · {pt.age} yrs</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: pt.adherence >= 85 ? "#16A34A" : pt.adherence >= 70 ? "#D97706" : "#EF4444", marginTop: 2 }}>{pt.adherence}% adherence</div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "13px 18px", borderRadius: 14, border: "2px dashed #E2E8F0", cursor: "pointer", minWidth: 130, color: "#94A3B8", fontWeight: 600, fontSize: 13, gap: 8 }}>＋ Add</div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 18, padding: "22px 26px", marginBottom: 16, border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1E2A5A", marginBottom: 3 }}>{p.name}'s Overview</div>
            <div style={{ fontSize: 13, color: "#64748B" }}>{p.rel} · Age {p.age} · Last active 5 min ago</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ padding: "9px 14px", borderRadius: 9, background: "#ECFDF5", color: "#16A34A", fontWeight: 700, fontSize: 12, border: "1px solid #BBF7D0" }}>✅ All Meds Taken</button>
            <button style={{ padding: "9px 14px", borderRadius: 9, background: "#FEE2E2", color: "#EF4444", fontWeight: 700, fontSize: 12, border: "1px solid #FECACA" }}>🆘 Emergency</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 13, marginBottom: 16 }}>
          {[["💊", "Today's Meds", "3/3", "All taken", "#ECFDF5", "#16A34A"], ["🔥", "Streak", `${7 + selectedPatient * 3}d`, "consecutive", "#FEF3C7", "#D97706"], ["⚠️", "Missed", "2", "last 30 days", "#FEE2E2", "#EF4444"], ["📊", "Adherence", `${p.adherence}%`, "this month", "#EBF4FF", "#4e65be"]].map(([i, l, v, s, bg, c]) => (
            <div key={l} style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1px solid #E2E8F0" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, marginBottom: 8 }}>{i}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: c }}>{v}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1E2A5A", marginTop: 2 }}>{l}</div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{s}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1px solid #E2E8F0" }}>
            <h3 style={{ fontWeight: 700, color: "#1E2A5A", marginBottom: 14 }}>Medication Schedule</h3>
            {[["💊", "Metformin 500mg", "8:00 AM", "taken"], ["💊", "Aspirin 100mg", "2:00 PM", "taken"], ["💊", "Lisinopril 10mg", "9:00 PM", "upcoming"]].map(([i, n, t, s], idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
                <span style={{ fontSize: 18 }}>{i}</span>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, color: "#1E2A5A", fontSize: 13 }}>{n}</div><div style={{ fontSize: 11, color: "#94A3B8" }}>{t}</div></div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, background: s === "taken" ? "#ECFDF5" : "#FEF3C7", color: s === "taken" ? "#16A34A" : "#D97706" }}>{s === "taken" ? "✓ Taken" : "⏳ Upcoming"}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <div style={{ background: "linear-gradient(135deg,#8b64ce,#6D28D9)", borderRadius: 16, padding: "18px 20px", color: "#fff" }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>👥 Guardian Controls</div>
              {["Dosage adjustments", "Medication additions", "Emergency contacts", "Activity updates", "Alert notifications"].map(f => (
                <div key={f} style={{ display: "flex", gap: 10, marginBottom: 7 }}><span style={{ color: "#A5F3D4" }}>✓</span><span style={{ fontSize: 13, opacity: .9 }}>{f}</span></div>
              ))}
            </div>
            <div style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1px solid #E2E8F0" }}>
              <div style={{ fontWeight: 700, color: "#1E2A5A", marginBottom: 10, fontSize: 14 }}>📲 Recent Alerts</div>
              {[["🔔", "Medication reminder sent", "2 min ago"], ["✅", "Aspirin 100mg confirmed taken", "1 hr ago"], ["⚠️", "Lisinopril due at 9:00 PM", "Upcoming"]].map(([i, m, t]) => (
                <div key={m} style={{ display: "flex", gap: 9, padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
                  <span>{i}</span><div style={{ flex: 1 }}><div style={{ fontSize: 12, color: "#1E2A5A" }}>{m}</div><div style={{ fontSize: 10, color: "#94A3B8", marginTop: 1 }}>{t}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NAVBAR ─────────────────────────────────────────────
function Navbar({ page, setPage, activeSection, setActiveSection, dark, setDark, lang, setLang, user, onLogout }) {
  const C = COLORS[dark ? "dark" : "light"];
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: C.navBg, borderBottom: `1px solid ${C.border}`, boxShadow: "0 1px 12px rgba(0,0,0,.06)", padding: "0 48px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setPage("home")}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "#4e65be", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>💙</div>
        <span style={{ fontSize: 19, fontWeight: 800, color: "#4e65be", fontFamily: "'Syne', sans-serif" }}>MedGuard AI</span>
      </div>
      <div style={{ display: "flex", gap: 26 }}>
        {["Home", "About", "Services", "Contact"].map(l => (
          <button key={l} className={`nav-link ${activeSection === l.toLowerCase() ? "active" : ""}`}
            onClick={() => { setPage("home"); setActiveSection(l.toLowerCase()); }}
            style={{ background: "none", border: "none", fontSize: 14, fontWeight: 500, color: activeSection === l.toLowerCase() ? "#4e65be" : C.textMid, padding: "4px 0", cursor: "pointer", position: "relative" }}>{l}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={() => setDark(d => !d)} style={{ padding: "7px 10px", borderRadius: 9, background: C.surface, border: `1px solid ${C.border}`, cursor: "pointer", fontSize: 15 }}>{dark ? "☀️" : "🌙"}</button>
        <select value={lang} onChange={e => setLang(e.target.value)} style={{ padding: "6px 9px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 12, cursor: "pointer", outline: "none" }}>
          {Object.entries(T).map(([k, v]) => <option key={k} value={k}>{v.langName}</option>)}
        </select>
        {user ? (
          <>
            <button className="btn-purp" onClick={() => setPage("guardian")} style={{ padding: "9px 16px", borderRadius: 10, background: "#8b64ce", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", transition: "all .2s" }}>Guardian Portal</button>
            <button className="btn-blue" onClick={() => setPage("patient")} style={{ padding: "9px 16px", borderRadius: 10, background: "#4e65be", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", transition: "all .2s" }}>Patient Portal</button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: C.bg, borderRadius: 100, border: `1px solid ${C.border}` }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#4e65be,#8b64ce)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>{user.initials}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{user.name?.split(" ")[0]}</span>
            </div>
            <button onClick={onLogout} style={{ padding: "9px 14px", borderRadius: 10, background: "#F1F5F9", color: "#64748B", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>Sign Out</button>
          </>
        ) : (
          <button className="btn-blue" onClick={() => setPage("auth")} style={{ padding: "9px 20px", borderRadius: 10, background: "#4e65be", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", transition: "all .2s", boxShadow: "0 3px 12px rgba(78,101,190,.3)" }}>Login / Sign Up</button>
        )}
      </div>
    </nav>
  );
}

// ── HOME PAGE ──────────────────────────────────────────
function HomePage({ setPage, activeSection, dark, user }) {
  const C = COLORS[dark ? "dark" : "light"];
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", role: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const gotoPortal = (dest) => {
    if (user) setPage(dest);
    else setPage("auth");
  };

  return (
    <div>
      {(!activeSection || activeSection === "home") && <>
        <section style={{ minHeight: "92vh", background: C.bannerBg, display: "flex", alignItems: "center", padding: "0 80px", gap: 48, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(78,101,190,.08),transparent 65%)", pointerEvents: "none" }} />
          <div style={{ flex: 1, maxWidth: 580 }} className="fade-up">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(78,101,190,.1)", borderRadius: 100, padding: "7px 16px", marginBottom: 24 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4e65be", animation: "pulse 1.8s infinite" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#4e65be" }}>AI-Powered Healthcare</span>
            </div>
            <h1 style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.1, color: dark ? "#F1F5F9" : "#1E2A5A", marginBottom: 18, letterSpacing: "-1.5px", fontFamily: "'Syne', sans-serif" }}>
              Your Intelligent<br /><span style={{ color: "#4e65be" }}>Medicine Reminder</span><br />&amp; Health Advisory<br />System
            </h1>
            <p style={{ fontSize: 16, color: C.textMid, lineHeight: 1.75, marginBottom: 32, maxWidth: 500 }}>MedGuard AI combines advanced AI with compassionate care to ensure medication adherence, provide health insights, and keep your loved ones connected.</p>
            <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
              <button className="btn-blue" onClick={() => gotoPortal("patient")} style={{ padding: "14px 24px", borderRadius: 12, background: "#4e65be", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", transition: "all .2s", boxShadow: "0 4px 16px rgba(78,101,190,.3)" }}>
                {user ? "👤 Patient Portal" : "👤 Get Started — Patient"}
              </button>
              <button className="btn-purp" onClick={() => gotoPortal("guardian")} style={{ padding: "14px 24px", borderRadius: 12, background: "#8b64ce", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", transition: "all .2s", boxShadow: "0 4px 16px rgba(139,100,206,.3)" }}>
                {user ? "👥 Guardian Portal" : "👥 Get Started — Guardian"}
              </button>
            </div>
            {!user && <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#ECFDF5", border: "1px solid #BBF7D0", borderRadius: 100, padding: "7px 16px" }}><span style={{ fontSize: 14 }}>🔒</span><span style={{ fontSize: 13, color: "#166534", fontWeight: 600 }}>Secure login required to access your portal</span></div>}
          </div>
          <div style={{ flex: 1, position: "relative", height: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="float1" style={{ position: "absolute", top: 40, right: 60, background: C.card, borderRadius: 16, padding: "14px 18px", boxShadow: "0 8px 32px rgba(0,0,0,.1)", minWidth: 210, display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "#EBF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>💊</div>
              <div><div style={{ fontWeight: 700, fontSize: 13, color: "#1E2A5A" }}>Next Medication</div><div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Aspirin 100mg · 2:00 PM</div></div>
            </div>
            <div className="float2" style={{ position: "absolute", top: 155, right: 20, background: "#F5F0FF", borderRadius: 16, padding: "14px 18px", boxShadow: "0 8px 32px rgba(0,0,0,.1)", minWidth: 200, display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🔔</div>
              <div><div style={{ fontWeight: 700, fontSize: 13, color: "#1E2A5A" }}>Smart Reminders</div><div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Never miss a dose</div></div>
            </div>
            <div className="float3" style={{ position: "absolute", bottom: 70, right: 70, background: "#ECFDF5", borderRadius: 16, padding: "14px 18px", boxShadow: "0 8px 32px rgba(0,0,0,.1)", minWidth: 200, display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>💚</div>
              <div><div style={{ fontWeight: 700, fontSize: 13, color: "#1E2A5A" }}>Health Monitoring</div><div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Real-time tracking</div></div>
            </div>
            <div style={{ width: 140, height: 140, borderRadius: "50%", background: "linear-gradient(135deg,rgba(78,101,190,.12),rgba(139,100,206,.12))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg,rgba(78,101,190,.2),rgba(139,100,206,.2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>🏥</div>
            </div>
          </div>
        </section>

        <section style={{ background: C.card, padding: "26px 80px", display: "flex", justifyContent: "space-around", borderBottom: `1px solid ${C.border}` }}>
          {[["50,000+", "Active Users"], ["98%", "Medication Adherence"], ["4.9★", "App Rating"], ["24/7", "AI Support"]].map(([val, lbl]) => (
            <div key={lbl} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#4e65be" }}>{val}</div>
              <div style={{ fontSize: 13, color: C.textMid, marginTop: 4, fontWeight: 500 }}>{lbl}</div>
            </div>
          ))}
        </section>

        <section style={{ background: C.bg, padding: "64px 80px" }}>
          <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: dark ? "#F1F5F9" : "#1E2A5A", marginBottom: 10, fontFamily: "'Syne', sans-serif" }}>Choose Your Interface</h2>
          <p style={{ textAlign: "center", color: C.textMid, fontSize: 15, marginBottom: 44 }}>{user ? "Welcome back! Jump into your portal." : "Sign in or create an account to get started."}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, maxWidth: 940, margin: "0 auto" }}>
            {[{ bg: "#4e65be", border: "#BFDBFE", icon: "👤", title: "Patient Interface", desc: "Take control of your health with personalized medication reminders, health tracking, and AI-powered advisory.", features: ["Personalized medication schedule", "AI health assistant", "Drug interaction checker", "Emergency SOS features"], btn: user ? "Open Patient Portal" : "Sign In to Access", action: () => gotoPortal("patient"), cls: "btn-blue" }, { bg: "#8b64ce", border: "#DDD6FE", icon: "👥", title: "Guardian Interface", desc: "Monitor and manage medication schedules for your loved ones with real-time updates and comprehensive oversight.", features: ["Multiple patient monitoring", "Medication compliance tracking", "Instant alerts & notifications", "Family coordination tools"], btn: user ? "Open Guardian Portal" : "Sign In to Access", action: () => gotoPortal("guardian"), cls: "btn-purp" }].map(c => (
              <div key={c.title} className="card-hover" style={{ background: C.card, borderRadius: 20, padding: "30px 26px", border: `2px solid ${c.border}`, transition: "all .3s", boxShadow: "0 4px 20px rgba(0,0,0,.06)" }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 16 }}>{c.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: dark ? "#F1F5F9" : "#1E2A5A", marginBottom: 9, fontFamily: "'Syne', sans-serif" }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.75, marginBottom: 18 }}>{c.desc}</p>
                {c.features.map(f => <div key={f} style={{ display: "flex", gap: 9, marginBottom: 8 }}><span style={{ color: "#22C55E", fontWeight: 700 }}>✓</span><span style={{ fontSize: 13, color: C.textMid }}>{f}</span></div>)}
                <button className={c.cls} onClick={c.action} style={{ marginTop: 18, width: "100%", padding: "13px", borderRadius: 12, background: c.bg, color: "#fff", fontWeight: 700, fontSize: 14, border: "none", transition: "all .2s" }}>
                  {!user && "🔐 "}{c.btn}
                </button>
              </div>
            ))}
          </div>
        </section>
      </>}

      {activeSection === "about" && (
        <section style={{ background: C.card, padding: "72px 80px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, maxWidth: 1080, margin: "0 auto", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: dark ? "#F1F5F9" : "#1E2A5A", marginBottom: 10, fontFamily: "'Syne', sans-serif" }}>About MedGuard AI</h2>
              <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.8, marginBottom: 14 }}>MedGuard AI was founded with a mission to ensure no one ever misses their medication and everyone has access to intelligent health guidance.</p>
              <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.8, marginBottom: 24 }}>We combine cutting-edge AI with intuitive design to create a healthcare companion that truly understands your needs.</p>
              {[["🤖", "AI-Powered", "Intelligent recommendations from ML"], ["🔒", "100% Secure", "HIPAA-compliant data protection"], ["👨‍👩‍👧", "Family-Focused", "Built for patients and caregivers"]].map(([i, t, s]) => (
                <div key={t} style={{ display: "flex", gap: 13, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{i}</div>
                  <div><div style={{ fontWeight: 700, color: dark ? "#F1F5F9" : "#1E2A5A" }}>{t}</div><div style={{ fontSize: 13, color: C.textMid }}>{s}</div></div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[["50K+", "Active Users", "#EBF4FF", "#4e65be"], ["98%", "Adherence Rate", "#ECFDF5", "#16A34A"], ["4.9★", "App Rating", "#FEF3C7", "#D97706"], ["24/7", "AI Support", "#F5F0FF", "#8b64ce"]].map(([v, l, bg, c]) => (
                <div key={l} style={{ background: bg, borderRadius: 14, padding: "24px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 30, fontWeight: 900, color: c }}>{v}</div>
                  <div style={{ fontSize: 12, color: C.textMid, fontWeight: 600, marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeSection === "services" && (
        <section style={{ background: C.bg, padding: "72px 80px" }}>
          <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: dark ? "#F1F5F9" : "#1E2A5A", marginBottom: 10, fontFamily: "'Syne', sans-serif" }}>Our Services</h2>
          <p style={{ textAlign: "center", color: C.textMid, marginBottom: 44 }}>Everything you need for complete healthcare management</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, maxWidth: 1080, margin: "0 auto 48px" }}>
            {[["1", "Profile", "Create account, add meds, health conditions and preferences."], ["2", "Schedule", "AI creates optimized reminder schedule tailored to your lifestyle."], ["3", "Reminders", "Get timely notifications via app, SMS, or phone call."], ["4", "Optimize", "Monitor adherence and get AI-powered health insights."]].map(([n, t, s]) => (
              <div key={t} style={{ background: C.card, borderRadius: 14, padding: "24px 18px", textAlign: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: "#4e65be", color: "#fff", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 11px" }}>{n}</div>
                <div style={{ fontWeight: 700, color: dark ? "#F1F5F9" : "#1E2A5A", marginBottom: 6 }}>{t}</div>
                <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.65 }}>{s}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeSection === "contact" && (
        <section style={{ background: C.bg, padding: "72px 80px" }}>
          <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: dark ? "#F1F5F9" : "#1E2A5A", marginBottom: 10, fontFamily: "'Syne', sans-serif" }}>Contact Us</h2>
          <p style={{ textAlign: "center", color: C.textMid, marginBottom: 44 }}>We're here to help 24/7</p>
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 34, maxWidth: 980, margin: "0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {[["📞", "Phone", "Mon-Fri 8am–8pm", "1-800-MEDGUARD"], ["📧", "Email", "24hr response", "support@medguardai.com"], ["📍", "Office", "Headquarters", "123 Healthcare Plaza, Boston"]].map(([i, t, s, v]) => (
                <div key={t} style={{ background: C.card, borderRadius: 14, padding: "18px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{i}</div>
                  <div style={{ fontWeight: 700, color: dark ? "#F1F5F9" : "#1E2A5A", marginBottom: 4 }}>{t}</div>
                  <div style={{ fontSize: 12, color: C.textSoft, marginBottom: 4 }}>{s}</div>
                  <div style={{ fontSize: 13, color: "#4e65be", fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: C.card, borderRadius: 18, padding: "26px 22px" }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: dark ? "#F1F5F9" : "#1E2A5A", marginBottom: 18 }}>Send us a Message</h3>
              {sent ? <div style={{ textAlign: "center", padding: "50px 0" }}><div style={{ fontSize: 48 }}>✅</div><h4 style={{ fontSize: 18, fontWeight: 700, color: dark ? "#F1F5F9" : "#1E2A5A", marginTop: 12 }}>Message Sent!</h4><p style={{ color: C.textMid, marginTop: 6 }}>We'll respond within 24 hours.</p></div> : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    {[["Full Name", "name", "text"], ["Email", "email", "email"]].map(([l, k, t]) => <div key={k}><label style={lStyle}>{l} *</label><input type={t} value={contactForm[k]} onChange={e => setContactForm(f => ({ ...f, [k]: e.target.value }))} style={{ ...iStyle, background: "#fff" }} /></div>)}
                  </div>
                  <div style={{ marginBottom: 12 }}><label style={lStyle}>Subject</label><input value={contactForm.subject} onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))} style={{ ...iStyle, background: "#fff" }} /></div>
                  <div style={{ marginBottom: 18 }}><label style={lStyle}>Message *</label><textarea rows={5} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} style={{ ...iStyle, resize: "vertical", background: "#fff" }} /></div>
                  <button className="btn-blue" onClick={() => setSent(true)} style={{ width: "100%", padding: "13px", borderRadius: 12, background: "#4e65be", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", transition: "all .2s" }}>✉️ Send Message</button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      <footer style={{ background: "#1E2A5A", padding: "32px 80px 18px", color: "#94A3B8" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#4e65be", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💙</div>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>MedGuard AI</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 230 }}>Intelligent healthcare management powered by AI.</p>
          </div>
          {[["Product", ["Patient Portal", "Guardian Portal", "AI Advisor"]], ["Company", ["About", "Services", "Contact"]], ["Support", ["Help Center", "Privacy", "Terms"]]].map(([title, links]) => (
            <div key={title}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
              {links.map(l => <div key={l} style={{ fontSize: 13, marginBottom: 7, cursor: "pointer" }}>{l}</div>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 16, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span>© 2026 MedGuard AI. All rights reserved.</span>
          <div style={{ display: "flex", gap: 16 }}>{["HIPAA Compliant", "SSL Secured"].map(b => <span key={b} style={{ color: "#22C55E" }}>✅ {b}</span>)}</div>
        </div>
      </footer>
    </div>
  );
}

// ── ROOT ───────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [activeSection, setActiveSection] = useState("home");
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("en");
  const [user, setUser] = useState(null); // null = not logged in
  const offline = useOffline();

  const handleLogin = (userData) => {
    setUser(userData);
    // After login, redirect to appropriate portal based on role
    if (userData.role === "guardian") setPage("guardian");
    else setPage("patient");
  };

  const handleLogout = () => {
    setUser(null);
    setPage("home");
  };

  // Protect portals — redirect to auth if not logged in
  useEffect(() => {
    if ((page === "patient" || page === "guardian") && !user) {
      setPage("auth");
    }
  }, [page, user]);

  return (
    <div>
      <style>{makeGCSS(dark)}</style>
      {offline && page === "home" && <OfflineBanner />}
      {!["patient", "guardian", "auth"].includes(page) && (
        <Navbar page={page} setPage={setPage} activeSection={activeSection} setActiveSection={setActiveSection} dark={dark} setDark={setDark} lang={lang} setLang={setLang} user={user} onLogout={handleLogout} />
      )}
      {page === "auth" && <AuthPage onLogin={handleLogin} dark={dark} setDark={setDark} />}
      {["home", "about", "services", "contact"].includes(page) && <HomePage setPage={setPage} activeSection={activeSection} dark={dark} user={user} />}
      {page === "patient" && user && <PatientPortal setPage={setPage} dark={dark} setDark={setDark} lang={lang} setLang={setLang} user={user} onLogout={handleLogout} />}
      {page === "guardian" && user && <GuardianPortal setPage={setPage} dark={dark} user={user} onLogout={handleLogout} />}
    </div>
  );
}
