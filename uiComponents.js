// ═══════════════════════════════════════════════════════════
// DAY 1 — Person A (App)
// [SETUP] Shared UI components used across all portals: logos, Field, StatusBadge, PhoneFrame, QR code, buttons
// ═══════════════════════════════════════════════════════════

// Logos, form fields, buttons, layout wrappers and navigation bars

import { useState, useEffect, useRef } from "react";
import QRCodeLib from "react-qr-code";
import slEmblem from "./image/sl-emblem.png";
import gsmbLogo from "./image/gsmb-logo.png";
import policeLogo from "./image/police-logo.png";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn, t } from "./theme";

export const SLCrest = ({size=48}) => (
  <div style={{width:size,height:size,borderRadius:"50%",overflow:"hidden",background:W,
    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
    border:`2px solid rgba(201,168,76,0.6)`}}>
    <img src={slEmblem} alt="Sri Lanka Emblem" style={{width:"78%",height:"78%",objectFit:"contain"}}/>
  </div>
);
export const GSMBLogo = ({size=52}) => (
  <div style={{width:size,height:size,borderRadius:"50%",overflow:"hidden",background:W,
    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
    border:`2px solid rgba(201,168,76,0.6)`}}>
    <img src={gsmbLogo} alt="GSMB Logo" style={{width:"85%",height:"85%",objectFit:"contain"}}/>
  </div>
);
export const SandPassLogo = ({size=48}) => (
  <div style={{width:size,height:size,borderRadius:"50%",overflow:"hidden",
    background:`linear-gradient(135deg,${ML},${MD})`,
    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
    border:"2px solid rgba(201,168,76,0.6)"}}>
    <svg width="76%" height="76%" viewBox="0 0 220 120" fill="none">
      <line x1="0" y1="55" x2="30" y2="55" stroke={W} strokeWidth="5" strokeLinecap="round" opacity="0.55"/>
      <line x1="8" y1="66" x2="32" y2="66" stroke={W} strokeWidth="5" strokeLinecap="round" opacity="0.4"/>
      <line x1="16" y1="77" x2="34" y2="77" stroke={W} strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
      <rect x="38" y="18" width="68" height="54" rx="3" fill="none" stroke={W} strokeWidth="6.5"/>
      <line x1="94" y1="18" x2="94" y2="72" stroke={W} strokeWidth="4.5"/>
      <path d="M106 72 L106 36 L124 36 L138 53 L138 72" fill="none" stroke={W} strokeWidth="6.5"
        strokeLinejoin="round" strokeLinecap="round"/>
      <rect x="110" y="40" width="16" height="12" rx="2" fill="none" stroke={W} strokeWidth="4.5"/>
      <path d="M138 72 L138 56 L160 56 L160 72" fill="none" stroke={W} strokeWidth="6.5" strokeLinejoin="round"/>
      <rect x="136" y="72" width="26" height="9" rx="1.5" fill={W}/>
      <line x1="28" y1="79" x2="168" y2="79" stroke={W} strokeWidth="6.5" strokeLinecap="round"/>
      <circle cx="76" cy="88" r="14" fill="none" stroke={W} strokeWidth="6.5"/>
      <circle cx="100" cy="88" r="14" fill="none" stroke={W} strokeWidth="6.5"/>
      <circle cx="150" cy="88" r="14" fill="none" stroke={W} strokeWidth="6.5"/>
    </svg>
  </div>
);
export const PoliceLogo = ({size=52}) => (
  <div style={{width:size,height:size,borderRadius:"50%",overflow:"hidden",background:W,
    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
    border:`2px solid rgba(201,168,76,0.6)`}}>
    <img src={policeLogo} alt="Police Logo" style={{width:"85%",height:"85%",objectFit:"contain"}}/>
  </div>
);

// ─── SHARED COMPONENTS ───────────────────────────────────────────
export function Field({label,type="text",placeholder,value,onChange,accent=M,readOnly=false}){
  const [focused,setFocused]=useState(false);
  return(
    <div style={{marginBottom:16}}>
      <label style={{display:"block",fontSize:13,fontWeight:600,color:TS,marginBottom:6}}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        readOnly={readOnly}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{...baseInput,borderColor:focused?accent:GB,
          boxShadow:focused?`0 0 0 3px ${accent}15`:"none",
          background:readOnly?"#F8F5F0":W}}/>
    </div>
  );
}

export function SelectField({label,value,onChange,options,accent=M}){
  return(
    <div style={{marginBottom:16}}>
      <label style={{display:"block",fontSize:13,fontWeight:600,color:TS,marginBottom:6}}>{label}</label>
      <select value={value} onChange={onChange}
        style={{...baseInput,cursor:"pointer"}}>
        <option value="">Select...</option>
        {options.map(o=><option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function StatusBadge({status}){
  const s={
    "Pending":{bg:"#FDF3D7",color:"#9A7B1F"},
    "Under Review":{bg:"#E6F0FA",color:"#1E5FA8"},
    "Awaiting Payment":{bg:"#FDF3D7",color:"#B8860B"},
    "Payment Submitted":{bg:"#E6F0FA",color:"#1E5FA8"},
    "Approved":{bg:"#E5F5EA",color:"#1E8A4C"},
    "Rejected":{bg:"#FBEAEA",color:"#C0392B"},
    "Active":{bg:"#E5F5EA",color:"#1E8A4C"},
    "Completed":{bg:"#F3F0EB",color:"#6B7280"},
    "Awaiting Approval":{bg:"#FDF3D7",color:"#9A7B1F"},
    "In Progress":{bg:"#E6F0FA",color:"#1E5FA8"},
  }[status]||{bg:"#F3F0EB",color:"#6B7280"};
  return(
    <span style={{background:s.bg,color:s.color,fontSize:11,fontWeight:700,
      padding:"4px 10px",borderRadius:20,whiteSpace:"nowrap"}}>{status}</span>
  );
}

export function FormSection({title,children}){
  return(
    <div style={{background:W,borderRadius:14,padding:"16px",marginBottom:14,
      boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
      <div style={{fontSize:12,fontWeight:800,color:M,marginBottom:14,
        textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:`2px solid ${GP}`,
        paddingBottom:8}}>{title}</div>
      {children}
    </div>
  );
}

export function PhoneFrame({children}){
  return(
    <div className="phone-frame" style={{width:390,height:844,background:OW,display:"flex",flexDirection:"column",
      fontFamily:"'Segoe UI',system-ui,sans-serif",borderRadius:40,
      boxShadow:"0 32px 80px #00000050",overflow:"hidden",position:"relative"}}>
      {children}
    </div>
  );
}

export function AppHeader({title,subtitle,onLogout,role="holder"}){
  return(
    <>
      <div style={{background:MD,padding:"14px 24px 8px",display:"flex",justifyContent:"space-between"}}>
        <span style={{color:W,fontSize:13,fontWeight:700}}>9:41</span>
        <span style={{color:W,fontSize:12}}>📶 🔋</span>
      </div>
      <div style={{background:`linear-gradient(160deg,${MD} 0%,${M} 55%,${ML} 100%)`,
        padding:"20px 24px 28px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",bottom:-50,right:-50,width:180,height:180,
          borderRadius:"50%",background:"rgba(201,168,76,0.10)"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <SLCrest size={40}/>
            <div>
              <div style={{color:GL,fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>
                SandPass · {role==="holder"?"Permit Holder":"Driver"}
              </div>
              <div style={{color:W,fontSize:17,fontWeight:800}}>{title}</div>
              <div style={{color:GL,fontSize:11,opacity:0.85}}>{subtitle}</div>
            </div>
          </div>
          <div onClick={onLogout} style={{width:36,height:36,borderRadius:10,
            background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:14,cursor:"pointer",color:W}}>⎋</div>
        </div>
      </div>
    </>
  );
}

export function BottomNav({items,active,setActive}){
  return(
    <div style={{position:"absolute",bottom:0,left:0,right:0,background:W,
      borderTop:`1px solid #F0EBE3`,display:"flex",justifyContent:"space-around",
      padding:"10px 4px 16px",borderRadius:"0 0 40px 40px"}}>
      {items.map(n=>(
        <div key={n.id} onClick={()=>setActive(n.id)} style={{display:"flex",flexDirection:"column",
          alignItems:"center",gap:2,cursor:"pointer",flex:1}}>
          <span style={{fontSize:17,opacity:active===n.id?1:0.4}}>{n.icon}</span>
          <span style={{fontSize:8.5,fontWeight:700,textAlign:"center",lineHeight:1.2,padding:"0 2px",
            color:active===n.id?M:"#9CA3AF"}}>{n.label}</span>
        </div>
      ))}
    </div>
  );
}

export function BackHeader({title,subtitle,onBack}){
  return(
    <>
      <div style={{background:MD,padding:"14px 24px 8px",display:"flex",justifyContent:"space-between"}}>
        <span style={{color:W,fontSize:13,fontWeight:700}}>9:41</span>
        <span style={{color:W,fontSize:12}}>📶 🔋</span>
      </div>
      <div style={{background:`linear-gradient(160deg,${MD} 0%,${M} 55%,${ML} 100%)`,
        padding:"16px 20px 20px",display:"flex",alignItems:"center",gap:12}}>
        <div onClick={onBack} style={{width:36,height:36,borderRadius:10,
          background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:18,color:W,cursor:"pointer"}}>←</div>
        <div>
          <div style={{color:GL,fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>
            SandPass</div>
          <div style={{color:W,fontSize:17,fontWeight:800}}>{title}</div>
          {subtitle&&<div style={{color:GL,fontSize:11,opacity:0.85}}>{subtitle}</div>}
        </div>
      </div>
    </>
  );
}

export function ScrollBody({children,extraPad=90}){
  return(
    <div style={{flex:1,padding:`18px 16px ${extraPad}px`,overflowY:"auto",minHeight:0}}>
      {children}
    </div>
  );
}

// ── QR Code ──────────────────────────────────────────────────────
export function QRCode({data,size=180}){
  return(
    <div style={{width:size,height:size,background:W,padding:8,borderRadius:12,boxSizing:"border-box"}}>
      <QRCodeLib value={data} size={size-16}
        style={{width:"100%",height:"100%"}} level="M"/>
    </div>
  );
}

// ── Live Trip Tracking (shared by Permit Holder & GSMB) ──────────
// No external map library — a lightweight hand-drawn route visual.
// Once Phase 2 backend + real GPS/routing API is connected, this can be
// swapped for Leaflet + OpenRouteService without changing the surrounding UI.

// ── Responsive helper for web portals (GSMB/Police) ───────────────
// True responsive layout: desktop gets a sidebar dashboard, mobile gets
// a bottom nav — not the same layout squeezed smaller.
export const webInput = {
  padding: "9px 12px", border: "1.5px solid #DDD5C8", borderRadius: 8,
  fontSize: 14, color: "#1A0A0F", background: "#fff", outline: "none",
  fontFamily: "inherit", width: "100%", boxSizing: "border-box",
};

export const webBtn = (bg, color, extra={}) => ({
  padding: "9px 20px", borderRadius: 8, border: "none", fontSize: 13,
  fontWeight: 700, cursor: "pointer", background: bg, color: color, ...extra,
});

export function WebStatusBadge({status}){
  const s={
    "Pending":{bg:"#FDF3D7",color:"#9A7B1F",dot:"#C9A84C"},
    "Under Review":{bg:"#E6F0FA",color:"#1E5FA8",dot:"#3B82F6"},
    "Awaiting Payment":{bg:"#FDF3D7",color:"#B8860B",dot:"#C9A84C"},
    "Payment Submitted":{bg:"#E6F0FA",color:"#1E5FA8",dot:"#3B82F6"},
    "Approved":{bg:"#E5F5EA",color:"#1E8A4C",dot:"#22C55E"},
    "Rejected":{bg:"#FBEAEA",color:"#C0392B",dot:"#EF4444"},
  }[status]||{bg:"#F3F0EB",color:"#6B7280",dot:"#9CA3AF"};
  return(
    <span style={{background:s.bg,color:s.color,fontSize:12,fontWeight:700,
      padding:"4px 12px",borderRadius:20,display:"inline-flex",alignItems:"center",gap:6}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:s.dot,display:"inline-block"}}/>
      {status}
    </span>
  );
}

// ── Settings (shared by GSMB & Police websites) ──────────────────
export function IconField({icon,label,type="text",placeholder,value,onChange}){
  return(
    <div style={{marginBottom:16}}>
      <label style={{display:"block",fontSize:13,fontWeight:600,color:TS,marginBottom:6}}>{label}</label>
      <div style={{position:"relative"}}>
        <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15}}>{icon}</span>
        <input type={type} placeholder={placeholder} value={value} onChange={onChange}
          style={{width:"100%",padding:"13px 14px 13px 42px",border:"1.5px solid #E5EAF0",
            borderRadius:10,fontSize:14,color:TX,background:"#FAFBFC",outline:"none",
            boxSizing:"border-box",fontFamily:"inherit",transition:"border-color 0.2s"}}
          onFocus={e=>e.target.style.borderColor=NV}
          onBlur={e=>e.target.style.borderColor="#E5EAF0"}/>
      </div>
    </div>
  );
}

