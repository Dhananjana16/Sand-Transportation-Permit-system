// Driver permit detail - view permit, start trip, end trip and location tracking

import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn, t } from "./theme";
import { StatusBadge, BackHeader, ScrollBody, PhoneFrame, FormSection, QRCode } from "./uiComponents"; // eslint-disable-line
import { useTicker, getTripStatus, fmtMinutes } from "./tripUtils";
import { PermitViewer } from "./PermitViewer";
import { LiveMap } from "./LiveMap";

export function DriverPermitDetail({permit,onBack,onRequestTrip,onEndTrip,onSubmitDelayReason}){
  const [showBack,setShowBack]=useState(false);
  const [delayReason,setDelayReason]=useState("");
  const [delayProofFile,setDelayProofFile]=useState(null);
  const [checkpointNotes,setCheckpointNotes]=useState([]);
  const [tripDestination,setTripDestination]=useState(permit.destination||"");
  const [startStep,setStartStep]=useState("destination"); // destination | location
  const [locationCaptureStatus,setLocationCaptureStatus]=useState("idle"); // idle | capturing | captured | error

  const captureStartLocation=()=>{
    if(!navigator.geolocation){setLocationCaptureStatus("error");return;}
    setLocationCaptureStatus("capturing");
    navigator.geolocation.getCurrentPosition(
      ()=>{ setLocationCaptureStatus("captured"); },
      ()=>{ setLocationCaptureStatus("error"); },
      {enableHighAccuracy:true,timeout:10000}
    );
  };
  useTicker(15000);
  const qrData=`SANDPASS|${permit.id}|${permit.licenceNo}|VEH:${permit.vehicleNo}|TRIPS:${permit.trips.length}/${permit.tripsTotal}`;
  const status=permit.tripInProgress?getTripStatus(permit.tripInProgress,permit.estimatedTripMinutes):null;

  const [locationShareStatus,setLocationShareStatus]=useState("idle"); // idle | sharing | error

  // While a trip is active, quietly share this device's GPS location every
  // ~20 seconds so the Permit Holder and Police can see it on a live map.
  useEffect(()=>{
    if(!permit.tripInProgress?.tripRowId) return;
    const tripRowId=permit.tripInProgress.tripRowId;
    const sendLocation=()=>{
      if(!navigator.geolocation){setLocationShareStatus("error");return;}
      navigator.geolocation.getCurrentPosition(async(pos)=>{
        const {error}=await supabase.from("trip_locations").insert({
          trip_id:tripRowId,
          lat:pos.coords.latitude,
          lng:pos.coords.longitude,
        });
        setLocationShareStatus(error?"error":"sharing");
      },(err)=>{
        console.warn("GPS location error:",err.message);
        setLocationShareStatus("error");
      },
      {enableHighAccuracy:true,timeout:10000});
    };
    sendLocation();
    const interval=setInterval(sendLocation,20000);
    return ()=>clearInterval(interval);
  },[permit.tripInProgress?.tripRowId]);

  useEffect(()=>{
    let cancelled=false;
    const loadCheckpoints=async()=>{
      const {data,error}=await supabase
        .from("checkpoints")
        .select("*, profiles(full_name, station)")
        .eq("permit_id",permit.id)
        .order("checked_at",{ascending:false});
      if(!error&&data&&!cancelled){
        setCheckpointNotes(data.map(c=>({
          officer:c.profiles?.full_name||"Unknown Officer",
          station:c.profiles?.station||"—",
          date:new Date(c.checked_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}),
          time:new Date(c.checked_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
          locationText:c.location_name||"No location recorded",
        })));
      }
    };
    if(permit?.id) loadCheckpoints();
    return ()=>{cancelled=true;};
  },[permit?.id]);

  return(
    <>
      <BackHeader title={permit.id} subtitle="Permit Detail" onBack={onBack}/>
      <div style={{flex:1,padding:"18px 16px 24px",overflowY:"auto",minHeight:0}}>

        {/* Front/Back toggle */}
        <div style={{display:"flex",background:"#E8E0D8",borderRadius:10,padding:4,marginBottom:14}}>
          {["Permit Details","Trip Log"].map((t,i)=>(
            <button key={i} onClick={()=>setShowBack(i===1)} style={{flex:1,padding:"9px",border:"none",
              borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",
              background:showBack===(i===1)?W:"transparent",color:showBack===(i===1)?M:GR,
              boxShadow:showBack===(i===1)?"0 1px 4px #00000022":"none"}}>
              {t}
            </button>
          ))}
        </div>

        {!showBack?(
          <>
            {/* QR Code Card */}
            <div style={{background:W,borderRadius:16,padding:"20px",marginBottom:16,
              boxShadow:"0 2px 10px rgba(0,0,0,0.05)",display:"flex",flexDirection:"column",alignItems:"center"}}>
              <div style={{fontSize:12,fontWeight:700,color:TS,marginBottom:12,textAlign:"center"}}>
                Show QR code to Police at checkpoints
              </div>
              <QRCode data={qrData} size={170}/>
              <div style={{fontSize:10,color:GR,marginTop:10,textAlign:"center"}}>
                {permit.id} · Vehicle: {permit.vehicleNo} · Trips {permit.trips.length}/{permit.tripsTotal}
              </div>
            </div>

            <FormSection title="Permit Details">
              <div style={{fontSize:12,color:TS,lineHeight:2}}>
                <div><b>Licence No.:</b> {permit.licenceNo}</div>
                <div><b>Vehicle No.:</b> {permit.vehicleNo}</div>
                <div><b>Mineral:</b> {permit.mineral} · {permit.qty} {permit.unit}</div>
                <div><b>From:</b> {permit.startPlace}</div>
                <div><b>To:</b> {permit.destination}</div>
                {permit.via1&&<div><b>Via:</b> {[permit.via1,permit.via2,permit.via3,permit.via4].filter(Boolean).join(" → ")}</div>}
                <div><b>Valid:</b> {permit.validFrom} – {permit.validTo}</div>
                <div><b>Permit Holder:</b> {permit.holderName}</div>
              </div>
            </FormSection>

            {checkpointNotes.length>0&&(
              <div style={{background:W,borderRadius:14,padding:"14px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)",marginTop:14}}>
                <div style={{fontSize:12,fontWeight:800,color:M,marginBottom:10,textTransform:"uppercase"}}>
                  📍 Police Checkpoint History
                </div>
                {checkpointNotes.map((c,i)=>(
                  <div key={i} style={{padding:"9px 0",
                    borderBottom:i<checkpointNotes.length-1?"1px solid #F3F0EB":"none"}}>
                    <div style={{fontSize:12,fontWeight:700,color:TX}}>{c.officer} · {c.station}</div>
                    <div style={{fontSize:11,color:GR}}>{c.date}, {c.time}</div>
                    <div style={{fontSize:11,color:"#1E8A4C",marginTop:2}}>📍 {c.locationText}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        ):(
          <>
            {/* Trip Control */}
            <div style={{background:W,borderRadius:16,padding:"16px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)",marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:800,color:TX,marginBottom:12}}>Trip Control</div>
              {permit.tripInProgress?(
                <>
                  <div style={{background:"#E5F5EA",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#1E8A4C",marginBottom:4}}>
                      🚚 Trip {permit.trips.length+1} in progress
                    </div>
                    <div style={{fontSize:12,color:TS}}>Started: {permit.tripInProgress.startTime}</div>
                    {permit.tripInProgress.destination&&(
                      <div style={{fontSize:12,color:TS}}>Destination: {permit.tripInProgress.destination}</div>
                    )}
                  </div>
                  {locationShareStatus==="error"&&(
                    <div style={{background:"#FBEAEA",borderRadius:10,padding:"10px 12px",marginBottom:14,
                      fontSize:11,color:"#C0392B",lineHeight:1.5}}>
                      ⚠️ Couldn't get your location. Check location permission is allowed for this site.
                    </div>
                  )}
                  {status&&(
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:10}}>
                      <span style={{color:GR}}>Elapsed: <b style={{color:TX}}>{fmtMinutes(status.elapsedMin)}</b></span>
                      <span style={{color:status.remaining<0?"#C0392B":GR}}>
                        {status.remaining<0?`⚠️ ${fmtMinutes(-status.remaining)} over ETA`:`ETA in ${fmtMinutes(status.remaining)}`}
                      </span>
                    </div>
                  )}
                  <div style={{marginBottom:14}}>
                    <LiveMap tripRowId={permit.tripInProgress.tripRowId}
                      driverName={permit.tripInProgress.driverName} vehicleNo={permit.vehicleNo}
                      startPlace={permit.startPlace} interactive
                      destination={permit.tripInProgress.destination||permit.destination}/>
                  </div>
                  {status&&status.delayed&&(
                    <div style={{background:"#FBEAEA",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#C0392B",marginBottom:8}}>
                        ⚠️ This trip is running late — let the permit holder know why
                      </div>
                      {permit.tripInProgress.delayReason?(
                        <div style={{fontSize:12,color:TS}}>
                          ✓ Reason submitted: "{permit.tripInProgress.delayReason}"
                          {permit.tripInProgress.proofUrl&&(
                            <div style={{marginTop:6}}>
                              <a href={permit.tripInProgress.proofUrl} target="_blank" rel="noopener noreferrer"
                                style={{color:"#1E8A4C",fontWeight:700,fontSize:12,textDecoration:"underline"}}>
                                📎 View your attached proof
                              </a>
                            </div>
                          )}
                        </div>
                      ):(
                        <>
                          <textarea value={delayReason} onChange={e=>setDelayReason(e.target.value)}
                            placeholder="e.g. Heavy traffic near Kaduwela junction"
                            style={{width:"100%",minHeight:60,padding:"10px",borderRadius:8,
                              border:"1.5px solid #F3C6C6",fontSize:12,fontFamily:"inherit",
                              boxSizing:"border-box",marginBottom:8,resize:"vertical"}}/>
                          <label style={{display:"block",padding:"8px 12px",borderRadius:8,
                            border:"1.5px dashed #F3C6C6",fontSize:11,color:TS,textAlign:"center",
                            cursor:"pointer",marginBottom:8}}>
                            {delayProofFile?`📎 ${delayProofFile.name}`:"📎 Attach proof photo (optional)"}
                            <input type="file" accept="image/*" style={{display:"none"}}
                              onChange={e=>setDelayProofFile(e.target.files[0])}/>
                          </label>
                          <button onClick={()=>{
                            if(!delayReason.trim()) return;
                            onSubmitDelayReason(permit.id,delayReason.trim(),delayProofFile);
                            setDelayReason("");setDelayProofFile(null);
                          }} style={{width:"100%",padding:"9px",borderRadius:8,border:"none",
                            background:"#C0392B",color:W,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                            Submit Delay Reason
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  <button onClick={onEndTrip} style={{...baseBtn,background:"#C0392B",color:W}}>
                    End Trip & Record Completion
                  </button>
                </>
              ):permit.trips.length>=permit.tripsTotal?(
                <div style={{textAlign:"center",color:"#C0392B",fontSize:12,padding:"10px 0"}}>
                  All {permit.tripsTotal} trips used. This permit is complete.
                </div>
              ):(
                <>
                  <div style={{background:GP,border:`1px solid ${G}55`,borderRadius:10,
                    padding:"12px 14px",marginBottom:14,fontSize:12,color:TS,lineHeight:1.6}}>
                    📋 By starting this trip you confirm you are the authorized driver for vehicle <b>{permit.vehicleNo}</b> and will transport sand as per the permit conditions.
                  </div>

                  {startStep==="destination"&&(
                    <>
                      <label style={{display:"block",fontSize:12,fontWeight:700,color:TS,marginBottom:6}}>
                        Step 1 — Destination for this trip
                      </label>
                      <input value={tripDestination} onChange={e=>setTripDestination(e.target.value)}
                        placeholder="e.g. Test Construction Site"
                        style={{...baseInput,marginBottom:14,fontSize:13}}/>
                      <button onClick={()=>setStartStep("location")}
                        disabled={!tripDestination.trim()&&!permit.destination}
                        style={{...baseBtn,background:M,color:W}}>
                        Next →
                      </button>
                    </>
                  )}

                  {startStep==="location"&&(
                    <>
                      <div style={{fontSize:12,fontWeight:700,color:TS,marginBottom:10}}>
                        Step 2 — Confirm your current location
                      </div>
                      {locationCaptureStatus==="idle"&&(
                        <button onClick={captureStartLocation}
                          style={{...baseBtn,background:M,color:W}}>
                          📍 Get My Current Location
                        </button>
                      )}
                      {locationCaptureStatus==="capturing"&&(
                        <div style={{textAlign:"center",padding:"14px",fontSize:12,color:TS}}>
                          Getting your location…
                        </div>
                      )}
                      {locationCaptureStatus==="error"&&(
                        <>
                          <div style={{background:"#FBEAEA",borderRadius:10,padding:"10px 12px",marginBottom:10,
                            fontSize:11,color:"#C0392B",lineHeight:1.5}}>
                            ⚠️ Couldn't get your location. Check location permission is allowed for this site, then try again.
                          </div>
                          <button onClick={captureStartLocation} style={{...baseBtn,background:M,color:W}}>
                            Try Again
                          </button>
                        </>
                      )}
                      {locationCaptureStatus==="captured"&&(
                        <>
                          <div style={{background:"#E5F5EA",borderRadius:10,padding:"10px 12px",marginBottom:12,
                            fontSize:12,color:"#1E8A4C",fontWeight:600}}>
                            ✓ Location captured
                          </div>
                          <button onClick={()=>onRequestTrip(tripDestination.trim()||permit.destination)}
                            style={{...baseBtn,background:`linear-gradient(135deg,${M},${ML})`,color:W}}>
                            ✍️ Sign & Start Trip {permit.trips.length+1} of {permit.tripsTotal}
                          </button>
                        </>
                      )}
                      <div onClick={()=>setStartStep("destination")} style={{textAlign:"center",marginTop:10,
                        fontSize:11,color:GR,cursor:"pointer",textDecoration:"underline"}}>
                        ← Back to destination
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <div style={{background:W,borderRadius:14,padding:"14px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)",marginTop:14}}>
              <div style={{fontSize:12,fontWeight:800,color:M,marginBottom:10,textTransform:"uppercase"}}>Past Trips</div>
              {permit.trips.map((t,i)=>(
                <div key={i} style={{padding:"10px 0",borderBottom:i<permit.trips.length-1?"1px solid #F3F0EB":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:700,color:TX}}>Trip {i+1} · {t.date}</span>
                    <StatusBadge status={t.status==="Completed"?"Approved":"In Progress"}/>
                  </div>
                  <div style={{fontSize:12,color:TS}}>Start: {t.startTime}{t.endTime?` · End: ${t.endTime}`:""}</div>
                  {t.destination&&<div style={{fontSize:11,color:GR}}>To: {t.destination}</div>}
                  {t.policeOfficer&&<div style={{fontSize:11,color:GR}}>Checked by: {t.policeOfficer}</div>}
                </div>
              ))}
              {permit.trips.length===0&&(
                <div style={{textAlign:"center",color:"#9CA3AF",fontSize:12,padding:"16px 0"}}>No trips yet.</div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

