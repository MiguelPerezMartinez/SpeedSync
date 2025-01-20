import { useState, useEffect, useRef } from "react";

const Compass = () => {
  const canvasRef = useRef(null);
  const [heading, setHeading] = useState(0);
  const [smoothedHeading, setSmoothedHeading] = useState(0);
  const [calibrationOffset, setCalibrationOffset] = useState(() => {
    return parseFloat(localStorage.getItem("calibrationOffset")) || 0;
  });
  const [trueNorthOffset, setTrueNorthOffset] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Linear interpolation for smooth transitions
  const lerp = (start, end, factor) => start + (end - start) * factor;

  // Get True North correction from GPS
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("User location:", latitude, longitude);

          // Placeholder for geomagnetic correction (API needed for exact calculation)
          // In real-world apps, use NOAA API or lookup tables
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
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === "granted") {
            setPermissionGranted(true);
            startOrientationListener();
          }
        } catch (error) {
          console.error("Permission denied:", error);
        }
      } else {
        // Android does not require permission
        setPermissionGranted(true);
        startOrientationListener();
      }
    };

    const startOrientationListener = () => {
      window.addEventListener("deviceorientation", (event) => {
        if (event.alpha !== null) {
          let newHeading =
            (Math.round(event.alpha) -
              calibrationOffset +
              trueNorthOffset +
              360) %
            360;
          setHeading(newHeading);
        }
      });
    };

    requestPermission();

    return () =>
      window.removeEventListener("deviceorientation", startOrientationListener);
  }, [calibrationOffset, trueNorthOffset]);

  // Apply smoothing with LERP
  useEffect(() => {
    const smoothUpdate = setInterval(() => {
      setSmoothedHeading((prev) => lerp(prev, heading, 0.1)); // Adjust factor for smoothness
    }, 50);

    return () => clearInterval(smoothUpdate);
  }, [heading]);

  // Save calibration offset in localStorage
  const calibrateCompass = () => {
    localStorage.setItem("calibrationOffset", heading);
    setCalibrationOffset(heading);
  };

  // Reset calibration
  const resetCalibration = () => {
    localStorage.removeItem("calibrationOffset");
    setCalibrationOffset(0);
  };

  // Draw circular compass dynamically
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    ctx.clearRect(0, 0, width, height);

    // Draw compass circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw directions (N, E, S, W)
    const directions = ["N", "E", "S", "W"];
    for (let i = 0; i < 4; i++) {
      const angle = (i * 90 - smoothedHeading) * (Math.PI / 180);
      const x = centerX + Math.cos(angle) * (radius - 20);
      const y = centerY + Math.sin(angle) * (radius - 20);
      ctx.fillStyle = "black";
      ctx.font = "18px Arial";
      ctx.fillText(directions[i], x - 10, y + 5);
    }

    // Draw needle (fixed at center, rotating with heading)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.sin(-smoothedHeading * (Math.PI / 180)) * radius,
      centerY - Math.cos(-smoothedHeading * (Math.PI / 180)) * radius
    );
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
  }, [smoothedHeading]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Compass Heading: {Math.round(smoothedHeading)}°</h2>
      {!permissionGranted && (
        <button onClick={() => window.location.reload()}>
          Grant Permission (For iOS)
        </button>
      )}
      <button
        onClick={calibrateCompass}
        style={{ margin: "10px", padding: "10px" }}
      >
        Calibrate Compass
      </button>
      <button
        onClick={resetCalibration}
        style={{ margin: "10px", padding: "10px" }}
      >
        Reset Calibration
      </button>
      <canvas
        ref={canvasRef}
        width={250}
        height={250}
        style={{ background: "#f0f0f0", borderRadius: "50%" }}
      />
    </div>
  );
};

export default Compass;
