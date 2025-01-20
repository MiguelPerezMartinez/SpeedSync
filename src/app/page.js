"use client";
import React from "react";

// Auth0
import { useUser } from "@auth0/nextjs-auth0/client";

// Components
import { Grid2 as Grid } from "@mui/material";
import Link from "next/link";
import Image from "next/image";

const Home = () => {
  const { user, error } = useUser();

  if (error) return <div>{error.message}</div>;

  return (
    <Grid
      container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Example APP</h1>
      {user && (
        <div>
          <Image src={user.picture} alt={user.name} width={100} height={100} />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      )}
      <Link href="api/auth/login">
        <button type="button">LOGIN</button>
      </Link>
    </Grid>
  );
};

export default Home;
