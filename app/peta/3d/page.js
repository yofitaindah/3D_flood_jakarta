import { Box } from "@mui/material";
import React from "react";
import Header from "./Header";
import MapComponent from "./MapComponent";

const Page = () => {
  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        position: "relative", // Menggunakan relative untuk menempatkan header di atas
        display: "flex",
        flexDirection: "column", // Menyusun header dan map secara vertikal
        padding: "0px",
        margin: "0px",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <Header />
      <MapComponent />
    </Box>
  );
};

export default Page;
