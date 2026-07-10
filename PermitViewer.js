// ═══════════════════════════════════════════════════════════
// DAY 4 — Person A (App)
// [FEATURE] Digital Form 7 permit document viewer, shared by Permit Holder and Driver
// ═══════════════════════════════════════════════════════════

import { useState } from "react";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseBtn } from "./theme";
import { BackHeader, ScrollBody, QRCode, GSMBLogo, PhoneFrame } from "./uiComponents";
import { TripStatusCard } from "./tripUtils";
import { DocRow, DocSection, PrintStyles } from "./settingsAndDocs";

// ─── The permit document viewer — shared by Permit Holder & Driver ─

export function PermitViewer({permit,onBack,viewerRole="holder",showQR=false,onSubmitDelayReason}){
  const [activeTab,setActiveTab]=useState("permit"); // "permit" | "map"
  const qrData=`SANDPASS|${permit.id}|${permit.licenceNo}|VEH:${permit.vehicleNo}|TRIPS:${permit.trips.length}/${permit.tripsTotal}`;
  return(
    <>
      <div className="no-print">
        <BackHeader title={permit.id} subtitle="Sand Transport Permit — Form 7" onBack={onBack}/>
      </div>
      <ScrollBody extraPad={30}>
        <PrintStyles/>

        {/* Permit / Map tabs — Map is Permit Holder & GSMB only, not Driver */}
        {viewerRole==="holder"&&(
          <div className="no-print" style={{display:"flex",background:"#E8E0D8",borderRadius:10,padding:4,marginBottom:16}}>
            {[["permit","📄 Permit"],["map","🛰 Map"]].map(([id,label])=>(
              <button key={id} onClick={()=>setActiveTab(id)} style={{flex:1,padding:"9px",
                border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",
                background:activeTab===id?W:"transparent",
                color:activeTab===id?M:GR,
                boxShadow:activeTab===id?"0 1px 4px #00000022":"none"}}>
                {label}
              </button>
            ))}
          </div>
        )}

        {(activeTab==="permit"||viewerRole!=="holder")&&(
          <>
            {/* The actual document — styled like paper, not an app card */}
            <div className="printable-permit" style={{background:"#fff",border:"1px solid #DEDAD0",
              borderRadius:4,padding:"22px 18px",position:"relative"}}>

              {showQR&&(
                <div style={{position:"absolute",top:14,right:14}}>
                  <QRCode data={qrData} size={62}/>
                </div>
              )}

              <div style={{textAlign:"center",paddingBottom:14,marginBottom:14,
                borderBottom:`3px double ${M}`}}>
                <GSMBLogo size={42}/>
                <div style={{fontSize:14,fontWeight:800,color:M,letterSpacing:"0.03em",marginTop:6}}>
                  GEOLOGICAL SURVEY &amp; MINES BUREAU
                </div>
                <div style={{fontSize:11,color:"#7A6A5F"}}>Licence for Transport of Minerals — Form 7</div>
                <div style={{fontSize:10,color:"#9C8A8F",marginTop:3}}>No. 569, Epitamulla Road, Pitakotte, Sri Lanka</div>
              </div>

              <DocSection title="Vehicle &amp; Licence">
                <DocRow label="Vehicle No." value={permit.vehicleNo}/>
                <DocRow label="Transport Licence No." value={permit.licenceNo}/>
              </DocSection>
              <DocSection title="Licensee Details">
                <DocRow label="Name" value={permit.holderName}/>
                <DocRow label="Address" value={permit.holderAddress}/>
                <DocRow label="Mineral" value={permit.mineral}/>
                <DocRow label="Quantity" value={`${permit.qty} ${permit.unit}`}/>
              </DocSection>
              <DocSection title="Mining Licence Details">
                <DocRow label="Licence No." value={permit.miningLicenceNo}/>
                <DocRow label="District" value={permit.district}/>
                <DocRow label="DS Division" value={permit.dsDivision}/>
                <DocRow label="GN Division" value={permit.gnDivision}/>
                <DocRow label="Name of Land" value={permit.landName}/>
              </DocSection>
              <DocSection title="Permitted Duration">
                <DocRow label="From" value={permit.validFrom}/>
                <DocRow label="To" value={permit.validTo}/>
              </DocSection>
              <DocSection title="Transport Route">
                <DocRow label="Starting Place" value={permit.startPlace}/>
                {permit.via1&&<DocRow label="Via Town 1" value={permit.via1}/>}
                {permit.via2&&<DocRow label="Via Town 2" value={permit.via2}/>}
                {permit.via3&&<DocRow label="Via Town 3" value={permit.via3}/>}
                {permit.via4&&<DocRow label="Via Town 4" value={permit.via4}/>}
                <DocRow label="Destination" value={permit.destination}/>
              </DocSection>
              <DocSection title="Fees">
                <DocRow label="Licence Fee" value="Rs. 250.00"/>
                <DocRow label="Receipt No." value={permit.licenceFeeReceipt}/>
              </DocSection>
              <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid #E2D9CC",display:"flex",
                justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:10}}>
                <div>
                  <div style={{fontSize:9.5,color:"#9C8A8F",marginBottom:2}}>Authorized Officer</div>
                  <div style={{fontSize:12,fontWeight:700,color:"#2A1A15"}}>{permit.officerName}</div>
                  <div style={{fontSize:9.5,color:"#9C8A8F"}}>GSMB Regional Office</div>
                </div>
                <div style={{fontSize:9.5,color:"#9C8A8F",textAlign:"right"}}>
                  Issued: {permit.issuedDate}
                </div>
              </div>

              {/* Back of the form — Trip Log, same document, continues below */}
              <div style={{marginTop:22,paddingTop:18,borderTop:`3px double ${M}`}}>
                <div style={{fontSize:10.5,fontWeight:800,color:M,textTransform:"uppercase",
                  letterSpacing:"0.08em",marginBottom:10}}>
                  Transport Details — Trip Log
                </div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:10.5,minWidth:480}}>
                    <thead>
                      <tr>
                        {["Date","Qty (Cubes)","Start Time","Destination","Holder Signature","Inspecting Officer"].map(h=>(
                          <th key={h} style={{padding:"6px 6px",textAlign:"left",fontWeight:700,color:M,
                            borderBottom:`2px solid ${M}`,whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {permit.trips.map((t,i)=>(
                        <tr key={i} style={{borderBottom:"1px solid #EDE7DC"}}>
                          <td style={{padding:"7px 6px"}}>{t.date}</td>
                          <td style={{padding:"7px 6px"}}>{t.qty}</td>
                          <td style={{padding:"7px 6px"}}>{t.startTime}</td>
                          <td style={{padding:"7px 6px"}}>{t.destination}</td>
                          <td style={{padding:"7px 6px"}}>
                            {t.holderApproved?<span style={{color:"#1E8A4C",fontWeight:700}}>✓ Signed</span>
                              :<span style={{color:"#9CA3AF"}}>Pending</span>}
                          </td>
                          <td style={{padding:"7px 6px"}}>
                            {t.policeOfficer?<span style={{color:NV,fontWeight:600}}>{t.policeOfficer}</span>
                              :<span style={{color:"#9CA3AF"}}>—</span>}
                          </td>
                        </tr>
                      ))}
                      {Array.from({length:Math.max(0,5-permit.trips.length)}).map((_,i)=>(
                        <tr key={`empty-${i}`} style={{borderBottom:"1px solid #EDE7DC"}}>
                          {Array.from({length:6}).map((_,j)=>(<td key={j} style={{padding:"12px 6px"}}></td>))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{fontSize:10.5,color:"#9C8A8F",marginTop:10}}>
                  {permit.trips.length} of {permit.tripsTotal} trips used
                </div>
                <div style={{marginTop:14,fontSize:9.5,color:"#7A6A5F",lineHeight:1.6,
                  paddingTop:10,borderTop:"1px solid #E2D9CC"}}>
                  This licence should be kept in the vehicle during transport. Each trip must be signed by the licensee before starting. Police officers sign after inspection.
                </div>
              </div>
            </div>

            {/* Save as Document — at the very bottom of the permit */}
            <button onClick={()=>window.print()} className="no-print" style={{...baseBtn,
              background:GP,color:M,border:`1.5px solid ${G}55`,marginTop:16}}>
              💾 Save as Document
            </button>
          </>
        )}

        {activeTab==="map"&&viewerRole==="holder"&&(
          <div className="no-print">
            {permit.tripInProgress?(
              <TripStatusCard permit={permit} viewer="holder"
                onSubmitReason={(reason,proofFile)=>onSubmitDelayReason&&onSubmitDelayReason(permit.id,reason,proofFile)}/>
            ):(
              <div style={{background:W,borderRadius:16,padding:"40px 20px",textAlign:"center",
                boxShadow:"0 2px 14px rgba(0,0,0,0.06)"}}>
                <div style={{fontSize:32,marginBottom:10}}>🛰</div>
                <div style={{fontSize:13,fontWeight:700,color:TS,marginBottom:4}}>No active trip right now</div>
                <div style={{fontSize:12,color:GR}}>The live map will appear here once this permit has a ride in progress.</div>
              </div>
            )}
          </div>
        )}
      </ScrollBody>
    </>
  );
}

// ── Trip Approval Card removed — driver signs directly per Form 7 ──

// ── PERMIT HOLDER: Home Tab ───────────────────────────────────────
