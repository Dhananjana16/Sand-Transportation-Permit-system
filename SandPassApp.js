// ═══════════════════════════════════════════════════════════
// DAY 2 — Person A (App)
// [FEATURE] SandPass app entry: role chooser, role splash, login/register shell
// ═══════════════════════════════════════════════════════════

// SandPass mobile app entry - role chooser, splash screens and login shell

import { useState } from "react";
import sandpassTruck from "./image/sandpass-truck.png";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseBtn, t } from "./theme";
import { Field, PhoneFrame, SLCrest } from "./uiComponents";
import { PermitHolderDashboard } from "./PermitHolderDashboard";
import { DriverDashboard } from "./DriverDashboard";

export function SandPassRoleChooser({onChooseRole}){
  return(
    <PhoneFrame>
      <div style={{flex:1,background:M,
        display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>

        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
          justifyContent:"center",position:"relative",padding:"0 32px"}}>
          <img src={sandpassTruck} alt="SandPass" style={{width:200,height:"auto"}}/>

          <div style={{color:W,fontSize:30,fontWeight:900,letterSpacing:"0.06em",marginTop:16}}>
            SANDPASS
          </div>
          <div style={{color:GL,fontSize:12,fontWeight:600,letterSpacing:"0.05em",marginTop:6,marginBottom:36}}>
            Sand Transport Permit System
          </div>

          <div style={{color:"rgba(255,255,255,0.7)",fontSize:13,fontWeight:600,marginBottom:16}}>
            Continue as
          </div>

          <button onClick={()=>onChooseRole("holder")} style={{...baseBtn,background:W,color:M,
            marginBottom:14}}>
            Permit Holder
          </button>
          <button onClick={()=>onChooseRole("driver")} style={{...baseBtn,background:"transparent",
            color:W,border:`1.5px solid ${W}`}}>
            Driver
          </button>
        </div>

        <div style={{position:"relative",padding:"0 28px 24px",textAlign:"center",
          color:"rgba(255,255,255,0.55)",fontSize:11}}>
          SANDPASS © 2026
        </div>
      </div>
    </PhoneFrame>
  );
}

export function SandPassRoleSplash({role,onBack,onGetStarted,onLogIn}){
  const isHolder=role==="holder";
  return(
    <PhoneFrame>
      <div style={{flex:1,background:M,
        display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>

        <div onClick={onBack} style={{position:"absolute",top:20,left:20,color:W,fontSize:22,
          cursor:"pointer",zIndex:2}}>←</div>

        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
          justifyContent:"center",position:"relative",padding:"0 32px"}}>
          <img src={sandpassTruck} alt="SandPass" style={{width:200,height:"auto"}}/>

          <div style={{color:W,fontSize:30,fontWeight:900,letterSpacing:"0.06em",marginTop:16}}>
            SANDPASS
          </div>
          <div style={{color:GL,fontSize:13,fontWeight:700,letterSpacing:"0.05em",marginTop:8,
            textTransform:"uppercase"}}>
            {isHolder?"Permit Holder Portal":"Driver Portal"}
          </div>
          <div style={{color:"rgba(255,255,255,0.7)",fontSize:12.5,marginTop:8,textAlign:"center",lineHeight:1.6}}>
            {isHolder
              ?"Apply for permits, track payments, and manage your drivers."
              :"View assigned permits, start trips, and scan in at checkpoints."}
          </div>
        </div>

        <div style={{position:"relative",padding:"0 28px 28px"}}>
          <button onClick={onGetStarted} style={{...baseBtn,background:W,color:M,marginBottom:12}}>
            GET STARTED
          </button>
          <button onClick={onLogIn} style={{...baseBtn,background:"transparent",color:W,
            border:`1.5px solid ${W}`,marginBottom:16}}>
            LOG IN
          </button>
          <div style={{textAlign:"center",color:"rgba(255,255,255,0.55)",fontSize:11}}>
            SANDPASS © 2026
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

export function SandPassApp(){
  const SESSION_KEY="sandpass_app_session";
  const SESSION_DAYS=7;
  const getSavedSession=()=>{
    try{
      const saved=localStorage.getItem(SESSION_KEY);
      if(!saved) return null;
      const {role,id,expiry}=JSON.parse(saved);
      if(new Date().getTime()>expiry){localStorage.removeItem(SESSION_KEY);return null;}
      return {role,id};
    }catch(e){return null;}
  };
  const savedSession=getSavedSession();

  const [role,setRole]=useState(savedSession?.role||"holder");
  const [view,setView]=useState("login");
  const [page,setPage]=useState(savedSession?"dashboard":"splash");
  const [id,setId]=useState(savedSession?.id||"");
  const [password,setPassword]=useState("");
  const [loginError,setLoginError]=useState("");
  const [remember,setRemember]=useState(true);
  const [name,setName]=useState("");
  const [nic,setNic]=useState("");
  const [email,setEmail]=useState("");
  const [address,setAddress]=useState("");
  const [phone,setPhone]=useState("");
  const [licNo,setLicNo]=useState("");
  const [confirmPw,setConfirmPw]=useState("");
  const [agreedTerms,setAgreedTerms]=useState(false);
  const [regError,setRegError]=useState("");
  const [uiLanguage,setUiLanguage]=useState("English");
  const isHolder=role==="holder";
  const L=(key)=>t(uiLanguage,key);

  const handleLogout=()=>{
    try{localStorage.removeItem(SESSION_KEY);}catch(e){}
    setPage("login");setId("");setPassword("");
  };

  if(page==="splash") return(
    <SandPassRoleChooser onChooseRole={(r)=>{setRole(r);setPage("roleSplash");}}/>
  );

  if(page==="roleSplash") return(
    <SandPassRoleSplash role={role}
      onBack={()=>setPage("splash")}
      onGetStarted={()=>{setView("register");setPage("login");}}
      onLogIn={()=>{setView("login");setPage("login");}}/>
  );

  if(page==="dashboard"&&isHolder) return(
    <PermitHolderDashboard holderId={id} initialLanguage={uiLanguage} onLogout={handleLogout}/>
  );
  if(page==="dashboard"&&!isHolder) return(
    <DriverDashboard driverId={id} initialLanguage={uiLanguage} onLogout={handleLogout}/>
  );

  return(
    <PhoneFrame>
      <div style={{background:MD,padding:"14px 24px 8px",display:"flex",justifyContent:"space-between"}}>
        <span style={{color:W,fontSize:13,fontWeight:700}}>9:41</span>
        <span style={{color:W,fontSize:12}}>📶 🔋</span>
      </div>
      <div style={{background:`linear-gradient(160deg,${MD} 0%,${M} 55%,${ML} 100%)`,
        padding:"24px 28px 44px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",bottom:-50,right:-50,width:180,height:180,
          borderRadius:"50%",background:"rgba(201,168,76,0.10)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,position:"relative"}}>
          <SLCrest size={44}/>
          <div style={{width:1,height:36,background:"rgba(201,168,76,0.44)"}}/>
          <div>
            <div style={{color:GL,fontSize:10,fontWeight:800,letterSpacing:"0.14em",textTransform:"uppercase"}}>
              GOVERNMENT OF SRI LANKA
            </div>
            <div style={{color:W,fontSize:24,fontWeight:900,letterSpacing:"-0.01em"}}>SandPass</div>
            <div style={{color:GL,fontSize:10,opacity:0.85}}>Sand Transport Permit System</div>
          </div>
        </div>
        <div style={{display:"flex",background:"rgba(0,0,0,0.20)",borderRadius:12,padding:4}}>
          {[{id:"holder",label:"Permit Holder"},{id:"driver",label:"Driver"}].map(rt=>(
            <button key={rt.id} onClick={()=>{setRole(rt.id);setView("login");}} style={{flex:1,
              padding:"10px 8px",border:"none",borderRadius:9,fontSize:13,fontWeight:700,
              cursor:"pointer",transition:"all 0.2s",
              background:role===rt.id?W:"transparent",
              color:role===rt.id?M:"rgba(255,255,255,0.8)",
              boxShadow:role===rt.id?"0 2px 8px rgba(0,0,0,0.25)":"none"}}>
              {rt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{flex:1,padding:"0 20px 24px",marginTop:-20,overflowY:"auto",minHeight:0}}>
        <div style={{background:W,borderRadius:20,padding:"28px 22px",
          boxShadow:"0 8px 32px rgba(0,0,0,0.15)",marginBottom:4}}>
          <div style={{display:"flex",borderBottom:"1.5px solid #F8F5F0",marginBottom:24}}>
            {["login","register"].map(v=>(
              <button key={v} onClick={()=>setView(v)} style={{flex:1,border:"none",background:"none",
                padding:"10px 0",fontSize:14,fontWeight:700,cursor:"pointer",
                color:view===v?M:GR,
                borderBottom:view===v?`2.5px solid ${M}`:"2.5px solid transparent",
                marginBottom:-1.5,transition:"all 0.2s"}}>
                {v==="login"?L("signIn"):L("register")}
              </button>
            ))}
          </div>

          {view==="login"?(
            <>
              <Field label={isHolder?"Permit Holder ID":"Driver ID"}
                placeholder={isHolder?"Enter your Permit Holder ID":"Enter your Driver ID"}
                value={id} onChange={e=>setId(e.target.value)}/>
              <Field label={L("password")} type="password" placeholder="Enter your password"
                value={password} onChange={e=>setPassword(e.target.value)}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                marginTop:-8,marginBottom:22}}>
                <label style={{display:"flex",alignItems:"center",gap:7,fontSize:13,color:TS,cursor:"pointer"}}>
                  <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}
                    style={{accentColor:M,width:15,height:15}}/> {L("rememberMe")}
                </label>
                <span style={{fontSize:12,color:M,fontWeight:700,cursor:"pointer"}}>Forgot Password?</span>
              </div>
              {loginError&&<div style={{color:"#C0392B",fontSize:12,fontWeight:600,marginBottom:12}}>{loginError}</div>}
              <button onClick={()=>{
                if(!id.trim()||!password.trim()){setLoginError("Please enter both ID and password.");return;}
                setLoginError("");
                if(remember){
                  try{
                    const expiry=new Date().getTime()+(SESSION_DAYS*24*60*60*1000);
                    localStorage.setItem(SESSION_KEY,JSON.stringify({role,id,expiry}));
                  }catch(e){}
                }
                setPage("dashboard");
              }} style={{...baseBtn,background:M,color:W,marginBottom:12}}>{L("logIn")}</button>
              <div style={{textAlign:"center",fontSize:13,color:GR}}>
                Don't have an account?{" "}
                <span onClick={()=>setView("register")} style={{color:M,fontWeight:700,cursor:"pointer"}}>{L("register")}</span>
              </div>
            </>
          ):(
            <>
              <Field label={L("fullName")} placeholder="Name as on NIC" value={name} onChange={e=>setName(e.target.value)}/>
              <Field label={L("nicNumber")} placeholder="Enter NIC number" value={nic} onChange={e=>setNic(e.target.value)}/>
              <Field label={L("emailAddress")} type="email" placeholder="Enter your email" value={email} onChange={e=>setEmail(e.target.value)}/>
              <Field label={L("address")} placeholder="Enter your address" value={address} onChange={e=>setAddress(e.target.value)}/>
              <Field label={L("phoneNumber")} placeholder="Enter mobile number" value={phone} onChange={e=>setPhone(e.target.value)}/>
              {!isHolder&&(
                <Field label={L("drivingLicenceNumber")} placeholder="Enter driving licence number" value={licNo} onChange={e=>setLicNo(e.target.value)}/>
              )}
              <Field label={L("password")} type="password" placeholder="Create a strong password"
                value={password} onChange={e=>setPassword(e.target.value)}/>
              <Field label={L("confirmPassword")} type="password" placeholder="Re-enter your password"
                value={confirmPw} onChange={e=>setConfirmPw(e.target.value)}/>
              <div style={{background:"#F8F5F0",borderRadius:10,padding:"12px",marginBottom:14,
                fontSize:12,color:TS,lineHeight:1.6,maxHeight:80,overflowY:"auto",
                border:`1px solid ${GB}`}}>
                <b>Terms & Conditions:</b> By registering, you agree to use SandPass only for lawful sand transport activities under the Mines and Minerals Act No. 33 of 1992. You confirm all information provided is accurate and you accept responsibility for all activities under your account.
              </div>
              <label style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:13,
                color:TS,cursor:"pointer",marginBottom:14}}>
                <input type="checkbox" checked={agreedTerms}
                  onChange={e=>setAgreedTerms(e.target.checked)}
                  style={{accentColor:M,width:15,height:15,marginTop:2,flexShrink:0}}/>
                I have read and agree to the Terms & Conditions
              </label>
              {regError&&<div style={{color:"#C0392B",fontSize:12,marginBottom:10}}>{regError}</div>}
              <button onClick={()=>{
                if(!agreedTerms){setRegError("Please agree to Terms & Conditions.");return;}
                if(!name||!nic||!email||!password){setRegError("Please fill all required fields.");return;}
                setRegError("");
                if(remember){
                  try{
                    const expiry=new Date().getTime()+(SESSION_DAYS*24*60*60*1000);
                    localStorage.setItem(SESSION_KEY,JSON.stringify({role,id,expiry}));
                  }catch(e){}
                }
                setPage("dashboard");
              }} style={{...baseBtn,background:M,color:W,marginBottom:12}}>{L("createAccount")}</button>
              <div style={{textAlign:"center",fontSize:13,color:GR}}>
                Already have an account?{" "}
                <span onClick={()=>setView("login")} style={{color:M,fontWeight:700,cursor:"pointer"}}>{L("signIn")}</span>
              </div>
            </>
          )}
        </div>
        <div style={{textAlign:"center",marginTop:12,fontSize:11,color:GR}}>
          Geological Survey & Mines Bureau · Government of Sri Lanka
        </div>
      </div>
    </PhoneFrame>
  );
}

// ══════════════════════════════════════════════════════════════════
// GSMB DASHBOARD — FULL WEB PORTAL
// ══════════════════════════════════════════════════════════════════

// ── Mock application data ─────────────────────────────────────────
