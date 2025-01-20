"use client";
import { useState, useEffect, useRef } from "react";

const Compass = () => {
  const canvasRef = useRef(null);
  const [heading, setHeading] = useState(0);
  const [smoothedHeading, setSmoothedHeading] = useState(0);
  const [calibrationOffset, setCalibrationOffset] = useState(0);
  const [trueNorthOffset, setTrueNorthOffset] = useState(0);

  // Detect iOS device
  const isIOS = () => {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    );
  };

  // Function to apply linear interpolation (LERP) for smooth transitions
  const lerp = (start, end, factor) => start + (end - start) * factor;

  // Get True North correction from GPS
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("User location:", latitude, longitude);

          // Placeholder for geomagnetic correction (API needed for exact calculation)
          setTrueNorthOffset(0); // Assume no correction for now
        },
        (error) => console.error("GPS Error:", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Request device orientation permission and start tracking
  useEffect(() => {
    const requestPermission = async () => {
      if (
        isIOS() &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === "granted") {
            startOrientationListener();
          } else {
            console.error("Permission denied");
          }
        } catch (error) {
          console.error("Permission request failed:", error);
        }
      } else {
        // Android does not require permission
        startOrientationListener();
      }
    };

    const startOrientationListener = () => {
      const handleOrientation = (event) => {
        let alpha = event.alpha;

        // If using absolute orientation (better accuracy)
        if (event.absolute && event.alpha !== null) {
          alpha = event.alpha;
        }

        if (alpha !== null) {
          let newHeading =
            (Math.round(alpha) - calibrationOffset + trueNorthOffset + 360) %
            360;
          setHeading(newHeading);
        }
      };

      window.addEventListener("deviceorientationabsolute", handleOrientation);
      window.addEventListener("deviceorientation", handleOrientation);

      return () => {
        window.removeEventListener(
          "deviceorientationabsolute",
          handleOrientation
        );
        window.removeEventListener("deviceorientation", handleOrientation);
      };
    };

    requestPermission();
  }, [calibrationOffset, trueNorthOffset]);

  // Apply smoothing with LERP
  useEffect(() => {
    const smoothUpdate = setInterval(() => {
      setSmoothedHeading((prev) => lerp(prev, heading, 0.1));
    }, 50);

    return () => clearInterval(smoothUpdate);
  }, [heading]);

  // Draw circular compass dynamically
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 1;

    ctx.clearRect(0, 0, width, height);

    // Background gradient
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Draw directions (N, E, S, W) - FIXED (Do not rotate)
    const directions = ["N", "E", "S", "W"];
    for (let i = 0; i < 4; i++) {
      const angle = i * 90 * (Math.PI / 180); // FIXED: No smoothedHeading rotation
      const x = centerX + Math.cos(angle) * (radius - 15);
      const y = centerY + Math.sin(angle) * (radius - 15);
      ctx.fillStyle = "black";
      ctx.font = "bold 20px Arial";
      ctx.fillText(directions[i], x - 10, y + 5);
    }

    // Draw minor degree markers - FIXED (Do not rotate)
    for (let i = 0; i < 360; i += 15) {
      const angle = i * (Math.PI / 180); // FIXED: No smoothedHeading rotation
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius - 5);
      const y2 = centerY + Math.sin(angle) * (radius - 5);

      ctx.strokeStyle = "black";
      ctx.lineWidth = i % 90 === 0 ? 3 : 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw animated needle (THIS ROTATES)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-smoothedHeading * (Math.PI / 180)); // FIXED: Rotates only the needle

    ctx.beginPath();
    ctx.moveTo(0, -radius + 25);
    ctx.lineTo(-4, 5);
    ctx.lineTo(4, 5);
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();

    ctx.restore();

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
  }, [smoothedHeading]);

  return (
    <canvas
      ref={canvasRef}
      width={100}
      height={100}
      style={{
        background: "#e3e3e3",
        borderRadius: "50%",
        boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
      }}
    />
  );
};

export default Compass;
