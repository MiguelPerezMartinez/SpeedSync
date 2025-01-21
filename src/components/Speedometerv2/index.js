import { Grid2 as Grid } from "@mui/material";
import React, { useState, useEffect } from "react";

const SPEED_STEP = 30;

const Speedometer = ({ speed, maxSpeedLimit = 300, maxSpeedReached = 0 }) => {
  const [speedPercent, setSpeedPercent] = useState(0);
  const [maxSpeedPercent, setMaxSpeedPercent] = useState(0);

  useEffect(() => {
    setSpeedPercent((speed / maxSpeedLimit) * 100);
    setMaxSpeedPercent((maxSpeedReached / maxSpeedLimit) * 100);
  }, [speed, maxSpeedReached]);

  const getColor = () => {
    const ratio = speed / maxSpeedLimit;
    const r = Math.min(255, Math.floor(ratio * 255));
    const g = Math.min(255, Math.floor((1 - ratio) * 255));
    return `rgb(${r}, ${g}, 0)`;
  };

  return (
    <Grid
      size={12}
      sx={{
        display: "flex",
        position: "relative",
        borderBottom: "1px solid #fff",
        height: "10px",
      }}
    >
      <div
        style={{
          width: `${speedPercent}%`,
          position: "absolute",
          bottom: 0,
          height: "100%",
          background: `${getColor()}`,
          transition: "all 0.25s ease-in-out",
        }}
      ></div>
      <div
        style={{
          right: `${100 - maxSpeedPercent}%`,
          position: "absolute",
          height: "100%",
          width: "2px",
          background: "red",
          transition: "all 0.25s ease-in-out",
        }}
      ></div>
      <Grid
        sx={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        {Array.from({ length: maxSpeedLimit / SPEED_STEP + 1 }, (_, i) => {
          const markerPosition = ((i * SPEED_STEP) / maxSpeedLimit) * 100;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                height: "100%",
                width: "1px",
                background: "white",
                left: `${markerPosition}%`,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "-20px",
                  fontSize: "10px",
                  color: "white",
                  transform: "translateX(-50%)",
                }}
              >
                {i * SPEED_STEP}
              </span>
            </div>
          );
        })}
      </Grid>
    </Grid>
  );
};

export default Speedometer;
