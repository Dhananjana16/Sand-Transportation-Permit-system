import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM } from "./theme";
import { GSMBLogo, webBtn, webInput } from "./uiComponents";
import { LiveMap } from "./LiveMap";
import { PrintStyles } from "./settingsAndDocs";

// ─── Full Form 7 permit detail — used by both GSMB and Police scans ─

export function GSMBPermitDetail({permit,onBack,allowSave=true,supabaseClient=supabase,showLiveMap=false}){
  const [checkpointNotes,setCheckpointNotes]=useState([]);

  useEffect(()=>{
    let cancelled=false;
    const loadCheckpoints=async()=>{
      const {data,error}=await supabaseClient
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

  const Row=({label,value})=>(
    <div style={{display:"flex",padding:"8px 0",borderBottom:"1px solid #F8F5F0"}}>
      <span style={{width:200,color:"#6B7280",fontSize:13,flexShrink:0}}>{label}</span>
      <span style={{fontSize:13,fontWeight:600,color:"#1A0A0F"}}>{value||"—"}</span>
    </div>
  );
  return(
    <div>
      {onBack&&(
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          <button onClick={onBack} className="no-print" style={webBtn("#F3F0EB","#5A3A42",{fontSize:13})}>← Back</button>
          <h2 style={{fontSize:20,fontWeight:800,color:"#1A0A0F",margin:0}}>{permit.id}</h2>
        </div>
      )}
      {permit.tripInProgress&&(
        <div className="no-print" style={{background:"#EFF4FA",borderRadius:10,padding:"12px 16px",marginBottom:16,
          fontSize:13,color:NV,fontWeight:600}}>
          🚚 Ride in progress · Started {permit.tripInProgress.startTime}
          {permit.tripInProgress.driverName&&` · Driver: ${permit.tripInProgress.driverName}`}
        </div>
      )}
      {showLiveMap&&permit.tripInProgress&&(
        <div className="no-print" style={{marginBottom:16}}>
          <LiveMap tripRowId={permit.tripInProgress.tripRowId}
            driverName={permit.tripInProgress.driverName} vehicleNo={permit.vehicleNo}
            startPlace={permit.startPlace} destination={permit.tripInProgress.destination||permit.destination}
            supabaseClient={supabaseClient}/>
        </div>
      )}
      {allowSave&&<PrintStyles/>}
      <div className="printable-permit">
        <div style={{background:"#fff",borderRadius:14,padding:"18px 24px",marginBottom:16,
          boxShadow:"0 2px 10px rgba(0,0,0,0.05)",textAlign:"center",borderTop:`4px solid ${M}`}}>
          <div style={{display:"flex",justifyContent:"center",gap:12,alignItems:"center",marginBottom:6}}>
            <GSMBLogo size={40}/>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:M}}>GEOLOGICAL SURVEY & MINES BUREAU</div>
              <div style={{fontSize:11,color:"#6B7280"}}>Licence for Transport of Minerals — Form 7</div>
            </div>
          </div>
          <div style={{fontSize:11,color:"#6B7280"}}>Permit No. {permit.id}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16}}>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:"#fff",borderRadius:14,padding:"20px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
            <div style={{fontSize:12,fontWeight:800,color:"#6B1A2A",marginBottom:12,textTransform:"uppercase",
              letterSpacing:"0.06em",borderBottom:"2px solid #FDF3D7",paddingBottom:8}}>Permit Details</div>
            <Row label="Permit No." value={permit.id}/>
            <Row label="Transport Licence No." value={permit.licenceNo}/>
            <Row label="Vehicle No." value={permit.vehicleNo}/>
            <Row label="Issued Date" value={permit.issuedDate}/>
            <Row label="Valid From" value={permit.validFrom}/>
            <Row label="Valid To" value={permit.validTo}/>
            <Row label="Authorized Officer" value={permit.officerName}/>
          </div>
          <div style={{background:"#fff",borderRadius:14,padding:"20px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
            <div style={{fontSize:12,fontWeight:800,color:"#6B1A2A",marginBottom:12,textTransform:"uppercase",
              letterSpacing:"0.06em",borderBottom:"2px solid #FDF3D7",paddingBottom:8}}>Licensee & Mineral</div>
            <Row label="Holder Name" value={permit.holderName}/>
            <Row label="Address" value={permit.holderAddress}/>
            <Row label="Mineral" value={permit.mineral}/>
            <Row label="Quantity" value={`${permit.qty} ${permit.unit}`}/>
            <Row label="Mining Licence No." value={permit.miningLicenceNo}/>
            <Row label="District" value={permit.district}/>
            <Row label="DS Division" value={permit.dsDivision}/>
            <Row label="GN Division" value={permit.gnDivision}/>
            <Row label="Land Name" value={permit.landName}/>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:"#fff",borderRadius:14,padding:"20px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
            <div style={{fontSize:12,fontWeight:800,color:"#6B1A2A",marginBottom:12,textTransform:"uppercase",
              letterSpacing:"0.06em",borderBottom:"2px solid #FDF3D7",paddingBottom:8}}>Route</div>
            <Row label="Starting Place" value={permit.startPlace}/>
            {permit.via1&&<Row label="Via Town 1" value={permit.via1}/>}
            {permit.via2&&<Row label="Via Town 2" value={permit.via2}/>}
            <Row label="Destination" value={permit.destination}/>
          </div>
          <div style={{background:"#fff",borderRadius:14,padding:"20px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
            <div style={{fontSize:12,fontWeight:800,color:"#6B1A2A",marginBottom:12,textTransform:"uppercase",
              letterSpacing:"0.06em",borderBottom:"2px solid #FDF3D7",paddingBottom:8}}>
              Trip Log ({(permit.trips||[]).length}/{permit.tripsTotal})
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:400}}>
                <thead>
                  <tr style={{background:"#FAF8F5"}}>
                    {["#","Date","Driver","Start","End","Police Check"].map(h=>(
                      <th key={h} style={{padding:"8px 10px",textAlign:"left",fontWeight:700,
                        color:"#5A3A42",borderBottom:"2px solid #F0EBE3",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(permit.trips||[]).map((t,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid #F8F5F0"}}>
                      <td style={{padding:"8px 10px",color:"#6B1A2A",fontWeight:700}}>{i+1}</td>
                      <td style={{padding:"8px 10px"}}>{t.date}</td>
                      <td style={{padding:"8px 10px"}}>{t.driverName}</td>
                      <td style={{padding:"8px 10px"}}>{t.startTime}</td>
                      <td style={{padding:"8px 10px"}}>{t.endTime||"—"}</td>
                      <td style={{padding:"8px 10px"}}>
                        {t.policeOfficer?
                          <span style={{color:"#0D1F3C",fontWeight:600}}>{t.policeOfficer} · {t.policeStation}</span>:
                          <span style={{color:"#9CA3AF"}}>—</span>}
                      </td>
                    </tr>
                  ))}
                  {(permit.trips||[]).length===0&&(
                    <tr><td colSpan={6} style={{padding:"16px",textAlign:"center",color:"#9CA3AF"}}>
                      No trips recorded yet.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {checkpointNotes.length>0&&(
            <div style={{background:"#fff",borderRadius:14,padding:"20px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
              <div style={{fontSize:12,fontWeight:800,color:"#6B1A2A",marginBottom:12,textTransform:"uppercase",
                letterSpacing:"0.06em",borderBottom:"2px solid #FDF3D7",paddingBottom:8}}>
                📍 Police Checkpoint Notes
              </div>
              {checkpointNotes.map((c,i)=>(
                <div key={i} style={{padding:"10px 0",
                  borderBottom:i<checkpointNotes.length-1?"1px solid #F8F5F0":"none"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#1A0A0F"}}>{c.officer} · {c.station}</div>
                  <div style={{fontSize:12,color:"#6B7280"}}>{c.date}, {c.time}</div>
                  <div style={{fontSize:12,color:"#1E8A4C",marginTop:2}}>📍 {c.locationText}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
      {allowSave&&(
        <button onClick={()=>window.print()} className="no-print"
          style={{...webBtn(GP,M,{border:`1.5px solid ${G}55`,marginTop:16,width:"100%"})}}>
          💾 Save as Document
        </button>
      )}
    </div>
  );
}

// ── Issued Permits List ───────────────────────────────────────────
// ── Issued Permits List ───────────────────────────────────────────

