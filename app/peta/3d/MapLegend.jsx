import { Box, Typography } from "@mui/material";
import React from "react";

const MapLegend = ({
  showBuildings,
  showFloodAreaAll,
  showFloodGate,
  showStreet,
}) => {
  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: 2,
        borderRadius: 2,
        boxShadow: 3,
        zIndex: 1,
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Legend
      </Typography>
      {showFloodAreaAll && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              backgroundColor: "blue",
              opacity: 0.4,
              mr: 1,
            }}
          />
          <Typography variant="body2">Flood Area</Typography>
        </Box>
      )}
      {showBuildings && (
        <Box sx={{ display: "flex", flexDirection: "column", mb: 1 }}>
          <Typography variant="body2" fontWeight="bold">
            Buildings (Height)
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                backgroundColor: "saddlebrown",
                mr: 1,
              }}
            />
            <Typography variant="body2">0m</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                backgroundColor: "peru",
                mr: 1,
              }}
            />
            <Typography variant="body2">15m</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                backgroundColor: "burlywood",
                mr: 1,
              }}
            />
            <Typography variant="body2">35m</Typography>
          </Box>
        </Box>
      )}
      {showFloodGate && (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              backgroundColor: "blue",
              border: "1px solid white",
              borderRadius: "50%",
              mr: 1,
            }}
          />
          <Typography variant="body2">Flood Gates</Typography>
        </Box>
      )}
      {showStreet && (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 20,
              height: 2,
              backgroundColor: "#1E90FF",
              border: "1px solid white",
              mr: 1,
            }}
          />
          <Typography variant="body2">Jalan</Typography>
        </Box>
      )}
    </Box>
  );
};

export default MapLegend;
