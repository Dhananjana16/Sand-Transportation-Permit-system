// ═══════════════════════════════════════════════════════════
// DAY 6 — Person A (App)
// [REFACTOR] Removed royalty receipt upload from the application form — not needed upfront
// ═══════════════════════════════════════════════════════════

// Permit application form - all fields, document uploads and resubmit flow

import { useState, useEffect, useRef } from "react";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn, t } from "./theme";
import { Field, SelectField, StatusBadge, FormSection, BackHeader, ScrollBody } from "./uiComponents";
import { MobileSettingsScreen } from "./settingsAndDocs";
import { PermitViewer } from "./PermitViewer";

export function ApplicationForm({onBack,onSubmit,initialData,rejectionInfo}){
  const [f,setF]=useState({
    applicantName:"",nic:"",address:"",phone:"",
    mineral:"Sand",qty:"",unit:"Cubes",
    miningLicenceNo:"",licenceType:"Mining Licence",
    district:"",dsDivision:"",gnDivision:"",village:"",landName:"",
    purpose:"",transportFrom:"",transportTo:"",
    vehicleNo:"",vehicleType:"Lorry",
    startPlace:"",via1:"",via2:"",via3:"",via4:"",destination:"",destinationAddress:"",
    royaltyReceiptNo:"",royaltyAmount:"",licenceFeeReceipt:"",
    docsLicence:false,docsRoyalty:false,docsPayslip:false,docsNIC:false,
    ...initialData,
  });
  const u=(k,v)=>setF(p=>({...p,[k]:v}));

  return(
    <>
      <BackHeader title={rejectionInfo?"Resubmit Application":"Permit Application"}
        subtitle="Sand Transport Permit Request" onBack={onBack}/>
      <ScrollBody>
        {rejectionInfo&&(
          <div style={{background:"#FBEAEA",border:"1.5px solid #F5C6C6",borderRadius:12,
            padding:"14px 16px",marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:800,color:"#C0392B",marginBottom:6}}>
              ❌ Why this was rejected
            </div>
            <div style={{fontSize:12,color:"#5A3A42",marginBottom:rejectionInfo.missingItems?.length?10:0,lineHeight:1.5}}>
              {rejectionInfo.reason}
            </div>
            {rejectionInfo.missingItems?.length>0&&(
              <>
                <div style={{fontSize:12,fontWeight:700,color:"#C0392B",marginBottom:4}}>Please fix / provide:</div>
                <ul style={{margin:0,paddingLeft:18}}>
                  {rejectionInfo.missingItems.map((m,i)=>(
                    <li key={i} style={{fontSize:12,color:"#5A3A42",marginBottom:2}}>{m}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        <FormSection title="1. Applicant Details">
          <Field label="Full Name of Applicant" placeholder="Enter full name" value={f.applicantName} onChange={e=>u("applicantName",e.target.value)}/>
          <Field label="NIC Number" placeholder="Enter NIC number" value={f.nic} onChange={e=>u("nic",e.target.value)}/>
          <Field label="Address" placeholder="Enter full address" value={f.address} onChange={e=>u("address",e.target.value)}/>
          <Field label="Phone Number" placeholder="Enter phone number" value={f.phone} onChange={e=>u("phone",e.target.value)}/>
        </FormSection>

        <FormSection title="2. Mineral Details">
          <Field label="Name of Mineral" value="Sand" readOnly/>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10}}>
            <Field label="Quantity" placeholder="e.g. 10" value={f.qty} onChange={e=>u("qty",e.target.value)}/>
            <SelectField label="Unit" value={f.unit} onChange={e=>u("unit",e.target.value)} options={["Cubes","Tons"]}/>
          </div>
        </FormSection>

        <FormSection title="3. Mining / Trading Licence">
          <SelectField label="Licence Type" value={f.licenceType} onChange={e=>u("licenceType",e.target.value)}
            options={["Mining Licence","Trading Licence","Special Permission"]}/>
          <Field label="Licence Number" placeholder="e.g. ML/2025/00123" value={f.miningLicenceNo} onChange={e=>u("miningLicenceNo",e.target.value)}/>
        </FormSection>

        <FormSection title="4. Location of Mine / Source">
          <SelectField label="District" value={f.district} onChange={e=>u("district",e.target.value)}
            options={["Badulla","Colombo","Gampaha","Kandy","Galle","Matara","Ratnapura","Kurunegala","Anuradhapura","Polonnaruwa","Trincomalee","Batticaloa","Jaffna","Vavuniya","Ampara","Kegalle","Kalutara","Matale","Nuwara Eliya","Hambantota","Mullaitivu","Kilinochchi","Mannar","Puttalam","Moneragala"]}/>
          <Field label="Divisional Secretary (DS) Division" placeholder="Enter DS Division" value={f.dsDivision} onChange={e=>u("dsDivision",e.target.value)}/>
          <Field label="Grama Niladhari (GN) Division" placeholder="Enter GN Division" value={f.gnDivision} onChange={e=>u("gnDivision",e.target.value)}/>
          <Field label="Village" placeholder="Enter village name" value={f.village} onChange={e=>u("village",e.target.value)}/>
          <Field label="Name of Land / Store" placeholder="e.g. Galketiya Sand Store" value={f.landName} onChange={e=>u("landName",e.target.value)}/>
        </FormSection>

        <FormSection title="5. Purpose & Destination">
          <Field label="Purpose of Transport" placeholder="e.g. Construction, Retail sale" value={f.purpose} onChange={e=>u("purpose",e.target.value)}/>
          <Field label="Destination (Buyer / Store / Site)" placeholder="Enter destination name" value={f.destination} onChange={e=>u("destination",e.target.value)}/>
          <Field label="Destination Address" placeholder="Enter full destination address" value={f.destinationAddress} onChange={e=>u("destinationAddress",e.target.value)}/>
        </FormSection>

        <FormSection title="6. Transport Details">
          <SelectField label="Vehicle Type" value={f.vehicleType} onChange={e=>u("vehicleType",e.target.value)}
            options={["Lorry","Tipper","Tractor","Other"]}/>
          <Field label="Vehicle Number" placeholder="e.g. NB-1234" value={f.vehicleNo} onChange={e=>u("vehicleNo",e.target.value)}/>
          <Field label="Starting Place of Transport" placeholder="Enter starting location" value={f.startPlace} onChange={e=>u("startPlace",e.target.value)}/>
          <div style={{fontSize:12,fontWeight:700,color:TS,marginBottom:8}}>Via Towns (up to 4)</div>
          <Field label="Via Town 1" placeholder="e.g. Bandarawela" value={f.via1} onChange={e=>u("via1",e.target.value)}/>
          <Field label="Via Town 2" placeholder="e.g. Ella" value={f.via2} onChange={e=>u("via2",e.target.value)}/>
          <Field label="Via Town 3 (optional)" placeholder="" value={f.via3} onChange={e=>u("via3",e.target.value)}/>
          <Field label="Via Town 4 (optional)" placeholder="" value={f.via4} onChange={e=>u("via4",e.target.value)}/>
        </FormSection>

        <FormSection title="7. Requested Transport Period">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Field label="From Date" type="date" value={f.transportFrom} onChange={e=>u("transportFrom",e.target.value)}/>
            <Field label="To Date" type="date" value={f.transportTo} onChange={e=>u("transportTo",e.target.value)}/>
          </div>
          <div style={{fontSize:11,color:GR,marginTop:-8}}>Maximum validity: 1 month · Maximum 25 trips</div>
        </FormSection>

        <FormSection title="8. Upload Documents">
          {[
            {key:"docsLicence",label:"Mining / Trading Licence Copy",required:true},
            {key:"docsNIC",label:"NIC Copy of Applicant",required:true},
          ].map(d=>(
            <div key={d.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"12px 14px",border:`1.5px dashed ${GB}`,borderRadius:10,marginBottom:10,
              background:f[d.key]?"#F0F9F2":"#FAF8F5"}}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:TX}}>
                  {d.label}{d.required&&<span style={{color:"#C0392B"}}> *</span>}
                </div>
                <div style={{fontSize:11,color:f[d.key]?"#1E8A4C":"#9CA3AF"}}>
                  {f[d.key]?"✓ Uploaded":"PDF or image, max 5MB"}
                </div>
              </div>
              <button onClick={()=>u(d.key,!f[d.key])} style={{padding:"8px 14px",borderRadius:8,
                border:`1.5px solid ${M}`,background:f[d.key]?M:W,color:f[d.key]?W:M,
                fontSize:12,fontWeight:700,cursor:"pointer"}}>
                {f[d.key]?"Replace":"Upload"}
              </button>
            </div>
          ))}
        </FormSection>

        <div style={{background:GP,border:`1px solid ${G}55`,borderRadius:10,padding:"12px 14px",
          marginBottom:16,fontSize:12,color:TS,lineHeight:1.6}}>
          💡 No payment is needed to apply. If your application is approved, you'll be notified and given payment instructions (licence fee + royalty) at that point.
        </div>

        <button onClick={()=>onSubmit(f)} style={{...baseBtn,background:`linear-gradient(135deg,${M},${ML})`,
          color:W,boxShadow:"0 6px 18px rgba(107,26,42,0.35)",marginBottom:8}}>
          {rejectionInfo?"Resubmit Application":"Submit Application"}
        </button>
        <div style={{textAlign:"center",fontSize:11,color:GR,marginBottom:8}}>
          {rejectionInfo
            ?"Your corrected application will go back to the GSMB Pending queue."
            :"Your application will be reviewed by the GSMB Regional Officer."}
        </div>
      </ScrollBody>
    </>
  );
}

// ── Permit Viewer (digital Form 7 front + back) ──────────────────
