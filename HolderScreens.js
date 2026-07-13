// ═══════════════════════════════════════════════════════════
// DAY 6 — Person A (App)
// [REFACTOR] Removed royalty payment fields from Holder screens — only transport licence fee applies
// ═══════════════════════════════════════════════════════════

// Permit Holder screens - home, applications list, permits list and driver management

import { useState, useEffect, useRef } from "react";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn, t } from "./theme";
import { Field, SelectField, StatusBadge, FormSection, AppHeader, BottomNav,
  BackHeader, ScrollBody } from "./uiComponents";
import { MobileSettingsScreen, FAQSection, HOLDER_FAQ, ACTIVITY_CHIP } from "./settingsAndDocs";
import { TripStatusCard, getTripStatus } from "./tripUtils";
import { PermitViewer } from "./PermitViewer";

export function HolderHome({permits,applications,activity,onGoToApps,onGoToPermits,onNewApp,onGoToDrivers,onGoToSettings,language="English",name="Permit Holder"}){
  const activePermits=permits.filter(p=>p.status==="Active").length;
  const pendingApps=applications.filter(a=>a.status==="Pending"||a.status==="Under Review").length;
  const totalQuota=60; const usedQuota=24;
  const quickActions=[
    {icon:"📝",label:t(language,"newApplication"),onClick:onNewApp},
    {icon:"🪪",label:t(language,"myPermits"),onClick:onGoToPermits},
    {icon:"🚛",label:t(language,"drivers"),onClick:onGoToDrivers},
    {icon:"⚙️",label:t(language,"settings"),onClick:onGoToSettings},
  ];

  return(
    <>
      {/* Hero */}
      <div style={{background:`linear-gradient(135deg,${M} 0%,${ML} 100%)`,
        borderRadius:18,padding:"22px 18px 20px",marginBottom:18,
        position:"relative",overflow:"hidden",color:W}}>
        <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,
          borderRadius:"50%",background:"rgba(201,168,76,0.15)"}}/>
        <div style={{position:"relative"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:GL,
            textTransform:"uppercase",marginBottom:4}}>Welcome back</div>
          <div style={{fontSize:20,fontWeight:800,marginBottom:16}}>
            Hello, {name}!
          </div>
          <div style={{display:"flex",gap:10,marginBottom:16}}>
            <div style={{flex:1,background:"rgba(255,255,255,0.14)",borderRadius:12,padding:"12px 14px"}}>
              <div style={{fontSize:22,fontWeight:900}}>{activePermits}</div>
              <div style={{fontSize:11,opacity:0.85,marginTop:2}}>Active Permit{activePermits!==1?"s":""}</div>
            </div>
            <div style={{flex:1,background:"rgba(255,255,255,0.14)",borderRadius:12,padding:"12px 14px"}}>
              <div style={{fontSize:22,fontWeight:900}}>{pendingApps}</div>
              <div style={{fontSize:11,opacity:0.85,marginTop:2}}>Pending Review</div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,opacity:0.85,marginBottom:6}}>
            <span>Monthly sand quota</span>
            <span style={{fontWeight:700}}>{usedQuota}/{totalQuota} cubes</span>
          </div>
          <div style={{height:6,background:"rgba(255,255,255,0.2)",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(usedQuota/totalQuota)*100}%`,
              background:GL,borderRadius:3}}/>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:20,padding:"0 4px"}}>
        {quickActions.map((qa,i)=>(
          <div key={i} onClick={qa.onClick} style={{display:"flex",flexDirection:"column",
            alignItems:"center",gap:7,cursor:"pointer",flex:1}}>
            <div style={{width:50,height:50,borderRadius:15,background:GP,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,
              border:`1px solid ${G}40`}}>
              {qa.icon}
            </div>
            <span style={{fontSize:10.5,fontWeight:700,color:TS,textAlign:"center"}}>{qa.label}</span>
          </div>
        ))}
      </div>

      {/* Active Permit Summary */}
      {permits.filter(p=>p.status==="Active").slice(0,1).map(p=>(
        <div key={p.id} onClick={onGoToPermits} style={{background:W,borderRadius:16,
          padding:"18px",marginBottom:20,boxShadow:"0 2px 14px rgba(0,0,0,0.06)",cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:GR,textTransform:"uppercase",
              letterSpacing:"0.08em"}}>Active Permit</div>
            <span style={{background:"#E5F5EA",color:"#1E8A4C",fontSize:11,fontWeight:700,
              padding:"3px 10px",borderRadius:20}}>Active</span>
          </div>
          <div style={{fontSize:16,fontWeight:800,color:M,marginBottom:2}}>{p.id}</div>
          <div style={{fontSize:11,color:"#9CA3AF",marginBottom:10}}>{p.licenceNo}</div>
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:TS,
            marginBottom:14,lineHeight:1.4}}>
            <span style={{fontWeight:700}}>{p.startPlace}</span>
            <span style={{color:G}}>→</span>
            <span style={{fontWeight:700}}>{p.destination}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,
            color:GR,marginBottom:6}}>
            <span>Trips Used</span>
            <span style={{fontWeight:700,color:TX}}>{p.trips.length} / {p.tripsTotal}</span>
          </div>
          <div style={{height:6,background:"#F3F0EB",borderRadius:3,overflow:"hidden",marginBottom:12}}>
            <div style={{height:"100%",width:`${(p.trips.length/p.tripsTotal)*100}%`,
              background:`linear-gradient(90deg,${M},${G})`,borderRadius:3}}/>
          </div>
          <div style={{display:"inline-flex",fontSize:11,color:TS,background:"#FAF8F5",
            padding:"4px 10px",borderRadius:8,fontWeight:600}}>
            Valid until {p.validTo}
          </div>
          {p.tripInProgress&&(
            <div style={{marginTop:10,fontSize:11.5,fontWeight:700,color:"#1E8A4C"}}>
              🚚 Currently on a ride — open permit to view
            </div>
          )}
        </div>
      ))}

      {/* Recent Activity */}
      <div style={{fontSize:15,fontWeight:800,color:TX,marginBottom:12}}>Recent Activity</div>
      <div style={{background:W,borderRadius:16,boxShadow:"0 2px 14px rgba(0,0,0,0.06)",
        padding:"4px 16px",marginBottom:8}}>
        {activity.map((a,i)=>{
          const chip=ACTIVITY_CHIP[a.icon]||{bg:"#F3F0EB",fg:TS};
          return(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"14px 0",
              borderBottom:i<activity.length-1?"1px solid #F3F0EB":"none"}}>
              <div style={{width:38,height:38,borderRadius:11,background:chip.bg,flexShrink:0,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
                {a.icon}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:TX}}>{a.title}</div>
                <div style={{fontSize:11.5,color:GR,marginTop:2}}>{a.detail}</div>
                <div style={{fontSize:10.5,color:"#9CA3AF",marginTop:3}}>{a.time}</div>
              </div>
              {a.badge&&<StatusBadge status={a.badge}/>}
            </div>
          );
        })}
      </div>

      <FAQSection items={HOLDER_FAQ} language={language}/>
    </>
  );
}

// ── PERMIT HOLDER: Applications Tab ──────────────────────────────
export function HolderApplications({applications,onNewApp,onResubmit,onSubmitPayment,language="English"}){
  const [filter,setFilter]=useState("All");
  const [search,setSearch]=useState("");
  const [payingId,setPayingId]=useState(null);
  const [licenceFeeReceipt,setLicenceFeeReceipt]=useState("");
  const [paymentSlipFile,setPaymentSlipFile]=useState(null);
  const filters=["All","Pending","Awaiting Payment","Payment Submitted","Approved","Rejected"];
  const filtered=applications
    .filter(a=>filter==="All"||a.status===filter)
    .filter(a=>!search||a.id.toLowerCase().includes(search.toLowerCase())||
      (a.vehicleNo&&a.vehicleNo.toLowerCase().includes(search.toLowerCase())));
  return(
    <>
      <div style={{fontSize:18,fontWeight:800,color:TX,margin:"0 0 14px"}}>My Applications</div>
      <button onClick={onNewApp} style={{...baseBtn,background:`linear-gradient(135deg,${M},${ML})`,
        color:W,marginBottom:14,boxShadow:"0 6px 18px rgba(107,26,42,0.35)"}}>
        {t(language,"applyNewPermit")}
      </button>
      {/* Search */}
      <div style={{position:"relative",marginBottom:12}}>
        <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:GR}}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by ID or vehicle number..."
          style={{...baseInput,paddingLeft:38,borderRadius:12,background:"#F3F0EB",border:"none",fontSize:13}}/>
      </div>
      <div style={{display:"flex",gap:8,overflowX:"auto",marginBottom:16,paddingBottom:4}}>
        {filters.map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:"7px 14px",borderRadius:20,
            border:"none",fontSize:12,fontWeight:700,whiteSpace:"nowrap",cursor:"pointer",
            background:filter===f?M:W,color:filter===f?W:GR,
            boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
            {f}
          </button>
        ))}
      </div>
      {filtered.map(a=>{
        const accent={"Approved":"#1E8A4C","Rejected":"#C0392B","Pending":"#9A7B1F",
          "Under Review":G,"Awaiting Payment":"#B8860B","Payment Submitted":"#1E5FA8"}[a.status]||GB;
        return(
        <div key={a.id} style={{background:W,borderRadius:14,padding:"16px 16px 16px 14px",marginBottom:12,
          boxShadow:"0 2px 10px rgba(0,0,0,0.05)",borderLeft:`4px solid ${accent}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:14,fontWeight:800,color:TX}}>{a.id}</div>
            <StatusBadge status={a.status}/>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
            <span style={{fontSize:11,fontWeight:600,color:TS,background:"#F3F0EB",
              padding:"3px 10px",borderRadius:8}}>🏖️ Sand · {a.qty}</span>
            {a.vehicleNo&&(
              <span style={{fontSize:11,fontWeight:600,color:TS,background:"#F3F0EB",
                padding:"3px 10px",borderRadius:8}}>🚛 {a.vehicleNo}</span>
            )}
          </div>
          <div style={{fontSize:11,color:"#9CA3AF"}}>
            Submitted: {a.date}{a.resubmittedAt?" · Resubmitted ↩":""}
          </div>
          {a.status==="Rejected"&&a.rejectionReason&&(
            <div style={{marginTop:10}}>
              <div style={{padding:"10px 12px",background:"#FBEAEA",borderRadius:8,marginBottom:8}}>
                <div style={{fontSize:11,fontWeight:700,color:"#C0392B",marginBottom:4}}>
                  ❌ Reason: {a.rejectionReason}
                </div>
                {a.missingItems&&a.missingItems.length>0&&(
                  <>
                    <div style={{fontSize:11,fontWeight:700,color:"#C0392B",marginBottom:2}}>Please fix:</div>
                    <ul style={{margin:0,paddingLeft:16}}>
                      {a.missingItems.map((m,i)=>(
                        <li key={i} style={{fontSize:11,color:"#5A3A42"}}>{m}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <button onClick={()=>onResubmit(a)} style={{width:"100%",padding:"8px",
                borderRadius:8,border:`1.5px solid ${M}`,background:W,color:M,
                fontSize:12,fontWeight:700,cursor:"pointer"}}>
                📎 Resubmit with Corrections
              </button>
            </div>
          )}
          {a.status==="Awaiting Payment"&&(
            <div style={{marginTop:10}}>
              <div style={{padding:"12px 14px",background:"#FDF3D7",borderRadius:8,marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:700,color:"#9A7B1F",marginBottom:6}}>
                  🎉 Approved! Please pay to receive your permit:
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:800,color:"#9A7B1F"}}>
                  <span>Transport Licence Fee Due</span><span>Rs. 250.00</span>
                </div>
              </div>
              {payingId!==a.id?(
                <button onClick={()=>setPayingId(a.id)} style={{width:"100%",padding:"9px",
                  borderRadius:8,border:"none",background:M,color:W,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  💳 Submit Payment Slip
                </button>
              ):(
                <div style={{background:"#F8F5F0",borderRadius:10,padding:"12px"}}>
                  <Field label="Licence Fee Receipt No." placeholder="e.g. LF-2026-0456"
                    value={licenceFeeReceipt} onChange={e=>setLicenceFeeReceipt(e.target.value)}/>
                  <label style={{display:"block",width:"100%",padding:"9px",
                    borderRadius:8,border:`1.5px dashed ${paymentSlipFile?"#1E8A4C":GB}`,
                    background:paymentSlipFile?"#F0F9F2":"#FAF8F5",color:paymentSlipFile?"#1E8A4C":TS,
                    fontSize:12,fontWeight:600,cursor:"pointer",marginBottom:10,
                    textAlign:"center",boxSizing:"border-box"}}>
                    {paymentSlipFile?`✓ ${paymentSlipFile}`:"📎 Upload Payment Slip (photo or PDF)"}
                    <input type="file" accept="image/*,.pdf" style={{display:"none"}}
                      onChange={e=>setPaymentSlipFile(e.target.files[0]?e.target.files[0].name:null)}/>
                  </label>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>{setPayingId(null);setPaymentSlipFile(null);}}
                      style={{flex:1,padding:"9px",borderRadius:8,border:`1.5px solid ${GB}`,
                        background:W,color:TS,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                      Cancel
                    </button>
                    <button disabled={!licenceFeeReceipt.trim()||!paymentSlipFile}
                      onClick={()=>{
                        onSubmitPayment(a.id,{licenceFeeReceipt,paymentSlipFile});
                        setPayingId(null);setLicenceFeeReceipt("");setPaymentSlipFile(null);
                      }}
                      style={{flex:1,padding:"9px",borderRadius:8,border:"none",
                        background:(!licenceFeeReceipt.trim()||!paymentSlipFile)?"#DDD5C8":M,
                        color:W,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {a.status==="Payment Submitted"&&(
            <div style={{marginTop:10,padding:"10px 12px",background:"#E6F0FA",borderRadius:8,
              fontSize:12,color:"#1E5FA8",fontWeight:600}}>
              ⏳ Payment submitted — awaiting GSMB verification before your permit is issued.
            </div>
          )}
        </div>
        );
      })}
      {filtered.length===0&&(
        <div style={{textAlign:"center",color:"#9CA3AF",fontSize:13,padding:"40px 0"}}>
          No applications in this category.
        </div>
      )}
    </>
  );
}

// ── PERMIT HOLDER: Permits Tab ────────────────────────────────────
export function HolderPermits({permits,myDrivers,onViewPermit,onGoToDrivers,language="English"}){
  const [sendingId,setSendingId]=useState(null);
  const [selectedDriver,setSelectedDriver]=useState("");
  const [sentMap,setSentMap]=useState({});
  const [search,setSearch]=useState("");
  const [showDateFilter,setShowDateFilter]=useState(false);
  const [dateFrom,setDateFrom]=useState("");
  const [dateTo,setDateTo]=useState("");
  const filtered=permits.filter(p=>{
    const matchesSearch=!search||
      p.id.toLowerCase().includes(search.toLowerCase())||
      p.vehicleNo.toLowerCase().includes(search.toLowerCase())||
      p.destination.toLowerCase().includes(search.toLowerCase());
    const issued=new Date(p.issuedDate);
    const matchesFrom=!dateFrom||issued>=new Date(dateFrom);
    const matchesTo=!dateTo||issued<=new Date(dateTo);
    return matchesSearch&&matchesFrom&&matchesTo;
  });
  return(
    <>
      <div style={{fontSize:18,fontWeight:800,color:TX,margin:"0 0 14px"}}>My Permits</div>
      <div style={{position:"relative",marginBottom:10}}>
        <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:GR}}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by permit ID, vehicle or destination..."
          style={{...baseInput,paddingLeft:38,borderRadius:12,background:"#F3F0EB",border:"none",fontSize:13}}/>
      </div>
      <div onClick={()=>setShowDateFilter(s=>!s)} style={{fontSize:12,fontWeight:700,color:M,
        cursor:"pointer",marginBottom:showDateFilter?10:14,display:"inline-flex",alignItems:"center",gap:4}}>
        📅 Filter by issue date {showDateFilter?"▲":"▼"}
      </div>
      {showDateFilter&&(
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <div style={{flex:1}}>
            <label style={{display:"block",fontSize:11,color:GR,marginBottom:4}}>From</label>
            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}
              style={{...baseInput,fontSize:12,padding:"9px 10px"}}/>
          </div>
          <div style={{flex:1}}>
            <label style={{display:"block",fontSize:11,color:GR,marginBottom:4}}>To</label>
            <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}
              style={{...baseInput,fontSize:12,padding:"9px 10px"}}/>
          </div>
        </div>
      )}
      {filtered.map(p=>(
        <div key={p.id} style={{background:W,borderRadius:16,padding:"18px 16px",marginBottom:14,
          boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:M}}>{p.id}</div>
              <div style={{fontSize:11,color:"#9CA3AF"}}>Licence: {p.licenceNo} · Vehicle: {p.vehicleNo}</div>
            </div>
            <StatusBadge status={p.status}/>
          </div>
          <div style={{fontSize:12,color:TS,marginBottom:8,lineHeight:1.5}}>
            <div>{p.startPlace} → {p.destination}</div>
            <div>Sand · {p.qty} {p.unit} · Valid to {p.validTo}</div>
          </div>
          {/* Trip progress */}
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:GR,marginBottom:4}}>
            <span>Trips Used</span>
            <span style={{fontWeight:700,color:TX}}>{p.trips.length}/{p.tripsTotal}</span>
          </div>
          <div style={{height:6,background:"#F3F0EB",borderRadius:3,overflow:"hidden",marginBottom:14}}>
            <div style={{height:"100%",width:`${(p.trips.length/p.tripsTotal)*100}%`,
              background:`linear-gradient(90deg,${M},${G})`,borderRadius:3}}/>
          </div>
          {p.tripInProgress&&(
            <div style={{background:"#E5F5EA",borderRadius:10,padding:"9px 12px",marginBottom:10,
              fontSize:12,fontWeight:700,color:"#1E8A4C"}}>
              🚚 Trip in progress
            </div>
          )}
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <button onClick={()=>onViewPermit(p)} style={{flex:1,padding:"10px",borderRadius:10,
              border:`1.5px solid ${M}`,background:W,color:M,fontSize:12,fontWeight:700,cursor:"pointer"}}>
              {t(language,"viewPermit")}
            </button>
            {!sentMap[p.id]?(
              sendingId===p.id?(
                <div style={{flex:2}}>
                  {myDrivers.length===0?(
                    <div style={{fontSize:12,color:GR,padding:"8px",textAlign:"center"}}>
                      <span style={{color:M,fontWeight:700,cursor:"pointer"}} onClick={onGoToDrivers}>
                        Add drivers first →
                      </span>
                    </div>
                  ):(
                    <>
                      {myDrivers.map(d=>(
                        <div key={d.id} onClick={()=>setSelectedDriver(d.id)} style={{
                          display:"flex",alignItems:"center",gap:10,padding:"8px 10px",
                          borderRadius:10,marginBottom:6,cursor:"pointer",
                          border:`1.5px solid ${selectedDriver===d.id?M:GB}`,
                          background:selectedDriver===d.id?GP:W}}>
                          <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,
                            background:selectedDriver===d.id?M:"#F3F0EB",
                            color:selectedDriver===d.id?W:TS,display:"flex",alignItems:"center",
                            justifyContent:"center",fontSize:12,fontWeight:800}}>
                            {d.name.charAt(0)}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:12,fontWeight:700,color:TX}}>{d.name}</div>
                            <div style={{fontSize:10.5,color:GR}}>{d.id} · NIC: {d.nic}</div>
                          </div>
                          {selectedDriver===d.id&&<span style={{color:M,fontSize:14}}>✓</span>}
                        </div>
                      ))}
                      <div style={{display:"flex",gap:8,marginTop:8}}>
                        <button onClick={()=>{setSendingId(null);setSelectedDriver("");}} style={{flex:1,
                          padding:"8px",borderRadius:8,border:`1.5px solid ${GB}`,background:W,
                          color:GR,fontSize:11,fontWeight:700,cursor:"pointer"}}>Cancel</button>
                        <button disabled={!selectedDriver} onClick={()=>{
                          const d=myDrivers.find(x=>x.id===selectedDriver);
                          setSentMap({...sentMap,[p.id]:d});setSendingId(null);setSelectedDriver("");
                        }} style={{flex:1,padding:"8px",borderRadius:8,border:"none",
                          background:selectedDriver?M:"#DDD5C8",color:W,fontSize:11,
                          fontWeight:700,cursor:selectedDriver?"pointer":"default"}}>Confirm</button>
                      </div>
                    </>
                  )}
                </div>
              ):(
                <button onClick={()=>setSendingId(p.id)} style={{flex:1,padding:"10px",borderRadius:10,
                  border:"none",background:`linear-gradient(135deg,${M},${ML})`,color:W,
                  fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  Send to Driver
                </button>
              )
            ):(
              <div style={{flex:1,padding:"10px",borderRadius:10,background:"#E5F5EA",
                fontSize:12,color:"#1E8A4C",fontWeight:600,textAlign:"center"}}>
                ✓ Sent to {sentMap[p.id].name}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

// ── Drivers tab (search by ID) ────────────────────────────────────
export const DRIVER_DIRECTORY=[
  {id:"DRV-1001",name:"Sunil Fernando",nic:"891234567V"},
  {id:"DRV-1002",name:"Nimal Silva",nic:"882345678V"},
  {id:"DRV-1003",name:"Ruwan Bandara",nic:"903456789V"},
  {id:"DRV-1004",name:"Chamara Jayasinghe",nic:"875678901V"},
];
export function HolderDrivers({myDrivers,setMyDrivers}){
  const [query,setQuery]=useState("");
  const [found,setFound]=useState(null);
  const [err,setErr]=useState("");
  const search=()=>{
    setErr("");setFound(null);
    const q=query.trim().toUpperCase();
    if(!q) return;
    const m=DRIVER_DIRECTORY.find(d=>d.id.toUpperCase()===q);
    if(!m) setErr("No driver found with this ID.");
    else if(myDrivers.some(d=>d.id===m.id)) setErr("Already in your list.");
    else setFound(m);
  };
  return(
    <>
      <div style={{fontSize:18,fontWeight:800,color:TX,margin:"0 0 14px"}}>My Drivers</div>
      <div style={{background:W,borderRadius:14,padding:"16px",marginBottom:16,
        boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
        <div style={{fontSize:13,fontWeight:700,color:TS,marginBottom:10}}>Add Driver by Driver ID</div>
        <div style={{fontSize:12,color:GR,marginBottom:10}}>
          Ask the driver for their Driver ID (e.g. DRV-1001) and enter it below.
        </div>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <input value={query} onChange={e=>{setQuery(e.target.value);setFound(null);setErr("");}}
            placeholder="e.g. DRV-1001" style={{...baseInput,flex:1}}/>
          <button onClick={search} style={{padding:"0 16px",borderRadius:10,border:"none",
            background:M,color:W,fontSize:13,fontWeight:700,cursor:"pointer"}}>Search</button>
        </div>
        {err&&<div style={{fontSize:12,color:"#C0392B"}}>{err}</div>}
        {found&&(
          <div style={{border:`1.5px solid ${GB}`,borderRadius:10,padding:"12px",marginTop:8,
            display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:"50%",flexShrink:0,background:M,
              color:W,display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:15,fontWeight:800}}>
              {found.name.charAt(0)}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:700,color:TX}}>{found.name}</div>
              <div style={{fontSize:11,color:GR}}>ID: {found.id} · NIC: {found.nic}</div>
            </div>
          </div>
        )}
        {found&&(
          <button onClick={()=>{setMyDrivers([...myDrivers,found]);setFound(null);setQuery("");}}
            style={{...baseBtn,background:M,color:W,padding:"10px",marginTop:10}}>
            ✓ Add Driver
          </button>
        )}
      </div>
      {myDrivers.length===0?(
        <div style={{textAlign:"center",color:"#9CA3AF",fontSize:13,padding:"30px 0"}}>
          No drivers added yet.
        </div>
      ):myDrivers.map(d=>(
        <div key={d.id} style={{background:W,borderRadius:12,padding:"12px 16px",marginBottom:10,
          boxShadow:"0 2px 10px rgba(0,0,0,0.05)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}>
            <div style={{width:40,height:40,borderRadius:"50%",flexShrink:0,background:GP,
              color:M,display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:15,fontWeight:800}}>
              {d.name.charAt(0)}
            </div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:13,fontWeight:700,color:TX}}>{d.name}</div>
              <div style={{fontSize:11,color:GR}}>{d.id} · NIC: {d.nic}</div>
            </div>
          </div>
          <span onClick={()=>setMyDrivers(myDrivers.filter(x=>x.id!==d.id))}
            style={{fontSize:12,color:"#C0392B",fontWeight:700,cursor:"pointer",flexShrink:0}}>Remove</span>
        </div>
      ))}
    </>
  );
}

// ── PERMIT HOLDER DASHBOARD ───────────────────────────────────────
