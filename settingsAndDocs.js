// ═══════════════════════════════════════════════════════════
// DAY 4 — Person A (App)
// [FEATURE] Settings screens, print styles, FAQ sections shared across the app
// ═══════════════════════════════════════════════════════════

// Settings screens, document print styles, FAQ sections and activity feed

import { useState, useEffect, useRef } from "react";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn, t } from "./theme";
import { Field, BackHeader, ScrollBody, webInput, webBtn } from "./uiComponents";

export function DocRow({label,value}){
  return(
    <div style={{display:"flex",fontSize:11.5,padding:"5px 0",gap:10,borderBottom:"1px dotted #E2D9CC"}}>
      <span style={{minWidth:140,color:"#7A6A5F",flexShrink:0}}>{label}</span>
      <span style={{fontWeight:600,color:"#2A1A15"}}>{value||"—"}</span>
    </div>
  );
}
export function DocSection({title,children}){
  return(
    <div style={{marginBottom:16}}>
      <div style={{fontSize:10.5,fontWeight:800,color:M,textTransform:"uppercase",
        letterSpacing:"0.08em",marginBottom:6,paddingBottom:4,borderBottom:`2px solid ${M}`}}>
        {title}
      </div>
      {children}
    </div>
  );
}

export function PrintStyles(){
  return(
    <style>{`
      @media print {
        /* Neutralize any fixed-size/clipping containers (phone mockup frames etc.)
           so the document can flow and paginate naturally across pages. */
        body, html { overflow: visible !important; height: auto !important; }
        * { overflow: visible !important; height: auto !important; max-height: none !important; }
        .no-print { display: none !important; }
        .app-shell { background: #fff !important; min-height: 0 !important; }
        .app-shell-content { display: block !important; padding: 0 !important; min-height: 0 !important; }
        .phone-frame { width: 100% !important; max-width: 100% !important; border-radius: 0 !important;
          box-shadow: none !important; background: #fff !important; }
        .printable-permit {
          width: 100% !important; max-width: 100% !important;
          padding: 24px !important; border: none !important; box-shadow: none !important;
        }
        table { font-size: 9px !important; }
        .printable-permit table { width: 100% !important; min-width: 0 !important; }
      }
    `}</style>
  );
}

export function MobileSettingsScreen({profile,setProfile,onBack,onLogout,accent=M}){
  const [draft,setDraft]=useState({name:profile.name,email:profile.email,phone:profile.phone});
  const [saved,setSaved]=useState(false);
  const [confirmDelete,setConfirmDelete]=useState(false);
  const L=(key)=>t(profile.language,key);

  return(
    <>
      <BackHeader title={L("settings")} subtitle={`${L("editProfile")} & ${L("account")}`} onBack={onBack}/>
      <ScrollBody>
        <FormSection title={L("editProfile")}>
          <Field label={L("fullName")} value={draft.name} accent={accent}
            onChange={e=>setDraft({...draft,name:e.target.value})}/>
          <Field label={L("emailAddress")} type="email" value={draft.email} accent={accent}
            onChange={e=>setDraft({...draft,email:e.target.value})}/>
          <Field label={L("phoneNumber")} value={draft.phone} accent={accent}
            onChange={e=>setDraft({...draft,phone:e.target.value})}/>
          <button onClick={()=>{
            setProfile(p=>({...p,...draft}));setSaved(true);setTimeout(()=>setSaved(false),2000);
          }} style={{...baseBtn,background:accent,color:W}}>
            {L("saveChanges")}
          </button>
          {saved&&<div style={{color:"#1E8A4C",fontSize:12,fontWeight:600,marginTop:10,textAlign:"center"}}>
            ✓ Profile updated
          </div>}
        </FormSection>

        <FormSection title={L("account")}>
          <button onClick={onLogout} style={{...baseBtn,background:W,color:accent,
            border:`1.5px solid ${GB}`,marginBottom:10}}>
            {L("logOut")}
          </button>
          {!confirmDelete?(
            <button onClick={()=>setConfirmDelete(true)} style={{...baseBtn,background:"#FBEAEA",color:"#C0392B"}}>
              {L("deleteAccount")}
            </button>
          ):(
            <div style={{background:"#FBEAEA",borderRadius:10,padding:"14px",border:"1.5px solid #F3C6C6"}}>
              <div style={{fontSize:13,color:"#C0392B",fontWeight:700,marginBottom:6}}>Delete your account?</div>
              <div style={{fontSize:12,color:"#8A2F2F",marginBottom:12,lineHeight:1.5}}>
                This permanently removes your account and all related data. This cannot be undone.
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setConfirmDelete(false)} style={{...baseBtn,background:W,color:TS,
                  border:`1.5px solid ${GB}`}}>{L("cancel")}</button>
                <button onClick={onLogout} style={{...baseBtn,background:"#C0392B",color:W}}>Confirm Delete</button>
              </div>
            </div>
          )}
        </FormSection>
      </ScrollBody>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════
// PERMIT HOLDER APP
// ══════════════════════════════════════════════════════════════════

// ── Application Form (based on real Sinhala form) ────────────────
export function WebSettingsScreen({profile,setProfile,onLogout,accent="#6B1A2A",autoLogoutNote=false}){
  const [draft,setDraft]=useState({name:profile.name,email:profile.email,phone:profile.phone});
  const [saved,setSaved]=useState(false);
  const [confirmDelete,setConfirmDelete]=useState(false);
  const L=(key)=>t(profile.language,key);

  return(
    <div>
      <h2 style={{fontSize:22,fontWeight:800,color:"#1A0A0F",margin:"0 0 6px"}}>{L("settings")}</h2>
      <p style={{fontSize:14,color:"#6B7280",margin:"0 0 24px"}}>Profile and account preferences</p>

      <div style={{background:"#fff",borderRadius:14,padding:"20px",
        boxShadow:"0 2px 10px rgba(0,0,0,0.05)",marginBottom:16,maxWidth:480}}>
        <div style={{fontSize:13,fontWeight:800,color:accent,marginBottom:14,
          textTransform:"uppercase",letterSpacing:"0.05em"}}>{L("editProfile")}</div>
        {[[L("fullName"),"name"],[L("emailAddress"),"email"],[L("phoneNumber"),"phone"]].map(([label,key])=>(
          <div key={key} style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:12,fontWeight:600,color:"#5A3A42",marginBottom:6}}>{label}</label>
            <input value={draft[key]} onChange={e=>setDraft({...draft,[key]:e.target.value})} style={webInput}/>
          </div>
        ))}
        <button onClick={()=>{
          setProfile(p=>({...p,...draft}));setSaved(true);setTimeout(()=>setSaved(false),2000);
        }} style={webBtn(accent,"#fff")}>
          {L("saveChanges")}
        </button>
        {saved&&<span style={{marginLeft:12,color:"#1E8A4C",fontSize:13,fontWeight:600}}>✓ Profile updated</span>}
      </div>

      {autoLogoutNote&&(
        <div style={{background:"#FDF3D7",borderRadius:10,padding:"12px 16px",fontSize:12,
          color:"#7A5C12",marginBottom:16,maxWidth:480}}>
          ℹ️ For security, GSMB accounts are automatically signed out daily at midnight.
        </div>
      )}

      <div style={{background:"#fff",borderRadius:14,padding:"20px",
        boxShadow:"0 2px 10px rgba(0,0,0,0.05)",maxWidth:480}}>
        <div style={{fontSize:13,fontWeight:800,color:"#C0392B",marginBottom:14,
          textTransform:"uppercase",letterSpacing:"0.05em"}}>{L("account")}</div>
        <button onClick={onLogout} style={{...webBtn("#F3F0EB","#5A3A42"),width:"100%",marginBottom:10}}>
          {L("logOut")}
        </button>
        {!confirmDelete?(
          <button onClick={()=>setConfirmDelete(true)} style={{...webBtn("#FBEAEA","#C0392B"),width:"100%"}}>
            {L("deleteAccount")}
          </button>
        ):(
          <div style={{background:"#FBEAEA",borderRadius:10,padding:"14px",border:"1.5px solid #F3C6C6"}}>
            <div style={{fontSize:13,color:"#C0392B",fontWeight:700,marginBottom:6}}>Delete this account?</div>
            <div style={{fontSize:12,color:"#8A2F2F",marginBottom:12,lineHeight:1.5}}>
              This permanently removes the account and all related data. This cannot be undone.
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setConfirmDelete(false)}
                style={webBtn("#fff","#5A3A42",{border:"1.5px solid #DDD5C8"})}>{L("cancel")}</button>
              <button onClick={onLogout} style={webBtn("#C0392B","#fff")}>Confirm Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── GSMB Web Navbar ───────────────────────────────────────────────
export function FAQSection({items,language="English"}){
  const [openIndex,setOpenIndex]=useState(null);
  return(
    <div style={{marginTop:28}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <div style={{flex:1,height:1,background:GB}}/>
        <span style={{fontSize:11,fontWeight:800,color:GR,letterSpacing:"0.08em",textTransform:"uppercase"}}>
          Help
        </span>
        <div style={{flex:1,height:1,background:GB}}/>
      </div>
      <div style={{background:GP,borderRadius:16,padding:"16px",border:`1px solid ${G}40`}}>
        <div style={{fontSize:15,fontWeight:800,color:TX,marginBottom:12}}>❓ {t(language,"faqTitle")}</div>
        {items.map((item,i)=>(
          <div key={i} style={{background:W,borderRadius:12,marginBottom:i<items.length-1?8:0,
            boxShadow:"0 2px 8px rgba(0,0,0,0.04)",overflow:"hidden"}}>
            <div onClick={()=>setOpenIndex(openIndex===i?null:i)} style={{padding:"13px 15px",
              display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",gap:10}}>
              <span style={{fontSize:13,fontWeight:700,color:TX}}>{item.q}</span>
              <span style={{fontSize:16,color:GR,flexShrink:0}}>{openIndex===i?"−":"+"}</span>
            </div>
            {openIndex===i&&(
              <div style={{padding:"0 15px 13px",fontSize:12,color:TS,lineHeight:1.6}}>{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const HOLDER_FAQ=[
  {q:"How long is my permit valid for?",
   a:"Each permit is valid for a maximum of 1 month from the issue date and allows up to 25 trips, whichever comes first."},
  {q:"What happens if my application is rejected?",
   a:"Go to My Applications to see exactly why and a checklist of what to fix. Correct the issue and tap \"Resubmit with Corrections\" — it goes straight back into the GSMB review queue under the same application ID."},
  {q:"Can different drivers use the same permit?",
   a:"Yes. A permit is tied to the vehicle, not a specific driver. Add drivers under the Drivers tab, then send a permit to whichever driver is making that trip."},
  {q:"What if a trip is running late?",
   a:"You'll see a live status on the permit. If it's delayed, you can give a reason and attach proof before GSMB considers requesting a fund or tax payment."},
  {q:"How much does a permit cost?",
   a:"The transport licence fee is Rs. 250 per application (Form 7). Once your application is approved, you'll be asked to pay this and upload proof before the permit is issued — there's no payment required to apply."},
];

export const DRIVER_FAQ=[
  {q:"How do I start a trip?",
   a:"Open the permit from My Permits and tap \"Sign & Start Trip\". This records your signature and the start time on the permit."},
  {q:"What do I show the police at a checkpoint?",
   a:"Show the QR code on the permit's detail screen. The officer scans it to confirm it's GSMB-approved."},
  {q:"Does the app track my location?",
   a:"Only while a trip is active — it continues even if your phone is locked or the app is minimized, and stops automatically once you end the trip."},
  {q:"Can I drive a vehicle that isn't on my profile?",
   a:"Permits are issued for a specific vehicle, not a specific driver. The permit holder needs to send you that permit before you can start a trip with it."},
  {q:"Do I have to use all 25 trips on a permit?",
   a:"No — a permit allows up to 25 trips within its validity period, but you don't have to use them all."},
];

// ── Settings (shared by Permit Holder & Driver mobile apps) ───────
export const ACTIVITY_CHIP={
  "✅":{bg:"#E5F5EA",fg:"#1E8A4C"}, "🚚":{bg:"#FDF3D7",fg:"#9A7B1F"},
  "🪪":{bg:"#EFF4FA",fg:"#1E5FA8"}, "📄":{bg:"#F3F0EB",fg:"#5A3A42"},
  "📝":{bg:"#FBEAEA",fg:"#C0392B"}, "👮":{bg:"#E8ECF5",fg:"#0D1F3C"},
};
export function FormSection({title,children}){
  return(
    <div style={{background:W,borderRadius:14,padding:"16px",marginBottom:14,
      boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
      <div style={{fontSize:12,fontWeight:800,color:M,marginBottom:14,
        textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:`2px solid ${GP}`,
        paddingBottom:8}}>{title}</div>
      {children}
    </div>
  );
}

