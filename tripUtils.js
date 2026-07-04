// ═══════════════════════════════════════════════════════════
// DAY 1 — Person A (App)
// [SETUP] Shared hooks: useIsDesktop, useTicker, trip status/delay calculation, live trip card
// ═══════════════════════════════════════════════════════════

// Trip tracking utilities - hooks, status calculation and live trip card

import { useState, useEffect, useRef } from "react";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn, t } from "./theme";

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

export function getTripStatus(tripInProgress,estimatedMinutes){
  if(!tripInProgress||!tripInProgress.startTimestamp||!estimatedMinutes) return null;
  const elapsedMin=Math.max(0,Math.round((Date.now()-tripInProgress.startTimestamp)/60000));
  const remaining=estimatedMinutes-elapsedMin;
  const progress=Math.min(elapsedMin/estimatedMinutes,1);
  return{elapsedMin,remaining,progress,delayed:elapsedMin>estimatedMinutes};
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

      <div style={{background:"#EFF1EA",border:`1.5px dashed ${GB}`,borderRadius:14,
        padding:"30px 16px",textAlign:"center"}}>
        <div style={{fontSize:24,marginBottom:6}}>🛰</div>
        <div style={{fontSize:12,fontWeight:700,color:TS,marginBottom:2}}>Live map view</div>
        <div style={{fontSize:11,color:"#9CA3AF"}}>
          Will show this vehicle's live location once GPS tracking is connected
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",marginTop:12,fontSize:12,flexWrap:"wrap",gap:6}}>
        <span style={{color:GR}}>Driver: {permit.tripInProgress.driverName||"—"}</span>
        <span style={{color:GR}}>Elapsed: <b style={{color:TX}}>{fmtMinutes(status.elapsedMin)}</b></span>
        <span style={{color:GR}}>ETA in {fmtMinutes(Math.max(0,status.remaining))}</span>
      </div>
    </div>
  );
}

// ── FAQ (shared by Permit Holder & Driver home screens) ───────────
// FAQ answers are kept in English only — translating process/legal
// guidance accurately needs a native-speaker review, so the section
// heading translates but the content doesn't yet.
