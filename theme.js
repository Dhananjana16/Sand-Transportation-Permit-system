// ═══════════════════════════════════════════════════════════
// DAY 1 — Person A (App)
// [SETUP] Shared design tokens (colors, fonts, input/button base styles) and UI text strings
// ═══════════════════════════════════════════════════════════

// ─── Shared design tokens, colors, and translation strings ───────

export const M = "#6B1A2A", MD = "#4E1120", ML = "#7D2035";
export const G = "#C9A84C", GL = "#E8C96A", GP = "#FDF3D7";
export const W = "#FFFFFF", OW = "#F8F5F0";
export const GR = "#6B7280", GB = "#DDD5C8";
export const TX = "#1A0A0F", TS = "#5A3A42";
export const NV = "#0D1F3C", NM = "#162D52";

export const baseInput = {
  width:"100%", padding:"13px 16px", border:`1.5px solid ${GB}`,
  borderRadius:10, fontSize:14, color:TX, background:W, outline:"none",
  boxSizing:"border-box", fontFamily:"inherit", transition:"border-color 0.2s",
};
export const baseBtn = {
  width:"100%", padding:"14px", borderRadius:10, border:"none",
  fontSize:15, fontWeight:700, cursor:"pointer", letterSpacing:"0.03em",
};

// ─── UI STRINGS (English only) ────────────────────────────────────
export const UI = {
  home:"Home", applications:"Applications", permits:"Permits", drivers:"Drivers",
  profile:"Profile", myPermits:"My Permits", tripLog:"Trip Log",
  signIn:"Sign In", register:"Register", logIn:"Log In", createAccount:"Create Account",
  fullName:"Full Name", nicNumber:"NIC Number", emailAddress:"Email Address",
  address:"Address", phoneNumber:"Phone Number", drivingLicenceNumber:"Driving Licence Number",
  password:"Password", confirmPassword:"Confirm Password", rememberMe:"Remember me",
  applyNewPermit:"+ Apply for New Permit (Form 7)", viewPermit:"View Permit",
  search:"Search", settings:"Settings", editProfile:"Edit Profile",
  saveChanges:"Save Changes", account:"Account", logOut:"Log Out", deleteAccount:"Delete Account",
  cancel:"Cancel", confirm:"Confirm", faqTitle:"Frequently Asked Questions",
  newApplication:"New Application",
};
// t() kept for compatibility — always returns English
export const t=(_lang,key)=>UI[key]||key;

// ─── LOGOS ───────────────────────────────────────────────────────
