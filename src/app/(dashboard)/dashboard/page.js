import React from "react";

// Auth0
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

// Components
import { Grid2 as Grid } from "@mui/material";

const Dashboard = async () => {
  return (
    <Grid container spacing={".5rem"} sx={{ width: "100%" }}>
      <h1>Dashboard</h1>
    </Grid>
  );
};

export default withPageAuthRequired(Dashboard);
