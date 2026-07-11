// ═══════════════════════════════════════════════════════════
// DAY 4 — Person C (GSMB)
// [FEATURE] GSMB application review flow: overview, list, detail, approve/reject with checklist
// ═══════════════════════════════════════════════════════════

// GSMB application management - overview dashboard, list and review screen

import { useState, useEffect } from "react";
import slEmblem from "./image/sl-emblem.png";
import gsmbLogo from "./image/gsmb-logo.png";
import { M, MD, ML, G, GL, GP, W, OW, GR, GB, TX, TS, NV, NM, baseInput, baseBtn, t } from "./theme";
import { Field, WebStatusBadge, webInput, webBtn } from "./uiComponents";
import { WebSettingsScreen } from "./settingsAndDocs";
import { useIsDesktop } from "./tripUtils";
import { GSMBPermitDetail } from "./GSMBPermitDetail";

export const MOCK_APPLICATIONS = [
  {
    id: "APP-2026-0143", submittedDate: "10 Jun 2026", status: "Pending",
    applicantName: "Kamal Perera", nic: "871234567V",
    address: "No. 45, Main Street, Badulla", phone: "077 123 4567",
    mineral: "Sand", qty: "8", unit: "Cubes",
    licenceType: "Mining Licence", miningLicenceNo: "ML/2025/00123",
    district: "Badulla", dsDivision: "Badulla DS Division",
    gnDivision: "45 - Bandarawela", village: "Galketiya", landName: "Galketiya Sand Store",
    purpose: "Construction", vehicleType: "Lorry", vehicleNo: "NB-1234",
    startPlace: "Galketiya Sand Store", via1: "Bandarawela", via2: "Ella", via3: "", via4: "",
    destination: "Colombo Construction Site", destinationAddress: "No. 12, Baseline Road, Colombo 09",
    transportFrom: "2026-06-15", transportTo: "2026-07-14",
    royaltyReceiptNo: "RR-998877", royaltyAmount: "5000", licenceFeeReceipt: "LF-2026-0456",
    docs: { licence: true, royalty: true, payslip: true, nic: true },
  },
  {
    id: "APP-2026-0144", submittedDate: "12 Jun 2026", status: "Payment Submitted",
    applicantName: "Nadeeka Silva", nic: "885678901V",
    address: "No. 12, Lake Road, Kandy", phone: "071 987 6543",
    mineral: "Sand", qty: "12", unit: "Cubes",
    licenceType: "Trading Licence", miningLicenceNo: "TL/2025/00456",
    district: "Kandy", dsDivision: "Kandy DS Division",
    gnDivision: "32 - Peradeniya", village: "Peradeniya", landName: "Mahaweli Sand Store",
    purpose: "Retail Sale", vehicleType: "Tipper", vehicleNo: "KA-5678",
    startPlace: "Mahaweli Sand Store", via1: "Peradeniya", via2: "Kandy", via3: "", via4: "",
    destination: "Gampola Hardware Store", destinationAddress: "No. 5, Main Street, Gampola",
    transportFrom: "2026-06-20", transportTo: "2026-07-19",
    docs: { licence: true, nic: true },
    licenceNo: "TL/2026/04488", officerName: "W.A.C.A. Madhushika",
    validFrom: "2026-06-20", validTo: "2026-07-19", royaltyAmountDue: "8000",
    royaltyReceiptNo: "RR-112233", royaltyAmount: "8000", licenceFeeReceipt: "LF-2026-0789",
    paymentSlipFile: "payment-slip-0144.jpg",
  },
  {
    id: "APP-2026-0139", submittedDate: "08 Jun 2026", status: "Approved",
    applicantName: "Ruwan Bandara", nic: "791234567V",
    address: "No. 78, Temple Road, Galle", phone: "076 345 6789",
    mineral: "Sand", qty: "6", unit: "Cubes",
    licenceType: "Mining Licence", miningLicenceNo: "ML/2024/00789",
    district: "Galle", dsDivision: "Galle DS Division",
    gnDivision: "12 - Hikkaduwa", village: "Hikkaduwa", landName: "Hikkaduwa River Sand",
    purpose: "Construction", vehicleType: "Lorry", vehicleNo: "GL-9012",
    startPlace: "Hikkaduwa River Sand", via1: "Hikkaduwa", via2: "Galle", via3: "", via4: "",
    destination: "Matara Housing Project", destinationAddress: "New Town, Matara",
    transportFrom: "2026-06-10", transportTo: "2026-07-09",
    royaltyReceiptNo: "RR-334455", royaltyAmount: "3500", licenceFeeReceipt: "LF-2026-0321",
    docs: { licence: true, royalty: true, payslip: true, nic: true },
  },
  {
    id: "APP-2026-0121", submittedDate: "02 Jun 2026", status: "Rejected",
    applicantName: "Priya Fernando", nic: "826789012V",
    address: "No. 33, Beach Road, Negombo", phone: "070 111 2222",
    mineral: "Sand", qty: "10", unit: "Cubes",
    licenceType: "Trading Licence", miningLicenceNo: "TL/2024/01234",
    district: "Gampaha", dsDivision: "Negombo DS Division",
    gnDivision: "08 - Negombo Town", village: "Negombo", landName: "Dandugam Oya Sand",
    purpose: "Export", vehicleType: "Lorry", vehicleNo: "WP-3456",
    startPlace: "Dandugam Oya Sand", via1: "Negombo", via2: "Ja-Ela", via3: "", via4: "",
    destination: "Colombo Port", destinationAddress: "Port Entry Gate 2, Colombo 01",
    transportFrom: "2026-06-05", transportTo: "2026-07-04",
    royaltyReceiptNo: "RR-556677", royaltyAmount: "6000", licenceFeeReceipt: "LF-2026-0111",
    docs: { licence: true, royalty: false, payslip: true, nic: true },
    rejectionReason: "Mining licence copy could not be verified. Please resubmit with a valid copy.",
  },
];

// ── Web styles helpers ────────────────────────────────────────────
export function GSMBOverview({applications,onGoTo,onOpen,officerName="Officer"}){
  const pending=applications.filter(a=>a.status==="Pending").length;
  const approved=applications.filter(a=>a.status==="Approved").length;
  const rejected=applications.filter(a=>a.status==="Rejected").length;

  const stats=[
    {label:"Total Applications",value:applications.length,color:"#6B1A2A",bg:"#FDF3D7",icon:"📋"},
    {label:"Pending Review",value:pending,color:"#9A7B1F",bg:"#FDF3D7",icon:"⏳",action:()=>onGoTo("pending")},
    {label:"Approved",value:approved,color:"#1E8A4C",bg:"#E5F5EA",icon:"✅",action:()=>onGoTo("approved")},
    {label:"Rejected",value:rejected,color:"#C0392B",bg:"#FBEAEA",icon:"❌",action:()=>onGoTo("rejected")},
  ];

  return(
    <div>
      {/* Hero */}
      <div style={{background:`linear-gradient(135deg,${MD} 0%,${M} 55%,${ML} 100%)`,
        borderRadius:18,padding:"36px 36px",marginBottom:32,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-70,right:-70,width:260,height:260,
          borderRadius:"50%",background:"rgba(201,168,76,0.12)"}}/>
        <div style={{position:"relative",maxWidth:560}}>
          <div style={{color:G,fontSize:13,fontWeight:700,letterSpacing:"0.1em",
            textTransform:"uppercase",marginBottom:10}}>GSMB Regional Office</div>
          <h1 style={{fontSize:36,fontWeight:800,color:"#fff",margin:"0 0 12px",lineHeight:1.15}}>
            Welcome back, {officerName.split(" ").pop()}
          </h1>
          <p style={{fontSize:16,color:"rgba(255,255,255,0.82)",margin:0,lineHeight:1.6}}>
            Review sand transport permit applications, verify documents, and issue Form 7 licences for your region.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:18,marginBottom:32}}>
        {stats.map((s,i)=>(
          <div key={i} onClick={s.action} style={{background:"#fff",borderRadius:16,padding:"24px",
            boxShadow:"0 2px 14px rgba(0,0,0,0.06)",cursor:s.action?"pointer":"default",
            border:`1px solid ${s.bg}`,transition:"transform 0.15s"}}
            onMouseEnter={e=>{if(s.action)e.currentTarget.style.transform="translateY(-2px)"}}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{fontSize:32,marginBottom:10}}>{s.icon}</div>
            <div style={{fontSize:34,fontWeight:900,color:s.color,marginBottom:6}}>{s.value}</div>
            <div style={{fontSize:14,color:"#6B7280",fontWeight:600}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent applications */}
      <div style={{background:"#fff",borderRadius:16,padding:"26px",boxShadow:"0 2px 14px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
          <div style={{fontSize:21,fontWeight:800,color:"#1A0A0F"}}>Recent Applications</div>
          <button onClick={()=>onGoTo("pending")} style={webBtn("#FDF3D7","#6B1A2A",{fontSize:14,padding:"10px 18px"})}>
            View All Pending →
          </button>
        </div>
        <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:14,minWidth:560}}>
          <thead>
            <tr style={{background:"#FAF8F5"}}>
              {["Application ID","Applicant","District","Quantity","Submitted","Status","Action"].map(h=>(
                <th key={h} style={{padding:"13px 16px",textAlign:"left",fontWeight:700,
                  color:"#5A3A42",borderBottom:"2px solid #F0EBE3",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applications.slice(0,5).map((a,i)=>(
              <tr key={a.id} style={{borderBottom:"1px solid #F8F5F0",
                background:i%2===0?"#fff":"#FAFAF8"}}>
                <td style={{padding:"14px 16px",fontWeight:700,color:"#6B1A2A"}}>{a.id}</td>
                <td style={{padding:"14px 16px"}}>{a.applicantName}</td>
                <td style={{padding:"14px 16px"}}>{a.district}</td>
                <td style={{padding:"14px 16px"}}>{a.qty} {a.unit}</td>
                <td style={{padding:"14px 16px",color:"#6B7280"}}>{a.submittedDate}</td>
                <td style={{padding:"14px 16px"}}><WebStatusBadge status={a.status}/></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ── Application List ──────────────────────────────────────────────
export function GSMBApplicationList({applications,statusFilter,onOpen}){
  const [search,setSearch]=useState("");
  const filtered=applications
    .filter(a=>statusFilter==="all"||a.status===statusFilter)
    .filter(a=>!search||a.id.toLowerCase().includes(search.toLowerCase())||
      a.applicantName.toLowerCase().includes(search.toLowerCase())||
      a.district.toLowerCase().includes(search.toLowerCase())||
      (a.vehicleNo&&a.vehicleNo.toLowerCase().includes(search.toLowerCase())));

  const titles={"Pending":"Pending Review","Payment Submitted":"Payment Review","Approved":"Approved","Rejected":"Rejected"};

  return(
    <div>
      <h2 style={{fontSize:30,fontWeight:800,color:"#1A0A0F",margin:"0 0 8px"}}>
        {titles[statusFilter]||"All Applications"}
      </h2>
      <p style={{fontSize:15,color:"#6B7280",margin:"0 0 22px"}}>
        {filtered.length} application{filtered.length!==1?"s":""}
      </p>

      {/* Search */}
      <div style={{display:"flex",gap:12,marginBottom:20}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by ID, name or district..."
          style={{...webInput,maxWidth:380,fontSize:14,padding:"12px 16px"}}/>
      </div>

      <div style={{background:"#fff",borderRadius:14,boxShadow:"0 2px 10px rgba(0,0,0,0.05)",overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:14,minWidth:760}}>
          <thead>
            <tr style={{background:"#FAF8F5"}}>
              {["Application ID","Applicant","NIC","District","Vehicle No.","Qty","Submitted","Status","Action"].map(h=>(
                <th key={h} style={{padding:"13px 14px",textAlign:"left",fontWeight:700,
                  color:"#5A3A42",borderBottom:"2px solid #F0EBE3",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a,i)=>(
              <tr key={a.id} style={{borderBottom:"1px solid #F8F5F0",background:i%2===0?"#fff":"#FAFAF8"}}>
                <td style={{padding:"12px 14px",fontWeight:700,color:"#6B1A2A"}}>{a.id}</td>
                <td style={{padding:"12px 14px"}}>{a.applicantName}</td>
                <td style={{padding:"12px 14px",color:"#6B7280"}}>{a.nic}</td>
                <td style={{padding:"12px 14px"}}>{a.district}</td>
                <td style={{padding:"12px 14px"}}>{a.vehicleNo}</td>
                <td style={{padding:"12px 14px"}}>{a.qty} {a.unit}</td>
                <td style={{padding:"12px 14px",color:"#6B7280"}}>{a.submittedDate}</td>
                <td style={{padding:"12px 14px"}}>
                  <WebStatusBadge status={a.status}/>
                  {a.resubmittedAt&&(
                    <span style={{marginLeft:6,fontSize:10,fontWeight:700,color:"#9A7B1F",
                      background:"#FDF3D7",padding:"2px 7px",borderRadius:10}}>↩ Resubmitted</span>
                  )}
                </td>
                <td style={{padding:"12px 14px"}}>
                  <button onClick={()=>onOpen(a)} style={webBtn("#6B1A2A","#fff",{fontSize:12})}>
                    Review
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length===0&&(
              <tr><td colSpan={9} style={{padding:"40px",textAlign:"center",color:"#9CA3AF"}}>
                No applications found.
              </td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ── Application Detail / Review ───────────────────────────────────
export function GSMBApplicationDetail({app,onBack,onApprove,onReject}){
  const [showIssueForm,setShowIssueForm]=useState(false);
  const [showRejectForm,setShowRejectForm]=useState(false);
  const [rejectReason,setRejectReason]=useState("");
  const STANDARD_MISSING_ITEMS=[
    "Mining / Trading Licence copy missing or invalid",
    "NIC copy missing or unclear",
    "Mine location details incomplete or inconsistent",
    "Vehicle number invalid or unregistered",
    "Quantity declared seems inconsistent with mining licence",
  ];
  const [missingItems,setMissingItems]=useState(()=>{
    const auto=[];
    if(app.docs&&!app.docs.licence) auto.push(STANDARD_MISSING_ITEMS[0]);
    if(app.docs&&!app.docs.nic) auto.push(STANDARD_MISSING_ITEMS[1]);
    return auto;
  });
  const [customItem,setCustomItem]=useState("");
  const toggleItem=(item)=>setMissingItems(prev=>prev.includes(item)?prev.filter(x=>x!==item):[...prev,item]);

  // Permit issue fields (pre-filled from application)
  const [licenceNo,setLicenceNo]=useState(`TL/2026/${String(Math.floor(Math.random()*90000)+10000)}`);
  const [officerName,setOfficerName]=useState("W.A.C.A. Madhushika");
  const [validFrom,setValidFrom]=useState(app.transportFrom);
  const [validTo,setValidTo]=useState(app.transportTo);

  const Row=({label,value})=>(
    <div style={{display:"flex",padding:"10px 0",borderBottom:"1px solid #F8F5F0"}}>
      <span style={{width:220,color:"#6B7280",fontSize:13,flexShrink:0}}>{label}</span>
      <span style={{fontSize:13,fontWeight:600,color:"#1A0A0F"}}>{value||"—"}</span>
    </div>
  );

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24}}>
        <button onClick={onBack} style={webBtn("#F3F0EB","#5A3A42",{fontSize:13})}>← Back</button>
        <div>
          <h2 style={{fontSize:22,fontWeight:800,color:"#1A0A0F",margin:0}}>{app.id}</h2>
          <div style={{fontSize:13,color:"#6B7280",marginTop:2}}>
            Submitted: {app.submittedDate} · <WebStatusBadge status={app.status}/>
          </div>
        </div>
        {app.status==="Pending"&&(
          <div style={{marginLeft:"auto",display:"flex",gap:10}}>
            <button onClick={()=>{setShowRejectForm(true);setShowIssueForm(false);}}
              style={webBtn("#FBEAEA","#C0392B")}>✕ Reject Application</button>
            <button onClick={()=>{setShowIssueForm(true);setShowRejectForm(false);}}
              style={webBtn("#6B1A2A","#fff")}>✓ Approve Application</button>
          </div>
        )}
        {app.status==="Payment Submitted"&&(
          <div style={{marginLeft:"auto",display:"flex",gap:10}}>
            <button onClick={()=>setShowIssueForm(true)}
              style={webBtn("#1E8A4C","#fff")}>✓ Confirm Payment &amp; Issue Permit</button>
          </div>
        )}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16}}>

        {/* Left column */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>

          {/* Applicant */}
          <div style={{background:"#fff",borderRadius:14,padding:"20px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
            <div style={{fontSize:13,fontWeight:800,color:"#6B1A2A",marginBottom:14,
              textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:"2px solid #FDF3D7",paddingBottom:8}}>
              1. Applicant Details
            </div>
            <Row label="Full Name" value={app.applicantName}/>
            <Row label="NIC Number" value={app.nic}/>
            <Row label="Address" value={app.address}/>
            <Row label="Phone Number" value={app.phone}/>
          </div>

          {/* Mineral */}
          <div style={{background:"#fff",borderRadius:14,padding:"20px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
            <div style={{fontSize:13,fontWeight:800,color:"#6B1A2A",marginBottom:14,
              textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:"2px solid #FDF3D7",paddingBottom:8}}>
              2. Mineral & Licence
            </div>
            <Row label="Mineral" value={app.mineral}/>
            <Row label="Quantity" value={`${app.qty} ${app.unit}`}/>
            <Row label="Licence Type" value={app.licenceType}/>
            <Row label="Licence Number" value={app.miningLicenceNo}/>
          </div>

          {/* Location */}
          <div style={{background:"#fff",borderRadius:14,padding:"20px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
            <div style={{fontSize:13,fontWeight:800,color:"#6B1A2A",marginBottom:14,
              textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:"2px solid #FDF3D7",paddingBottom:8}}>
              3. Mine Location
            </div>
            <Row label="District" value={app.district}/>
            <Row label="DS Division" value={app.dsDivision}/>
            <Row label="GN Division" value={app.gnDivision}/>
            <Row label="Village" value={app.village}/>
            <Row label="Land / Store Name" value={app.landName}/>
          </div>
        </div>

        {/* Right column */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>

          {/* Transport */}
          <div style={{background:"#fff",borderRadius:14,padding:"20px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
            <div style={{fontSize:13,fontWeight:800,color:"#6B1A2A",marginBottom:14,
              textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:"2px solid #FDF3D7",paddingBottom:8}}>
              4. Transport Details
            </div>
            <Row label="Vehicle Type" value={app.vehicleType}/>
            <Row label="Vehicle Number" value={app.vehicleNo}/>
            <Row label="Starting Place" value={app.startPlace}/>
            <Row label="Via Town 1" value={app.via1}/>
            <Row label="Via Town 2" value={app.via2}/>
            {app.via3&&<Row label="Via Town 3" value={app.via3}/>}
            {app.via4&&<Row label="Via Town 4" value={app.via4}/>}
            <Row label="Destination" value={app.destination}/>
            <Row label="Destination Address" value={app.destinationAddress}/>
            <Row label="Transport From" value={app.transportFrom}/>
            <Row label="Transport To" value={app.transportTo}/>
            <Row label="Purpose" value={app.purpose}/>
          </div>

          {/* Payment Status */}
          {app.status!=="Pending"&&app.status!=="Rejected"&&(
            <div style={{background:"#fff",borderRadius:14,padding:"20px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
              <div style={{fontSize:13,fontWeight:800,color:"#6B1A2A",marginBottom:14,
                textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:"2px solid #FDF3D7",paddingBottom:8}}>
                5. Payment Status
              </div>
              {app.status==="Awaiting Payment"&&(
                <>
                  <Row label="Licence Fee Due" value="Rs. 250.00"/>
                  <div style={{marginTop:12,fontSize:12,color:"#9A7B1F",fontWeight:600}}>
                    ⏳ Waiting for the applicant to pay and submit proof of payment.
                  </div>
                </>
              )}
              {(app.status==="Payment Submitted"||app.status==="Approved")&&(
                <>
                  <Row label="Licence Fee Receipt" value={app.licenceFeeReceipt}/>
                  <Row label="Payment Slip" value={app.paymentSlipFile}/>
                  {app.status==="Payment Submitted"&&(
                    <div style={{marginTop:12,fontSize:12,color:"#1E5FA8",fontWeight:600}}>
                      📨 Submitted by applicant — review and confirm above.
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Documents */}
          <div style={{background:"#fff",borderRadius:14,padding:"20px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
            <div style={{fontSize:13,fontWeight:800,color:"#6B1A2A",marginBottom:14,
              textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:"2px solid #FDF3D7",paddingBottom:8}}>
              6. Uploaded Documents
            </div>
            {[
              ["Mining / Trading Licence",app.docs.licence],
              ["NIC Copy",app.docs.nic],
            ].map(([label,ok])=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",
                alignItems:"center",padding:"10px 0",borderBottom:"1px solid #F8F5F0"}}>
                <span style={{fontSize:13,color:"#5A3A42"}}>{label}</span>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:12,fontWeight:700,color:ok?"#1E8A4C":"#C0392B"}}>
                    {ok?"✓ Uploaded":"✕ Missing"}
                  </span>
                  {ok&&(
                    <button style={webBtn("#E5F5EA","#1E8A4C",{fontSize:11,padding:"4px 10px"})}>
                      View
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rejection reason display */}
      {app.status==="Rejected"&&app.rejectionReason&&(
        <div style={{marginTop:16,background:"#FBEAEA",border:"1px solid #F5C6C6",
          borderRadius:12,padding:"16px 20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#C0392B",marginBottom:4}}>Rejection Reason</div>
          <div style={{fontSize:13,color:"#5A3A42",marginBottom:app.missingItems?.length?10:0}}>{app.rejectionReason}</div>
          {app.missingItems&&app.missingItems.length>0&&(
            <>
              <div style={{fontSize:13,fontWeight:700,color:"#C0392B",marginBottom:4}}>Checklist sent to applicant</div>
              <ul style={{margin:0,paddingLeft:18}}>
                {app.missingItems.map((m,i)=>(
                  <li key={i} style={{fontSize:13,color:"#5A3A42"}}>{m}</li>
                ))}
              </ul>
            </>
          )}
          {app.awaitingResubmission&&(
            <div style={{marginTop:10,fontSize:12,fontWeight:700,color:"#9A7B1F"}}>
              ⏳ Awaiting corrected resubmission from applicant
            </div>
          )}
        </div>
      )}

      {/* Approval / Issue Permit Form */}
      {showIssueForm&&app.status==="Pending"&&(
        <div style={{marginTop:16,background:"#E5F5EA",border:"2px solid #86EFAC",
          borderRadius:14,padding:"24px"}}>
          <div style={{fontSize:16,fontWeight:800,color:"#1E8A4C",marginBottom:16}}>
            ✓ Approve Application
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:16}}>
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"#5A3A42",marginBottom:6}}>
                Transport Licence No.
              </label>
              <input value={licenceNo} onChange={e=>setLicenceNo(e.target.value)}
                style={webInput}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"#5A3A42",marginBottom:6}}>
                Authorizing Officer Name
              </label>
              <input value={officerName} onChange={e=>setOfficerName(e.target.value)}
                style={webInput}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"#5A3A42",marginBottom:6}}>
                Valid From
              </label>
              <input type="date" value={validFrom} onChange={e=>setValidFrom(e.target.value)}
                style={webInput}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"#5A3A42",marginBottom:6}}>
                Valid To (max 1 month)
              </label>
              <input type="date" value={validTo} onChange={e=>setValidTo(e.target.value)}
                style={webInput}/>
            </div>
          </div>
          <div style={{background:"#fff",border:"1px solid #86EFAC",borderRadius:10,
            padding:"12px 16px",fontSize:12,color:"#5A3A42",marginBottom:16}}>
            ℹ️ This moves the application to <b>Awaiting Payment</b>. The applicant will be asked to pay the transport licence fee (Rs. 250) and submit proof. The permit is issued once you confirm that payment.
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setShowIssueForm(false)}
              style={webBtn("#F3F0EB","#5A3A42")}>Cancel</button>
            <button
              onClick={()=>onApprove(app.id,{licenceNo,officerName,validFrom,validTo})}
              style={webBtn("#1E8A4C","#fff")}>
              ✓ Approve &amp; Request Payment
            </button>
          </div>
        </div>
      )}

      {showIssueForm&&app.status==="Payment Submitted"&&(
        <div style={{marginTop:16,background:"#E5F5EA",border:"2px solid #86EFAC",
          borderRadius:14,padding:"24px"}}>
          <div style={{fontSize:16,fontWeight:800,color:"#1E8A4C",marginBottom:16}}>
            ✓ Confirm Payment &amp; Issue Permit
          </div>
          <Row label="Transport Licence No." value={app.licenceNo}/>
          <Row label="Authorizing Officer" value={app.officerName}/>
          <Row label="Valid From" value={app.validFrom}/>
          <Row label="Valid To" value={app.validTo}/>
          <Row label="Licence Fee Paid" value="Rs. 250.00"/>
          <Row label="Payment Slip" value={app.paymentSlipFile}/>
          <div style={{background:"#fff",border:"1px solid #86EFAC",borderRadius:10,
            padding:"12px 16px",fontSize:12,color:"#5A3A42",marginTop:14,marginBottom:16}}>
            ℹ️ This will generate permit number <b>PMT-2026-{String(Math.floor(Math.random()*900)+100)}</b> and send it to the permit holder's SandPass app. Max 25 trips allowed.
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setShowIssueForm(false)}
              style={webBtn("#F3F0EB","#5A3A42")}>Cancel</button>
            <button onClick={()=>onApprove(app.id,{
              licenceNo:app.licenceNo,officerName:app.officerName,validFrom:app.validFrom,validTo:app.validTo
            })} style={webBtn("#1E8A4C","#fff")}>
              ✓ Confirm &amp; Issue Permit
            </button>
          </div>
        </div>
      )}

      {/* Reject Form */}
      {showRejectForm&&(
        <div style={{marginTop:16,background:"#FBEAEA",border:"2px solid #F5C6C6",
          borderRadius:14,padding:"24px"}}>
          <div style={{fontSize:16,fontWeight:800,color:"#C0392B",marginBottom:12}}>
            ✕ Reject Application
          </div>

          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:13,fontWeight:600,color:"#5A3A42",marginBottom:8}}>
              What's missing or wrong? (sent to applicant as a checklist)
            </label>
            <div style={{background:"#fff",borderRadius:10,border:"1.5px solid #F5C6C6",padding:"6px 14px"}}>
              {STANDARD_MISSING_ITEMS.map((item,i)=>(
                <label key={item} style={{display:"flex",alignItems:"flex-start",gap:8,
                  padding:"9px 0",borderBottom:i<STANDARD_MISSING_ITEMS.length-1?"1px solid #FBEAEA":"none",
                  cursor:"pointer",fontSize:13,color:"#1A0A0F"}}>
                  <input type="checkbox" checked={missingItems.includes(item)}
                    onChange={()=>toggleItem(item)}
                    style={{accentColor:"#C0392B",width:15,height:15,marginTop:2,flexShrink:0}}/>
                  {item}
                </label>
              ))}
              {missingItems.filter(m=>!STANDARD_MISSING_ITEMS.includes(m)).map(item=>(
                <div key={item} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"9px 0",borderTop:"1px solid #FBEAEA",fontSize:13,color:"#1A0A0F"}}>
                  <span>✓ {item}</span>
                  <span onClick={()=>toggleItem(item)} style={{color:"#C0392B",cursor:"pointer",fontSize:12,fontWeight:700}}>
                    Remove
                  </span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <input value={customItem} onChange={e=>setCustomItem(e.target.value)}
                placeholder="Add another specific item..." style={{...webInput,flex:1}}/>
              <button onClick={()=>{
                if(customItem.trim()){setMissingItems(prev=>[...prev,customItem.trim()]);setCustomItem("");}
              }} style={webBtn("#F3F0EB","#5A3A42")}>Add</button>
            </div>
          </div>

          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:13,fontWeight:600,color:"#5A3A42",marginBottom:6}}>
              Additional Notes (optional, sent to applicant)
            </label>
            <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)}
              placeholder="Any extra context for the applicant..."
              rows={3} style={{...webInput,resize:"vertical"}}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setShowRejectForm(false)}
              style={webBtn("#F3F0EB","#5A3A42")}>Cancel</button>
            <button disabled={missingItems.length===0&&!rejectReason.trim()}
              onClick={()=>onReject(app.id,
                rejectReason.trim()||"Application rejected — see checklist of items to correct below.",
                missingItems)}
              style={webBtn((missingItems.length===0&&!rejectReason.trim())?"#DDD5C8":"#C0392B","#fff")}>
              Confirm Rejection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── GSMB Permit Detail (web view of Form 7) ─────────────────────
// ── Print/Save-as-Document styles (Holder, Driver, GSMB only) ────
