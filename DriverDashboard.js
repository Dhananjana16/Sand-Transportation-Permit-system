// Driver dashboard shell - home, my permits, trip log, profile and settings

import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
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
  const [tripSearch,setTripSearch]=useState("");
  const [profile,setProfile]=useState({
    name:"",email:"",phone:"",nic:"",address:"",licenceNo:"",avatarUrl:"",language:initialLanguage,
  });
  const [avatarUploading,setAvatarUploading]=useState(false);
  const L=(key)=>t(profile.language,key);
  const [notifications,setNotifications]=useState([]);
  const markAllNotificationsRead=()=>setNotifications(prev=>prev.map(n=>({...n,read:true})));

  const loadProfile=async()=>{
    const {data:{user}}=await supabase.auth.getUser();
    if(!user) return;
    const {data,error}=await supabase.from("profiles").select("*").eq("id",user.id).single();
    if(!error&&data) setProfile(prev=>({
      ...prev,
      name:data.full_name||"", email:user.email||"",
      phone:data.phone||"", nic:data.nic||"", address:data.address||"",
      avatarUrl:data.avatar_url||"",
    }));
  };
  useEffect(()=>{ loadProfile(); },[]);

  const uploadAvatar=async(e)=>{
    const file=e.target.files[0];
    if(!file) return;
    setAvatarUploading(true);
    const {data:{user}}=await supabase.auth.getUser();
    const path=`profiles/${user.id}_${Date.now()}_${file.name}`;
    const {error}=await supabase.storage.from("permit-docs").upload(path,file);
    if(error){alert("Upload failed: "+error.message);setAvatarUploading(false);return;}
    const {data:urlData}=supabase.storage.from("permit-docs").getPublicUrl(path);
    await supabase.from("profiles").update({avatar_url:urlData.publicUrl}).eq("id",user.id);
    setProfile(prev=>({...prev,avatarUrl:urlData.publicUrl}));
    setAvatarUploading(false);
  };

  const [permits,setPermits]=useState([]);
  const [loadingPermits,setLoadingPermits]=useState(true);

  const loadPermits=async()=>{
    setLoadingPermits(true);
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){alert("No logged-in user found when loading Driver permits.");setLoadingPermits(false);return;}
    const {data:links,error:linksError}=await supabase.from("permit_drivers").select("permit_id").eq("driver_id",user.id);
    if(linksError){alert("Failed to load permit_drivers: "+linksError.message);setLoadingPermits(false);return;}
    const permitIdList=(links||[]).map(l=>l.permit_id);
    if(permitIdList.length===0){alert(`No permit_drivers rows found for driver id: ${user.id}`);setPermits([]);setLoadingPermits(false);return;}
    const {data,error}=await supabase
      .from("permits").select("*").in("id",permitIdList)
      .order("created_at",{ascending:false});
    if(error){alert("Failed to load permits: "+error.message);setLoadingPermits(false);return;}
    if(!data||data.length===0){alert(`permit_drivers found ${permitIdList.length} link(s), but permits query returned 0 rows.`);setLoadingPermits(false);return;}
    const permitIds=data.map(p=>p.id);
    const {data:tripRows}=permitIds.length
      ?await supabase.from("trips").select("*").in("permit_id",permitIds).order("started_at",{ascending:true})
      :{data:[]};
    const {data:checkpointRows}=permitIds.length
      ?await supabase.from("checkpoints").select("*, profiles(full_name, station)").in("permit_id",permitIds)
      :{data:[]};
    setPermits(data.map(p=>{
      const inProgress=(tripRows||[]).find(t=>t.permit_id===p.id&&t.status==="in_progress");
      return{
        id:p.id, licenceNo:p.licence_no, vehicleNo:p.vehicle_no,
        mineral:p.mineral, qty:p.qty, unit:p.unit,
        holderName:p.holder_name,
        district:p.district,
        startPlace:p.start_place, destination:p.destination,
        via1:p.via1,via2:p.via2,via3:p.via3,via4:p.via4,
        validFrom:p.valid_from, validTo:p.valid_to,
        officerName:p.officer_name, issuedDate:p.issued_date,
        status:p.status, tripsTotal:p.trips_total,
        estimatedTripMinutes:60+([p.via1,p.via2,p.via3,p.via4].filter(Boolean).length+1)*30,
        trips:(tripRows||[]).filter(t=>t.permit_id===p.id&&t.status==="completed").map(t=>{
          const cp=(checkpointRows||[]).find(c=>c.trip_id===t.id);
          return{
            date:t.started_at?new Date(t.started_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"",
            startTime:t.started_at?new Date(t.started_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"",
            endTime:t.ended_at?new Date(t.ended_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"",
            driverName:t.driver_name, destination:t.destination,
            policeOfficer:cp?`${cp.profiles?.full_name||"Officer"}${cp.profiles?.station?" / "+cp.profiles.station:""}`:null,
            status:"Completed",
          };
        }),
        tripInProgress:inProgress?{
          startTime:new Date(inProgress.started_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
          startTimestamp:new Date(inProgress.started_at).getTime(),
          tripRowId:inProgress.id, destination:inProgress.destination,
          driverName:inProgress.driver_name,
          delayReason:inProgress.delay_reason||null,
          proofAttached:!!inProgress.delay_proof_url,
          proofUrl:inProgress.delay_proof_url||null,
        }:null,
      };
    }));
    setLoadingPermits(false);
  };
  useEffect(()=>{ loadPermits(); },[]);

  const updatePermit=(id,fn)=>{
    setPermits(p=>p.map(x=>x.id===id?fn(x):x));
    setSelectedPermit(p=>p&&p.id===id?fn(p):p);
  };

  const startTrip=async(destination)=>{
    const now=new Date();
    const time=now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    const date=now.toLocaleDateString([],{day:"2-digit",month:"short",year:"numeric"});
    const legs=[selectedPermit.via1,selectedPermit.via2,selectedPermit.via3,selectedPermit.via4].filter(Boolean).length+1;
    const {data:{user}}=await supabase.auth.getUser();
    const {data:tripRow,error}=await supabase.from("trips").insert({
      permit_id:selectedPermit.id, driver_id:user?.id, driver_name:profile.name,
      started_at:now.toISOString(), status:"in_progress",
      destination:destination||selectedPermit.destination,
    }).select().single();
    if(error){alert("Failed to start trip: "+error.message);return;}
    updatePermit(selectedPermit.id,p=>({...p,
      estimatedTripMinutes:60+legs*30,
      tripInProgress:{startTime:time,date,startTimestamp:now.getTime(),
        tripRowId:tripRow.id, destination:tripRow.destination,
        driverName:profile.name,delayReason:null,proofAttached:false}}));
    setNotifications(prev=>[{icon:"🚚",title:"Trip Started",
      detail:`${selectedPermit.id} · ${time}`,time:`${date}, ${time}`,read:false},...prev]);
  };

  const endTrip=async()=>{
    if(!selectedPermit?.tripInProgress) return;
    const now=new Date();
    const endTime=now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    const ti=selectedPermit.tripInProgress;
    if(ti?.tripRowId){
      const {error}=await supabase.from("trips").update({
        ended_at:now.toISOString(), status:"completed",
      }).eq("id",ti.tripRowId);
      if(error){alert("Failed to end trip: "+error.message);return;}
      await supabase.from("permits").update({
        trips_used:(selectedPermit.trips?.length||0)+1,
      }).eq("id",selectedPermit.id);
    }
    const endDate=now.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
    updatePermit(selectedPermit.id,p=>{
      const ti=p.tripInProgress;
      if(!ti) return p;
      return{...p,tripInProgress:null,fundRequest:null,trips:[...p.trips,
        {date:ti.date||endDate,qty:p.qty,startTime:ti.startTime,endTime,
          driverName:ti.driverName,policeOfficer:null,status:"Completed"}]};
    });
    setNotifications(prev=>[{icon:"✅",title:"Trip Completed",
      detail:`${selectedPermit.id} · ended ${endTime}`,
      time:endDate+`, ${endTime}`,read:false},...prev]);
  };

  const submitDelayReason=async(permitId,reason,proofFile)=>{
    const permit=permits.find(p=>p.id===permitId);
    const tripRowId=permit?.tripInProgress?.tripRowId;
    let proofUrl=null;
    if(proofFile){
      const path=`delay-proof/${permitId}_${Date.now()}_${proofFile.name}`;
      const {error:uploadError}=await supabase.storage.from("permit-docs").upload(path,proofFile);
      if(uploadError){alert("Failed to upload proof: "+uploadError.message);return;}
      const {data:urlData}=supabase.storage.from("permit-docs").getPublicUrl(path);
      proofUrl=urlData.publicUrl;
    }
    if(tripRowId){
      const {error}=await supabase.from("trips").update({
        delay_reason:reason, ...(proofUrl&&{delay_proof_url:proofUrl}),
      }).eq("id",tripRowId);
      if(error){alert("Failed to submit delay reason: "+error.message);return;}
    }
    updatePermit(permitId,p=>({
      ...p,tripInProgress:{...p.tripInProgress,delayReason:reason,proofAttached:!!proofUrl,proofUrl},
    }));
    setNotifications(prev=>[{icon:"📝",title:"Delay Reason Submitted",
      detail:`${permitId} · ${reason}`,
      time:new Date().toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}),
      read:false},...prev]);
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
      <PhoneFrame language={profile.language}>
        <PermitViewer permit={curr} onBack={()=>setViewingPermit(null)} viewerRole="driver" showQR/>
      </PhoneFrame>
    );
  }

  if(selectedPermit){
    const curr=permits.find(p=>p.id===selectedPermit.id);
    return <PhoneFrame language={profile.language}><DriverPermitDetail permit={curr} onBack={()=>setSelectedPermit(null)}
      onRequestTrip={startTrip} onEndTrip={endTrip} onSubmitDelayReason={submitDelayReason}/></PhoneFrame>;
  }

  if(showSettings) return(
    <PhoneFrame language={profile.language}>
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
    <PhoneFrame language={profile.language}>
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
            <div style={{position:"relative",marginBottom:14}}>
              <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:14}}>🔍</span>
              <input value={tripSearch} onChange={e=>setTripSearch(e.target.value)}
                placeholder="Search by permit ID or destination..."
                style={{...baseInput,paddingLeft:38}}/>
            </div>
            {permits.flatMap(p=>p.trips.map((t,i)=>({...t,permitId:p.id,tripNo:i+1,destination:p.destination})))
              .filter(t=>!tripSearch.trim()||
                t.permitId.toLowerCase().includes(tripSearch.toLowerCase())||
                (t.destination||"").toLowerCase().includes(tripSearch.toLowerCase()))
              .map((t,i)=>(
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
              <label style={{position:"relative",cursor:"pointer",marginBottom:10}}>
                <div style={{width:72,height:72,borderRadius:"50%",overflow:"hidden",
                  background:`linear-gradient(135deg,${M},${ML})`,display:"flex",
                  alignItems:"center",justifyContent:"center",color:W,fontSize:28,fontWeight:800}}>
                  {profile.avatarUrl?
                    <img src={profile.avatarUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:
                    profile.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
                </div>
                <div style={{position:"absolute",bottom:0,right:0,width:22,height:22,borderRadius:"50%",
                  background:M,border:`2px solid ${W}`,display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:11}}>📷</div>
                <input type="file" accept="image/*" style={{display:"none"}} onChange={uploadAvatar}/>
              </label>
              {avatarUploading&&<div style={{fontSize:11,color:GR,marginBottom:4}}>Uploading…</div>}
              <div style={{fontSize:17,fontWeight:800,color:TX}}>{profile.name}</div>
              <div style={{fontSize:12,color:GR}}>Driver</div>
            </div>
            <div style={{background:W,borderRadius:14,padding:"4px 16px",
              boxShadow:"0 2px 10px rgba(0,0,0,0.05)",marginBottom:20}}>
              {[["Full Name",profile.name],["Driver ID",profile.email||"—"],
                ["NIC",profile.nic||"—"],["Email",profile.email],["Phone",profile.phone],
                ["Address",profile.address||"—"],
                ["Driving Licence","Not recorded yet"]
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
