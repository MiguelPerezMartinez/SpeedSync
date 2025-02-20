"use client"; // Ensure the component only runs on the client

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import CustomMarker from "@/assets/mapMarker.webp";

// Dynamically import React-Leaflet components (Only in Client)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;

// Define a custom icon
const customIcon = new L.Icon({
  iconUrl: CustomMarker.src, // Replace with the path to your marker icon
  iconSize: [32, 32], // Adjust size as needed
  iconAnchor: [16, 32], // Adjust anchor point (center-bottom)
  popupAnchor: [0, -32], // Adjust popup position
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"), // Optional shadow
});

// Component
const Map = () => {
  const [position, setPosition] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Ensure component is mounted before using `window`

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setError("The request to get user location timed out.");
            break;
          default:
            setError("An unknown error occurred.");
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (!mounted) return <p>Loading map...</p>;

  return (
    <div>
      <h2>Live Location Tracker</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!error && position.latitude && position.longitude ? (
        <>
          <MapContainer
            center={[position.latitude, position.longitude]}
            zoom={25}
            style={{ height: "150px", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker
              position={[position.latitude, position.longitude]}
              icon={customIcon} // Apply the custom marker icon
            >
              <Popup>Your current location</Popup>
            </Marker>
          </MapContainer>
        </>
      ) : (
        <p>Fetching location...</p>
      )}
    </div>
  );
};

export default Map;
