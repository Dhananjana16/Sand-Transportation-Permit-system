// ═══════════════════════════════════════════════════════════
// DAY 3 — Person B (Police)
// [FEATURE] Police officer login/register form and dashboard shell (scan QR / my log / profile)
// ═══════════════════════════════════════════════════════════

// Police dashboard and login - main dashboard shell and login/register form

import { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";
import slEmblem from "./image/sl-emblem.png";
import policeLogo from "./image/police-logo.png";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn } from "./theme";
import { SLCrest, PoliceLogo, IconField, webInput, webBtn } from "./uiComponents";
import { WebSettingsScreen } from "./settingsAndDocs";
import { useIsDesktop } from "./tripUtils";
import { GSMBPermitDetail } from "./GSMBPermitDetail";
import { PoliceSidebar, PoliceMobileNav } from "./PolicePortal";


export function PoliceDashboard({officer,onLogout}){
  const isDesktop=useIsDesktop();
  const [activeTab,setActiveTab]=useState("scan");
  const [scanResult,setScanResult]=useState(null);
  const [manualCode,setManualCode]=useState("");
  const [logSearch,setLogSearch]=useState("");
  const [showSettings,setShowSettings]=useState(false);
  const [cameraActive,setCameraActive]=useState(false);
  const [cameraError,setCameraError]=useState("");
  const [profile,setProfile]=useState({
    name:officer.name,email:officer.email||"",phone:officer.phone||"",language:"English",
  });
  const [checkpoints,setCheckpoints]=useState([
    {time:"08:45 AM",date:"17 Jun 2026",permitId:"PMT-2026-0139",vehicle:"GL-9012",result:"Valid",officer:"Officer 123"},
    {time:"11:20 AM",date:"16 Jun 2026",permitId:"PMT-2026-0143",vehicle:"NB-1234",result:"Valid",officer:"Officer 123"},
  ]);
  const [locationStatus,setLocationStatus]=useState("idle"); // idle|locating|done|denied|attached
  const [capturedLocation,setCapturedLocation]=useState(null);
  const [manualLocation,setManualLocation]=useState("");
  const [editLocation,setEditLocation]=useState(false);

  const videoRef=useRef(null);
  const canvasRef=useRef(null);
  const streamRef=useRef(null);
  const rafRef=useRef(null);

  // ── Full Form 7 permit records, matching what the Holder/Driver/GSMB
  // already see — kept consistent across portals (same IDs, same data).
  const PERMIT_DB={
    "PMT-2026-0143":{
      id:"PMT-2026-0143",licenceNo:"TL/2026/04521",vehicleNo:"NB-1234",
      holderName:"Kamal Perera",holderAddress:"No. 45, Main Street, Badulla",
      mineral:"Sand",qty:"8",unit:"Cubes",
      miningLicenceNo:"ML/2025/00123",district:"Badulla",
      dsDivision:"Badulla DS Division",gnDivision:"45 - Bandarawela",
      landName:"Galketiya Sand Store",
      startPlace:"Galketiya Sand Store",destination:"Colombo Construction Site",
      via1:"Bandarawela",via2:"Ella",via3:"",via4:"",
      validFrom:"10 Jun 2026",validTo:"09 Jul 2026",
      licenceFeeReceipt:"LF-2026-0456",royaltyReceiptNo:"RR-998877",royaltyAmount:"5000",
      officerName:"Mr. S. Jayawardena",issuedDate:"10 Jun 2026",
      tripsTotal:25,
      trips:[
        {date:"13 Jun 2026",qty:"8",startTime:"08:15 AM",endTime:"11:40 AM",
          driverName:"Sunil Fernando",policeOfficer:"Sgt. K. Perera",policeStation:"Badulla",status:"Completed"},
      ],
    },
    "PMT-2026-0139":{
      id:"PMT-2026-0139",licenceNo:"TL/2026/03211",
      holderName:"Ruwan Bandara",holderAddress:"No. 78, Temple Road, Galle",
      vehicleNo:"GL-9012",mineral:"Sand",qty:"6",unit:"Cubes",
      miningLicenceNo:"ML/2024/00789",district:"Galle",dsDivision:"Galle DS Division",
      gnDivision:"12 - Hikkaduwa",landName:"Hikkaduwa River Sand",
      startPlace:"Hikkaduwa River Sand",destination:"Matara Housing Project",
      via1:"Hikkaduwa",via2:"Galle",via3:"",via4:"",
      validFrom:"08 Jun 2026",validTo:"07 Jul 2026",
      licenceFeeReceipt:"LF-2026-0321",royaltyReceiptNo:"RR-334455",royaltyAmount:"3500",
      officerName:"W.A.C.A. Madhushika",issuedDate:"08 Jun 2026",
      tripsTotal:25,
      trips:[
        {date:"10 Jun 2026",qty:"6",startTime:"07:30 AM",endTime:"10:15 AM",
          driverName:"Ruwan Bandara",driverId:"DRV-1003",
          policeOfficer:"Sgt. M. Silva",policeStation:"Galle",status:"Completed"},
      ],
      checkpointNotes:[
        {officer:"Sgt. M. Silva",station:"Galle",date:"10 Jun 2026",time:"08:45 AM",
         locationText:"6.03281, 80.21010 (±12m) — Galle Road checkpoint"},
      ],
    },
  };

  const [locationErrorMsg,setLocationErrorMsg]=useState("");

  const captureLocation=()=>{
    setEditLocation(false);
    setLocationStatus("locating");
    if(!navigator.geolocation){
      setLocationErrorMsg("This browser doesn't support location detection.");
      setLocationStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos)=>{
        setCapturedLocation({lat:pos.coords.latitude.toFixed(5),lng:pos.coords.longitude.toFixed(5),
          accuracy:Math.round(pos.coords.accuracy)});
        setLocationStatus("done");
      },
      (err)=>{
        const messages={
          1:"Location permission denied. Allow location access for this site in your browser settings.",
          2:"Location unavailable. Make sure Location Services are turned on for your browser in Windows Settings.",
          3:"Location request timed out. Check your GPS/network signal and try again.",
        };
        setLocationErrorMsg(messages[err.code]||"Couldn't detect your location.");
        setLocationStatus("denied");
      },
      {enableHighAccuracy:true,timeout:8000}
    );
  };

  const confirmLocation=()=>{
    const locationText=(capturedLocation&&!editLocation)
      ?`${capturedLocation.lat}, ${capturedLocation.lng} (±${capturedLocation.accuracy}m)`
      :manualLocation.trim();
    if(!locationText) return;
    setCheckpoints(prev=>prev.map((c,i)=>i===0?{...c,locationText}:c));
    setLocationStatus("attached");
  };

  const stopCamera=()=>{
    if(rafRef.current){cancelAnimationFrame(rafRef.current);rafRef.current=null;}
    if(streamRef.current){streamRef.current.getTracks().forEach(t=>t.stop());streamRef.current=null;}
    setCameraActive(false);
  };

  useEffect(()=>()=>stopCamera(),[]);

  const verifyPermit=(code)=>{
    stopCamera();
    const clean=code.trim().toUpperCase();
    const parts=clean.split("|");
    const permitId=parts.length>1?parts[1]:clean;
    const permit=PERMIT_DB[permitId];
    const now=new Date();
    const time=now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    const date=now.toLocaleDateString([],{day:"2-digit",month:"short",year:"numeric"});
    const result=permit
      ?{...permit,scannedAt:time,scannedDate:date,statusCheck:"Valid"}
      :{statusCheck:"Invalid",permitId:clean,scannedAt:time,scannedDate:date};
    setScanResult(result);
    setManualCode("");
    setCapturedLocation(null); setManualLocation(""); setEditLocation(false);
    if(permit){
      setCheckpoints(prev=>[{time,date,permitId:permit.id,vehicle:permit.vehicleNo,
        result:"Valid",officer:profile.name},...prev]);
      // Police are always on their device location — capture it automatically
      captureLocation();
    } else {
      setLocationStatus("idle");
    }
  };

  const scanLoop=()=>{
    if(!videoRef.current||!canvasRef.current) return;
    const video=videoRef.current,canvas=canvasRef.current;
    if(video.readyState===video.HAVE_ENOUGH_DATA){
      canvas.width=video.videoWidth; canvas.height=video.videoHeight;
      const ctx=canvas.getContext("2d");
      ctx.drawImage(video,0,0,canvas.width,canvas.height);
      const imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
      const code=jsQR(imageData.data,imageData.width,imageData.height);
      if(code&&code.data){
        verifyPermit(code.data);
        return;
      }
    }
    rafRef.current=requestAnimationFrame(scanLoop);
  };

  const startCamera=async()=>{
    setScanResult(null); setCameraError(""); setCameraActive(true);
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      streamRef.current=stream;
      if(videoRef.current){
        videoRef.current.srcObject=stream;
        await videoRef.current.play();
        scanLoop();
      }
    }catch(e){
      setCameraError("Camera access denied or unavailable on this device. Use manual entry below.");
      setCameraActive(false);
    }
  };

  const switchTab=(t)=>{ setActiveTab(t); setScanResult(null); stopCamera(); setShowSettings(false); };

  const todayStr=new Date().toLocaleDateString([],{day:"2-digit",month:"short",year:"numeric"});
  const todayScans=checkpoints.filter(c=>c.date===todayStr).length;
  const validCount=checkpoints.filter(c=>c.result==="Valid").length;

  const statCards=[
    {icon:"📷",label:"Today's Scans",value:todayScans,color:NV,bg:"#EFF4FA"},
    {icon:"✅",label:"Valid Checks",value:validCount,color:"#1E8A4C",bg:"#E5F5EA"},
    {icon:"📋",label:"Total Logged",value:checkpoints.length,color:"#9A7B1F",bg:"#FDF3D7"},
  ];

  return(
    <div style={{width:"100%",minHeight:"100vh",background:"#F4F6F9",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>

      {/* Top navbar — clean and light, not a heavy colored bar */}
      <div style={{background:"#fff",padding:isDesktop?"0 32px":"0 16px",display:"flex",alignItems:"center",
        justifyContent:"space-between",height:72,position:"sticky",top:0,zIndex:150,
        borderBottom:"1px solid #EAEEF3"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <PoliceLogo size={38}/>
          <div>
            <div style={{color:"#9CA3AF",fontSize:10.5,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase"}}>
              Sri Lanka Police
            </div>
            <div style={{color:"#1A0A0F",fontSize:15,fontWeight:800}}>Sand Transport Enforcement</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {isDesktop&&(
            <div style={{textAlign:"right"}}>
              <div style={{color:"#1A0A0F",fontSize:13.5,fontWeight:700}}>{profile.name}</div>
              <div style={{color:"#9CA3AF",fontSize:11.5}}>{officer.station}</div>
            </div>
          )}
          <div style={{width:42,height:42,borderRadius:"50%",background:NV,color:G,
            display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,flexShrink:0}}>
            {profile.name.split(" ").pop().charAt(0)}
          </div>
          {!isDesktop&&(
            <button onClick={onLogout} style={{padding:"8px 14px",borderRadius:8,border:"none",
              background:"#FBEAEA",color:"#C0392B",fontSize:12,fontWeight:700,cursor:"pointer"}}>
              Sign Out
            </button>
          )}
        </div>
      </div>

      <div style={{display:"flex"}}>
        {isDesktop&&<PoliceSidebar activeTab={activeTab} setActiveTab={switchTab} onLogout={onLogout}/>}

        <div style={{flex:1,minWidth:0,padding:isDesktop?"32px 36px":"16px 16px 96px"}}>

            {/* Hero — matches GSMB's structure exactly: label, heading, description */}
            <div style={{background:`linear-gradient(135deg,${NV} 0%,${NM} 55%,#1E3A6A 100%)`,
              borderRadius:18,padding:isDesktop?"36px 36px":"22px 18px",marginBottom:32,
              position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-70,right:-70,width:260,height:260,
                borderRadius:"50%",background:"rgba(201,168,76,0.12)"}}/>
              <div style={{position:"relative",maxWidth:560}}>
                <div style={{color:G,fontSize:13,fontWeight:700,letterSpacing:"0.1em",
                  textTransform:"uppercase",marginBottom:10}}>{officer.station}</div>
                <h1 style={{fontSize:isDesktop?36:24,fontWeight:800,color:"#fff",margin:"0 0 12px",lineHeight:1.15}}>
                  Welcome back, {profile.name.split(" ").pop()}
                </h1>
                <p style={{fontSize:16,color:"rgba(255,255,255,0.82)",margin:0,lineHeight:1.6}}>
                  Scan permit QR codes, verify checkpoint locations, and keep an accurate log of every sand transport check in your area.
                </p>
              </div>
            </div>

            {/* Stat cards — plain icon-on-top, matching GSMB exactly */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:18,
              marginBottom:32}}>
              {statCards.map((s,i)=>(
                <div key={i} style={{background:"#fff",borderRadius:16,padding:"24px",
                  boxShadow:"0 2px 14px rgba(0,0,0,0.06)",border:`1px solid ${s.bg||"#EFF4FA"}`}}>
                  <div style={{fontSize:32,marginBottom:10}}>{s.icon}</div>
                  <div style={{fontSize:34,fontWeight:900,color:s.color||NV,marginBottom:6}}>{s.value}</div>
                  <div style={{fontSize:14,color:"#6B7280",fontWeight:600}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* SCAN TAB */}
            {activeTab==="scan"&&(
              <div style={{display:"flex",flexDirection:"column",gap:16}}>

                <div style={{background:"#fff",borderRadius:16,padding:isDesktop?"28px":"18px",
                  boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                  <div style={{fontSize:20,fontWeight:800,color:NV,marginBottom:6}}>
                    📷 Scan Driver's QR Code
                  </div>
                  <div style={{fontSize:14.5,color:"#6B7280",marginBottom:20}}>
                    Point the camera at the QR code on the driver's SandPass app. It's checked instantly against the GSMB permit database.
                  </div>

                  {cameraActive?(
                    <div style={{position:"relative"}}>
                      <div style={{background:"#000",borderRadius:12,overflow:"hidden",
                        position:"relative",marginBottom:12,maxHeight:340}}>
                        <video ref={videoRef} autoPlay playsInline muted
                          style={{width:"100%",display:"block",maxHeight:340,objectFit:"cover"}}/>
                        <canvas ref={canvasRef} style={{display:"none"}}/>
                        <div style={{position:"absolute",inset:0,display:"flex",
                          alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                          <div style={{width:"55%",aspectRatio:"1",border:`3px solid ${G}`,
                            borderRadius:16}}/>
                        </div>
                        <div style={{position:"absolute",bottom:8,left:0,right:0,textAlign:"center",
                          color:"rgba(255,255,255,0.85)",fontSize:11}}>
                          Align the QR code within the frame
                        </div>
                      </div>
                      <button onClick={stopCamera}
                        style={{...webBtn("#F3F0EB","#5A3A42"),width:"100%"}}>
                        Cancel Scan
                      </button>
                    </div>
                  ):(
                    <>
                      {cameraError&&(
                        <div style={{background:"#FBEAEA",color:"#C0392B",fontSize:12,
                          padding:"10px 14px",borderRadius:8,marginBottom:12}}>{cameraError}</div>
                      )}
                      <button onClick={startCamera} style={{...webBtn(NV,W),width:"100%",
                        padding:"14px",fontSize:15,marginBottom:16,display:"flex",
                        alignItems:"center",justifyContent:"center",gap:8}}>
                        <span style={{fontSize:20}}>📷</span> Open Camera & Scan
                      </button>
                    </>
                  )}

                  {/* Manual fallback — also checks against GSMB database */}
                  <div style={{borderTop:"1px solid #F0EBE3",paddingTop:14,marginTop:4}}>
                    <div style={{fontSize:12,color:"#9CA3AF",marginBottom:8,textAlign:"center"}}>
                      — or enter permit number manually —
                    </div>
                    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                      <input value={manualCode} onChange={e=>setManualCode(e.target.value.toUpperCase())}
                        placeholder="e.g. PMT-2026-0143"
                        style={{...webInput,flex:1,minWidth:160}}
                        onKeyDown={e=>{if(e.key==="Enter"&&manualCode.trim())verifyPermit(manualCode);}}/>
                      <button onClick={()=>verifyPermit(manualCode)}
                        disabled={!manualCode.trim()}
                        style={webBtn(!manualCode.trim()?"#DDD5C8":NV,W,{flexShrink:0})}>
                        Verify with GSMB
                      </button>
                    </div>
                    <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,color:"#9CA3AF",alignSelf:"center"}}>Test:</span>
                      {["PMT-2026-0143","PMT-2026-0139","PMT-INVALID-001"].map(id=>(
                        <button key={id} onClick={()=>verifyPermit(id)}
                          style={webBtn("#EFF4FA",NV,{fontSize:11,padding:"4px 10px"})}>
                          {id}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scan Result */}
                {scanResult&&(
                  <>
                    <div style={{background:"#fff",borderRadius:16,padding:isDesktop?"22px":"18px",
                      boxShadow:"0 2px 10px rgba(0,0,0,0.06)",
                      border:`2px solid ${scanResult.statusCheck==="Valid"?"#86EFAC":"#FCA5A5"}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:52,height:52,borderRadius:"50%",
                          background:scanResult.statusCheck==="Valid"?"#E5F5EA":"#FBEAEA",
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>
                          {scanResult.statusCheck==="Valid"?"✅":"❌"}
                        </div>
                        <div>
                          <div style={{fontSize:19,fontWeight:900,
                            color:scanResult.statusCheck==="Valid"?"#1E8A4C":"#C0392B"}}>
                            {scanResult.statusCheck==="Valid"?"Permit VALID":"NOT GSMB VERIFIED"}
                          </div>
                          <div style={{fontSize:12,color:"#6B7280"}}>
                            Scanned {scanResult.scannedAt} · {scanResult.scannedDate} · {officer.station}
                          </div>
                        </div>
                      </div>
                      {scanResult.statusCheck!=="Valid"&&(
                        <div style={{marginTop:14,background:"#FBEAEA",borderRadius:10,padding:"14px",
                          fontSize:13,color:"#C0392B"}}>
                          ⚠️ <b>{scanResult.permitId}</b> was not found in the GSMB permit database.<br/>
                          <span style={{fontSize:12,opacity:0.8}}>
                            This is not a GSMB-verified permit. It may be fake, expired, or not registered. Take appropriate action.
                          </span>
                        </div>
                      )}
                    </div>

                    {scanResult.statusCheck==="Valid"&&(
                      <>
                        {/* Police checkpoint location verification */}
                        <div style={{background:"#fff",borderRadius:16,padding:isDesktop?"22px":"18px",
                          boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                          <div style={{fontSize:14,fontWeight:800,color:NV,marginBottom:10}}>
                            📍 Police Checkpoint Verification
                          </div>
                          {locationStatus==="locating"&&(
                            <div style={{fontSize:12,color:"#6B7280",padding:"6px 0"}}>
                              Detecting your current location...
                            </div>
                          )}
                          {locationStatus==="done"&&capturedLocation&&!editLocation&&(
                            <>
                              <div style={{fontSize:13,fontWeight:700,color:"#1A0A0F",marginBottom:2}}>
                                {capturedLocation.lat}, {capturedLocation.lng}
                              </div>
                              <div style={{fontSize:11,color:"#9CA3AF",marginBottom:12}}>
                                Accuracy: ±{capturedLocation.accuracy}m · auto-detected from your device
                              </div>
                              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                                <button onClick={confirmLocation}
                                  style={{...webBtn("#1E8A4C","#fff"),flex:1,minWidth:160}}>
                                  ✓ Confirm — this is correct
                                </button>
                                <button onClick={()=>setEditLocation(true)}
                                  style={webBtn("#F3F0EB","#5A3A42")}>
                                  ✏️ Not correct
                                </button>
                              </div>
                            </>
                          )}
                          {(locationStatus==="denied"||editLocation)&&(
                            <>
                              {locationStatus==="denied"&&(
                                <>
                                  <div style={{fontSize:12,color:"#C0392B",marginBottom:10,lineHeight:1.5}}>
                                    {locationErrorMsg||"Location access unavailable."}
                                  </div>
                                  <button onClick={captureLocation}
                                    style={{...webBtn("#EFF4FA",NV),width:"100%",marginBottom:10}}>
                                    🔄 Try Detecting Location Again
                                  </button>
                                  <div style={{fontSize:11,color:"#9CA3AF",marginBottom:10,textAlign:"center"}}>
                                    — or enter it yourself —
                                  </div>
                                </>
                              )}
                              <input value={manualLocation} onChange={e=>setManualLocation(e.target.value)}
                                placeholder="e.g. Badulla–Bandarawela Rd, near 14km post"
                                style={{...webInput,marginBottom:8}}/>
                              <button disabled={!manualLocation.trim()} onClick={confirmLocation}
                                style={{...webBtn(!manualLocation.trim()?"#DDD5C8":"#1E8A4C","#fff"),width:"100%"}}>
                                ✓ Attach Correct Location
                              </button>
                            </>
                          )}
                          {locationStatus==="attached"&&(
                            <div style={{fontSize:12,color:"#1E8A4C",fontWeight:700}}>
                              ✓ Location verified and attached — visible to GSMB on this permit
                            </div>
                          )}
                        </div>

                        {/* Live vehicle map — place reserved for GPS tracking */}
                        <div style={{background:"#fff",borderRadius:16,padding:isDesktop?"22px":"18px",
                          boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                          <div style={{fontSize:14,fontWeight:800,color:NV,marginBottom:10}}>
                            🛰 Vehicle Map
                          </div>
                          <div style={{background:"#EFF1EA",border:"1.5px dashed #DDD5C8",borderRadius:14,
                            padding:"30px 16px",textAlign:"center"}}>
                            <div style={{fontSize:24,marginBottom:6}}>🛰</div>
                            <div style={{fontSize:12,fontWeight:700,color:"#5A3A42",marginBottom:2}}>
                              Live map view
                            </div>
                            <div style={{fontSize:11,color:"#9CA3AF"}}>
                              Will show this vehicle's live location and route once GPS tracking is connected
                            </div>
                          </div>
                        </div>

                        {/* Full Form 7 permit, front + trip log on the back */}
                        <GSMBPermitDetail permit={scanResult} allowSave={false}/>
                      </>
                    )}

                    <button onClick={()=>{setScanResult(null);setLocationStatus("idle");}}
                      style={{...webBtn("#EFF4FA",NV),width:"100%"}}>
                      Scan Another Permit
                    </button>
                  </>
                )}
              </div>
            )}

            {/* LOG TAB */}
            {activeTab==="log"&&(
              <div style={{background:"#fff",borderRadius:16,padding:isDesktop?"28px":"18px",
                boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                <div style={{fontSize:20,fontWeight:800,color:NV,marginBottom:18}}>
                  My Checkpoint Log
                </div>
                <div style={{position:"relative",marginBottom:20,maxWidth:380}}>
                  <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",
                    fontSize:15,color:"#9CA3AF"}}>🔍</span>
                  <input value={logSearch} onChange={e=>setLogSearch(e.target.value)}
                    placeholder="Search by permit number or vehicle..."
                    style={{...webInput,paddingLeft:40,fontSize:14,padding:"12px 16px 12px 40px"}}/>
                </div>
                {(()=>{
                  const filtered=checkpoints.filter(c=>!logSearch||
                    c.permitId.toLowerCase().includes(logSearch.toLowerCase())||
                    c.vehicle.toLowerCase().includes(logSearch.toLowerCase()));
                  if(filtered.length===0) return(
                    <div style={{textAlign:"center",color:"#9CA3AF",fontSize:13,padding:"30px 0"}}>
                      {checkpoints.length===0
                        ?"No checkpoints logged yet. Start scanning permits."
                        :"No checkpoints match your search."}
                    </div>
                  );
                  const groups=[];
                  filtered.forEach(c=>{
                    let g=groups.find(g=>g.date===c.date);
                    if(!g){g={date:c.date,items:[]};groups.push(g);}
                    g.items.push(c);
                  });
                  return groups.map((g,gi)=>(
                    <div key={g.date} style={{marginBottom:gi<groups.length-1?18:0}}>
                      <div style={{fontSize:11,fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",
                        letterSpacing:"0.06em",marginBottom:6}}>
                        {g.date===todayStr?"Today":g.date}
                      </div>
                      {g.items.map((c,i)=>(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",
                          alignItems:"center",padding:"12px 0",flexWrap:"wrap",gap:8,maxWidth:640,
                          borderBottom:i<g.items.length-1?"1px solid #F0EBE3":"none"}}>
                          <div style={{display:"flex",gap:12,alignItems:"center"}}>
                            <div style={{width:36,height:36,borderRadius:10,
                              background:c.result==="Valid"?"#E5F5EA":"#FBEAEA",
                              display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
                              {c.result==="Valid"?"✅":"❌"}
                            </div>
                            <div>
                              <div style={{fontSize:13,fontWeight:700,color:"#1A0A0F"}}>{c.permitId}</div>
                              <div style={{fontSize:11,color:"#6B7280"}}>{c.vehicle} · {c.date} {c.time}</div>
                              {c.locationText&&(
                                <div style={{fontSize:11,color:"#1E8A4C",marginTop:2}}>📍 {c.locationText}</div>
                              )}
                            </div>
                          </div>
                          <span style={{fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:20,
                            background:c.result==="Valid"?"#E5F5EA":"#FBEAEA",
                            color:c.result==="Valid"?"#1E8A4C":"#C0392B"}}>
                            {c.result}
                          </span>
                        </div>
                      ))}
                    </div>
                  ));
                })()}
              </div>
            )}

            {/* PROFILE TAB (Settings folded in) */}
            {activeTab==="profile"&&(
              showSettings?(
                <div>
                  <button onClick={()=>setShowSettings(false)}
                    style={{...webBtn("#F3F0EB","#5A3A42"),marginBottom:16}}>← Back to Profile</button>
                  <WebSettingsScreen profile={profile} setProfile={setProfile}
                    onLogout={onLogout} accent={NV}/>
                </div>
              ):(
                <div style={{background:"#fff",borderRadius:16,padding:isDesktop?"22px":"18px",
                  boxShadow:"0 2px 10px rgba(0,0,0,0.06)",maxWidth:480}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20,
                    paddingBottom:16,borderBottom:"1px solid #F0EBE3"}}>
                    <div style={{width:56,height:56,borderRadius:"50%",background:NV,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      color:G,fontSize:22,fontWeight:800,flexShrink:0}}>
                      {profile.name.split(" ").pop().charAt(0)}
                    </div>
                    <div>
                      <div style={{fontSize:16,fontWeight:800,color:"#1A0A0F"}}>{profile.name}</div>
                      <div style={{fontSize:12,color:"#6B7280"}}>{officer.station}</div>
                    </div>
                  </div>
                  {[
                    ["Badge / Service ID",officer.badgeId],
                    ["Police Station",officer.station],
                    ["Unit","Sand Transport Enforcement"],
                    ["Session","Active (7 days)"],
                  ].map(([l,v],i,a)=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",
                      padding:"12px 0",borderBottom:i<a.length-1?"1px solid #F0EBE3":"none"}}>
                      <span style={{fontSize:13,color:"#6B7280"}}>{l}</span>
                      <span style={{fontSize:13,fontWeight:600,color:"#1A0A0F"}}>{v}</span>
                    </div>
                  ))}
                  <button onClick={()=>setShowSettings(true)} style={{...webBtn("#EFF4FA",NV),
                    width:"100%",marginTop:16}}>
                    ⚙️ Settings
                  </button>
                  <button onClick={onLogout} style={{...webBtn("#FBEAEA","#C0392B"),
                    width:"100%",marginTop:10}}>
                    Sign Out
                  </button>
                </div>
              )
            )}
        </div>
      </div>

      {!isDesktop&&<PoliceMobileNav activeTab={activeTab} setActiveTab={switchTab}/>}
    </div>
  );
}

export function PoliceLogin({onLogout}){
  const SESSION_KEY="sandpass_police_session";
  const SESSION_DAYS=7;
  const isDesktop=useIsDesktop();

  const getSavedSession=()=>{
    try{
      const saved=localStorage.getItem(SESSION_KEY);
      if(!saved) return null;
      const {officer,expiry}=JSON.parse(saved);
      if(new Date().getTime()>expiry){localStorage.removeItem(SESSION_KEY);return null;}
      return officer;
    }catch(e){return null;}
  };

  // Always start logged out — auto-login only on first mount (not after sign-out remount)
  const [loggedIn,setLoggedIn]=useState(false);
  const [officer,setOfficer]=useState(null);
  const [view,setView]=useState("login"); // login | register
  const [station,setStation]=useState("");
  const [badgeId,setBadgeId]=useState("");
  const [password,setPassword]=useState("");
  const [remember,setRemember]=useState(true);
  const [error,setError]=useState("");

  // Register fields
  const [regName,setRegName]=useState("");
  const [regEmail,setRegEmail]=useState("");
  const [regPhone,setRegPhone]=useState("");
  const [regConfirmPw,setRegConfirmPw]=useState("");
  const [agreedTerms,setAgreedTerms]=useState(false);

  const persistSession=(officerData)=>{
    if(remember){
      try{
        const expiry=new Date().getTime()+(SESSION_DAYS*24*60*60*1000);
        localStorage.setItem(SESSION_KEY,JSON.stringify({officer:officerData,expiry}));
      }catch(e){}
    }
    setOfficer(officerData);setLoggedIn(true);
  };

  const handleLogin=()=>{
    if(!badgeId.trim()||!password.trim()||!station.trim()){
      setError("Please fill in all fields.");return;
    }
    setError("");
    persistSession({name:`Officer ${badgeId}`,badgeId,station:station.trim()});
  };

  const handleRegister=()=>{
    if(!agreedTerms){setError("Please agree to the Terms & Conditions.");return;}
    if(!regName.trim()||!badgeId.trim()||!station.trim()||!regEmail.trim()||!password.trim()){
      setError("Please fill in all required fields.");return;
    }
    if(password!==regConfirmPw){setError("Passwords do not match.");return;}
    setError("");
    persistSession({name:regName.trim(),badgeId,station:station.trim(),email:regEmail,phone:regPhone});
  };

  const handleLogout=()=>{
    try{localStorage.removeItem(SESSION_KEY);}catch(e){}
    if(onLogout){ onLogout(); return; }
    setLoggedIn(false);setOfficer(null);
  };

  if(loggedIn&&officer) return <PoliceDashboard officer={officer} onLogout={handleLogout}/>;

  return(
    <div style={{width:"100%",minHeight:"calc(100vh - 56px)",
      display:"flex",flexDirection:isDesktop?"row":"column",
      fontFamily:"'Segoe UI',system-ui,sans-serif",overflow:"hidden"}}>

      {/* Branding panel — full feature panel on desktop, compact banner on mobile */}
      <div style={{width:isDesktop?500:"100%",flexShrink:0,background:`linear-gradient(160deg,${NV} 0%,${NM} 60%,#1E3A6A 100%)`,
        padding:isDesktop?"48px 40px":"28px 24px",display:"flex",flexDirection:"column",
        justifyContent:"space-between",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-60,right:-60,width:250,height:250,
          borderRadius:"50%",background:"rgba(201,168,76,0.06)"}}/>
        {isDesktop&&<div style={{position:"absolute",bottom:-80,left:-80,width:300,height:300,
          borderRadius:"50%",background:"rgba(255,255,255,0.03)"}}/>}

        <div style={{position:"relative"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,
            background:"rgba(201,168,76,0.15)",border:"1px solid rgba(201,168,76,0.4)",
            borderRadius:8,padding:"7px 16px",marginBottom:isDesktop?38:16}}>
            <SLCrest size={isDesktop?24:18}/>
            <span style={{color:G,fontSize:12,fontWeight:800,letterSpacing:"0.1em"}}>
              GOVERNMENT OF SRI LANKA
            </span>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:18,marginBottom:isDesktop?32:14}}>
            <SLCrest size={isDesktop?68:36}/>
            <div style={{width:1,height:isDesktop?56:30,background:"rgba(201,168,76,0.4)"}}/>
            <PoliceLogo size={isDesktop?68:36}/>
          </div>

          <h1 style={{color:W,fontSize:isDesktop?40:22,fontWeight:900,margin:"0 0 8px",lineHeight:1.15}}>
            Sri Lanka Police
          </h1>
          <div style={{color:G,fontSize:isDesktop?14:11,fontWeight:700,letterSpacing:"0.1em",
            textTransform:"uppercase",marginBottom:isDesktop?28:0}}>
            Sand Transport Enforcement System
          </div>

          {isDesktop&&(
            <>
              <div style={{width:54,height:3,background:G,borderRadius:2,marginBottom:26}}/>
              <p style={{color:"#B8C8D8",fontSize:16,lineHeight:1.9,margin:0,maxWidth:400}}>
                Digital permit verification system for police officers enforcing sand transport regulations under the Mines and Minerals Act No. 33 of 1992.
              </p>
            </>
          )}
        </div>

        {isDesktop&&(
          <div style={{position:"relative",color:"rgba(201,168,76,0.6)",fontSize:12}}>
            © 2025 Sri Lanka Police · Traffic & Transport Division
          </div>
        )}
      </div>

      {/* Form panel — fills remaining width, white background */}
      <div style={{flex:1,minWidth:0,background:"#fff",display:"flex",
        flexDirection:"column",padding:isDesktop?"48px 56px":"28px 20px",overflowY:"auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:26}}>
            <PoliceLogo size={isDesktop?50:36}/>
            <div>
              <h2 style={{fontSize:isDesktop?26:20,fontWeight:900,color:NV,margin:0}}>
                {view==="login"?"Officer Sign In":"Officer Registration"}
              </h2>
              <p style={{fontSize:13,color:GR,margin:0}}>Sand Transport Enforcement Portal</p>
            </div>
          </div>

          <div style={{display:"flex",background:"#EFF2F6",borderRadius:10,padding:4,marginBottom:24}}>
            {["login","register"].map(v=>(
                <button key={v} onClick={()=>{setView(v);setError("");}} style={{flex:1,
                  padding:"11px 0",border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:"pointer",
                  transition:"all 0.15s",
                  background:view===v?NV:"transparent",color:view===v?W:"#5A6B7D",
                  boxShadow:view===v?"0 4px 12px rgba(13,31,60,0.25)":"none"}}>
                  {v==="login"?"Sign In":"Register"}
                </button>
              ))}
            </div>

            {view==="login"?(
              <>
                <IconField icon="🏛️" label="Police Station" placeholder="e.g. Badulla Police Station"
                  value={station} onChange={e=>setStation(e.target.value)}/>
                <IconField icon="🎫" label="Badge / Service ID" placeholder="Enter your badge number"
                  value={badgeId} onChange={e=>setBadgeId(e.target.value)}/>
                <IconField icon="🔒" label="Password" type="password" placeholder="Enter your password"
                  value={password} onChange={e=>setPassword(e.target.value)}/>

                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                  marginTop:-8,marginBottom:22}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:14,
                    color:TS,cursor:"pointer"}}>
                    <input type="checkbox" checked={remember}
                      onChange={e=>setRemember(e.target.checked)}
                      style={{accentColor:NV,width:16,height:16}}/>
                    Keep me signed in
                  </label>
                </div>

                {error&&(
                  <div style={{color:"#C0392B",fontSize:13,fontWeight:600,marginBottom:14,
                    padding:"9px 14px",background:"#FBEAEA",borderRadius:8}}>{error}</div>
                )}

                <button onClick={handleLogin}
                  style={{...baseBtn,background:NV,color:W,marginBottom:16,padding:"16px",fontSize:16}}>
                  Sign In →
                </button>
              </>
            ):(
              <>
                <IconField icon="👤" label="Full Name" placeholder="Name as on warrant card"
                  value={regName} onChange={e=>setRegName(e.target.value)}/>
                <IconField icon="🎫" label="Badge / Service ID" placeholder="Enter your badge number"
                  value={badgeId} onChange={e=>setBadgeId(e.target.value)}/>
                <IconField icon="🏛️" label="Police Station" placeholder="e.g. Badulla Police Station"
                  value={station} onChange={e=>setStation(e.target.value)}/>
                <IconField icon="📧" label="Email Address" type="email" placeholder="Enter your email"
                  value={regEmail} onChange={e=>setRegEmail(e.target.value)}/>
                <IconField icon="📱" label="Phone Number" placeholder="Enter mobile number"
                  value={regPhone} onChange={e=>setRegPhone(e.target.value)}/>
                <IconField icon="🔒" label="Password" type="password" placeholder="Create a strong password"
                  value={password} onChange={e=>setPassword(e.target.value)}/>
                <IconField icon="🔒" label="Confirm Password" type="password" placeholder="Re-enter your password"
                  value={regConfirmPw} onChange={e=>setRegConfirmPw(e.target.value)}/>

                <label style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:12,
                  color:TS,cursor:"pointer",marginBottom:14}}>
                  <input type="checkbox" checked={agreedTerms}
                    onChange={e=>setAgreedTerms(e.target.checked)}
                    style={{accentColor:NV,width:15,height:15,marginTop:2,flexShrink:0}}/>
                  I confirm I am an authorised Sri Lanka Police officer and agree to the Terms & Conditions of this system.
                </label>

                {error&&(
                  <div style={{color:"#C0392B",fontSize:12,fontWeight:600,marginBottom:12,
                    padding:"8px 12px",background:"#FBEAEA",borderRadius:8}}>{error}</div>
                )}

                <button onClick={handleRegister}
                  style={{...baseBtn,background:NV,color:W,marginBottom:16}}>
                  Create Officer Account →
                </button>
              </>
            )}

            <div style={{padding:"14px 18px",background:"#EFF4FA",
              border:"1px solid rgba(184,200,216,0.55)",borderRadius:10,
              fontSize:13,color:"#334155",lineHeight:1.75}}>
              🔒 Restricted to authorised Sri Lanka Police officers only.
              All access is logged and monitored.
            </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════
