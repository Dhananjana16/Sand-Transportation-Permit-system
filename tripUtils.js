// Trip tracking utilities - hooks, status calculation and live trip card

import { useState, useEffect, useRef } from "react";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn, t } from "./theme";
import { LiveMap } from "./LiveMap";

export function useIsDesktop(breakpoint=960){
  const [isDesktop,setIsDesktop]=useState(()=>
    typeof window!=="undefined"?window.innerWidth>=breakpoint:true);
  useEffect(()=>{
    const onResize=()=>setIsDesktop(window.innerWidth>=breakpoint);
    window.addEventListener("resize",onResize);
    return ()=>window.removeEventListener("resize",onResize);
  },[breakpoint]);
  return isDesktop;
}

export function useTicker(intervalMs=15000){
  const [,setTick]=useState(0);
  useEffect(()=>{
    const id=setInterval(()=>setTick(t=>t+1),intervalMs);
    return ()=>clearInterval(id);
  },[intervalMs]);
}

// Since we don't yet have real distance/route-based time estimation, the
// estimate itself is a rough placeholder — so we only flag something as
// genuinely "delayed" after a generous grace period past that estimate,
// to avoid falsely warning about normal traffic/loading delays.
const DELAY_GRACE_MINUTES=120;

export function getTripStatus(tripInProgress,estimatedMinutes){
  if(!tripInProgress||!tripInProgress.startTimestamp||!estimatedMinutes) return null;
  const elapsedMin=Math.max(0,Math.round((Date.now()-tripInProgress.startTimestamp)/60000));
  const remaining=estimatedMinutes-elapsedMin;
  const progress=Math.min(elapsedMin/estimatedMinutes,1);
  const delayed=elapsedMin>(estimatedMinutes+DELAY_GRACE_MINUTES);
  return{elapsedMin,remaining,progress,delayed};
}

export function fmtMinutes(min){
  const m=Math.abs(min);
  const h=Math.floor(m/60),mm=m%60;
  return h>0?`${h}h ${mm}m`:`${mm}m`;
}

export function TripStatusCard({permit}){
  useTicker(15000);
  if(!permit.tripInProgress) return null;
  const status=getTripStatus(permit.tripInProgress,permit.estimatedTripMinutes);
  if(!status) return null;

  return(
    <div style={{background:W,borderRadius:16,padding:"16px 18px",
      boxShadow:"0 2px 10px rgba(0,0,0,0.05)",marginBottom:16}}>
      <div style={{fontSize:12,fontWeight:800,color:M,textTransform:"uppercase",
        letterSpacing:"0.05em",marginBottom:12}}>
        🛰 Live Trip — {permit.id}
      </div>

      <LiveMap tripRowId={permit.tripInProgress.tripRowId}
        driverName={permit.tripInProgress.driverName} vehicleNo={permit.vehicleNo}
        startPlace={permit.startPlace} destination={permit.tripInProgress.destination||permit.destination}/>

      <div style={{display:"flex",justifyContent:"space-between",marginTop:12,fontSize:12,flexWrap:"wrap",gap:6}}>
        <span style={{color:GR}}>Driver: {permit.tripInProgress.driverName||"—"}</span>
        <span style={{color:GR}}>Elapsed: <b style={{color:TX}}>{fmtMinutes(status.elapsedMin)}</b></span>
        <span style={{color:status.remaining<0?"#C0392B":GR}}>
          {status.remaining<0?`⚠️ ${fmtMinutes(-status.remaining)} over ETA`:`ETA in ${fmtMinutes(status.remaining)}`}
        </span>
      </div>

      {status.delayed&&(
        <div style={{background:"#FBEAEA",borderRadius:10,padding:"12px 14px",marginTop:14}}>
          <div style={{fontSize:12,fontWeight:700,color:"#C0392B",marginBottom:6}}>
            ⚠️ This trip is running late
          </div>
          {permit.tripInProgress.delayReason?(
            <div style={{fontSize:12,color:TS}}>
              Reason from driver: "{permit.tripInProgress.delayReason}"
              {permit.tripInProgress.proofUrl&&(
                <div style={{marginTop:8}}>
                  <a href={permit.tripInProgress.proofUrl} target="_blank" rel="noopener noreferrer"
                    style={{color:"#1E8A4C",fontWeight:700,fontSize:12,textDecoration:"underline"}}>
                    📎 View attached proof
                  </a>
                </div>
              )}
            </div>
          ):(
            <div style={{fontSize:11,color:TS}}>Waiting for the driver to submit a reason.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── FAQ (shared by Permit Holder & Driver home screens) ───────────
// FAQ answers are kept in English only — translating process/legal
// guidance accurately needs a native-speaker review, so the section
// heading translates but the content doesn't yet.
