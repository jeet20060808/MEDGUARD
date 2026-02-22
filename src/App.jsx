import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   MedGuard AI — Full Website
   Pages: Home · About · Services · Contact · Patient Portal · Guardian Portal
═══════════════════════════════════════════════════════════════ */

const GCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', system-ui, sans-serif; background: #EBF4FF; color: #1a202c; }
  input, select, textarea { font-family: inherit; }
  button { font-family: inherit; cursor: pointer; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #EBF4FF; }
  ::-webkit-scrollbar-thumb { background: #93C5FD; border-radius: 4px; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
  @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes float2   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.7;transform:scale(1.2)} }
  @keyframes spin     { to{transform:rotate(360deg)} }

  .fade-up  { animation: fadeUp  .6s cubic-bezier(.22,1,.36,1) both; }
  .fade-in  { animation: fadeIn  .5s ease both; }
  .float1   { animation: float  4s ease-in-out infinite; }
  .float2   { animation: float2 5s ease-in-out infinite .8s; }
  .float3   { animation: float  6s ease-in-out infinite 1.5s; }

  .nav-link { position:relative; }
  .nav-link::after { content:''; position:absolute; bottom:-4px; left:0; width:0; height:2px; background:#3B5BDB; border-radius:2px; transition:width .25s; }
  .nav-link.active::after, .nav-link:hover::after { width:100%; }

  .btn-blue:hover   { background:#2F4DD4 !important; transform:translateY(-1px); box-shadow:0 8px 24px rgba(59,91,219,.35) !important; }
  .btn-purple:hover { background:#6D28D9 !important; transform:translateY(-1px); box-shadow:0 8px 24px rgba(109,40,217,.35) !important; }
  .btn-outline:hover { background:rgba(255,255,255,.15) !important; }
  .card-hover:hover { transform:translateY(-4px); box-shadow:0 20px 48px rgba(0,0,0,.12) !important; }
  .portal-card:hover { transform:translateY(-3px); box-shadow:0 16px 40px rgba(0,0,0,.1) !important; }

  .tab-btn { transition:all .2s; }
  .tab-btn:hover { background:rgba(59,91,219,.06) !important; }
`;

// ─── Color tokens ──────────────────────────────────────────────
const BG   = "#EBF4FF";
const BLUE = "#4e65beff";
const PURP = "#8b64ceff";
const WHITE= "#FFFFFF";
const CARD = "#FFFFFF";

// ─── Navbar ────────────────────────────────────────────────────
function Navbar({ page, setPage, activeSection, setActiveSection }) {
  const navLinks = ["Home","About","Services","Contact"];
  return (
    <nav style={{ position:"sticky", top:0, zIndex:100, background:WHITE, borderBottom:"1px solid #E2E8F0", boxShadow:"0 1px 12px rgba(0,0,0,.06)", padding:"0 48px", height:68, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={()=>setPage("home")}>
        <div style={{ width:36, height:36, borderRadius:10, background:BLUE, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:20 }}>💙</span>
        </div>
        <span style={{ fontSize:20, fontWeight:800, color:BLUE }}>MedGuard AI</span>
      </div>

      {/* Nav links */}
      <div style={{ display:"flex", gap:32 }}>
        {navLinks.map(l => (
          <button key={l} className={`nav-link ${page==="home" && activeSection===l.toLowerCase() ? "active":""}`}
            onClick={()=>{ setPage("home"); setActiveSection(l.toLowerCase()); }}
            style={{ background:"none", border:"none", fontSize:15, fontWeight:500, color: page==="home"&&activeSection===l.toLowerCase() ? BLUE : "#4A5568", padding:"4px 0", cursor:"pointer" }}>{l}</button>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display:"flex", gap:12 }}>
        <button className="btn-purple" onClick={()=>setPage("guardian")} style={{ padding:"10px 20px", borderRadius:10, background:PURP, color:WHITE, fontWeight:700, fontSize:14, border:"none", transition:"all .2s" }}>Guardian Portal</button>
        <button className="btn-blue"   onClick={()=>setPage("patient")}  style={{ padding:"10px 20px", borderRadius:10, background:BLUE, color:WHITE, fontWeight:700, fontSize:14, border:"none", transition:"all .2s" }}>Patient Portal</button>
      </div>
    </nav>
  );
}

// ─── HOME PAGE ─────────────────────────────────────────────────
function HomePage({ setPage, activeSection }) {
  const [contactForm, setContactForm] = useState({ name:"", email:"", phone:"", role:"", subject:"", message:"" });
  const [sent, setSent] = useState(false);

  return (
    <div>
      {/* ── HERO ── */}
      {(activeSection==="home"||!activeSection) && (
        <section id="home" style={{ minHeight:"92vh", background:"linear-gradient(160deg,#EBF4FF 0%,#DBEAFE 50%,#EBF4FF 100%)", display:"flex", alignItems:"center", padding:"0 80px", gap:48, position:"relative", overflow:"hidden" }}>
          {/* Blobs */}
          <div style={{ position:"absolute", top:-100, right:-100, width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(59,91,219,.08),transparent 65%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-80, left:200, width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,.05),transparent 65%)", pointerEvents:"none" }} />

          {/* Left */}
          <div style={{ flex:1, maxWidth:580 }} className="fade-up">
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(59,91,219,.1)", borderRadius:100, padding:"7px 16px", marginBottom:28 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:BLUE, animation:"pulse 1.8s infinite" }} />
              <span style={{ fontSize:13, fontWeight:700, color:BLUE, letterSpacing:.5 }}>AI-Powered Healthcare</span>
            </div>
            <h1 style={{ fontSize:56, fontWeight:900, lineHeight:1.1, color:"#1E2A5A", marginBottom:20, letterSpacing:"-1.5px" }}>
              Your Intelligent<br/>
              <span style={{ color:BLUE }}>Medicine Reminder</span><br/>
              &amp; Health Advisory<br/>System
            </h1>
            <p style={{ fontSize:17, color:"#4A5568", lineHeight:1.75, marginBottom:36, maxWidth:500 }}>
              MedGuard AI combines advanced artificial intelligence with compassionate care to ensure medication adherence, provide health insights, and keep you connected with your loved ones' wellbeing.
            </p>
            <div style={{ display:"flex", gap:14, marginBottom:36 }}>
              <button className="btn-blue" onClick={()=>setPage("patient")} style={{ padding:"15px 28px", borderRadius:12, background:BLUE, color:WHITE, fontWeight:700, fontSize:15, border:"none", display:"flex", alignItems:"center", gap:8, transition:"all .2s", boxShadow:"0 4px 16px rgba(59,91,219,.3)" }}>
                👤 Patient Interface
              </button>
              <button className="btn-purple" onClick={()=>setPage("guardian")} style={{ padding:"15px 28px", borderRadius:12, background:PURP, color:WHITE, fontWeight:700, fontSize:15, border:"none", display:"flex", alignItems:"center", gap:8, transition:"all .2s", boxShadow:"0 4px 16px rgba(124,58,237,.3)" }}>
                👥 Guardian Interface
              </button>
            </div>
            <div style={{ display:"flex", gap:24 }}>
              {[["✅","HIPAA Compliant"],["🔒","End-to-End Encrypted"],["💊","FDA Registered"]].map(([i,l])=>(
                <div key={l} style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:"#4A5568", fontWeight:600 }}><span style={{ color:"#22C55E" }}>{i}</span>{l}</div>
              ))}
            </div>
          </div>

          {/* Right — floating cards */}
          <div style={{ flex:1, position:"relative", height:480, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div className="float1" style={{ position:"absolute", top:40, right:60, background:WHITE, borderRadius:18, padding:"18px 22px", boxShadow:"0 8px 32px rgba(0,0,0,.1)", minWidth:240, display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:"#EBF4FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>💊</div>
              <div><div style={{ fontWeight:700, fontSize:15, color:"#1E2A5A" }}>Next Medication</div><div style={{ fontSize:13, color:"#64748B", marginTop:3 }}>Aspirin 100mg · 2:00 PM</div></div>
            </div>
            <div className="float2" style={{ position:"absolute", top:160, right:20, background:"#F5F0FF", borderRadius:18, padding:"18px 22px", boxShadow:"0 8px 32px rgba(0,0,0,.1)", minWidth:220, display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:WHITE, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>🔔</div>
              <div><div style={{ fontWeight:700, fontSize:15, color:"#1E2A5A" }}>Smart Reminders</div><div style={{ fontSize:13, color:"#64748B", marginTop:3 }}>Never miss a dose</div></div>
            </div>
            <div className="float3" style={{ position:"absolute", bottom:80, right:70, background:"#ECFDF5", borderRadius:18, padding:"18px 22px", boxShadow:"0 8px 32px rgba(0,0,0,.1)", minWidth:230, display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:WHITE, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>💚</div>
              <div><div style={{ fontWeight:700, fontSize:15, color:"#1E2A5A" }}>Health Monitoring</div><div style={{ fontSize:13, color:"#64748B", marginTop:3 }}>Real-time tracking</div></div>
            </div>
            {/* Center pulse */}
            <div style={{ width:160, height:160, borderRadius:"50%", background:"linear-gradient(135deg,rgba(59,91,219,.12),rgba(124,58,237,.12))", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:100, height:100, borderRadius:"50%", background:"linear-gradient(135deg,rgba(59,91,219,.2),rgba(124,58,237,.2))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:48 }}>🏥</div>
            </div>
          </div>
        </section>
      )}

      {/* ── STATS ── */}
      {(activeSection==="home"||!activeSection) && (
        <section style={{ background:WHITE, padding:"32px 80px", display:"flex", justifyContent:"space-around", borderBottom:"1px solid #E2E8F0" }}>
          {[["50,000+","Active Users"],["98%","Medication Adherence"],["4.9★","App Rating"],["24/7","AI Support"]].map(([val,lbl])=>(
            <div key={lbl} style={{ textAlign:"center" }}>
              <div style={{ fontSize:30, fontWeight:900, color:BLUE }}>{val}</div>
              <div style={{ fontSize:13, color:"#64748B", marginTop:4, fontWeight:500 }}>{lbl}</div>
            </div>
          ))}
        </section>
      )}

      {/* ── CHOOSE INTERFACE ── */}
      {(activeSection==="home"||!activeSection) && (
        <section style={{ background:BG, padding:"80px 80px" }}>
          <h2 style={{ textAlign:"center", fontSize:36, fontWeight:800, color:"#1E2A5A", marginBottom:10 }}>Choose Your Interface</h2>
          <p style={{ textAlign:"center", color:"#64748B", fontSize:16, marginBottom:52 }}>Select the portal that best fits your needs</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:28, maxWidth:980, margin:"0 auto" }}>
            {/* Patient */}
            <div className="portal-card card-hover" style={{ background:WHITE, borderRadius:20, padding:"36px 32px", border:"2px solid #BFDBFE", transition:"all .3s", boxShadow:"0 4px 20px rgba(0,0,0,.06)" }}>
              <div style={{ width:64, height:64, borderRadius:16, background:BLUE, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, marginBottom:20 }}>👤</div>
              <h3 style={{ fontSize:24, fontWeight:800, color:"#1E2A5A", marginBottom:12 }}>Patient Interface</h3>
              <p style={{ fontSize:14, color:"#64748B", lineHeight:1.75, marginBottom:24 }}>Take control of your health with personalized medication reminders, health tracking, and AI-powered advisory.</p>
              {["Personalized medication schedule","Health symptoms tracking","AI health assistant","Emergency SOS features"].map(f=>(
                <div key={f} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <span style={{ color:"#22C55E", fontWeight:700, fontSize:16 }}>✓</span>
                  <span style={{ fontSize:14, color:"#374151" }}>{f}</span>
                </div>
              ))}
              <button className="btn-blue" onClick={()=>setPage("patient")} style={{ marginTop:24, width:"100%", padding:"14px", borderRadius:12, background:BLUE, color:WHITE, fontWeight:700, fontSize:15, border:"none", transition:"all .2s", boxShadow:"0 4px 14px rgba(59,91,219,.25)" }}>
                Access Patient Portal
              </button>
            </div>
            {/* Guardian */}
            <div className="portal-card card-hover" style={{ background:WHITE, borderRadius:20, padding:"36px 32px", border:"2px solid #DDD6FE", transition:"all .3s", boxShadow:"0 4px 20px rgba(0,0,0,.06)" }}>
              <div style={{ width:64, height:64, borderRadius:16, background:PURP, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, marginBottom:20 }}>👥</div>
              <h3 style={{ fontSize:24, fontWeight:800, color:"#1E2A5A", marginBottom:12 }}>Guardian Interface</h3>
              <p style={{ fontSize:14, color:"#64748B", lineHeight:1.75, marginBottom:24 }}>Monitor and manage medication schedules for your loved ones with real-time updates and comprehensive oversight.</p>
              {["Multiple patient monitoring","Medication compliance tracking","Instant alerts & notifications","Family coordination tools"].map(f=>(
                <div key={f} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <span style={{ color:"#22C55E", fontWeight:700, fontSize:16 }}>✓</span>
                  <span style={{ fontSize:14, color:"#374151" }}>{f}</span>
                </div>
              ))}
              <button className="btn-purple" onClick={()=>setPage("guardian")} style={{ marginTop:24, width:"100%", padding:"14px", borderRadius:12, background:PURP, color:WHITE, fontWeight:700, fontSize:15, border:"none", transition:"all .2s", boxShadow:"0 4px 14px rgba(124,58,237,.25)" }}>
                Access Guardian Portal
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── ABOUT ── */}
      {(activeSection==="about"||activeSection==="home"||!activeSection) && activeSection==="about" && (
        <section id="about" style={{ background:WHITE, padding:"80px 80px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, maxWidth:1100, margin:"0 auto", alignItems:"center" }}>
            <div>
              <h2 style={{ fontSize:36, fontWeight:800, color:"#1E2A5A", marginBottom:10 }}>About MedGuard AI</h2>
              <h3 style={{ fontSize:22, fontWeight:700, color:BLUE, marginBottom:18 }}>Revolutionizing Healthcare Management Through AI</h3>
              <p style={{ fontSize:15, color:"#4A5568", lineHeight:1.8, marginBottom:16 }}>MedGuard AI was founded with a simple yet powerful mission: to ensure no one ever misses their medication and everyone has access to intelligent health guidance.</p>
              <p style={{ fontSize:15, color:"#4A5568", lineHeight:1.8, marginBottom:28 }}>We combine cutting-edge AI with intuitive design to create a healthcare companion that truly understands and adapts to your needs. With over 50,000 active users and a 98% medication adherence rate, we're making a real difference.</p>
              {[["🤖","AI-Powered","Intelligent recommendations from ML"],["🔒","100% Secure","HIPAA-compliant data protection"],["👨‍👩‍👧","Family-Focused","Built for patients and caregivers"]].map(([i,t,s])=>(
                <div key={t} style={{ display:"flex", gap:14, marginBottom:18 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:"#EBF4FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{i}</div>
                  <div><div style={{ fontWeight:700, color:"#1E2A5A" }}>{t}</div><div style={{ fontSize:13, color:"#64748B" }}>{s}</div></div>
                </div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {[["50K+","Active Users","#EBF4FF",BLUE],["98%","Adherence Rate","#ECFDF5","#16A34A"],["4.9★","App Rating","#FEF3C7","#D97706"],["24/7","AI Support","#F5F0FF",PURP]].map(([v,l,bg,c])=>(
                <div key={l} style={{ background:bg, borderRadius:16, padding:"28px 20px", textAlign:"center" }}>
                  <div style={{ fontSize:34, fontWeight:900, color:c }}>{v}</div>
                  <div style={{ fontSize:13, color:"#4A5568", fontWeight:600, marginTop:4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SERVICES ── */}
      {activeSection==="services" && (
        <section id="services" style={{ background:BG, padding:"80px 80px" }}>
          <h2 style={{ textAlign:"center", fontSize:36, fontWeight:800, color:"#1E2A5A", marginBottom:10 }}>Our Services</h2>
          <p style={{ textAlign:"center", color:"#64748B", marginBottom:52, fontSize:16 }}>Everything you need for complete healthcare management</p>

          {/* How it works */}
          <h3 style={{ textAlign:"center", fontSize:24, fontWeight:700, color:"#1E2A5A", marginBottom:36 }}>How It Works</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20, maxWidth:1100, margin:"0 auto 64px" }}>
            {[["1","Profile","Create your account and add medications, health conditions, and preferences."],["2","Schedule","Our AI analyzes your meds and creates an optimized reminder schedule."],["3","Reminders","Get timely notifications via app, SMS, or phone call."],["4","Optimize","Monitor adherence, track health metrics, and get AI-powered insights."]].map(([n,t,s])=>(
              <div key={t} style={{ background:WHITE, borderRadius:16, padding:"28px 22px", textAlign:"center", boxShadow:"0 2px 12px rgba(0,0,0,.06)" }}>
                <div style={{ width:44, height:44, borderRadius:12, background:BLUE, color:WHITE, fontSize:20, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>{n}</div>
                <div style={{ fontWeight:700, color:"#1E2A5A", marginBottom:8 }}>{t}</div>
                <div style={{ fontSize:13, color:"#64748B", lineHeight:1.65 }}>{s}</div>
              </div>
            ))}
          </div>

          {/* AI Tech */}
          <h3 style={{ textAlign:"center", fontSize:28, fontWeight:800, color:"#1E2A5A", marginBottom:36 }}>Powered by Advanced AI Technology</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, maxWidth:900, margin:"0 auto" }}>
            {[["🧠","Machine Learning","Our AI learns from millions of data points to provide personalized health recommendations and predict potential issues before they arise.",BLUE],["💬","Natural Language Processing","Communicate with our AI health assistant using natural language. Ask questions and receive clear, understandable answers.",PURP],["📊","Predictive Analytics","Advanced algorithms analyze your health patterns and medication history to provide proactive health management strategies.","#0891B2"],["🗄️","Secure Data Processing","All health data is processed with military-grade encryption ensuring your privacy is protected at every step.","#16A34A"]].map(([i,t,s,c])=>(
              <div key={t} style={{ background:WHITE, borderRadius:16, padding:"28px 24px", boxShadow:"0 2px 12px rgba(0,0,0,.06)" }}>
                <div style={{ fontSize:36, marginBottom:14 }}>{i}</div>
                <h4 style={{ fontSize:18, fontWeight:700, color:"#1E2A5A", marginBottom:8 }}>{t}</h4>
                <p style={{ fontSize:14, color:"#64748B", lineHeight:1.7 }}>{s}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CONTACT ── */}
      {activeSection==="contact" && (
        <section id="contact" style={{ background:BG, padding:"80px 80px" }}>
          <h2 style={{ textAlign:"center", fontSize:36, fontWeight:800, color:"#1E2A5A", marginBottom:10 }}>Contact Us</h2>
          <p style={{ textAlign:"center", color:"#64748B", marginBottom:52, fontSize:16 }}>We're here to help 24/7</p>
          <div style={{ display:"grid", gridTemplateColumns:"400px 1fr", gap:40, maxWidth:1040, margin:"0 auto" }}>
            {/* Contact info */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {[["📞","Phone","Mon-Fri: 8am – 8pm EST","1-800-MEDGUARD"],["📧","Email","We'll respond within 24 hours","support@medguardai.com"],["📍","Office","Visit our headquarters","123 Healthcare Plaza, Boston MA 02115"]].map(([i,t,s,v])=>(
                <div key={t} style={{ background:WHITE, borderRadius:16, padding:"22px 20px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", textAlign:"center" }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>{i}</div>
                  <div style={{ fontWeight:700, color:"#1E2A5A", marginBottom:4 }}>{t}</div>
                  <div style={{ fontSize:13, color:"#94A3B8", marginBottom:6 }}>{s}</div>
                  <div style={{ fontSize:14, color:BLUE, fontWeight:600 }}>{v}</div>
                </div>
              ))}
            </div>
            {/* Form */}
            <div style={{ background:WHITE, borderRadius:20, padding:"32px 28px", boxShadow:"0 4px 20px rgba(0,0,0,.07)" }}>
              <h3 style={{ fontSize:20, fontWeight:700, color:"#1E2A5A", marginBottom:24 }}>Send us a Message</h3>
              {sent ? (
                <div style={{ textAlign:"center", padding:"60px 0" }}>
                  <div style={{ fontSize:56 }}>✅</div>
                  <h4 style={{ fontSize:20, fontWeight:700, color:"#1E2A5A", marginTop:16 }}>Message Sent!</h4>
                  <p style={{ color:"#64748B", marginTop:8 }}>We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                    {[["Full Name","name","text","Arjun Patel"],["Email Address","email","email","arjun@example.com"]].map(([l,k,t,p])=>(
                      <div key={k}>
                        <label style={{ fontSize:12, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:6 }}>{l} *</label>
                        <input type={t} placeholder={p} value={contactForm[k]} onChange={e=>setContactForm(f=>({...f,[k]:e.target.value}))} style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #E2E8F0", borderRadius:10, fontSize:14, outline:"none" }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                    <div>
                      <label style={{ fontSize:12, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:6 }}>Phone Number</label>
                      <input placeholder="+91 98765 43210" value={contactForm.phone} onChange={e=>setContactForm(f=>({...f,phone:e.target.value}))} style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #E2E8F0", borderRadius:10, fontSize:14, outline:"none" }} />
                    </div>
                    <div>
                      <label style={{ fontSize:12, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:6 }}>I am a *</label>
                      <select value={contactForm.role} onChange={e=>setContactForm(f=>({...f,role:e.target.value}))} style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #E2E8F0", borderRadius:10, fontSize:14, outline:"none", background:WHITE }}>
                        <option value="">Select…</option>
                        <option>Patient</option><option>Guardian / Caretaker</option><option>Healthcare Provider</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:12, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:6 }}>Subject *</label>
                    <input placeholder="How can we help?" value={contactForm.subject} onChange={e=>setContactForm(f=>({...f,subject:e.target.value}))} style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #E2E8F0", borderRadius:10, fontSize:14, outline:"none" }} />
                  </div>
                  <div style={{ marginBottom:24 }}>
                    <label style={{ fontSize:12, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:6 }}>Message *</label>
                    <textarea rows={5} placeholder="Tell us more…" value={contactForm.message} onChange={e=>setContactForm(f=>({...f,message:e.target.value}))} style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #E2E8F0", borderRadius:10, fontSize:14, outline:"none", resize:"vertical" }} />
                  </div>
                  <button className="btn-blue" onClick={()=>setSent(true)} style={{ width:"100%", padding:"15px", borderRadius:12, background:BLUE, color:WHITE, fontSize:15, fontWeight:700, border:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all .2s", boxShadow:"0 4px 14px rgba(59,91,219,.25)" }}>
                    ✉️ Send Message
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ background:"#1E2A5A", padding:"40px 80px 24px", color:"#94A3B8" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:32 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:BLUE, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>💙</div>
              <span style={{ fontSize:18, fontWeight:800, color:WHITE }}>MedGuard AI</span>
            </div>
            <p style={{ fontSize:13, lineHeight:1.7, maxWidth:260 }}>Intelligent healthcare management powered by AI. Keeping you and your loved ones healthy.</p>
          </div>
          {[["Product",["Patient Portal","Guardian Portal","AI Advisor","Analytics"]],["Company",["About","Services","Careers","Press"]],["Support",["Help Center","Contact","Privacy","Terms"]]].map(([title,links])=>(
            <div key={title}>
              <div style={{ fontSize:13, fontWeight:700, color:WHITE, marginBottom:14, textTransform:"uppercase", letterSpacing:1 }}>{title}</div>
              {links.map(l=><div key={l} style={{ fontSize:14, marginBottom:9, cursor:"pointer", color:"#94A3B8" }}>{l}</div>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,.1)", paddingTop:20, display:"flex", justifyContent:"space-between", fontSize:13 }}>
          <span>© 2026 MedGuard AI. All rights reserved.</span>
          <div style={{ display:"flex", gap:20 }}>
            {["HIPAA Compliant","FDA Registered","SSL Secured"].map(b=><span key={b} style={{ color:"#22C55E" }}>✅ {b}</span>)}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── PATIENT PORTAL ────────────────────────────────────────────
function PatientPortal({ setPage }) {
  const [tab, setTab] = useState("dashboard");
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { from:"ai", text:"Hello! I'm your MedGuard AI assistant. I can help you with medication info, symptoms, and health advice. How can I help?" },
    { from:"user", text:"Is it safe to take ibuprofen with Lisinopril?" },
    { from:"ai", text:"⚠️ Caution: NSAIDs like ibuprofen can reduce Lisinopril's blood pressure-lowering effect. Please consult your doctor before combining these medications." },
  ]);

  const meds = [
    { name:"Metformin 500mg", time:"8:00 AM",  status:"taken",    icon:"💊", color:"#22C55E" },
    { name:"Aspirin 100mg",   time:"2:00 PM",  status:"upcoming", icon:"💊", color:"#3B82F6" },
    { name:"Lisinopril 10mg", time:"9:00 PM",  status:"upcoming", icon:"💊", color:"#F59E0B" },
  ];

  const sendMsg = () => {
    if (!chatMsg.trim()) return;
    const responses = [
      "Based on your profile, that medication is compatible with your current regimen. ✅",
      "I recommend consulting your doctor for personalized advice on that. I can help schedule an appointment.",
      "That's a great question! Your blood pressure has been stable. Keep up the good work! 💪",
      "I notice you haven't logged your evening dose. Would you like me to set an extra reminder?",
    ];
    setChatHistory(h=>[...h, {from:"user",text:chatMsg}, {from:"ai",text:responses[Math.floor(Math.random()*responses.length)]}]);
    setChatMsg("");
  };

  const TABS = ["dashboard","medications","ai-advisor","analytics","settings"];

  return (
    <div style={{ minHeight:"100vh", background:BG }}>
      {/* Topbar */}
      <div style={{ background:WHITE, borderBottom:"1px solid #E2E8F0", padding:"0 40px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 1px 8px rgba(0,0,0,.05)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={()=>setPage("home")}>
          <div style={{ width:32, height:32, borderRadius:9, background:BLUE, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>💙</div>
          <span style={{ fontWeight:800, fontSize:18, color:BLUE }}>MedGuard AI</span>
          <span style={{ background:"#EBF4FF", color:BLUE, fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:100, marginLeft:4 }}>Patient Portal</span>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {TABS.map(t=>(
            <button key={t} className="tab-btn" onClick={()=>setTab(t)} style={{ padding:"8px 16px", borderRadius:9, background: tab===t ? BLUE : "transparent", color: tab===t ? WHITE : "#4A5568", fontWeight: tab===t ? 700 : 500, fontSize:14, border:"none", textTransform:"capitalize", transition:"all .2s" }}>
              {t.replace("-"," ")}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#22C55E", animation:"pulse 1.8s infinite" }} />
          <span style={{ fontSize:13, color:"#4A5568" }}>AI Active</span>
          <div style={{ width:38, height:38, borderRadius:"50%", background:`linear-gradient(135deg,${BLUE},${PURP})`, display:"flex", alignItems:"center", justifyContent:"center", color:WHITE, fontWeight:700, fontSize:16 }}>A</div>
        </div>
      </div>

      <div style={{ padding:"32px 40px" }}>

        {/* Dashboard Tab */}
        {tab==="dashboard" && (
          <>
            {/* Welcome */}
            <div style={{ background:`linear-gradient(135deg, ${BLUE} 0%, #2D4BC4 100%)`, borderRadius:20, padding:"28px 36px", marginBottom:28, display:"flex", justifyContent:"space-between", alignItems:"center", color:WHITE }}>
              <div>
                <div style={{ fontSize:24, fontWeight:800, marginBottom:6 }}>Good Morning, Arjun! 👋</div>
                <div style={{ fontSize:15, opacity:.85 }}>You have <strong>2 medications</strong> due today. Current streak: <strong>12 days 🔥</strong></div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:12, opacity:.7, textTransform:"uppercase", letterSpacing:1 }}>Weekly Adherence</div>
                <div style={{ fontSize:52, fontWeight:900, lineHeight:1 }}>90%</div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
              {[["💊","Today's Doses","3","2 remaining","#EBF4FF",BLUE],["🔥","Streak","12","days in a row","#FEF3C7","#D97706"],["⚠️","Interactions","0","all clear","#ECFDF5","#16A34A"],["🤖","AI Insights","5","new this week","#F5F0FF",PURP]].map(([i,l,v,s,bg,c])=>(
                <div key={l} style={{ background:WHITE, borderRadius:16, padding:"20px 22px", border:"1px solid #E2E8F0", boxShadow:"0 2px 10px rgba(0,0,0,.05)" }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:12 }}>{i}</div>
                  <div style={{ fontSize:30, fontWeight:900, color:c }}>{v}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#1E2A5A", marginTop:2 }}>{l}</div>
                  <div style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>{s}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:20 }}>
              {/* Schedule */}
              <div style={{ background:WHITE, borderRadius:18, padding:"24px 26px", border:"1px solid #E2E8F0", boxShadow:"0 2px 10px rgba(0,0,0,.05)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <h3 style={{ fontSize:17, fontWeight:700, color:"#1E2A5A" }}>Today's Medication Schedule</h3>
                  <button className="btn-blue" style={{ padding:"8px 16px", borderRadius:9, background:BLUE, color:WHITE, fontWeight:700, fontSize:13, border:"none", transition:"all .2s" }}>+ Add Med</button>
                </div>
                {meds.map((m,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", borderBottom: i<meds.length-1 ? "1px solid #F1F5F9" : "none" }}>
                    <div style={{ width:48, height:48, borderRadius:14, background: m.status==="taken"?"#ECFDF5":"#F8FAFC", border:`1.5px solid ${m.status==="taken"?"#22C55E":"#E2E8F0"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{m.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:15, fontWeight:700, color:"#1E2A5A" }}>{m.name}</div>
                      <div style={{ fontSize:13, color:"#94A3B8", marginTop:2 }}>⏰ {m.time}</div>
                    </div>
                    <div style={{ padding:"5px 14px", borderRadius:100, background: m.status==="taken"?"#ECFDF5":"#FEF3C7", color: m.status==="taken"?"#16A34A":"#D97706", fontSize:13, fontWeight:700 }}>
                      {m.status==="taken"?"✓ Taken":"⏳ Upcoming"}
                    </div>
                    {m.status==="upcoming" && <button style={{ padding:"7px 14px", borderRadius:9, background:BLUE, color:WHITE, fontSize:12, fontWeight:700, border:"none", cursor:"pointer" }}>Remind</button>}
                  </div>
                ))}
                <div style={{ marginTop:18, background:"#F8FAFC", borderRadius:12, padding:"14px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:"#64748B" }}>Daily Progress</span>
                    <span style={{ fontSize:13, fontWeight:700, color:BLUE }}>1 / 3 taken</span>
                  </div>
                  <div style={{ height:8, borderRadius:8, background:"#E2E8F0" }}>
                    <div style={{ height:"100%", width:"33%", background:`linear-gradient(90deg,${BLUE},#2D4BC4)`, borderRadius:8 }} />
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {/* AI Insights */}
                <div style={{ background:`linear-gradient(135deg,#1E2A5A,#2D4BC4)`, borderRadius:18, padding:"20px 22px", color:WHITE }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${BLUE},${PURP})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🤖</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14 }}>AI Health Insights</div>
                      <div style={{ fontSize:11, opacity:.6, marginTop:1 }}>Powered by MedGuard AI v2</div>
                    </div>
                    <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5 }}>
                      <div style={{ width:7, height:7, borderRadius:"50%", background:"#22C55E", animation:"pulse 1.5s infinite" }} />
                      <span style={{ fontSize:11, color:"#22C55E" }}>Live</span>
                    </div>
                  </div>
                  <div style={{ background:"rgba(255,255,255,.08)", borderRadius:10, padding:"11px 14px", marginBottom:10, fontSize:13, color:"#CBD5E1", lineHeight:1.6 }}>
                    💡 Your blood pressure has been consistently normal. Great job maintaining a healthy lifestyle!
                  </div>
                  <div style={{ background:"rgba(245,158,11,.15)", borderRadius:10, padding:"11px 14px", border:"1px solid rgba(245,158,11,.3)", fontSize:13, color:"#FCD34D", lineHeight:1.6 }}>
                    ⏰ Reminder: It's time for your annual flu vaccine. Would you like to schedule an appointment?
                  </div>
                  <button onClick={()=>setTab("ai-advisor")} style={{ width:"100%", marginTop:12, padding:"10px", borderRadius:10, background:BLUE, color:WHITE, fontSize:13, fontWeight:700, border:"none", cursor:"pointer" }}>
                    💬 Chat with AI Assistant
                  </button>
                </div>

                {/* Quick Actions */}
                <div style={{ background:WHITE, borderRadius:18, padding:"18px 20px", border:"1px solid #E2E8F0" }}>
                  <div style={{ fontSize:14, fontWeight:700, color:"#1E2A5A", marginBottom:14 }}>Quick Actions</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                    {[["➕","Add\nMedication","#EBF4FF",BLUE],["📋","Log\nSymptoms","#EBF4FF",BLUE],["🔍","Scan\nPill","#EBF4FF",BLUE],["🆘","Emergency\nSOS","#FEE2E2","#EF4444"],["📊","View\nReports","#EBF4FF",BLUE],["👨‍⚕️","Contact\nDoctor","#EBF4FF",BLUE]].map(([i,l,bg,c])=>(
                      <button key={l} style={{ background:bg, borderRadius:12, padding:"12px 6px", border:`1.5px solid ${c==="#EF4444"?"#FCA5A5":"#BFDBFE"}`, cursor:"pointer", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:6, transition:"all .2s" }}>
                        <span style={{ fontSize:22 }}>{i}</span>
                        <span style={{ fontSize:11, fontWeight:600, color:c, whiteSpace:"pre-line", lineHeight:1.3 }}>{l}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Safety Status */}
                <div style={{ background:WHITE, borderRadius:16, padding:"16px 18px", border:"1px solid #E2E8F0" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#1E2A5A", marginBottom:12 }}>🛡️ Safety Dashboard</div>
                  {[["Drug Interactions","All Clear","#ECFDF5","#16A34A"],["Allergy Conflicts","No Flags","#ECFDF5","#16A34A"],["Dosage Accuracy","Optimal","#EBF4FF",BLUE],["Refill Needed","In 5 days","#FEF3C7","#D97706"]].map(([l,s,bg,c])=>(
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #F1F5F9" }}>
                      <span style={{ fontSize:13, color:"#64748B" }}>{l}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:c, background:bg, padding:"3px 10px", borderRadius:100 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* AI Advisor Tab */}
        {tab==="ai-advisor" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:24 }}>
            <div style={{ background:WHITE, borderRadius:20, padding:"24px", border:"1px solid #E2E8F0", display:"flex", flexDirection:"column", height:600 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, paddingBottom:16, borderBottom:"1px solid #F1F5F9" }}>
                <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,${BLUE},${PURP})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>🤖</div>
                <div><div style={{ fontWeight:700, color:"#1E2A5A" }}>MedGuard AI Assistant</div><div style={{ fontSize:12, color:"#22C55E" }}>● Online · Responding in ~2s</div></div>
                <div style={{ marginLeft:"auto", padding:"6px 14px", background:"#ECFDF5", borderRadius:100, fontSize:12, color:"#16A34A", fontWeight:700 }}>AI Active</div>
              </div>
              <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:12, marginBottom:16 }}>
                {chatHistory.map((m,i)=>(
                  <div key={i} style={{ display:"flex", justifyContent: m.from==="user"?"flex-end":"flex-start" }}>
                    <div style={{ maxWidth:"75%", padding:"12px 16px", borderRadius:16, background: m.from==="user" ? BLUE : "#F8FAFC", color: m.from==="user" ? WHITE : "#1E2A5A", fontSize:14, lineHeight:1.65, border: m.from==="ai" ? "1px solid #E2E8F0" : "none" }}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="Ask about medications, symptoms, health advice…" style={{ flex:1, padding:"13px 16px", border:"1.5px solid #E2E8F0", borderRadius:12, fontSize:14, outline:"none" }} />
                <button onClick={sendMsg} style={{ padding:"13px 20px", borderRadius:12, background:BLUE, color:WHITE, fontWeight:700, fontSize:14, border:"none" }}>Send</button>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ background:WHITE, borderRadius:16, padding:"18px", border:"1px solid #E2E8F0" }}>
                <div style={{ fontWeight:700, color:"#1E2A5A", marginBottom:12 }}>💡 Suggested Questions</div>
                {["What are the side effects of Metformin?","Can I take these meds with food?","What does my blood pressure reading mean?","Is 90% adherence good?"].map(q=>(
                  <button key={q} onClick={()=>{ setChatHistory(h=>[...h,{from:"user",text:q},{from:"ai",text:"Great question! Based on your health profile, I recommend consulting your doctor for personalized guidance. I can help you book an appointment."}]); }} style={{ width:"100%", textAlign:"left", padding:"10px 12px", borderRadius:10, background:"#F8FAFC", border:"1px solid #E2E8F0", fontSize:13, color:"#374151", cursor:"pointer", marginBottom:8 }}>{q}</button>
                ))}
              </div>
              <div style={{ background:`linear-gradient(135deg,${BLUE},${PURP})`, borderRadius:16, padding:"18px", color:WHITE }}>
                <div style={{ fontWeight:700, marginBottom:8 }}>⚠️ Disclaimer</div>
                <p style={{ fontSize:12, opacity:.85, lineHeight:1.65 }}>This AI provides general information only and is not a substitute for professional medical advice. Always consult your doctor for medical decisions.</p>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {tab==="analytics" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {[["📅","This Month","27/30 doses taken","90% adherence"],["📈","Best Streak","14 days","Personal record!"],["⭐","Avg Adherence","92%","Last 3 months"]].map(([i,l,v,s])=>(
              <div key={l} style={{ background:WHITE, borderRadius:18, padding:"28px 24px", border:"1px solid #E2E8F0", textAlign:"center", boxShadow:"0 2px 10px rgba(0,0,0,.05)" }}>
                <div style={{ fontSize:40, marginBottom:12 }}>{i}</div>
                <div style={{ fontSize:13, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:1 }}>{l}</div>
                <div style={{ fontSize:28, fontWeight:900, color:BLUE, margin:"8px 0 4px" }}>{v}</div>
                <div style={{ fontSize:13, color:"#64748B" }}>{s}</div>
              </div>
            ))}
            <div style={{ gridColumn:"1/-1", background:WHITE, borderRadius:18, padding:"28px 24px", border:"1px solid #E2E8F0" }}>
              <h3 style={{ fontWeight:700, color:"#1E2A5A", marginBottom:20 }}>Weekly Adherence — Last 4 Weeks</h3>
              <div style={{ display:"flex", alignItems:"flex-end", gap:12, height:120 }}>
                {[85,92,78,90].map((v,i)=>(
                  <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:BLUE }}>{v}%</span>
                    <div style={{ width:"100%", height:`${v}%`, background:`linear-gradient(180deg,${BLUE},#2D4BC4)`, borderRadius:"8px 8px 0 0", opacity:.8 }} />
                    <span style={{ fontSize:12, color:"#94A3B8" }}>Week {i+1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Medications tab */}
        {tab==="medications" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <h2 style={{ fontSize:22, fontWeight:800, color:"#1E2A5A" }}>My Medications</h2>
              <button className="btn-blue" style={{ padding:"11px 20px", borderRadius:11, background:BLUE, color:WHITE, fontWeight:700, fontSize:14, border:"none", transition:"all .2s" }}>+ Add Medication</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              {[["💊","Metformin 500mg","Twice daily","Diabetes management","#ECFDF5","#16A34A","Active"],["💊","Aspirin 100mg","Once daily","Blood thinner","#EBF4FF",BLUE,"Active"],["💊","Lisinopril 10mg","Once daily","Blood pressure","#FEF3C7","#D97706","Active"],["💊","Atorvastatin 20mg","Once at night","Cholesterol","#F5F0FF",PURP,"Active"]].map(([i,n,f,u,bg,c,s])=>(
                <div key={n} style={{ background:WHITE, borderRadius:16, padding:"20px", border:"1px solid #E2E8F0", boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                    <div style={{ width:46, height:46, borderRadius:12, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{i}</div>
                    <span style={{ fontSize:12, fontWeight:700, color:c, background:bg, padding:"4px 10px", borderRadius:100, alignSelf:"start" }}>{s}</span>
                  </div>
                  <div style={{ fontWeight:700, color:"#1E2A5A", marginBottom:4 }}>{n}</div>
                  <div style={{ fontSize:13, color:"#64748B", marginBottom:2 }}>🔁 {f}</div>
                  <div style={{ fontSize:13, color:"#94A3B8" }}>{u}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="settings" && (
          <div style={{ background:WHITE, borderRadius:20, padding:"32px", border:"1px solid #E2E8F0", maxWidth:600 }}>
            <h2 style={{ fontSize:22, fontWeight:800, color:"#1E2A5A", marginBottom:24 }}>Account Settings</h2>
            {[["Full Name","Arjun Patel"],["Email","arjun@example.com"],["Phone","+91 98765 43210"]].map(([l,v])=>(
              <div key={l} style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:6 }}>{l}</label>
                <input defaultValue={v} style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #E2E8F0", borderRadius:10, fontSize:14, outline:"none" }} />
              </div>
            ))}
            <button className="btn-blue" style={{ padding:"13px 24px", borderRadius:11, background:BLUE, color:WHITE, fontWeight:700, fontSize:14, border:"none", transition:"all .2s", marginTop:8 }}>Save Changes</button>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── GUARDIAN PORTAL ───────────────────────────────────────────
function GuardianPortal({ setPage }) {
  const [selectedPatient, setSelectedPatient] = useState(0);
  const patients = [
    { initials:"MS", name:"Mary Smith",   rel:"Mother",      age:72, color:PURP,  bg:"#F5F0FF", status:"green"  },
    { initials:"JS", name:"John Smith",   rel:"Father",      age:75, color:BLUE,  bg:"#EBF4FF", status:"green"  },
    { initials:"RJ", name:"Rose Johnson", rel:"Grandmother", age:89, color:"#0891B2", bg:"#E0F7FA", status:"amber" },
  ];
  const p = patients[selectedPatient];

  return (
    <div style={{ minHeight:"100vh", background:"#F5F0FF" }}>
      {/* Hero */}
      <div style={{ background:`linear-gradient(160deg,#EDE9FE 0%,#DDD6FE 100%)`, padding:"0 80px 0", minHeight:"55vh", display:"flex", flexDirection:"column" }}>
        {/* Topbar */}
        <div style={{ height:68, display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(124,58,237,.15)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={()=>setPage("home")}>
            <div style={{ width:32, height:32, borderRadius:9, background:BLUE, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>💙</div>
            <span style={{ fontWeight:800, fontSize:18, color:"#1E2A5A" }}>MedGuard AI</span>
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <button className="btn-blue" onClick={()=>setPage("patient")} style={{ padding:"10px 20px", borderRadius:10, background:BLUE, color:WHITE, fontWeight:700, fontSize:14, border:"none", transition:"all .2s" }}>Patient Portal</button>
            <button style={{ padding:"10px 20px", borderRadius:10, background:PURP, color:WHITE, fontWeight:700, fontSize:14, border:"none", boxShadow:`0 4px 14px rgba(124,58,237,.3)` }}>Guardian Portal</button>
          </div>
        </div>

        {/* Hero content */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"48px 0" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(124,58,237,.12)", borderRadius:100, padding:"7px 16px", marginBottom:20 }}>
            <span style={{ fontSize:18 }}>👥</span>
            <span style={{ fontSize:13, fontWeight:700, color:PURP }}>Guardian Portal</span>
          </div>
          <h1 style={{ fontSize:52, fontWeight:900, color:"#1E2A5A", lineHeight:1.15, marginBottom:16, letterSpacing:"-1px" }}>
            Care for Your Loved Ones<br/><span style={{ color:PURP }}>with Confidence</span>
          </h1>
          <p style={{ fontSize:17, color:"#4A5568", maxWidth:560, lineHeight:1.75, marginBottom:32 }}>
            Monitor multiple patients, manage medications, and stay connected — all from one powerful dashboard.
          </p>
          <div style={{ display:"flex", gap:14 }}>
            <button style={{ padding:"14px 28px", borderRadius:12, background:PURP, color:WHITE, fontWeight:700, fontSize:15, border:"none", boxShadow:"0 4px 16px rgba(124,58,237,.35)" }}>▶ Get Started</button>
            <button style={{ padding:"14px 28px", borderRadius:12, background:"rgba(255,255,255,.6)", color:"#4A5568", fontWeight:700, fontSize:15, border:"1.5px solid rgba(124,58,237,.3)" }}>🎬 Watch Demo</button>
          </div>
        </div>
      </div>

      {/* Patient selector */}
      <div style={{ background:WHITE, padding:"36px 80px 0" }}>
        <div style={{ fontSize:18, fontWeight:800, color:"#1E2A5A", marginBottom:20 }}>Select Patient</div>
        <div style={{ display:"flex", gap:16, marginBottom:0 }}>
          {patients.map((pt,i)=>(
            <div key={i} onClick={()=>setSelectedPatient(i)} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 22px", borderRadius:16, cursor:"pointer", border:`2px solid ${selectedPatient===i ? PURP : "#E2E8F0"}`, background: selectedPatient===i ? "#F5F0FF" : WHITE, transition:"all .2s", minWidth:200 }}>
              <div style={{ width:48, height:48, borderRadius:"50%", background:pt.bg, color:pt.color, fontWeight:800, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:`2px solid ${pt.color}` }}>{pt.initials}</div>
              <div>
                <div style={{ fontWeight:700, color:"#1E2A5A" }}>{pt.name}</div>
                <div style={{ fontSize:13, color:"#64748B" }}>{pt.rel} · {pt.age} years</div>
              </div>
              <div style={{ marginLeft:"auto", width:10, height:10, borderRadius:"50%", background: pt.status==="green"?"#22C55E":"#F59E0B", flexShrink:0 }} />
            </div>
          ))}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"16px 22px", borderRadius:16, border:"2px dashed #E2E8F0", cursor:"pointer", minWidth:160, color:"#94A3B8", fontWeight:600, fontSize:14, gap:8 }}>
            ＋ Add Patient
          </div>
        </div>
      </div>

      {/* Patient dashboard */}
      <div style={{ padding:"28px 80px 48px" }}>
        <div style={{ background:WHITE, borderRadius:20, padding:"28px 32px", marginBottom:20, border:"1px solid #E2E8F0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:20, fontWeight:800, color:"#1E2A5A", marginBottom:4 }}>{p.name}'s Overview</div>
            <div style={{ fontSize:14, color:"#64748B" }}>{p.rel} · Age {p.age} · Last active 5 minutes ago</div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button style={{ padding:"10px 18px", borderRadius:10, background:"#ECFDF5", color:"#16A34A", fontWeight:700, fontSize:13, border:"1px solid #BBF7D0" }}>✅ All Meds Taken Today</button>
            <button style={{ padding:"10px 18px", borderRadius:10, background:"#FEE2E2", color:"#EF4444", fontWeight:700, fontSize:13, border:"1px solid #FECACA" }}>🆘 Emergency Contact</button>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
          {[["💊","Today's Meds","3/3","All taken","#ECFDF5","#16A34A"],["🔥","Streak",`${7+selectedPatient*3}d`,"consecutive","#FEF3C7","#D97706"],["⚠️","Missed This Month","2","last 30 days","#FEE2E2","#EF4444"],["📊","Adherence","94%","this month","#EBF4FF",BLUE]].map(([i,l,v,s,bg,c])=>(
            <div key={l} style={{ background:WHITE, borderRadius:16, padding:"20px 22px", border:"1px solid #E2E8F0", boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}>
              <div style={{ width:40, height:40, borderRadius:11, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:10 }}>{i}</div>
              <div style={{ fontSize:26, fontWeight:900, color:c }}>{v}</div>
              <div style={{ fontSize:12, fontWeight:700, color:"#1E2A5A", marginTop:2 }}>{l}</div>
              <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>{s}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          {/* Medication schedule */}
          <div style={{ background:WHITE, borderRadius:18, padding:"22px 24px", border:"1px solid #E2E8F0" }}>
            <h3 style={{ fontWeight:700, color:"#1E2A5A", marginBottom:16 }}>Medication Schedule</h3>
            {[["💊","Metformin 500mg","8:00 AM","taken"],["💊","Aspirin 100mg","2:00 PM","taken"],["💊","Lisinopril 10mg","9:00 PM","upcoming"]].map(([i,n,t,s],idx)=>(
              <div key={idx} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid #F1F5F9" }}>
                <span style={{ fontSize:22 }}>{i}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, color:"#1E2A5A", fontSize:14 }}>{n}</div>
                  <div style={{ fontSize:12, color:"#94A3B8" }}>{t}</div>
                </div>
                <span style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:100, background:s==="taken"?"#ECFDF5":"#FEF3C7", color:s==="taken"?"#16A34A":"#D97706" }}>{s==="taken"?"✓ Taken":"⏳ Upcoming"}</span>
              </div>
            ))}
          </div>

          {/* Guardian features */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:`linear-gradient(135deg,${PURP},#6D28D9)`, borderRadius:18, padding:"20px 22px", color:WHITE }}>
              <div style={{ fontWeight:700, marginBottom:12 }}>👥 Guardian Controls</div>
              {["Dosage adjustments","Medication additions","Schedule changes","Emergency contacts","Activity updates"].map(f=>(
                <div key={f} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
                  <span style={{ color:"#A5F3D4", fontWeight:700 }}>✓</span>
                  <span style={{ fontSize:14, opacity:.9 }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ background:WHITE, borderRadius:16, padding:"18px 20px", border:"1px solid #E2E8F0" }}>
              <div style={{ fontWeight:700, color:"#457cb2ff", marginBottom:12 }}>📲 Recent Alerts</div>
              {[["🔔","Medication reminder sent","2 min ago","#EBF4FF"],["✅","Aspirin 100mg confirmed taken","1 hr ago","#ECFDF5"],["⚠️","Lisinopril due at 9:00 PM","Upcoming","#FEF3C7"]].map(([i,m,t,bg])=>(
                <div key={m} style={{ display:"flex", gap:10, padding:"9px 0", borderBottom:"1px solid #F1F5F9" }}>
                  <span>{i}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:"#1E2A5A" }}>{m}</div>
                    <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>{t}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{ background:`linear-gradient(135deg,${PURP},#6D28D9)`, padding:"56px 80px", textAlign:"center", color:WHITE }}>
        <h2 style={{ fontSize:36, fontWeight:800, marginBottom:12 }}>Ready to Provide Better Care?</h2>
        <p style={{ fontSize:16, opacity:.85, marginBottom:32 }}>Join thousands of guardians who trust MedGuard AI to help them care for their loved ones.</p>
        <div style={{ display:"flex", gap:14, justifyContent:"center", marginBottom:20 }}>
          <button style={{ padding:"14px 28px", borderRadius:12, background:WHITE, color:PURP, fontWeight:800, fontSize:15, border:"none", cursor:"pointer" }}>🚀 Start Free Trial</button>
          <button style={{ padding:"14px 28px", borderRadius:12, background:"rgba(255,255,255,.15)", color:WHITE, fontWeight:700, fontSize:15, border:"1.5px solid rgba(255,255,255,.3)", cursor:"pointer" }}>🤝 Contact Support</button>
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:28, fontSize:14, opacity:.8 }}>
          {["✅ No credit card required","🔄 14-day free trial","❌ Cancel anytime"].map(t=><span key={t}>{t}</span>)}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [activeSection, setActiveSection] = useState("home");

  return (
    <div>
      <style>{GCSS}</style>
      {page !== "patient" && page !== "guardian" && (
        <Navbar page={page} setPage={setPage} activeSection={activeSection} setActiveSection={setActiveSection} />
      )}
      {(page === "home" || page === "about" || page === "services" || page === "contact") && (
        <HomePage setPage={setPage} activeSection={activeSection} />
      )}
      {page === "patient"  && <PatientPortal  setPage={setPage} />}
      {page === "guardian" && <GuardianPortal setPage={setPage} />}
    </div>
  );
}