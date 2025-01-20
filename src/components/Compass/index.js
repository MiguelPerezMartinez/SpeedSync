"use client"; // Required for Next.js 13+ since this is a client component

import { useState, useEffect } from "react";

const Compass = () => {
  const [direction, setDirection] = useState("Unknown");
  const [heading, setHeading] = useState(0); // 0-360 degrees

  useEffect(() => {
    const handleOrientation = (event) => {
      const alpha = event.alpha; // Compass direction (0° to 360°)

      if (alpha !== null) {
        setHeading(alpha);

        if (alpha >= 315 || alpha < 45) {
          setDirection("North");
        } else if (alpha >= 45 && alpha < 135) {
          setDirection("East");
        } else if (alpha >= 135 && alpha < 225) {
          setDirection("South");
        } else {
          setDirection("West");
        }
      }
    };

    // Request permission for iOS devices
    const requestPermission = async () => {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
          }
        } catch (error) {
          console.error("Permission denied:", error);
        }
      } else {
        window.addEventListener("deviceorientation", handleOrientation);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  return (
    <div style={styles.container}>
      <h2>Compass</h2>
      <div style={styles.compassContainer}>
        <div
          style={{
            ...styles.arrow,
            transform: `rotate(${heading}deg)`,
          }}
        />
      </div>
      <p>
        Direction: <strong>{direction}</strong>
      </p>
      <p>
        Heading: <strong>{Math.round(heading)}°</strong>
      </p>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    marginTop: "20px",
  },
  compassContainer: {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    border: "4px solid black",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "20px auto",
    position: "relative",
  },
  arrow: {
    width: "0",
    height: "0",
    borderLeft: "10px solid transparent",
    borderRight: "10px solid transparent",
    borderBottom: "40px solid red",
    position: "absolute",
    top: "20px",
    transformOrigin: "bottom center",
  },
};

export default Compass;
