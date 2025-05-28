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

// Fungsi untuk memvalidasi dan membersihkan geometri
const cleanGeometry = (geometry) => {
  if (!geometry || geometry.type !== "MultiPolygon") return null;
  const cleanedCoordinates = geometry.coordinates
    .map((polygon) =>
      polygon
        .map((ring) => {
          const uniqueRing = [];
          for (let i = 0; i < ring.length; i++) {
            const current = ring[i];
            const next = ring[(i + 1) % ring.length];
            if (
              current[0] !== next[0] ||
              current[1] !== next[1] ||
              i === ring.length - 1
            ) {
              uniqueRing.push(current);
            }
          }
          if (
            uniqueRing.length >= 4 &&
            uniqueRing[0][0] !== uniqueRing[uniqueRing.length - 1][0] &&
            uniqueRing[0][1] !== uniqueRing[uniqueRing.length - 1][1]
          ) {
            uniqueRing.push(uniqueRing[0]);
          }
          return uniqueRing.length >= 4 ? uniqueRing : null;
        })
        .filter((ring) => ring)
    )
    .filter((polygon) => polygon.length > 0);
  return cleanedCoordinates.length > 0
    ? { type: "MultiPolygon", coordinates: cleanedCoordinates }
    : null;
};

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
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
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
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
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
  onTimesUpdate,
  onTimeChange,
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [genanganData, setGenanganData] = useState(null);
  const [bangunanData, setBangunanData] = useState(null);
  const [jalanData, setJalanData] = useState(null);
  const [pintuairData, setPintuairData] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [initialDataFetched, setInitialDataFetched] = useState(false);

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

  const timeToMinutes = (timeStr) => {
    try {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    } catch (error) {
      console.error("Error parsing time string:", timeStr, error);
      return null;
    }
  };

  const eventTimeToTimeString = (eventTime) => {
    try {
      if (!eventTime) {
        console.warn("EVENT_TIME is null or undefined");
        return null;
      }
      if (eventTime.includes("T")) {
        return eventTime.split("T")[1].substring(0, 5);
      }
      console.warn("Unrecognized EVENT_TIME format:", eventTime);
      return null;
    } catch (error) {
      console.error("Error parsing EVENT_TIME:", eventTime, error);
      return null;
    }
  };

  const formatTimeForCQL = (timeStr) => {
    if (!timeStr) return null;
    const date = new Date("2025-05-27"); // Sesuaikan dengan tanggal saat ini
    const [hours, minutes] = timeStr.split(":").map(Number);
    date.setUTCHours(hours, minutes, 0, 0);
    return date.toISOString();
  };

  // Fetch initial data only once on mount
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      try {
        const wfsBaseUrl = "https://gis-dev.dcktrp.id/gispublik/publik/ows";
        const params = {
          service: "WFS",
          version: "1.0.0",
          request: "GetFeature",
          typeName: "publik:tr_banjir_simulasi",
          outputFormat: "application/json",
          srsName: "EPSG:4326",
          maxFeatures: "5000",
        };
        const genanganUrl = `${wfsBaseUrl}?${new URLSearchParams(params)}`;
        console.log("Fetching initial genangan data from:", genanganUrl);
        const genanganResponse = await fetch(genanganUrl, {
          mode: "cors",
          credentials: "omit",
        });
        if (!genanganResponse.ok) {
          throw new Error(
            `Failed to fetch initial flood area data: ${genanganResponse.status} ${genanganResponse.statusText}`
          );
        }
        const genanganData = await genanganResponse.json();
        console.log("Fetched initial genanganData:", genanganData);
        if (isMounted) {
          setGenanganData(genanganData);
          setInitialDataFetched(true);
        }

        // Fetch other layers without filtering by time
        const commonParams = {
          service: "WFS",
          version: "1.0.0",
          request: "GetFeature",
          outputFormat: "application/json",
          srsName: "EPSG:4326",
          maxFeatures: "5000",
        };

        if (showBuildings) {
          const bangunanParams = {
            ...commonParams,
            typeName: "publik:tr_banjir_bangunan",
          };
          const bangunanUrl = `${wfsBaseUrl}?${new URLSearchParams(
            bangunanParams
          )}`;
          console.log("Fetching initial bangunan data from:", bangunanUrl);
          const bangunanResponse = await fetch(bangunanUrl, {
            mode: "cors",
            credentials: "omit",
          });
          if (!bangunanResponse.ok) {
            throw new Error(
              `Failed to fetch initial buildings data: ${bangunanResponse.status} ${bangunanResponse.statusText}`
            );
          }
          const bangunanData = await bangunanResponse.json();
          if (isMounted) setBangunanData(bangunanData);
        }

        if (showStreet) {
          const jalanParams = {
            ...commonParams,
            typeName: "publik:tr_banjir_jalan",
          };
          const jalanUrl = `${wfsBaseUrl}?${new URLSearchParams(jalanParams)}`;
          console.log("Fetching initial jalan data from:", jalanUrl);
          const jalanResponse = await fetch(jalanUrl, {
            mode: "cors",
            credentials: "omit",
          });
          if (!jalanResponse.ok) {
            throw new Error(
              `Failed to fetch initial street data: ${jalanResponse.status} ${jalanResponse.statusText}`
            );
          }
          const jalanData = await jalanResponse.json();
          if (isMounted) setJalanData(jalanData);
        }

        if (showFloodGate) {
          const pintuairUrl =
            "https://dcktrp.jakarta.go.id/apigis/data/studio/ee95d7aa422f4b1aa8a443ebba8083ab";
          console.log("Fetching initial pintuair data from:", pintuairUrl);
          const pintuairResponse = await fetch(pintuairUrl, {
            mode: "cors",
            credentials: "omit",
          });
          if (!pintuairResponse.ok) {
            throw new Error(
              `Failed to fetch initial flood gate data: ${pintuairResponse.status} ${pintuairResponse.statusText}`
            );
          }
          const pintuairData = await pintuairResponse.json();
          if (isMounted) setPintuairData(pintuairData);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error(
          "Failed to load initial data. Check WFS service or network."
        );
        if (isMounted) {
          setGenanganData({ type: "FeatureCollection", features: [] });
          setBangunanData({ type: "FeatureCollection", features: [] });
          setJalanData({ type: "FeatureCollection", features: [] });
          setPintuairData({ type: "FeatureCollection", features: [] });
          setInitialDataFetched(true);
        }
      }
    };

    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, [showBuildings, showFloodGate, showFloodAreaAll, showStreet]);

  // Extract unique times and set default to the latest EVENT_TIME
  useEffect(() => {
    if (!genanganData || !genanganData.features || !initialDataFetched) {
      console.log(
        "genanganData is null, has no features, or initial fetch not complete:",
        genanganData
      );
      setAvailableTimes([]);
      return;
    }
    console.log(
      "Sample feature properties:",
      genanganData.features.slice(0, 5).map((f) => f.properties)
    );
    const uniqueTimes = [
      ...new Set(
        genanganData.features
          .map((feature) =>
            eventTimeToTimeString(feature.properties?.EVENT_TIME)
          )
          .filter((time) => time)
      ),
    ].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
    console.log("Extracted unique times:", uniqueTimes);
    setAvailableTimes(uniqueTimes);
    if (uniqueTimes.length > 0 && onTimesUpdate) {
      onTimesUpdate(uniqueTimes);
      const latestTime = uniqueTimes[uniqueTimes.length - 1]; // Use the latest time
      console.log(
        `Setting default time to latest ${latestTime} based on initial data.`
      );
      if (
        onTimeChange &&
        (!selectedTime || !uniqueTimes.includes(selectedTime))
      ) {
        onTimeChange(latestTime); // Set default to latest time if not already set
      }
    } else {
      console.warn("No valid unique times extracted from data");
      if (onTimeChange) onTimeChange(null);
      toast.warn("No valid time data available for flood areas.");
    }
  }, [
    genanganData,
    onTimesUpdate,
    onTimeChange,
    initialDataFetched,
    selectedTime,
  ]);

  // Update layers only when map style is loaded
  const updateLayers = (mapInstance) => {
    if (!mapInstance || !mapInstance.isStyleLoaded()) return;

    let filteredGenanganData = { type: "FeatureCollection", features: [] };
    if (genanganData && genanganData.features) {
      const cqlTime = selectedTime ? formatTimeForCQL(selectedTime) : null;
      filteredGenanganData.features = genanganData.features
        .filter((feature) => {
          const featureTime = eventTimeToTimeString(
            feature.properties?.EVENT_TIME
          );
          return (
            !cqlTime ||
            (featureTime && formatTimeForCQL(featureTime) === cqlTime)
          );
        })
        .map((feature) => ({
          ...feature,
          geometry: cleanGeometry(feature.geometry),
        }))
        .filter((feature) => feature.geometry);
    }

    let bangunanGeoJson = { type: "FeatureCollection", features: [] };
    if (bangunanData && bangunanData.features) {
      bangunanGeoJson.features = bangunanData.features
        .map((feature) => ({
          ...feature,
          geometry: cleanGeometry(feature.geometry),
        }))
        .filter((feature) => feature.geometry);
    }

    let jalanGeoJson = { type: "FeatureCollection", features: [] };
    if (jalanData && jalanData.features) {
      jalanGeoJson.features = jalanData.features
        .map((feature) => ({
          ...feature,
          geometry: cleanGeometry(feature.geometry),
        }))
        .filter((feature) => feature.geometry);
    }

    let pintuairGeoJson = { type: "FeatureCollection", features: [] };
    if (pintuairData && pintuairData.features) {
      pintuairGeoJson.features = pintuairData.features;
    }

    const removeLayer = (layerId, sourceId) => {
      if (mapInstance.getLayer(layerId)) mapInstance.removeLayer(layerId);
      if (mapInstance.getSource(sourceId)) mapInstance.removeSource(sourceId);
    };

    removeLayer("bangunan-layer", "bangunan");
    removeLayer("pintu_air-layer", "pintu_air");
    removeLayer("genangan_all_layer", "genangan");
    removeLayer("jalan-layer", "jalan");

    if (showFloodAreaAll && filteredGenanganData.features.length > 0) {
      if (mapInstance.getSource("genangan"))
        mapInstance.getSource("genangan").setData(filteredGenanganData);
      else
        mapInstance.addSource("genangan", {
          type: "geojson",
          data: filteredGenanganData,
        });
      if (!mapInstance.getLayer("genangan_all_layer")) {
        mapInstance.addLayer({
          id: "genangan_all_layer",
          type: "fill",
          source: "genangan",
          paint: { "fill-color": "lightblue", "fill-opacity": 0.4 },
          beforeId: "bangunan-layer",
        });
      }
    }

    if (showBuildings && bangunanGeoJson.features.length > 0) {
      if (mapInstance.getSource("bangunan"))
        mapInstance.getSource("bangunan").setData(bangunanGeoJson);
      else
        mapInstance.addSource("bangunan", {
          type: "geojson",
          data: bangunanGeoJson,
        });
      if (!mapInstance.getLayer("bangunan-layer")) {
        mapInstance.addLayer({
          id: "bangunan-layer",
          type: "fill",
          source: "bangunan",
          paint: { "fill-color": "brown" },
        });
      }
    }

    if (showFloodGate && pintuairGeoJson.features.length > 0) {
      if (mapInstance.getSource("pintu_air"))
        mapInstance.getSource("pintu_air").setData(pintuairGeoJson);
      else
        mapInstance.addSource("pintu_air", {
          type: "geojson",
          data: pintuairGeoJson,
        });
      if (!mapInstance.getLayer("pintu_air-layer")) {
        mapInstance.addLayer({
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
      }
    }

    if (showStreet && jalanGeoJson.features.length > 0) {
      if (mapInstance.getSource("jalan"))
        mapInstance.getSource("jalan").setData(jalanGeoJson);
      else
        mapInstance.addSource("jalan", { type: "geojson", data: jalanGeoJson });
      if (!mapInstance.getLayer("jalan-layer")) {
        mapInstance.addLayer({
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

    mapInstance.on("style.load", () => {
      console.log("Map style loaded successfully");
      updateLayers(mapInstance);
    });

    return () => {
      if (mapInstance) {
        mapInstance.off("style.load", updateLayers);
        mapInstance.remove();
      }
    };
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
      updateLayers(map);
    });
  }, [map, basemap]);

  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;
    updateLayers(map);
  }, [
    map,
    showBuildings,
    showFloodGate,
    showFloodAreaAll,
    showStreet,
    onLayerChange,
    selectedTime,
    genanganData,
    bangunanData,
    jalanData,
    pintuairData,
  ]);

  const handleZoomIn = () => map?.zoomIn({ duration: 500 });
  const handleZoomOut = () => map?.zoomOut({ duration: 500 });
  const handleResetView = () => map?.flyTo({ ...initialView, duration: 1000 });
  const handleFullscreenToggle = () => {
    if (!map) return;
    const elem = mapRef.current;
    if (!isFullscreen) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", () =>
      setIsFullscreen(!!document.fullscreenElement)
    );
    return () =>
      document.removeEventListener("fullscreenchange", () =>
        setIsFullscreen(!!document.fullscreenElement)
      );
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
