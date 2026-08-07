// Live GPS map — free, using Leaflet + OpenStreetMap (no API key, no billing).
// Shows THREE things together, like a ride-hailing app:
//  1. The planned route from the permit's start place to its destination
//     (a real road-following route, via the free OSRM service)
//  2. The driver's actual live position (updates automatically)
//  3. The actual trail the driver has driven so far this trip
//
// Honest limitation: routing/geocoding use free public demo servers —
// fine for a small pilot, but not guaranteed for heavy real-world load.

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "./supabaseClient";
import { M, G, GR, TS, baseInput } from "./theme";
import { geocodeAddress, getRoute } from "./routingUtils";

const truckIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const flagIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [20, 33], iconAnchor: [10, 33], shadowSize: [33, 33],
});

function FitBounds({points}){
  const map = useMap();
  useEffect(()=>{
    if(points && points.length > 1) map.fitBounds(points, {padding:[30,30]});
  }, [points, map]);
  return null;
}

export function LiveMap({tripRowId,driverName,vehicleNo,startPlace,destination,supabaseClient=supabase,interactive=false}){
  const [points,setPoints]=useState([]);
  const [loading,setLoading]=useState(true);
  const [fullscreen,setFullscreen]=useState(false);
  const [route,setRoute]=useState(null); // {path, distanceKm, durationMin}
  const [startCoord,setStartCoord]=useState(null);
  const [destCoord,setDestCoord]=useState(null);
  const [manualStart,setManualStart]=useState("");
  const [geocodeFailed,setGeocodeFailed]=useState(false);
  const routeLoadedFor = useRef(null);

  const loadLocations=async()=>{
    if(!tripRowId) return;
    const {data,error}=await supabaseClient
      .from("trip_locations").select("lat, lng, recorded_at")
      .eq("trip_id",tripRowId).order("recorded_at",{ascending:true});
    if(!error&&data) setPoints(data);
    setLoading(false);
  };

  useEffect(()=>{
    loadLocations();
    const interval=setInterval(loadLocations,15000);
    return ()=>clearInterval(interval);
  },[tripRowId]);

  // Work out the planned route once we have both a start and destination —
  // defaults to the permit's on-file start place (the land/store location).
  const loadRoute=async(startOverride)=>{
    // Prefer the driver's actual first recorded GPS position as the route
    // start — it's more accurate than geocoding a place name, and matches
    // where the trip genuinely began.
    const firstLivePoint = points.length>0 ? {lat:points[0].lat, lng:points[0].lng} : null;
    if(!destination) return;
    const routeKey = (startOverride||firstLivePoint?"gps":startPlace)+"|"+destination;
    if(routeLoadedFor.current === routeKey) return;
    routeLoadedFor.current = routeKey;
    setGeocodeFailed(false);

    let sCoord = null;
    if(startOverride){
      sCoord = await geocodeAddress(startOverride);
    } else if(firstLivePoint){
      sCoord = firstLivePoint;
    } else if(startPlace){
      sCoord = await geocodeAddress(startPlace);
    }
    const dCoord = await geocodeAddress(destination);

    if(!sCoord || !dCoord){
      setGeocodeFailed(true);
      return;
    }
    setStartCoord(sCoord); setDestCoord(dCoord);
    const r = await getRoute(sCoord, dCoord);
    if(r) setRoute(r);
  };

  useEffect(()=>{ loadRoute(); },[startPlace,destination,points.length>0]);

  const useMyLocation=()=>{
    if(!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async(pos)=>{
      const coord={lat:pos.coords.latitude,lng:pos.coords.longitude};
      setStartCoord(coord);
      routeLoadedFor.current = null;
      if(destCoord){
        const r = await getRoute(coord, destCoord);
        if(r) setRoute(r);
      }
      setGeocodeFailed(false);
    });
  };

  if(loading){
    return(
      <div style={{background:"#EFF1EA",borderRadius:14,padding:"40px 16px",textAlign:"center"}}>
        <div style={{fontSize:12,color:TS}}>Loading map…</div>
      </div>
    );
  }

  const hasLive = points.length > 0;
  const latest = hasLive ? points[points.length-1] : null;
  const trail = points.map(p=>[p.lat,p.lng]);
  const center = latest ? [latest.lat,latest.lng] : (startCoord ? [startCoord.lat,startCoord.lng] : [7.8731,80.7718]);
  const boundsPoints = [
    ...(startCoord?[[startCoord.lat,startCoord.lng]]:[]),
    ...(destCoord?[[destCoord.lat,destCoord.lng]]:[]),
    ...(latest?[[latest.lat,latest.lng]]:[]),
  ];

  const mapBlock=(
    <MapContainer center={center} zoom={13}
      style={{height:fullscreen?"100%":480,width:"100%"}}
      scrollWheelZoom={true} touchZoom={true} doubleClickZoom={true}>
      <TileLayer attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
      {boundsPoints.length>1&&<FitBounds points={boundsPoints}/>}
      {route&&route.path&&(
        <Polyline positions={route.path} pathOptions={{color:"#1A73E8",weight:6,opacity:0.9}}/>
      )}
      {trail.length>1&&(
        <Polyline positions={trail} pathOptions={{color:"#1E8A4C",weight:4,opacity:0.9}}/>
      )}
      {startCoord&&(
        <Marker position={[startCoord.lat,startCoord.lng]} icon={flagIcon}>
          <Popup>Starting point: {startPlace}</Popup>
        </Marker>
      )}
      {destCoord&&(
        <Marker position={[destCoord.lat,destCoord.lng]} icon={flagIcon}>
          <Popup>Destination: {destination}</Popup>
        </Marker>
      )}
      {latest&&(
        <Marker position={[latest.lat,latest.lng]} icon={truckIcon}>
          <Popup>{vehicleNo||"Vehicle"}{driverName?` · ${driverName}`:""} — current location</Popup>
        </Marker>
      )}
    </MapContainer>
  );

  const content = fullscreen ? (
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"#000"}}>
      <button onClick={()=>setFullscreen(false)} style={{position:"absolute",top:14,right:14,zIndex:1001,
        padding:"10px 16px",borderRadius:10,border:"none",background:"#fff",color:M,
        fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 2px 10px rgba(0,0,0,0.3)"}}>
        ✕ Close
      </button>
      {mapBlock}
    </div>
  ) : (
    <div style={{borderRadius:14,overflow:"hidden",border:"1px solid #E5E0D5",position:"relative"}}>
      {mapBlock}
      <button onClick={()=>setFullscreen(true)} style={{position:"absolute",top:10,right:10,zIndex:500,
        padding:"7px 12px",borderRadius:8,border:"none",background:"rgba(255,255,255,0.95)",
        color:M,fontSize:11,fontWeight:700,cursor:"pointer",boxShadow:"0 2px 6px rgba(0,0,0,0.2)"}}>
        ⛶ Full Screen
      </button>
    </div>
  );

  return(
    <div>
      {content}
      {!fullscreen&&(
        <>
          {route&&(
            <div style={{display:"flex",justifyContent:"center",gap:14,fontSize:11,color:TS,marginTop:6,fontWeight:600}}>
              <span>🛣 {route.distanceKm} km route</span>
              <span>⏱ ~{route.durationMin} min drive</span>
            </div>
          )}
          {(route||trail.length>1)&&(
            <div style={{display:"flex",justifyContent:"center",gap:16,fontSize:10.5,color:GR,marginTop:6}}>
              {route&&(
                <span style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{width:14,height:3,background:"#1A73E8",display:"inline-block",borderRadius:2}}/>
                  Planned route
                </span>
              )}
              {trail.length>1&&(
                <span style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{width:14,height:3,background:"#1E8A4C",display:"inline-block",borderRadius:2}}/>
                  Actual path driven
                </span>
              )}
            </div>
          )}
          {hasLive&&(
            <div style={{fontSize:11,color:GR,marginTop:4,textAlign:"center"}}>
              📍 Current location updates automatically · {points.length} point{points.length!==1?"s":""} recorded
            </div>
          )}
          {!hasLive&&(
            <div style={{fontSize:11,color:GR,marginTop:4,textAlign:"center"}}>
              Waiting for the driver's live location…
            </div>
          )}
          {geocodeFailed&&interactive&&(
            <div style={{background:"#FDF3D7",borderRadius:10,padding:"10px 12px",marginTop:10}}>
              <div style={{fontSize:11.5,color:"#9A7B1F",fontWeight:600,marginBottom:8}}>
                Couldn't find "{startPlace}" on the map automatically. You can type a more specific starting location, or use your current GPS position instead.
              </div>
              <input value={manualStart} onChange={e=>setManualStart(e.target.value)}
                placeholder="e.g. specific road, town, or landmark"
                style={{...baseInput,fontSize:12,padding:"8px 10px",marginBottom:8}}/>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{routeLoadedFor.current=null;loadRoute(manualStart);}}
                  style={{flex:1,padding:"8px",borderRadius:8,border:"none",background:M,color:"#fff",
                    fontSize:11,fontWeight:700,cursor:"pointer"}}>
                  Use this location
                </button>
                <button onClick={useMyLocation}
                  style={{flex:1,padding:"8px",borderRadius:8,border:`1.5px solid ${M}`,background:"#fff",color:M,
                    fontSize:11,fontWeight:700,cursor:"pointer"}}>
                  📍 Use my current GPS
                </button>
              </div>
            </div>
          )}
          {geocodeFailed&&!interactive&&(
            <div style={{background:"#FDF3D7",borderRadius:10,padding:"10px 12px",marginTop:10,
              fontSize:11.5,color:"#9A7B1F",fontWeight:600,textAlign:"center"}}>
              Planned route unavailable for this trip's starting location.
            </div>
          )}
        </>
      )}
    </div>
  );
}
