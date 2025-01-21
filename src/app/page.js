"use client";

import React, { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Utils
import { useHydration } from "@/utils/hooks/useHydration";

// Components
import { Grid2 as Grid, Typography } from "@mui/material";
import Speedometer from "@/components/Speedometerv2";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false, // This ensures the component is only rendered on the client side
});

const randomSpeed = () => {
  return Math.floor(Math.random() * 300);
};

const maxSpeedLimit = 300;

const Home = () => {
  const hydrated = useHydration();

  const [position, setPosition] = useState(null);

  const [speed, setSpeed] = useState(0);
  const [maxSpeedReached, setMaxSpeedReached] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [totalSpeed, setTotalSpeed] = useState(0);
  const [speedCount, setSpeedCount] = useState(0);
  const [totalDistance, setTotalDistance] = useState("0.000");
  const [lastPosition, setLastPosition] = useState(null);
  const [lat, setLat] = useState(0);
  const [lon, setLon] = useState(0);
  const [distanceCountdown, setDistanceCountdown] = useState(1000);

  const getDistanceFromLatLon = (pos1, pos2) => {
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
      setSpeed(randomSpeed());
      if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(success, error, {
          enableHighAccuracy: true,
        });
      } else {
        alert("Geolocation not supported in your browser.");
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // useEffect(() => {
  //   if (position === null) return;
  //   const instantSpeed = Number(position.coords.speed * 3.6).toFixed(2);

  //   setSpeed(instantSpeed);

  //   if (instantSpeed > maxSpeedReached) {
  //     setMaxSpeedReached(instantSpeed);
  //   }

  //   if (position.coords.speed !== null) {
  //     const tmpTotalSpeed = (Number(totalSpeed) + Number(instantSpeed)).toFixed(
  //       2
  //     );
  //     const tmpSpeedCount = Number(speedCount) + 1;
  //     setTotalSpeed(tmpTotalSpeed);
  //     setSpeedCount((prevCount) => Number(prevCount + 1));
  //     setAvgSpeed((Number(tmpTotalSpeed) / Number(tmpSpeedCount)).toFixed(2));
  //   }

  //   if (lastPosition) {
  //     const distance = getDistanceFromLatLon(lastPosition, position.coords);
  //     setTotalDistance((prevDistance) =>
  //       ((Number(prevDistance) + Number(distance)) / 1000).toFixed(3)
  //     );
  //     setDistanceCountdown(
  //       (prevCountdown) => Number(prevCountdown) - Number(distance)
  //     );
  //   }
  //   setLastPosition(position.coords);
  //   setLat(position.coords.latitude);
  //   setLon(position.coords.longitude);
  // }, [position, speed]);

  // To test with random speed
  useEffect(() => {
    const instantSpeed = speed;
    setSpeed(instantSpeed);

    if (instantSpeed > maxSpeedReached) {
      setMaxSpeedReached(instantSpeed);
    }
    const tmpTotalSpeed = (Number(totalSpeed) + Number(instantSpeed)).toFixed(
      2
    );
    const tmpSpeedCount = Number(speedCount) + 1;
    setTotalSpeed(tmpTotalSpeed);
    setSpeedCount((prevCount) => Number(prevCount + 1));
    setAvgSpeed((Number(tmpTotalSpeed) / Number(tmpSpeedCount)).toFixed(2));
  }, [position, speed]);

  const resetAvgSpeed = () => {
    setTotalSpeed(0);
    setSpeedCount(0);
    setAvgSpeed(0);
    setDistanceCountdown(1000);
  };

  const resetTotalDistance = () => {
    setTotalDistance("0.000");
    resetAvgSpeed();
  };

  return (
    <Suspense key={hydrated}>
      <Grid
        container
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        <Grid
          size={12}
          sx={{
            display: "flex",
            height: "300px",
            cursor: "pointer",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={resetAvgSpeed}
        >
          <h2>Avg Speed:</h2>
          <Typography
            sx={{
              fontSize: "7rem",
              fontWeight: "bold",
              color: "#007bff",
              textAlign: "center",
            }}
          >
            {avgSpeed}
          </Typography>
        </Grid>
        <Grid size={12}>
          <Speedometer
            speed={speed}
            maxSpeedLimit={maxSpeedLimit}
            maxSpeedReached={maxSpeedReached}
          />
        </Grid>
        <Grid size={12} sx={{ display: "flex", marginTop: "0.25rem" }}>
          <Grid
            size={6}
            sx={{
              display: "flex",
              flexDirection: "column",
              textAlign: "left",
              borderRight: "1px solid #fff",
              paddingRight: "1rem",
            }}
          >
            <Grid
              size={12}
              sx={{
                cursor: "pointer",
              }}
            >
              <h2>Current speed:</h2>
              <Typography
                sx={{
                  fontSize: "2rem",
                  color: "#007bff",
                  textAlign: "right",
                }}
              >
                {speed} km/h
              </Typography>
            </Grid>
            <Grid
              size={12}
              sx={{
                cursor: "pointer",
              }}
              onClick={resetAvgSpeed}
            >
              <h2>Max speed:</h2>
              <Typography
                sx={{
                  fontSize: "2rem",
                  color: "#007bff",
                  textAlign: "right",
                }}
              >
                {maxSpeedReached}
                km/h
              </Typography>
            </Grid>
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
            <Grid
              size={12}
              sx={{
                cursor: "pointer",
              }}
              onClick={resetTotalDistance}
            >
              <h2>Total distance:</h2>
              <Typography
                sx={{
                  fontSize: "2rem",
                  color: "#007bff",
                }}
              >
                {totalDistance} km
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
    </Suspense>
  );
};

export default Home;
