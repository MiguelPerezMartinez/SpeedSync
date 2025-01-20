// components/MapComponent.js
"use client";

import { Grid2 as Grid } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

const MapComponent = ({ lat, lon }) => {
  return (
    <Grid size={12} sx={{ display: "flex", flexDirection: "column" }}>
      <MapContainer
        center={[lat, lon]}
        zoom={13}
        style={{ width: "100%", aspectRatio: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lon]}>
          <Popup>
            A marker at [{lat}, {lon}].
          </Popup>
        </Marker>
      </MapContainer>
      <h2 style={{ marginBottom: -15 }}>Curent position:</h2>
      <h4 style={{ marginBottom: -15 }}>Latitude: {lat}</h4>
      <h4> Longitude: {lon}</h4>
    </Grid>
  );
};

export default MapComponent;
