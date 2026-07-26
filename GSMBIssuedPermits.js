// ═══════════════════════════════════════════════════════════
// DAY 8 — Person C (GSMB)
// [FIX] Updated imports after the App.js split
// ═══════════════════════════════════════════════════════════

// GSMB issued permits list - search, filter and view issued Form 7 permits

import { useState, useEffect } from "react";
import slEmblem from "./image/sl-emblem.png";
import gsmbLogo from "./image/gsmb-logo.png";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn, t } from "./theme";
import { webBtn, webInput } from "./uiComponents";
import { useIsDesktop } from "./tripUtils";
import { GSMBPermitDetail } from "./GSMBPermitDetail";

export function GSMBIssuedPermits({permits,initialViewId=null}){
  const [search,setSearch]=useState("");
  const [viewPermitId,setViewPermitId]=useState(initialViewId);
  const [dateFrom,setDateFrom]=useState("");
  const [dateTo,setDateTo]=useState("");
  const filtered=permits.filter(p=>{
    const matchesSearch=!search||
      p.id.toLowerCase().includes(search.toLowerCase())||
      p.holderName.toLowerCase().includes(search.toLowerCase())||
      p.vehicleNo.toLowerCase().includes(search.toLowerCase());
    const issued=new Date(p.issuedDate);
    const matchesFrom=!dateFrom||issued>=new Date(dateFrom);
    const matchesTo=!dateTo||issued<=new Date(dateTo);
    return matchesSearch&&matchesFrom&&matchesTo;
  });
  const viewPermit=viewPermitId?permits.find(p=>p.id===viewPermitId):null;

  if(viewPermit) return <GSMBPermitDetail permit={viewPermit} onBack={()=>setViewPermitId(null)}/>;

  return(
    <div>
      <h2 style={{fontSize:22,fontWeight:800,color:"#1A0A0F",margin:"0 0 6px"}}>Issued Permits</h2>
      <p style={{fontSize:14,color:"#6B7280",margin:"0 0 16px"}}>
        {filtered.length} of {permits.length} permit{permits.length!==1?"s":""} issued
        {(dateFrom||dateTo)?" — date filtered":""}
      </p>
      <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap",alignItems:"flex-end"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by permit ID, holder or vehicle..."
          style={{...webInput,maxWidth:300}}/>
        <div>
          <label style={{display:"block",fontSize:11,color:"#6B7280",marginBottom:4}}>Issued from</label>
          <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{...webInput,width:150}}/>
        </div>
        <div>
          <label style={{display:"block",fontSize:11,color:"#6B7280",marginBottom:4}}>Issued to</label>
          <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{...webInput,width:150}}/>
        </div>
        {(dateFrom||dateTo)&&(
          <button onClick={()=>{setDateFrom("");setDateTo("");}} style={webBtn("#F3F0EB","#5A3A42")}>
            Clear Dates
          </button>
        )}
      </div>
      <div style={{background:"#fff",borderRadius:14,boxShadow:"0 2px 10px rgba(0,0,0,0.05)",overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:600}}>
          <thead>
            <tr style={{background:"#FAF8F5"}}>
              {["Permit No.","Holder","Vehicle","Issued Date","Valid To","Trips","Action"].map(h=>(
                <th key={h} style={{padding:"12px 14px",textAlign:"left",fontWeight:700,
                  color:"#5A3A42",borderBottom:"2px solid #F0EBE3"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p,i)=>(
              <tr key={p.id} style={{borderBottom:"1px solid #F8F5F0",background:i%2===0?"#fff":"#FAFAF8"}}>
                <td style={{padding:"12px 14px",fontWeight:700,color:"#6B1A2A"}}>{p.id}</td>
                <td style={{padding:"12px 14px"}}>{p.holderName}</td>
                <td style={{padding:"12px 14px"}}>{p.vehicleNo}</td>
                <td style={{padding:"12px 14px",color:"#6B7280"}}>{p.issuedDate}</td>
                <td style={{padding:"12px 14px"}}>{p.validTo}</td>
                <td style={{padding:"12px 14px"}}>{(p.trips||[]).length}/{p.tripsTotal}</td>
                <td style={{padding:"12px 14px"}}>
                  <button onClick={()=>setViewPermitId(p.id)}
                    style={webBtn("#6B1A2A","#fff",{fontSize:12})}>View</button>
                </td>
              </tr>
            ))}
            {filtered.length===0&&(
              <tr><td colSpan={7} style={{padding:"40px",textAlign:"center",color:"#9CA3AF"}}>
                No permits found.
              </td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ── GSMB FULL DASHBOARD ───────────────────────────────────────────
