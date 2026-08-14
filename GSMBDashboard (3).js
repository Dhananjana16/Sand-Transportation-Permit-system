// GSMB dashboard shell - ties together all GSMB screens and handles routing

import { useState, useEffect } from "react";
import { supabaseGSMB as supabase } from "./supabaseClient";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn, t } from "./theme";
import { webBtn, webInput } from "./uiComponents";
import { GSMBPermitDetail } from "./GSMBPermitDetail";
import { WebSettingsScreen } from "./settingsAndDocs";
import { useIsDesktop } from "./tripUtils";
import { GSMBSplash, GSMBLogin } from "./GSMBLogin";
import { gsmbNavItems, GSMBNavbar, GSMBSidebar, GSMBMobileMenu } from "./GSMBNavigation";
import { GSMBOverview, GSMBApplicationList, GSMBApplicationDetail } from "./GSMBApplications";
import { GSMBIssuedPermits } from "./GSMBIssuedPermits";

// Converts a database row (snake_case columns) into the shape the rest of
// the app already expects (camelCase) — so no other file needs to change.
function mapApplicationFromDB(row){
  return {
    id:row.id, status:row.status, applicantId:row.applicant_id,
    applicantName:row.applicant_name, nic:row.nic, address:row.address, phone:row.phone,
    mineral:row.mineral, qty:row.qty, unit:row.unit,
    licenceType:row.licence_type, miningLicenceNo:row.mining_licence_no,
    district:row.district, dsDivision:row.ds_division, gnDivision:row.gn_division,
    village:row.village, landName:row.land_name, purpose:row.purpose,
    transportFrom:row.transport_from, transportTo:row.transport_to,
    vehicleNo:row.vehicle_no, vehicleType:row.vehicle_type,
    startPlace:row.start_place, destination:row.destination, destinationAddress:row.destination_address,
    via1:row.via1, via2:row.via2, via3:row.via3, via4:row.via4,
    docs:{licence:!!row.docs_licence_url, nic:!!row.docs_nic_url},
    docsLicenceUrl:row.docs_licence_url||null, docsNicUrl:row.docs_nic_url||null,
    rejectionReason:row.rejection_reason, missingItems:row.missing_items||[],
    licenceNo:row.licence_no, officerName:row.officer_name,
    validFrom:row.valid_from, validTo:row.valid_to,
    licenceFeeReceipt:row.licence_fee_receipt,
    paymentSlipUrl:row.payment_slip_url||null,
    date:row.submitted_date, submittedDate:row.submitted_date,
    awaitingResubmission:false, paymentSlipFile:row.payment_slip_file||null,
  };
}

export function GSMBEntry(){
  const [step,setStep]=useState("checking");
  const [loginKey,setLoginKey]=useState(0);
  const LOGIN_TIME_KEY="sandpass_gsmb_login_at";

  const checkSession=async()=>{
    const {data:{session}}=await supabase.auth.getSession();
    if(session){
      // Enforce "logged in for one calendar day" — if the stored login
      // timestamp is from a previous day, force a fresh sign-in.
      const loginAt=localStorage.getItem(LOGIN_TIME_KEY);
      const loginDay=loginAt?new Date(parseInt(loginAt)).toDateString():null;
      const today=new Date().toDateString();
      if(!loginAt||loginDay!==today){
        await supabase.auth.signOut();
        localStorage.removeItem(LOGIN_TIME_KEY);
        setStep("splash");
        return;
      }
      // We already confirmed this is a GSMB account at login time (that's
      // the only place LOGIN_TIME_KEY gets set) — no need to re-check role
      // here, which avoids a timing race right after a page refresh.
      setStep("dashboard");
      return;
    }
    setStep("splash");
  };
  useEffect(()=>{ checkSession(); },[]);

  const handleLoginSuccess=()=>{
    localStorage.setItem(LOGIN_TIME_KEY,Date.now().toString());
    setStep("dashboard");
  };

  const handleLogout=async()=>{
    await supabase.auth.signOut();
    localStorage.removeItem(LOGIN_TIME_KEY);
    setLoginKey(k=>k+1);
    setStep("splash");
  };

  if(step==="checking") return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      background:"#4E1120",color:"#fff",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      Loading…
    </div>
  );
  if(step==="splash") return <GSMBSplash onContinue={()=>setStep("login")}/>;
  if(step==="login") return <GSMBLogin key={loginKey} onSuccess={handleLoginSuccess}/>;
  return <GSMBDashboard onLogout={handleLogout}/>;
}

export function GSMBDashboard({onLogout}){
  const isDesktop=useIsDesktop();
  const [mobileMenuOpen,setMobileMenuOpen]=useState(false);
  const [permitsInitialViewId,setPermitsInitialViewId]=useState(null);
  const [section,setSection]=useState("dashboard");
  const [openApp,setOpenApp]=useState(null);
  const [justIssuedPermit,setJustIssuedPermit]=useState(null);
  const [applications,setApplications]=useState([]);
  const [loadingApps,setLoadingApps]=useState(true);
  const [officerProfile,setOfficerProfile]=useState({
    name:"",email:"",phone:"",avatarUrl:"",language:"English",
  });

  const loadOfficerProfile=async()=>{
    const {data:{user}}=await supabase.auth.getUser();
    if(!user) return;
    const {data,error}=await supabase.from("profiles").select("*").eq("id",user.id).single();
    if(!error&&data) setOfficerProfile(prev=>({
      ...prev,
      name:data.full_name||"", email:user.email||"",
      phone:data.phone||"", avatarUrl:data.avatar_url||"",
    }));
  };
  useEffect(()=>{ loadOfficerProfile(); },[]);

  // Load real applications from Supabase instead of using mock data
  const loadApplications=async()=>{
    setLoadingApps(true);
    const {data,error}=await supabase
      .from("applications")
      .select("*")
      .order("created_at",{ascending:false});
    if(!error&&data) setApplications(data.map(mapApplicationFromDB));
    setLoadingApps(false);
  };
  useEffect(()=>{ loadApplications(); },[]);

  // GSMB officers are automatically signed out daily at midnight
  useEffect(()=>{
    const now=new Date();
    const nextMidnight=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0,0);
    const timer=setTimeout(()=>{onLogout();},nextMidnight-now);
    return ()=>clearTimeout(timer);
  },[]);

  const [issuedPermits,setIssuedPermits]=useState([]);
  const loadPermits=async()=>{
    const {data,error}=await supabase.from("permits").select("*").order("created_at",{ascending:false});
    if(error||!data) return;
    const permitIds=data.map(p=>p.id);
    const {data:tripRows}=permitIds.length
      ?await supabase.from("trips").select("*").in("permit_id",permitIds).order("started_at",{ascending:true})
      :{data:[]};
    const {data:checkpointRows}=permitIds.length
      ?await supabase.from("checkpoints").select("*, profiles(full_name, station)").in("permit_id",permitIds)
      :{data:[]};
    setIssuedPermits(data.map(p=>({
      id:p.id, licenceNo:p.licence_no, holderName:p.holder_name, holderId:p.holder_id,
      vehicleNo:p.vehicle_no, mineral:p.mineral, qty:p.qty, unit:p.unit,
      district:p.district, startPlace:p.start_place, destination:p.destination,
      via1:p.via1,via2:p.via2,via3:p.via3,via4:p.via4,
      validFrom:p.valid_from, validTo:p.valid_to, officerName:p.officer_name,
      issuedDate:p.issued_date, status:p.status, tripsTotal:p.trips_total,
      tripInProgress:null,
      trips:(tripRows||[]).filter(t=>t.permit_id===p.id).map(t=>{
        const cp=(checkpointRows||[]).find(c=>c.trip_id===t.id);
        return{
          date:t.started_at?new Date(t.started_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"",
          driverName:t.driver_name, destination:t.destination, qty:p.qty,
          startTime:t.started_at?new Date(t.started_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"",
          endTime:t.ended_at?new Date(t.ended_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"",
          status:t.status==="completed"?"Completed":"In Progress",
          holderApproved:true,
          policeOfficer:cp?cp.profiles?.full_name:null,
          policeStation:cp?cp.profiles?.station:null,
        };
      }),
    })));
  };
  useEffect(()=>{ loadPermits(); },[]);

  const counts={
    total:applications.length,
    pending:applications.filter(a=>a.status==="Pending").length,
    paymentReview:applications.filter(a=>a.status==="Payment Submitted"||a.status==="Awaiting Payment").length,
    approved:applications.filter(a=>a.status==="Approved").length,
    rejected:applications.filter(a=>a.status==="Rejected").length,
  };

  const handleApprove=async(appId,permitDetails)=>{
    const app=applications.find(a=>a.id===appId);
    if(app.status==="Pending"){
      // Step 1: approve the application and request payment — no permit issued yet
      const {error}=await supabase.from("applications").update({
        status:"Awaiting Payment",
        licence_no:permitDetails.licenceNo, officer_name:permitDetails.officerName,
        valid_from:permitDetails.validFrom, valid_to:permitDetails.validTo,
      }).eq("id",appId);
      if(error){alert("Failed to update application: "+error.message);return;}
      setApplications(prev=>prev.map(a=>a.id===appId?{
        ...a,status:"Awaiting Payment",
        licenceNo:permitDetails.licenceNo,officerName:permitDetails.officerName,
        validFrom:permitDetails.validFrom,validTo:permitDetails.validTo,
      }:a));
      setOpenApp(null);
      return;
    }
    // Step 2: payment has been submitted and confirmed — now issue the permit
    const permitId=`PMT-2026-${Math.floor(1000+Math.random()*9000)}`;
    const issuedDate=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
    const {error:approveError}=await supabase.from("applications").update({status:"Approved"}).eq("id",appId);
    if(approveError){alert("Failed to update application: "+approveError.message);return;}
    const {error:permitError}=await supabase.from("permits").insert({
      id:permitId, application_id:appId, holder_id:app.applicantId,
      licence_no:app.licenceNo, holder_name:app.applicantName,
      vehicle_no:app.vehicleNo, mineral:app.mineral, qty:app.qty, unit:app.unit,
      district:app.district,
      start_place:app.startPlace, destination:app.destination,
      via1:app.via1||"",via2:app.via2||"",via3:app.via3||"",via4:app.via4||"",
      valid_from:app.validFrom, valid_to:app.validTo,
      officer_name:app.officerName, issued_date:new Date().toISOString().slice(0,10),
      status:"Active", trips_total:25,
    });
    if(permitError){alert("Application approved, but permit creation failed: "+permitError.message);return;}
    const newPermit={
      id:permitId,licenceNo:app.licenceNo,
      holderName:app.applicantName,holderAddress:app.address,
      holderId:app.applicantId,vehicleNo:app.vehicleNo,
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
    setIssuedPermits(prev=>[newPermit,...prev]);
    setJustIssuedPermit(newPermit);
    setOpenApp(null);
  };

  const handleReject=async(appId,reason,missingItems=[])=>{
    const {error}=await supabase.from("applications").update({
      status:"Rejected", rejection_reason:reason, missing_items:missingItems,
    }).eq("id",appId);
    if(error){alert("Failed to reject application: "+error.message);return;}
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
      <div className="no-print">
        <GSMBNavbar onLogout={onLogout} officerName={officerProfile.name}
          isDesktop={isDesktop} onMenuToggle={()=>setMobileMenuOpen(true)}/>
      </div>
      {!isDesktop&&mobileMenuOpen&&(
        <GSMBMobileMenu activeSection={section} counts={counts}
          setActiveSection={(s)=>{setSection(s);setOpenApp(null);}}
          onClose={()=>setMobileMenuOpen(false)}/>
      )}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {isDesktop&&(
          <div className="no-print">
            <GSMBSidebar activeSection={section}
              setActiveSection={(s)=>{setSection(s);setOpenApp(null);}} counts={counts}/>
          </div>
        )}
        <div style={{flex:1,padding:isDesktop?"28px 32px":"18px 16px",overflowY:"auto"}}>
          {loadingApps?(
            <div style={{textAlign:"center",padding:"60px 20px",color:"#9CA3AF"}}>Loading applications…</div>
          ):justIssuedPermit?(
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
              <GSMBPermitDetail permit={justIssuedPermit} supabaseClient={supabase}/>
            </div>
          ):openApp?(
            <GSMBApplicationDetail app={openApp} onBack={()=>setOpenApp(null)}
              onApprove={handleApprove} onReject={handleReject}/>
          ):section==="dashboard"?(
            <GSMBOverview applications={applications} onGoTo={setSection} onOpen={setOpenApp}
              officerName={officerProfile.name}/>
          ):section==="permits"?(
            <GSMBIssuedPermits permits={issuedPermits} initialViewId={permitsInitialViewId} supabaseClient={supabase}/>
          ):section==="settings"?(
            <WebSettingsScreen profile={officerProfile} setProfile={setOfficerProfile}
              onLogout={onLogout} autoLogoutNote supabaseClient={supabase}/>
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
