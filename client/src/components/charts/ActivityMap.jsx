import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ErrorBoundary from "../ErrorBoundary";

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
  // Support both old (lat/lon) and new (gpsCoordinates.lat/lng) field shapes
  const validVisits = visits.filter(v => {
    const lat = v.gpsCoordinates?.lat ?? v.lat;
    const lng = v.gpsCoordinates?.lng ?? v.lon;
    return lat != null && lng != null;
  });

  const getCoords = (v) => ({
    lat: v.gpsCoordinates?.lat ?? v.lat,
    lng: v.gpsCoordinates?.lng ?? v.lon,
  });

  const center = validVisits.length > 0
    ? [getCoords(validVisits[0]).lat, getCoords(validVisits[0]).lng]
    : [20.5937, 78.9629]; // India center default

  return (
    <div className="h-[380px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50 relative z-0">
      <ErrorBoundary>
        <MapContainer center={center} zoom={validVisits.length > 0 ? 7 : 5} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {validVisits.map((visit) => {
            const { lat, lng } = getCoords(visit);
            return (
              <Marker key={visit._id} position={[lat, lng]}>
                <Popup>
                  <div className="p-1 min-w-[160px]">
                    <p className="font-bold text-slate-800 m-0 text-sm">
                      {visit.meta?.companyName || visit.studentInfo?.name || 'Visit'}
                    </p>
                    <p className="text-[11px] text-slate-500 m-0 mt-1 leading-tight">
                      {visit.gpsLocation || visit.exactLocation || 'Location recorded'}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-brand-blue">
                        {visit.submittedBy?.name || 'Surveyor'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(visit.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </ErrorBoundary>
      {validVisits.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 text-sm text-slate-500 font-medium shadow-sm border border-slate-200">
            No GPS coordinates recorded yet
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityMap;
