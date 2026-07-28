// Driver permit detail - view permit, start trip, end trip and location tracking

import { useState, useEffect, useRef } from "react";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn, t } from "./theme";
import { StatusBadge, BackHeader, ScrollBody, PhoneFrame, FormSection, QRCode } from "./uiComponents"; // eslint-disable-line
import { useTicker, getTripStatus, fmtMinutes } from "./tripUtils";
import { PermitViewer } from "./PermitViewer";

export function DriverPermitDetail({permit,onBack,onRequestTrip,onEndTrip}){
  const [showBack,setShowBack]=useState(false);
  useTicker(15000);
  const qrData=`SANDPASS|${permit.id}|${permit.licenceNo}|VEH:${permit.vehicleNo}|TRIPS:${permit.trips.length}/${permit.tripsTotal}`;
  const status=permit.tripInProgress?getTripStatus(permit.tripInProgress,permit.estimatedTripMinutes):null;

  return(
    <>
      <BackHeader title={permit.id} subtitle="Permit Detail" onBack={onBack}/>
      <div style={{flex:1,padding:"18px 16px 24px",overflowY:"auto",minHeight:0}}>

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
        ):(
          <div style={{background:W,borderRadius:14,padding:"14px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)",marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:800,color:M,marginBottom:10,textTransform:"uppercase"}}>Trip Log</div>
            {permit.trips.map((t,i)=>(
              <div key={i} style={{padding:"10px 0",borderBottom:i<permit.trips.length-1?"1px solid #F3F0EB":"none"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:700,color:TX}}>Trip {i+1} · {t.date}</span>
                  <StatusBadge status={t.status==="Completed"?"Approved":"In Progress"}/>
                </div>
                <div style={{fontSize:12,color:TS}}>Start: {t.startTime}{t.endTime?` · End: ${t.endTime}`:""}</div>
                {t.policeOfficer&&<div style={{fontSize:11,color:GR}}>Checked by: {t.policeOfficer}</div>}
              </div>
            ))}
            {permit.trips.length===0&&(
              <div style={{textAlign:"center",color:"#9CA3AF",fontSize:12,padding:"16px 0"}}>No trips yet.</div>
            )}
          </div>
        )}

        {/* Trip Control */}
        <div style={{background:W,borderRadius:16,padding:"16px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
          <div style={{fontSize:13,fontWeight:800,color:TX,marginBottom:12}}>Trip Control</div>
          {permit.tripInProgress?(
            <>
              <div style={{background:"#E5F5EA",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
                <div style={{fontSize:13,fontWeight:700,color:"#1E8A4C",marginBottom:4}}>
                  🚚 Trip {permit.trips.length+1} in progress
                </div>
                <div style={{fontSize:12,color:TS}}>Started: {permit.tripInProgress.startTime}</div>
                <div style={{fontSize:11,color:GR,marginTop:4}}>
                  Driver signature recorded. Show QR code to police at checkpoints.
                </div>
              </div>
              <div style={{background:"#EFF1EA",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:"#1E8A4C",
                    display:"inline-block",boxShadow:"0 0 0 3px rgba(30,138,76,0.2)"}}/>
                  <span style={{fontSize:12,fontWeight:700,color:TX}}>Location tracking active</span>
                </div>
                {status&&(
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}>
                    <span style={{color:GR}}>Elapsed: <b style={{color:TX}}>{fmtMinutes(status.elapsedMin)}</b></span>
                    <span style={{color:status.delayed?"#C0392B":GR}}>
                      {status.delayed?`⚠️ ${fmtMinutes(-status.remaining)} over ETA`:`ETA in ${fmtMinutes(status.remaining)}`}
                    </span>
                  </div>
                )}
                <div style={{fontSize:11,color:"#7A8470",lineHeight:1.5}}>
                  Your location is shared automatically for this trip — even if you lock your phone or switch apps. It stops once you end the trip.
                </div>
              </div>
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
              <button onClick={onRequestTrip} style={{...baseBtn,
                background:`linear-gradient(135deg,${M},${ML})`,color:W}}>
                ✍️ Sign & Start Trip {permit.trips.length+1} of {permit.tripsTotal}
              </button>
              <div style={{fontSize:11,color:GR,marginTop:8,textAlign:"center"}}>
                This records your signature and start time on the permit.
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

