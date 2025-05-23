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

// Daftar waktu dari TimeSlider
const TIMES = ["15:30", "17:30", "18:30", "19:30", "20:30"];

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
        top: 80,
        left: 70,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: 2,
        borderRadius: 2,
        boxShadow: 3,
        zIndex: 1,
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Legenda
      </Typography>
      {showFloodAreaAll && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              backgroundColor: "lightblue",
              opacity: 0.4,
              mr: 1,
            }}
          />
          <Typography variant="body2">Genangan</Typography>
        </Box>
      )}
      {showBuildings && (
        <Box sx={{ display: "flex", flexDirection: "column", mb: 1 }}>
          <Typography variant="body2" fontWeight="bold">
            Bangunan (Height)
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
          <Typography variant="body2">Pintu Air</Typography>
        </Box>
      )}
      {showStreet && (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 20,
              height: 2,
              backgroundColor: "#FF6200",
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

const MapComponent = ({
  showBuildings,
  showFloodGate,
  showFloodAreaAll,
  showStreet,
  onLayerChange,
  basemap,
  selectedTime,
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [genanganData, setGenanganData] = useState(null);
  const [bangunanData, setBangunanData] = useState(null); // State baru untuk data bangunan
  const [jalanData, setJalanData] = useState(null);
  const [pintuairData, setPintuairData] = useState(null);

  const initialView = {
    center: [106.862, -6.2222],
    zoom: 15,
    pitch: 45,
    bearing: -17.6,
  };

  const basemaps = {
    google: {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"],
          tileSize: 256,
          attribution: "© Google Maps",
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: "osm",
          type: "raster",
          source: "osm",
        },
      ],
    },
    osm: {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: "osm",
          type: "raster",
          source: "osm",
        },
      ],
    },
  };

  // Fungsi untuk mengonversi waktu "HH:mm" ke menit sejak tengah malam
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Fungsi untuk mengonversi event_time ke menit sejak tengah malam
  const eventTimeToMinutes = (eventTime) => {
    const timePart = eventTime.split(" ")[1].substring(0, 5); // Ambil "15:30" dari "5/21/2025 15:30:00"(SE Asia Standard Time)
    return timeToMinutes(timePart);
  };

  useEffect(() => {
    if (!showFloodAreaAll && !showBuildings && !showStreet) return;

    const fetchData = async () => {
      try {
        if (showFloodAreaAll) {
          const genanganResponse = await fetch(
            "https://dcktrp.jakarta.go.id/apigis/data/studio/d17c6b1089004a968f7ebb7402321eb5?properties=all"
          );
          if (!genanganResponse.ok) {
            throw new Error(
              `Failed to fetch flood area data: ${genanganResponse.status} ${genanganResponse.statusText}`
            );
          }
          const genanganData = await genanganResponse.json();
          setGenanganData(genanganData);
          console.log("Initial genanganGeojson:", genanganData);
        }

        if (showBuildings) {
          const bangunanResponse = await fetch(
            "https://dcktrp.jakarta.go.id/apigis/data/studio/fc9eacd5de3c427892dce3b34141345a"
          );
          if (!bangunanResponse.ok) {
            throw new Error(
              `Failed to fetch buildings data: ${bangunanResponse.status} ${bangunanResponse.statusText}`
            );
          }
          const bangunanData = await bangunanResponse.json();
          setBangunanData(bangunanData);
          console.log("Initial bangunanGeojson:", bangunanData);
        }

        if (showStreet) {
          const jalanResponse = await fetch(
            "https://dcktrp.jakarta.go.id/apigis/data/studio/c242a99c251842b6b057888e0bd0adec"
          );
          if (!jalanResponse.ok) {
            throw new Error(
              `Failed to fetch street data: ${jalanResponse.status} ${jalanResponse.statusText}`
            );
          }
          const jalanData = await jalanResponse.json();
          setJalanData(jalanData);
          console.log("Initial jalanGeojson:", jalanData);
        }
        if (showFloodGate) {
          const pintuairResponse = await fetch(
            "https://dcktrp.jakarta.go.id/apigis/data/studio/ee95d7aa422f4b1aa8a443ebba8083ab"
          );
          if (!pintuairResponse.ok) {
            throw new Error(
              `Failed to fetch flood gate data: ${pintuairResponse.status} ${pintuairResponse.statusText}`
            );
          }
          const pintuairData = await pintuairResponse.json();
          setPintuairData(pintuairData);
          console.log("Initial pintuairGeojson:", pintuairData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.message.includes("flood area")) {
          toast.error(
            "Failed to load flood area data. Some layers may be missing."
          );
          setGenanganData({ type: "FeatureCollection", features: [] });
        }
        if (error.message.includes("buildings")) {
          toast.error(
            "Failed to load buildings data. Some layers may be missing."
          );
          setBangunanData({ type: "FeatureCollection", features: [] });
        }
        if (error.message.includes("street")) {
          toast.error(
            "Failed to load street data. Some layers may be missing."
          );
          setJalanData({ type: "FeatureCollection", features: [] });
        }
      }
    };

    fetchData();
  }, [showFloodAreaAll, showBuildings, showStreet, showFloodGate]);

  //Initialize map
  useEffect(() => {
    const mapInstance = new Map({
      container: mapRef.current,
      center: initialView.center,
      zoom: initialView.zoom,
      pitch: initialView.pitch,
      bearing: initialView.bearing,
      zoomControl: false,
      style: basemaps.google,
    });

    setMap(mapInstance);

    return () => mapInstance.remove();
  }, []);

  useEffect(() => {
    if (!map || !basemap) return;

    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    const currentPitch = map.getPitch();
    const currentBearing = map.getBearing();

    map.setStyle(basemaps[basemap]);

    map.on("style.load", () => {
      map.setCenter(currentCenter);
      map.setZoom(currentZoom);
      map.setPitch(currentPitch);
      map.setBearing(currentBearing);
      updateLayers();
    });
  }, [map, basemap]);

  const updateLayers = async () => {
    if (!map) return;

    const bbox = map.getBounds();
    if (!bbox || !bbox._sw || !bbox._ne) {
      console.warn("Map bounds not ready, skipping layer update");
      return;
    }

    const [xmin, ymin] = [bbox._sw.lng, bbox._sw.lat];
    const [xmax, ymax] = [bbox._ne.lng, bbox._ne.lat];

    let bangunanGeoJson = { type: "FeatureCollection", features: [] };
    let pintuairGeoJson = { type: "FeatureCollection", features: [] };
    let genanganGeojson = { type: "FeatureCollection", features: [] };
    let jalanGeoJson = { type: "FeatureCollection", features: [] };

    if (showBuildings && bangunanData) {
      bangunanGeoJson = bangunanData; // Gunakan data yang sudah di-fetch
    }

    if (showFloodGate && pintuairData) {
      pintuairGeoJson = pintuairData;
    }

    if (showFloodAreaAll && genanganData) {
      const selectedIndex = TIMES.indexOf(selectedTime);
      let startMinutes, endMinutes;

      if (selectedIndex === 0) {
        startMinutes = 0; // 00:00
        endMinutes = timeToMinutes("15:30");
      } else {
        const prevTime = TIMES[selectedIndex - 1];
        startMinutes = timeToMinutes(prevTime) + 1;
        endMinutes = timeToMinutes(selectedTime);
      }

      genanganGeojson = {
        type: "FeatureCollection",
        features: genanganData.features.filter((feature) => {
          const eventMinutes = eventTimeToMinutes(
            feature.properties.event_time
          );
          return eventMinutes >= startMinutes && eventMinutes <= endMinutes;
        }),
      };

      const startTime =
        selectedIndex === 0 ? "00:00" : TIMES[selectedIndex - 1] + ":01";
      if (genanganGeojson.features.length === 0) {
        console.log(
          `No genangan data found for time range ${startTime} - ${selectedTime}`
        );
        toast.info(
          `No flood area data available for ${startTime} - ${selectedTime}. Possibly no rain.`
        );
      } else {
        console.log(
          `Filtered genanganGeojson for time range ${startTime} - ${selectedTime}:`,
          genanganGeojson
        );
      }
    }

    if (showStreet && jalanData) {
      jalanGeoJson = jalanData;
    }

    const removeLayer = (layerId, sourceId) => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };

    removeLayer("bangunan-layer", "bangunan");
    removeLayer("pintu_air-layer", "pintu_air");
    removeLayer("genangan_all_layer", "genangan");
    removeLayer("jalan-layer", "jalan");

    if (showFloodAreaAll && genanganGeojson.features.length > 0) {
      if (map.getSource("genangan")) {
        map.getSource("genangan").setData(genanganGeojson);
      } else {
        map.addSource("genangan", {
          type: "geojson",
          data: genanganGeojson,
        });
      }
      if (!map.getLayer("genangan_all_layer")) {
        map.addLayer({
          id: "genangan_all_layer",
          type: "fill",
          source: "genangan",
          paint: {
            "fill-color": "lightblue",
          },
          beforeId: "bangunan-layer",
        });
        console.log("genangan_all_layer added");
      }
    }

    if (showBuildings && bangunanGeoJson.features.length > 0) {
      if (map.getSource("bangunan")) {
        map.getSource("bangunan").setData(bangunanGeoJson);
      } else {
        map.addSource("bangunan", {
          type: "geojson",
          data: bangunanGeoJson,
        });
      }
      if (!map.getLayer("bangunan-layer")) {
        map.addLayer({
          id: "bangunan-layer",
          type: "fill", // Ubah dari fill-extrusion ke fill untuk 2D
          source: "bangunan",
          paint: {
            "fill-color": "brown", // Warna solid brown
          },
        });
        console.log("bangunan-layer added");
      }
    }

    if (showFloodGate && pintuairGeoJson.features.length > 0) {
      if (map.getSource("pintu_air")) {
        map.getSource("pintu_air").setData(pintuairGeoJson);
      } else {
        map.addSource("pintu_air", {
          type: "geojson",
          data: pintuairGeoJson,
        });
      }
      if (!map.getLayer("pintu_air-layer")) {
        map.addLayer({
          id: "pintu_air-layer",
          type: "circle",
          source: "pintu_air",
          paint: {
            "circle-radius": 6,
            "circle-color": "blue",
            "circle-stroke-width": 1,
            "circle-stroke-color": "#ffffff",
          },
        });
        console.log("pintu_air-layer added");
      }
    }

    if (showStreet && jalanGeoJson.features.length > 0) {
      if (map.getSource("jalan")) {
        map.getSource("jalan").setData(jalanGeoJson);
      } else {
        map.addSource("jalan", {
          type: "geojson",
          data: jalanGeoJson,
        });
      }
      if (!map.getLayer("jalan-layer")) {
        map.addLayer({
          id: "jalan-layer",
          type: "line",
          source: "jalan",
          paint: {
            "line-color": "#FF6200",
            "line-width": ["interpolate", ["linear"], ["zoom"], 12, 1, 16, 3],
            "line-opacity": 0.8,
          },
          beforeId: "bangunan-layer",
        });
        console.log("jalan-layer added");
      }
    }

    if (onLayerChange) {
      onLayerChange({
        buildingLayer: showBuildings ? "bangunan-layer" : null,
        pintuAirLayer: showFloodGate ? "pintu_air-layer" : null,
        genanganAllLayer: showFloodAreaAll ? "genangan_all_layer" : null,
        jalanLayer: showStreet ? "jalan-layer" : null,
      });
    }
  };

  useEffect(() => {
    if (!map) return;

    updateLayers();
    map.on("moveend", updateLayers);

    return () => {
      map.off("moveend", updateLayers);
    };
  }, [
    map,
    showBuildings,
    showFloodGate,
    showFloodAreaAll,
    showStreet,
    onLayerChange,
    selectedTime,
    bangunanData,
    genanganData,
    jalanData,
    pintuairData,
  ]);

  const handleZoomIn = () => {
    if (map) map.zoomIn({ duration: 500 });
  };

  const handleZoomOut = () => {
    if (map) map.zoomOut({ duration: 500 });
  };

  const handleResetView = () => {
    if (map) {
      map.flyTo({
        center: initialView.center,
        zoom: initialView.zoom,
        pitch: initialView.pitch,
        bearing: initialView.bearing,
        duration: 1000,
      });
    }
  };

  const handleFullscreenToggle = () => {
    if (!map) return;
    const elem = mapRef.current;
    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
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
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: 1,
          borderRadius: 1,
          boxShadow: 2,
          zIndex: 1,
        }}
      >
        <IconButton onClick={handleZoomIn} aria-label="Zoom in">
          <ZoomInIcon />
        </IconButton>
        <IconButton onClick={handleZoomOut} aria-label="Zoom out">
          <ZoomOutIcon />
        </IconButton>
        <IconButton onClick={handleResetView} aria-label="Reset view">
          <HomeIcon />
        </IconButton>
        <IconButton
          onClick={handleFullscreenToggle}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>
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

const getGeoJSON = async (url, layerType) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${layerType} data: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching ${layerType} data from ${url}:`, error);
    toast.error(
      `Failed to load ${layerType} data. Some layers may be missing.`
    );
    return { type: "FeatureCollection", features: [] };
  }
};
