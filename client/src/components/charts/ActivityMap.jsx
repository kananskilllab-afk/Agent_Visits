import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Leaflet + React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const ActivityMap = ({ visits = [] }) => {
  // Extract coordinates from visits
  const validVisits = visits.filter(v => v.lat !== undefined && v.lon !== undefined && v.lat !== null && v.lon !== null);

  // Default to India center if no visits
  const center = validVisits.length > 0 
    ? [validVisits[0].lat, validVisits[0].lon]
    : [20.5937, 78.9629]; 

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50 relative z-0">
      <MapContainer center={center} zoom={5} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validVisits.map((visit) => (
          <Marker 
            key={visit._id} 
            position={[visit.lat, visit.lon]}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold text-slate-800 m-0 text-sm">
                   {visit.meta?.companyName || visit.studentInfo?.name || "Anonymous Visit"}
                </p>
                <p className="text-[11px] text-slate-500 m-0 leading-tight mt-1">
                   {visit.exactLocation || "Location logged"}
                </p>
                <div className="mt-2 flex items-center justify-between">
                   <span className="text-[9px] uppercase font-bold text-kanan-blue">By: {visit.submittedBy?.name || "Surveyor"}</span>
                   <span className="text-[9px] text-slate-400">{new Date(visit.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ActivityMap;
