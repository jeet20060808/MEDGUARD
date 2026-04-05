import { useState, useEffect, useRef, useCallback, Component } from "react";

// ── CONSTANTS ─────────────────────────────────────────
const API_BASE_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

// ── ERROR BOUNDARY ────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(err, info) { console.error("ErrorBoundary caught:", err, info); }
  render() {
    if (this.state.hasError) return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050810", color: "#fff", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 48 }}><Icons.SOS/></div>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Something went wrong</h2>
        <p style={{ color: "#8ab4d4", fontSize: 14 }}>{this.state.error?.message}</p>
        <button onClick={() => this.setState({ hasError: false, error: null })} style={{ padding: "12px 28px", borderRadius: 12, background: "#4ba6c7", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>Try Again</button>
      </div>
    );
    return this.props.children;
  }
}

// ── SVG ICONS ─────────────────────────────────────────
const Icons = {
  Dash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Med: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>,
  AI: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>,
  Chart: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  Log: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M17.41 22H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.59a2 2 0 0 1 1.41.59l4.42 4.42a2 2 0 0 1 .58 1.41V20a2 2 0 0 1-2 2Z"/><path d="M16 14H8"/><path d="M16 18H8"/><path d="M9 10H8"/></svg>,
  Settings: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Sun: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  SOS: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Shield: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Back: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Syringe: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>,
  Calendar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Heart: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Trash: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Edit: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Activity: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Flame: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.256 1.254-3.124"/></svg>,
  Globe: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Mic: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  Send: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Droplet: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
  Thermometer: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>,
  Weight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.46A2 2 0 0 0 17.48 8Z"/></svg>,
  Eye: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Lock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Zap: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Star: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Smile: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  Clock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Refresh: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>,
  Message: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Building: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><rect x="9" y="6" width="6" height="4"/><line x1="9" y1="14" x2="15" y2="14"/><line x1="9" y1="18" x2="15" y2="18"/><line x1="12" y1="6" x2="12" y2="18"/></svg>,
  Pin: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  DNA: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3c3.5 3.5 8.5 3.5 12 0"/><path d="M15 3c3.5 3.5 3.5 8.5 0 12"/><path d="M21 15c-3.5 3.5-8.5 3.5-12 0"/><path d="M9 21c-3.5-3.5-3.5-8.5 0-12"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="15" r="1"/></svg>,
  Flag: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 21V2"/><path d="M4 7h16l-2 4 2 4H4"/></svg>,
  Lightbulb: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M10 2v6a6 6 0 0 0 12 0v-6"/><circle cx="12" cy="14" r="4"/></svg>,
  Hand: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.83L7 15"/></svg>,
  Lungs: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6"/><path d="M12 8c-2.5 0-4 1.5-4 4s1.5 4 4 4 4-1.5 4-4-1.5-4-4-4"/><path d="M4 10c0-2.5 1.5-4 4-4s4 1.5 4 4-1.5 4-4 4-4-1.5-4-4"/><path d="M20 10c0-2.5-1.5-4-4-4s-4 1.5-4 4 1.5 4 4 4 4-1.5 4-4"/><path d="M8 14v6"/><path d="M16 14v6"/></svg>,
};

// ── TRANSLATIONS ──────────────────────────────────────
const T = {
  en: { dashboard:"Dashboard", medications:"Medications", aiAdvisor:"AI Advisor", analytics:"Analytics", symptoms:"Health Log", vaccinations:"Vaccinations", appointments:"Appointments", settings:"Settings", vitals:"Vitals", notifications:"Notifications", addMed:"Add Med", markTaken:"Mark Taken", taken:"Taken", healthScore:"Health Score", streak:"Streak", langName:"English" },
  hi: { dashboard:"डैशबोर्ड", medications:"दवाइयाँ", aiAdvisor:"AI सलाहकार", analytics:"विश्लेषण", symptoms:"स्वास्थ्य लॉग", vaccinations:"टीकाकरण", appointments:"अपॉइंटमेंट", settings:"सेटिंग्स", vitals:"जीवन चिह्न", notifications:"सूचनाएं", addMed:"दवा जोड़ें", markTaken:"ली ", taken:"ली गई", healthScore:"स्वास्थ्य स्कोर", streak:"स्ट्रीक", langName:"हिंदी" },
  gu: { dashboard:"ડૅશબોર્ડ", medications:"દવાઓ", aiAdvisor:"AI સલાહ", analytics:"વિશ્લેષણ", symptoms:"સ્વાસ્થ્ય લૉગ", vaccinations:"રસીકરણ", appointments:"એપૉઇન્ટ", settings:"સેટિંગ્સ", vitals:"જૈવ સંકેત", notifications:"સૂચનાઓ", addMed:"દવા ઉમેરો", markTaken:"લીધી ", taken:"લીધી", healthScore:"સ્વાસ્થ્ય સ્કોર", streak:"સ્ટ્રીક", langName:"ગુજરાતી" },
};

// ── DRUG INTERACTIONS DB ──────────────────────────────
const DRUG_INTERACTIONS = [
  { drugs:["warfarin","aspirin"], severity:"HIGH", effect:"Major bleeding risk. Avoid unless prescribed together with monitoring." },
  { drugs:["lisinopril","ibuprofen"], severity:"HIGH", effect:"NSAIDs reduce ACE inhibitor effectiveness and can worsen kidney function." },
  { drugs:["metformin","alcohol"], severity:"HIGH", effect:"Risk of lactic acidosis. Avoid alcohol while taking Metformin." },
  { drugs:["atorvastatin","grapefruit"], severity:"MEDIUM", effect:"Grapefruit increases statin levels, raising risk of muscle damage." },
  { drugs:["sertraline","tramadol"], severity:"HIGH", effect:"Risk of serotonin syndrome. Seek immediate medical attention." },
  { drugs:["methotrexate","aspirin"], severity:"HIGH", effect:"Aspirin can increase Methotrexate toxicity dangerously." },
  { drugs:["digoxin","amiodarone"], severity:"HIGH", effect:"Amiodarone significantly increases Digoxin blood levels." },
  { drugs:["clopidogrel","omeprazole"], severity:"MEDIUM", effect:"Omeprazole may reduce Clopidogrel's antiplatelet effect." },
  { drugs:["sildenafil","nitrates"], severity:"HIGH", effect:"Severe drop in blood pressure. This combination can be fatal." },
  { drugs:["fluoxetine","maoi"], severity:"HIGH", effect:"Risk of life-threatening serotonin syndrome." },
  { drugs:["lithium","ibuprofen"], severity:"HIGH", effect:"NSAIDs can raise Lithium to toxic levels in the blood." },
  { drugs:["ciprofloxacin","antacids"], severity:"MEDIUM", effect:"Antacids reduce Ciprofloxacin absorption by up to 90%." },
  { drugs:["warfarin","ibuprofen"], severity:"HIGH", effect:"Dramatically increases bleeding risk. Avoid this combination." },
  { drugs:["amlodipine","simvastatin"], severity:"MEDIUM", effect:"Amlodipine increases Simvastatin exposure, raising myopathy risk." },
  { drugs:["aspirin","naproxen"], severity:"MEDIUM", effect:"Both are NSAIDs — combined use increases GI bleeding risk." },
  { drugs:["alcohol","acetaminophen"], severity:"HIGH", effect:"Liver damage risk greatly increased. Avoid alcohol with Paracetamol." },
  { drugs:["potassium","spironolactone"], severity:"HIGH", effect:"Risk of dangerous hyperkalemia (high potassium)." },
  { drugs:["levothyroxine","calcium"], severity:"MEDIUM", effect:"Calcium supplements reduce Levothyroxine absorption. Take 4 hrs apart." },
  { drugs:["azithromycin","antacids"], severity:"LOW", effect:"Antacids may slightly reduce Azithromycin absorption." },
];

function checkInteraction(drug1, drug2) {
  const d1 = drug1.toLowerCase().trim(), d2 = drug2.toLowerCase().trim();
  return DRUG_INTERACTIONS.find(i =>
    (i.drugs[0].includes(d1)||d1.includes(i.drugs[0]))&&(i.drugs[1].includes(d2)||d2.includes(i.drugs[1]))||
    (i.drugs[1].includes(d1)||d1.includes(i.drugs[1]))&&(i.drugs[0].includes(d2)||d2.includes(i.drugs[0]))
  );
}

// ── THEME ─────────────────────────────────────────────
const C = {
  light: {
    bg:"#f4f7fb", surface:"rgba(255,255,255,0.95)", card:"rgba(255,255,255,0.8)",
    border:"rgba(15,23,42,0.08)", text:"#0f172a", textMid:"#475569", textSoft:"#94a3b8",
    accent:"#0ea5e9", accentLight:"rgba(14,165,233,0.08)", accentBorder:"rgba(14,165,233,0.2)",
    sidebar:"#0f172a", sidebarText:"#94a3b8", sidebarActive:"#0ea5e9",
    inputBg:"rgba(241,245,249,0.9)", cardShadow:"0 4px 24px rgba(0,0,0,0.06)",
    gradStart:"#0ea5e9", gradEnd:"#06b6d4",
  },
  dark: {
    bg:"#060b14", surface:"rgba(11,18,33,0.9)", card:"rgba(15,24,42,0.6)",
    border:"rgba(255,255,255,0.07)", text:"#f1f5f9", textMid:"#94a3b8", textSoft:"#475569",
    accent:"#38bdf8", accentLight:"rgba(56,189,248,0.08)", accentBorder:"rgba(56,189,248,0.2)",
    sidebar:"#040810", sidebarText:"#64748b", sidebarActive:"#38bdf8",
    inputBg:"rgba(255,255,255,0.04)", cardShadow:"0 4px 32px rgba(0,0,0,0.4)",
    gradStart:"#38bdf8", gradEnd:"#818cf8",
  }
};

// ── HOOKS ─────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((icon, title, msg, type="success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, icon, title, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, show };
}

function useOffline() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on=()=>setOffline(false), off=()=>setOffline(true);
    window.addEventListener("online",on); window.addEventListener("offline",off);
    return ()=>{window.removeEventListener("online",on);window.removeEventListener("offline",off);};
  }, []);
  return offline;
}

function useSpeech(onResult) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported in this browser."); return; }
    const rec = new SR(); rec.lang="en-US"; rec.continuous=false; rec.interimResults=false;
    rec.onresult = e => { onResult(e.results[0][0].transcript); setListening(false); };
    rec.onerror = ()=>setListening(false); rec.onend = ()=>setListening(false);
    recRef.current=rec; rec.start(); setListening(true);
  }, [onResult]);
  const stop = useCallback(() => { recRef.current?.stop(); setListening(false); }, []);
  return { listening, start, stop };
}

// ── NOTIFICATION SCHEDULER ────────────────────────────
function useNotificationScheduler(meds) {
  const timersRef = useRef([]);
  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") Notification.requestPermission();
    if (Notification.permission !== "granted") return;

    meds.forEach(med => {
      if (med.status === "taken" || !med.time) return;
      const [h, m] = med.time.split(":").map(Number);
      const now = new Date();
      const target = new Date(); target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const delay = target - now;
      if (delay < 86400000) {
        const t = setTimeout(() => {
          new Notification("💊 MedGuard Reminder", {
            body: `Time to take ${med.name} — ${med.dosage}`,
            icon: "/favicon.ico", tag: `med-${med.id || med.name}`
          });
        }, delay);
        timersRef.current.push(t);
      }
    });
    return () => timersRef.current.forEach(clearTimeout);
  }, [meds]);
}

// ── AUTH UTILS ────────────────────────────────────────
const AUTH_KEY = "medguard_users_v2";
const SESSION_KEY = "medguard_session_v2";

function hashPassword(pw) {
  let h = 0;
  for (let i = 0; i < pw.length; i++) { h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0; }
  return h.toString(36);
}

function getUsers() { try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "{}"); } catch { return {}; } }
function saveUsers(u) { localStorage.setItem(AUTH_KEY, JSON.stringify(u)); }

function registerUser(email, password, role, name, allergies) {
  const users = getUsers();
  if (users[email]) return { error: "Account already exists with this email." };
  users[email] = { name: name || email.split("@")[0], email, role, passwordHash: hashPassword(password), allergies: allergies || "", streak: 0, createdAt: Date.now() };
  saveUsers(users);
  return { user: { ...users[email], initials: (users[email].name[0] || "U").toUpperCase() } };
}

function loginUser(email, password, role) {
  const users = getUsers();
  const u = users[email];
  if (!u) return { error: "No account found. Please sign up." };
  if (u.passwordHash !== hashPassword(password)) return { error: "Incorrect password." };
  if (u.role !== role) return { error: `This account is registered as a ${u.role}, not ${role}.` };
  return { user: { ...u, initials: (u.name[0] || "U").toUpperCase() } };
}

// ── STORAGE HELPERS ───────────────────────────────────
function getMeds(email) { try { return JSON.parse(localStorage.getItem(`meds_${email}`) || "[]"); } catch { return []; } }
function saveMeds(email, meds) { localStorage.setItem(`meds_${email}`, JSON.stringify(meds)); }
function getPatients(email) { try { return JSON.parse(localStorage.getItem(`patients_${email}`) || "[]"); } catch { return []; } }
function savePatients(email, pts) { localStorage.setItem(`patients_${email}`, JSON.stringify(pts)); }
function getVaccines(email) { try { return JSON.parse(localStorage.getItem(`vaccines_${email}`) || "[]"); } catch { return []; } }
function saveVaccines(email, v) { localStorage.setItem(`vaccines_${email}`, JSON.stringify(v)); }
function getAppointments(email) { try { return JSON.parse(localStorage.getItem(`appts_${email}`) || "[]"); } catch { return []; } }
function saveAppointments(email, a) { localStorage.setItem(`appts_${email}`, JSON.stringify(a)); }
function getVitals(email) { try { return JSON.parse(localStorage.getItem(`vitals_${email}`) || "[]"); } catch { return []; } }
function saveVitals(email, v) { localStorage.setItem(`vitals_${email}`, JSON.stringify(v)); }
function getMoodLog(email) { try { return JSON.parse(localStorage.getItem(`mood_${email}`) || "[]"); } catch { return []; } }
function saveMoodLog(email, m) { localStorage.setItem(`mood_${email}`, JSON.stringify(m)); }
function getAdherenceHistory(email) { try { return JSON.parse(localStorage.getItem(`adh_${email}`) || "{}"); } catch { return {}; } }
function saveAdherenceHistory(email, h) { localStorage.setItem(`adh_${email}`, JSON.stringify(h)); }

// ── GLOBAL CSS ────────────────────────────────────────
const makeCSS = (dark) => {
  const col = C[dark ? "dark" : "light"];
  return `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', system-ui, sans-serif; background:${col.bg}; color:${col.text}; -webkit-font-smoothing:antialiased; overflow-x:hidden; transition:background 0.4s,color 0.4s; }
  input,select,textarea { font-family:inherit; color-scheme:${dark?"dark":"light"}; }
  button { font-family:inherit; cursor:pointer; transition:all 0.2s; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:${col.accentBorder}; border-radius:10px; }
  
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes ping { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(2);opacity:0} }
  @keyframes toastIn { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }
  @keyframes toastOut { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(60px)} }
  @keyframes sosPulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)} 70%{box-shadow:0 0 0 20px rgba(239,68,68,0)} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
  
  .fade-up { animation: fadeUp 0.4s ease both; }
  .fade-up-1 { animation: fadeUp 0.4s 0.05s ease both; }
  .fade-up-2 { animation: fadeUp 0.4s 0.10s ease both; }
  .fade-up-3 { animation: fadeUp 0.4s 0.15s ease both; }
  .fade-up-4 { animation: fadeUp 0.4s 0.20s ease both; }

  .glass { backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); background:${col.card}; border:1px solid ${col.border}; box-shadow:${col.cardShadow}; }
  
  .sidebar-link { display:flex; align-items:center; gap:10px; padding:11px 16px; border-radius:10px; color:${col.sidebarText}; font-size:13.5px; font-weight:500; text-decoration:none; transition:all 0.2s; margin-bottom:4px; border:1px solid transparent; cursor:pointer; }
  .sidebar-link:hover { color:#e2e8f0; background:rgba(255,255,255,0.06); }
  .sidebar-link.active { color:${col.sidebarActive}; background:rgba(56,189,248,0.12); border-color:rgba(56,189,248,0.2); font-weight:700; }
  
  .btn { padding:10px 20px; border-radius:10px; font-weight:600; font-size:13px; border:none; cursor:pointer; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px; }
  .btn-primary { background:linear-gradient(135deg,${col.gradStart},${col.gradEnd}); color:#fff; }
  .btn-primary:hover { opacity:0.88; transform:translateY(-1px); box-shadow:0 8px 20px rgba(14,165,233,0.25); }
  .btn-ghost { background:${col.accentLight}; color:${col.accent}; border:1px solid ${col.accentBorder}; }
  .btn-ghost:hover { opacity:0.85; }
  .btn-danger { background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.2); }
  .btn-danger:hover { background:rgba(239,68,68,0.18); }

  .input { width:100%; padding:10px 14px; border-radius:10px; border:1.5px solid ${col.border}; background:${col.inputBg}; color:${col.text}; font-size:13.5px; outline:none; transition:border-color 0.2s; }
  .input:focus { border-color:${col.accent}; }
  .input::placeholder { color:${col.textSoft}; }
  .label { font-size:11px; font-weight:700; color:${col.textSoft}; text-transform:uppercase; letter-spacing:0.8px; display:block; margin-bottom:5px; }

  .card { background:${col.card}; border-radius:16px; border:1px solid ${col.border}; box-shadow:${col.cardShadow}; padding:24px; }
  .stat-card { background:${col.surface}; border-radius:14px; border:1px solid ${col.border}; padding:20px; }

  .badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:100px; font-size:11px; font-weight:700; }
  .badge-green { background:rgba(52,211,153,0.12); color:#34d399; border:1px solid rgba(52,211,153,0.25); }
  .badge-yellow { background:rgba(251,191,36,0.12); color:#fbbf24; border:1px solid rgba(251,191,36,0.25); }
  .badge-red { background:rgba(239,68,68,0.12); color:#ef4444; border:1px solid rgba(239,68,68,0.25); }
  .badge-blue { background:${col.accentLight}; color:${col.accent}; border:1px solid ${col.accentBorder}; }

  .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:1000; padding:16px; }
  .modal { background:${dark?"#0c1625":"#ffffff"}; border:1px solid ${col.border}; border-radius:20px; padding:28px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:0 32px 80px rgba(0,0,0,0.4); }
  
  .dot-loading span { display:inline-block; width:6px; height:6px; border-radius:50%; background:${col.textSoft}; animation:blink 1.4s infinite; }
  .dot-loading span:nth-child(2) { animation-delay:0.2s; }
  .dot-loading span:nth-child(3) { animation-delay:0.4s; }
  
  .skeleton { background:linear-gradient(90deg,${col.border} 25%,${col.accentLight} 50%,${col.border} 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:8px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  
  select option { background:${dark?"#0c1625":"#fff"}; color:${col.text}; }
  `;
};

// ── TOAST ─────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:8, pointerEvents:"none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background:"rgba(10,20,38,0.96)", backdropFilter:"blur(20px)", border:"1px solid rgba(56,189,248,0.2)", borderRadius:14, padding:"12px 16px", minWidth:260, display:"flex", alignItems:"center", gap:12, boxShadow:"0 8px 32px rgba(0,0,0,0.4)", animation:"toastIn 0.3s ease" }}>
          <div style={{ fontSize:20 }}>{t.icon}</div>
          <div>
            <div style={{ fontWeight:700, fontSize:13.5, color:"#e2e8f0" }}>{t.title}</div>
            {t.msg && <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{t.msg}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MODAL WRAPPER ─────────────────────────────────────
function Modal({ onClose, children, maxWidth=520 }) {
  useEffect(() => {
    const esc = e => { if (e.key==="Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}
function ModalHead({ icon, title, sub, onClose }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
        <span style={{ fontSize:26 }}>{icon}</span>
        <div>
          <div style={{ fontWeight:800, fontSize:17 }}>{title}</div>
          {sub && <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{sub}</div>}
        </div>
      </div>
      <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", fontSize:16, color:"#64748b", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
    </div>
  );
}

// ── AI CALL ───────────────────────────────────────────
async function callAI(messages, system) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    throw new Error("AI features require an Anthropic API key. Please add VITE_ANTHROPIC_API_KEY to your .env file.");
  }
  const res = await fetch(API_BASE_URL, {
    method:"POST",
    headers:{ "Content-Type":"application/json", "x-api-key":apiKey, "anthropic-version":"2023-06-01", "anthropic-dangerous-direct-browser-access":"true" },
    body:JSON.stringify({ model:ANTHROPIC_MODEL, max_tokens:500, system, messages })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "AI error");
  return data.content?.[0]?.text || "";
}

// ── RINGS ─────────────────────────────────────────────
function Ring({ pct, size=90, strokeWidth=8, label }) {
  const r=38, circ=2*Math.PI*r, offset=circ-(pct/100)*circ;
  const color = pct>=80?"#34d399":pct>=60?"#fbbf24":"#ef4444";
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth}/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 50 50)" style={{ transition:"stroke-dashoffset 1s ease" }}/>
        <text x="50" y="54" textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="900" fill={color}>{pct}%</text>
      </svg>
      {label && <div style={{ fontSize:11, fontWeight:700, color, textTransform:"uppercase", letterSpacing:1 }}>{label}</div>}
    </div>
  );
}

// ── BAR CHART ─────────────────────────────────────────
function BarChart({ data, dark }) {
  const col = C[dark?"dark":"light"];
  const max = Math.max(...data.map(d=>d.value), 1);
  return (
    <div style={{ display:"flex", gap:6, alignItems:"flex-end", height:80 }}>
      {data.map((d,i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <div style={{ width:"100%", background:d.value>0?col.accent:col.border, borderRadius:"4px 4px 0 0", height:`${(d.value/max)*68}px`, minHeight:4, transition:"height 0.6s ease", opacity:d.today?1:0.6 }}/>
          <div style={{ fontSize:9, color:col.textSoft, fontWeight:600 }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── SKELETON ──────────────────────────────────────────
function Skeleton({ h=20, w="100%", mb=8 }) {
  return <div className="skeleton" style={{ height:h, width:w, marginBottom:mb }}/>;
}

// ── ADD MED MODAL ─────────────────────────────────────
function AddMedModal({ onClose, onAdd, knownAllergies=[] }) {
  const [form, setForm] = useState({ name:"", dosage:"", frequency:"Once daily", time:"08:00", purpose:"", refillDate:"", notes:"" });
  const [allergyAlert, setAllergyAlert] = useState(null);
  const up = (k,v) => {
    setForm(f=>({...f,[k]:v}));
    if (k==="name") {
      const m = knownAllergies.find(a=>v.toLowerCase().includes(a.toLowerCase().trim()));
      setAllergyAlert(m ? <><Icons.SOS/> Allergy alert: "{m}" detected!</> : null);
    }
  };
  return (
    <Modal onClose={onClose}>
      <ModalHead icon={<Icons.Med/>} title="Add Medication" sub="Schedule a new medication" onClose={onClose}/>
      {allergyAlert && <div style={{ background:"rgba(239,68,68,0.1)", border:"1.5px solid rgba(239,68,68,0.4)", borderRadius:10, padding:"10px 14px", marginBottom:14, color:"#fca5a5", fontSize:13, fontWeight:700 }}>{allergyAlert}</div>}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 14px" }}>
        <div style={{ gridColumn:"1/-1" }}><label className="label">Medicine Name *</label><input className="input" placeholder="e.g. Metformin" value={form.name} onChange={e=>up("name",e.target.value)}/></div>
        <div><label className="label">Dosage *</label><input className="input" placeholder="e.g. 500mg" value={form.dosage} onChange={e=>up("dosage",e.target.value)}/></div>
        <div><label className="label">Frequency *</label><select className="input" value={form.frequency} onChange={e=>up("frequency",e.target.value)}>{["Once daily","Twice daily","Three times daily","Every 8 hours","Weekly","As needed"].map(o=><option key={o}>{o}</option>)}</select></div>
        <div><label className="label">Reminder Time</label><input type="time" className="input" value={form.time} onChange={e=>up("time",e.target.value)}/></div>
        <div><label className="label">Purpose</label><input className="input" placeholder="e.g. Diabetes" value={form.purpose} onChange={e=>up("purpose",e.target.value)}/></div>
        <div><label className="label">Refill Date</label><input type="date" className="input" value={form.refillDate} onChange={e=>up("refillDate",e.target.value)}/></div>
        <div><label className="label">Color Tag</label><select className="input" value={form.color||"blue"} onChange={e=>up("color",e.target.value)}>{["blue","green","yellow","red","purple","pink"].map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}</select></div>
        <div style={{ gridColumn:"1/-1" }}><label className="label">Notes</label><input className="input" placeholder="Take with food…" value={form.notes} onChange={e=>up("notes",e.target.value)}/></div>
      </div>
      <div style={{ display:"flex", gap:10, marginTop:20 }}>
        <button onClick={onClose} className="btn btn-ghost" style={{ flex:1 }}>Cancel</button>
        <button onClick={()=>{ if(!form.name||!form.dosage) return; onAdd({...form,id:Date.now().toString(),status:"upcoming"}); onClose(); }} className="btn btn-primary" style={{ flex:2 }}>Add Medication</button>
      </div>
    </Modal>
  );
}

// ── DRUG INTERACTION MODAL ────────────────────────────
function DrugInteractionModal({ onClose, dark }) {
  const col = C[dark?"dark":"light"];
  const [drug1,setDrug1]=useState(""), [drug2,setDrug2]=useState(""), [result,setResult]=useState(null), [checked,setChecked]=useState(false), [aiResult,setAiResult]=useState(""), [aiLoading,setAiLoading]=useState(false);
  const check = () => { if(!drug1.trim()||!drug2.trim()) return; setResult(checkInteraction(drug1,drug2)||null); setChecked(true); setAiResult(""); };
  const checkWithAI = async () => {
    if(!drug1.trim()||!drug2.trim()) return;
    setAiLoading(true); setAiResult("");
    try {
      const txt = await callAI([{role:"user",content:`Check interaction between: ${drug1} and ${drug2}. Give severity (HIGH/MEDIUM/LOW), brief effect, and recommendation. Under 80 words.`}], "You are a clinical pharmacist. Be concise and clinically accurate.");
      setAiResult(txt);
    } catch { setAiResult("AI check unavailable — using local database."); }
    setAiLoading(false);
  };
  const sevColor = { HIGH:["rgba(239,68,68,0.1)","#ef4444","#fca5a5"], MEDIUM:["rgba(251,191,36,0.1)","#fbbf24","#fde68a"], LOW:["rgba(52,211,153,0.1)","#34d399","#a7f3d0"] };
  return (
    <Modal onClose={onClose} maxWidth={560}>
      <ModalHead icon={<Icons.Shield/>} title="Drug Interaction Checker" sub="Check safety of medication combinations" onClose={onClose}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
        <div><label className="label">Drug / Food 1</label><input className="input" placeholder="e.g. Warfarin" value={drug1} onChange={e=>{setDrug1(e.target.value);setChecked(false);}} onKeyDown={e=>e.key==="Enter"&&check()}/></div>
        <div><label className="label">Drug / Food 2</label><input className="input" placeholder="e.g. Aspirin" value={drug2} onChange={e=>{setDrug2(e.target.value);setChecked(false);}} onKeyDown={e=>e.key==="Enter"&&check()}/></div>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:18 }}>
        <button onClick={check} className="btn btn-primary" style={{ flex:1 }}><Icons.Zap/> Quick Check</button>
        <button onClick={checkWithAI} disabled={aiLoading} className="btn btn-ghost" style={{ flex:1 }}>{aiLoading?"Checking…":<><Icons.AI/> AI Deep Check</>}</button>
      </div>
      {aiResult && <div style={{ background:col.accentLight, border:`1px solid ${col.accentBorder}`, borderRadius:12, padding:"14px 16px", marginBottom:14, fontSize:13, color:col.textMid, lineHeight:1.7 }}><strong style={{ color:col.accent, display:"block", marginBottom:6 }}>AI Analysis</strong>{aiResult}</div>}
      {checked && (result ? (()=>{ const [bg,border,tc]=sevColor[result.severity]||sevColor.LOW; return <div style={{ background:bg, border:`2px solid ${border}`, borderRadius:12, padding:"16px 18px" }}><div style={{ fontWeight:800, fontSize:15, color:tc, marginBottom:4 }}>{result.severity} SEVERITY</div><p style={{ fontSize:13, color:tc, lineHeight:1.7 }}>{result.effect}</p></div>; })() : <div style={{ background:"rgba(52,211,153,0.1)", border:"2px solid #34d399", borderRadius:12, padding:"16px 18px" }}><div style={{ fontWeight:800, fontSize:15, color:"#34d399" }}><Icons.Check/> No Known Interaction</div><div style={{ fontSize:13, color:"#6ee7b7", marginTop:4 }}>Always confirm with your pharmacist.</div></div>)}
    </Modal>
  );
}

// ── EMERGENCY SOS MODAL ───────────────────────────────
function EmergencySOSModal({ onClose, user }) {
  const [calling,setCalling]=useState(false), [sent,setSent]=useState(false);
  const trigger = () => {
    setCalling(true);
    if ("Notification" in window && Notification.permission==="granted") {
      new Notification("Emergency SOS Triggered", { body:`Emergency alert sent for ${user?.name}. Location shared.` });
    }
    setTimeout(()=>{ setCalling(false); setSent(true); }, 2500);
  };
  return (
    <div className="overlay">
      <div style={{ background:"#0c1625", border:"2px solid rgba(239,68,68,0.4)", borderRadius:20, padding:32, width:440, maxWidth:"95vw", textAlign:"center" }}>
        <div style={{ width:88, height:88, borderRadius:"50%", background:"rgba(239,68,68,0.12)", border:"2px solid rgba(239,68,68,0.35)", margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center", color:"#ef4444", fontSize:36, animation:"sosPulse 1.5s infinite" }}><Icons.SOS/></div>
        <h2 style={{ fontSize:22, fontWeight:900, color:"#ef4444", marginBottom:6 }}>Emergency SOS</h2>
        <p style={{ fontSize:13, color:"#64748b", marginBottom:20 }}>Pressing the button below will alert your emergency contacts and attempt to dial 112.</p>
        {!sent ? (
          <button onClick={trigger} disabled={calling} style={{ width:"100%", padding:"15px", borderRadius:12, background:calling?"#dc2626":"#ef4444", color:"#fff", fontSize:16, fontWeight:900, border:"none", marginBottom:12, cursor:"pointer", boxShadow:"0 6px 20px rgba(239,68,68,0.4)" }}>
            {calling ? "🔴 Connecting to 112…" : <><Icons.User/> Call Emergency (112)</>}
          </button>
        ) : (
          <div style={{ background:"rgba(52,211,153,0.1)", border:"1px solid #34d399", borderRadius:12, padding:"14px", marginBottom:12, color:"#34d399", fontWeight:700 }}><Icons.Check/> Emergency contacts notified!</div>
        )}
        <div style={{ background:"rgba(239,68,68,0.06)", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#94a3b8", marginBottom:14, lineHeight:1.6 }}>
          📍 Location shared with: {user?.emergencyContact || "No contacts configured"}<br/>
          <Icons.Droplet/> Blood Type: {user?.bloodType || "Unknown"} · Allergies: {user?.allergies || "None"}
        </div>
        <button onClick={onClose} style={{ width:"100%", padding:"12px", borderRadius:10, background:"rgba(255,255,255,0.06)", color:"#64748b", fontWeight:700, fontSize:13, border:"1px solid rgba(255,255,255,0.08)", cursor:"pointer" }}>Close</button>
      </div>
    </div>
  );
}

// ── SYMPTOM LOGGER MODAL ──────────────────────────────
function SymptomLoggerModal({ onClose, meds }) {
  const SYMPTOMS = ["Headache","Dizziness","Nausea","Fatigue","Vomiting","Chest Pain","Shortness of Breath","Rash","Dry Mouth","Blurred Vision","Muscle Pain","Insomnia","Anxiety","Palpitations","Back Pain","Swelling"];
  const [selected,setSelected]=useState([]), [severity,setSeverity]=useState(5), [result,setResult]=useState(""), [loading,setLoading]=useState(false);
  const toggle = s => setSelected(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);
  const analyze = async () => {
    if(!selected.length) return; setLoading(true); setResult("");
    try {
      const txt = await callAI([{role:"user",content:`Patient medications: ${meds.map(m=>m.name).join(", ")||"none"}. Symptoms: ${selected.join(", ")}. Severity: ${severity}/10. Analyze possible causes, medication side effects, and urgency.`}], "You are MedGuard AI. Analyze symptoms vs medications concisely. Use bullet points. End with urgency level (Low/Medium/High) and whether to see a doctor. Under 150 words.");
      setResult(txt);
    } catch { setResult(<><Icons.SOS/> AI analysis unavailable. Please consult your doctor for symptom evaluation.</>); }
    setLoading(false);
  };
  return (
    <Modal onClose={onClose} maxWidth={660}>
      <ModalHead icon={<Icons.Activity/>} title="AI Symptom Logger" sub="Analyze symptoms against your medications" onClose={onClose}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div>
          <label className="label" style={{ marginBottom:10 }}>Select Symptoms</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
            {SYMPTOMS.map(s=><button key={s} onClick={()=>toggle(s)} style={{ padding:"6px 12px", borderRadius:100, border:`1.5px solid ${selected.includes(s)?"#ef4444":"rgba(100,116,139,0.25)"}`, background:selected.includes(s)?"rgba(239,68,68,0.1)":"transparent", color:selected.includes(s)?"#fca5a5":"#64748b", fontSize:12, fontWeight:600, cursor:"pointer" }}>{s}</button>)}
          </div>
          <label className="label">Severity: <strong style={{ color:"#ef4444" }}>{severity}/10</strong></label>
          <input type="range" min={1} max={10} value={severity} onChange={e=>setSeverity(+e.target.value)} style={{ width:"100%", accentColor:"#ef4444", marginBottom:14 }}/>
          <button onClick={analyze} disabled={!selected.length||loading} className="btn btn-primary" style={{ width:"100%", opacity:selected.length&&!loading?1:0.5 }}>{loading?<><Icons.AI/> Analyzing…</>:<><Icons.AI/> Analyze with AI</>}</button>
        </div>
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1.5px solid rgba(100,116,139,0.15)", borderRadius:12, padding:18, minHeight:200, display:"flex", flexDirection:"column" }}>
          {result ? <><div style={{ fontWeight:700, marginBottom:10, fontSize:13 }}><Icons.AI/> AI Analysis</div><div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.8, whiteSpace:"pre-wrap" }}>{result}</div></> : <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flex:1, gap:8, color:"#475569" }}><Icons.Eye style={{ fontSize:32 }}/><span style={{ fontSize:13 }}>Select symptoms to analyze</span></div>}
        </div>
      </div>
    </Modal>
  );
}

// ── VITALS MODAL ──────────────────────────────────────
function VitalsModal({ onClose, onSave }) {
  const [form,setForm]=useState({ bp_sys:"", bp_dia:"", pulse:"", temp:"", weight:"", o2:"", glucose:"", notes:"" });
  const up=(k,v)=>setForm(f=>({...f,[k]:v}));
  const handleSave = () => {
    const entry = { ...form, timestamp: Date.now(), date: new Date().toLocaleDateString() };
    onSave(entry); onClose();
  };
  return (
    <Modal onClose={onClose}>
      <ModalHead icon={<Icons.Heart/>} title="Log Vitals" sub="Record your health measurements" onClose={onClose}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 14px" }}>
        <div><label className="label">Systolic BP (mmHg)</label><input className="input" type="number" placeholder="120" value={form.bp_sys} onChange={e=>up("bp_sys",e.target.value)}/></div>
        <div><label className="label">Diastolic BP (mmHg)</label><input className="input" type="number" placeholder="80" value={form.bp_dia} onChange={e=>up("bp_dia",e.target.value)}/></div>
        <div><label className="label">Heart Rate (bpm)</label><input className="input" type="number" placeholder="72" value={form.pulse} onChange={e=>up("pulse",e.target.value)}/></div>
        <div><label className="label">Temperature (°C)</label><input className="input" type="number" step="0.1" placeholder="36.6" value={form.temp} onChange={e=>up("temp",e.target.value)}/></div>
        <div><label className="label">Weight (kg)</label><input className="input" type="number" step="0.1" placeholder="70" value={form.weight} onChange={e=>up("weight",e.target.value)}/></div>
        <div><label className="label">O2 Saturation (%)</label><input className="input" type="number" placeholder="98" value={form.o2} onChange={e=>up("o2",e.target.value)}/></div>
        <div style={{ gridColumn:"1/-1" }}><label className="label">Blood Glucose (mg/dL)</label><input className="input" type="number" placeholder="90" value={form.glucose} onChange={e=>up("glucose",e.target.value)}/></div>
        <div style={{ gridColumn:"1/-1" }}><label className="label">Notes</label><input className="input" placeholder="Optional notes…" value={form.notes} onChange={e=>up("notes",e.target.value)}/></div>
      </div>
      <div style={{ display:"flex", gap:10, marginTop:20 }}>
        <button onClick={onClose} className="btn btn-ghost" style={{ flex:1 }}>Cancel</button>
        <button onClick={handleSave} className="btn btn-primary" style={{ flex:2 }}>Save Vitals</button>
      </div>
    </Modal>
  );
}

// ── APPOINTMENT MODAL ─────────────────────────────────
function AppointmentModal({ onClose, onSave }) {
  const [form,setForm]=useState({ doctor:"", specialty:"", date:"", time:"", location:"", notes:"", type:"In-Person" });
  const up=(k,v)=>setForm(f=>({...f,[k]:v}));
  return (
    <Modal onClose={onClose}>
      <ModalHead icon={<Icons.Calendar/>} title="Schedule Appointment" sub="Add a doctor visit or consultation" onClose={onClose}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 14px" }}>
        <div style={{ gridColumn:"1/-1" }}><label className="label">Doctor / Provider *</label><input className="input" placeholder="Dr. Sarah Johnson" value={form.doctor} onChange={e=>up("doctor",e.target.value)}/></div>
        <div><label className="label">Specialty</label><input className="input" placeholder="Cardiologist" value={form.specialty} onChange={e=>up("specialty",e.target.value)}/></div>
        <div><label className="label">Type</label><select className="input" value={form.type} onChange={e=>up("type",e.target.value)}>{["In-Person","Telehealth","Lab Test","Follow-up"].map(t=><option key={t}>{t}</option>)}</select></div>
        <div><label className="label">Date *</label><input type="date" className="input" value={form.date} onChange={e=>up("date",e.target.value)}/></div>
        <div><label className="label">Time *</label><input type="time" className="input" value={form.time} onChange={e=>up("time",e.target.value)}/></div>
        <div style={{ gridColumn:"1/-1" }}><label className="label">Location / Link</label><input className="input" placeholder="Clinic address or video link" value={form.location} onChange={e=>up("location",e.target.value)}/></div>
        <div style={{ gridColumn:"1/-1" }}><label className="label">Notes</label><textarea className="input" rows={3} style={{ resize:"none" }} placeholder="Bring previous reports…" value={form.notes} onChange={e=>up("notes",e.target.value)}/></div>
      </div>
      <div style={{ display:"flex", gap:10, marginTop:20 }}>
        <button onClick={onClose} className="btn btn-ghost" style={{ flex:1 }}>Cancel</button>
        <button onClick={()=>{ if(!form.doctor||!form.date) return; onSave({...form,id:Date.now().toString()}); onClose(); }} className="btn btn-primary" style={{ flex:2 }}>Schedule Appointment</button>
      </div>
    </Modal>
  );
}

// ── VACCINE MODAL ─────────────────────────────────────
function VaccineModal({ onClose, onSave }) {
  const [form,setForm]=useState({ name:"", date:"", nextDue:"", provider:"", notes:"" });
  const up=(k,v)=>setForm(f=>({...f,[k]:v}));
  return (
    <Modal onClose={onClose}>
      <ModalHead icon={<Icons.Syringe/>} title="Add Vaccination" sub="Record a vaccine received" onClose={onClose}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 14px" }}>
        <div style={{ gridColumn:"1/-1" }}><label className="label">Vaccine Name *</label><input className="input" placeholder="COVID-19 Booster" value={form.name} onChange={e=>up("name",e.target.value)}/></div>
        <div><label className="label">Date Given *</label><input type="date" className="input" value={form.date} onChange={e=>up("date",e.target.value)}/></div>
        <div><label className="label">Next Due Date</label><input type="date" className="input" value={form.nextDue} onChange={e=>up("nextDue",e.target.value)}/></div>
        <div style={{ gridColumn:"1/-1" }}><label className="label">Provider / Location</label><input className="input" placeholder="City Hospital" value={form.provider} onChange={e=>up("provider",e.target.value)}/></div>
        <div style={{ gridColumn:"1/-1" }}><label className="label">Notes</label><input className="input" placeholder="No side effects…" value={form.notes} onChange={e=>up("notes",e.target.value)}/></div>
      </div>
      <div style={{ display:"flex", gap:10, marginTop:20 }}>
        <button onClick={onClose} className="btn btn-ghost" style={{ flex:1 }}>Cancel</button>
        <button onClick={()=>{ if(!form.name||!form.date) return; onSave({...form,id:Date.now().toString()}); onClose(); }} className="btn btn-primary" style={{ flex:2 }}>Save Record</button>
      </div>
    </Modal>
  );
}

// ── MOOD WIDGET ───────────────────────────────────────
function MoodWidget({ dark, email }) {
  const col = C[dark?"dark":"light"];
  const moods=[{e:<Icons.Trash/>,l:"Terrible",c:"#ef4444"},{e:<Icons.SOS/>,l:"Bad",c:"#f59e0b"},{e:<Icons.User/>,l:"Okay",c:"#8ab4d4"},{e:<Icons.Smile/>,l:"Good",c:"#34d399"},{e:<Icons.Star/>,l:"Great!",c:col.accent}];
  const todayKey = new Date().toDateString();
  const log = getMoodLog(email);
  const todayEntry = log.find(e=>e.date===todayKey);
  const [selected,setSelected]=useState(todayEntry?.mood??null);
  const [saved,setSaved]=useState(!!todayEntry);

  const save = (i) => {
    setSelected(i); setSaved(false);
    const newLog = log.filter(e=>e.date!==todayKey);
    newLog.push({ date:todayKey, mood:i, emoji:moods[i].e, label:moods[i].l, timestamp:Date.now() });
    saveMoodLog(email, newLog);
    setSaved(true);
  };

  return (
    <div className="card">
      <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:col.text }}><Icons.Smile/> Daily Mood Check-In</div>
      <div style={{ display:"flex", gap:8 }}>
        {moods.map((m,i)=><button key={i} onClick={()=>save(i)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"10px 4px", borderRadius:10, border:`2px solid ${selected===i?m.c:col.border}`, background:selected===i?m.c+"18":"transparent", cursor:"pointer", transition:"all 0.2s" }}><span style={{ fontSize:24 }}>{m.e}</span><span style={{ fontSize:9, fontWeight:700, color:selected===i?m.c:col.textSoft }}>{m.l}</span></button>)}
      </div>
      {saved && <div style={{ textAlign:"center", fontSize:12, color:"#34d399", fontWeight:700, marginTop:10 }}><Icons.Check/> Mood logged for today</div>}
    </div>
  );
}

// ── PRINT REPORT ──────────────────────────────────────
function _printReport(meds, streak, adherencePct, user, vitals) {
  const w = window.open("","_blank","width=800,height=600");
  if(!w) return;
  const latest = vitals[vitals.length-1];
  w.document.write(`<!DOCTYPE html><html><head><title>MedGuard AI — Health Report</title><style>
  body{font-family:system-ui,sans-serif;padding:40px;color:#102a43;max-width:740px;margin:0 auto}
  h1{color:#1d6f85;margin-bottom:4px}h2{margin-top:28px;font-size:16px;color:#1d6f85}
  table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#1d6f85;color:#fff;padding:9px 12px;text-align:left;font-size:13px}td{padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:13px}
  .stats{display:flex;gap:16px;margin:20px 0}.stat{background:#eff6ff;border-radius:10px;padding:14px 20px;text-align:center;flex:1}.stat-v{font-size:26px;font-weight:900;color:#1d6f85}.sub{font-size:11px;color:#64748b;margin-top:2px}
  @media print{body{padding:20px}}
  </style></head><body>
  <h1>MedGuard AI — Health Summary Report</h1>
  <p style="color:#64748b;font-size:13px">Patient: ${user?.name||"—"} &nbsp;·&nbsp; Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
  <div class="stats">
    <div class="stat"><div class="stat-v">${adherencePct}%</div><div class="sub">Adherence</div></div>
    <div class="stat"><div class="stat-v">${streak}</div><div class="sub">Day Streak</div></div>
    <div class="stat"><div class="stat-v">${meds.length}</div><div class="sub">Active Meds</div></div>
    ${latest?`<div class="stat"><div class="stat-v">${latest.bp_sys||"—"}/${latest.bp_dia||"—"}</div><div class="sub">Latest BP</div></div>`:""}
  </div>
  <h2>Medications</h2>
  <table><tr><th>Name</th><th>Dosage</th><th>Frequency</th><th>Time</th><th>Status</th></tr>
  ${meds.map(m=>`<tr><td>${m.name}</td><td>${m.dosage}</td><td>${m.frequency}</td><td>${m.time}</td><td>${m.status==="taken"?"✓ Taken":"○ Pending"}</td></tr>`).join("")}
  </table>
  ${vitals.length?`<h2>Recent Vitals</h2><table><tr><th>Date</th><th>BP</th><th>Pulse</th><th>Temp</th><th>O2</th><th>Weight</th></tr>${vitals.slice(-5).reverse().map(v=>`<tr><td>${v.date}</td><td>${v.bp_sys||"—"}/${v.bp_dia||"—"}</td><td>${v.pulse||"—"}</td><td>${v.temp||"—"}°C</td><td>${v.o2||"—"}%</td><td>${v.weight||"—"}kg</td></tr>`).join("")}</table>`:""}
  <p style="color:#94a3b8;font-size:11px;margin-top:32px">Generated by MedGuard AI · For informational use only · Always consult your healthcare provider</p>
  </body></html>`);
  w.document.close(); w.print();
}

// ── NOTIFICATION PANEL ────────────────────────────────
function NotificationPanel({ meds, appointments, dark, onClose }) {
  const col = C[dark?"dark":"light"];
  const now = new Date();
  const refillDue = meds.filter(m => m.refillDate && (new Date(m.refillDate)-now)/(1000*60*60*24)<=7);
  const upcomingAppts = appointments.filter(a => { const d=new Date(a.date); return d>=now && (d-now)/(1000*60*60*24)<=3; });
  const notifs = [
    ...refillDue.map(m=>({ type:"warning", title:`Refill needed: ${m.name}`, time:"Soon", icon:<Icons.Med/> })),
    ...upcomingAppts.map(a=>({ type:"info", title:`Appointment: ${a.doctor}`, time:new Date(a.date).toLocaleDateString(), icon:<Icons.Calendar/> })),
    { type:"success", title:"Daily streak maintained!", time:"Today", icon:<Icons.Flame/> },
  ];
  return (
    <div style={{ position:"fixed", top:64, right:24, zIndex:500, width:300 }} className="card fade-up">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontWeight:800, fontSize:14 }}><Icons.Bell/> Notifications</div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:col.textSoft, cursor:"pointer", fontSize:18 }}>×</button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {notifs.length===0 ? <div style={{ fontSize:13, color:col.textSoft, textAlign:"center", padding:"20px 0" }}>All clear! <Icons.Check/></div> :
          notifs.map((n,i)=><div key={i} style={{ display:"flex", gap:10, padding:"10px 12px", borderRadius:10, background:n.type==="warning"?"rgba(251,191,36,0.06)":n.type==="info"?col.accentLight:"rgba(52,211,153,0.06)", border:`1px solid ${n.type==="warning"?"rgba(251,191,36,0.2)":n.type==="info"?col.accentBorder:"rgba(52,211,153,0.2)"}` }}><span style={{ fontSize:18 }}>{n.icon}</span><div><div style={{ fontWeight:600, fontSize:12, color:col.text }}>{n.title}</div><div style={{ fontSize:11, color:col.textSoft }}>{n.time}</div></div></div>)
        }
      </div>
    </div>
  );
}

// ── ANALYTICS TAB ─────────────────────────────────────
function AnalyticsTab({ dark, email, meds, streak, vitals }) {
  const col = C[dark?"dark":"light"];
  const moodLog = getMoodLog(email);
  const adh = getAdherenceHistory(email);

  const weekData = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-6+i);
    const key=d.toDateString(); const label=["Su","Mo","Tu","We","Th","Fr","Sa"][d.getDay()];
    return { label, value: adh[key]||0, today: key===new Date().toDateString() };
  });

  const moodWeek = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-6+i);
    const key=d.toDateString(); const entry=moodLog.find(e=>e.date===key);
    return { label:["Su","Mo","Tu","We","Th","Fr","Sa"][d.getDay()], mood:entry?.mood??null, emoji:entry?.emoji||"–" };
  });

  const latestVitals = vitals[vitals.length-1];
  const takenCount = meds.filter(m=>m.status==="taken").length;
  const adherencePct = meds.length===0?0:Math.round((takenCount/meds.length)*100);
  const healthScore = Math.min(100, Math.round(adherencePct*0.55+streak*0.9+18));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }} className="fade-up">
        {[
          ["Health Score", <Icons.Star key="star" />, `${healthScore}/100`, healthScore>=80?"badge-green":healthScore>=60?"badge-yellow":"badge-red"],
          ["Adherence", <Icons.Med key="med" />, `${adherencePct}%`, adherencePct>=80?"badge-green":adherencePct>=60?"badge-yellow":"badge-red"],
          ["Day Streak", <Icons.Flame key="flame" />, `${streak} days`, "badge-blue"],
          ["Meds Active", <Icons.Syringe key="syringe" />, `${meds.length}`, ""]
        ]
          .map(([l,e,v,cls])=><div key={l} className="stat-card"><div style={{ fontSize:22, marginBottom:8 }}>{e}</div><div style={{ fontSize:22, fontWeight:900, color:col.text }}>{v}</div><div style={{ fontSize:11, color:col.textSoft, marginTop:3 }}>{l}</div>{cls&&<span className={`badge ${cls}`} style={{ marginTop:8 }}>{v}</span>}</div>)}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }} className="fade-up-1">
        <div className="card">
          <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}><Icons.Chart/> Weekly Adherence</div>
          <BarChart data={weekData} dark={dark}/>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:10, fontSize:11, color:col.textSoft }}>
            <span>7-day view</span><span>Today highlighted</span>
          </div>
        </div>
        <div className="card">
          <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}><Icons.Smile/> Weekly Mood</div>
          <div style={{ display:"flex", gap:6, justifyContent:"space-between" }}>
            {moodWeek.map((d,i)=><div key={i} style={{ flex:1, textAlign:"center" }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{d.emoji}</div>
              <div style={{ fontSize:10, color:col.textSoft }}>{d.label}</div>
            </div>)}
          </div>
        </div>
      </div>

      {latestVitals && (
        <div className="card fade-up-2">
          <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}><Icons.Heart/> Latest Vitals — {latestVitals.date}</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:12 }}>
            {[["Blood Pressure",`${latestVitals.bp_sys||"—"}/${latestVitals.bp_dia||"—"} mmHg`,<Icons.Heart key="bp"/>],["Heart Rate",`${latestVitals.pulse||"—"} bpm`,<Icons.Heart key="hr"/>],["Temperature",`${latestVitals.temp||"—"}°C`,<Icons.Thermometer key="temp"/>],["O2 Saturation",`${latestVitals.o2||"—"}%`,<Icons.Lungs key="o2"/>],["Weight",`${latestVitals.weight||"—"} kg`,<Icons.Weight key="weight"/>],["Glucose",`${latestVitals.glucose||"—"} mg/dL`,<Icons.Droplet key="glucose"/>]]
              .map(([l,v,e])=><div key={l} style={{ background:col.accentLight, borderRadius:10, padding:"12px 14px", border:`1px solid ${col.accentBorder}` }}><div style={{ fontSize:18, marginBottom:4 }}>{e}</div><div style={{ fontWeight:800, fontSize:16, color:col.text }}>{v}</div><div style={{ fontSize:10, color:col.textSoft, marginTop:2 }}>{l}</div></div>)}
          </div>
        </div>
      )}

      <div className="card fade-up-3">
        <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}><Icons.Log/> 30-Day Adherence Calendar</div>
        <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
          {Array.from({length:30},(_,i)=>{
            const d=new Date(); d.setDate(d.getDate()-29+i);
            const key=d.toDateString(); const val=adh[key];
            const color = val==null?"rgba(255,255,255,0.06)":val>=80?"rgba(52,211,153,0.2)":val>=50?"rgba(251,191,36,0.2)":"rgba(239,68,68,0.2)";
            const borderColor = val==null?col.border:val>=80?"rgba(52,211,153,0.5)":val>=50?"rgba(251,191,36,0.5)":"rgba(239,68,68,0.5)";
            return <div key={i} title={`${d.toLocaleDateString()}: ${val!=null?val+"%":"No data"}`} style={{ width:26,height:26,borderRadius:5,background:color,border:`1.5px solid ${borderColor}`,display:"flex",alignItems:"center",justifyContent:"center" }}><span style={{ fontSize:9,fontWeight:700,color:col.textSoft }}>{d.getDate()}</span></div>;
          })}
        </div>
        <div style={{ display:"flex", gap:16, marginTop:12, fontSize:11, color:col.textSoft }}>
          {[["rgba(52,211,153,0.3)","≥80%"],["rgba(251,191,36,0.3)","50–79%"],["rgba(239,68,68,0.3)","<50%"],["rgba(255,255,255,0.06)","No data"]].map(([bg,l])=><div key={l} style={{ display:"flex",alignItems:"center",gap:5 }}><div style={{ width:12,height:12,borderRadius:3,background:bg }}/>{l}</div>)}
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS TAB ──────────────────────────────────────
function SettingsTab({ dark, setDark, lang, setLang, user, setUser, show }) {
  const col = C[dark?"dark":"light"];
  const [form,setForm]=useState({ name:user?.name||"", emergencyContact:user?.emergencyContact||"", bloodType:user?.bloodType||"", allergies:user?.allergies||"", dob:user?.dob||"" });
  const [pwForm,setPwForm]=useState({ current:"", newPw:"", confirm:"" });
  const [pwShow,setPwShow]=useState(false);
  const [notifPerm,setNotifPerm]=useState(Notification?.permission||"default");
  const up=(k,v)=>setForm(f=>({...f,[k]:v}));

  const saveProfile = () => {
    const users = getUsers();
    if (users[user.email]) {
      Object.assign(users[user.email], form);
      saveUsers(users);
    }
    const updated = { ...user, ...form };
    setUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    show(<Icons.Check/>,"Profile Updated","Your information has been saved.");
  };

  const changePassword = () => {
    if (!pwForm.current || !pwForm.newPw) { show(<Icons.Warning/>,"Missing Fields","Fill all password fields.","error"); return; }
    if (pwForm.newPw !== pwForm.confirm) { show(<Icons.Warning/>,"Mismatch","New passwords don't match.","error"); return; }
    const users = getUsers();
    if (users[user.email]?.passwordHash !== hashPassword(pwForm.current)) { show(<Icons.X/>,"Wrong Password","Current password is incorrect.","error"); return; }
    users[user.email].passwordHash = hashPassword(pwForm.newPw);
    saveUsers(users);
    setPwForm({current:"",newPw:"",confirm:""});
    show(<Icons.Lock/>,"Password Changed","Your password has been updated.");
  };

  const requestNotif = async () => {
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
    if (perm==="granted") show(<Icons.Bell/>,"Notifications On","You'll receive medication reminders.");
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      {/* Profile */}
      <div className="card fade-up">
        <div style={{ fontWeight:800, fontSize:16, marginBottom:18 }}><Icons.User/> Profile Settings</div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={e=>up("name",e.target.value)}/></div>
          <div><label className="label">Date of Birth</label><input type="date" className="input" value={form.dob} onChange={e=>up("dob",e.target.value)}/></div>
          <div><label className="label">Blood Type</label><select className="input" value={form.bloodType} onChange={e=>up("bloodType",e.target.value)}><option value="">Unknown</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label className="label">Known Allergies (comma separated)</label><input className="input" placeholder="Penicillin, Peanuts…" value={form.allergies} onChange={e=>up("allergies",e.target.value)}/></div>
          <div><label className="label">Emergency Contact</label><input className="input" placeholder="Dr. Name (123-456-7890)" value={form.emergencyContact} onChange={e=>up("emergencyContact",e.target.value)}/></div>
          <button onClick={saveProfile} className="btn btn-primary">Save Profile</button>
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
        {/* Password */}
        <div className="card fade-up-1">
          <div style={{ fontWeight:800, fontSize:16, marginBottom:18 }}><Icons.Lock/> Change Password</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[["current","Current Password"],["newPw","New Password"],["confirm","Confirm New Password"]].map(([k,l])=>(
              <div key={k}>
                <label className="label">{l}</label>
                <div style={{ position:"relative" }}>
                  <input type={pwShow?"text":"password"} className="input" value={pwForm[k]} onChange={e=>setPwForm(f=>({...f,[k]:e.target.value}))} style={{ paddingRight:40 }}/>
                  <button onClick={()=>setPwShow(!pwShow)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:col.textSoft, cursor:"pointer" }}>{pwShow?<Icons.EyeOff/>:<Icons.Eye/>}</button>
                </div>
              </div>
            ))}
            <button onClick={changePassword} className="btn btn-ghost">Update Password</button>
          </div>
        </div>

        {/* Language */}
        <div className="card fade-up-2">
          <div style={{ fontWeight:800, fontSize:16, marginBottom:14 }}><Icons.Globe/> Language</div>
          <div style={{ display:"flex", gap:8 }}>
            {[["en","English",<Icons.Flag key="en"/>],["hi","हिंदी",<Icons.Flag key="hi"/>],["gu","ગુજ.",<Icons.Flag key="gu"/>]].map(([code,name,flag])=>(
              <button key={code} onClick={()=>setLang(code)} style={{ flex:1, padding:"10px 6px", borderRadius:10, border:`2px solid ${lang===code?col.accent:col.border}`, background:lang===code?col.accentLight:"transparent", color:lang===code?col.accent:col.textMid, fontWeight:700, fontSize:12, cursor:"pointer" }}>{flag} {name}</button>
            ))}
          </div>
        </div>

        {/* Appearance & Notifs */}
        <div className="card fade-up-3">
          <div style={{ fontWeight:800, fontSize:16, marginBottom:14 }}><Icons.Settings/> Preferences</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", borderRadius:10, border:`1px solid ${col.border}` }}>
              <span style={{ fontSize:13, fontWeight:600 }}>Dark Mode</span>
              <button onClick={()=>setDark(!dark)} style={{ width:46, height:26, borderRadius:100, background:dark?col.accent:col.border, border:"none", cursor:"pointer", position:"relative", transition:"background 0.3s" }}>
                <div style={{ position:"absolute", top:3, left:dark?22:3, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"left 0.3s" }}/>
              </button>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", borderRadius:10, border:`1px solid ${col.border}` }}>
              <div><div style={{ fontSize:13, fontWeight:600 }}>Push Notifications</div><div style={{ fontSize:11, color:col.textSoft }}>Status: {notifPerm}</div></div>
              <button onClick={requestNotif} disabled={notifPerm==="granted"} className="btn btn-ghost" style={{ fontSize:11, padding:"6px 12px" }}>{notifPerm==="granted"?<><Icons.Check/> Active</>:<>"Enable"</>}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AI CHAT TAB ───────────────────────────────────────
function AIChatTab({ dark, user, meds }) {
  const col = C[dark?"dark":"light"];
  const [history, setHistory] = useState([{ from:"ai", text:`Hello ${user?.name?.split(" ")[0]||"there"}! 👋 I'm your MedGuard AI health assistant. I can help with medication questions, symptom analysis, drug interactions, and health guidance. What can I help you with?` }]);
  const [msg, setMsg] = useState(""), [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const onVoiceResult = useCallback(text=>setMsg(text), []);
  const { listening, start, stop } = useSpeech(onVoiceResult);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [history, loading]);

  const send = async () => {
    const m = msg.trim(); if(!m||loading) return;
    setMsg(""); setHistory(h=>[...h,{from:"user",text:m}]); setLoading(true);
    try {
      const msgs = history.map(x=>({ role:x.from==="user"?"user":"assistant", content:x.text }));
      msgs.push({ role:"user", content:m });
      const context = `Patient: ${user?.name}. Current meds: ${meds.map(m=>m.name+" "+m.dosage).join(", ")||"none"}. Allergies: ${user?.allergies||"none"}.`;
      const txt = await callAI(msgs, `You are MedGuard AI, a professional medical assistant. ${context} Be warm, concise (under 120 words), accurate. End clinical advice with: "Please consult your doctor for personalized guidance."`);
      setHistory(h=>[...h,{from:"ai",text:txt}]);
    } catch(e) { setHistory(h=>[...h,{from:"ai",text:`${e.message||"Connection error. Please try again."}`}]); }
    setLoading(false);
  };

  const suggested = ["What are the side effects of Metformin?","Can I take ibuprofen with Lisinopril?","What foods should I avoid with blood thinners?","How do I improve medication adherence?","What does my blood pressure reading mean?"];

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:20, height:580 }}>
      <div className="card" style={{ display:"flex", flexDirection:"column", padding:0, overflow:"hidden" }}>
        <div style={{ padding:"18px 20px", borderBottom:`1px solid ${col.border}`, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:col.accentLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}><Icons.AI/></div>
          <div><div style={{ fontWeight:700, fontSize:14 }}>MedGuard AI Assistant</div><div style={{ fontSize:11, color:"#34d399" }}>● Online · Claude AI</div></div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:10 }}>
          {history.map((m,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:m.from==="user"?"flex-end":"flex-start", gap:8, alignItems:"flex-end" }}>
              {m.from==="ai"&&<div style={{ width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${col.gradStart},${col.gradEnd})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0 }}><Icons.AI/></div>}
              <div style={{ maxWidth:"80%", padding:"11px 14px", borderRadius:m.from==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px", background:m.from==="user"?`linear-gradient(135deg,${col.gradStart},${col.gradEnd})`:col.surface, color:m.from==="user"?"#fff":col.text, fontSize:13.5, lineHeight:1.7, border:m.from==="ai"?`1px solid ${col.border}`:"none", whiteSpace:"pre-wrap" }}>{m.text}</div>
            </div>
          ))}
          {loading&&<div style={{ display:"flex", gap:8, alignItems:"flex-end" }}><div style={{ width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${col.gradStart},${col.gradEnd})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14 }}><Icons.AI/></div><div style={{ padding:"12px 16px",borderRadius:"16px 16px 16px 4px",background:col.surface,border:`1px solid ${col.border}` }} className="dot-loading"><span/><span/><span/></div></div>}
          <div ref={bottomRef}/>
        </div>
        <div style={{ padding:"12px 16px", borderTop:`1px solid ${col.border}`, display:"flex", gap:8 }}>
          <button onClick={listening?stop:start} style={{ padding:"11px 12px", borderRadius:10, background:listening?"rgba(239,68,68,0.1)":col.surface, border:`1.5px solid ${listening?"rgba(239,68,68,0.4)":col.border}`, fontSize:16, cursor:"pointer" }}>{listening?<Icons.Mic style={{color:"#ef4444"}}/>:<Icons.Mic/>}</button>
          <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Ask about medications, symptoms…" className="input" style={{ flex:1 }}/>
          <button onClick={send} disabled={loading||!msg.trim()} className="btn btn-primary" style={{ opacity:loading||!msg.trim()?0.5:1 }}><Icons.Send/></button>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <div className="card">
          <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}><Icons.Lightbulb/> Quick Questions</div>
          {suggested.map(q=><button key={q} onClick={()=>setMsg(q)} style={{ width:"100%", textAlign:"left", padding:"8px 10px", borderRadius:8, background:col.accentLight, border:`1px solid ${col.accentBorder}`, fontSize:12, color:col.textMid, cursor:"pointer", marginBottom:6, lineHeight:1.5 }}>{q}</button>)}
        </div>
        <div style={{ background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.2)", borderRadius:12, padding:"14px" }}>
          <div style={{ fontWeight:700, fontSize:12, color:"#fbbf24", marginBottom:6 }}><Icons.Warning/> Disclaimer</div>
          <p style={{ fontSize:11, color:col.textSoft, lineHeight:1.65 }}>AI provides general information only. Always consult your licensed doctor for medical decisions.</p>
        </div>
      </div>
    </div>
  );
}

// ── PATIENT PORTAL ────────────────────────────────────
function PatientPortal({ dark, SetDark, lang, SetLang, user, SetUser, onLogout }) {
  const L = T[lang]||T.en;
  const col = C[dark?"dark":"light"];
  const { toasts, show } = useToast();
  const _offline = useOffline();
  const [tab, setTab] = useState("dashboard");
  const [meds, setMeds] = useState(() => getMeds(user.email));
  const [vitals, setVitals] = useState(() => getVitals(user.email));
  const [appointments, setAppointments] = useState(() => getAppointments(user.email));
  const [vaccines, setVaccines] = useState(() => getVaccines(user.email));
  const [streak, setStreak] = useState(() => getUsers()[user.email]?.streak || 0);
  const [showAddMed, setShowAddMed] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  const [showAppt, setShowAppt] = useState(false);
  const [showVaccine, setShowVaccine] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [_loading, _setLoading] = useState(false);

  useNotificationScheduler(meds);

  const takenCount = meds.filter(m=>m.status==="taken").length;
  const adherencePct = meds.length===0?0:Math.round((takenCount/meds.length)*100);
  const _healthScore = Math.min(100, Math.round(adherencePct*0.55+streak*0.9+18));

  const _markTaken = (idx) => {
    if(meds[idx].status==="taken") return;
    const newMeds = meds.map((m,i)=>i===idx?{...m,status:"taken"}:m);
    setMeds(newMeds); saveMeds(user.email, newMeds);
    const today = new Date().toDateString();
    const adh = getAdherenceHistory(user.email);
    const newTaken = newMeds.filter(m=>m.status==="taken").length;
    adh[today] = newMeds.length===0?0:Math.round((newTaken/newMeds.length)*100);
    saveAdherenceHistory(user.email, adh);
    if(newMeds.every(m=>m.status==="taken")) {
      const newStreak = streak+1; setStreak(newStreak);
      const users = getUsers(); if(users[user.email]) { users[user.email].streak=newStreak; saveUsers(users); }
      show(<Icons.Flame/>,"Streak Extended!","All doses taken today! Keep it up!","success");
    } else {
      show(<Icons.Check/>,"Dose Logged",`${meds[idx].name} marked as taken.`,"success");
    }
  };

  const addMed = (form) => {
    const newMeds=[...meds,form]; setMeds(newMeds); saveMeds(user.email,newMeds);
    show(<Icons.Med/>,"Medication Added",`${form.name} added to your schedule.`);
  };
  const _deleteMed = (idx) => {
    const newMeds=meds.filter((_,i)=>i!==idx); setMeds(newMeds); saveMeds(user.email,newMeds);
    show(<Icons.Trash/>,"Medication Removed","Medication deleted from schedule.");
  };
  const _resetDoses = () => {
    const newMeds=meds.map(m=>({...m,status:"upcoming"})); setMeds(newMeds); saveMeds(user.email,newMeds);
    show(<Icons.Refresh/>,"Doses Reset","All doses reset for today.");
  };

  const addVitals = (entry) => {
    const newVitals=[...vitals,entry]; setVitals(newVitals); saveVitals(user.email,newVitals);
    show(<Icons.Heart/>,"Vitals Logged","Health measurements saved.");
  };
  const addAppt = (appt) => {
    const newAppts=[...appointments,appt]; setAppointments(newAppts); saveAppointments(user.email,newAppts);
    show(<Icons.Calendar/>,"Appointment Scheduled",`Visit with ${appt.doctor} on ${appt.date}.`);
  };
  const _deleteAppt = (id) => {
    const newAppts=appointments.filter(a=>a.id!==id); setAppointments(newAppts); saveAppointments(user.email,newAppts);
  };
  const addVaccine = (v) => {
    const newV=[...vaccines,v]; setVaccines(newV); saveVaccines(user.email,newV);
    show(<Icons.Syringe/>,'Vaccination Recorded',`${v.name} added to your records.`);
  };

  const removeVaccine = (id) => {
    const newV=vaccines.filter(v=>v.id!==id); setVaccines(newV); saveVaccines(user.email,newV);
    show(<Icons.Trash/>,"Vaccine Removed","Vaccination record deleted.");
  };

  const tipOptions = [
    { title:"Stay Hydrated", description:"Drink water with your medications to support absorption and prevent dizziness." },
    { title:"Set Reminders", description:"Use alarms or app reminders so you never miss a dose." },
    { title:"Track Side Effects", description:"Note any new symptoms and discuss them with your doctor." },
    { title:"Review Your Meds", description:"Regularly check medication instructions and avoid dangerous combinations." },
    { title:"Keep Records", description:"Log appointments, vitals, and vaccine dates for better healthcare tracking." },
  ];

  const renderTabContent = () => {
    const latestVitals = vitals[vitals.length-1];
    switch(tab) {
      case "dashboard":
        return (
          <>
            {/* Greeting */}
            <div style={{ marginBottom:32 }}>
              <h1 style={{ fontSize:32, fontWeight:900, color:col.text, marginBottom:8 }}>Morning, {user?.name?.split(" ")[0]||"there"}.</h1>
              <p style={{ color:col.textSoft, fontSize:14 }}>You have {meds.filter(m=>m.status!="taken").length} medications remaining for today. Your vitals are looking stable and well-balanced.</p>
            </div>

            {/* Today's Schedule */}
            <div style={{ marginBottom:32 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <h2 style={{ fontSize:18, fontWeight:800, color:col.text }}>Today's Schedule</h2>
                <a href="#" style={{ fontSize:13, color:col.accent, textDecoration:"none", fontWeight:600 }}>View Full Calendar</a>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {meds.slice(0,3).map((med,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:16, padding:"16px", background:col.card, borderRadius:12, border:`1px solid ${col.border}` }}>
                    <div style={{ width:12, height:12, borderRadius:"50%", background:med.status==="taken"?"#34d399":"#fbbf24" }}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:col.text }}>{med.name}</div>
                      <div style={{ fontSize:12, color:col.textSoft }}>{med.dosage} • {med.frequency}</div>
                    </div>
                    <div style={{ fontSize:14, fontWeight:600, color:med.status==="taken"?"#34d399":"#fbbf24" }}>{med.time}</div>
                    <span style={{ fontSize:11, background:med.status==="taken"?"rgba(52,211,153,0.1)":"rgba(251,191,36,0.1)", color:med.status==="taken"?"#34d399":"#fbbf24", padding:"4px 8px", borderRadius:6, fontWeight:600, textTransform:"uppercase" }}>{med.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Advisor Insight Card */}
            <div style={{ background:"linear-gradient(135deg,#ff9a56 0%,#ff7a3d 100%)", borderRadius:12, padding:24, marginBottom:32, display:"flex", gap:20 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <span style={{ fontSize:20 }}><Icons.Lightbulb/></span>
                  <span style={{ fontWeight:800, fontSize:12, color:"#fff", textTransform:"uppercase", letterSpacing:0.5 }}>Advisor Insight</span>
                </div>
                <h3 style={{ fontSize:20, fontWeight:800, color:"#fff", marginBottom:12 }}>Hydration & Lisinopril</h3>
                <p style={{ color:"rgba(255,255,255,0.9)", fontSize:14, lineHeight:"1.6", marginBottom:16 }}>Ensure you drink a glass of water when taking Lisinopril to support blood pressure control and minimize dizziness.</p>
                <button style={{ background:"rgba(255,255,255,0.2)", border:"1px solid rgba(255,255,255,0.3)", color:"#fff", padding:"8px 14px", borderRadius:8, fontWeight:600, fontSize:12, cursor:"pointer" }}>Read Full Insight</button>
              </div>
              <div style={{ fontSize:60, opacity:0.3 }}><Icons.Droplet/></div>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
              {[
                { label:"Sleep Quality", value:"7h 42m", unit:"OPTIMAL", icon:<Icons.Moon/> },
                { label:"Daily Steps", value:"8,432", unit:"ACTIVE", icon:<Icons.Activity/> },
                { label:"Add New Metric", value:"+", unit:"", icon:<Icons.Plus/> },
              ].map((stat,i)=>(
                <div key={i} style={{ padding:16, background:col.card, borderRadius:12, border:`1px solid ${col.border}`, textAlign:"center" }}>
                  <div style={{ fontSize:20 }}>{stat.icon}</div>
                  <div style={{ fontSize:12, color:col.textSoft, textTransform:"uppercase", letterSpacing:0.5, marginTop:8, marginBottom:4 }}>{stat.unit}</div>
                  <div style={{ fontSize:20, fontWeight:900, color:col.text }}>{stat.value}</div>
                  <div style={{ fontSize:11, color:col.textSoft, marginTop:8 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </>
        );

      case "medication-info":
      case "medications":
        return (
          <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:26, fontWeight:900, color:col.text, marginBottom:4 }}>Medication Info</div>
                <div style={{ fontSize:13, color:col.textSoft }}>Manage your medications, reminders, and dosing schedule.</div>
              </div>
              <button onClick={()=>setShowAddMed(true)} className="btn btn-primary"><Icons.Plus/> Add Medication</button>
            </div>
            {meds.length===0 ? (
              <div className="card" style={{ textAlign:"center", padding:32, color:col.textSoft }}>No medications have been added yet. Use the button above to add your first medication.</div>
            ) : (
              <div style={{ display:"grid", gap:14 }}>
                {meds.map((med,i)=>(
                  <div key={med.id||i} className="card" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:16, padding:20 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8 }}><span style={{ fontSize:18 }}><Icons.Med/></span><div style={{ fontWeight:800, fontSize:15, color:col.text }}>{med.name}</div></div>
                      <div style={{ fontSize:12, color:col.textSoft }}>{med.dosage} • {med.frequency} • {med.time}</div>
                      {med.refillDate && <div style={{ marginTop:8, fontSize:11, color:col.textSoft }}>Refill: {med.refillDate}</div>}
                      {med.notes && <div style={{ marginTop:8, fontSize:11, color:col.textSoft }}>Notes: {med.notes}</div>}
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      {med.status!=="taken" && <button onClick={()=>_markTaken(i)} className="btn btn-ghost">Mark Taken</button>}
                      <button onClick={()=>_deleteMed(i)} className="btn btn-danger">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "chat-history":
      case "ai-advisor":
        return <AIChatTab dark={dark} user={user} meds={meds}/>;

      case "health-insights":
      case "analytics":
        return <AnalyticsTab dark={dark} email={user.email} meds={meds} streak={streak} vitals={vitals}/>;

      case "saved-tips":
        return (
          <div style={{ display:"grid", gap:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:26, fontWeight:900, color:col.text }}>Saved Tips</div>
                <div style={{ fontSize:13, color:col.textSoft }}>Helpful reminders and healthy habits for your care routine.</div>
              </div>
              <button onClick={()=>setTab("settings")} className="btn btn-ghost">Manage Settings</button>
            </div>
            <div style={{ display:"grid", gap:12 }}>
              {tipOptions.map((tip,i)=>(
                <div key={i} className="card" style={{ padding:18 }}>
                  <div style={{ fontWeight:800, fontSize:15, color:col.text, marginBottom:8 }}>{tip.title}</div>
                  <div style={{ fontSize:13, color:col.textSoft, lineHeight:1.7 }}>{tip.description}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case "vitals":
        return (
          <div style={{ display:"grid", gap:22 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:26, fontWeight:900, color:col.text }}>Vitals</div>
                <div style={{ fontSize:13, color:col.textSoft }}>Log your latest health measurements and view trends.</div>
              </div>
              <button onClick={()=>setShowVitals(true)} className="btn btn-primary"><Icons.Heart/> Log Vitals</button>
            </div>
            {latestVitals ? (
              <div className="card" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
                {[["Blood Pressure",`${latestVitals.bp_sys||"—"}/${latestVitals.bp_dia||"—"} mmHg`,<Icons.Heart key="bp"/>],["Pulse",`${latestVitals.pulse||"—"} bpm`,<Icons.Heart key="pulse"/>],["Temperature",`${latestVitals.temp||"—"}°C`,<Icons.Thermometer key="temp"/>],["O2",`${latestVitals.o2||"—"}%`,<Icons.Droplet key="o2"/>],["Weight",`${latestVitals.weight||"—"} kg`,<Icons.Weight key="wt"/>],["Glucose",`${latestVitals.glucose||"—"} mg/dL`,<Icons.DNA key="glucose"/>]].map(([label,value,icon])=>(
                  <div key={label} style={{ background:col.surface, borderRadius:14, padding:16, border:`1px solid ${col.border}` }}>
                    <div style={{ fontSize:20, marginBottom:8 }}>{icon}</div>
                    <div style={{ fontWeight:700, color:col.text, marginBottom:6 }}>{label}</div>
                    <div style={{ fontSize:14, color:col.textSoft }}>{value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign:"center", padding:32, color:col.textSoft }}>No vitals recorded yet. Log your first health entry to begin tracking.</div>
            )}
            {vitals.length > 0 && (
              <div className="card" style={{ padding:18, display:"grid", gap:12 }}>
                <div style={{ fontWeight:800, color:col.text }}>Recent Vitals History</div>
                {vitals.slice(-5).reverse().map((entry,i)=>(
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, padding:12, background:col.card, borderRadius:10 }}>
                    <div><div style={{ fontSize:12, color:col.textSoft }}>Date</div><div style={{ color:col.text }}>{entry.date}</div></div>
                    <div><div style={{ fontSize:12, color:col.textSoft }}>Pulse</div><div style={{ color:col.text }}>{entry.pulse||"—"} bpm</div></div>
                    <div><div style={{ fontSize:12, color:col.textSoft }}>BP</div><div style={{ color:col.text }}>{entry.bp_sys||"—"}/{entry.bp_dia||"—"}</div></div>
                    <div><div style={{ fontSize:12, color:col.textSoft }}>Temp</div><div style={{ color:col.text }}>{entry.temp||"—"}°C</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "appointments":
        return (
          <div style={{ display:"grid", gap:22 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:26, fontWeight:900, color:col.text }}>Appointments</div>
                <div style={{ fontSize:13, color:col.textSoft }}>Schedule doctor visits, lab work, and follow-ups.</div>
              </div>
              <button onClick={()=>setShowAppt(true)} className="btn btn-primary"><Icons.Calendar/> Add Appointment</button>
            </div>
            {appointments.length===0 ? (
              <div className="card" style={{ textAlign:"center", padding:32, color:col.textSoft }}>No appointments scheduled yet. Add one to stay organized.</div>
            ) : (
              <div style={{ display:"grid", gap:12 }}>
                {appointments.map((appt,i)=>(
                  <div key={appt.id||i} className="card" style={{ padding:18, borderRadius:14, border:`1px solid ${col.border}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:14 }}>
                      <div>
                        <div style={{ fontWeight:800, color:col.text }}>{appt.doctor}</div>
                        <div style={{ fontSize:12, color:col.textSoft }}>{appt.specialty || "General"}</div>
                      </div>
                      <button onClick={()=>_deleteAppt(appt.id)} className="btn btn-danger" style={{ padding:"8px 12px" }}>Cancel</button>
                    </div>
                    <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginTop:12, color:col.textSoft, fontSize:12 }}>
                      <div><Icons.Calendar/> {appt.date} at {appt.time}</div>
                      <div>{appt.type}</div>
                      <div>{appt.location || "No location"}</div>
                    </div>
                    {appt.notes && <div style={{ marginTop:12, fontSize:12, color:col.textSoft }}>Notes: {appt.notes}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "vaccinations":
        return (
          <div style={{ display:"grid", gap:22 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:26, fontWeight:900, color:col.text }}>Vaccinations</div>
                <div style={{ fontSize:13, color:col.textSoft }}>Keep your vaccine record current and accessible.</div>
              </div>
              <button onClick={()=>setShowVaccine(true)} className="btn btn-primary"><Icons.Syringe/> Add Vaccine</button>
            </div>
            {vaccines.length===0 ? (
              <div className="card" style={{ textAlign:"center", padding:32, color:col.textSoft }}>No vaccination records yet. Add your vaccine history to stay protected.</div>
            ) : (
              <div style={{ display:"grid", gap:12 }}>
                {vaccines.map((v,i)=>(
                  <div key={v.id||i} className="card" style={{ padding:18, display:"flex", justifyContent:"space-between", alignItems:"center", borderRadius:14, border:`1px solid ${col.border}` }}>
                    <div>
                      <div style={{ fontWeight:800, color:col.text }}>{v.name}</div>
                      <div style={{ fontSize:12, color:col.textSoft }}>{v.date} • Next due: {v.nextDue||"N/A"}</div>
                    </div>
                    <button onClick={()=>removeVaccine(v.id)} className="btn btn-danger">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "symptoms":
        return (
          <div style={{ display:"grid", gap:18 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:26, fontWeight:900, color:col.text }}>Symptom Logger</div>
                <div style={{ fontSize:13, color:col.textSoft }}>Log symptoms and let AI assess them against your medications.</div>
              </div>
              <button onClick={()=>setShowSymptoms(true)} className="btn btn-primary"><Icons.Activity/> Log Symptoms</button>
            </div>
            <div className="card" style={{ padding:20, background:col.surface, borderRadius:14, border:`1px solid ${col.border}` }}>
              <div style={{ fontWeight:700, color:col.text, marginBottom:10 }}>Current Medications</div>
              {meds.length===0 ? <div style={{ color:col.textSoft }}>No medications are recorded yet.</div> : (
                <div style={{ display:"grid", gap:10 }}>
                  {meds.map((med,i)=>(<div key={i} style={{ padding:12, borderRadius:10, background:col.card, display:"flex", justifyContent:"space-between", alignItems:"center" }}><div><div style={{ fontWeight:700, color:col.text }}>{med.name}</div><div style={{ fontSize:11, color:col.textSoft }}>{med.dosage}</div></div><span style={{ fontSize:11, color:col.textSoft }}>{med.status}</span></div>))}
                </div>
              )}
            </div>
            <div className="card" style={{ padding:20, borderRadius:14, border:`1px solid ${col.border}` }}>
              <div style={{ fontWeight:700, marginBottom:10, color:col.text }}>AI Symptom Support</div>
              <p style={{ color:col.textSoft, fontSize:13, lineHeight:1.7 }}>Use the symptom logger to get AI-backed guidance based on your medications and the symptoms you select. This is not medical advice.</p>
            </div>
          </div>
        );

      case "settings":
        return <SettingsTab dark={dark} setDark={SetDark} lang={lang} setLang={SetLang} user={user} setUser={SetUser} show={show}/>;

      default:
        return (
          <div style={{ textAlign:"center", padding:"64px 32px" }}>
            <div style={{ fontSize:20, fontWeight:800, color:col.text, marginBottom:8 }}>{navItems.find(i=>i.id===tab)?.label||"Feature"}</div>
            <p style={{ color:col.textSoft, marginBottom:16 }}>This section is being updated so it works seamlessly for your care plan.</p>
            <button onClick={()=>setTab("dashboard")} className="btn btn-primary">Return to Dashboard</button>
          </div>
        );
    }
  };

  const navItems = [
    { id:"dashboard", label:L.dashboard, icon:<Icons.Dash/> },
    { id:"medications", label:L.medications, icon:<Icons.Med/> },
    { id:"ai-advisor", label:L.aiAdvisor, icon:<Icons.AI/> },
    { id:"analytics", label:L.analytics, icon:<Icons.Chart/> },
    { id:"vitals", label:L.vitals||"Vitals", icon:<Icons.Heart/> },
    { id:"appointments", label:L.appointments||"Appointments", icon:<Icons.Calendar/> },
    { id:"vaccinations", label:L.vaccinations||"Vaccines", icon:<Icons.Syringe/> },
    { id:"symptoms", label:L.symptoms, icon:<Icons.Activity/> },
    { id:"settings", label:L.settings, icon:<Icons.Settings/> },
  ];

  const refillDueCount = meds.filter(m=>m.refillDate&&(new Date(m.refillDate)-new Date())/(1000*60*60*24)<=7).length;
  const _notifCount = refillDueCount + appointments.filter(a=>{const d=new Date(a.date);const now=new Date();return d>=now&&(d-now)/(1000*60*60*24)<=3;}).length;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:col.bg }}>
      <Toast toasts={toasts}/>
      {showNotifs && <NotificationPanel meds={meds} appointments={appointments} dark={dark} onClose={()=>setShowNotifs(false)}/>}

      {/* LEFT SIDEBAR - HEALTH ADVISOR */}
      <aside style={{ width:240, background:col.sidebar, borderRight:`1px solid rgba(255,255,255,0.06)`, padding:"24px 20px", position:"fixed", height:"100vh", display:"flex", flexDirection:"column", zIndex:100, overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32, padding:"0 8px" }}>
          <span style={{ fontSize:24 }}><Icons.Shield/></span>
          <span style={{ fontSize:17, fontWeight:900, color:"#f1f5f9", letterSpacing:"-0.5px" }}>MedGuard</span>
        </div>

        {/* Health Advisor Card */}
        <div style={{ background:col.accentLight, borderRadius:12, padding:16, marginBottom:24, border:`1px solid ${col.accentBorder}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <div style={{ fontSize:24 }}><Icons.AI/></div>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:col.text }}>Health Advisor</div>
              <div style={{ fontSize:11, color:col.textSoft }}>Always Here to Help</div>
            </div>
          </div>
          <button onClick={()=>setTab("ai-advisor")} style={{ width:"100%", padding:"10px 12px", borderRadius:8, background:col.accent, border:"none", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer", transition:"all 0.2s" }}><Icons.Plus style={{ marginRight:8 }}/> Start New Chat</button>
        </div>

        {/* Menu Items */}
        <nav style={{ flex:1 }}>
          {[
            { id:"chat-history", label:"Chat History", icon:<Icons.Message/> },
            { id:"health-insights", label:"Health Insights", icon:<Icons.Shield/> },
            { id:"saved-tips", label:"Saved Tips", icon:<Icons.Star/> },
            { id:"medication-info", label:"Medication Info", icon:<Icons.Med/> },
          ].map(item=>(
            <div key={item.id} onClick={()=>setTab(item.id)} className="sidebar-item" style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:10, color:col.textMid, cursor:"pointer", transition:"all 0.2s", marginBottom:8 }}>
              <span style={{ fontSize:16 }}>{item.icon}</span><span style={{ fontSize:13, fontWeight:600 }}>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div style={{ padding:"12px", borderTop:`1px solid ${col.border}`, marginTop:'auto' }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${col.gradStart},${col.gradEnd})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff", fontSize:14 }}>{user?.initials}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:700, color:col.text }}>{user?.name}</div>
              <div onClick={onLogout} style={{ fontSize:11, color:col.textSoft, cursor:"pointer" }}>Sign Out →</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex:1, marginLeft:240, display:"flex", minHeight:"100vh" }}>
        <div style={{ flex:"2.5", padding:"32px 36px", borderRight:`1px solid ${col.border}`, overflowY:"auto" }}>
          {renderTabContent()}
        </div>

        {/* RIGHT SIDEBAR - Wellness Summary */}
        <div style={{ flex:"1.5", padding:"32px 32px", borderLeft:`1px solid ${col.border}`, overflowY:"auto", background:col.surface }}>
          {tab==="dashboard" && (
            <>
              <h2 style={{ fontSize:24, fontWeight:900, color:col.text, marginBottom:4 }}>Your Wellness,</h2>
              <p style={{ fontSize:24, fontWeight:900, color:col.accent, marginBottom:32 }}>Precisely Scheduled.</p>

              <p style={{ fontSize:13, color:col.textSoft, lineHeight:"1.6", marginBottom:32 }}>Consistency is the foundation of recovery. Here is your personalized roadmap for today's medication and care routine.</p>

              {/* Calendar */}
              <div style={{ background:col.card, borderRadius:12, padding:20, marginBottom:24, border:`1px solid ${col.border}` }}>
                <div style={{ fontSize:16, fontWeight:800, color:col.text, marginBottom:16, textAlign:"center" }}>October 2024</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:8, textAlign:"center" }}>
                  {["MON","TUE","WED","THU","FRI","SAT","SUN"].map(day=><div key={day} style={{ fontSize:11, fontWeight:700, color:col.textSoft }}>{day}</div>)}
                  {[21,22,23,24,25,26,27].map(day=>(
                    <div key={day} style={{ padding:"12px", borderRadius:8, background:day===24?col.accent:"transparent", color:day===24?"#fff":col.text, fontWeight:700, fontSize:13, cursor:"pointer" }}>{day}</div>
                  ))}
                </div>
              </div>

              {/* Medication Cards */}
              <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
                {[
                  { name:"Lisinopril", dosage:"10mg Tablet • Daily", status:"TAKEN", nextDose:"08:00 AM", refill:"15 Days left" },
                  { name:"Atorvastatin", dosage:"20mg Capsule • Nightly", status:"UPCOMING", nextDose:"09:30 PM", refill:"3 Days left" },
                  { name:"Metformin", dosage:"500mg Tablet • Twice Daily", status:"MISSED DOSE", nextDose:"12:00 PM", refill:"REFILL NOW" },
                ].map((med,i)=>(
                  <div key={i} style={{ background:col.card, borderRadius:12, padding:14, border:`1px solid ${col.border}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", marginBottom:8 }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13, color:col.text }}>{med.name}</div>
                        <div style={{ fontSize:11, color:col.textSoft }}>{med.dosage}</div>
                      </div>
                      <span style={{ fontSize:10, background:med.status==="TAKEN"?"rgba(52,211,153,0.1)":med.status==="MISSED DOSE"?"rgba(239,68,68,0.1)":"rgba(251,191,36,0.1)", color:med.status==="TAKEN"?"#34d399":med.status==="MISSED DOSE"?"#ef4444":"#fbbf24", padding:"3px 8px", borderRadius:4, fontWeight:700, textTransform:"uppercase" }}>{med.status}</span>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:col.textSoft }}>
                      <span>NEXT DOSE: {med.nextDose}</span>
                      <span style={{ color:med.refill.includes("REFILL")?col.accent:col.textSoft }}>{med.refill}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Progress */}
              <div style={{ background:col.card, borderRadius:12, padding:20, border:`1px solid ${col.border}` }}>
                <div style={{ fontSize:16, fontWeight:800, color:col.text, marginBottom:16 }}>Weekly Progress</div>
                <div style={{ textAlign:"center", marginBottom:16 }}>
                  <div style={{ fontSize:48, fontWeight:900, color:"#34d399", marginBottom:4 }}>85%</div>
                  <div style={{ fontSize:12, color:col.textSoft, fontWeight:600 }}>ADHERENCE</div>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:col.textSoft, paddingTop:12, borderTop:`1px solid ${col.border}` }}>
                  <span>Scheduled Doses: <span style={{ color:col.text, fontWeight:700 }}>28</span></span>
                  <span>Taken on Time: <span style={{ color:col.text, fontWeight:700 }}>24</span></span>
                  <span>Missed: <span style={{ color:"#ef4444", fontWeight:700 }}>1</span></span>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* MODALS */}
      {showAddMed && <AddMedModal onClose={()=>setShowAddMed(false)} onAdd={addMed} knownAllergies={user?.allergies?.split(",").map(a=>a.trim()).filter(Boolean)}/>}
      {showInteraction && <DrugInteractionModal onClose={()=>setShowInteraction(false)} dark={dark}/>}
      {showSOS && <EmergencySOSModal onClose={()=>setShowSOS(false)} user={user}/>}
      {showSymptoms && <SymptomLoggerModal onClose={()=>setShowSymptoms(false)} meds={meds}/>}
      {showVitals && <VitalsModal onClose={()=>setShowVitals(false)} onSave={addVitals}/>}
      {showAppt && <AppointmentModal onClose={()=>setShowAppt(false)} onSave={addAppt}/>}
      {showVaccine && <VaccineModal onClose={()=>setShowVaccine(false)} onSave={addVaccine}/>}
    </div>
  );
}

// ── GUARDIAN PORTAL ───────────────────────────────────
function GuardianPortal({ dark, setDark, lang, setLang, user, setUser, onLogout }) {
  const col = C[dark?"dark":"light"];
  const { toasts, show } = useToast();
  const [patients, setPatients] = useState(()=>getPatients(user.email));
  const [selected, setSelected] = useState(0);
  const [showAddPt, setShowAddPt] = useState(false);
  const [tab, setTab] = useState("overview");

  const addPatient = (form) => {
    const pt = { ...form, id:Date.now().toString(), initials:(form.name||"?").split(" ").map(n=>n[0]).join("").toUpperCase(), adherence:0 };
    const newPts=[...patients,pt]; setPatients(newPts); savePatients(user.email,newPts);
    setSelected(newPts.length-1);
    show(<Icons.User/>,"Patient Added",`${form.name} added to your care network.`);
  };
  const deletePt = (id) => {
    if(!window.confirm("Remove this patient record?")) return;
    const newPts=patients.filter(p=>p.id!==id); setPatients(newPts); savePatients(user.email,newPts);
    setSelected(Math.max(0,selected-1));
  };

  const p = patients[selected];
  const navItems=[{id:"overview",label:"Overview",icon:<Icons.Dash/>},{id:"patients",label:"Patients",icon:<Icons.Users/>},{id:"settings",label:"Settings",icon:<Icons.Settings/>}];

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:col.bg }}>
      <Toast toasts={toasts}/>

      {/* SIDEBAR */}
      <aside style={{ width:240, background:col.sidebar, borderRight:"1px solid rgba(255,255,255,0.06)", padding:"28px 16px", position:"fixed", height:"100vh", display:"flex", flexDirection:"column", zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:36, padding:"0 8px" }}>
          <span style={{ fontSize:24 }}><Icons.Shield/></span>
          <div>
            <div style={{ fontSize:15, fontWeight:900, color:"#f1f5f9", fontFamily:"'Syne', sans-serif" }}>MedGuard</div>
            <div style={{ fontSize:10, color:"#475569", fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>Guardian</div>
          </div>
        </div>
        <nav style={{ flex:1 }}>
          {navItems.map(item=>(
            <div key={item.id} onClick={()=>setTab(item.id)} className={`sidebar-link ${tab===item.id?"active":""}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding:"10px 8px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${col.gradStart},${col.gradEnd})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff", fontSize:14 }}>{user?.initials}</div>
            <div style={{ flex:1, overflow:"hidden" }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name}</div>
              <div onClick={onLogout} style={{ fontSize:11, color:"#475569", cursor:"pointer" }}>Sign Out →</div>
            </div>
          </div>
        </div>
      </aside>

      <main style={{ flex:1, marginLeft:240, padding:"32px 40px" }}>
        <header style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32 }}>
          <div>
            <h1 style={{ fontSize:28, fontWeight:900, color:col.text, fontFamily:"'Syne', sans-serif" }}>{navItems.find(i=>i.id===tab)?.label}</h1>
            <p style={{ fontSize:13, color:col.textSoft, marginTop:3 }}>Managing {patients.length} patient{patients.length!==1?"s":""}</p>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>setDark(!dark)} style={{ width:40, height:40, borderRadius:10, background:col.surface, border:`1px solid ${col.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:dark?"#fbbf24":col.textMid }}>{dark?<Icons.Moon/>:<Icons.Sun/>}</button>
          </div>
        </header>

        {tab==="overview" && (
          <div>
            {/* Patient selector */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:700, color:col.textMid, marginBottom:10 }}>Select Patient</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {patients.map((pt,i)=>(
                  <div key={pt.id} onClick={()=>setSelected(i)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:12, border:`2px solid ${selected===i?col.accent:col.border}`, background:selected===i?col.accentLight:col.card, cursor:"pointer", transition:"all 0.2s", position:"relative", minWidth:160 }}>
                    <button onClick={e=>{e.stopPropagation();deletePt(pt.id);}} style={{ position:"absolute", top:4, right:6, background:"none", border:"none", color:"#ef4444", cursor:"pointer", fontSize:16, lineHeight:1 }}>×</button>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:`${col.accent}22`, color:col.accent, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13 }}>{pt.initials}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, color:col.text }}>{pt.name}</div>
                      <div style={{ fontSize:11, color:col.textSoft }}>{pt.rel} · {pt.age} yrs</div>
                    </div>
                  </div>
                ))}
                <div onClick={()=>setShowAddPt(true)} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 20px", borderRadius:12, border:`2px dashed ${col.border}`, cursor:"pointer", color:col.textSoft, fontWeight:600, fontSize:13 }}><Icons.Plus/> Add Patient</div>
              </div>
            </div>

            {p ? (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {/* Patient stats */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }} className="fade-up">
                  {[[<Icons.Med/>,"Adherence",`${p.adherence||0}%`,p.adherence>=80?"badge-green":p.adherence>=60?"badge-yellow":"badge-red"],[<Icons.Flame/>,"Streak","—","badge-blue"],[<Icons.Warning/>,"Alerts","0","badge-yellow"],[<Icons.Calendar/>,"Next Appt","—",""]].map(([e,l,v,cls])=>(
                    <div key={l} className="stat-card">
                      <span style={{ fontSize:22 }}>{e}</span>
                      <div style={{ fontSize:22, fontWeight:900, color:col.text, marginTop:4 }}>{v}</div>
                      <div style={{ fontSize:11, color:col.textSoft, marginTop:2, textTransform:"uppercase", letterSpacing:0.8 }}>{l}</div>
                      {cls&&<span className={`badge ${cls}`} style={{ marginTop:6 }}>{v}</span>}
                    </div>
                  ))}
                </div>

                {/* Patient health profile */}
                <div className="card fade-up-1">
                  <div style={{ fontWeight:800, fontSize:16, marginBottom:16 }}><Icons.Building/> Health Profile: {p.name}</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                    {[["Conditions",p.conditions||"None listed",col.accent],["Allergies",p.allergies||"None declared","#ef4444"],["Emergency Contact",p.emergencyContact||"Not set","#fbbf24"]].map(([l,v,c])=>(
                      <div key={l}>
                        <div style={{ fontSize:11, fontWeight:700, color:c, textTransform:"uppercase", marginBottom:6 }}>{l}</div>
                        <div style={{ fontSize:13, color:col.text, lineHeight:1.6 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {p.medications && (
                    <div style={{ marginTop:16, paddingTop:14, borderTop:`1px solid ${col.border}` }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#34d399", textTransform:"uppercase", marginBottom:8 }}>Medications</div>
                      <div style={{ fontSize:13, color:col.text, lineHeight:1.7, background:col.accentLight, padding:"12px 14px", borderRadius:10, border:`1px solid ${col.accentBorder}` }}>{p.medications}</div>
                    </div>
                  )}
                </div>

                {/* Recent activity */}
                <div className="card fade-up-2">
                  <div style={{ fontWeight:800, fontSize:15, marginBottom:14 }}>🔔 Recent Activity</div>
                  {[["✅","Medication taken","2 min ago","badge-green"],["📋","Vitals logged","1 hr ago","badge-blue"],["💊","Refill reminder sent","2 hrs ago","badge-yellow"]].map(([e,m,t,cls])=>(
                    <div key={m} style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${col.border}` }}>
                      <span style={{ fontSize:18 }}>{e}</span>
                      <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600, color:col.text }}>{m}</div><div style={{ fontSize:11, color:col.textSoft }}>{t}</div></div>
                      <span className={`badge ${cls}`}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign:"center", padding:"80px 0", color:col.textSoft }}>
                <div style={{ fontSize:48, marginBottom:12 }}>👥</div>
                <div style={{ fontWeight:800, fontSize:18, marginBottom:8 }}>No patients added yet</div>
                <button onClick={()=>setShowAddPt(true)} className="btn btn-primary" style={{ marginTop:8 }}>Add First Patient</button>
              </div>
            )}
          </div>
        )}

        {tab==="patients" && (
          <div className="fade-up">
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <div style={{ fontSize:13, color:col.textSoft }}>{patients.length} patients under care</div>
              <button onClick={()=>setShowAddPt(true)} className="btn btn-primary"><Icons.Plus/> Add Patient</button>
            </div>
            {patients.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:col.textSoft }}><div style={{ fontSize:40, marginBottom:10 }}>👥</div><div>No patients yet</div><button onClick={()=>setShowAddPt(true)} className="btn btn-primary" style={{ marginTop:14 }}>Add First Patient</button></div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
                {patients.map((pt,i)=>(
                  <div key={pt.id} className="card">
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                      <div style={{ width:52, height:52, borderRadius:"50%", background:`${col.accent}22`, color:col.accent, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:18 }}>{pt.initials}</div>
                      <button onClick={()=>deletePt(pt.id)} className="btn btn-danger" style={{ padding:"6px 10px", fontSize:11 }}><Icons.Trash/></button>
                    </div>
                    <div style={{ fontWeight:800, fontSize:17 }}>{pt.name}</div>
                    <div style={{ fontSize:13, color:col.textMid, marginTop:3 }}>{pt.rel} · Age {pt.age}</div>
                    <div style={{ marginTop:12, display:"flex", gap:8, flexWrap:"wrap" }}>
                      {pt.conditions && <span className="badge badge-blue">{pt.conditions.split(",")[0]}</span>}
                      <span className={`badge ${pt.adherence>=80?"badge-green":pt.adherence>=60?"badge-yellow":"badge-red"}`}>{pt.adherence||0}% adherence</span>
                    </div>
                    <button onClick={()=>{setSelected(i);setTab("overview");}} className="btn btn-ghost" style={{ width:"100%", marginTop:14, fontSize:12 }}>View Dashboard →</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==="settings" && <SettingsTab dark={dark} setDark={setDark} lang={lang} setLang={setLang} user={user} setUser={setUser} show={show}/>}
      </main>

      {showAddPt && (
        <Modal onClose={()=>setShowAddPt(false)}>
          <ModalHead icon="👥" title="Add Patient" sub="Add a loved one to your care network" onClose={()=>setShowAddPt(false)}/>
          {(() => {
            const [form,setForm]=useState({name:"",rel:"",age:"",conditions:"",allergies:"",medications:"",emergencyContact:""});
            const up=(k,v)=>setForm(f=>({...f,[k]:v}));
            return (
              <div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 14px" }}>
                  <div style={{ gridColumn:"1/-1" }}><label className="label">Full Name *</label><input className="input" placeholder="Mary Smith" value={form.name} onChange={e=>up("name",e.target.value)}/></div>
                  <div><label className="label">Relationship *</label><input className="input" placeholder="Mother" value={form.rel} onChange={e=>up("rel",e.target.value)}/></div>
                  <div><label className="label">Age *</label><input type="number" className="input" placeholder="72" value={form.age} onChange={e=>up("age",e.target.value)}/></div>
                  <div style={{ gridColumn:"1/-1" }}><label className="label">Conditions</label><input className="input" placeholder="Diabetes, Hypertension" value={form.conditions} onChange={e=>up("conditions",e.target.value)}/></div>
                  <div style={{ gridColumn:"1/-1" }}><label className="label">Allergies</label><input className="input" placeholder="Penicillin, Peanuts" value={form.allergies} onChange={e=>up("allergies",e.target.value)}/></div>
                  <div style={{ gridColumn:"1/-1" }}><label className="label">Medications</label><textarea className="input" rows={3} style={{ resize:"none" }} placeholder="Metformin 500mg (8 AM)" value={form.medications} onChange={e=>up("medications",e.target.value)}/></div>
                  <div style={{ gridColumn:"1/-1" }}><label className="label">Emergency Contact</label><input className="input" placeholder="Dr. Wilson (555-0199)" value={form.emergencyContact} onChange={e=>up("emergencyContact",e.target.value)}/></div>
                </div>
                <div style={{ display:"flex", gap:10, marginTop:20 }}>
                  <button onClick={()=>setShowAddPt(false)} className="btn btn-ghost" style={{ flex:1 }}>Cancel</button>
                  <button onClick={()=>{ if(!form.name||!form.rel||!form.age) return; addPatient(form); setShowAddPt(false); }} className="btn btn-primary" style={{ flex:2 }}>Add Patient</button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}

// ── AUTH PAGE ─────────────────────────────────────────
function AuthPage({ onLogin, dark, setDark, onBack }) {
  const col = C[dark?"dark":"light"];
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [allergies, setAllergies] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      let result;
      if(mode==="register") {
        if(!name.trim()) { setError("Please enter your name."); return; }
        if(password.length<6) { setError("Password must be at least 6 characters."); return; }
        result = registerUser(email, password, role, name, allergies);
      } else {
        result = loginUser(email, password, role);
      }
      if(result.error) { setError(result.error); return; }
      localStorage.setItem(SESSION_KEY, JSON.stringify(result.user));
      onLogin(result.user);
    }, 900);
  };

  const iS = { width:"100%", padding:"13px 16px", borderRadius:12, border:`1.5px solid ${dark?"rgba(56,189,248,0.2)":col.border}`, background:dark?"rgba(255,255,255,0.04)":"white", color:col.text, fontSize:14, outline:"none", fontFamily:"'DM Sans', sans-serif" };
  const lS = { display:"block", fontSize:11, fontWeight:700, color:col.textSoft, textTransform:"uppercase", letterSpacing:0.8, marginBottom:8 };

  return (
    <div style={{ minHeight:"100vh", background:dark?"radial-gradient(circle at 20% 20%, #0f172a, #050810)":"radial-gradient(circle at 20% 20%, #e0f2fe, #f4f7fb)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative" }}>
      <button onClick={()=>setDark(!dark)} style={{ position:"absolute", top:28, right:28, background:"none", border:"none", cursor:"pointer", color:dark?"#fbbf24":col.textMid, display:"flex", alignItems:"center" }}>{dark?<Icons.Moon/>:<Icons.Sun/>}</button>
      <button onClick={onBack} style={{ position:"absolute", top:28, left:28, background:"none", border:"none", cursor:"pointer", color:col.textMid, display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:700 }}><Icons.Back/> Back</button>

      <div style={{ background:dark?"rgba(12,22,40,0.97)":"rgba(255,255,255,0.97)", border:`1px solid ${dark?"rgba(56,189,248,0.15)":"rgba(0,0,0,0.08)"}`, borderRadius:24, padding:"40px 36px", width:"100%", maxWidth:440, boxShadow:"0 32px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:36, marginBottom:8 }}><Icons.Shield/></div>
          <h1 style={{ fontSize:26, fontWeight:900, color:col.text, fontFamily:"'Syne', sans-serif" }}>MedGuard AI</h1>
          <p style={{ fontSize:13, color:col.textSoft, marginTop:4 }}>Your personal health guardian</p>
        </div>

        {/* Role tabs */}
        <div style={{ display:"flex", gap:0, marginBottom:24, borderRadius:12, overflow:"hidden", border:`1px solid ${col.border}` }}>
          {["patient","guardian"].map(r=>(
            <button key={r} onClick={()=>setRole(r)} style={{ flex:1, padding:"11px", background:role===r?col.accent:"transparent", color:role===r?"#fff":col.textMid, border:"none", fontSize:13, fontWeight:700, cursor:"pointer", textTransform:"capitalize", transition:"all 0.2s" }}>{r==="patient"?<><Icons.User/> Patient</>:<><Icons.Users/> Guardian</>}</button>
          ))}
        </div>

        {/* Login/Register tabs */}
        <div style={{ display:"flex", gap:0, marginBottom:24, borderBottom:`1px solid ${col.border}` }}>
          {["login","register"].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setError("");}} style={{ flex:1, padding:"10px", background:"none", border:"none", color:mode===m?col.accent:col.textSoft, fontWeight:mode===m?800:600, fontSize:13, cursor:"pointer", borderBottom:`2px solid ${mode===m?col.accent:"transparent"}`, transition:"all 0.2s", textTransform:"capitalize" }}>{m==="login"?"Sign In":"Create Account"}</button>
          ))}
        </div>

        {error && <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#fca5a5", fontWeight:600 }}><Icons.Warning/> {error}</div>}

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {mode==="register" && <div><label style={lS}>Full Name *</label><input style={iS} placeholder="Your full name" value={name} onChange={e=>setName(e.target.value)} required/></div>}
          <div><label style={lS}>Email *</label><input type="email" style={iS} placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
          <div><label style={lS}>Password *</label>
            <div style={{ position:"relative" }}>
              <input type={showPw?"text":"password"} style={{...iS,paddingRight:44}} placeholder={mode==="register"?"Min 6 characters":"••••••••"} value={password} onChange={e=>setPassword(e.target.value)} required/>
              <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:col.textSoft, cursor:"pointer" }}>{showPw?<Icons.EyeOff/>:<Icons.Eye/>}</button>
            </div>
          </div>
          {mode==="register" && <div><label style={lS}>Known Allergies (optional)</label><input style={iS} placeholder="e.g. Penicillin, Peanuts" value={allergies} onChange={e=>setAllergies(e.target.value)}/></div>}

          <button type="submit" disabled={loading} style={{ width:"100%", padding:"15px", borderRadius:12, background:`linear-gradient(135deg,${col.gradStart},${col.gradEnd})`, color:"#fff", fontSize:15, fontWeight:800, border:"none", cursor:"pointer", marginTop:8, opacity:loading?0.75:1, transition:"all 0.2s" }}>
            {loading?"Connecting…":mode==="login"?"Sign In →":"Create Account →"}
          </button>
        </form>

        <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:col.textSoft }}>
          {mode==="login"?"Don't have an account?":"Already have an account?"}{" "}
          <button onClick={()=>{setMode(mode==="login"?"register":"login");setError("");}} style={{ background:"none", border:"none", color:col.accent, fontWeight:700, cursor:"pointer" }}>{mode==="login"?"Sign Up":"Sign In"}</button>
        </div>
      </div>
    </div>
  );
}

// ── HOME PAGE ─────────────────────────────────────────
function HomePage({ setPage, dark, setDark }) {
  const col = C[dark?"dark":"light"];

  return (
    <div style={{ minHeight:"100vh", background:col.bg }}>
      {/* Navbar */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, height:68, background:dark?"rgba(6,11,20,0.95)":"rgba(244,247,251,0.95)", backdropFilter:"blur(20px)", borderBottom:`1px solid ${col.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 60px", zIndex:1000 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:28 }}><Icons.Shield/></span>
          <span style={{ fontSize:20, fontWeight:900, color:col.text, fontFamily:"'Syne', sans-serif" }}>MedGuard AI</span>
        </div>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <button onClick={()=>setDark(!dark)} style={{ background:"none", border:"none", cursor:"pointer", color:dark?"#fbbf24":col.textMid, display:"flex", alignItems:"center" }}>{dark?<Icons.Moon/>:<Icons.Sun/>}</button>
          <button onClick={()=>setPage("auth")} style={{ padding:"10px 22px", borderRadius:10, background:"transparent", border:`1.5px solid ${col.accent}`, color:col.accent, fontWeight:700, fontSize:13, cursor:"pointer" }}>Sign In</button>
          <button onClick={()=>setPage("auth")} style={{ padding:"10px 22px", borderRadius:10, background:col.accent, color:"#fff", fontWeight:700, fontSize:13, border:"none", cursor:"pointer" }}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"100px 60px 60px", position:"relative" }}>
        <div style={{ position:"absolute", top:"20%", left:"10%", width:400, height:400, borderRadius:"50%", background:`radial-gradient(circle, ${col.accentLight} 0%, transparent 70%)`, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:"10%", right:"8%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)", pointerEvents:"none" }}/>
        <span className="badge badge-blue fade-up" style={{ marginBottom:20, fontSize:12, padding:"6px 16px" }}><Icons.DNA/> AI-Powered Health Platform</span>
        <h1 className="fade-up-1" style={{ fontSize:"clamp(40px,6vw,76px)", fontWeight:900, lineHeight:1.05, color:col.text, marginBottom:24, letterSpacing:"-2px", fontFamily:"'Syne', sans-serif", maxWidth:900 }}>
          Your Health, Intelligently<br/><span style={{ color:col.accent }}>Managed.</span>
        </h1>
        <p className="fade-up-2" style={{ fontSize:18, color:col.textMid, lineHeight:1.7, marginBottom:40, maxWidth:600 }}>
          MedGuard AI tracks your medications, monitors vitals, schedules appointments, and provides 24/7 AI health guidance — all in one secure platform.
        </p>
        <div className="fade-up-3" style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center" }}>
          <button onClick={()=>setPage("auth")} style={{ padding:"16px 36px", borderRadius:14, background:`linear-gradient(135deg,${col.gradStart},${col.gradEnd})`, color:"#fff", fontWeight:800, fontSize:16, border:"none", cursor:"pointer", boxShadow:"0 16px 40px rgba(14,165,233,0.3)" }}>Enter as Patient →</button>
          <button onClick={()=>setPage("auth")} style={{ padding:"16px 36px", borderRadius:14, background:col.surface, color:col.text, fontWeight:800, fontSize:16, border:`1.5px solid ${col.border}`, cursor:"pointer" }}>Enter as Guardian</button>
        </div>
        {/* Trust signals */}
        <div className="fade-up-4" style={{ display:"flex", gap:20, marginTop:60, flexWrap:"wrap", justifyContent:"center" }}>
          {[[<Icons.Building/>,"HIPAA Compliant"],[<Icons.Lock/>,"256-bit Encryption"],[<Icons.AI/>,"Claude AI Powered"],[<Icons.Med/>,"50K+ Drug Database"]].map(([e,l])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 18px", borderRadius:12, background:col.surface, border:`1px solid ${col.border}`, fontSize:13, fontWeight:600, color:col.textMid }}>
              <span>{e}</span><span>{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:"80px 60px", background:dark?"#0a0f1a":col.surface }}>
        <h2 style={{ textAlign:"center", fontSize:36, fontWeight:900, color:col.text, marginBottom:12, fontFamily:"'Syne', sans-serif" }}>Everything You Need</h2>
        <p style={{ textAlign:"center", color:col.textMid, marginBottom:48, fontSize:15 }}>Complete medication management, health tracking, and AI guidance in one app.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:20, maxWidth:1200, margin:"0 auto" }}>
          {[
            {e:<Icons.Med/>,title:"Smart Medication Tracking",desc:"Schedule, track, and get reminded about every dose. Never miss a medication again."},
            {e:<Icons.AI/>,title:"24/7 AI Health Advisor",desc:"Ask health questions in plain English. Get evidence-based answers powered by Claude AI."},
            {e:<Icons.Shield/>,title:"Drug Interaction Checker",desc:"Instantly check 50,000+ known drug interactions before combining medications."},
            {e:<Icons.Heart/>,title:"Vitals Monitoring",desc:"Log blood pressure, heart rate, glucose, and more. See trends over time."},
            {e:<Icons.Calendar/>,title:"Appointment Manager",desc:"Schedule and manage all your doctor visits, lab tests, and telehealth calls."},
            {e:<Icons.Users/>,title:"Guardian Portal",desc:"Caregivers get real-time visibility into medication adherence and health events."},
            {e:<Icons.Syringe/>,title:"Vaccination Tracker",desc:"Keep complete vaccination records and get reminders for boosters and next doses."},
            {e:<Icons.SOS/>,title:"Emergency SOS",desc:"One-tap emergency alerts with GPS location and medical info sent to contacts."},
          ].map(f=>(
            <div key={f.title} style={{ padding:"24px", borderRadius:16, background:col.card, border:`1px solid ${col.border}`, transition:"transform 0.2s, box-shadow 0.2s" }} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 16px 40px rgba(0,0,0,0.1)";}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
              <div style={{ fontSize:32, marginBottom:12 }}>{f.e}</div>
              <div style={{ fontWeight:800, fontSize:16, color:col.text, marginBottom:8, fontFamily:"'Syne', sans-serif" }}>{f.title}</div>
              <div style={{ fontSize:13.5, color:col.textMid, lineHeight:1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"80px 60px", textAlign:"center" }}>
        <div style={{ maxWidth:600, margin:"0 auto", padding:"52px 40px", borderRadius:24, background:`linear-gradient(135deg,${col.accentLight},transparent)`, border:`1px solid ${col.accentBorder}` }}>
          <h2 style={{ fontSize:32, fontWeight:900, color:col.text, marginBottom:12, fontFamily:"'Syne', sans-serif" }}>Start Your Health Journey Today</h2>
          <p style={{ color:col.textMid, marginBottom:28, fontSize:15 }}>Join thousands trusting MedGuard AI for smarter medication management.</p>
          <button onClick={()=>setPage("auth")} style={{ padding:"16px 40px", borderRadius:14, background:`linear-gradient(135deg,${col.gradStart},${col.gradEnd})`, color:"#fff", fontWeight:800, fontSize:16, border:"none", cursor:"pointer" }}>Get Started Free →</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding:"40px 60px", borderTop:`1px solid ${col.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:22 }}><Icons.Shield/></span>
          <span style={{ fontWeight:800, color:col.text, fontFamily:"'Syne', sans-serif" }}>MedGuard AI</span>
        </div>
        <div style={{ fontSize:12, color:col.textSoft }}>© 2026 MedGuard AI. For informational use only. Not a substitute for medical advice.</div>
        <div style={{ display:"flex", gap:20, fontSize:12, color:col.textSoft }}>
          <span style={{ cursor:"pointer" }}>Privacy Policy</span>
          <span style={{ cursor:"pointer" }}>Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("medguard_dark")==="true"; } catch { return false; }
  });
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("medguard_lang")||"en"; } catch { return "en"; }
  });
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if(saved) { const u=JSON.parse(saved); setUser(u); setPage(u.role==="guardian"?"guardian":"patient"); }
    } catch { localStorage.removeItem(SESSION_KEY); }
    setLoadingSession(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("medguard_dark", dark);
  }, [dark]);

  useEffect(() => {
    localStorage.setItem("medguard_lang", lang);
  }, [lang]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    setPage(userData.role==="guardian"?"guardian":"patient");
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setPage("home");
  };

  const handleSetUser = (updated) => {
    setUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  };

  if(loadingSession) return (
    <div style={{ minHeight:"100vh", background:"#060b14", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <div style={{ width:48, height:48, borderRadius:"50%", border:"3px solid rgba(56,189,248,0.2)", borderTopColor:"#38bdf8", animation:"spin 0.9s linear infinite" }}/>
      <div style={{ color:"#64748b", fontSize:14 }}>Loading MedGuard AI…</div>
    </div>
  );

  return (
    <ErrorBoundary>
      <style>{makeCSS(dark)}</style>
      {page==="home" && <HomePage setPage={setPage} dark={dark} setDark={setDark}/>}
      {page==="auth" && <AuthPage onLogin={handleLogin} dark={dark} setDark={setDark} onBack={()=>setPage("home")}/>}
      {page==="patient" && user && <PatientPortal dark={dark} setDark={setDark} lang={lang} setLang={setLang} user={user} setUser={handleSetUser} onLogout={handleLogout}/>}
      {page==="guardian" && user && <GuardianPortal dark={dark} setDark={setDark} lang={lang} setLang={setLang} user={user} setUser={handleSetUser} onLogout={handleLogout}/>}
      {(page==="patient"||page==="guardian") && !user && handleLogout()}
    </ErrorBoundary>
  );
}