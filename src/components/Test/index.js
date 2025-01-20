import React, { useState, useEffect } from "react";

const Speedometer = ({
  speed,
  maxSpeed = 300,
  radius = 100,
  strokeWidth = 10,
}) => {
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;

  const [animatedSpeed, setAnimatedSpeed] = useState(0);
  const [maxSpeedReached, setMaxSpeedReached] = useState(0);

  useEffect(() => {
    let start = animatedSpeed;
    let end = speed;
    let duration = 800; // Smooth easing animation duration
    let startTime = null;

    const easeOutCubic = (t) => --t * t * t + 1; // Smooth easing function

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      let progress = (timestamp - startTime) / duration;
      progress = Math.min(progress, 1);
      let easedProgress = easeOutCubic(progress);
      let currentSpeed = start + (end - start) * easedProgress;

      setAnimatedSpeed(currentSpeed);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    // Track max speed reached
    setMaxSpeedReached((prevMax) => Math.max(prevMax, speed));
  }, [speed]);

  const strokeDashoffset =
    circumference - (animatedSpeed / 400) * circumference;

  // Color transition: Green (0) → Red (300)
  const getColor = (currentSpeed) => {
    const ratio = currentSpeed / maxSpeed;
    const r = Math.min(255, Math.floor(ratio * 255));
    const g = Math.min(255, Math.floor((1 - ratio) * 255));
    return `rgb(${r}, ${g}, 0)`;
  };

  // Convert speed to needle angle
  const speedToAngle = (value) => (value / maxSpeed) * 270 - 230;

  return (
    <svg
      width={radius * 2}
      height={radius * 2}
      viewBox={`0 0 ${radius * 2} ${radius * 2}`}
    >
      {/* Background Circle */}
      <circle
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        stroke="#666"
        strokeWidth={strokeWidth}
        fill="transparent"
        opacity="0.3"
      />

      {/* Progress Arc */}
      <circle
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        stroke={getColor(animatedSpeed)}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(135 ${radius} ${radius})`}
        strokeOpacity="0.9"
      />

      {/* Speed Tick Marks */}
      {[...Array(11).keys()].map((i) => {
        const tickSpeed = (i / 10) * maxSpeed;
        const angle = speedToAngle(tickSpeed);
        const x1 =
          radius + Math.cos((angle * Math.PI) / 180) * (normalizedRadius - 10);
        const y1 =
          radius + Math.sin((angle * Math.PI) / 180) * (normalizedRadius - 10);
        const x2 =
          radius + Math.cos((angle * Math.PI) / 180) * (normalizedRadius - 5);
        const y2 =
          radius + Math.sin((angle * Math.PI) / 180) * (normalizedRadius - 5);
        const xText =
          radius + Math.cos((angle * Math.PI) / 180) * (normalizedRadius - 20);
        const yText =
          radius + Math.sin((angle * Math.PI) / 180) * (normalizedRadius - 20);

        return (
          <g key={i}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={xText}
              y={yText}
              fill="white"
              fontSize="12px"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {tickSpeed}
            </text>
          </g>
        );
      })}

      {/* Needle Pointer (Current Speed) */}
      <line
        x1={radius}
        y1={radius}
        x2={
          radius +
          Math.cos((speedToAngle(animatedSpeed) * Math.PI) / 180) *
            (normalizedRadius - 15)
        }
        y2={
          radius +
          Math.sin((speedToAngle(animatedSpeed) * Math.PI) / 180) *
            (normalizedRadius - 15)
        }
        stroke="red"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Max Speed Reached Needle */}
      <line
        x1={radius}
        y1={radius}
        x2={
          radius +
          Math.cos((speedToAngle(maxSpeedReached) * Math.PI) / 180) *
            (normalizedRadius - 15)
        }
        y2={
          radius +
          Math.sin((speedToAngle(maxSpeedReached) * Math.PI) / 180) *
            (normalizedRadius - 15)
        }
        stroke="yellow"
        strokeWidth="2"
        strokeDasharray="4 4"
      />

      {/* Center Circle */}
      <circle cx={radius} cy={radius} r="5" fill="white" />

      {/* Speed Display */}

      {/* Speed Display */}
      <text
        x="50%"
        y="25%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="18px"
        fontWeight="bold"
        fill="white"
      >
        Speed
      </text>
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="32px"
        fontWeight="bold"
        fill="white"
      >
        {animatedSpeed.toFixed(0)}
      </text>
      <text
        x="50%"
        y="75%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="18px"
        fontWeight="bold"
        fill="white"
      >
        km/h
      </text>
    </svg>
  );
};

export default Speedometer;
