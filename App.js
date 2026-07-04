// ═══════════════════════════════════════════════════════════
// DAY 1 — Person A (App)
// [SETUP] Top-level screen switcher between SandPass App, GSMB Portal, Police Portal
// ═══════════════════════════════════════════════════════════

// Top-level app switcher - choose between SandPass app, GSMB portal, Police portal

import { useState } from "react";
import { M, W, G } from "./theme";
import { SandPassApp } from "./SandPassApp";
import { GSMBEntry } from "./GSMBDashboard";
import { PoliceEntry } from "./PolicePortal";

export default function App(){
  const [screen,setScreen]=useState("app");
  const screens=[
    {id:"app",label:"📱 SandPass App"},
    {id:"gsmb",label:"🏛️ GSMB Portal"},
    {id:"police",label:"🚔 Police Portal"},
  ];
  const isWebPortal=screen==="gsmb"||screen==="police";
  return(
    <div style={{minHeight:"100vh",background:isWebPortal?"#fff":"#111",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div className="no-print" style={{background:"#0A0A0A",borderBottom:"1px solid #2A2A2A",padding:"12px 24px",
        display:"flex",alignItems:"center",gap:8,height:56,boxSizing:"border-box"}}>
        <span style={{color:G,fontWeight:800,fontSize:14,marginRight:16}}>SandPass · UI Preview</span>
        {screens.map(s=>(
          <button key={s.id} onClick={()=>setScreen(s.id)} style={{padding:"7px 18px",borderRadius:8,
            border:"none",cursor:"pointer",fontSize:13,fontWeight:600,
            background:screen===s.id?M:"#2A2A2A",color:screen===s.id?W:"#888"}}>
            {s.label}
          </button>
        ))}
      </div>
      {screen==="gsmb"&&<GSMBEntry/>}
      {screen==="police"&&<PoliceEntry/>}
      {screen==="app"&&(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",
          padding:"48px 24px",minHeight:"calc(100vh - 56px)"}}>
          <SandPassApp/>
        </div>
      )}
    </div>
  );
}
