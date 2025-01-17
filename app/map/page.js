import React from "react";
import MapComponent from "./map";

const page = () => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        display: "flex",
        flexDirection: "column", // Menyusun komponen secara vertikal
      }}
    >
      {/* Header */}
      <header
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#4CAF50",
          color: "white",
          textAlign: "center",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        3D Flood Jakarta
      </header>

      {/* Map */}
      <div style={{ flexGrow: 1 }}>
        <MapComponent />
      </div>
    </div>
  );
};

export default page;
