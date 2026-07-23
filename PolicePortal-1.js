// ═══════════════════════════════════════════════════════════
// DAY 7 — Person B (Police)
// [POLISH] Splash screen redesign with the real SandPass truck logo and flat brand background color
// ═══════════════════════════════════════════════════════════

// Police portal entry - splash screen, role entry gate, sidebar and mobile nav

import { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";
import slEmblem from "./image/sl-emblem.png";
import policeLogo from "./image/police-logo.png";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn } from "./theme";
import { SLCrest, PoliceLogo, IconField, webInput, webBtn } from "./uiComponents";
import { WebSettingsScreen } from "./settingsAndDocs";
import { useIsDesktop } from "./tripUtils";
import { GSMBPermitDetail } from "./GSMBPermitDetail";
import { PoliceDashboard, PoliceLogin } from "./PoliceDashboardLogin";

export function PoliceSplash({onContinue}){
  const isDesktop=useIsDesktop();
  return(
    <div style={{minHeight:"calc(100vh - 56px)",width:"100%",background:`linear-gradient(160deg,${NV} 0%,${NM} 60%,#1E3A6A 100%)`,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      fontFamily:"'Segoe UI',system-ui,sans-serif",position:"relative",overflow:"hidden",padding:"48px 24px"}}>
      <div style={{position:"absolute",top:-100,right:-100,width:340,height:340,
        borderRadius:"50%",background:"rgba(201,168,76,0.08)"}}/>
      <div style={{display:"flex",alignItems:"center",gap:18,marginBottom:24,position:"relative"}}>
        <SLCrest size={isDesktop?72:48}/>
        <div style={{width:1,height:isDesktop?60:40,background:"rgba(201,168,76,0.4)"}}/>
        <PoliceLogo size={isDesktop?72:48}/>
      </div>
      <div style={{color:G,fontSize:isDesktop?13:11,fontWeight:800,letterSpacing:"0.12em",
        textTransform:"uppercase",marginBottom:14,position:"relative"}}>
        Government of Sri Lanka
      </div>
      <h1 style={{color:W,fontSize:isDesktop?38:24,fontWeight:900,margin:"0 0 10px",
        textAlign:"center",position:"relative"}}>
        Sri Lanka Police
      </h1>
      <div style={{color:"rgba(255,255,255,0.78)",fontSize:isDesktop?15:13,marginBottom:36,
        textAlign:"center",maxWidth:440,position:"relative"}}>
        Sand Transport Enforcement System
      </div>
      <button onClick={onContinue} style={{padding:"15px 44px",borderRadius:10,border:"none",
        background:W,color:NV,fontWeight:700,fontSize:15,cursor:"pointer",position:"relative"}}>
        Enter Officer Portal →
      </button>
      <div style={{color:"rgba(201,168,76,0.6)",fontSize:12,marginTop:28,position:"relative"}}>
        © 2026 Sri Lanka Police · Traffic &amp; Transport Division
      </div>
    </div>
  );
}
export function PoliceEntry(){
  const [step,setStep]=useState("splash");
  const [loginKey,setLoginKey]=useState(0);
  if(step==="splash") return <PoliceSplash onContinue={()=>setStep("login")}/>;
  return <PoliceLogin key={loginKey} onLogout={()=>{setStep("login");setLoginKey(k=>k+1);}}/>;
}

export function PoliceSidebar({activeTab,setActiveTab,onLogout}){
  const items=[
    {id:"scan",icon:"📷",label:"Scan QR"},
    {id:"log",icon:"📋",label:"My Log"},
    {id:"profile",icon:"👤",label:"Profile"},
  ];
  return(
    <div style={{width:252,background:"#fff",borderRight:"1px solid #EDF0F4",
      display:"flex",flexDirection:"column",flexShrink:0,height:"100%"}}>
      <div style={{padding:"22px 20px",display:"flex",alignItems:"center",gap:10,
        borderBottom:"1px solid #F0F3F7",marginBottom:8}}>
        <PoliceLogo size={36}/>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:NV}}>SandPass</div>
          <div style={{fontSize:10.5,color:"#9CA3AF",fontWeight:600}}>Police Portal</div>
        </div>
      </div>
      <div style={{padding:"10px 16px",flex:1}}>
        {items.map(item=>(
          <div key={item.id} onClick={()=>setActiveTab(item.id)} style={{
            display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderRadius:12,
            marginBottom:6,cursor:"pointer",transition:"all 0.15s",
            background:activeTab===item.id?NV:"transparent",
            color:activeTab===item.id?"#fff":"#5A6B7D",
            boxShadow:activeTab===item.id?"0 6px 16px rgba(13,31,60,0.25)":"none",
            fontWeight:activeTab===item.id?700:500,fontSize:14.5}}>
            <span style={{fontSize:18,opacity:activeTab===item.id?1:0.8}}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>
      <div style={{padding:"16px",borderTop:"1px solid #F0F3F7"}}>
        <div onClick={onLogout} style={{display:"flex",alignItems:"center",gap:12,
          padding:"12px 16px",borderRadius:12,cursor:"pointer",color:"#C0392B",
          fontWeight:600,fontSize:14}}>
          <span style={{fontSize:17}}>⎋</span> Sign Out
        </div>
      </div>
    </div>
  );
}

// ── Police Bottom Nav (mobile/phone) ──────────────────────────────
export function PoliceMobileNav({activeTab,setActiveTab}){
  const items=[
    {id:"scan",icon:"📷",label:"Scan"},
    {id:"log",icon:"📋",label:"My Log"},
    {id:"profile",icon:"👤",label:"Profile"},
  ];
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",
      borderTop:"1px solid #E5EAF0",display:"flex",justifyContent:"space-around",
      padding:"8px 4px 10px",boxShadow:"0 -2px 14px rgba(0,0,0,0.08)",zIndex:200}}>
      {items.map(item=>(
        <div key={item.id} onClick={()=>setActiveTab(item.id)} style={{
          display:"flex",flexDirection:"column",alignItems:"center",gap:2,
          cursor:"pointer",flex:1,padding:"2px 0"}}>
          <span style={{fontSize:18,opacity:activeTab===item.id?1:0.45}}>{item.icon}</span>
          <span style={{fontSize:9.5,fontWeight:700,
            color:activeTab===item.id?NV:"#9CA3AF"}}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
