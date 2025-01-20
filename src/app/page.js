"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Components
import { Grid2 as Grid, Typography } from "@mui/material";
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false, // This ensures the component is only rendered on the client side
});

const velocimeterSpeeds = [
  0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300,
];

const Home = () => {
  const maxSpeedLimit = 300;

  const [position, setPosition] = useState(null);

  const [speed, setSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [totalSpeed, setTotalSpeed] = useState(0);
  const [speedCount, setSpeedCount] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [lastPosition, setLastPosition] = useState(null);
  const [lat, setLat] = useState(0);
  const [lon, setLon] = useState(0);
  const [distanceCountdown, setDistanceCountdown] = useState(1000);
  const [speedPercent, setSpeedPercent] = useState(0);
  const [maxSpeedPercent, setMaxSpeedPercent] = useState(0);

  const getDistanceFromLatLon = (pos1, pos2) => {
    console.log(pos1, pos2);
    const R = 6371000;
    const lat1 = (pos1.latitude * Math.PI) / 180;
    const lat2 = (pos2.latitude * Math.PI) / 180;
    const deltaLat = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
    const deltaLon = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const success = (pos) => {
    setPosition(pos);
  };

  const error = (err) => {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(success, error, {
          enableHighAccuracy: true,
        });
      } else {
        alert("Geolocation not supported in your browser.");
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (position === null) return;
    const instantSpeed = Number(position.coords.speed * 3.6).toFixed(2);
    setSpeed(instantSpeed);

    if (instantSpeed > maxSpeed) {
      setMaxSpeed(instantSpeed);
    }

    if (position.coords.speed !== null) {
      const tmpTotalSpeed = (Number(totalSpeed) + Number(instantSpeed)).toFixed(
        2
      );
      const tmpSpeedCount = Number(speedCount) + 1;
      setTotalSpeed(tmpTotalSpeed);
      setSpeedCount((prevCount) => Number(prevCount + 1));
      setAvgSpeed((Number(tmpTotalSpeed) / Number(tmpSpeedCount)).toFixed(2));
    }

    if (lastPosition) {
      const distance = getDistanceFromLatLon(lastPosition, position.coords);
      setTotalDistance(
        (prevDistance) => Number(prevDistance) + Number(distance)
      );
      setDistanceCountdown(
        (prevCountdown) => Number(prevCountdown) - Number(distance)
      );
    }
    setLastPosition(position.coords);
    setLat(position.coords.latitude);
    setLon(position.coords.longitude);
  }, [position]);

  useEffect(() => {
    setSpeedPercent((speed / maxSpeedLimit) * 100);
    setMaxSpeedPercent((maxSpeed / maxSpeedLimit) * 100);
  }, [speed, maxSpeed]);

  const resetAvgSpeed = () => {
    setTotalSpeed(0);
    setSpeedCount(0);
    setAvgSpeed(0);
    setTotalDistance(0);
  };

  return (
    <Grid container sx={{ display: "flex", flexDirection: "column" }}>
      <Grid
        size={12}
        sx={{ display: "flex", height: "400px" }}
        onClick={resetAvgSpeed}
      >
        <Grid
          size={10}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2>Avg Speed:</h2>
          <Typography
            sx={{
              fontSize: "7rem",
              fontWeight: "bold",
              color: "#007bff",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            {avgSpeed} km/h
          </Typography>
        </Grid>
        <Grid
          size={2}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Grid
            size={1}
            sx={{
              position: "relative",
              overflow: "hidden",
              border: "1px solid #fff",
              width: "20px",
              height: "90%",
            }}
          >
            <div
              style={{
                height: `${speedPercent}%`,
                position: "absolute",
                bottom: 0,
                width: "100%",
                background: "#00ff00",
                transition: "height 0.5s ease-in-out",
              }}
            ></div>
            <div
              style={{
                top: `${100 - maxSpeedPercent}%`,
                position: "absolute",
                left: 0,
                width: "100%",
                height: "2px",
                background: "red",
                transition: "top 0.5s ease-in-out",
              }}
            ></div>
          </Grid>
          <Grid
            size={1}
            sx={{
              height: "90%",
            }}
          >
            <Grid
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "space-between",
              }}
            >
              {velocimeterSpeeds
                .map((speed, index) => (
                  <div
                    key={index}
                    style={{
                      display: "block",
                      height: `100 / ${velocimeterSpeeds.length}%`,
                    }}
                  >
                    -{speed}
                  </div>
                ))
                .reverse()}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid size={12} sx={{ display: "flex" }}>
        <Grid size={6} sx={{ display: "flex", flexDirection: "column" }}>
          <h2>Speed:</h2>
          <Typography
            sx={{
              fontSize: "2rem",
              color: "#007bff",
              marginBottom: "1rem",
            }}
          >
            {speed} km/h
          </Typography>
          <Map lat={lat} lon={lon} />
        </Grid>
        <Grid
          size={6}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            textAlign: "right",
          }}
        >
          <Grid size={12} sx={{}}>
            <h2>Total distance:</h2>
            <Typography
              sx={{
                fontSize: "2rem",
                color: "#007bff",
              }}
            >
              {totalDistance.toFixed(2)} m
            </Typography>
          </Grid>
          <Grid size={12}>
            <h2 style={{ marginBottom: -15 }}>Countdown:</h2>
            <h4> (from: 1000m)</h4>
            <Typography
              sx={{
                fontSize: "2rem",
                color: "#007bff",
              }}
            >
              {distanceCountdown.toFixed(2)} m
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Home;
