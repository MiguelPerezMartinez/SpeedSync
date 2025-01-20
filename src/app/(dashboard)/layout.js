"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { io } from "socket.io-client";

// Auth0
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";

// Utils
import { useHydration } from "@/utils/hooks/useHydration";

// Components
import { Grid2 as Grid } from "@mui/material";

// Styles
import "./layout.styles.css";

// Redux
import { getUser, setAccessToken } from "@/redux/userSlice";
import Link from "next/link";

const MainLayout = (props) => {
  const { children } = props;

  const dispatch = useDispatch();
  const hydrated = useHydration();
  const pathname = usePathname().split("/").pop().toUpperCase();

  const { info: userInfoState, accessToken } = useSelector(
    (state) => state.user
  );

  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );

  const getAccessTokenFromAPI = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      dispatch(setAccessToken(data.accessToken));
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    getAccessTokenFromAPI();
    console.log("Connecting to socket server");
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
    socket.emit("connectSocket", { userId: 1 });
    socket.on("example", async ({ test }) => {
      console.log("Signal received: ", test);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Fetch user data
    // TODO: Replace with actual user id
    if (accessToken) {
      dispatch(getUser({ user_id: 1, accessToken }));
    }
  }, [accessToken]);

  return (
    <Suspense key={hydrated ? "local" : "utc"}>
      <Grid container>
        <Grid size={12}>
          <Link href="/api/auth/logout">
            <button type="button">LOGOUT</button>
          </Link>
        </Grid>
        <Grid size={12}>{children}</Grid>
      </Grid>
    </Suspense>
  );
};

export default withPageAuthRequired(MainLayout);
