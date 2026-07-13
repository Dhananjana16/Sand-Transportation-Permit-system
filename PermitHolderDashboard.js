// ═══════════════════════════════════════════════════════════
// DAY 6 — Person A (App)
// [REFACTOR] Restructured payment flow to happen after GSMB approval, not upfront
// ═══════════════════════════════════════════════════════════

// Permit Holder dashboard shell - routes between all Holder screens

import { useState, useEffect, useRef } from "react";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn, t } from "./theme";
import { AppHeader, BottomNav, PhoneFrame } from "./uiComponents";
import { MobileSettingsScreen } from "./settingsAndDocs";
import { getTripStatus } from "./tripUtils";
import { ApplicationForm } from "./ApplicationForm";
import { HolderHome, HolderApplications, HolderPermits, HolderDrivers } from "./HolderScreens";
import { PermitViewer } from "./PermitViewer";

export function PermitHolderDashboard({holderId,onLogout,initialLanguage="English"}){
  const [tab,setTab]=useState("home");
  const [myDrivers,setMyDrivers]=useState([]);
  const [viewingPermit,setViewingPermit]=useState(null);
  const [showAppForm,setShowAppForm]=useState(false);
  const [editingApp,setEditingApp]=useState(null);
  const [showSettings,setShowSettings]=useState(false);
  const [profile,setProfile]=useState({
    name:"Kamal Perera",email:"kamal.perera@gmail.com",
    phone:"077 123 4567",language:initialLanguage,
  });
  const L=(key)=>t(profile.language,key);

  const [applications,setApplications]=useState([
    {id:"APP-2026-0143",status:"Approved",qty:"8 Cubes",vehicleNo:"NB-1234",date:"10 Jun 2026"},
    {id:"APP-2026-0144",status:"Awaiting Payment",qty:"12 Cubes",vehicleNo:"NB-5678",date:"12 Jun 2026",
      royaltyAmountDue:"6000"},
    {id:"APP-2026-0139",status:"Pending",qty:"6 Cubes",vehicleNo:"NB-1234",date:"13 Jun 2026"},
    {id:"APP-2026-0121",status:"Rejected",qty:"10 Cubes",vehicleNo:"NB-9999",date:"02 Jun 2026",
      rejectionReason:"Mining licence copy could not be verified against GSMB records.",
      missingItems:["A clear, legible copy of the Mining/Trading Licence"],
      applicantName:"Kamal Perera",nic:"871234567V",address:"No. 45, Main Street, Badulla",
      phone:"077 123 4567",mineral:"Sand",qty_raw:"10",unit:"Cubes",
      miningLicenceNo:"ML/2025/00123",licenceType:"Mining Licence",
      district:"Badulla",dsDivision:"Badulla DS Division",gnDivision:"45 - Bandarawela",
      village:"Galketiya",landName:"Galketiya Sand Store",
      purpose:"Construction",transportFrom:"",transportTo:"",
      vehicleType:"Lorry",
      startPlace:"Galketiya Sand Store",via1:"Bandarawela",via2:"Ella",via3:"",via4:"",
      destination:"Colombo Construction Site",destinationAddress:"",
      royaltyReceiptNo:"RR-000111",royaltyAmount:"4500",licenceFeeReceipt:"LF-2026-0099",
      docsLicence:true,docsRoyalty:false,docsPayslip:true,docsNIC:true,
    },
  ]);

  const [permits,setPermits]=useState([
    {
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
      status:"Active",tripsTotal:25,
      trips:[
        {date:"13 Jun 2026",qty:"8",startTime:"08:15 AM",destination:"Colombo Construction Site",
          holderApproved:true,policeOfficer:"Sgt. K. Perera / Badulla",endTime:"11:40 AM",status:"Completed"},
      ],
      pendingTrip:null,
      estimatedTripMinutes:150,
      tripInProgress:{
        startTime:"06:30 AM",startTimestamp:Date.now()-160*60000,
        driverName:"Sunil Fernando",delayReason:null,proofAttached:false,
      },
      fundRequest:null,
    },
  ]);



  const [notifications,setNotifications]=useState([
    {icon:"✅",title:"Trip Completed",detail:"PMT-2026-0143 · Trip 1 · Driver: Sunil Fernando",time:"13 Jun 2026, 11:40 AM",read:false},
    {icon:"🚚",title:"Trip Started",detail:"PMT-2026-0143 · Trip 1 · Vehicle: NB-1234",time:"13 Jun 2026, 08:15 AM",read:false},
    {icon:"🪪",title:"Permit Issued",detail:"PMT-2026-0143 · Sand · 8 Cubes",time:"10 Jun 2026",badge:"Approved",read:true},
    {icon:"📄",title:"APP-2026-0143",detail:"Application approved by GSMB",time:"10 Jun 2026",badge:"Approved",read:true},
  ]);
  const markAllNotificationsRead=()=>setNotifications(prev=>prev.map(n=>({...n,read:true})));

  const submitPaymentSlip=(appId,paymentInfo)=>{
    setApplications(prev=>prev.map(a=>a.id===appId?{
      ...a,status:"Payment Submitted",
      licenceFeeReceipt:paymentInfo.licenceFeeReceipt,
      paymentSlipFile:paymentInfo.paymentSlipFile,
    }:a));
    setNotifications(prev=>[{icon:"💳",title:"Payment Slip Submitted",
      detail:`${appId} · awaiting GSMB verification`,
      time:new Date().toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}),
      read:false},...prev]);
  };

  const submitDelayReason=(permitId,reason,proofFile)=>{
    setPermits(prev=>prev.map(p=>p.id===permitId?{
      ...p,tripInProgress:{...p.tripInProgress,delayReason:reason,proofFile},
    }:p));
    setNotifications(prev=>[{icon:"📝",title:"Delay Reason Submitted",
      detail:`${permitId} · ${reason}`,
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
    <PhoneFrame>
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
        onSubmit={(f)=>{
          if(editingApp){
            // Resubmission: same application ID goes back to Pending
            setApplications(prev=>prev.map(a=>a.id===editingApp.id?{
              ...a,...f,qty_raw:f.qty,qty:`${f.qty} ${f.unit}`,
              status:"Pending",date:new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}),
              resubmittedAt:new Date().toISOString(),
              previousRejectionReason:a.rejectionReason,
              rejectionReason:null,missingItems:null,
            }:a));
          } else {
            setApplications(prev=>[{
              id:`APP-2026-0${150+prev.length}`,status:"Pending",
              qty:`${f.qty} ${f.unit}`,qty_raw:f.qty,vehicleNo:f.vehicleNo,
              date:new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}),
              ...f,
            },...prev]);
          }
          setShowAppForm(false);setEditingApp(null);setTab("applications");
        }}/>
    </PhoneFrame>
  );

  if(viewingPermit){
    const curr=permits.find(p=>p.id===viewingPermit.id)||viewingPermit;
    return(
      <PhoneFrame>
        <PermitViewer permit={curr} onBack={()=>setViewingPermit(null)}
          viewerRole="holder" onSubmitDelayReason={submitDelayReason}/>
      </PhoneFrame>
    );
  }

  if(showSettings) return(
    <PhoneFrame>
      <MobileSettingsScreen profile={profile} setProfile={setProfile}
        onBack={()=>setShowSettings(false)} onLogout={onLogout}/>
    </PhoneFrame>
  );

  return(
    <PhoneFrame>
      <AppHeader title={titles[tab][0]} subtitle={titles[tab][1]} onLogout={onLogout} role="holder"/>
      <div style={{flex:1,padding:"18px 16px 90px",overflowY:"auto",minHeight:0}}>
        {tab==="home"&&<HolderHome permits={permits} applications={applications}
          activity={notifications} language={profile.language} name={profile.name}
          onGoToApps={()=>setTab("applications")} onGoToPermits={()=>setTab("permits")}
          onNewApp={()=>{setEditingApp(null);setShowAppForm(true);}}
          onSubmitDelayReason={submitDelayReason}
          onGoToDrivers={()=>setTab("drivers")} onGoToSettings={()=>setShowSettings(true)}/>}
        {tab==="applications"&&<HolderApplications applications={applications} language={profile.language}
          onNewApp={()=>{setEditingApp(null);setShowAppForm(true);}}
          onResubmit={(a)=>{setEditingApp(a);setShowAppForm(true);}}
          onSubmitPayment={submitPaymentSlip}/>}
        {tab==="permits"&&<HolderPermits permits={permits} myDrivers={myDrivers} language={profile.language}
          onViewPermit={setViewingPermit} onGoToDrivers={()=>setTab("drivers")}/>}
        {tab==="drivers"&&<HolderDrivers myDrivers={myDrivers} setMyDrivers={setMyDrivers}/>}
        {tab==="profile"&&(
          <>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24}}>
              <div style={{width:72,height:72,borderRadius:"50%",
                background:`linear-gradient(135deg,${M},${ML})`,
                display:"flex",alignItems:"center",justifyContent:"center",
                color:W,fontSize:28,fontWeight:800,marginBottom:10}}>
                {profile.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div style={{fontSize:17,fontWeight:800,color:TX}}>{profile.name}</div>
              <div style={{fontSize:12,color:GR}}>Permit Holder</div>
            </div>
            <div style={{background:W,borderRadius:14,padding:"4px 16px",
              boxShadow:"0 2px 10px rgba(0,0,0,0.05)",marginBottom:20}}>
              {[["Full Name",profile.name],["Permit Holder ID",holderId||"PH-20245"],
                ["NIC Number","871234567V"],["Email",profile.email],["Address","No. 45, Main Street, Badulla"],
                ["Phone",profile.phone],["Mining Licence No.","ML/2025/00123"]
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

