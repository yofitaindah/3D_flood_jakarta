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
      }}
    >
      <MapComponent />
    </div>
  );
};

export default page;

// kalo styling layout disini untuk map
