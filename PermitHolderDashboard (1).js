// Permit Holder dashboard shell - routes between all Holder screens

import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn, t } from "./theme";
import { AppHeader, BottomNav, PhoneFrame } from "./uiComponents";
import { MobileSettingsScreen } from "./settingsAndDocs";
import { getTripStatus } from "./tripUtils";
import { ApplicationForm } from "./ApplicationForm";
import { HolderHome, HolderApplications, HolderPermits, HolderDrivers } from "./HolderScreens";
import { PermitViewer } from "./PermitViewer";

// Converts a database row (snake_case) into the flat camelCase shape this
// screen already expects (qty as a combined "8 Cubes" string, flat doc flags)
function mapApplicationFromDB(row){
  return {
    id:row.id, status:row.status,
    qty:`${row.qty} ${row.unit}`, qty_raw:row.qty, unit:row.unit,
    vehicleNo:row.vehicle_no,
    date:row.submitted_date,
    rejectionReason:row.rejection_reason, missingItems:row.missing_items||[],
    applicantName:row.applicant_name, nic:row.nic, address:row.address, phone:row.phone,
    mineral:row.mineral, miningLicenceNo:row.mining_licence_no, licenceType:row.licence_type,
    district:row.district, dsDivision:row.ds_division, gnDivision:row.gn_division,
    village:row.village, landName:row.land_name, purpose:row.purpose,
    transportFrom:row.transport_from, transportTo:row.transport_to, vehicleType:row.vehicle_type,
    startPlace:row.start_place, via1:row.via1, via2:row.via2, via3:row.via3, via4:row.via4,
    destination:row.destination, destinationAddress:row.destination_address,
    royaltyReceiptNo:row.royalty_receipt_no, royaltyAmount:row.royalty_amount,
    licenceFeeReceipt:row.licence_fee_receipt,
    docsLicence:!!row.docs_licence_url, docsNIC:!!row.docs_nic_url,
    docsRoyalty:false, docsPayslip:false,
  };
}

export function PermitHolderDashboard({holderId,onLogout,initialLanguage="English"}){
  const [tab,setTab]=useState("home");
  const [myDrivers,setMyDrivers]=useState([]);
  const loadMyDrivers=async()=>{
    const {data:{user}}=await supabase.auth.getUser();
    if(!user) return;
    const {data,error}=await supabase
      .from("holder_drivers").select("driver_id, profiles(full_name, nic, email, username)")
      .eq("holder_id",user.id);
    if(!error&&data) setMyDrivers(data.map(d=>({
      id:d.driver_id, name:d.profiles?.full_name||"Unknown", nic:d.profiles?.nic||"",
      email:d.profiles?.email||"", username:d.profiles?.username||"",
    })));
  };
  useEffect(()=>{ loadMyDrivers(); },[]);
  const [viewingPermit,setViewingPermit]=useState(null);
  const [showAppForm,setShowAppForm]=useState(false);
  const [editingApp,setEditingApp]=useState(null);
  const [showSettings,setShowSettings]=useState(false);
  const [profile,setProfile]=useState({
    name:"",email:"",phone:"",nic:"",address:"",avatarUrl:"",language:initialLanguage,
  });
  const [avatarUploading,setAvatarUploading]=useState(false);
  const L=(key)=>t(profile.language,key);

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

  const [applications,setApplications]=useState([]);
  const [loadingApps,setLoadingApps]=useState(true);
  const [currentUserId,setCurrentUserId]=useState(null);

  const loadApplications=async()=>{
    setLoadingApps(true);
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){setLoadingApps(false);return;}
    setCurrentUserId(user.id);
    const {data,error}=await supabase
      .from("applications")
      .select("*")
      .eq("applicant_id",user.id)
      .order("created_at",{ascending:false});
    if(!error&&data) setApplications(data.map(mapApplicationFromDB));
    setLoadingApps(false);
  };
  useEffect(()=>{ loadApplications(); },[]);

  const [permits,setPermits]=useState([]);
  const [loadingPermits,setLoadingPermits]=useState(true);

  const loadPermits=async()=>{
    setLoadingPermits(true);
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){setLoadingPermits(false);return;}
    const {data,error}=await supabase
      .from("permits").select("*").eq("holder_id",user.id)
      .order("created_at",{ascending:false});
    if(error){alert("Failed to load permits: "+error.message);setLoadingPermits(false);return;}
    if(!data||data.length===0){setPermits([]);setLoadingPermits(false);return;}
    const permitIds=data.map(p=>p.id);
    const {data:tripRows}=await supabase.from("trips").select("*").in("permit_id",permitIds).order("started_at",{ascending:true});
    const {data:checkpointRows}=await supabase.from("checkpoints").select("*, profiles(full_name, station)").in("permit_id",permitIds);
    const {data:permitDriverRows}=await supabase.from("permit_drivers")
      .select("permit_id, driver_id, profiles(full_name, username)").in("permit_id",permitIds);
    setPermits(data.map(p=>({
      id:p.id, licenceNo:p.licence_no, vehicleNo:p.vehicle_no,
      mineral:p.mineral, qty:p.qty, unit:p.unit,
      holderName:p.holder_name,
      district:p.district,
      startPlace:p.start_place, destination:p.destination,
      via1:p.via1,via2:p.via2,via3:p.via3,via4:p.via4,
      validFrom:p.valid_from, validTo:p.valid_to,
      officerName:p.officer_name, issuedDate:p.issued_date,
      status:p.status, tripsTotal:p.trips_total,
      trips:(tripRows||[]).filter(t=>t.permit_id===p.id).map(t=>{
        const cp=(checkpointRows||[]).find(c=>c.trip_id===t.id);
        return{
          date:t.started_at?new Date(t.started_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"",
          qty:p.qty, destination:t.destination,
          startTime:t.started_at?new Date(t.started_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"",
          endTime:t.ended_at?new Date(t.ended_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"",
          driverName:t.driver_name, holderApproved:true,
          status:t.status==="completed"?"Completed":"In Progress",
          policeOfficer:cp?`${cp.profiles?.full_name||"Officer"}${cp.profiles?.station?" / "+cp.profiles.station:""}`:null,
        };
      }),
      pendingTrip:null,
      estimatedTripMinutes:60+([p.via1,p.via2,p.via3,p.via4].filter(Boolean).length+1)*30,
      tripInProgress:(tripRows||[]).find(t=>t.permit_id===p.id&&t.status==="in_progress")?{
        startTime:new Date((tripRows||[]).find(t=>t.permit_id===p.id&&t.status==="in_progress").started_at)
          .toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
        startTimestamp:new Date((tripRows||[]).find(t=>t.permit_id===p.id&&t.status==="in_progress").started_at).getTime(),
        tripRowId:(tripRows||[]).find(t=>t.permit_id===p.id&&t.status==="in_progress").id,
        driverName:(tripRows||[]).find(t=>t.permit_id===p.id&&t.status==="in_progress").driver_name,
        delayReason:(tripRows||[]).find(t=>t.permit_id===p.id&&t.status==="in_progress").delay_reason||null,
        proofAttached:!!(tripRows||[]).find(t=>t.permit_id===p.id&&t.status==="in_progress").delay_proof_url,
        proofUrl:(tripRows||[]).find(t=>t.permit_id===p.id&&t.status==="in_progress").delay_proof_url||null,
        destination:(tripRows||[]).find(t=>t.permit_id===p.id&&t.status==="in_progress").destination,
      }:null,
      fundRequest:null,
      assignedDriverIds:(permitDriverRows||[]).filter(pd=>pd.permit_id===p.id).map(pd=>pd.driver_id),
      assignedDriverNames:(permitDriverRows||[]).filter(pd=>pd.permit_id===p.id).map(pd=>pd.profiles?.full_name).filter(Boolean),
    })));
    setLoadingPermits(false);
  };
  useEffect(()=>{ loadPermits(); },[]);



  const [notifications,setNotifications]=useState([
    {icon:"✅",title:"Trip Completed",detail:"PMT-2026-0143 · Trip 1 · Driver: Sunil Fernando",time:"13 Jun 2026, 11:40 AM",read:false},
    {icon:"🚚",title:"Trip Started",detail:"PMT-2026-0143 · Trip 1 · Vehicle: NB-1234",time:"13 Jun 2026, 08:15 AM",read:false},
    {icon:"🪪",title:"Permit Issued",detail:"PMT-2026-0143 · Sand · 8 Cubes",time:"10 Jun 2026",badge:"Approved",read:true},
    {icon:"📄",title:"APP-2026-0143",detail:"Application approved by GSMB",time:"10 Jun 2026",badge:"Approved",read:true},
  ]);
  const markAllNotificationsRead=()=>setNotifications(prev=>prev.map(n=>({...n,read:true})));

  const submitPaymentSlip=async(appId,paymentInfo)=>{
    let paymentSlipUrl=null;
    if(paymentInfo.paymentSlipFile){
      const path=`payment-slips/${appId}_${Date.now()}_${paymentInfo.paymentSlipFile.name}`;
      const {error:uploadError}=await supabase.storage.from("permit-docs").upload(path,paymentInfo.paymentSlipFile);
      if(uploadError){alert("Failed to upload payment slip: "+uploadError.message);return;}
      const {data:urlData}=supabase.storage.from("permit-docs").getPublicUrl(path);
      paymentSlipUrl=urlData.publicUrl;
    }
    const {error}=await supabase.from("applications").update({
      status:"Payment Submitted",
      licence_fee_receipt:paymentInfo.licenceFeeReceipt,
      payment_slip_url:paymentSlipUrl,
    }).eq("id",appId);
    if(error){alert("Failed to submit payment: "+error.message);return;}
    setApplications(prev=>prev.map(a=>a.id===appId?{
      ...a,status:"Payment Submitted",
      licenceFeeReceipt:paymentInfo.licenceFeeReceipt,
      paymentSlipUrl,
    }:a));
    setNotifications(prev=>[{icon:"💳",title:"Payment Slip Submitted",
      detail:`${appId} · awaiting GSMB verification`,
      time:new Date().toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}),
      read:false},...prev]);
  };

  // Watch active rides and notify the holder the moment one runs late
  useEffect(()=>{
    const check=()=>{
      setPermits(prev=>prev.map(p=>{
        if(!p.tripInProgress||p.tripInProgress.notifiedLate) return p;
        const status=getTripStatus(p.tripInProgress,p.estimatedTripMinutes);
        if(status&&status.delayed){
          setNotifications(n=>[{icon:"⚠️",title:"Ride Running Late",
            detail:`${p.id} is running behind its estimated schedule`,
            time:new Date().toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}),
            read:false},...n]);
          return {...p,tripInProgress:{...p.tripInProgress,notifiedLate:true,lateSince:Date.now()}};
        }
        return p;
      }));
    };
    check();
    const id=setInterval(check,15000);
    return ()=>clearInterval(id);
  },[]);

  const navItems=[
    {id:"home",icon:"🏠",label:L("home")},
    {id:"applications",icon:"📄",label:L("applications")},
    {id:"permits",icon:"🪪",label:L("permits")},
    {id:"drivers",icon:"🚛",label:L("drivers")},
    {id:"profile",icon:"👤",label:L("profile")},
  ];

  const titles={
    home:[`Hi, ${profile.name}`,`Permit Holder ID: ${holderId||"PH-20245"}`],
    applications:[L("applications"),"Track your submitted applications"],
    permits:[L("myPermits"),"Approved permits & trip log"],
    drivers:[L("drivers"),"Manage your driver list"],
    profile:[L("profile"),"Account information"],
  };

  // Special screens
  if(showAppForm) return(
    <PhoneFrame language={profile.language}>
      <ApplicationForm
        onBack={()=>{setShowAppForm(false);setEditingApp(null);}}
        initialData={editingApp?{
          applicantName:editingApp.applicantName,nic:editingApp.nic,address:editingApp.address,
          phone:editingApp.phone,mineral:editingApp.mineral,qty:editingApp.qty_raw,unit:editingApp.unit,
          miningLicenceNo:editingApp.miningLicenceNo,licenceType:editingApp.licenceType,
          district:editingApp.district,dsDivision:editingApp.dsDivision,gnDivision:editingApp.gnDivision,
          village:editingApp.village,landName:editingApp.landName,
          purpose:editingApp.purpose,transportFrom:editingApp.transportFrom,transportTo:editingApp.transportTo,
          vehicleNo:editingApp.vehicleNo,vehicleType:editingApp.vehicleType,
          startPlace:editingApp.startPlace,via1:editingApp.via1,via2:editingApp.via2,
          via3:editingApp.via3,via4:editingApp.via4,
          destination:editingApp.destination,destinationAddress:editingApp.destinationAddress,
          royaltyReceiptNo:editingApp.royaltyReceiptNo,royaltyAmount:editingApp.royaltyAmount,
          licenceFeeReceipt:editingApp.licenceFeeReceipt,
          docsLicence:editingApp.docsLicence,docsRoyalty:editingApp.docsRoyalty,
          docsPayslip:editingApp.docsPayslip,docsNIC:editingApp.docsNIC,
        }:undefined}
        rejectionInfo={editingApp?{reason:editingApp.rejectionReason,missingItems:editingApp.missingItems}:undefined}
        onSubmit={async(f)=>{
          const dbRow={
            status:"Pending",
            applicant_name:f.applicantName, nic:f.nic, address:f.address, phone:f.phone,
            mineral:f.mineral, qty:f.qty, unit:f.unit,
            licence_type:f.licenceType, mining_licence_no:f.miningLicenceNo,
            district:f.district, ds_division:f.dsDivision, gn_division:f.gnDivision,
            village:f.village, land_name:f.landName, purpose:f.purpose,
            transport_from:f.transportFrom||null, transport_to:f.transportTo||null,
            vehicle_no:f.vehicleNo, vehicle_type:f.vehicleType,
            start_place:f.startPlace, destination:f.destination, destination_address:f.destinationAddress,
            via1:f.via1,via2:f.via2,via3:f.via3,via4:f.via4,
            docs_licence_url:f.docsLicenceUrl||null, docs_nic_url:f.docsNicUrl||null,
          };
          if(editingApp){
            // Resubmission: same application row goes back to Pending
            const {error}=await supabase.from("applications").update({
              ...dbRow, rejection_reason:null, missing_items:[],
            }).eq("id",editingApp.id);
            if(error){alert("Failed to resubmit: "+error.message);return;}
          } else {
            const newId=`APP-2026-${Math.floor(1000+Math.random()*9000)}`;
            const {error}=await supabase.from("applications").insert({
              id:newId, applicant_id:currentUserId,
              submitted_date:new Date().toISOString().slice(0,10),
              ...dbRow,
            });
            if(error){alert("Failed to submit application: "+error.message);return;}
          }
          await loadApplications();
          setShowAppForm(false);setEditingApp(null);setTab("applications");
        }}/>
    </PhoneFrame>
  );

  if(viewingPermit){
    const curr=permits.find(p=>p.id===viewingPermit.id)||viewingPermit;
    return(
      <PhoneFrame language={profile.language}>
        <PermitViewer permit={curr} onBack={()=>setViewingPermit(null)}
          viewerRole="holder"/>
      </PhoneFrame>
    );
  }

  if(showSettings) return(
    <PhoneFrame language={profile.language}>
      <MobileSettingsScreen profile={profile} setProfile={setProfile}
        onBack={()=>setShowSettings(false)} onLogout={onLogout}/>
    </PhoneFrame>
  );

  return(
    <PhoneFrame language={profile.language}>
      <AppHeader title={titles[tab][0]} subtitle={titles[tab][1]} onLogout={onLogout} role="holder"/>
      <div style={{flex:1,padding:"18px 16px 90px",overflowY:"auto",minHeight:0}}>
        {loadingApps&&tab==="home"&&(
          <div style={{textAlign:"center",padding:"20px",color:"#9CA3AF",fontSize:12}}>Loading your applications…</div>
        )}
        {tab==="home"&&<HolderHome permits={permits} applications={applications}
          activity={notifications} language={profile.language} name={profile.name}
          onGoToApps={()=>setTab("applications")} onGoToPermits={()=>setTab("permits")}
          onNewApp={()=>{setEditingApp(null);setShowAppForm(true);}}
          onGoToDrivers={()=>setTab("drivers")} onGoToSettings={()=>setShowSettings(true)}/>}
        {tab==="applications"&&<HolderApplications applications={applications} language={profile.language}
          onNewApp={()=>{setEditingApp(null);setShowAppForm(true);}}
          onResubmit={(a)=>{setEditingApp(a);setShowAppForm(true);}}
          onSubmitPayment={submitPaymentSlip}/>}
        {tab==="permits"&&<HolderPermits permits={permits} myDrivers={myDrivers} language={profile.language}
          onViewPermit={setViewingPermit} onGoToDrivers={()=>setTab("drivers")}/>}
        {tab==="drivers"&&<HolderDrivers myDrivers={myDrivers} setMyDrivers={setMyDrivers} onDriverAdded={loadMyDrivers} onDriverRemoved={loadMyDrivers}/>}
        {tab==="profile"&&(
          <>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24}}>
              <label style={{position:"relative",cursor:"pointer",marginBottom:10}}>
                <div style={{width:72,height:72,borderRadius:"50%",overflow:"hidden",
                  background:`linear-gradient(135deg,${M},${ML})`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  color:W,fontSize:28,fontWeight:800}}>
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
              <div style={{fontSize:12,color:GR}}>Permit Holder</div>
            </div>
            <div style={{background:W,borderRadius:14,padding:"4px 16px",
              boxShadow:"0 2px 10px rgba(0,0,0,0.05)",marginBottom:20}}>
              {[["Full Name",profile.name],["Permit Holder ID",profile.email||"—"],
                ["NIC Number",profile.nic||"—"],["Email",profile.email],["Address",profile.address||"—"],
                ["Phone",profile.phone]
              ].map(([l,v],i,a)=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"13px 0",
                  borderBottom:i<a.length-1?"1px solid #F3F0EB":"none"}}>
                  <span style={{fontSize:13,color:GR}}>{l}</span>
                  <span style={{fontSize:13,fontWeight:600,color:TX,textAlign:"right"}}>{v}</span>
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
// DRIVER APP
// ══════════════════════════════════════════════════════════════════

