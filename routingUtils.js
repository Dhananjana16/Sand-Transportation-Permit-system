// Free routing utilities — no API key, no billing.
// Nominatim (OpenStreetMap) converts a place name into coordinates.
// OSRM's public demo server computes a real road-following route
// between two coordinates.
//
// Honest limitation: both are free PUBLIC demo servers, rate-limited
// and best suited to a small pilot / student project — not guaranteed
// for heavy real-world traffic. A production deployment with many
// concurrent users would want a self-hosted or paid equivalent.

const geocodeCache = {};

export async function geocodeAddress(placeName){
  if(!placeName || !placeName.trim()) return null;
  if(geocodeCache[placeName]) return geocodeCache[placeName];
  try{
    const query = encodeURIComponent(placeName + ", Sri Lanka");
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
    const data = await res.json();
    if(data && data.length > 0){
      const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      geocodeCache[placeName] = result;
      return result;
    }
  }catch(e){
    console.warn("Geocoding failed for:", placeName, e);
  }
  return null;
}

export async function getRoute(startCoord, endCoord){
  if(!startCoord || !endCoord) return null;
  try{
    const url = `https://router.project-osrm.org/route/v1/driving/${startCoord.lng},${startCoord.lat};${endCoord.lng},${endCoord.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if(data && data.routes && data.routes.length > 0){
      // GeoJSON coordinates are [lng, lat] — Leaflet wants [lat, lng]
      const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
      return {
        path: coords,
        distanceKm: (data.routes[0].distance / 1000).toFixed(1),
        durationMin: Math.round(data.routes[0].duration / 60),
      };
    }
  }catch(e){
    console.warn("Routing failed:", e);
  }
  return null;
}
