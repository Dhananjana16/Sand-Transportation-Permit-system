// ═══════════════════════════════════════════════════════════
// DAY 2 — Person C (GSMB)
// [FEATURE] GSMB website navbar, sidebar and mobile hamburger menu
// ═══════════════════════════════════════════════════════════

// GSMB website navigation - navbar, sidebar and mobile hamburger menu

import { useState, useEffect } from "react";
import slEmblem from "./image/sl-emblem.png";
import gsmbLogo from "./image/gsmb-logo.png";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn, t } from "./theme";
import { GSMBLogo, webBtn } from "./uiComponents";
import { useIsDesktop } from "./tripUtils";
import { GSMBPermitDetail } from "./GSMBPermitDetail";

export const gsmbNavItems=(counts)=>[
  {id:"dashboard", icon:"📊", label:"Dashboard"},
  {id:"all", icon:"📋", label:"All Applications", count:counts.total},
  {id:"pending", icon:"⏳", label:"Pending Review", count:counts.pending},
  {id:"paymentReview", icon:"💳", label:"Payment Review", count:counts.paymentReview},
  {id:"approved", icon:"✅", label:"Approved", count:counts.approved},
  {id:"rejected", icon:"❌", label:"Rejected", count:counts.rejected},
  {id:"permits", icon:"🪪", label:"Issued Permits"},
  {id:"settings", icon:"⚙️", label:"Settings"},
];

// ── GSMB Sidebar (desktop) ─────────────────────────────────────────
export function GSMBNavbar({onLogout,officerName="W.A.C.A. Madhushika",isDesktop=true,onMenuToggle}){
  return(
    <div style={{background:"#4E1120",display:"flex",alignItems:"center",
      justifyContent:"space-between",padding:isDesktop?"0 36px":"0 16px",height:72,flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:isDesktop?16:10,minWidth:0}}>
        {!isDesktop&&(
          <button onClick={onMenuToggle} style={{background:"rgba(255,255,255,0.12)",border:"none",
            borderRadius:8,width:34,height:34,color:"#fff",fontSize:16,cursor:"pointer",flexShrink:0}}>
            ☰
          </button>
        )}
        <img src={gsmbLogo} alt="GSMB" style={{width:46,height:46,borderRadius:"50%",
          border:"2px solid rgba(201,168,76,0.6)",background:"#fff",objectFit:"contain",flexShrink:0}}/>
        <div style={{minWidth:0}}>
          <div style={{color:"#C9A84C",fontSize:11,fontWeight:800,letterSpacing:"0.12em",textTransform:"uppercase"}}>
            GSMB · Regional Office
          </div>
          {isDesktop&&<div style={{color:"#fff",fontSize:17,fontWeight:800}}>Sand Permit Management System</div>}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:18}}>
        {isDesktop&&<span style={{color:"rgba(255,255,255,0.7)",fontSize:14}}>Officer: {officerName}</span>}
        <button onClick={onLogout} style={webBtn("rgba(255,255,255,0.12)","#fff",{fontSize:13,padding:"9px 18px"})}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function GSMBSidebar({activeSection,setActiveSection,counts}){
  const items=gsmbNavItems(counts);
  return(
    <div style={{width:248,background:"#fff",borderRight:"1px solid #EEE8E0",
      display:"flex",flexDirection:"column",flexShrink:0}}>
      <div style={{padding:"24px 18px"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#9CA3AF",letterSpacing:"0.1em",
          textTransform:"uppercase",marginBottom:14}}>Navigation</div>
        {items.map(item=>(
          <div key={item.id} onClick={()=>setActiveSection(item.id)} style={{
            display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"13px 14px",borderRadius:10,marginBottom:5,cursor:"pointer",
            background:activeSection===item.id?"#FDF3D7":"transparent",
            color:activeSection===item.id?"#6B1A2A":"#5A3A42",
            fontWeight:activeSection===item.id?700:500,fontSize:14.5,
          }}>
            <div style={{display:"flex",alignItems:"center",gap:11}}>
              <span style={{fontSize:18}}>{item.icon}</span>
              {item.label}
            </div>
            {item.count!==undefined&&(
              <span style={{background:activeSection===item.id?"#6B1A2A":"#F3F0EB",
                color:activeSection===item.id?"#fff":"#6B7280",
                fontSize:11.5,fontWeight:700,padding:"3px 9px",borderRadius:10}}>
                {item.count}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── GSMB Mobile Menu (overlay, replaces sidebar on phone) ─────────
export function GSMBMobileMenu({activeSection,setActiveSection,counts,onClose}){
  const items=gsmbNavItems(counts);
  return(
    <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(20,10,15,0.45)"}}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"0 0 16px 16px",
        padding:"12px 12px 16px",boxShadow:"0 10px 30px rgba(0,0,0,0.3)",maxHeight:"80vh",overflowY:"auto"}}>
        {items.map(item=>(
          <div key={item.id} onClick={()=>{setActiveSection(item.id);onClose();}} style={{
            display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"13px 14px",borderRadius:10,marginBottom:4,cursor:"pointer",
            background:activeSection===item.id?"#FDF3D7":"transparent",
            color:activeSection===item.id?"#6B1A2A":"#5A3A42",
            fontWeight:activeSection===item.id?700:500,fontSize:14,
          }}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:17}}>{item.icon}</span>
              {item.label}
            </div>
            {item.count!==undefined&&(
              <span style={{background:activeSection===item.id?"#6B1A2A":"#F3F0EB",
                color:activeSection===item.id?"#fff":"#6B7280",
                fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:10}}>
                {item.count}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dashboard overview ────────────────────────────────────────────
