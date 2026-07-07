// ═══════════════════════════════════════════════════════════
// DAY 2 — Person C (GSMB)
// [FEATURE] GSMB portal splash screen and officer login/register form
// ═══════════════════════════════════════════════════════════

// GSMB portal splash screen and login page

import { useState } from "react";
import slEmblem from "./image/sl-emblem.png";
import gsmbLogo from "./image/gsmb-logo.png";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn, t } from "./theme";
import { SLCrest, GSMBLogo, Field, WebStatusBadge,
  webInput, webBtn } from "./uiComponents";
import { useIsDesktop } from "./tripUtils";
import { WebSettingsScreen, PrintStyles } from "./settingsAndDocs";


export function GSMBSplash({onContinue}){
  const isDesktop=useIsDesktop();
  return(
    <div style={{minHeight:"calc(100vh - 56px)",width:"100%",background:`linear-gradient(160deg,${MD} 0%,${M} 60%,${ML} 100%)`,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      fontFamily:"'Segoe UI',system-ui,sans-serif",position:"relative",overflow:"hidden",padding:"48px 24px"}}>
      <div style={{position:"absolute",top:-100,right:-100,width:340,height:340,
        borderRadius:"50%",background:"rgba(201,168,76,0.08)"}}/>
      <div style={{display:"flex",alignItems:"center",gap:18,marginBottom:24,position:"relative"}}>
        <SLCrest size={isDesktop?72:48}/>
        <div style={{width:1,height:isDesktop?60:40,background:"rgba(201,168,76,0.4)"}}/>
        <GSMBLogo size={isDesktop?72:48}/>
      </div>
      <div style={{color:G,fontSize:isDesktop?13:11,fontWeight:800,letterSpacing:"0.12em",
        textTransform:"uppercase",marginBottom:14,position:"relative"}}>
        Government of Sri Lanka
      </div>
      <h1 style={{color:W,fontSize:isDesktop?38:24,fontWeight:900,margin:"0 0 10px",
        textAlign:"center",position:"relative"}}>
        Geological Survey &amp; Mines Bureau
      </h1>
      <div style={{color:"rgba(255,255,255,0.78)",fontSize:isDesktop?15:13,marginBottom:36,
        textAlign:"center",maxWidth:440,position:"relative"}}>
        Sand Transport Permit Management System
      </div>
      <button onClick={onContinue} style={{padding:"15px 44px",borderRadius:10,border:"none",
        background:W,color:M,fontWeight:700,fontSize:15,cursor:"pointer",position:"relative"}}>
        Enter Officer Portal →
      </button>
      <div style={{color:"rgba(201,168,76,0.6)",fontSize:12,marginTop:28,position:"relative"}}>
        © 2026 GSMB · Ministry of Mines &amp; Mineral Resources
      </div>
    </div>
  );
}


export function GSMBLogin({onSuccess}){
  const [view,setView]=useState("login");
  const SESSION_KEY="sandpass_gsmb_session";
  const SESSION_HOURS=24;
  const isDesktop=useIsDesktop();

  const getSavedSession=()=>{
    try{
      const saved=localStorage.getItem(SESSION_KEY);
      if(!saved) return null;
      const {expiry}=JSON.parse(saved);
      if(new Date().getTime()>expiry){localStorage.removeItem(SESSION_KEY);return null;}
      return true;
    }catch(e){return null;}
  };

  const [officerId,setOfficerId]=useState("");
  const [password,setPassword]=useState("");
  const [remember,setRemember]=useState(true);
  const handleLogin=()=>{
    if(!officerId.trim()||!password.trim()) return;
    if(remember){
      try{
        const expiry=new Date().getTime()+(SESSION_HOURS*60*60*1000);
        localStorage.setItem(SESSION_KEY,JSON.stringify({expiry}));
      }catch(e){}
    }
    if(onSuccess) onSuccess();
  };

  return(
    <div style={{width:"100%",minHeight:"calc(100vh - 56px)",
      display:"flex",flexDirection:isDesktop?"row":"column",
      fontFamily:"'Segoe UI',system-ui,sans-serif",overflow:"hidden"}}>
      <div style={{width:isDesktop?500:"100%",position:"relative",overflow:"hidden",display:"flex",
        flexDirection:"column",justifyContent:"space-between",flexShrink:0}}>
        <div style={{position:"absolute",inset:0,background:`linear-gradient(170deg,${MD} 0%,${M} 60%,${ML} 100%)`}}/>
        {isDesktop&&<div style={{position:"absolute",top:-80,right:-80,width:280,height:280,borderRadius:"50%",background:"rgba(201,168,76,0.08)"}}/>}
        <div style={{position:"relative",padding:isDesktop?"52px 46px":"28px 24px"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(201,168,76,0.22)",
            border:"1px solid rgba(201,168,76,0.55)",borderRadius:6,padding:"6px 14px",marginBottom:isDesktop?34:16}}>
            <SLCrest size={isDesktop?22:16}/>
            <span style={{color:G,fontSize:12,fontWeight:800,letterSpacing:"0.1em"}}>GOVERNMENT OF SRI LANKA</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:18,marginBottom:isDesktop?30:14}}>
            <SLCrest size={isDesktop?64:36}/><div style={{width:1,height:isDesktop?54:30,background:"rgba(201,168,76,0.44)"}}/>
            <GSMBLogo size={isDesktop?64:36}/>
          </div>
          <h1 style={{color:W,fontSize:isDesktop?38:22,fontWeight:900,margin:"0 0 8px",lineHeight:1.15}}>
            Geological Survey &<br/>Mines Bureau
          </h1>
          <div style={{color:G,fontSize:isDesktop?14:11,fontWeight:700,letterSpacing:"0.1em",
            marginBottom:isDesktop?26:0,textTransform:"uppercase"}}>
            Regional Officer Portal
          </div>
          {isDesktop&&(
            <>
              <div style={{width:54,height:3,background:G,borderRadius:2,marginBottom:24}}/>
              <p style={{color:"#E8D8C0",fontSize:16,lineHeight:1.85,margin:0,maxWidth:380}}>
                Regional GSMB officer portal for reviewing permit applications, verifying documents, and issuing sand transport licences (Form 7) under the Mines and Minerals Act No. 33 of 1992.
              </p>
            </>
          )}
        </div>
        {isDesktop&&(
          <div style={{position:"relative",padding:"0 46px 36px"}}>
            <div style={{borderTop:"1px solid rgba(201,168,76,0.3)",paddingTop:18,color:"rgba(201,168,76,0.7)",fontSize:12}}>
              © 2025 GSMB · Ministry of Mines & Mineral Resources · Sri Lanka
            </div>
          </div>
        )}
      </div>
      <div style={{flex:1,background:OW,display:"flex",flexDirection:"column"}}>
        <div style={{height:6,background:M}}/><div style={{height:3,background:G}}/>
        <div style={{flex:1,display:"flex",alignItems:isDesktop?"center":"flex-start",
          justifyContent:"center",padding:isDesktop?"40px 56px":"28px 20px"}}>
          <div style={{width:"100%",maxWidth:440}}>
            {/* Sign In / Register toggle */}
            <div style={{display:"flex",background:"#E8E0D8",borderRadius:10,padding:4,marginBottom:24}}>
              {["login","register"].map(v=>(
                <button key={v} onClick={()=>setView(v)} style={{flex:1,padding:"11px 0",
                  border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:"pointer",
                  background:view===v?M:"transparent",color:view===v?W:"#5A3A42"}}>
                  {v==="login"?"Sign In":"Register"}
                </button>
              ))}
            </div>

            {view==="login"?(
              <>
                <h2 style={{fontSize:isDesktop?28:20,fontWeight:900,color:MD,margin:"0 0 6px"}}>Officer Sign In</h2>
                <p style={{fontSize:14,color:GR,margin:"0 0 24px"}}>Regional Office · Permit Management</p>
                <Field label="Officer ID" placeholder="Enter your officer ID" value={officerId} onChange={e=>setOfficerId(e.target.value)}/>
                <Field label="Password" type="password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)}/>
                <div style={{display:"flex",alignItems:"center",marginTop:-8,marginBottom:22}}>
                  <label style={{display:"flex",alignItems:"center",gap:7,fontSize:14,color:TS,cursor:"pointer"}}>
                    <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}
                      style={{accentColor:M,width:16,height:16}}/> Keep me signed in
                  </label>
                </div>
                <button onClick={handleLogin} style={{...baseBtn,background:M,color:W,marginBottom:22,
                  padding:"16px",fontSize:16}}>Sign In to Dashboard →</button>
                <div style={{padding:"14px 18px",background:GP,border:`1px solid ${G}55`,borderRadius:10,
                  fontSize:13,color:TS,lineHeight:1.75}}>
                  🔒 Restricted system. Sessions expire after 24 hours and at midnight daily.
                </div>
              </>
            ):(
              <>
                <h2 style={{fontSize:isDesktop?28:20,fontWeight:900,color:MD,margin:"0 0 6px"}}>Register</h2>
                <p style={{fontSize:14,color:GR,margin:"0 0 24px"}}>Create a new GSMB Officer account</p>
                <Field label="Full Name" placeholder="Your full name" value={officerId} onChange={e=>setOfficerId(e.target.value)}/>
                <Field label="Officer ID" placeholder="e.g. GSMB-0123" value={officerId} onChange={e=>setOfficerId(e.target.value)}/>
                <Field label="Password" type="password" placeholder="Create a password" value={password} onChange={e=>setPassword(e.target.value)}/>
                <Field label="Confirm Password" type="password" placeholder="Re-enter password" value={password} onChange={e=>setPassword(e.target.value)}/>
                <button onClick={handleLogin} style={{...baseBtn,background:M,color:W,marginBottom:22,
                  padding:"16px",fontSize:16}}>Create Account →</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// POLICE WEBSITE
// ══════════════════════════════════════════════════════════════════
// ── Police Sidebar (desktop) ──────────────────────────────────────
