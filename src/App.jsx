import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   MedGuard AI — COMPLETE FEATURE BUILD
   All features included + API key guidance built-in
═══════════════════════════════════════════════════════ */

// ── API KEY SETUP ─────────────────────────────────────
// Claude.ai artifacts:  key is auto-injected ✅
// Local dev:            add REACT_APP_ANTHROPIC_API_KEY=sk-... to .env
// Production:           use a backend proxy — NEVER expose key in frontend
const API_KEY = typeof process !== "undefined" ? process.env?.REACT_APP_ANTHROPIC_API_KEY : undefined;

// ── TRANSLATIONS ──────────────────────────────────────
const T = {
  en: { dashboard:"Dashboard", medications:"Medications", aiAdvisor:"AI Advisor", analytics:"Analytics", symptoms:"Symptoms", vaccinations:"Vaccinations", appointments:"Appointments", settings:"Settings", goodMorning:"Good Morning", markTaken:"Mark Taken ✓", taken:"✓ Taken", addMed:"+ Add Med", healthScore:"Health Score", streak:"Streak", interactions:"Interactions", aiInsights:"AI Insights", dailyProgress:"Daily Progress", safetyDash:"Safety Dashboard", drugInteraction:"Drug Interaction Checker", emergencySOS:"Emergency SOS", weeklyReport:"Download Report", moodCheck:"How are you feeling?", langName:"English" },
  hi: { dashboard:"डैशबोर्ड", medications:"दवाइयाँ", aiAdvisor:"AI सलाहकार", analytics:"विश्लेषण", symptoms:"लक्षण", vaccinations:"टीकाकरण", appointments:"अपॉइंटमेंट", settings:"सेटिंग्स", goodMorning:"सुप्रभात", markTaken:"ली ✓", taken:"✓ ली", addMed:"+ दवा जोड़ें", healthScore:"स्वास्थ्य स्कोर", streak:"स्ट्रीक", interactions:"इंटरेक्शन", aiInsights:"AI अंतर्दृष्टि", dailyProgress:"दैनिक प्रगति", safetyDash:"सुरक्षा डैशबोर्ड", drugInteraction:"दवा इंटरेक्शन चेकर", emergencySOS:"आपातकालीन SOS", weeklyReport:"रिपोर्ट डाउनलोड", moodCheck:"आज आप कैसा महसूस कर रहे हैं?", langName:"हिंदी" },
  gu: { dashboard:"ડૅશબોર્ડ", medications:"દવાઓ", aiAdvisor:"AI સલાહ", analytics:"વિશ્લેષણ", symptoms:"લક્ષણો", vaccinations:"રસીકરણ", appointments:"એપૉઇન્ટમેન્ટ", settings:"સેટિંગ્સ", goodMorning:"સુ-પ્રભાત", markTaken:"લીધી ✓", taken:"✓ લીધી", addMed:"+ દવા ઉમેરો", healthScore:"સ્વાસ્થ્ય સ્કોર", streak:"સ્ટ્રીક", interactions:"ઇન્ટરેક્શન", aiInsights:"AI સૂઝ", dailyProgress:"દૈનિક પ્રગતિ", safetyDash:"સુરક્ષા ડૅશ", drugInteraction:"ડ્રગ ઇન્ટરેક્શન ચેકર", emergencySOS:"ઇમર્જન્સી SOS", weeklyReport:"રિપૉર્ટ ડાઉનલૉડ", moodCheck:"આજે તમે કેવું અનુભવો છો?", langName:"ગુજરાતી" },
};

// ── DRUG INTERACTION DATABASE ─────────────────────────
const DRUG_INTERACTIONS = [
  { drugs:["warfarin","aspirin"],       severity:"HIGH",   effect:"Major bleeding risk. Avoid unless prescribed together with monitoring." },
  { drugs:["lisinopril","ibuprofen"],   severity:"HIGH",   effect:"NSAIDs reduce ACE inhibitor effectiveness and can worsen kidney function." },
  { drugs:["metformin","alcohol"],      severity:"HIGH",   effect:"Risk of lactic acidosis. Avoid alcohol while taking Metformin." },
  { drugs:["atorvastatin","grapefruit"],severity:"MEDIUM", effect:"Grapefruit increases statin levels, raising risk of muscle damage." },
  { drugs:["sertraline","tramadol"],    severity:"HIGH",   effect:"Risk of serotonin syndrome. Seek immediate medical attention." },
  { drugs:["methotrexate","aspirin"],   severity:"HIGH",   effect:"Aspirin can increase Methotrexate toxicity dangerously." },
  { drugs:["digoxin","amiodarone"],     severity:"HIGH",   effect:"Amiodarone significantly increases Digoxin blood levels." },
  { drugs:["clopidogrel","omeprazole"], severity:"MEDIUM", effect:"Omeprazole may reduce Clopidogrel's antiplatelet effect." },
  { drugs:["sildenafil","nitrates"],    severity:"HIGH",   effect:"Severe drop in blood pressure. This combination can be fatal." },
  { drugs:["fluoxetine","maoi"],        severity:"HIGH",   effect:"Risk of life-threatening serotonin syndrome." },
  { drugs:["lithium","ibuprofen"],      severity:"HIGH",   effect:"NSAIDs can raise Lithium to toxic levels in the blood." },
  { drugs:["ciprofloxacin","antacids"], severity:"MEDIUM", effect:"Antacids reduce Ciprofloxacin absorption by up to 90%." },
  { drugs:["warfarin","ibuprofen"],     severity:"HIGH",   effect:"Dramatically increases bleeding risk. Avoid this combination." },
  { drugs:["amlodipine","simvastatin"], severity:"MEDIUM", effect:"Amlodipine increases Simvastatin exposure, raising myopathy risk." },
  { drugs:["metformin","contrast dye"],severity:"HIGH",   effect:"Stop Metformin before contrast imaging to prevent kidney issues." },
  { drugs:["aspirin","naproxen"],       severity:"MEDIUM", effect:"Both are NSAIDs — combined use increases GI bleeding risk." },
  { drugs:["alcohol","acetaminophen"],  severity:"HIGH",   effect:"Liver damage risk greatly increased. Avoid alcohol with Paracetamol." },
  { drugs:["potassium","spironolactone"],severity:"HIGH",  effect:"Risk of dangerous hyperkalemia (high potassium)." },
  { drugs:["levothyroxine","calcium"],  severity:"MEDIUM", effect:"Calcium supplements reduce Levothyroxine absorption. Take 4 hrs apart." },
  { drugs:["azithromycin","antacids"],  severity:"LOW",    effect:"Antacids may slightly reduce Azithromycin absorption." },
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

// ── COLORS ────────────────────────────────────────────
const COLORS = {
  light: { bg:"#EBF4FF", surface:"#FFFFFF", card:"#FFFFFF", border:"#E2E8F0", text:"#1a202c", textMid:"#4A5568", textSoft:"#94A3B8", blue:"#4e65be", purp:"#8b64ce", navBg:"#FFFFFF", inputBg:"#FAFBFC", bannerBg:"linear-gradient(160deg,#EBF4FF,#DBEAFE)", },
  dark:  { bg:"#0F172A", surface:"#1E293B", card:"#1E293B", border:"#334155", text:"#F1F5F9", textMid:"#94A3B8", textSoft:"#64748B", blue:"#6B8EFF", purp:"#A78BFA", navBg:"#1E293B", inputBg:"#0F172A", bannerBg:"linear-gradient(160deg,#0F172A,#1E293B)", },
};

// ── GLOBAL CSS ─────────────────────────────────────────
const makeGCSS = (dark) => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', system-ui, sans-serif; background: ${dark?"#0F172A":"#EBF4FF"}; color: ${dark?"#F1F5F9":"#1a202c"}; transition: background .3s, color .3s; }
  input, select, textarea { font-family: inherit; color-scheme: ${dark?"dark":"light"}; }
  button { font-family: inherit; cursor: pointer; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${dark?"#0F172A":"#EBF4FF"}; }
  ::-webkit-scrollbar-thumb { background: ${dark?"#334155":"#93C5FD"}; border-radius: 4px; }

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
  @keyframes confetti { 0%{transform:translateY(-10px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }

  .fade-up   { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) both; }
  .float1    { animation: float  4s ease-in-out infinite; }
  .float2    { animation: float2 5s ease-in-out infinite .8s; }
  .float3    { animation: float  6s ease-in-out infinite 1.5s; }
  .modal-wrap{ animation: modalIn .3s cubic-bezier(.22,1,.36,1) both; }
  .toast-in  { animation: toastIn .4s cubic-bezier(.22,1,.36,1) both; }
  .toast-out { animation: toastOut .4s ease both; }
  .dot1{animation:dotB 1.2s 0s infinite} .dot2{animation:dotB 1.2s .2s infinite} .dot3{animation:dotB 1.2s .4s infinite}

  .nav-link{position:relative}
  .nav-link::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:2px;background:#4e65be;border-radius:2px;transition:width .25s}
  .nav-link.active::after,.nav-link:hover::after{width:100%}
  .btn-blue:hover  {transform:translateY(-1px);filter:brightness(1.1);box-shadow:0 8px 24px rgba(78,101,190,.35)!important}
  .btn-purp:hover  {transform:translateY(-1px);filter:brightness(1.1)}
  .btn-red:hover   {transform:translateY(-1px);filter:brightness(1.1)}
  .card-hover:hover{transform:translateY(-4px);box-shadow:0 20px 48px rgba(0,0,0,.14)!important}
  .med-row:hover   {background:${dark?"#334155":"#F8FAFC"}}
  .tab-btn:hover   {background:rgba(78,101,190,.08)!important}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:300;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
  .print-only{display:none}
  @media print{.no-print{display:none!important}.print-only{display:block!important}body{background:white!important;color:black!important}}
`;

// ── HOOKS ─────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((icon, title, msg, type="success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, icon, title, msg, type, leaving:false }]);
    setTimeout(() => setToasts(t => t.map(x => x.id===id ? {...x, leaving:true} : x)), 2800);
    setTimeout(() => setToasts(t => t.filter(x => x.id!==id)), 3300);
  }, []);
  return { toasts, show };
}

function useOffline() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on  = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return offline;
}

function useSpeech(onResult) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported in this browser."); return; }
    const rec = new SR();
    rec.lang = "en-US"; rec.continuous = false; rec.interimResults = false;
    rec.onresult = e => { onResult(e.results[0][0].transcript); setListening(false); };
    rec.onerror  = ()  => setListening(false);
    rec.onend    = ()  => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [onResult]);

  const stop = useCallback(() => { recRef.current?.stop(); setListening(false); }, []);
  return { listening, start, stop };
}

// ── SMALL SHARED COMPONENTS ────────────────────────────
function Toast({ toasts }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:999, display:"flex", flexDirection:"column", gap:10, pointerEvents:"none" }}>
      {toasts.map(t => {
        const colors = { success:["#ECFDF5","#6EE7B7","#16A34A"], warning:["#FEF3C7","#FCD34D","#D97706"], info:["#EBF4FF","#93C5FD","#3B82F6"], error:["#FEE2E2","#FCA5A5","#EF4444"] };
        const [bg,border] = colors[t.type]||colors.info;
        return (
          <div key={t.id} className={t.leaving?"toast-out":"toast-in"} style={{ background:bg, border:`1.5px solid ${border}`, borderRadius:14, padding:"14px 18px", minWidth:280, display:"flex", alignItems:"center", gap:12, boxShadow:"0 8px 28px rgba(0,0,0,.15)" }}>
            <span style={{ fontSize:22, flexShrink:0 }}>{t.icon}</span>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:"#1E2A5A" }}>{t.title}</div>
              <div style={{ fontSize:12, color:"#64748B", marginTop:2 }}>{t.msg}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdherenceRing({ pct, size=110, dark }) {
  const r=42, circ=2*Math.PI*r, offset=circ-(pct/100)*circ;
  const color = pct>=80?"#22C55E":pct>=60?"#F59E0B":"#EF4444";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="8"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 50 50)"
        style={{ transition:"stroke-dashoffset 1s ease", animation:"ringFill 1.2s ease forwards" }}/>
      <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="900" fill="white">{pct}%</text>
    </svg>
  );
}

function HealthScoreRing({ score, size=90 }) {
  const r=38, circ=2*Math.PI*r, offset=circ-(score/100)*circ;
  const color = score>=80?"#22C55E":score>=60?"#F59E0B":"#EF4444";
  return (
    <div style={{ textAlign:"center" }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#E2E8F0" strokeWidth="10"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 50 50)"
          style={{ transition:"stroke-dashoffset 1.2s ease" }}/>
        <text x="50" y="48" textAnchor="middle" fontSize="18" fontWeight="900" fill={color}>{score}</text>
        <text x="50" y="63" textAnchor="middle" fontSize="10" fill="#94A3B8">/ 100</text>
      </svg>
      <div style={{ fontSize:11, fontWeight:700, color, marginTop:4 }}>
        {score>=80?"Excellent":score>=60?"Good":score>=40?"Fair":"Needs Attention"}
      </div>
    </div>
  );
}

function OfflineBanner({ dark }) {
  return (
    <div style={{ background:"#FEF3C7", borderBottom:"1px solid #FCD34D", padding:"10px 48px", display:"flex", alignItems:"center", gap:10, fontSize:14, fontWeight:600, color:"#92400E" }}>
      <span>📵</span>
      <span>You're offline — your medication reminders will still work, but AI features are unavailable until you reconnect.</span>
    </div>
  );
}

// ── MODAL BASE ────────────────────────────────────────
function Modal({ onClose, children, wide }) {
  useEffect(() => {
    const esc = (e) => { if (e.key==="Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);
  return (
    <div className="overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-wrap" style={{ background:"#FFFFFF", borderRadius:22, padding:"32px", width:wide?740:520, maxWidth:"95vw", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 64px rgba(0,0,0,.2)", position:"relative" }}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ icon, title, sub, onClose }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:"#EBF4FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{icon}</div>
        <div>
          <div style={{ fontWeight:800, fontSize:18, color:"#1E2A5A" }}>{title}</div>
          {sub && <div style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>{sub}</div>}
        </div>
      </div>
      <button onClick={onClose} style={{ width:34, height:34, borderRadius:"50%", background:"#F1F5F9", border:"none", fontSize:18, color:"#64748B", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
    </div>
  );
}

const iStyle = { width:"100%", padding:"11px 14px", border:"1.5px solid #E2E8F0", borderRadius:10, fontSize:14, outline:"none", background:"#FAFBFC" };
const lStyle = { fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:6 };

// ── ADD MEDICATION MODAL ──────────────────────────────
function AddMedModal({ onClose, onAdd, knownAllergies=[] }) {
  const [form, setForm] = useState({ name:"", dosage:"", frequency:"Once daily", time:"08:00", purpose:"", refill:"", notes:"" });
  const [allergyAlert, setAllergyAlert] = useState(null);
  const up = (k,v) => {
    setForm(f=>({...f,[k]:v}));
    if (k==="name") {
      const match = knownAllergies.find(a => v.toLowerCase().includes(a.toLowerCase()));
      setAllergyAlert(match ? `⚠️ ALLERGY ALERT — "${match}" detected in this medication name! Please consult your doctor.` : null);
    }
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader icon="💊" title="Add Medication" sub="Fill in your medication details" onClose={onClose} />
      {allergyAlert && (
        <div style={{ background:"#FEE2E2", border:"2px solid #EF4444", borderRadius:12, padding:"12px 16px", marginBottom:16, color:"#991B1B", fontWeight:700, fontSize:14, animation:"slideIn .3s ease" }}>
          🚨 {allergyAlert}
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
        <div style={{ marginBottom:14, gridColumn:"1/-1" }}>
          <label style={lStyle}>Medicine Name *</label>
          <input placeholder="e.g. Metformin, Aspirin…" value={form.name} onChange={e=>up("name",e.target.value)} style={iStyle} />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={lStyle}>Dosage *</label>
          <input placeholder="e.g. 500mg" value={form.dosage} onChange={e=>up("dosage",e.target.value)} style={iStyle} />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={lStyle}>Frequency *</label>
          <select value={form.frequency} onChange={e=>up("frequency",e.target.value)} style={{ ...iStyle, background:"#FFFFFF" }}>
            {["Once daily","Twice daily","Three times daily","Every 8 hours","Every 12 hours","Weekly","As needed"].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={lStyle}>Reminder Time *</label>
          <input type="time" value={form.time} onChange={e=>up("time",e.target.value)} style={iStyle} />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={lStyle}>Purpose / Condition</label>
          <input placeholder="e.g. Diabetes" value={form.purpose} onChange={e=>up("purpose",e.target.value)} style={iStyle} />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={lStyle}>Refill Date</label>
          <input type="date" value={form.refill} onChange={e=>up("refill",e.target.value)} style={iStyle} />
        </div>
        <div style={{ marginBottom:20, gridColumn:"1/-1" }}>
          <label style={lStyle}>Notes (optional)</label>
          <input placeholder="Take with food, avoid sunlight…" value={form.notes} onChange={e=>up("notes",e.target.value)} style={iStyle} />
        </div>
      </div>
      <div style={{ background:"#FEF3C7", borderRadius:10, padding:"10px 14px", marginBottom:20, display:"flex", gap:10 }}>
        <span>⚠️</span><span style={{ fontSize:12, color:"#92400E" }}>Always consult your doctor before adding or changing medications.</span>
      </div>
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onClose} style={{ flex:1, padding:"13px", borderRadius:11, background:"#F1F5F9", color:"#64748B", fontWeight:700, fontSize:14, border:"none" }}>Cancel</button>
        <button onClick={()=>{ if(!form.name||!form.dosage) return; onAdd(form); onClose(); }} className="btn-blue"
          style={{ flex:2, padding:"13px", borderRadius:11, background:"#4e65be", color:"#fff", fontWeight:700, fontSize:14, border:"none", transition:"all .2s" }}>
          ✅ Add Medication
        </button>
      </div>
    </Modal>
  );
}

// ── DRUG INTERACTION CHECKER MODAL ───────────────────
function DrugInteractionModal({ onClose }) {
  const [drug1, setDrug1] = useState(""); const [drug2, setDrug2] = useState("");
  const [result, setResult] = useState(null); const [checked, setChecked] = useState(false);

  const check = () => {
    if (!drug1.trim()||!drug2.trim()) return;
    const found = checkInteraction(drug1, drug2);
    setResult(found || null); setChecked(true);
  };

  const sevColor = { HIGH:["#FEE2E2","#EF4444","#991B1B"], MEDIUM:["#FEF3C7","#F59E0B","#92400E"], LOW:["#ECFDF5","#22C55E","#166534"] };

  return (
    <Modal onClose={onClose}>
      <ModalHeader icon="⚗️" title="Drug Interaction Checker" sub="Check if two medications are safe to take together" onClose={onClose} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <div>
          <label style={lStyle}>Drug / Food 1</label>
          <input placeholder="e.g. Warfarin, Aspirin…" value={drug1} onChange={e=>{setDrug1(e.target.value); setChecked(false);}} style={iStyle} onKeyDown={e=>e.key==="Enter"&&check()} />
        </div>
        <div>
          <label style={lStyle}>Drug / Food 2</label>
          <input placeholder="e.g. Ibuprofen, Grapefruit…" value={drug2} onChange={e=>{setDrug2(e.target.value); setChecked(false);}} style={iStyle} onKeyDown={e=>e.key==="Enter"&&check()} />
        </div>
      </div>
      <button onClick={check} className="btn-blue" style={{ width:"100%", padding:"13px", borderRadius:11, background:"#4e65be", color:"#fff", fontWeight:700, fontSize:15, border:"none", marginBottom:20, transition:"all .2s" }}>
        🔍 Check Interaction
      </button>

      {checked && (
        result ? (() => {
          const [bg,border,tc] = sevColor[result.severity]||sevColor.LOW;
          return (
            <div style={{ background:bg, border:`2px solid ${border}`, borderRadius:14, padding:"20px 22px", animation:"slideIn .3s ease" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <span style={{ fontSize:28 }}>{result.severity==="HIGH"?"🚨":result.severity==="MEDIUM"?"⚠️":"ℹ️"}</span>
                <div>
                  <div style={{ fontWeight:800, fontSize:16, color:tc }}>{result.severity} SEVERITY INTERACTION</div>
                  <div style={{ fontSize:13, color:tc, opacity:.8, marginTop:2 }}>{drug1} + {drug2}</div>
                </div>
              </div>
              <p style={{ fontSize:14, color:tc, lineHeight:1.7, marginBottom:12 }}>{result.effect}</p>
              <div style={{ background:"rgba(0,0,0,.06)", borderRadius:10, padding:"10px 14px", fontSize:13, color:tc, fontWeight:600 }}>
                🩺 Please consult your doctor or pharmacist before taking these together.
              </div>
            </div>
          );
        })() : (
          <div style={{ background:"#ECFDF5", border:"2px solid #22C55E", borderRadius:14, padding:"20px 22px", animation:"slideIn .3s ease", display:"flex", gap:12, alignItems:"center" }}>
            <span style={{ fontSize:36 }}>✅</span>
            <div>
              <div style={{ fontWeight:800, fontSize:16, color:"#166534" }}>No Known Interaction Found</div>
              <div style={{ fontSize:14, color:"#166534", opacity:.8, marginTop:4, lineHeight:1.6 }}>No interaction between <strong>{drug1}</strong> and <strong>{drug2}</strong> was found in our database. Always confirm with your pharmacist.</div>
            </div>
          </div>
        )
      )}

      <div style={{ marginTop:20 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Common Checks</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {[["Warfarin","Aspirin"],["Metformin","Alcohol"],["Lisinopril","Ibuprofen"],["Atorvastatin","Grapefruit"],["Sertraline","Tramadol"]].map(([a,b])=>(
            <button key={a+b} onClick={()=>{setDrug1(a); setDrug2(b); setChecked(false);}} style={{ padding:"6px 12px", borderRadius:100, background:"#F1F5F9", border:"1px solid #E2E8F0", fontSize:12, color:"#4A5568", cursor:"pointer" }}>{a} + {b}</button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ── EMERGENCY SOS MODAL ───────────────────────────────
function EmergencySOSModal({ onClose }) {
  const [calling, setCalling] = useState(false);
  const contacts = [
    { name:"Dr. Sharma", role:"Primary Doctor", phone:"98765 43210", icon:"👨‍⚕️" },
    { name:"Rahul (Son)", role:"Family Contact", phone:"98765 11111", icon:"👨" },
    { name:"Priya (Wife)", role:"Family Contact", phone:"98765 22222", icon:"👩" },
  ];
  const hospitals = [
    { name:"Apollo Hospital",       dist:"1.2 km", time:"4 min", icon:"🏥" },
    { name:"Fortis Medical Centre", dist:"2.8 km", time:"9 min", icon:"🏥" },
    { name:"AIIMS Delhi",           dist:"4.1 km", time:"14 min",icon:"🏥" },
  ];

  return (
    <div className="overlay">
      <div className="modal-wrap" style={{ background:"#FFFFFF", borderRadius:22, padding:"32px", width:560, maxWidth:"95vw", boxShadow:"0 24px 64px rgba(239,68,68,.3)", position:"relative" }}>
        {/* Pulsing SOS button */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:100, height:100, borderRadius:"50%", background:"#EF4444", margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, animation:"sosPulse 1.5s infinite, heartbeat 1.5s infinite" }}>
            🆘
          </div>
          <h2 style={{ fontSize:24, fontWeight:900, color:"#EF4444", marginBottom:6 }}>Emergency SOS Activated</h2>
          <p style={{ fontSize:14, color:"#64748B" }}>Your location has been shared with your emergency contacts.</p>
        </div>

        {/* Call 112 */}
        <button onClick={()=>{ setCalling(true); setTimeout(()=>setCalling(false),3000); }} className="btn-red"
          style={{ width:"100%", padding:"16px", borderRadius:14, background:calling?"#DC2626":"#EF4444", color:"#fff", fontSize:18, fontWeight:900, border:"none", marginBottom:20, transition:"all .2s", boxShadow:"0 6px 20px rgba(239,68,68,.4)", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
          {calling ? "📞 Connecting to 112…" : "📞 Call Emergency (112)"}
        </button>

        {/* Contacts */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Emergency Contacts</div>
          {contacts.map(c=>(
            <div key={c.name} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"#F8FAFC", borderRadius:12, marginBottom:8, border:"1px solid #E2E8F0" }}>
              <span style={{ fontSize:24 }}>{c.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:"#1E2A5A", fontSize:14 }}>{c.name}</div>
                <div style={{ fontSize:12, color:"#94A3B8" }}>{c.role}</div>
              </div>
              <a href={`tel:${c.phone}`} style={{ padding:"8px 16px", borderRadius:9, background:"#ECFDF5", color:"#16A34A", fontWeight:700, fontSize:13, textDecoration:"none", border:"1px solid #BBF7D0" }}>📞 Call</a>
            </div>
          ))}
        </div>

        {/* Hospitals */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Nearest Hospitals</div>
          {hospitals.map(h=>(
            <div key={h.name} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"#EBF4FF", borderRadius:12, marginBottom:8, border:"1px solid #BFDBFE" }}>
              <span style={{ fontSize:22 }}>{h.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:"#1E2A5A", fontSize:14 }}>{h.name}</div>
                <div style={{ fontSize:12, color:"#94A3B8" }}>{h.dist} away · ~{h.time}</div>
              </div>
              <span style={{ fontSize:12, fontWeight:700, color:"#4e65be", background:"#EBF4FF", padding:"4px 10px", borderRadius:100 }}>Get Directions</span>
            </div>
          ))}
        </div>

        {/* Medication summary */}
        <div style={{ background:"#FEF3C7", borderRadius:12, padding:"12px 16px", marginBottom:20, fontSize:13, color:"#92400E" }}>
          <strong>📋 Current Medications (share with paramedics):</strong><br/>
          Metformin 500mg · Aspirin 100mg · Lisinopril 10mg · Atorvastatin 20mg
        </div>

        <button onClick={onClose} style={{ width:"100%", padding:"13px", borderRadius:11, background:"#F1F5F9", color:"#64748B", fontWeight:700, fontSize:14, border:"none" }}>✕ Close SOS</button>
      </div>
    </div>
  );
}

// ── SYMPTOM LOGGER MODAL ──────────────────────────────
function SymptomLoggerModal({ onClose, meds, show: showToast }) {
  const SYMPTOMS = ["Headache","Dizziness","Nausea","Fatigue","Vomiting","Chest Pain","Shortness of Breath","Rash","Dry Mouth","Blurred Vision","Muscle Pain","Insomnia","Anxiety","Appetite Loss","Swelling","Palpitations"];
  const [selected, setSelected] = useState([]);
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const toggle = (s) => setSelected(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s]);

  const analyze = async () => {
    if (!selected.length) return;
    setLoading(true);
    try {
      const medNames = meds.map(m=>m.name).join(", ");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:600,
          system:"You are MedGuard AI. Analyze reported symptoms against a patient's medication list and identify if any symptoms could be medication side effects. Be concise, use bullet points, and end with whether to consult a doctor. Keep under 150 words.",
          messages:[{ role:"user", content:`Patient medications: ${medNames}. Reported symptoms: ${selected.join(", ")}. Severity: ${severity}/10. Notes: ${notes||"none"}. Analyze if these could be medication side effects.` }]
        })
      });
      const data = await res.json();
      setResult(data.content?.[0]?.text || "Analysis complete. Please consult your doctor.");
    } catch {
      setResult("⚠️ Could not connect to AI. Please consult your doctor about these symptoms.");
    } finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose} wide>
      <ModalHeader icon="📋" title="Symptom Logger" sub="Log symptoms and get AI analysis against your medications" onClose={onClose} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <div>
          <label style={lStyle}>Select Symptoms</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20 }}>
            {SYMPTOMS.map(s=>(
              <button key={s} onClick={()=>toggle(s)} style={{ padding:"7px 14px", borderRadius:100, border:`1.5px solid ${selected.includes(s)?"#EF4444":"#E2E8F0"}`, background:selected.includes(s)?"#FEE2E2":"#F8FAFC", color:selected.includes(s)?"#DC2626":"#4A5568", fontSize:13, fontWeight:selected.includes(s)?700:500, cursor:"pointer", transition:"all .15s" }}>{s}</button>
            ))}
          </div>
          <label style={lStyle}>Severity (1–10): <strong style={{ color:"#EF4444" }}>{severity}</strong></label>
          <input type="range" min={1} max={10} value={severity} onChange={e=>setSeverity(+e.target.value)} style={{ width:"100%", accentColor:"#EF4444", marginBottom:16 }} />
          <label style={lStyle}>Additional Notes</label>
          <textarea rows={3} placeholder="Describe when symptoms started, what makes them worse/better…" value={notes} onChange={e=>setNotes(e.target.value)} style={{ ...iStyle, resize:"vertical", marginBottom:16 }} />
          <button onClick={analyze} disabled={!selected.length||loading} className="btn-blue"
            style={{ width:"100%", padding:"12px", borderRadius:11, background:selected.length&&!loading?"#4e65be":"#94A3B8", color:"#fff", fontWeight:700, fontSize:14, border:"none", transition:"all .2s" }}>
            {loading ? "🤖 Analyzing with AI…" : "🔬 Analyze with AI"}
          </button>
        </div>
        <div>
          {result ? (
            <div style={{ background:"#F8FAFC", border:"1.5px solid #E2E8F0", borderRadius:14, padding:"20px", height:"100%" }}>
              <div style={{ fontWeight:700, color:"#1E2A5A", marginBottom:12, display:"flex", gap:8 }}>🤖 AI Analysis Result</div>
              <div style={{ fontSize:14, color:"#374151", lineHeight:1.75, whiteSpace:"pre-wrap" }}>{result}</div>
              <div style={{ marginTop:16, padding:"10px 14px", background:"#FEF3C7", borderRadius:10, fontSize:12, color:"#92400E" }}>
                ⚠️ This is not medical advice. Always consult your doctor.
              </div>
            </div>
          ) : (
            <div style={{ background:"#F8FAFC", border:"1.5px dashed #E2E8F0", borderRadius:14, padding:"40px 20px", textAlign:"center", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🔬</div>
              <div style={{ fontWeight:700, color:"#94A3B8" }}>Select symptoms and click<br/>Analyze to get AI insights</div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ── PILL SCANNER MODAL (camera simulation) ─────────────
function PillScannerModal({ onClose }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:"environment" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setScanning(true);
    } catch { setScanning("error"); }
  };

  const scan = () => {
    setScanning("loading");
    setTimeout(() => {
      setResult({ name:"Aspirin 100mg", generic:"Acetylsalicylic Acid", color:"White, round tablet", manufacturer:"Bayer", uses:"Pain relief, blood thinner, fever reduction", sideEffects:"Stomach upset, bleeding risk, ringing in ears", warning:"Do not take if allergic to NSAIDs", interaction:"May interact with Warfarin, Lisinopril" });
      setScanning("done");
      streamRef.current?.getTracks().forEach(t=>t.stop());
    }, 2200);
  };

  useEffect(() => () => streamRef.current?.getTracks().forEach(t=>t.stop()), []);

  return (
    <Modal onClose={onClose} wide>
      <ModalHeader icon="🔍" title="Pill Scanner" sub="Use your camera to identify any medication" onClose={onClose} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <div>
          <div style={{ background:"#0F172A", borderRadius:16, overflow:"hidden", aspectRatio:"4/3", marginBottom:16, position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {scanning==="loading" && <div style={{ textAlign:"center", color:"#fff" }}><div style={{ fontSize:40, animation:"pulse 1s infinite" }}>🔍</div><div style={{ marginTop:12, fontSize:14 }}>Identifying pill…</div></div>}
            {scanning===true && <video ref={videoRef} autoPlay playsInline muted style={{ width:"100%", height:"100%", objectFit:"cover" }} />}
            {!scanning && <div style={{ textAlign:"center", color:"#64748B" }}><div style={{ fontSize:48 }}>📷</div><div style={{ marginTop:12, fontSize:14 }}>Camera not started</div></div>}
            {scanning==="error" && <div style={{ textAlign:"center", color:"#EF4444" }}><div style={{ fontSize:36 }}>❌</div><div style={{ marginTop:8, fontSize:13 }}>Camera not available.<br/>Using demo mode.</div></div>}
            {scanning==="done" && <div style={{ textAlign:"center", color:"#22C55E" }}><div style={{ fontSize:48 }}>✅</div><div style={{ marginTop:8, fontSize:14, color:"#fff" }}>Pill identified!</div></div>}
            {scanning===true && <div style={{ position:"absolute", inset:20, border:"2px solid #4e65be", borderRadius:12, pointerEvents:"none" }}><div style={{ position:"absolute", top:-1, left:-1, width:20, height:20, borderTop:"4px solid #22C55E", borderLeft:"4px solid #22C55E", borderRadius:"4px 0 0 0" }} /><div style={{ position:"absolute", top:-1, right:-1, width:20, height:20, borderTop:"4px solid #22C55E", borderRight:"4px solid #22C55E", borderRadius:"0 4px 0 0" }} /></div>}
          </div>
          {!scanning && <button onClick={startCamera} className="btn-blue" style={{ width:"100%", padding:"12px", borderRadius:11, background:"#4e65be", color:"#fff", fontWeight:700, border:"none", marginBottom:8, transition:"all .2s" }}>📷 Start Camera</button>}
          {scanning===true && <button onClick={scan} className="btn-blue" style={{ width:"100%", padding:"12px", borderRadius:11, background:"#22C55E", color:"#fff", fontWeight:700, border:"none", marginBottom:8, transition:"all .2s" }}>📸 Identify This Pill</button>}
          {(scanning==="error"||!scanning) && <button onClick={scan} style={{ width:"100%", padding:"12px", borderRadius:11, background:"#F1F5F9", color:"#4A5568", fontWeight:700, border:"none", cursor:"pointer" }}>🎯 Try Demo Scan</button>}
        </div>
        <div>
          {result ? (
            <div style={{ background:"#F8FAFC", border:"1.5px solid #E2E8F0", borderRadius:14, padding:"18px" }}>
              <div style={{ fontWeight:800, color:"#1E2A5A", fontSize:18, marginBottom:4 }}>{result.name}</div>
              <div style={{ fontSize:13, color:"#94A3B8", marginBottom:16 }}>{result.generic}</div>
              {[["💊","Appearance",result.color],["🏭","Manufacturer",result.manufacturer],["🩺","Uses",result.uses],["⚠️","Side Effects",result.sideEffects],["🚫","Warning",result.warning],["🔗","Interactions",result.interaction]].map(([i,l,v])=>(
                <div key={l} style={{ marginBottom:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:.8 }}>{i} {l}</div>
                  <div style={{ fontSize:13, color:"#374151", marginTop:3, lineHeight:1.5 }}>{v}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", color:"#94A3B8", textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>💊</div>
              <div style={{ fontWeight:600 }}>Pill information<br/>will appear here</div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ── VACCINATION TRACKER MODAL ─────────────────────────
function VaccinationModal({ onClose }) {
  const [vaccines, setVaccines] = useState([
    { name:"COVID-19 (Covishield)", date:"2023-03-15", dose:"2nd dose", status:"done" },
    { name:"Influenza (Flu)",       date:"2024-10-01", dose:"Annual",   status:"done" },
    { name:"Hepatitis B",           date:"2022-06-20", dose:"3rd dose", status:"done" },
    { name:"Tetanus (Td)",          date:"2020-01-10", dose:"Booster",  status:"done" },
  ]);
  const upcoming = [
    { name:"Influenza (Flu)", due:"October 2026", note:"Annual vaccine recommended" },
    { name:"COVID-19 Booster", due:"March 2026",   note:"Booster recommended after 1 year" },
  ];
  const [form, setForm] = useState({ name:"", date:"", dose:"" });

  return (
    <Modal onClose={onClose} wide>
      <ModalHeader icon="💉" title="Vaccination Tracker" sub="Track your immunization history" onClose={onClose} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Vaccination History</div>
          {vaccines.map((v,i)=>(
            <div key={i} style={{ display:"flex", gap:12, padding:"12px 14px", background:"#ECFDF5", borderRadius:12, marginBottom:8, border:"1px solid #BBF7D0" }}>
              <span style={{ fontSize:20 }}>✅</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#1E2A5A" }}>{v.name}</div>
                <div style={{ fontSize:12, color:"#64748B" }}>{v.dose} · {v.date}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop:20, padding:"14px", background:"#F8FAFC", borderRadius:12, border:"1px solid #E2E8F0" }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Add Vaccine</div>
            <input placeholder="Vaccine name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={{ ...iStyle, marginBottom:8 }} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
              <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={iStyle} />
              <input placeholder="Dose (1st, 2nd…)" value={form.dose} onChange={e=>setForm(f=>({...f,dose:e.target.value}))} style={iStyle} />
            </div>
            <button onClick={()=>{ if(!form.name) return; setVaccines(v=>[...v,{...form,status:"done"}]); setForm({name:"",date:"",dose:""}); }} className="btn-blue" style={{ width:"100%", padding:"10px", borderRadius:9, background:"#4e65be", color:"#fff", fontWeight:700, border:"none", fontSize:13, transition:"all .2s" }}>+ Add Vaccine</button>
          </div>
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Upcoming / Recommended</div>
          {upcoming.map((u,i)=>(
            <div key={i} style={{ display:"flex", gap:12, padding:"14px", background:"#FEF3C7", borderRadius:12, marginBottom:10, border:"1px solid #FCD34D" }}>
              <span style={{ fontSize:20 }}>⏰</span>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:"#1E2A5A" }}>{u.name}</div>
                <div style={{ fontSize:12, color:"#D97706", fontWeight:600 }}>Due: {u.due}</div>
                <div style={{ fontSize:12, color:"#64748B", marginTop:2 }}>{u.note}</div>
              </div>
            </div>
          ))}
          <div style={{ background:"#EBF4FF", borderRadius:12, padding:"16px", border:"1px solid #BFDBFE", marginTop:10 }}>
            <div style={{ fontWeight:700, color:"#1E2A5A", marginBottom:8 }}>💡 Recommended for your age</div>
            {["Annual Flu Shot","COVID-19 Booster","Shingles (after 50)","Pneumococcal (after 65)"].map(v=>(
              <div key={v} style={{ fontSize:13, color:"#4A5568", padding:"5px 0", borderBottom:"1px solid #BFDBFE", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ color:"#4e65be" }}>→</span>{v}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── APPOINTMENT MODAL ─────────────────────────────────
function AppointmentModal({ onClose }) {
  const [appts, setAppts] = useState([
    { doctor:"Dr. Mehta (Cardiologist)", date:"2026-03-05", time:"10:30 AM", location:"Apollo Hospital", notes:"Bring ECG reports" },
    { doctor:"Dr. Patel (Diabetologist)",date:"2026-03-18", time:"2:00 PM",  location:"Fortis Clinic",  notes:"Fasting blood test required" },
  ]);
  const [form, setForm] = useState({ doctor:"", date:"", time:"", location:"", notes:"" });

  const getDaysLeft = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr)-new Date())/(1000*60*60*24));
    return diff;
  };

  return (
    <Modal onClose={onClose} wide>
      <ModalHeader icon="📅" title="Appointments" sub="Upcoming doctor visits and reminders" onClose={onClose} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Upcoming Appointments</div>
          {appts.map((a,i)=>{
            const days = getDaysLeft(a.date);
            return (
              <div key={i} style={{ background:"#F8FAFC", borderRadius:14, padding:"16px", marginBottom:12, border:`1px solid ${days<=3?"#FCA5A5":days<=7?"#FCD34D":"#E2E8F0"}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <div style={{ fontWeight:700, color:"#1E2A5A", fontSize:14 }}>{a.doctor}</div>
                  <span style={{ fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:100, background:days<=3?"#FEE2E2":days<=7?"#FEF3C7":"#EBF4FF", color:days<=3?"#EF4444":days<=7?"#D97706":"#4e65be" }}>
                    {days<=0?"Today!":days===1?"Tomorrow":`${days} days`}
                  </span>
                </div>
                <div style={{ fontSize:13, color:"#64748B" }}>📅 {a.date} · ⏰ {a.time}</div>
                <div style={{ fontSize:13, color:"#64748B" }}>📍 {a.location}</div>
                {a.notes && <div style={{ fontSize:12, color:"#94A3B8", marginTop:6, fontStyle:"italic" }}>📝 {a.notes}</div>}
              </div>
            );
          })}
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Add Appointment</div>
          <div style={{ background:"#F8FAFC", borderRadius:14, padding:"18px", border:"1px solid #E2E8F0" }}>
            {[["Doctor / Specialist","doctor","text","e.g. Dr. Sharma (Cardiologist)"],["Location","location","text","Hospital / Clinic name"],["Notes","notes","text","Bring reports, fasting required…"]].map(([l,k,t,p])=>(
              <div key={k} style={{ marginBottom:12 }}>
                <label style={lStyle}>{l}</label>
                <input type={t} placeholder={p} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={iStyle} />
              </div>
            ))}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              <div><label style={lStyle}>Date</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={iStyle} /></div>
              <div><label style={lStyle}>Time</label><input type="time" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} style={iStyle} /></div>
            </div>
            <button onClick={()=>{ if(!form.doctor||!form.date) return; setAppts(a=>[...a,form]); setForm({doctor:"",date:"",time:"",location:"",notes:""}); }} className="btn-blue" style={{ width:"100%", padding:"12px", borderRadius:11, background:"#4e65be", color:"#fff", fontWeight:700, border:"none", transition:"all .2s" }}>+ Add Appointment</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── MOOD TRACKER ───────────────────────────────────────
function MoodWidget({ dark }) {
  const moods = [{ e:"😢",l:"Terrible",c:"#EF4444" },{ e:"😕",l:"Bad",c:"#F59E0B" },{ e:"😐",l:"Okay",c:"#94A3B8" },{ e:"🙂",l:"Good",c:"#22C55E" },{ e:"😄",l:"Great!",c:"#10B981" }];
  const [selected, setSelected] = useState(null);
  const [history] = useState([4,3,4,5,3,4,5]);
  const C = COLORS[dark?"dark":"light"];

  return (
    <div style={{ background:C.card, borderRadius:16, padding:"18px 20px", border:`1px solid ${C.border}`, marginBottom:16 }}>
      <div style={{ fontWeight:700, color:C.text, marginBottom:14, fontSize:14 }}>😊 How are you feeling today?</div>
      <div style={{ display:"flex", gap:10, justifyContent:"space-around", marginBottom:14 }}>
        {moods.map((m,i)=>(
          <button key={i} onClick={()=>setSelected(i)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"10px 8px", borderRadius:12, border:`2px solid ${selected===i?m.c:C.border}`, background:selected===i?m.c+"18":C.surface, cursor:"pointer", flex:1, transition:"all .2s" }}>
            <span style={{ fontSize:26 }}>{m.e}</span>
            <span style={{ fontSize:10, fontWeight:700, color:selected===i?m.c:C.textSoft }}>{m.l}</span>
          </button>
        ))}
      </div>
      {selected!==null && <div style={{ textAlign:"center", fontSize:13, color:moods[selected].c, fontWeight:700 }}>Mood logged! ✓</div>}
      <div style={{ marginTop:12 }}>
        <div style={{ fontSize:11, color:C.textSoft, marginBottom:6, fontWeight:600 }}>LAST 7 DAYS</div>
        <div style={{ display:"flex", gap:4, alignItems:"flex-end", height:40 }}>
          {history.map((h,i)=>(
            <div key={i} style={{ flex:1, height:`${h*8}px`, background:moods[h-1].c, borderRadius:"4px 4px 0 0", opacity:.7, transition:"height .4s ease" }} title={moods[h-1].l} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MEDICATION HISTORY TIMELINE ───────────────────────
function MedTimeline({ meds, dark }) {
  const C = COLORS[dark?"dark":"light"];
  const days = Array.from({length:30},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-29+i);
    return { label:d.getDate(), missed:Math.random()<.1, taken:Math.random()>.05 };
  });
  return (
    <div style={{ background:C.card, borderRadius:16, padding:"18px 20px", border:`1px solid ${C.border}` }}>
      <div style={{ fontWeight:700, color:C.text, marginBottom:14, display:"flex", justifyContent:"space-between" }}>
        <span>📅 30-Day Adherence Timeline</span>
        <div style={{ display:"flex", gap:12, fontSize:12 }}>
          {[["#22C55E","Taken"],["#EF4444","Missed"],["#E2E8F0","No data"]].map(([c,l])=><span key={l} style={{ display:"flex", alignItems:"center", gap:4, color:C.textMid }}><span style={{ width:10, height:10, borderRadius:3, background:c, display:"inline-block" }}/>{l}</span>)}
        </div>
      </div>
      <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
        {days.map((d,i)=>(
          <div key={i} title={`Day ${d.label}: ${d.missed?"Missed":d.taken?"Taken":"No data"}`}
            style={{ width:28, height:28, borderRadius:6, background:d.missed?"#FEE2E2":d.taken?"#ECFDF5":C.border, border:`1.5px solid ${d.missed?"#FCA5A5":d.taken?"#86EFAC":C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"default" }}>
            <span style={{ fontSize:9, fontWeight:700, color:d.missed?"#EF4444":d.taken?"#16A34A":C.textSoft }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── WEEKLY REPORT (print) ─────────────────────────────
function printReport(meds, streak, adherencePct) {
  const w = window.open("","_blank","width=800,height=600");
  if (!w) return;
  w.document.write(`
    <!DOCTYPE html><html><head><title>MedGuard AI — Weekly Health Report</title>
    <style>body{font-family:Inter,system-ui,sans-serif;padding:40px;color:#1E2A5A;max-width:700px;margin:0 auto}
    h1{color:#4e65be;font-size:28px;margin-bottom:4px}
    .badge{background:#ECFDF5;color:#16A34A;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:700}
    table{width:100%;border-collapse:collapse;margin-top:20px}
    th{background:#4e65be;color:white;padding:10px 14px;text-align:left;font-size:13px}
    td{padding:10px 14px;border-bottom:1px solid #E2E8F0;font-size:14px}
    .stat{background:#EBF4FF;border-radius:12px;padding:16px;text-align:center;display:inline-block;margin:8px;min-width:130px}
    .stat-val{font-size:28px;font-weight:900;color:#4e65be}
    footer{margin-top:40px;font-size:12px;color:#94A3B8;border-top:1px solid #E2E8F0;padding-top:16px}
    @media print{button{display:none}}
    </style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <div><h1>💙 MedGuard AI</h1><p style="color:#64748B;margin-top:4px">Weekly Health Report — ${new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</p></div>
      <span class="badge">Patient: Arjun Patel</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:0">
      <div class="stat"><div class="stat-val">${adherencePct}%</div><div style="font-size:13px;color:#64748B;margin-top:4px">Adherence Rate</div></div>
      <div class="stat"><div class="stat-val">${streak}</div><div style="font-size:13px;color:#64748B;margin-top:4px">Day Streak 🔥</div></div>
      <div class="stat"><div class="stat-val">${meds.length}</div><div style="font-size:13px;color:#64748B;margin-top:4px">Active Meds</div></div>
      <div class="stat"><div class="stat-val">0</div><div style="font-size:13px;color:#64748B;margin-top:4px">Interactions</div></div>
    </div>
    <h3 style="margin-top:28px">💊 Current Medications</h3>
    <table><tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Purpose</th><th>Status</th></tr>
    ${meds.map(m=>`<tr><td>${m.name}</td><td>${m.dosage||"—"}</td><td>${m.frequency}</td><td>${m.purpose||"—"}</td><td style="color:${m.status==="taken"?"#16A34A":"#D97706"}">${m.status==="taken"?"✓ Taken Today":"Pending"}</td></tr>`).join("")}
    </table>
    <footer>Generated by MedGuard AI · ${new Date().toLocaleString()} · This report is for informational purposes only. Share with your healthcare provider.</footer>
    <script>window.onload=function(){window.print()}</script>
    </body></html>
  `);
  w.document.close();
}

// ── REAL AI CHAT ───────────────────────────────────────
function AIChatTab({ dark }) {
  const C = COLORS[dark?"dark":"light"];
  const [history, setHistory] = useState([
    { from:"ai", text:"Hello! I'm your MedGuard AI assistant powered by Claude. I can help with medication info, drug interactions, symptom guidance, and personalized health advice. What can I help you with today?" }
  ]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const onVoiceResult = useCallback((text) => setMsg(text), []);
  const { listening, start, stop } = useSpeech(onVoiceResult);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [history, loading]);

  const send = async () => {
    const m = msg.trim(); if (!m||loading) return;
    setMsg(""); setHistory(h=>[...h,{from:"user",text:m}]); setLoading(true);
    try {
      const messages = history.filter(x=>x.from!=="system").map(x=>({ role:x.from==="user"?"user":"assistant", content:x.text }));
      messages.push({ role:"user", content:m });
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:`You are MedGuard AI, a friendly health assistant. Help patients with medication info, drug interactions, symptom guidance, and general health advice. Be warm, concise (under 120 words), use occasional emojis. Always end medical-decision responses with: "Please consult your doctor for personalized advice."`,
          messages })
      });
      const data = await res.json();
      setHistory(h=>[...h,{from:"ai",text:data.content?.[0]?.text||"I'm having trouble connecting. Please try again."}]);
    } catch { setHistory(h=>[...h,{from:"ai",text:"⚠️ Connection error. Please check your network and try again."}]); }
    finally { setLoading(false); }
  };

  const suggested = ["What are the side effects of Metformin?","Can I take ibuprofen with Lisinopril?","Is 90% medication adherence good?","What foods should I avoid with blood thinners?"];

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:24 }}>
      <div style={{ background:C.card, borderRadius:20, padding:"24px", border:`1px solid ${C.border}`, display:"flex", flexDirection:"column", height:620 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${C.border}` }}>
          <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#4e65be,#8b64ce)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>🤖</div>
          <div>
            <div style={{ fontWeight:700, color:C.text }}>MedGuard AI Assistant</div>
            <div style={{ fontSize:12, color:"#22C55E", display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#22C55E", animation:"pulse 1.8s infinite" }}/>
              Online · Powered by Claude AI
            </div>
          </div>
          <div style={{ marginLeft:"auto", padding:"5px 12px", background:"#ECFDF5", borderRadius:100, fontSize:12, color:"#16A34A", fontWeight:700 }}>🟢 Live AI</div>
        </div>
        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:12, marginBottom:16, paddingRight:4 }}>
          {history.map((m,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:m.from==="user"?"flex-end":"flex-start", alignItems:"flex-end", gap:8 }}>
              {m.from==="ai" && <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#4e65be,#8b64ce)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>🤖</div>}
              <div style={{ maxWidth:"78%", padding:"12px 16px", borderRadius:m.from==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px", background:m.from==="user"?"#4e65be":C.surface, color:m.from==="user"?"#fff":C.text, fontSize:14, lineHeight:1.7, border:m.from==="ai"?`1px solid ${C.border}`:"none", whiteSpace:"pre-wrap" }}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display:"flex", alignItems:"flex-end", gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#4e65be,#8b64ce)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🤖</div>
              <div style={{ padding:"14px 18px", borderRadius:"18px 18px 18px 4px", background:C.surface, border:`1px solid ${C.border}`, display:"flex", gap:5 }}>
                <div className="dot1" style={{ width:8, height:8, borderRadius:"50%", background:"#94A3B8" }}/>
                <div className="dot2" style={{ width:8, height:8, borderRadius:"50%", background:"#94A3B8" }}/>
                <div className="dot3" style={{ width:8, height:8, borderRadius:"50%", background:"#94A3B8" }}/>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={listening?stop:start} style={{ padding:"13px 14px", borderRadius:12, background:listening?"#FEE2E2":"#F1F5F9", border:`1.5px solid ${listening?"#EF4444":C.border}`, fontSize:18, cursor:"pointer", transition:"all .2s" }} title={listening?"Stop recording":"Voice input"}>
            {listening?"🔴":"🎤"}
          </button>
          <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
            placeholder={listening?"Listening…":"Ask about medications, symptoms, drug interactions…"}
            style={{ flex:1, padding:"13px 16px", border:`1.5px solid ${C.border}`, borderRadius:12, fontSize:14, outline:"none", background:C.inputBg, color:C.text }}/>
          <button onClick={send} disabled={loading} className="btn-blue" style={{ padding:"13px 20px", borderRadius:12, background:loading?"#94A3B8":"#4e65be", color:"#fff", fontWeight:700, fontSize:14, border:"none", transition:"all .2s", cursor:loading?"not-allowed":"pointer" }}>
            {loading?"…":"Send ➤"}
          </button>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div style={{ background:C.card, borderRadius:16, padding:"18px", border:`1px solid ${C.border}` }}>
          <div style={{ fontWeight:700, color:C.text, marginBottom:12, fontSize:14 }}>💡 Suggested Questions</div>
          {suggested.map(q=>(
            <button key={q} onClick={()=>setMsg(q)} style={{ width:"100%", textAlign:"left", padding:"10px 12px", borderRadius:10, background:C.surface, border:`1px solid ${C.border}`, fontSize:13, color:C.textMid, cursor:"pointer", marginBottom:8, lineHeight:1.45 }}>{q}</button>
          ))}
        </div>
        <div style={{ background:"linear-gradient(135deg,#4e65be,#8b64ce)", borderRadius:16, padding:"18px", color:"#fff" }}>
          <div style={{ fontWeight:700, marginBottom:8 }}>⚠️ Medical Disclaimer</div>
          <p style={{ fontSize:12, opacity:.85, lineHeight:1.65 }}>This AI provides general health information only. It is not a substitute for professional medical advice. Always consult your doctor.</p>
        </div>
        <div style={{ background:"#ECFDF5", borderRadius:14, padding:"14px", border:"1px solid #BBF7D0" }}>
          <div style={{ fontWeight:700, color:"#16A34A", marginBottom:6, fontSize:13 }}>🔒 Your Privacy</div>
          <p style={{ fontSize:12, color:"#166534", lineHeight:1.6 }}>Conversations are encrypted and never stored. Your health data stays private.</p>
        </div>
      </div>
    </div>
  );
}

// ── PATIENT PORTAL ────────────────────────────────────
function PatientPortal({ setPage, dark, setDark, lang, setLang }) {
  const L = T[lang];
  const C = COLORS[dark?"dark":"light"];
  const { toasts, show } = useToast();
  const offline = useOffline();
  const [tab, setTab] = useState("dashboard");
  const [showAddModal,      setShowAddModal]      = useState(false);
  const [showInteraction,   setShowInteraction]   = useState(false);
  const [showSOS,           setShowSOS]           = useState(false);
  const [showSymptoms,      setShowSymptoms]      = useState(false);
  const [showScanner,       setShowScanner]       = useState(false);
  const [showVaccines,      setShowVaccines]      = useState(false);
  const [showAppointments,  setShowAppointments]  = useState(false);
  const [apiConnected,     setApiConnected]     = useState(null); // null=checking, true=ok, false=error

  const [meds, setMeds] = useState([
    { name:"Metformin",    dosage:"500mg", time:"8:00 AM",  status:"taken",    icon:"💊", frequency:"Twice daily",  purpose:"Diabetes management", refill:5 },
    { name:"Aspirin",      dosage:"100mg", time:"2:00 PM",  status:"upcoming", icon:"💊", frequency:"Once daily",    purpose:"Blood thinner",       refill:12 },
    { name:"Lisinopril",   dosage:"10mg",  time:"9:00 PM",  status:"upcoming", icon:"💊", frequency:"Once daily",    purpose:"Blood pressure",      refill:20 },
    { name:"Atorvastatin", dosage:"20mg",  time:"10:00 PM", status:"upcoming", icon:"💊", frequency:"Once at night", purpose:"Cholesterol",         refill:3 },
  ]);
  const [streak, setStreak] = useState(12);
  const knownAllergies = ["Penicillin","Sulfa","Codeine"];

  // ── CHECK CONNECTION ──
  useEffect(() => {
    fetch("http://127.0.0.1:8000/")
      .then(res => res.ok ? setApiConnected(true) : setApiConnected(false))
      .catch(() => setApiConnected(false));
  }, []);

  const takenCount    = meds.filter(m=>m.status==="taken").length;
  const adherencePct  = Math.round((takenCount/meds.length)*100);
  const healthScore   = Math.min(100, Math.round(adherencePct*.5 + streak*2 + (meds.length>0?20:0)));
  const refillAlerts  = meds.filter(m=>m.refill<=7);

  const markTaken = (idx) => {
    if (meds[idx].status==="taken") return;
    setMeds(p=>p.map((m,i)=>i===idx?{...m,status:"taken"}:m));
    show("💊","Medication Taken!",`${meds[idx].name} ${meds[idx].dosage} marked as taken ✅`,"success");
  };

  const handleAddMed = (form) => {
    const timeStr = form.time ? new Date(`2000-01-01T${form.time}`).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : "TBD";
    setMeds(p=>[...p,{ name:form.name, dosage:form.dosage, time:timeStr, status:"upcoming", icon:"💊", frequency:form.frequency, purpose:form.purpose||"General", refill:30, notes:form.notes }]);
    show("➕","Medication Added!",`${form.name} ${form.dosage} added to your schedule.`,"info");
  };

  const TABS = ["dashboard","medications","ai-advisor","analytics","symptoms","vaccinations","appointments","settings"];

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <Toast toasts={toasts}/>
      {offline && <OfflineBanner dark={dark}/>}
      {showAddModal      && <AddMedModal onClose={()=>setShowAddModal(false)} onAdd={handleAddMed} knownAllergies={knownAllergies}/>}
      {showInteraction   && <DrugInteractionModal onClose={()=>setShowInteraction(false)}/>}
      {showSOS           && <EmergencySOSModal onClose={()=>setShowSOS(false)}/>}
      {showSymptoms      && <SymptomLoggerModal onClose={()=>setShowSymptoms(false)} meds={meds} show={show}/>}
      {showScanner       && <PillScannerModal onClose={()=>setShowScanner(false)}/>}
      {showVaccines      && <VaccinationModal onClose={()=>setShowVaccines(false)}/>}
      {showAppointments  && <AppointmentModal onClose={()=>setShowAppointments(false)}/>}

      {/* Refill alert banner */}
      {refillAlerts.length>0 && (
        <div style={{ background:"#FEF3C7", borderBottom:"1px solid #FCD34D", padding:"10px 40px", display:"flex", alignItems:"center", gap:10, fontSize:14, color:"#92400E", fontWeight:600 }}>
          <span>⚠️</span>
          <span>Refill needed soon: {refillAlerts.map(m=>`${m.name} (${m.refill} days left)`).join(" · ")}</span>
          <button style={{ marginLeft:"auto", padding:"5px 14px", borderRadius:8, background:"#D97706", color:"#fff", border:"none", fontSize:13, fontWeight:700, cursor:"pointer" }}>Order Refill</button>
        </div>
      )}

      {/* Topbar */}
      <div style={{ background:C.navBg, borderBottom:`1px solid ${C.border}`, padding:"0 40px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 1px 8px rgba(0,0,0,.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={()=>setPage("home")}>
          <div style={{ width:32, height:32, borderRadius:9, background:"#4e65be", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>💙</div>
          <span style={{ fontWeight:800, fontSize:18, color:"#4e65be" }}>MedGuard AI</span>
          <span style={{ background:C.bg, color:"#4e65be", fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:100 }}>Patient Portal</span>
        </div>
        <div style={{ display:"flex", gap:3, flexWrap:"wrap", justifyContent:"center" }}>
          {TABS.map(t=>(
            <button key={t} className="tab-btn" onClick={()=>setTab(t)} style={{ padding:"7px 13px", borderRadius:9, background:tab===t?"#4e65be":"transparent", color:tab===t?"#fff":C.textMid, fontWeight:tab===t?700:500, fontSize:13, border:"none", textTransform:"capitalize", transition:"all .2s" }}>
              {L[t]||t.replace("-"," ")}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {/* Language switcher */}
          <select value={lang} onChange={e=>setLang(e.target.value)} style={{ padding:"5px 8px", borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, color:C.text, fontSize:13, cursor:"pointer", outline:"none" }}>
            {Object.entries(T).map(([k,v])=><option key={k} value={k}>{v.langName}</option>)}
          </select>
          {/* Dark mode */}
          <button onClick={()=>setDark(d=>!d)} style={{ padding:"7px 12px", borderRadius:9, background:C.surface, border:`1px solid ${C.border}`, cursor:"pointer", fontSize:16 }} title="Toggle dark mode">{dark?"☀️":"🌙"}</button>
          <div style={{ width:8, height:8, borderRadius:"50%", background: apiConnected ? "#22C55E" : apiConnected === false ? "#EF4444" : "#94A3B8", animation:"pulse 1.8s infinite" }}/>
          <span style={{ fontSize:13, color:C.textMid }}>{apiConnected ? "API Connected" : apiConnected === false ? "API Offline" : "Checking API..."}</span>
          <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#4e65be,#8b64ce)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:16 }}>A</div>
        </div>
      </div>

      <div style={{ padding:"28px 40px" }}>

        {/* ── DASHBOARD ── */}
        {tab==="dashboard" && (
          <>
            {/* Welcome banner */}
            <div style={{ background:"linear-gradient(135deg,#4e65be,#3a52b0)", borderRadius:20, padding:"26px 36px", marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center", color:"#fff" }}>
              <div>
                <div style={{ fontSize:22, fontWeight:800, marginBottom:6 }}>{L.goodMorning}, Arjun! 👋</div>
                <div style={{ fontSize:15, opacity:.85 }}>
                  {meds.filter(m=>m.status==="upcoming").length} medications remaining · Streak: <strong>{streak} days 🔥</strong>
                </div>
                <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
                  {meds.map((m,i)=>(
                    <span key={i} style={{ padding:"4px 12px", borderRadius:100, background:m.status==="taken"?"rgba(34,197,94,.25)":"rgba(255,255,255,.15)", border:`1px solid ${m.status==="taken"?"rgba(34,197,94,.5)":"rgba(255,255,255,.25)"}`, fontSize:12, fontWeight:600 }}>
                      {m.status==="taken"?"✓ ":""}{m.name}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", gap:24, alignItems:"center" }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:11, opacity:.7, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Today's Adherence</div>
                  <AdherenceRing pct={adherencePct} size={110} dark={dark}/>
                  <div style={{ fontSize:11, opacity:.7, marginTop:4 }}>{takenCount}/{meds.length} doses</div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:11, opacity:.7, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>{L.healthScore}</div>
                  <HealthScoreRing score={healthScore}/>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
              {[["💊",L.medications,`${takenCount}/${meds.length}`,`${meds.filter(m=>m.status==="upcoming").length} remaining`,C.bg,"#4e65be"],["🔥",L.streak,`${streak}d`,"days in a row","#FEF3C7","#D97706"],["⚠️",L.interactions,"0","all clear today","#ECFDF5","#16A34A"],["🤖",L.aiInsights,"5","new insights","#F5F0FF","#8b64ce"]].map(([i,l,v,s,bg,c])=>(
                <div key={l} style={{ background:C.card, borderRadius:16, padding:"18px 20px", border:`1px solid ${C.border}`, boxShadow:"0 2px 10px rgba(0,0,0,.05)" }}>
                  <div style={{ width:40, height:40, borderRadius:11, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:10 }}>{i}</div>
                  <div style={{ fontSize:28, fontWeight:900, color:c }}>{v}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text, marginTop:2 }}>{l}</div>
                  <div style={{ fontSize:11, color:C.textSoft, marginTop:2 }}>{s}</div>
                </div>
              ))}
            </div>

            {/* Mood tracker */}
            <MoodWidget dark={dark}/>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:20, marginBottom:20 }}>
              {/* Medication schedule */}
              <div style={{ background:C.card, borderRadius:18, padding:"22px 24px", border:`1px solid ${C.border}`, boxShadow:"0 2px 10px rgba(0,0,0,.05)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                  <h3 style={{ fontSize:16, fontWeight:700, color:C.text }}>Today's Medication Schedule</h3>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={()=>setShowInteraction(true)} style={{ padding:"7px 12px", borderRadius:9, background:"#FEF3C7", color:"#D97706", fontWeight:700, fontSize:12, border:"none", cursor:"pointer" }}>⚗️ Check Interactions</button>
                    <button onClick={()=>setShowAddModal(true)} className="btn-blue" style={{ padding:"7px 14px", borderRadius:9, background:"#4e65be", color:"#fff", fontWeight:700, fontSize:12, border:"none", transition:"all .2s" }}>{L.addMed}</button>
                  </div>
                </div>
                {meds.map((m,i)=>(
                  <div key={i} className="med-row" style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 10px", borderBottom:i<meds.length-1?`1px solid ${C.border}`:"none", borderRadius:10, transition:"background .15s" }}>
                    <div style={{ width:46, height:46, borderRadius:13, background:m.status==="taken"?"#ECFDF5":C.bg, border:`1.5px solid ${m.status==="taken"?"#22C55E":C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0, transition:"all .3s" }}>{m.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{m.name} {m.dosage}</div>
                      <div style={{ fontSize:12, color:C.textSoft }}>⏰ {m.time} · {m.frequency}</div>
                      {m.refill<=7 && <div style={{ fontSize:11, color:"#D97706", fontWeight:600, marginTop:2 }}>⚠️ Refill in {m.refill} days</div>}
                    </div>
                    {m.status==="taken"
                      ? <div style={{ padding:"6px 14px", borderRadius:100, background:"#ECFDF5", color:"#16A34A", fontSize:13, fontWeight:700 }}>✓ {L.taken.replace("✓ ","")}</div>
                      : <button onClick={()=>markTaken(i)} className="btn-blue" style={{ padding:"8px 16px", borderRadius:9, background:"#4e65be", color:"#fff", fontSize:12, fontWeight:700, border:"none", transition:"all .2s" }}>{L.markTaken}</button>
                    }
                  </div>
                ))}
                <div style={{ marginTop:16, background:C.bg, borderRadius:12, padding:"12px 14px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:C.textMid }}>{L.dailyProgress}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:"#4e65be" }}>{takenCount}/{meds.length}</span>
                  </div>
                  <div style={{ height:9, borderRadius:8, background:C.border, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${adherencePct}%`, background:"linear-gradient(90deg,#4e65be,#3a52b0)", borderRadius:8, transition:"width .7s ease" }}/>
                  </div>
                  {takenCount===meds.length && <div style={{ textAlign:"center", marginTop:10, fontSize:14, fontWeight:700, color:"#16A34A" }}>🎉 All medications taken today!</div>}
                </div>
              </div>

              {/* Right column */}
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {/* AI Insights */}
                <div style={{ background:"linear-gradient(135deg,#1E2A5A,#3a52b0)", borderRadius:18, padding:"18px 20px", color:"#fff" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#4e65be,#8b64ce)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🤖</div>
                    <div><div style={{ fontWeight:700, fontSize:13 }}>AI Health Insights</div><div style={{ fontSize:11, opacity:.6 }}>Powered by Claude AI</div></div>
                    <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5 }}><div style={{ width:6, height:6, borderRadius:"50%", background:"#22C55E", animation:"pulse 1.5s infinite" }}/><span style={{ fontSize:11, color:"#22C55E" }}>Live</span></div>
                  </div>
                  <div style={{ background:"rgba(255,255,255,.08)", borderRadius:10, padding:"10px 13px", marginBottom:8, fontSize:13, color:"#CBD5E1", lineHeight:1.6 }}>💡 Blood pressure stable this week. Great consistency!</div>
                  <div style={{ background:"rgba(245,158,11,.15)", borderRadius:10, padding:"10px 13px", border:"1px solid rgba(245,158,11,.3)", fontSize:13, color:"#FCD34D", lineHeight:1.6 }}>⏰ Annual flu vaccine due. Schedule an appointment?</div>
                  <button onClick={()=>setTab("ai-advisor")} style={{ width:"100%", marginTop:10, padding:"9px", borderRadius:10, background:"#4e65be", color:"#fff", fontSize:13, fontWeight:700, border:"none", cursor:"pointer" }}>💬 Chat with AI Assistant →</button>
                </div>

                {/* Quick Actions */}
                <div style={{ background:C.card, borderRadius:18, padding:"16px 18px", border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:12 }}>Quick Actions</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                    {[["➕","Add Med",C.bg,"#4e65be",()=>setShowAddModal(true)],["🔍","Scan Pill",C.bg,"#4e65be",()=>setShowScanner(true)],["⚗️","Drug Check","#FEF3C7","#D97706",()=>setShowInteraction(true)],["🆘","SOS","#FEE2E2","#EF4444",()=>setShowSOS(true)],["📋","Symptoms",C.bg,"#4e65be",()=>setShowSymptoms(true)],["📅","Schedule",C.bg,"#4e65be",()=>setShowAppointments(true)]].map(([i,l,bg,c,fn])=>(
                      <button key={l} onClick={fn} style={{ background:bg, borderRadius:11, padding:"11px 5px", border:`1.5px solid ${c==="#EF4444"?"#FCA5A5":C.border}`, cursor:"pointer", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:5, transition:"all .2s" }}>
                        <span style={{ fontSize:20 }}>{i}</span>
                        <span style={{ fontSize:11, fontWeight:700, color:c, lineHeight:1.2 }}>{l}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Safety */}
                <div style={{ background:C.card, borderRadius:16, padding:"14px 16px", border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>🛡️ {L.safetyDash}</div>
                  {[["Drug Interactions","All Clear","#ECFDF5","#16A34A"],["Allergy Conflicts","No Flags","#ECFDF5","#16A34A"],["Dosage Accuracy","Optimal",C.bg,"#4e65be"],["Next Refill","3 days","#FEF3C7","#D97706"]].map(([l,s,bg,c])=>(
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:`1px solid ${C.border}` }}>
                      <span style={{ fontSize:13, color:C.textMid }}>{l}</span>
                      <span style={{ fontSize:11, fontWeight:700, color:c, background:bg, padding:"3px 9px", borderRadius:100 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <MedTimeline meds={meds} dark={dark}/>
          </>
        )}

        {tab==="medications" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
              <h2 style={{ fontSize:22, fontWeight:800, color:C.text }}>{L.medications}</h2>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>printReport(meds,streak,adherencePct)} style={{ padding:"10px 18px", borderRadius:10, background:C.surface, border:`1px solid ${C.border}`, color:C.textMid, fontWeight:600, fontSize:13, cursor:"pointer" }}>📄 {L.weeklyReport}</button>
                <button onClick={()=>setShowAddModal(true)} className="btn-blue" style={{ padding:"10px 20px", borderRadius:10, background:"#4e65be", color:"#fff", fontWeight:700, fontSize:14, border:"none", transition:"all .2s" }}>{L.addMed}</button>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
              {meds.map((m,i)=>{
                const colorMap = [["#ECFDF5","#16A34A"],["#EBF4FF","#4e65be"],["#FEF3C7","#D97706"],["#F5F0FF","#8b64ce"]];
                const [bg,c] = colorMap[i%colorMap.length];
                return (
                  <div key={i} style={{ background:C.card, borderRadius:16, padding:"18px", border:`1px solid ${C.border}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <div style={{ width:44, height:44, borderRadius:12, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{m.icon}</div>
                      <span style={{ fontSize:12, fontWeight:700, color:c, background:bg, padding:"4px 10px", borderRadius:100, alignSelf:"start" }}>Active</span>
                    </div>
                    <div style={{ fontWeight:700, color:C.text, marginBottom:3 }}>{m.name} {m.dosage}</div>
                    <div style={{ fontSize:13, color:C.textMid, marginBottom:2 }}>🔁 {m.frequency}</div>
                    <div style={{ fontSize:13, color:C.textSoft, marginBottom:10 }}>{m.purpose}</div>
                    {m.refill<=7 && <div style={{ fontSize:12, color:"#D97706", fontWeight:600, marginBottom:8 }}>⚠️ Refill in {m.refill} days</div>}
                    <button onClick={()=>markTaken(i)} disabled={m.status==="taken"} className={m.status!=="taken"?"btn-blue":""} style={{ width:"100%", padding:"9px", borderRadius:9, background:m.status==="taken"?"#ECFDF5":"#4e65be", color:m.status==="taken"?"#16A34A":"#fff", fontWeight:700, fontSize:13, border:`1px solid ${m.status==="taken"?"#6EE7B7":"transparent"}`, cursor:m.status==="taken"?"default":"pointer", transition:"all .2s" }}>
                      {m.status==="taken"?"✓ Taken Today":L.markTaken}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="ai-advisor"    && <AIChatTab dark={dark}/>}

        {tab==="analytics" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
              {[["📅","This Month","27/30 doses taken","90% adherence"],["📈","Best Streak","14 days","Personal record!"],["⭐","Avg Adherence","92%","Last 3 months"]].map(([i,l,v,s])=>(
                <div key={l} style={{ background:C.card, borderRadius:18, padding:"26px 22px", border:`1px solid ${C.border}`, textAlign:"center" }}>
                  <div style={{ fontSize:38, marginBottom:10 }}>{i}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:C.textSoft, textTransform:"uppercase", letterSpacing:1 }}>{l}</div>
                  <div style={{ fontSize:28, fontWeight:900, color:"#4e65be", margin:"8px 0 4px" }}>{v}</div>
                  <div style={{ fontSize:13, color:C.textMid }}>{s}</div>
                </div>
              ))}
            </div>
            <div style={{ background:C.card, borderRadius:18, padding:"24px", border:`1px solid ${C.border}`, marginBottom:20 }}>
              <h3 style={{ fontWeight:700, color:C.text, marginBottom:20 }}>📊 Weekly Adherence — Last 4 Weeks</h3>
              <div style={{ display:"flex", alignItems:"flex-end", gap:12, height:140 }}>
                {[85,92,78,adherencePct].map((v,i)=>(
                  <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:i===3?"#4e65be":C.textMid }}>{v}%</span>
                    <div style={{ width:"100%", height:`${v}%`, background:i===3?"linear-gradient(180deg,#4e65be,#3a52b0)":C.border, borderRadius:"8px 8px 0 0", transition:"height .6s ease" }}/>
                    <span style={{ fontSize:12, color:C.textSoft }}>{i===3?"Now":`Wk ${i+1}`}</span>
                  </div>
                ))}
              </div>
            </div>
            <MedTimeline meds={meds} dark={dark}/>
          </div>
        )}

        {tab==="symptoms"      && <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400 }}><div style={{ fontSize:64, marginBottom:20 }}>📋</div><h2 style={{ color:C.text, marginBottom:16 }}>Symptom Logger</h2><p style={{ color:C.textMid, marginBottom:24, textAlign:"center" }}>Log your symptoms and get AI analysis against your current medications.</p><button onClick={()=>setShowSymptoms(true)} className="btn-blue" style={{ padding:"14px 32px", borderRadius:12, background:"#4e65be", color:"#fff", fontWeight:700, fontSize:16, border:"none", transition:"all .2s" }}>Open Symptom Logger</button></div>}
        {tab==="vaccinations"  && <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400 }}><div style={{ fontSize:64, marginBottom:20 }}>💉</div><h2 style={{ color:C.text, marginBottom:16 }}>Vaccination Tracker</h2><p style={{ color:C.textMid, marginBottom:24 }}>Track your immunization history and upcoming vaccines.</p><button onClick={()=>setShowVaccines(true)} className="btn-blue" style={{ padding:"14px 32px", borderRadius:12, background:"#4e65be", color:"#fff", fontWeight:700, fontSize:16, border:"none", transition:"all .2s" }}>Open Vaccinations</button></div>}
        {tab==="appointments"  && <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400 }}><div style={{ fontSize:64, marginBottom:20 }}>📅</div><h2 style={{ color:C.text, marginBottom:16 }}>Appointments</h2><p style={{ color:C.textMid, marginBottom:24 }}>Manage your upcoming doctor visits and get countdown reminders.</p><button onClick={()=>setShowAppointments(true)} className="btn-blue" style={{ padding:"14px 32px", borderRadius:12, background:"#4e65be", color:"#fff", fontWeight:700, fontSize:16, border:"none", transition:"all .2s" }}>View Appointments</button></div>}

        {tab==="settings" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <div style={{ background:C.card, borderRadius:20, padding:"28px", border:`1px solid ${C.border}` }}>
              <h3 style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:20 }}>Account Settings</h3>
              {[["Full Name","Arjun Patel"],["Email","arjun@example.com"],["Phone","+91 98765 43210"],["Date of Birth","1995-08-14"],["Blood Group","B+"]].map(([l,v])=>(
                <div key={l} style={{ marginBottom:14 }}>
                  <label style={{ ...lStyle, color:C.textSoft }}>{l}</label>
                  <input defaultValue={v} style={{ ...iStyle, background:C.inputBg, color:C.text, border:`1.5px solid ${C.border}` }} />
                </div>
              ))}
              <button className="btn-blue" onClick={()=>show("✅","Settings Saved!","Your profile has been updated.","success")} style={{ padding:"12px 22px", borderRadius:11, background:"#4e65be", color:"#fff", fontWeight:700, fontSize:14, border:"none", marginTop:8, transition:"all .2s" }}>Save Changes</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ background:C.card, borderRadius:16, padding:"20px", border:`1px solid ${C.border}` }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:14 }}>Known Allergies</h3>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {knownAllergies.map(a=><span key={a} style={{ padding:"6px 14px", borderRadius:100, background:"#FEE2E2", color:"#EF4444", fontWeight:700, fontSize:13, border:"1px solid #FCA5A5" }}>{a} ✕</span>)}
                  <button style={{ padding:"6px 14px", borderRadius:100, background:C.bg, color:C.textMid, fontWeight:600, fontSize:13, border:`1px dashed ${C.border}`, cursor:"pointer" }}>+ Add Allergy</button>
                </div>
              </div>
              <div style={{ background:C.card, borderRadius:16, padding:"20px", border:`1px solid ${C.border}` }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:14 }}>Appearance</h3>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <span style={{ color:C.textMid, fontSize:14 }}>Dark Mode</span>
                  <button onClick={()=>setDark(d=>!d)} style={{ width:48, height:26, borderRadius:13, background:dark?"#4e65be":"#E2E8F0", border:"none", cursor:"pointer", position:"relative", transition:"background .3s" }}>
                    <div style={{ width:20, height:20, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:dark?25:3, transition:"left .3s", boxShadow:"0 2px 4px rgba(0,0,0,.2)" }}/>
                  </button>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ color:C.textMid, fontSize:14 }}>Language</span>
                  <select value={lang} onChange={e=>setLang(e.target.value)} style={{ padding:"6px 10px", borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, color:C.text, fontSize:13, cursor:"pointer", outline:"none" }}>
                    {Object.entries(T).map(([k,v])=><option key={k} value={k}>{v.langName}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ background:C.card, borderRadius:16, padding:"20px", border:`1px solid ${C.border}` }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:14 }}>Quick Tools</h3>
                <button onClick={()=>setShowInteraction(true)} style={{ width:"100%", padding:"11px", borderRadius:10, background:"#FEF3C7", color:"#D97706", fontWeight:700, fontSize:13, border:"1px solid #FCD34D", cursor:"pointer", marginBottom:8 }}>⚗️ Drug Interaction Checker</button>
                <button onClick={()=>printReport(meds,streak,adherencePct)} style={{ width:"100%", padding:"11px", borderRadius:10, background:C.bg, color:C.textMid, fontWeight:700, fontSize:13, border:`1px solid ${C.border}`, cursor:"pointer" }}>📄 Download Health Report</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── GUARDIAN PORTAL ────────────────────────────────────
function GuardianPortal({ setPage, dark }) {
  const C = COLORS[dark?"dark":"light"];
  const [selectedPatient, setSelectedPatient] = useState(0);
  const patients = [
    { initials:"MS", name:"Mary Smith",   rel:"Mother",      age:72, color:"#8b64ce", bg:"#F5F0FF", status:"green",  adherence:94 },
    { initials:"JS", name:"John Smith",   rel:"Father",      age:75, color:"#4e65be", bg:"#EBF4FF", status:"green",  adherence:88 },
    { initials:"RJ", name:"Rose Johnson", rel:"Grandmother", age:89, color:"#0891B2", bg:"#E0F7FA", status:"amber",  adherence:72 },
  ];
  const p = patients[selectedPatient];

  return (
    <div style={{ minHeight:"100vh", background:"#F5F0FF" }}>
      <div style={{ background:"linear-gradient(160deg,#EDE9FE,#DDD6FE)", padding:"0 80px", minHeight:"52vh", display:"flex", flexDirection:"column" }}>
        <div style={{ height:68, display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(139,100,206,.15)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={()=>setPage("home")}>
            <div style={{ width:32, height:32, borderRadius:9, background:"#4e65be", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>💙</div>
            <span style={{ fontWeight:800, fontSize:18, color:"#1E2A5A" }}>MedGuard AI</span>
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <button className="btn-blue" onClick={()=>setPage("patient")} style={{ padding:"10px 20px", borderRadius:10, background:"#4e65be", color:"#fff", fontWeight:700, fontSize:14, border:"none", transition:"all .2s" }}>Patient Portal</button>
            <button style={{ padding:"10px 20px", borderRadius:10, background:"#8b64ce", color:"#fff", fontWeight:700, fontSize:14, border:"none" }}>Guardian Portal</button>
          </div>
        </div>
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"40px 0" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(139,100,206,.12)", borderRadius:100, padding:"7px 16px", marginBottom:18 }}>
            <span>👥</span><span style={{ fontSize:13, fontWeight:700, color:"#8b64ce" }}>Guardian Portal</span>
          </div>
          <h1 style={{ fontSize:50, fontWeight:900, color:"#1E2A5A", lineHeight:1.15, marginBottom:14, letterSpacing:"-1px" }}>
            Care for Your Loved Ones<br/><span style={{ color:"#8b64ce" }}>with Confidence</span>
          </h1>
          <p style={{ fontSize:16, color:"#4A5568", maxWidth:520, lineHeight:1.75, marginBottom:28 }}>Monitor multiple patients, manage medications, and stay connected — all from one powerful dashboard.</p>
          <div style={{ display:"flex", gap:14 }}>
            <button style={{ padding:"13px 26px", borderRadius:12, background:"#8b64ce", color:"#fff", fontWeight:700, fontSize:15, border:"none" }}>▶ Get Started</button>
            <button style={{ padding:"13px 26px", borderRadius:12, background:"rgba(255,255,255,.6)", color:"#4A5568", fontWeight:700, fontSize:15, border:"1.5px solid rgba(139,100,206,.3)" }}>🎬 Watch Demo</button>
          </div>
        </div>
      </div>

      <div style={{ background:"#fff", padding:"32px 80px 0" }}>
        <div style={{ fontSize:17, fontWeight:800, color:"#1E2A5A", marginBottom:16 }}>Select Patient</div>
        <div style={{ display:"flex", gap:14 }}>
          {patients.map((pt,i)=>(
            <div key={i} onClick={()=>setSelectedPatient(i)} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 20px", borderRadius:16, cursor:"pointer", border:`2px solid ${selectedPatient===i?"#8b64ce":"#E2E8F0"}`, background:selectedPatient===i?"#F5F0FF":"#fff", transition:"all .2s", minWidth:190 }}>
              <div style={{ width:46, height:46, borderRadius:"50%", background:pt.bg, color:pt.color, fontWeight:800, fontSize:17, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:`2px solid ${pt.color}` }}>{pt.initials}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:"#1E2A5A", fontSize:14 }}>{pt.name}</div>
                <div style={{ fontSize:12, color:"#64748B" }}>{pt.rel} · {pt.age} yrs</div>
                <div style={{ fontSize:11, fontWeight:700, color:pt.adherence>=85?"#16A34A":pt.adherence>=70?"#D97706":"#EF4444", marginTop:2 }}>{pt.adherence}% adherence</div>
              </div>
              <div style={{ width:10, height:10, borderRadius:"50%", background:pt.status==="green"?"#22C55E":"#F59E0B", flexShrink:0 }}/>
            </div>
          ))}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"14px 20px", borderRadius:16, border:"2px dashed #E2E8F0", cursor:"pointer", minWidth:150, color:"#94A3B8", fontWeight:600, fontSize:14, gap:8 }}>＋ Add Patient</div>
        </div>
      </div>

      <div style={{ padding:"24px 80px 48px" }}>
        <div style={{ background:"#fff", borderRadius:20, padding:"24px 28px", marginBottom:18, border:"1px solid #E2E8F0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:19, fontWeight:800, color:"#1E2A5A", marginBottom:4 }}>{p.name}'s Overview</div>
            <div style={{ fontSize:14, color:"#64748B" }}>{p.rel} · Age {p.age} · Last active 5 min ago</div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button style={{ padding:"10px 16px", borderRadius:10, background:"#ECFDF5", color:"#16A34A", fontWeight:700, fontSize:13, border:"1px solid #BBF7D0" }}>✅ All Meds Taken Today</button>
            <button style={{ padding:"10px 16px", borderRadius:10, background:"#FEE2E2", color:"#EF4444", fontWeight:700, fontSize:13, border:"1px solid #FECACA" }}>🆘 Emergency Contact</button>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:18 }}>
          {[["💊","Today's Meds","3/3","All taken","#ECFDF5","#16A34A"],["🔥","Streak",`${7+selectedPatient*3}d`,"consecutive","#FEF3C7","#D97706"],["⚠️","Missed","2","last 30 days","#FEE2E2","#EF4444"],["📊","Adherence",`${p.adherence}%`,"this month","#EBF4FF","#4e65be"]].map(([i,l,v,s,bg,c])=>(
            <div key={l} style={{ background:"#fff", borderRadius:16, padding:"18px 20px", border:"1px solid #E2E8F0" }}>
              <div style={{ width:38, height:38, borderRadius:11, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginBottom:8 }}>{i}</div>
              <div style={{ fontSize:24, fontWeight:900, color:c }}>{v}</div>
              <div style={{ fontSize:12, fontWeight:700, color:"#1E2A5A", marginTop:2 }}>{l}</div>
              <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
          <div style={{ background:"#fff", borderRadius:18, padding:"20px 22px", border:"1px solid #E2E8F0" }}>
            <h3 style={{ fontWeight:700, color:"#1E2A5A", marginBottom:14 }}>Medication Schedule</h3>
            {[["💊","Metformin 500mg","8:00 AM","taken"],["💊","Aspirin 100mg","2:00 PM","taken"],["💊","Lisinopril 10mg","9:00 PM","upcoming"]].map(([i,n,t,s],idx)=>(
              <div key={idx} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 0", borderBottom:"1px solid #F1F5F9" }}>
                <span style={{ fontSize:20 }}>{i}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, color:"#1E2A5A", fontSize:14 }}>{n}</div>
                  <div style={{ fontSize:12, color:"#94A3B8" }}>{t}</div>
                </div>
                <span style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:100, background:s==="taken"?"#ECFDF5":"#FEF3C7", color:s==="taken"?"#16A34A":"#D97706" }}>{s==="taken"?"✓ Taken":"⏳ Upcoming"}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:"linear-gradient(135deg,#8b64ce,#6D28D9)", borderRadius:18, padding:"18px 20px", color:"#fff" }}>
              <div style={{ fontWeight:700, marginBottom:10 }}>👥 Guardian Controls</div>
              {["Dosage adjustments","Medication additions","Schedule changes","Emergency contacts","Activity updates"].map(f=>(
                <div key={f} style={{ display:"flex", gap:10, marginBottom:8 }}><span style={{ color:"#A5F3D4" }}>✓</span><span style={{ fontSize:14, opacity:.9 }}>{f}</span></div>
              ))}
            </div>
            <div style={{ background:"#fff", borderRadius:16, padding:"16px 18px", border:"1px solid #E2E8F0" }}>
              <div style={{ fontWeight:700, color:"#1E2A5A", marginBottom:12 }}>📲 Recent Alerts</div>
              {[["🔔","Medication reminder sent","2 min ago"],["✅","Aspirin 100mg confirmed taken","1 hr ago"],["⚠️","Lisinopril due at 9:00 PM","Upcoming"]].map(([i,m,t])=>(
                <div key={m} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:"1px solid #F1F5F9" }}>
                  <span>{i}</span>
                  <div style={{ flex:1 }}><div style={{ fontSize:13, color:"#1E2A5A" }}>{m}</div><div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>{t}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background:"linear-gradient(135deg,#8b64ce,#6D28D9)", padding:"52px 80px", textAlign:"center", color:"#fff" }}>
        <h2 style={{ fontSize:34, fontWeight:800, marginBottom:12 }}>Ready to Provide Better Care?</h2>
        <p style={{ fontSize:16, opacity:.85, marginBottom:28 }}>Join thousands of guardians who trust MedGuard AI to help them care for their loved ones.</p>
        <div style={{ display:"flex", gap:14, justifyContent:"center", marginBottom:18 }}>
          <button style={{ padding:"13px 26px", borderRadius:12, background:"#fff", color:"#8b64ce", fontWeight:800, fontSize:15, border:"none", cursor:"pointer" }}>🚀 Start Free Trial</button>
          <button style={{ padding:"13px 26px", borderRadius:12, background:"rgba(255,255,255,.15)", color:"#fff", fontWeight:700, fontSize:15, border:"1.5px solid rgba(255,255,255,.3)", cursor:"pointer" }}>🤝 Contact Support</button>
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:24, fontSize:14, opacity:.8 }}>
          {["✅ No credit card required","🔄 14-day free trial","❌ Cancel anytime"].map(t=><span key={t}>{t}</span>)}
        </div>
      </div>
    </div>
  );
}

// ── NAVBAR ─────────────────────────────────────────────
function Navbar({ page, setPage, activeSection, setActiveSection, dark, setDark, lang, setLang }) {
  const C = COLORS[dark?"dark":"light"];
  return (
    <nav style={{ position:"sticky", top:0, zIndex:100, background:C.navBg, borderBottom:`1px solid ${C.border}`, boxShadow:"0 1px 12px rgba(0,0,0,.06)", padding:"0 48px", height:68, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={()=>setPage("home")}>
        <div style={{ width:36, height:36, borderRadius:10, background:"#4e65be", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>💙</div>
        <span style={{ fontSize:20, fontWeight:800, color:"#4e65be" }}>MedGuard AI</span>
      </div>
      <div style={{ display:"flex", gap:28 }}>
        {["Home","About","Services","Contact"].map(l=>(
          <button key={l} className={`nav-link ${activeSection===l.toLowerCase()?"active":""}`}
            onClick={()=>{ setPage("home"); setActiveSection(l.toLowerCase()); }}
            style={{ background:"none", border:"none", fontSize:15, fontWeight:500, color:activeSection===l.toLowerCase()?"#4e65be":C.textMid, padding:"4px 0", cursor:"pointer", position:"relative" }}>{l}</button>
        ))}
      </div>
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <button onClick={()=>setDark(d=>!d)} style={{ padding:"7px 10px", borderRadius:9, background:C.surface, border:`1px solid ${C.border}`, cursor:"pointer", fontSize:16 }}>{dark?"☀️":"🌙"}</button>
        <select value={lang} onChange={e=>setLang(e.target.value)} style={{ padding:"7px 10px", borderRadius:9, border:`1px solid ${C.border}`, background:C.surface, color:C.text, fontSize:13, cursor:"pointer", outline:"none" }}>
          {Object.entries(T).map(([k,v])=><option key={k} value={k}>{v.langName}</option>)}
        </select>
        <button className="btn-purp" onClick={()=>setPage("guardian")} style={{ padding:"10px 18px", borderRadius:10, background:"#8b64ce", color:"#fff", fontWeight:700, fontSize:14, border:"none", transition:"all .2s" }}>Guardian Portal</button>
        <button className="btn-blue" onClick={()=>setPage("patient")}  style={{ padding:"10px 18px", borderRadius:10, background:"#4e65be", color:"#fff", fontWeight:700, fontSize:14, border:"none", transition:"all .2s" }}>Patient Portal</button>
      </div>
    </nav>
  );
}

// ── HOME PAGE (condensed) ──────────────────────────────
function HomePage({ setPage, activeSection, dark }) {
  const C = COLORS[dark?"dark":"light"];
  const [contactForm, setContactForm] = useState({ name:"",email:"",phone:"",role:"",subject:"",message:"" });
  const [sent, setSent] = useState(false);

  return (
    <div>
      {(!activeSection||activeSection==="home") && <>
        <section style={{ minHeight:"92vh", background:C.bannerBg, display:"flex", alignItems:"center", padding:"0 80px", gap:48, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-100, right:-100, width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(78,101,190,.08),transparent 65%)", pointerEvents:"none" }}/>
          <div style={{ flex:1, maxWidth:580 }} className="fade-up">
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(78,101,190,.1)", borderRadius:100, padding:"7px 16px", marginBottom:24 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#4e65be", animation:"pulse 1.8s infinite" }}/>
              <span style={{ fontSize:13, fontWeight:700, color:"#4e65be" }}>AI-Powered Healthcare</span>
            </div>
            <h1 style={{ fontSize:56, fontWeight:900, lineHeight:1.1, color:dark?"#F1F5F9":"#1E2A5A", marginBottom:18, letterSpacing:"-1.5px" }}>
              Your Intelligent<br/><span style={{ color:"#4e65be" }}>Medicine Reminder</span><br/>&amp; Health Advisory<br/>System
            </h1>
            <p style={{ fontSize:17, color:C.textMid, lineHeight:1.75, marginBottom:32, maxWidth:500 }}>MedGuard AI combines advanced AI with compassionate care to ensure medication adherence, provide health insights, and keep your loved ones connected.</p>
            <div style={{ display:"flex", gap:14, marginBottom:28 }}>
              <button className="btn-blue" onClick={()=>setPage("patient")} style={{ padding:"14px 26px", borderRadius:12, background:"#4e65be", color:"#fff", fontWeight:700, fontSize:15, border:"none", transition:"all .2s", boxShadow:"0 4px 16px rgba(78,101,190,.3)" }}>👤 Patient Interface</button>
              <button className="btn-purp" onClick={()=>setPage("guardian")} style={{ padding:"14px 26px", borderRadius:12, background:"#8b64ce", color:"#fff", fontWeight:700, fontSize:15, border:"none", transition:"all .2s", boxShadow:"0 4px 16px rgba(139,100,206,.3)" }}>👥 Guardian Interface</button>
            </div>
            <div style={{ display:"flex", gap:20 }}>
              {[["✅","HIPAA Compliant"],["🔒","End-to-End Encrypted"],["💊","FDA Registered"]].map(([i,l])=>(
                <div key={l} style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:C.textMid, fontWeight:600 }}><span>{i}</span>{l}</div>
              ))}
            </div>
          </div>
          <div style={{ flex:1, position:"relative", height:480, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div className="float1" style={{ position:"absolute", top:40, right:60, background:C.card, borderRadius:18, padding:"16px 20px", boxShadow:"0 8px 32px rgba(0,0,0,.1)", minWidth:230, display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:46, height:46, borderRadius:13, background:"#EBF4FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>💊</div>
              <div><div style={{ fontWeight:700, fontSize:14, color:"#1E2A5A" }}>Next Medication</div><div style={{ fontSize:13, color:"#64748B", marginTop:2 }}>Aspirin 100mg · 2:00 PM</div></div>
            </div>
            <div className="float2" style={{ position:"absolute", top:165, right:20, background:"#F5F0FF", borderRadius:18, padding:"16px 20px", boxShadow:"0 8px 32px rgba(0,0,0,.1)", minWidth:215, display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:46, height:46, borderRadius:13, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>🔔</div>
              <div><div style={{ fontWeight:700, fontSize:14, color:"#1E2A5A" }}>Smart Reminders</div><div style={{ fontSize:13, color:"#64748B", marginTop:2 }}>Never miss a dose</div></div>
            </div>
            <div className="float3" style={{ position:"absolute", bottom:80, right:70, background:"#ECFDF5", borderRadius:18, padding:"16px 20px", boxShadow:"0 8px 32px rgba(0,0,0,.1)", minWidth:215, display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:46, height:46, borderRadius:13, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>💚</div>
              <div><div style={{ fontWeight:700, fontSize:14, color:"#1E2A5A" }}>Health Monitoring</div><div style={{ fontSize:13, color:"#64748B", marginTop:2 }}>Real-time tracking</div></div>
            </div>
            <div style={{ width:150, height:150, borderRadius:"50%", background:"linear-gradient(135deg,rgba(78,101,190,.12),rgba(139,100,206,.12))", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:95, height:95, borderRadius:"50%", background:"linear-gradient(135deg,rgba(78,101,190,.2),rgba(139,100,206,.2))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:46 }}>🏥</div>
            </div>
          </div>
        </section>
        <section style={{ background:C.card, padding:"28px 80px", display:"flex", justifyContent:"space-around", borderBottom:`1px solid ${C.border}` }}>
          {[["50,000+","Active Users"],["98%","Medication Adherence"],["4.9★","App Rating"],["24/7","AI Support"]].map(([val,lbl])=>(
            <div key={lbl} style={{ textAlign:"center" }}>
              <div style={{ fontSize:30, fontWeight:900, color:"#4e65be" }}>{val}</div>
              <div style={{ fontSize:13, color:C.textMid, marginTop:4, fontWeight:500 }}>{lbl}</div>
            </div>
          ))}
        </section>
        <section style={{ background:C.bg, padding:"72px 80px" }}>
          <h2 style={{ textAlign:"center", fontSize:34, fontWeight:800, color:dark?"#F1F5F9":"#1E2A5A", marginBottom:10 }}>Choose Your Interface</h2>
          <p style={{ textAlign:"center", color:C.textMid, fontSize:16, marginBottom:48 }}>Select the portal that best fits your needs</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, maxWidth:960, margin:"0 auto" }}>
            {[{bg:"#4e65be",border:"#BFDBFE",icon:"👤",title:"Patient Interface",desc:"Take control of your health with personalized medication reminders, health tracking, and AI-powered advisory.",features:["Personalized medication schedule","Health symptoms tracking","AI health assistant","Emergency SOS features"],btn:"Access Patient Portal",action:()=>setPage("patient"),cls:"btn-blue"},{bg:"#8b64ce",border:"#DDD6FE",icon:"👥",title:"Guardian Interface",desc:"Monitor and manage medication schedules for your loved ones with real-time updates and comprehensive oversight.",features:["Multiple patient monitoring","Medication compliance tracking","Instant alerts & notifications","Family coordination tools"],btn:"Access Guardian Portal",action:()=>setPage("guardian"),cls:"btn-purp"}].map(c=>(
              <div key={c.title} className="card-hover" style={{ background:C.card, borderRadius:20, padding:"32px 28px", border:`2px solid ${c.border}`, transition:"all .3s", boxShadow:"0 4px 20px rgba(0,0,0,.06)" }}>
                <div style={{ width:60, height:60, borderRadius:15, background:c.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, marginBottom:18 }}>{c.icon}</div>
                <h3 style={{ fontSize:22, fontWeight:800, color:dark?"#F1F5F9":"#1E2A5A", marginBottom:10 }}>{c.title}</h3>
                <p style={{ fontSize:14, color:C.textMid, lineHeight:1.75, marginBottom:20 }}>{c.desc}</p>
                {c.features.map(f=><div key={f} style={{ display:"flex", gap:9, marginBottom:9 }}><span style={{ color:"#22C55E", fontWeight:700 }}>✓</span><span style={{ fontSize:14, color:C.textMid }}>{f}</span></div>)}
                <button className={c.cls} onClick={c.action} style={{ marginTop:20, width:"100%", padding:"13px", borderRadius:12, background:c.bg, color:"#fff", fontWeight:700, fontSize:15, border:"none", transition:"all .2s" }}>{c.btn}</button>
              </div>
            ))}
          </div>
        </section>
      </>}

      {activeSection==="about" && (
        <section style={{ background:C.card, padding:"72px 80px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, maxWidth:1080, margin:"0 auto", alignItems:"center" }}>
            <div>
              <h2 style={{ fontSize:34, fontWeight:800, color:dark?"#F1F5F9":"#1E2A5A", marginBottom:10 }}>About MedGuard AI</h2>
              <h3 style={{ fontSize:20, fontWeight:700, color:"#4e65be", marginBottom:16 }}>Revolutionizing Healthcare Management Through AI</h3>
              <p style={{ fontSize:15, color:C.textMid, lineHeight:1.8, marginBottom:14 }}>MedGuard AI was founded with a simple yet powerful mission: to ensure no one ever misses their medication and everyone has access to intelligent health guidance.</p>
              <p style={{ fontSize:15, color:C.textMid, lineHeight:1.8, marginBottom:24 }}>We combine cutting-edge AI with intuitive design to create a healthcare companion that truly understands and adapts to your needs.</p>
              {[["🤖","AI-Powered","Intelligent recommendations from ML"],["🔒","100% Secure","HIPAA-compliant data protection"],["👨‍👩‍👧","Family-Focused","Built for patients and caregivers"]].map(([i,t,s])=>(
                <div key={t} style={{ display:"flex", gap:13, marginBottom:16 }}>
                  <div style={{ width:42, height:42, borderRadius:11, background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{i}</div>
                  <div><div style={{ fontWeight:700, color:dark?"#F1F5F9":"#1E2A5A" }}>{t}</div><div style={{ fontSize:13, color:C.textMid }}>{s}</div></div>
                </div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[["50K+","Active Users","#EBF4FF","#4e65be"],["98%","Adherence Rate","#ECFDF5","#16A34A"],["4.9★","App Rating","#FEF3C7","#D97706"],["24/7","AI Support","#F5F0FF","#8b64ce"]].map(([v,l,bg,c])=>(
                <div key={l} style={{ background:bg, borderRadius:16, padding:"26px 18px", textAlign:"center" }}>
                  <div style={{ fontSize:32, fontWeight:900, color:c }}>{v}</div>
                  <div style={{ fontSize:13, color:C.textMid, fontWeight:600, marginTop:4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeSection==="services" && (
        <section style={{ background:C.bg, padding:"72px 80px" }}>
          <h2 style={{ textAlign:"center", fontSize:34, fontWeight:800, color:dark?"#F1F5F9":"#1E2A5A", marginBottom:10 }}>Our Services</h2>
          <p style={{ textAlign:"center", color:C.textMid, marginBottom:48 }}>Everything you need for complete healthcare management</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18, maxWidth:1080, margin:"0 auto 56px" }}>
            {[["1","Profile","Create account, add meds, health conditions and preferences."],["2","Schedule","AI creates optimized reminder schedule tailored to your lifestyle."],["3","Reminders","Get timely notifications via app, SMS, or phone call."],["4","Optimize","Monitor adherence and get AI-powered health insights."]].map(([n,t,s])=>(
              <div key={t} style={{ background:C.card, borderRadius:16, padding:"26px 20px", textAlign:"center", boxShadow:"0 2px 12px rgba(0,0,0,.06)" }}>
                <div style={{ width:42, height:42, borderRadius:12, background:"#4e65be", color:"#fff", fontSize:19, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>{n}</div>
                <div style={{ fontWeight:700, color:dark?"#F1F5F9":"#1E2A5A", marginBottom:7 }}>{t}</div>
                <div style={{ fontSize:13, color:C.textMid, lineHeight:1.65 }}>{s}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, maxWidth:880, margin:"0 auto" }}>
            {[["🧠","Machine Learning","Our AI learns from millions of data points to personalize health recommendations."],["💬","Natural Language Processing","Ask questions in plain English. Get clear, understandable health answers."],["📊","Predictive Analytics","Advanced algorithms analyze patterns to provide proactive health management."],["🗄️","Secure Data Processing","Military-grade encryption ensures your health data is always protected."]].map(([i,t,s])=>(
              <div key={t} style={{ background:C.card, borderRadius:16, padding:"26px 22px", boxShadow:"0 2px 12px rgba(0,0,0,.06)" }}>
                <div style={{ fontSize:34, marginBottom:12 }}>{i}</div>
                <h4 style={{ fontSize:17, fontWeight:700, color:dark?"#F1F5F9":"#1E2A5A", marginBottom:7 }}>{t}</h4>
                <p style={{ fontSize:14, color:C.textMid, lineHeight:1.7 }}>{s}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeSection==="contact" && (
        <section style={{ background:C.bg, padding:"72px 80px" }}>
          <h2 style={{ textAlign:"center", fontSize:34, fontWeight:800, color:dark?"#F1F5F9":"#1E2A5A", marginBottom:10 }}>Contact Us</h2>
          <p style={{ textAlign:"center", color:C.textMid, marginBottom:48 }}>We're here to help 24/7</p>
          <div style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:36, maxWidth:1020, margin:"0 auto" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[["📞","Phone","Mon-Fri 8am–8pm EST","1-800-MEDGUARD"],["📧","Email","24hr response","support@medguardai.com"],["📍","Office","Our headquarters","123 Healthcare Plaza, Boston"]].map(([i,t,s,v])=>(
                <div key={t} style={{ background:C.card, borderRadius:16, padding:"20px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", textAlign:"center" }}>
                  <div style={{ fontSize:30, marginBottom:7 }}>{i}</div>
                  <div style={{ fontWeight:700, color:dark?"#F1F5F9":"#1E2A5A", marginBottom:4 }}>{t}</div>
                  <div style={{ fontSize:13, color:C.textSoft, marginBottom:5 }}>{s}</div>
                  <div style={{ fontSize:14, color:"#4e65be", fontWeight:600 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background:C.card, borderRadius:20, padding:"28px 24px", boxShadow:"0 4px 20px rgba(0,0,0,.07)" }}>
              <h3 style={{ fontSize:19, fontWeight:700, color:dark?"#F1F5F9":"#1E2A5A", marginBottom:20 }}>Send us a Message</h3>
              {sent ? (
                <div style={{ textAlign:"center", padding:"60px 0" }}>
                  <div style={{ fontSize:52 }}>✅</div>
                  <h4 style={{ fontSize:19, fontWeight:700, color:dark?"#F1F5F9":"#1E2A5A", marginTop:14 }}>Message Sent!</h4>
                  <p style={{ color:C.textMid, marginTop:7 }}>We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                    {[["Full Name","name","text"],["Email","email","email"]].map(([l,k,t])=>(
                      <div key={k}><label style={lStyle}>{l} *</label><input type={t} value={contactForm[k]} onChange={e=>setContactForm(f=>({...f,[k]:e.target.value}))} style={{ ...iStyle, background:C.inputBg, color:C.text, border:`1.5px solid ${C.border}` }} /></div>
                    ))}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                    <div><label style={lStyle}>Phone</label><input value={contactForm.phone} onChange={e=>setContactForm(f=>({...f,phone:e.target.value}))} style={{ ...iStyle, background:C.inputBg, color:C.text, border:`1.5px solid ${C.border}` }} /></div>
                    <div><label style={lStyle}>I am a *</label>
                      <select value={contactForm.role} onChange={e=>setContactForm(f=>({...f,role:e.target.value}))} style={{ ...iStyle, background:C.card, color:C.text, border:`1.5px solid ${C.border}` }}>
                        <option value="">Select…</option>{["Patient","Guardian","Healthcare Provider","Other"].map(o=><option key={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom:12 }}><label style={lStyle}>Subject *</label><input value={contactForm.subject} onChange={e=>setContactForm(f=>({...f,subject:e.target.value}))} style={{ ...iStyle, background:C.inputBg, color:C.text, border:`1.5px solid ${C.border}` }} /></div>
                  <div style={{ marginBottom:20 }}><label style={lStyle}>Message *</label><textarea rows={5} value={contactForm.message} onChange={e=>setContactForm(f=>({...f,message:e.target.value}))} style={{ ...iStyle, resize:"vertical", background:C.inputBg, color:C.text, border:`1.5px solid ${C.border}` }} /></div>
                  <button className="btn-blue" onClick={()=>setSent(true)} style={{ width:"100%", padding:"14px", borderRadius:12, background:"#4e65be", color:"#fff", fontSize:15, fontWeight:700, border:"none", transition:"all .2s" }}>✉️ Send Message</button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      <footer style={{ background:"#1E2A5A", padding:"36px 80px 20px", color:"#94A3B8" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ width:30, height:30, borderRadius:9, background:"#4e65be", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>💙</div>
              <span style={{ fontSize:17, fontWeight:800, color:"#fff" }}>MedGuard AI</span>
            </div>
            <p style={{ fontSize:13, lineHeight:1.7, maxWidth:240 }}>Intelligent healthcare management powered by AI.</p>
          </div>
          {[["Product",["Patient Portal","Guardian Portal","AI Advisor","Analytics"]],["Company",["About","Services","Careers","Press"]],["Support",["Help Center","Contact","Privacy","Terms"]]].map(([title,links])=>(
            <div key={title}>
              <div style={{ fontSize:12, fontWeight:700, color:"#fff", marginBottom:12, textTransform:"uppercase", letterSpacing:1 }}>{title}</div>
              {links.map(l=><div key={l} style={{ fontSize:14, marginBottom:8, cursor:"pointer" }}>{l}</div>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,.1)", paddingTop:18, display:"flex", justifyContent:"space-between", fontSize:13 }}>
          <span>© 2026 MedGuard AI. All rights reserved.</span>
          <div style={{ display:"flex", gap:18 }}>{["HIPAA Compliant","FDA Registered","SSL Secured"].map(b=><span key={b} style={{ color:"#22C55E" }}>✅ {b}</span>)}</div>
        </div>
      </footer>
    </div>
  );
}

// ── ROOT ───────────────────────────────────────────────
export default function App() {
  const [page, setPage]                 = useState("home");
  const [activeSection, setActiveSection] = useState("home");
  const [dark, setDark]                 = useState(false);
  const [lang, setLang]                 = useState("en");
  const offline                         = useOffline();

  return (
    <div>
      <style>{makeGCSS(dark)}</style>
      {offline && page==="home" && <OfflineBanner dark={dark}/>}
      {!["patient","guardian"].includes(page) && (
        <Navbar page={page} setPage={setPage} activeSection={activeSection} setActiveSection={setActiveSection} dark={dark} setDark={setDark} lang={lang} setLang={setLang}/>
      )}
      {["home","about","services","contact"].includes(page) && <HomePage setPage={setPage} activeSection={activeSection} dark={dark}/>}
      {page==="patient"  && <PatientPortal  setPage={setPage} dark={dark} setDark={setDark} lang={lang} setLang={setLang}/>}
      {page==="guardian" && <GuardianPortal setPage={setPage} dark={dark}/>}
    </div>
  );
}