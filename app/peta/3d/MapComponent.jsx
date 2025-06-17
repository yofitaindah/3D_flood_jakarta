"use client";

import { Box, Typography, IconButton } from "@mui/material";
import { Map } from "maplibre-gl";
import React, { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import ZoomInIcon from "@mui/icons-material/Add";
import ZoomOutIcon from "@mui/icons-material/Remove";
import HomeIcon from "@mui/icons-material/Home";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import "maplibre-gl/dist/maplibre-gl.css";
import "react-toastify/dist/ReactToastify.css";

// Configuration
const CONFIG = {
  WFS_URL: "https://gis-dev.dcktrp.id/gispublik/publik/ows",
  TIME_API_URL:
    "https://jakartasatu.jakarta.go.id/api-jakartasatu/simulasi/time_banjir/",
  PINTUAIR_URL:
    "https://dcktrp.jakarta.go.id/apigis/data/studio/ee95d7aa422f4b1aa8a443ebba8083ab",
  INITIAL_VIEW: {
    center: [106.862, -6.2222],
    zoom: 15,
    pitch: 45,
    bearing: -17.6,
  },
  WFS_PARAMS: {
    service: "WFS",
    version: "1.0.0",
    request: "GetFeature",
    outputFormat: "application/json",
    srsName: "EPSG:4326",
    maxFeatures: "5000",
  },
  BASEMAPS: {
    google: {
      tiles: ["https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"],
      attribution: "© Google Maps",
    },
    osm: {
      tiles: ["https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  LAYERS: {
    genangan: {
      id: "genangan_all_layer",
      source: "genangan",
      type: "fill",
      paint: { "fill-color": "lightblue", "fill-opacity": 0.4 },
      beforeId: "bangunan-layer",
    },
    bangunan: {
      id: "bangunan-layer",
      source: "bangunan",
      type: "fill",
      paint: { "fill-color": "blue", "fill-opacity": 0.4 },
    },
    pintu_air: {
      id: "pintu_air-layer",
      source: "pintu_air",
      type: "circle",
      paint: {
        "circle-radius": 6,
        "circle-color": "blue",
        "circle-stroke-width": 1,
        "circle-stroke-color": "#ffffff",
      },
    },
    jalan: {
      id: "jalan-layer",
      source: "jalan",
      type: "line",
      paint: {
        "line-color": "#FF6200",
        "line-width": ["interpolate", ["linear"], ["zoom"], 12, 1, 16, 3],
        "line-opacity": 0.8,
      },
      beforeId: "bangunan-layer",
    },
  },
  LEGEND: [
    {
      key: "showFloodAreaAll",
      color: "lightblue",
      label: "Genangan",
      shape: "square",
    },
    {
      key: "showBuildings",
      label: "Bangunan (Height)",
      subItems: [
        { height: "0m", color: "saddlebrown" },
        { height: "15m", color: "peru" },
        { height: "35m", color: "burlywood" },
      ],
    },
    {
      key: "showFloodGate",
      color: "blue",
      label: "Pintu Air",
      shape: "circle",
    },
    { key: "showStreet", color: "#FF6200", label: "Jalan", shape: "line" },
  ],
};

// Utility functions
const cleanGeometry = (geometry) => {
  if (!geometry || geometry.type !== "MultiPolygon") return null;
  const cleaned = geometry.coordinates
    .map((polygon) =>
      polygon
        .map((ring) => {
          const unique = ring.filter(
            (pt, i) =>
              i === ring.length - 1 ||
              pt[0] !== ring[(i + 1) % ring.length][0] ||
              pt[1] !== ring[(i + 1) % ring.length][1]
          );
          if (
            unique.length >= 4 &&
            (unique[0][0] !== unique[unique.length - 1][0] ||
              unique[0][1] !== unique[unique.length - 1][1])
          )
            unique.push(unique[0]);
          return unique.length >= 4 ? unique : null;
        })
        .filter(Boolean)
    )
    .filter((p) => p.length);
  return cleaned.length ? { type: "MultiPolygon", coordinates: cleaned } : null;
};

const parseTime = (eventTime) =>
  eventTime?.includes("T")
    ? eventTime.split("T")[1].substring(0, 5)
    : eventTime;
const timeToMinutes = (timeStr) => {
  try {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  } catch {
    return null;
  }
};
const formatCQLTime = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  const date = new Date("2025-05-27");
  date.setUTCHours(h, m, 0, 0);
  return date.toISOString();
};

const fetchGeoData = async (url, errorMsg) => {
  try {
    const res = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!res.ok) throw new Error(errorMsg);
    const data = await res.json();
    console.log(`API ${url} response:`, data);
    return data.time && Array.isArray(data.time) ? data.time : data;
  } catch {
    toast.error(errorMsg);
    return { type: "FeatureCollection", features: [] };
  }
};

// MapLegend Component
const MapLegend = ({
  showBuildings,
  showFloodAreaAll,
  showFloodGate,
  showStreet,
}) => (
  <Box
    sx={{
      position: "absolute",
      top: 80,
      left: 70,
      bgcolor: "rgba(255, 255, 255, 0.9)",
      p: 2,
      borderRadius: 2,
      boxShadow: 3,
      zIndex: 1,
    }}
  >
    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      Legenda
    </Typography>
    {CONFIG.LEGEND.map(({ key, label, color, shape, subItems }) => {
      const isVisible = {
        showBuildings,
        showFloodAreaAll,
        showFloodGate,
        showStreet,
      }[key];
      return subItems
        ? isVisible && (
            <Box
              key={label}
              sx={{ display: "flex", flexDirection: "column", mb: 1 }}
            >
              <Typography variant="body2" fontWeight="bold">
                {label}
              </Typography>
              {subItems.map(({ height, color }) => (
                <Box
                  key={height}
                  sx={{ display: "flex", alignItems: "center", ml: 1 }}
                >
                  <Box sx={{ width: 20, height: 20, bgcolor: color, mr: 1 }} />
                  <Typography variant="body2">{height}</Typography>
                </Box>
              ))}
            </Box>
          )
        : isVisible && (
            <Box
              key={label}
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <Box
                sx={{
                  width: shape === "line" ? 20 : 20,
                  height: shape === "line" ? 2 : 20,
                  bgcolor: color,
                  border: shape === "circle" ? "1px solid white" : undefined,
                  borderRadius: shape === "circle" ? "50%" : undefined,
                  mr: 1,
                }}
              />
              <Typography variant="body2">{label}</Typography>
            </Box>
          );
    })}
  </Box>
);

// Main MapComponent
const MapComponent = ({
  showBuildings,
  showFloodGate,
  showFloodAreaAll,
  showStreet,
  onLayerChange,
  basemap = "google",
  selectedTime,
  onTimesUpdate,
  onTimeChange,
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [geoData, setGeoData] = useState({
    genangan: null,
    bangunan: null,
    jalan: null,
    pintuair: null,
  });
  const [times, setTimes] = useState([]);

  // Initialize map and fetch data
  useEffect(() => {
    const mapInstance = new Map({
      container: mapRef.current,
      ...CONFIG.INITIAL_VIEW,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            ...CONFIG.BASEMAPS[basemap],
            tileSize: 256,
            maxzoom: 19,
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      zoomControl: false,
    });
    setMap(mapInstance);

    const fetchData = async () => {
      const timeData = await fetchGeoData(
        CONFIG.TIME_API_URL,
        "Failed to load time data"
      );
      let fetches = [
        ...(showBuildings
          ? [
              {
                key: "bangunan",
                url: `${CONFIG.WFS_URL}?${new URLSearchParams({
                  ...CONFIG.WFS_PARAMS,
                  typeName: "publik:tr_banjir_bangunan",
                })}`,
                errorMsg: "Failed to load buildings data",
              },
            ]
          : []),
        ...(showStreet
          ? [
              {
                key: "jalan",
                url: `${CONFIG.WFS_URL}?${new URLSearchParams({
                  ...CONFIG.WFS_PARAMS,
                  typeName: "publik:tr_banjir_jalan",
                })}`,
                errorMsg: "Failed to load street data",
              },
            ]
          : []),
        ...(showFloodGate
          ? [
              {
                key: "pintuair",
                url: CONFIG.PINTUAIR_URL,
                errorMsg: "Failed to load flood gate data",
              },
            ]
          : []),
      ];

      // Add genangan fetch with CQL filter if showFloodAreaAll is true
      if (showFloodAreaAll) {
        const cqlFilter = selectedTime
          ? `EVENT_TIME = '${formatCQLTime(selectedTime)}'`
          : "";
        const genanganParams = {
          ...CONFIG.WFS_PARAMS,
          typeName: "publik:tr_banjir_simulasi",
          ...(cqlFilter ? { CQL_FILTER: cqlFilter } : {}),
        };
        fetches.push({
          key: "genangan",
          url: `${CONFIG.WFS_URL}?${new URLSearchParams(genanganParams)}`,
          errorMsg: "Failed to load flood area data",
        });
      }

      const results = await Promise.all(
        fetches.map(({ key, url, errorMsg }) =>
          fetchGeoData(url, errorMsg).then((data) => ({ key, data }))
        )
      );
      setGeoData(
        results.reduce((acc, { key, data }) => ({ ...acc, [key]: data }), {
          genangan: { type: "FeatureCollection", features: [] },
          bangunan: { type: "FeatureCollection", features: [] },
          jalan: { type: "FeatureCollection", features: [] },
          pintuair: { type: "FeatureCollection", features: [] },
        })
      );

      if (Array.isArray(timeData)) {
        const sortedTimes = timeData.sort(
          (a, b) => timeToMinutes(a) - timeToMinutes(b)
        );
        setTimes(sortedTimes);
        if (sortedTimes.length && onTimesUpdate) {
          onTimesUpdate(sortedTimes);
          if (!selectedTime || !sortedTimes.includes(selectedTime))
            onTimeChange?.(sortedTimes[sortedTimes.length - 1]);
        }
      } else {
        toast.warn("No valid time data available.");
      }
    };

    fetchData();
    mapInstance.on("style.load", () => {
      if (geoData.genangan?.features) updateLayers(mapInstance);
    });
    return () => {
      mapInstance.off("style.load");
      mapInstance.remove();
    };
  }, [
    showBuildings,
    showFloodGate,
    showFloodAreaAll,
    showStreet,
    basemap,
    selectedTime,
  ]);

  // Update layers
  const updateLayers = (mapInstance) => {
    if (!mapInstance?.isStyleLoaded()) return;

    const layerData = {
      genangan: { data: geoData.genangan, show: showFloodAreaAll },
      bangunan: { data: geoData.bangunan, show: showBuildings },
      jalan: { data: geoData.jalan, show: showStreet },
      pintuair: { data: geoData.pintuair, show: showFloodGate },
    };

    Object.entries(layerData).forEach(([key, { data, show }]) => {
      const layerConfig = CONFIG.LAYERS[key];
      if (!layerConfig) {
        console.warn(`Layer configuration for ${key} not found`);
        return;
      }
      const { id, source, type, paint, beforeId } = layerConfig;
      if (mapInstance.getLayer(id)) mapInstance.removeLayer(id);
      if (mapInstance.getSource(source)) mapInstance.removeSource(source);
      if (show && data?.features?.length) {
        const geoJson = {
          type: "FeatureCollection",
          features: data.features
            .map((f) => ({ ...f, geometry: cleanGeometry(f.geometry) }))
            .filter((f) => f.geometry),
        };
        mapInstance.addSource(source, { type: "geojson", data: geoJson });
        mapInstance.addLayer({
          id,
          source,
          type,
          paint,
          ...(beforeId ? { beforeId } : {}),
        });
      }
    });

    onLayerChange?.({
      buildingLayer: showBuildings ? CONFIG.LAYERS.bangunan.id : null,
      pintuAirLayer: showFloodGate ? CONFIG.LAYERS.pintu_air.id : null,
      genanganAllLayer: showFloodAreaAll ? CONFIG.LAYERS.genangan.id : null,
      jalanLayer: showStreet ? CONFIG.LAYERS.jalan.id : null,
    });
  };

  useEffect(() => {
    if (!geoData.genangan?.features || !times.length) return;
    if (map?.isStyleLoaded()) updateLayers(map);
  }, [
    map,
    geoData,
    showBuildings,
    showFloodGate,
    showFloodAreaAll,
    showStreet,
  ]);

  // Map controls
  const handleZoom = (dir) =>
    map?.[dir === "in" ? "zoomIn" : "zoomOut"]({ duration: 500 });
  const handleResetView = () =>
    map?.flyTo({ ...CONFIG.INITIAL_VIEW, duration: 1000 });
  const handleFullscreen = () => {
    const elem = mapRef.current;
    if (!isFullscreen) {
      elem.requestFullscreen?.() ||
        elem.webkitRequestFullscreen?.() ||
        elem.msRequestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.() ||
        document.webkitExitFullscreen?.() ||
        document.msExitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
      <Box ref={mapRef} sx={{ width: "100%", height: "100%" }} />
      <Box
        sx={{
          position: "absolute",
          bottom: 40,
          right: 30,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          bgcolor: "rgba(255, 255, 255, 0.9)",
          p: 1,
          borderRadius: 1,
          boxShadow: 2,
          zIndex: 1,
        }}
      >
        {[
          {
            icon: <ZoomInIcon />,
            onClick: () => handleZoom("in"),
            label: "Zoom in",
          },
          {
            icon: <ZoomOutIcon />,
            onClick: () => handleZoom("out"),
            label: "Zoom out",
          },
          { icon: <HomeIcon />, onClick: handleResetView, label: "Reset view" },
          {
            icon: isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />,
            onClick: handleFullscreen,
            label: isFullscreen ? "Exit fullscreen" : "Enter fullscreen",
          },
        ].map(({ icon, onClick, label }, i) => (
          <IconButton key={i} onClick={onClick} aria-label={label}>
            {icon}
          </IconButton>
        ))}
      </Box>
      <MapLegend
        showBuildings={showBuildings}
        showFloodAreaAll={showFloodAreaAll}
        showFloodGate={showFloodGate}
        showStreet={showStreet}
      />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </Box>
  );
};

export default MapComponent;
