// SandPass mobile app entry - role chooser, splash screens and login shell

import { useState, useEffect } from "react";
import sandpassTruck from "./image/sandpass-truck.png";
import { supabase } from "./supabaseClient";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn, t } from "./theme";
import { Field, PhoneFrame, SLCrest } from "./uiComponents";
import { PermitHolderDashboard } from "./PermitHolderDashboard";
import { DriverDashboard } from "./DriverDashboard";

export function SandPassWelcome({onContinue}){
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
          <div style={{color:W,fontSize:22,fontWeight:800,marginBottom:8}}>
            Welcome
          </div>
          <button onClick={onContinue} style={{...baseBtn,background:W,color:M,marginTop:20}}>
            Continue →
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

export function SandPassLanguageChooser({onChooseLanguage}){
  const languages=[
    {code:"English",label:"English"},
    {code:"Sinhala",label:"සිංහල"},
  ];
  return(
    <PhoneFrame>
      <div style={{flex:1,background:M,
        display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
          justifyContent:"center",position:"relative",padding:"0 32px"}}>
          <img src={sandpassTruck} alt="SandPass" style={{width:130,height:"auto"}}/>
          <div style={{color:W,fontSize:22,fontWeight:900,letterSpacing:"0.04em",marginTop:14,marginBottom:36}}>
            SANDPASS
          </div>
          <div style={{color:"rgba(255,255,255,0.85)",fontSize:15,fontWeight:700,marginBottom:20}}>
            Select Language / භාෂාව තෝරන්න
          </div>
          {languages.map(l=>(
            <button key={l.code} onClick={()=>onChooseLanguage(l.code)} style={{...baseBtn,
              background:W,color:M,marginBottom:12,fontSize:16}}>
              {l.label}
            </button>
          ))}
        </div>
        <div style={{position:"relative",padding:"0 28px 24px",textAlign:"center",
          color:"rgba(255,255,255,0.55)",fontSize:11}}>
          SANDPASS © 2026
        </div>
      </div>
    </PhoneFrame>
  );
}

export function SandPassRoleChooser({onChooseRole,uiLanguage="English"}){
  const L=(key)=>t(uiLanguage,key);
  return(
    <PhoneFrame language={uiLanguage}>
      <div style={{flex:1,background:M,
        display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>

        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
          justifyContent:"center",position:"relative",padding:"0 32px"}}>
          <img src={sandpassTruck} alt="SandPass" style={{width:200,height:"auto"}}/>

          <div style={{color:W,fontSize:30,fontWeight:900,letterSpacing:"0.06em",marginTop:16}}>
            SANDPASS
          </div>
          <div style={{color:GL,fontSize:12,fontWeight:600,letterSpacing:"0.05em",marginTop:6,marginBottom:36}}>
            {L("sandTransportPermitSystem")}
          </div>

          <div style={{color:"rgba(255,255,255,0.7)",fontSize:13,fontWeight:600,marginBottom:16}}>
            {L("continueAs")}
          </div>

          <button onClick={()=>onChooseRole("holder")} style={{...baseBtn,background:W,color:M,
            marginBottom:14}}>
            {L("permitHolder")}
          </button>
          <button onClick={()=>onChooseRole("driver")} style={{...baseBtn,background:"transparent",
            color:W,border:`1.5px solid ${W}`}}>
            {L("driver")}
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

export function SandPassRoleSplash({role,onBack,onGetStarted,onLogIn,uiLanguage="English"}){
  const isHolder=role==="holder";
  return(
    <PhoneFrame language={uiLanguage}>
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
  const RETURNING_USER_KEY="sandpass_returning_user"; // persists indefinitely — just marks "has used this app before"
  const getSavedSession=()=>{
    try{
      const saved=localStorage.getItem(SESSION_KEY);
      if(!saved) return null;
      const {role,id,expiry}=JSON.parse(saved);
      if(new Date().getTime()>expiry){localStorage.removeItem(SESSION_KEY);return null;}
      return {role,id};
    }catch(e){return null;}
  };
  const getReturningUserInfo=()=>{
    try{
      const saved=localStorage.getItem(RETURNING_USER_KEY);
      return saved?JSON.parse(saved):null;
    }catch(e){return null;}
  };
  const saveReturningUserInfo=(roleVal,languageVal)=>{
    try{ localStorage.setItem(RETURNING_USER_KEY,JSON.stringify({role:roleVal,language:languageVal})); }catch(e){}
  };
  const savedSession=getSavedSession();
  const returningUser=getReturningUserInfo();

  const [role,setRole]=useState(savedSession?.role||returningUser?.role||"holder");
  const [view,setView]=useState("login");
  const [page,setPage]=useState(savedSession?"dashboard":returningUser?"welcomeBack":"welcome");
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
  const [username,setUsername]=useState("");
  const [usernameStatus,setUsernameStatus]=useState("idle"); // idle | checking | available | taken
  const checkUsername=async()=>{
    if(!username.trim()) return;
    setUsernameStatus("checking");
    const {data}=await supabase.from("profiles").select("id").eq("username",username.trim().toLowerCase()).maybeSingle();
    setUsernameStatus(data?"taken":"available");
  };
  useEffect(()=>{
    if(!username.trim()){setUsernameStatus("idle");return;}
    setUsernameStatus("checking");
    const timer=setTimeout(()=>{ checkUsername(); },600);
    return ()=>clearTimeout(timer);
  },[username]);
  const [usernameSaveError,setUsernameSaveError]=useState("");
  const saveUsername=async()=>{
    if(!username.trim()){setUsernameSaveError("Please choose a username.");return;}
    setUsernameSaveError("");
    setLoading(true);
    const {data:{user}}=await supabase.auth.getUser();
    const {error}=await supabase.from("profiles")
      .update({username:username.trim().toLowerCase()}).eq("id",user.id);
    setLoading(false);
    if(error){
      if(error.message.includes("duplicate")||error.message.includes("unique")){
        setUsernameSaveError("That username is already taken — please choose another.");
      } else {
        setUsernameSaveError(error.message);
      }
      return;
    }
    setPage("dashboard");
  };
  const [confirmPw,setConfirmPw]=useState("");
  const [agreedTerms,setAgreedTerms]=useState(false);
  const [regError,setRegError]=useState("");
  const [uiLanguage,setUiLanguage]=useState(returningUser?.language||"English");
  const [loading,setLoading]=useState(false);
  const isHolder=role==="holder";
  const L=(key)=>t(uiLanguage,key);

  const handleLogout=async()=>{
    try{localStorage.removeItem(SESSION_KEY);}catch(e){}
    await supabase.auth.signOut();
    setPage("login");setId("");setPassword("");
  };

  const handleLogin=async()=>{
    if(!id.trim()||!password.trim()){setLoginError("Please enter both email and password.");return;}
    setLoginError("");
    setLoading(true);
    const {data,error:authError}=await supabase.auth.signInWithPassword({
      email:id.trim(),password,
    });
    if(authError){setLoading(false);setLoginError(authError.message);return;}
    const {data:profile,error:profileError}=await supabase
      .from("profiles").select("role, username").eq("id",data.user.id).single();
    setLoading(false);
    if(profileError){setLoginError("Profile check failed: "+profileError.message);return;}
    if(!profile||profile.role!==role){
      setLoginError(`This account is not registered as a ${isHolder?"Permit Holder":"Driver"}.`);
      await supabase.auth.signOut();
      return;
    }
    if(remember){
      try{
        const expiry=new Date().getTime()+(SESSION_DAYS*24*60*60*1000);
        localStorage.setItem(SESSION_KEY,JSON.stringify({role,id:id.trim(),expiry}));
      }catch(e){}
    }
    saveReturningUserInfo(role,uiLanguage);
    setPage(profile.username?"dashboard":"setUsername");
  };

  const handleRegisterSubmit=async()=>{
    if(!agreedTerms){setRegError("Please agree to Terms & Conditions.");return;}
    if(!name||!nic||!email||!password){setRegError("Please fill all required fields.");return;}
    if(password!==confirmPw){setRegError("Passwords do not match.");return;}
    if(password.length<6){setRegError("Password must be at least 6 characters.");return;}
    setRegError("");
    setLoading(true);
    const {data,error:authError}=await supabase.auth.signUp({
      email:email.trim(),password,
      options:{data:{role,full_name:name.trim(),nic:nic.trim(),address:address.trim(),phone:phone.trim()}},
    });
    setLoading(false);
    if(authError){
      if(authError.message.includes("duplicate")||authError.message.includes("unique")){
        setRegError("That username is already taken — please choose another.");
      } else {
        setRegError(authError.message);
      }
      return;
    }
    if(!data.session){
      setRegError("Account created! Please confirm your email, then sign in.");
      setId(email.trim());
      setView("login");
      return;
    }
    if(remember){
      try{
        const expiry=new Date().getTime()+(SESSION_DAYS*24*60*60*1000);
        localStorage.setItem(SESSION_KEY,JSON.stringify({role,id:email.trim(),expiry}));
      }catch(e){}
    }
    saveReturningUserInfo(role,uiLanguage);
    setId(email.trim());
    setPage("setUsername");
  };

  if(page==="welcome") return(
    <SandPassWelcome onContinue={()=>setPage("language")}/>
  );

  if(page==="welcomeBack") return(
    <PhoneFrame language={uiLanguage}>
      <div style={{flex:1,background:M,display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",padding:"0 32px",textAlign:"center"}}>
        <img src={sandpassTruck} alt="SandPass" style={{width:180,height:"auto"}}/>
        <div style={{color:W,fontSize:26,fontWeight:900,letterSpacing:"0.05em",marginTop:14}}>
          SandPass
        </div>
        <div style={{color:GL,fontSize:15,fontWeight:700,marginTop:6,marginBottom:32}}>
          Welcome
        </div>
        <button onClick={()=>{setView("login");setPage("login");}}
          style={{...baseBtn,background:W,color:M}}>
          Continue →
        </button>
      </div>
    </PhoneFrame>
  );

  if(page==="language") return(
    <SandPassLanguageChooser onChooseLanguage={(lang)=>{setUiLanguage(lang);setPage("splash");}}/>
  );

  if(page==="splash") return(
    <SandPassRoleChooser uiLanguage={uiLanguage} onChooseRole={(r)=>{setRole(r);setPage("roleSplash");}}/>
  );

  if(page==="roleSplash") return(
    <SandPassRoleSplash role={role} uiLanguage={uiLanguage}
      onBack={()=>setPage("splash")}
      onGetStarted={()=>{setView("register");setPage("login");}}
      onLogIn={()=>{setView("login");setPage("login");}}/>
  );

  if(page==="setUsername") return(
    <PhoneFrame language={uiLanguage}>
      <div style={{flex:1,background:M,display:"flex",flexDirection:"column",
        position:"relative",overflow:"hidden"}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
          justifyContent:"center",padding:"0 32px"}}>
          <div style={{fontSize:44,marginBottom:16}}>👤</div>
          <div style={{color:W,fontSize:22,fontWeight:900,marginBottom:8,textAlign:"center"}}>
            Choose a Username
          </div>
          <div style={{color:"rgba(255,255,255,0.75)",fontSize:13,marginBottom:28,textAlign:"center",lineHeight:1.6}}>
            {isHolder?"Drivers will use this to find and connect with you.":"Permit Holders will use this to send you permits."}
          </div>
          <div style={{width:"100%",maxWidth:320}}>
            <input value={username} onChange={e=>setUsername(e.target.value)}
              style={{...baseInput,marginBottom:10,textAlign:"center",fontSize:16}}/>
            <div style={{textAlign:"center",marginBottom:16,minHeight:18,fontSize:12}}>
              {usernameStatus==="checking"&&<span style={{color:"rgba(255,255,255,0.6)"}}>Checking…</span>}
              {usernameStatus==="available"&&<span style={{color:"#8CE0A8"}}>✓ Available</span>}
              {usernameStatus==="taken"&&<span style={{color:"#F5A0A0"}}>✗ Already taken</span>}
            </div>
            {usernameSaveError&&<div style={{color:"#F5A0A0",fontSize:12,marginBottom:12,textAlign:"center"}}>{usernameSaveError}</div>}
            <button onClick={saveUsername} disabled={loading} style={{...baseBtn,background:W,color:M,opacity:loading?0.7:1}}>{loading?"Saving…":"Continue →"}</button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );

  if(page==="dashboard"&&isHolder) return(
    <PermitHolderDashboard holderId={id} initialLanguage={uiLanguage} onLogout={handleLogout}/>
  );
  if(page==="dashboard"&&!isHolder) return(
    <DriverDashboard driverId={id} initialLanguage={uiLanguage} onLogout={handleLogout}/>
  );


  return(
    <PhoneFrame language={uiLanguage}>
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
          <div style={{display:"flex",background:"#F3F0EB",borderRadius:12,padding:4,marginBottom:24}}>
            {["login","register"].map(v=>(
              <button key={v} onClick={()=>setView(v)} style={{flex:1,padding:"12px 0",
                border:"none",borderRadius:9,fontSize:14,fontWeight:700,cursor:"pointer",
                background:view===v?M:"transparent",color:view===v?W:GR,
                boxShadow:view===v?"0 2px 8px rgba(107,26,42,0.25)":"none",
                transition:"all 0.2s"}}>
                {v==="login"?L("signIn"):L("register")}
              </button>
            ))}
          </div>

          {view==="login"?(
            <>
              <Field label="Email"
                placeholder={isHolder?"Enter your email":"Enter your email"}
                value={id} onChange={e=>setId(e.target.value)}/>
              <Field label={L("password")} type="password" placeholder="Enter your password"
                value={password} onChange={e=>setPassword(e.target.value)}/>
              <div style={{marginTop:-8,marginBottom:22}}>
                <label style={{display:"flex",alignItems:"center",gap:7,fontSize:13,color:TS,cursor:"pointer"}}>
                  <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}
                    style={{accentColor:M,width:15,height:15}}/> Remember me
                </label>
              </div>
              {loginError&&<div style={{color:"#C0392B",fontSize:12,fontWeight:600,marginBottom:12}}>{loginError}</div>}
              <button onClick={handleLogin} disabled={loading} style={{...baseBtn,background:M,color:W,marginBottom:12,
                opacity:loading?0.7:1}}>{loading?"Signing In…":L("logIn")}</button>
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
              <button onClick={handleRegisterSubmit} disabled={loading} style={{...baseBtn,background:M,color:W,marginBottom:12,
                opacity:loading?0.7:1}}>{loading?"Creating Account…":L("createAccount")}</button>
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
