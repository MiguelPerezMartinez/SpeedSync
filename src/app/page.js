"use client";

import React, { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Geolocation } from "@capacitor/geolocation";

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

const randomLocation = () => {
  return {
    latitude: Math.random() * 180 - 90,
    longitude: Math.random() * 360 - 180,
  };
};

async function requestLocationPermissions() {
  const status = await Geolocation.requestPermissions();
  console.log("Permission status:", status);
}

async function watchUserSpeed() {
  const watchId = await Geolocation.watchPosition({}, (position, err) => {
    if (err) {
      console.error("Error getting position:", err);
      return;
    }

    const { speed, latitude, longitude, altitude } = position.coords;

    console.log(`Speed: ${speed ? speed + " m/s" : "Not available"}`);
    console.log(`Latitude: ${latitude}`);
    console.log(`Longitude: ${longitude}`);
    console.log(`Altitude: ${altitude}`);

    // Convert speed to km/h if available
    if (speed !== null) {
      console.log(`Speed: ${(speed * 3.6).toFixed(2)} km/h`);
    }
  });

  return watchId; // Save this ID if you need to clear the watch later
}

const maxSpeedLimit = 300;

const Home = () => {
  const hydrated = useHydration();

  const [position, setPosition] = useState(null);

  const [speed, setSpeed] = useState(0);
  const [maxSpeedReached, setMaxSpeedReached] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [totalSpeed, setTotalSpeed] = useState(0);
  const [speedCount, setSpeedCount] = useState(0);
  const [totalDistance, setTotalDistance] = useState((0).toFixed(3));
  const [lastPosition, setLastPosition] = useState(null);
  const [lat, setLat] = useState(0);
  const [lon, setLon] = useState(0);
  const [distanceCountdown, setDistanceCountdown] = useState(1000);

  const getDistanceFromLatLon = (pos1, pos2) => {
    // Get the distance between two points in meters using the Haversine formula
    const R = 6371000; // Radius of the earth in m
    const dLat = (pos2.latitude - pos1.latitude) * (Math.PI / 180);
    const dLon = (pos2.longitude - pos1.longitude) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pos1.latitude * (Math.PI / 180)) *
        Math.cos(pos2.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const success = (pos) => {
    console.log(pos);
    setPosition(pos);
  };

  const error = (err) => {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  };

  useEffect(() => {
    requestLocationPermissions();
    const interval = setInterval(() => {
      // setSpeed(randomSpeed());
      // setPosition(randomLocation());
      Geolocation.watchPosition({}, (position, err) => {
        if (err) {
          error(err);
          return;
        }
        success(position);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (position === null) return;
    const instantSpeed = Number(position.coords.speed * 3.6).toFixed(2);

    setSpeed(instantSpeed);

    if (instantSpeed > maxSpeedReached) {
      setMaxSpeedReached(instantSpeed);
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
  }, [position, speed]);

  // To test with random speed and location
  // useEffect(() => {
  //   const instantSpeed = speed;
  //   setSpeed(instantSpeed);

  //   if (instantSpeed > maxSpeedReached) {
  //     setMaxSpeedReached(instantSpeed);
  //   }
  //   const tmpTotalSpeed = (Number(totalSpeed) + Number(instantSpeed)).toFixed(
  //     2
  //   );
  //   const tmpSpeedCount = Number(speedCount) + 1;
  //   setTotalSpeed(tmpTotalSpeed);
  //   setSpeedCount((prevCount) => Number(prevCount + 1));
  //   setAvgSpeed((Number(tmpTotalSpeed) / Number(tmpSpeedCount)).toFixed(2));

  //   if (lastPosition) {
  //     const distance = getDistanceFromLatLon(lastPosition, {
  //       latitude: lat,
  //       longitude: lon,
  //     });
  //     setTotalDistance((prevDistance) =>
  //       ((Number(prevDistance) + Number(distance)) / 1000).toFixed(3)
  //     );
  //     setDistanceCountdown(
  //       (prevCountdown) => Number(prevCountdown) - Number(distance)
  //     );
  //   }
  //   setLastPosition(randomLocation());
  //   setLat(lat);
  //   setLon(lon);
  // }, [position, speed]);

  const resetAvgSpeed = () => {
    setSpeedCount(Number(0));
    setTotalSpeed(Number(0));
    setAvgSpeed(Number(0));
    setDistanceCountdown(1000);
  };

  const resetTotalDistance = () => {
    setTotalDistance((0).toFixed(3));
    resetAvgSpeed();
    setMaxSpeedReached(0);
  };

  const convertToKm = (meters) => {
    // Convert meters to kilometers and round to 3 decimal places
    return (meters / 1000).toFixed(3);
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
            <Grid size={12}>
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
                {convertToKm(totalDistance)} km
              </Typography>
            </Grid>
            <Grid
              size={12}
              sx={{
                cursor: "pointer",
              }}
              onClick={resetAvgSpeed}
            >
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
