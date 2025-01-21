import { Box } from "@mui/material";
import React from "react";
import MapComponent from "./MapComponent";

const page = () => {
  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        display: "flex",
        padding: "0px",
        margin: "0px",
      }}
    >
      <MapComponent />
    </Box>
  );
};

export default page;
