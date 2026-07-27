// Police login and registration form

import { useState } from "react";
import { G, GR, NV, NM, W, TS, baseBtn } from "./theme";
import { SLCrest, PoliceLogo, IconField } from "./uiComponents";
import { useIsDesktop } from "./tripUtils";
import { PoliceDashboard } from "./PoliceDashboard";

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
    <div style={{position:"fixed",top:56,left:0,right:0,bottom:0,width:"100%",
      display:"flex",flexDirection:isDesktop?"row":"column",
      fontFamily:"'Segoe UI',system-ui,sans-serif",overflow:"auto"}}>

      {/* Branding panel — full feature panel on desktop, compact banner on mobile */}
      <div style={{width:isDesktop?500:"100%",position:"relative",overflow:"hidden",display:"flex",
        flexDirection:"column",justifyContent:"space-between",flexShrink:0}}>
        <div style={{position:"absolute",inset:0,background:`linear-gradient(160deg,${NV} 0%,${NM} 60%,#1E3A6A 100%)`}}/>
        <div style={{position:"absolute",top:-60,right:-60,width:250,height:250,
          borderRadius:"50%",background:"rgba(201,168,76,0.06)"}}/>
        {isDesktop&&<div style={{position:"absolute",bottom:-80,left:-80,width:300,height:300,
          borderRadius:"50%",background:"rgba(255,255,255,0.03)"}}/>}

        <div style={{position:"relative",padding:isDesktop?"48px 40px":"28px 24px"}}>
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
          <div style={{position:"relative",padding:"0 40px 36px",color:"rgba(201,168,76,0.6)",fontSize:12}}>
            © 2025 Sri Lanka Police · Traffic & Transport Division
          </div>
        )}
      </div>

      {/* Form panel — fills remaining width, white background */}
      <div style={{flex:1,minWidth:0,background:"#fff",display:"flex",
        flexDirection:"column",overflowY:"auto"}}>
        <div style={{flex:1,display:"flex",alignItems:isDesktop?"center":"flex-start",
          justifyContent:"center",padding:isDesktop?"40px 56px":"28px 20px"}}>
          <div style={{width:"100%",maxWidth:440}}>
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
      </div>
    </div>
  );
}
