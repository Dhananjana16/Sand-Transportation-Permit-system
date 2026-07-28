// Driver dashboard shell - home, my permits, trip log, profile and settings

import { useState, useEffect, useRef } from "react";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn, t } from "./theme";
import { Field, StatusBadge, AppHeader, BottomNav, BackHeader,
  ScrollBody, QRCode, PhoneFrame } from "./uiComponents";
import { MobileSettingsScreen, FAQSection, DRIVER_FAQ, ACTIVITY_CHIP } from "./settingsAndDocs";
import { useTicker, getTripStatus, fmtMinutes } from "./tripUtils";
import { DriverPermitDetail } from "./DriverPermitDetail";
import { PermitViewer } from "./PermitViewer";

export function DriverDashboard({driverId,onLogout,initialLanguage="English"}){
  const [tab,setTab]=useState("home");
  const [selectedPermit,setSelectedPermit]=useState(null);
  const [viewingPermit,setViewingPermit]=useState(null);
  const [showSettings,setShowSettings]=useState(false);
  const [permitSearch,setPermitSearch]=useState("");
  const [profile,setProfile]=useState({
    name:"Sunil Fernando",email:"sunil.fernando@gmail.com",
    phone:"071 234 5678",language:initialLanguage,
  });
  const L=(key)=>t(profile.language,key);
  const [notifications,setNotifications]=useState([
    {icon:"🪪",title:"Permit Assigned",detail:"PMT-2026-0143 sent to you by Kamal Perera",time:"10 Jun 2026",read:true},
    {icon:"✅",title:"Trip Completed",detail:"PMT-2026-0143 · Trip 1 logged",time:"13 Jun 2026, 11:40 AM",read:false},
    {icon:"👮",title:"Police Checkpoint Logged",detail:"PMT-2026-0143 · Sgt. K. Perera / Badulla",time:"13 Jun 2026, 09:50 AM",read:false},
  ]);
  const markAllNotificationsRead=()=>setNotifications(prev=>prev.map(n=>({...n,read:true})));

  const [permits,setPermits]=useState([{
    id:"PMT-2026-0143",licenceNo:"TL/2026/04521",vehicleNo:"NB-1234",
    mineral:"Sand",qty:"8",unit:"Cubes",
    holderName:"Kamal Perera",holderAddress:"No. 45, Main Street, Badulla",
    miningLicenceNo:"ML/2025/00123",district:"Badulla",
    dsDivision:"Badulla DS Division",gnDivision:"45 - Bandarawela",
    landName:"Galketiya Sand Store",
    startPlace:"Galketiya Sand Store",destination:"Colombo Construction Site",
    via1:"Bandarawela",via2:"Ella",via3:"",via4:"",
    validFrom:"10 Jun 2026",validTo:"09 Jul 2026",
    licenceFeeReceipt:"LF-2026-0456",royaltyReceiptNo:"RR-998877",royaltyAmount:"5000",
    officerName:"Mr. S. Jayawardena",issuedDate:"10 Jun 2026",
    tripsTotal:25,status:"Active",
    tripInProgress:null,
    trips:[
      {date:"13 Jun 2026",qty:"8",startTime:"08:15 AM",endTime:"11:40 AM",
        driverName:"Sunil Fernando",policeOfficer:"Sgt. K. Perera / Badulla",status:"Completed"},
    ],
  }]);

  const updatePermit=(id,fn)=>{
    setPermits(p=>p.map(x=>x.id===id?fn(x):x));
    setSelectedPermit(p=>p&&p.id===id?fn(p):p);
  };

  const startTrip=()=>{
    const now=new Date();
    const time=now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    const date=now.toLocaleDateString([],{day:"2-digit",month:"short",year:"numeric"});
    const legs=[selectedPermit.via1,selectedPermit.via2,selectedPermit.via3,selectedPermit.via4].filter(Boolean).length+1;
    updatePermit(selectedPermit.id,p=>({...p,
      estimatedTripMinutes:60+legs*30,
      tripInProgress:{startTime:time,date,startTimestamp:now.getTime(),
        driverName:profile.name,delayReason:null,proofAttached:false}}));
    setNotifications(prev=>[{icon:"🚚",title:"Trip Started",
      detail:`${selectedPermit.id} · ${time}`,time:`${date}, ${time}`,read:false},...prev]);
  };

  const endTrip=()=>{
    const now=new Date();
    const endTime=now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    updatePermit(selectedPermit.id,p=>{
      const ti=p.tripInProgress;
      return{...p,tripInProgress:null,fundRequest:null,trips:[...p.trips,
        {date:ti.date,qty:p.qty,startTime:ti.startTime,endTime,
          driverName:ti.driverName,policeOfficer:null,status:"Completed"}]};
    });
    setNotifications(prev=>[{icon:"✅",title:"Trip Completed",
      detail:`${selectedPermit.id} · ended ${endTime}`,
      time:now.toLocaleDateString("en-GB",{day:"2-digit",month:"short"})+`, ${endTime}`,read:false},...prev]);
  };

  const navItems=[
    {id:"home",icon:"🏠",label:L("home")},
    {id:"permits",icon:"🪪",label:L("myPermits")},
    {id:"trips",icon:"🚚",label:L("tripLog")},
    {id:"profile",icon:"👤",label:L("profile")},
  ];

  if(viewingPermit){
    const curr=permits.find(p=>p.id===viewingPermit.id)||viewingPermit;
    return(
      <PhoneFrame>
        <PermitViewer permit={curr} onBack={()=>setViewingPermit(null)} viewerRole="driver" showQR/>
      </PhoneFrame>
    );
  }

  if(selectedPermit){
    const curr=permits.find(p=>p.id===selectedPermit.id);
    return <PhoneFrame><DriverPermitDetail permit={curr} onBack={()=>setSelectedPermit(null)}
      onRequestTrip={startTrip} onEndTrip={endTrip}/></PhoneFrame>;
  }

  if(showSettings) return(
    <PhoneFrame>
      <MobileSettingsScreen profile={profile} setProfile={setProfile}
        onBack={()=>setShowSettings(false)} onLogout={onLogout}/>
    </PhoneFrame>
  );

  const titles={
    home:[`Hi, ${profile.name}`,`Driver ID: ${driverId||"DRV-1001"}`],
    permits:[L("myPermits"),"Permits assigned to you"],
    trips:[L("tripLog"),"All recorded trips"],
    profile:[L("profile"),"Account information"],
  };

  return(
    <PhoneFrame>
      <AppHeader title={titles[tab][0]} subtitle={titles[tab][1]} onLogout={onLogout} role="driver"/>
      <div style={{flex:1,padding:"18px 16px 90px",overflowY:"auto",minHeight:0}}>
        {tab==="home"&&(
          <>
            <div style={{background:`linear-gradient(135deg,${M},${ML})`,borderRadius:18,
              padding:"22px 18px 20px",marginBottom:18,position:"relative",overflow:"hidden",color:W}}>
              <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,
                borderRadius:"50%",background:"rgba(201,168,76,0.15)"}}/>
              <div style={{position:"relative"}}>
                <div style={{fontSize:11,fontWeight:700,color:GL,textTransform:"uppercase",
                  letterSpacing:"0.1em",marginBottom:4}}>Welcome back</div>
                <div style={{fontSize:20,fontWeight:800,marginBottom:16}}>Hello, {profile.name}!</div>
                <div style={{display:"flex",gap:10}}>
                  <div style={{flex:1,background:"rgba(255,255,255,0.14)",borderRadius:12,padding:"12px 14px"}}>
                    <div style={{fontSize:22,fontWeight:900}}>{permits.length}</div>
                    <div style={{fontSize:11,opacity:0.85,marginTop:2}}>Permit{permits.length!==1?"s":""} Assigned</div>
                  </div>
                  <div style={{flex:1,background:"rgba(255,255,255,0.14)",borderRadius:12,padding:"12px 14px"}}>
                    <div style={{fontSize:22,fontWeight:900}}>
                      {permits.reduce((sum,p)=>sum+p.trips.length,0)}
                    </div>
                    <div style={{fontSize:11,opacity:0.85,marginTop:2}}>Trips Completed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20,padding:"0 4px"}}>
              {[
                {icon:"🪪",label:L("myPermits"),onClick:()=>setTab("permits")},
                {icon:"🚚",label:L("tripLog"),onClick:()=>setTab("trips")},
                {icon:"👤",label:L("profile"),onClick:()=>setTab("profile")},
                {icon:"⚙️",label:L("settings"),onClick:()=>setShowSettings(true)},
              ].map((qa,i)=>(
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

            {permits.filter(p=>p.status==="Active").slice(0,1).map(p=>(
              <div key={p.id} onClick={()=>setSelectedPermit(p)} style={{background:W,borderRadius:16,
                padding:"18px",marginBottom:20,boxShadow:"0 2px 14px rgba(0,0,0,0.06)",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{fontSize:11,fontWeight:700,color:GR,textTransform:"uppercase"}}>Current Permit</div>
                  <StatusBadge status="Active"/>
                </div>
                <div style={{fontSize:16,fontWeight:800,color:M,marginBottom:10}}>{p.id}</div>
                <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:TS,marginBottom:14}}>
                  <span style={{fontWeight:700}}>{p.startPlace}</span>
                  <span style={{color:G}}>→</span>
                  <span style={{fontWeight:700}}>{p.destination}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:GR,marginBottom:6}}>
                  <span>Trips</span><span style={{fontWeight:700,color:TX}}>{p.trips.length}/{p.tripsTotal}</span>
                </div>
                <div style={{height:6,background:"#F3F0EB",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(p.trips.length/p.tripsTotal)*100}%`,
                    background:`linear-gradient(90deg,${M},${G})`,borderRadius:3}}/>
                </div>
                {p.pendingTrip&&(
                  <div style={{marginTop:12,padding:"10px 12px",background:GP,borderRadius:10,
                    fontSize:12,color:"#9A7B1F",fontWeight:600}}>
                    ⏳ Awaiting holder approval for Trip {p.trips.length+1}
                  </div>
                )}
              </div>
            ))}

            {/* Recent Activity */}
            <div style={{fontSize:15,fontWeight:800,color:TX,marginBottom:12}}>Recent Activity</div>
            <div style={{background:W,borderRadius:16,boxShadow:"0 2px 14px rgba(0,0,0,0.06)",
              padding:"4px 16px",marginBottom:8}}>
              {notifications.map((n,i)=>{
                const chip=ACTIVITY_CHIP[n.icon]||{bg:"#F3F0EB",fg:TS};
                return(
                  <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"14px 0",
                    borderBottom:i<notifications.length-1?"1px solid #F3F0EB":"none"}}>
                    <div style={{width:38,height:38,borderRadius:11,background:chip.bg,flexShrink:0,
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
                      {n.icon}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:TX}}>{n.title}</div>
                      <div style={{fontSize:11.5,color:GR,marginTop:2}}>{n.detail}</div>
                      <div style={{fontSize:10.5,color:"#9CA3AF",marginTop:3}}>{n.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <FAQSection items={DRIVER_FAQ} language={profile.language}/>
          </>
        )}
        {tab==="permits"&&(
          <>
            <div style={{fontSize:18,fontWeight:800,color:TX,margin:"0 0 14px"}}>My Permits</div>
            <div style={{position:"relative",marginBottom:14}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:GR}}>🔍</span>
              <input value={permitSearch} onChange={e=>setPermitSearch(e.target.value)}
                placeholder="Search by permit ID or vehicle..." style={{...baseInput,paddingLeft:38,
                borderRadius:12,background:"#F3F0EB",border:"none",fontSize:13}}/>
            </div>
            {permits.filter(p=>!permitSearch||
              p.id.toLowerCase().includes(permitSearch.toLowerCase())||
              p.vehicleNo.toLowerCase().includes(permitSearch.toLowerCase())||
              p.destination.toLowerCase().includes(permitSearch.toLowerCase())
            ).map(p=>(
              <div key={p.id} style={{background:W,borderRadius:14,
                padding:"14px 16px",marginBottom:10,boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <div style={{fontSize:14,fontWeight:700,color:TX}}>{p.id}</div>
                  <StatusBadge status={p.status==="Active"?"Active":"Approved"}/>
                </div>
                <div style={{fontSize:12,color:GR}}>{p.mineral} · {p.qty} {p.unit} · {p.vehicleNo}</div>
                <div style={{fontSize:12,color:TS,marginTop:4}}>{p.startPlace} → {p.destination}</div>
                <div style={{fontSize:11,color:"#9CA3AF",marginTop:4}}>Trips: {p.trips.length}/{p.tripsTotal} · Valid to {p.validTo}</div>
                <div style={{display:"flex",gap:8,marginTop:10}}>
                  <button onClick={()=>setSelectedPermit(p)} style={{flex:1,padding:"9px",
                    borderRadius:10,border:"none",background:`linear-gradient(135deg,${M},${ML})`,
                    color:W,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                    🚛 Start Trip
                  </button>
                  <button onClick={()=>setViewingPermit(p)} style={{flex:1,padding:"9px",
                    borderRadius:10,border:`1.5px solid ${M}`,background:W,
                    color:M,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                    📄 {L("viewPermit")}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
        {tab==="trips"&&(
          <>
            <div style={{fontSize:18,fontWeight:800,color:TX,margin:"0 0 14px"}}>Trip Log</div>
            {permits.flatMap(p=>p.trips.map((t,i)=>({...t,permitId:p.id,tripNo:i+1}))).map((t,i)=>(
              <div key={i} style={{background:W,borderRadius:14,padding:"12px 16px",marginBottom:10,
                boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:13,fontWeight:700,color:TX}}>{t.permitId} · Trip {t.tripNo}</span>
                  <StatusBadge status={t.status==="Completed"?"Approved":"In Progress"}/>
                </div>
                <div style={{fontSize:12,color:GR}}>{t.date}</div>
                <div style={{fontSize:12,color:TS,marginTop:2}}>
                  Started: {t.startTime}{t.endTime?` · Ended: ${t.endTime}`:" · In progress"}
                </div>
                {t.policeOfficer&&<div style={{fontSize:11,color:GR}}>Checked: {t.policeOfficer}</div>}
              </div>
            ))}
          </>
        )}
        {tab==="profile"&&(
          <>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24}}>
              <div style={{width:72,height:72,borderRadius:"50%",
                background:`linear-gradient(135deg,${M},${ML})`,display:"flex",
                alignItems:"center",justifyContent:"center",color:W,fontSize:28,fontWeight:800,marginBottom:10}}>
                {profile.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div style={{fontSize:17,fontWeight:800,color:TX}}>{profile.name}</div>
              <div style={{fontSize:12,color:GR}}>Driver</div>
            </div>
            <div style={{background:W,borderRadius:14,padding:"4px 16px",
              boxShadow:"0 2px 10px rgba(0,0,0,0.05)",marginBottom:20}}>
              {[["Full Name",profile.name],["Driver ID",driverId||"DRV-1001"],
                ["NIC","891234567V"],["Email",profile.email],["Phone",profile.phone],
                ["Driving Licence","B1234567"]
              ].map(([l,v],i,a)=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"13px 0",
                  borderBottom:i<a.length-1?"1px solid #F3F0EB":"none"}}>
                  <span style={{fontSize:13,color:GR}}>{l}</span>
                  <span style={{fontSize:13,fontWeight:600,color:TX}}>{v}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>setShowSettings(true)} style={{...baseBtn,background:W,color:M,
              border:`1.5px solid ${M}`,marginBottom:10}}>
              ⚙️ Settings
            </button>
            <button onClick={onLogout} style={{...baseBtn,background:W,color:"#C0392B",border:"1.5px solid #FBEAEA"}}>
              Log Out
            </button>
          </>
        )}
      </div>
      <BottomNav items={navItems} active={tab} setActive={setTab}/>
    </PhoneFrame>
  );
}

// ══════════════════════════════════════════════════════════════════
// SANDPASS APP — LOGIN / ROUTER
// ══════════════════════════════════════════════════════════════════
// ── Opening / Splash Screen ───────────────────────────────────────
