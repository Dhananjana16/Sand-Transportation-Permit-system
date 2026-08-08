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

// ─── UI STRINGS — English, Sinhala, Tamil ────────────────────────
// Note: these cover everyday navigation/form labels. As with the FAQ
// content elsewhere in this app, anything legally/procedurally
// sensitive should get a native-speaker review before real government
// deployment.
export const UI = {
  English: {
    welcome:"Welcome", selectLanguage:"Select Language", continueBtn:"Continue",
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
    newApplication:"New Application", permitHolder:"Permit Holder", driver:"Driver",
    continueAs:"Continue as", sandTransportPermitSystem:"Sand Transport Permit System",
  },
  Sinhala: {
    welcome:"සාදරයෙන් පිළිගනිමු", selectLanguage:"භාෂාව තෝරන්න", continueBtn:"ඉදිරියට",
    home:"මුල් පිටුව", applications:"අයදුම්පත්", permits:"අවසර පත්", drivers:"රියදුරන්",
    profile:"පැතිකඩ", myPermits:"මගේ අවසර පත්", tripLog:"ගමන් වාර්තාව",
    signIn:"පුරන්න", register:"ලියාපදිංචි වන්න", logIn:"පුරන්න", createAccount:"ගිණුමක් සාදන්න",
    fullName:"සම්පූර්ණ නම", nicNumber:"ජා.හැ. අංකය", emailAddress:"විද්‍යුත් තැපැල් ලිපිනය",
    address:"ලිපිනය", phoneNumber:"දුරකථන අංකය", drivingLicenceNumber:"රියදුරු බලපත්‍ර අංකය",
    password:"මුරපදය", confirmPassword:"මුරපදය තහවුරු කරන්න", rememberMe:"මාව මතක තබාගන්න",
    applyNewPermit:"+ නව අවසර පත්‍රයක් සඳහා අයදුම් කරන්න (7 ආකෘතිය)", viewPermit:"අවසර පත්‍රය බලන්න",
    search:"සොයන්න", settings:"සැකසුම්", editProfile:"පැතිකඩ සංස්කරණය කරන්න",
    saveChanges:"වෙනස්කම් සුරකින්න", account:"ගිණුම", logOut:"පිටවන්න", deleteAccount:"ගිණුම මකන්න",
    cancel:"අවලංගු කරන්න", confirm:"තහවුරු කරන්න", faqTitle:"නිතර අසන ප්‍රශ්න",
    newApplication:"නව අයදුම්පත", permitHolder:"අවසර පත්‍රලාභී", driver:"රියදුරු",
    continueAs:"ලෙස ඉදිරියට යන්න", sandTransportPermitSystem:"වැලි ප්‍රවාහන අවසර පද්ධතිය",
  },
  Tamil: {
    welcome:"வரவேற்கிறோம்", selectLanguage:"மொழியைத் தேர்ந்தெடுக்கவும்", continueBtn:"தொடரவும்",
    home:"முகப்பு", applications:"விண்ணப்பங்கள்", permits:"அனுமதிகள்", drivers:"ஓட்டுநர்கள்",
    profile:"சுயவிவரம்", myPermits:"எனது அனுமதிகள்", tripLog:"பயண பதிவு",
    signIn:"உள்நுழைய", register:"பதிவு செய்க", logIn:"உள்நுழைய", createAccount:"கணக்கை உருவாக்கு",
    fullName:"முழுப்பெயர்", nicNumber:"தே.அ.அட்டை எண்", emailAddress:"மின்னஞ்சல் முகவரி",
    address:"முகவரி", phoneNumber:"தொலைபேசி எண்", drivingLicenceNumber:"ஓட்டுநர் உரிம எண்",
    password:"கடவுச்சொல்", confirmPassword:"கடவுச்சொல்லை உறுதிப்படுத்தவும்", rememberMe:"என்னை நினைவில் வைத்திரு",
    applyNewPermit:"+ புதிய அனுமதிக்கு விண்ணப்பிக்க (படிவம் 7)", viewPermit:"அனுமதியைக் காண்க",
    search:"தேடு", settings:"அமைப்புகள்", editProfile:"சுயவிவரத்தைத் திருத்து",
    saveChanges:"மாற்றங்களைச் சேமி", account:"கணக்கு", logOut:"வெளியேறு", deleteAccount:"கணக்கை நீக்கு",
    cancel:"ரத்துசெய்", confirm:"உறுதிப்படுத்து", faqTitle:"அடிக்கடி கேட்கப்படும் கேள்விகள்",
    newApplication:"புதிய விண்ணப்பம்", permitHolder:"அனுமதி வைத்திருப்பவர்", driver:"ஓட்டுநர்",
    continueAs:"தொடரவும்", sandTransportPermitSystem:"மணல் போக்குவரத்து அனுமதி முறைமை",
  },
};

// t(language, key) — looks up the string in the chosen language,
// falling back to English if that language or key isn't found.
export const t=(lang,key)=>(UI[lang]&&UI[lang][key])||UI.English[key]||key;

// ─── LOGOS ───────────────────────────────────────────────────────
