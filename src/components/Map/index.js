"use client"; // If using Next.js 13+ with App Router

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapComponent = ({ lat, lon }) => {
  return (
    <MapContainer
      center={[lat, lon]}
      zoom={20}
      style={{ height: "150px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[lat, lon]}>
        <Popup>Your Location</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;
