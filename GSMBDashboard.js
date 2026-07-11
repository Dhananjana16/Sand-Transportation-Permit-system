// ═══════════════════════════════════════════════════════════
// DAY 4 — Person C (GSMB)
// [FEATURE] GSMB dashboard shell tying together all GSMB screens and routing
// ═══════════════════════════════════════════════════════════

// GSMB dashboard shell - ties together all GSMB screens and handles routing

import { useState, useEffect } from "react";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn, t } from "./theme";
import { webBtn, webInput } from "./uiComponents";
import { GSMBPermitDetail } from "./GSMBPermitDetail";
import { WebSettingsScreen } from "./settingsAndDocs";
import { useIsDesktop } from "./tripUtils";
import { GSMBSplash, GSMBLogin } from "./GSMBLogin";
import { gsmbNavItems, GSMBNavbar, GSMBSidebar, GSMBMobileMenu } from "./GSMBNavigation";
import { MOCK_APPLICATIONS, GSMBOverview, GSMBApplicationList, GSMBApplicationDetail } from "./GSMBApplications";
import { GSMBIssuedPermits } from "./GSMBIssuedPermits";

export function GSMBEntry(){
  const [step,setStep]=useState("splash");
  const [loginKey,setLoginKey]=useState(0);

  const handleLogout=()=>{
    try{localStorage.removeItem("sandpass_gsmb_session");}catch(e){}
    setLoginKey(k=>k+1);
    setStep("login");
  };

  if(step==="splash") return <GSMBSplash onContinue={()=>setStep("login")}/>;
  if(step==="login") return <GSMBLogin key={loginKey} onSuccess={()=>setStep("dashboard")}/>;
  return <GSMBDashboard onLogout={handleLogout}/>;
}

export function GSMBDashboard({onLogout}){
  const isDesktop=useIsDesktop();
  const [mobileMenuOpen,setMobileMenuOpen]=useState(false);
  const [permitsInitialViewId,setPermitsInitialViewId]=useState(null);
  const [section,setSection]=useState("dashboard");
  const [openApp,setOpenApp]=useState(null);
  const [justIssuedPermit,setJustIssuedPermit]=useState(null);
  const [applications,setApplications]=useState(MOCK_APPLICATIONS);
  const [officerProfile,setOfficerProfile]=useState({
    name:"W.A.C.A. Madhushika",email:"wca.madhushika@gsmb.gov.lk",
    phone:"011 234 5678",language:"English",
  });

  // GSMB officers are automatically signed out daily at midnight
  useEffect(()=>{
    const now=new Date();
    const nextMidnight=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0,0);
    const timer=setTimeout(()=>{onLogout();},nextMidnight-now);
    return ()=>clearTimeout(timer);
  },[]);

  const [issuedPermits,setIssuedPermits]=useState([
    {id:"PMT-2026-0139",licenceNo:"TL/2026/03211",
     holderName:"Ruwan Bandara",holderAddress:"No. 78, Temple Road, Galle",
     holderId:"PH-20245",vehicleNo:"GL-9012",mineral:"Sand",qty:"6",unit:"Cubes",
     miningLicenceNo:"ML/2024/00789",district:"Galle",dsDivision:"Galle DS Division",
     gnDivision:"12 - Hikkaduwa",landName:"Hikkaduwa River Sand",
     startPlace:"Hikkaduwa River Sand",destination:"Matara Housing Project",
     via1:"Hikkaduwa",via2:"Galle",via3:"",via4:"",
     validFrom:"08 Jun 2026",validTo:"07 Jul 2026",
     licenceFeeReceipt:"LF-2026-0321",royaltyReceiptNo:"RR-334455",royaltyAmount:"3500",
     officerName:"W.A.C.A. Madhushika",issuedDate:"08 Jun 2026",
     status:"Active",tripsTotal:25,
     estimatedTripMinutes:120,
     tripInProgress:{
       startTime:"06:00 AM",startTimestamp:Date.now()-145*60000,
       driverName:"Ruwan Bandara",delayReason:null,proofAttached:false,
     },
     fundRequest:null,
     trips:[
       {date:"10 Jun 2026",qty:"6",startTime:"07:30 AM",endTime:"10:15 AM",
         driverName:"Ruwan Bandara",driverId:"DRV-1003",
         policeOfficer:"Sgt. M. Silva",policeStation:"Galle",status:"Completed"},
     ],
     checkpointNotes:[
       {officer:"Sgt. M. Silva",station:"Galle",date:"10 Jun 2026",time:"08:45 AM",
        locationText:"6.03281, 80.21010 (±12m) — Galle Road checkpoint"},
     ]},
  ]);

  const counts={
    total:applications.length,
    pending:applications.filter(a=>a.status==="Pending").length,
    paymentReview:applications.filter(a=>a.status==="Payment Submitted").length,
    approved:applications.filter(a=>a.status==="Approved").length,
    rejected:applications.filter(a=>a.status==="Rejected").length,
  };

  const handleApprove=(appId,permitDetails)=>{
    const app=applications.find(a=>a.id===appId);
    if(app.status==="Pending"){
      // Step 1: approve the application and request payment — no permit issued yet
      setApplications(prev=>prev.map(a=>a.id===appId?{
        ...a,status:"Awaiting Payment",
        licenceNo:permitDetails.licenceNo,officerName:permitDetails.officerName,
        validFrom:permitDetails.validFrom,validTo:permitDetails.validTo,
      }:a));
      setOpenApp(null);
      return;
    }
    // Step 2: payment has been submitted and confirmed — now issue the permit
    const permitId=`PMT-2026-0${150+issuedPermits.length}`;
    const issuedDate=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
    const newPermit={
      id:permitId,licenceNo:app.licenceNo,
      holderName:app.applicantName,holderAddress:app.address,
      holderId:"PH-AUTO",vehicleNo:app.vehicleNo,
      mineral:app.mineral,qty:app.qty,unit:app.unit,
      miningLicenceNo:app.miningLicenceNo,district:app.district,
      dsDivision:app.dsDivision,gnDivision:app.gnDivision,
      landName:app.landName,
      startPlace:app.startPlace,destination:app.destination,
      via1:app.via1||"",via2:app.via2||"",via3:app.via3||"",via4:app.via4||"",
      validFrom:app.validFrom,validTo:app.validTo,
      licenceFeeReceipt:app.licenceFeeReceipt,
      officerName:app.officerName,issuedDate,
      status:"Active",tripsTotal:25,tripInProgress:null,trips:[],
    };
    setApplications(prev=>prev.map(a=>a.id===appId?{...a,status:"Approved"}:a));
    setIssuedPermits(prev=>[...prev,newPermit]);
    setJustIssuedPermit(newPermit);
    setOpenApp(null);
  };

  const handleReject=(appId,reason,missingItems=[])=>{
    setApplications(prev=>prev.map(a=>a.id===appId?{
      ...a,status:"Rejected",rejectionReason:reason,missingItems,
      awaitingResubmission:true,
    }:a));
    setOpenApp(null);
    setSection("rejected");
  };

  const statusMap={"pending":"Pending","paymentReview":"Payment Submitted","approved":"Approved","rejected":"Rejected"};

  return(
    <div style={{width:"100%",height:"100vh",display:"flex",flexDirection:"column",
      fontFamily:"'Segoe UI',system-ui,sans-serif",background:"#F8F5F0"}}>
      <GSMBNavbar onLogout={onLogout} officerName={officerProfile.name}
        isDesktop={isDesktop} onMenuToggle={()=>setMobileMenuOpen(true)}/>
      {!isDesktop&&mobileMenuOpen&&(
        <GSMBMobileMenu activeSection={section} counts={counts}
          setActiveSection={(s)=>{setSection(s);setOpenApp(null);}}
          onClose={()=>setMobileMenuOpen(false)}/>
      )}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {isDesktop&&<GSMBSidebar activeSection={section}
          setActiveSection={(s)=>{setSection(s);setOpenApp(null);}} counts={counts}/>}
        <div style={{flex:1,padding:isDesktop?"28px 32px":"18px 16px",overflowY:"auto"}}>
          {justIssuedPermit?(
            <div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
                <button onClick={()=>setJustIssuedPermit(null)}
                  style={webBtn("#F3F0EB","#5A3A42",{fontSize:13})}>← Back</button>
                <div>
                  <h2 style={{fontSize:20,fontWeight:800,color:"#1A0A0F",margin:0}}>
                    ✅ Permit Issued Successfully
                  </h2>
                  <div style={{fontSize:13,color:"#6B7280"}}>
                    {justIssuedPermit.id} has been sent to {justIssuedPermit.holderName}
                  </div>
                </div>
              </div>
              <GSMBPermitDetail permit={justIssuedPermit}/>
            </div>
          ):openApp?(
            <GSMBApplicationDetail app={openApp} onBack={()=>setOpenApp(null)}
              onApprove={handleApprove} onReject={handleReject}/>
          ):section==="dashboard"?(
            <GSMBOverview applications={applications} onGoTo={setSection} onOpen={setOpenApp}
              officerName={officerProfile.name}/>
          ):section==="permits"?(
            <GSMBIssuedPermits permits={issuedPermits} initialViewId={permitsInitialViewId}/>
          ):section==="settings"?(
            <WebSettingsScreen profile={officerProfile} setProfile={setOfficerProfile}
              onLogout={onLogout} autoLogoutNote/>
          ):(
            <GSMBApplicationList
              applications={applications}
              statusFilter={statusMap[section]||"all"}
              onOpen={setOpenApp}/>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// GSMB REGIONAL OFFICER WEBSITE
// ══════════════════════════════════════════════════════════════════
