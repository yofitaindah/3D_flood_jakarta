"use client";

import { Box } from "@mui/material";
import { Map } from "maplibre-gl";
import React, { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

const MapComponent = ({
  showBuildings,
  showFloodArea1,
  showFloodArea2,
  showFloodArea3,
  showFloodArea4,
  showFloodArea5,
  showFloodArea6,
  showFloodArea7,
  // showFloodAll,
  onLayerChange,
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const basemapEnum = "arcgis/light-gray";

  useEffect(() => {
    const mapInstance = new Map({
      container: mapRef.current,
      center: [106.862, -6.2222],
      zoom: 15,
      pitch: 45,
      bearing: -17.6,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"],
            tileSize: 256,
            attribution: "",
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
    });
    setMap(mapInstance);

    return () => mapInstance.remove();
  }, []);

  useEffect(() => {
    if (!map) return;

    const updateLayers = async () => {
      const bbox = map.getBounds();
      const [xmin, ymin] = [bbox._sw.lng, bbox._sw.lat];
      const [xmax, ymax] = [bbox._ne.lng, bbox._ne.lat];

      const bangunanGeoJson = await getGeoJSON(
        `/api/bangunan?xmax=${xmax}&xmin=${xmin}&ymax=${ymax}&ymin=${ymin}`
      );
      const genangan40GeoJson = await getGeoJSON(
        `/api/genangan_40cm?xmax=${xmax}&xmin=${xmin}&ymax=${ymax}&ymin=${ymin}`
      );
      const genangan80GeoJson = await getGeoJSON(
        `/api/genangan_80cm?xmax=${xmax}&xmin=${xmin}&ymax=${ymax}&ymin=${ymin}`
      );
      const genangan120GeoJson = await getGeoJSON(
        `/api/genangan_120cm?xmax=${xmax}&xmin=${xmin}&ymax=${ymax}&ymin=${ymin}`
      );
      const genangan160GeoJson = await getGeoJSON(
        `/api/genangan_160cm?xmax=${xmax}&xmin=${xmin}&ymax=${ymax}&ymin=${ymin}`
      );
      const genangan200GeoJson = await getGeoJSON(
        `/api/genangan_200cm?xmax=${xmax}&xmin=${xmin}&ymax=${ymax}&ymin=${ymin}`
      );
      const genangan240GeoJson = await getGeoJSON(
        `/api/genangan_240cm?xmax=${xmax}&xmin=${xmin}&ymax=${ymax}&ymin=${ymin}`
      );
      const genangan280GeoJson = await getGeoJSON(
        `/api/genangan_280cm?xmax=${xmax}&xmin=${xmin}&ymax=${ymax}&ymin=${ymin}`
      );

      const removeLayer = (layerId, sourceId) => {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      };

      removeLayer("genangan_40cm_layer", "genangan_40cm");
      removeLayer("genangan_80cm_layer", "genangan_80cm");
      removeLayer("genangan_120cm_layer", "genangan_120cm");
      removeLayer("genangan_160cm_layer", "genangan_160cm");
      removeLayer("genangan_200cm_layer", "genangan_200cm");
      removeLayer("genangan_240cm_layer", "genangan_240cm");
      removeLayer("genangan_280cm_layer", "genangan_280cm");
      removeLayer("bangunan-layer", "bangunan");

      if (showFloodArea1) {
        map.addSource("genangan_40cm", {
          type: "geojson",
          data: genangan40GeoJson,
        });
        map.addLayer({
          id: "genangan_40cm_layer",
          type: "fill",
          source: "genangan_40cm",
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "depth"],
              0,
              "lightblue",
              1.4,
              "blue",
              2.8,
              "darkblue",
            ],
          },
        });
      }

      if (showFloodArea2) {
        map.addSource("genangan_80cm", {
          type: "geojson",
          data: genangan80GeoJson,
        });
        map.addLayer({
          id: "genangan_80cm_layer",
          type: "fill",
          source: "genangan_80cm",
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "depth"],
              0,
              "lightblue",
              1.4,
              "blue",
              2.8,
              "darkblue",
            ],
          },
        });
      }

      if (showFloodArea3) {
        map.addSource("genangan_120cm", {
          type: "geojson",
          data: genangan120GeoJson,
        });
        map.addLayer({
          id: "genangan_120cm_layer",
          type: "fill",
          source: "genangan_120cm",
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "depth"],
              0,
              "lightblue",
              1.4,
              "blue",
              2.8,
              "darkblue",
            ],
          },
        });
      }

      if (showFloodArea4) {
        map.addSource("genangan_160cm", {
          type: "geojson",
          data: genangan160GeoJson,
        });
        map.addLayer({
          id: "genangan_160cm_layer",
          type: "fill",
          source: "genangan_160cm",
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "depth"],
              0,
              "lightblue",
              1.4,
              "blue",
              2.8,
              "darkblue",
            ],
          },
        });
      }

      if (showFloodArea5) {
        map.addSource("genangan_200cm", {
          type: "geojson",
          data: genangan200GeoJson,
        });
        map.addLayer({
          id: "genangan_200cm_layer",
          type: "fill",
          source: "genangan_200cm",
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "depth"],
              0,
              "lightblue",
              1.4,
              "blue",
              2.8,
              "darkblue",
            ],
          },
        });
      }

      if (showFloodArea6) {
        map.addSource("genangan_240cm", {
          type: "geojson",
          data: genangan240GeoJson,
        });
        map.addLayer({
          id: "genangan_240cm_layer",
          type: "fill",
          source: "genangan_240cm",
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "depth"],
              0,
              "lightblue",
              1.4,
              "blue",
              2.8,
              "darkblue",
            ],
          },
        });
      }

      if (showFloodArea7) {
        map.addSource("genangan_280cm", {
          type: "geojson",
          data: genangan280GeoJson,
        });
        map.addLayer({
          id: "genangan_280cm_layer",
          type: "fill",
          source: "genangan_280cm",
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "depth"],
              2.8,
              "blue",
            ],
          },
        });
      }

      if (showBuildings) {
        map.addSource("bangunan", { type: "geojson", data: bangunanGeoJson });
        map.addLayer({
          id: "bangunan-layer",
          type: "fill-extrusion",
          source: "bangunan",
          paint: {
            "fill-extrusion-color": [
              "interpolate",
              ["linear"],
              ["get", "height2"],
              0,
              "saddlebrown",
              15,
              "peru",
              35,
              "burlywood",
            ],
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              16,
              ["get", "height2"],
            ],
            "fill-extrusion-base": 0,
          },
        });
      }

      // if (showFloodAll) {
      //   map.addSource("contours", {
      //     type: "raster",
      //     tiles: [
      //       "https://jakartasatu.jakarta.go.id/server/rest/services/TR_Banjir_Simulasi_Updated_New/MapServer/tile/{z}/{y}/{x}",
      //     ],
      //   });
      // }

      if (onLayerChange) {
        onLayerChange({
          floodLayer1: showFloodArea1 ? "genangan_40cm_layer" : null,
          floodLayer2: showFloodArea2 ? "genangan_80cm_layer" : null,
          floodLayer3: showFloodArea3 ? "genangan_120cm_layer" : null,
          floodLayer4: showFloodArea4 ? "genangan_160cm_layer" : null,
          floodLayer5: showFloodArea5 ? "genangan_200cm_layer" : null,
          floodLayer6: showFloodArea6 ? "genangan_240cm_layer" : null,
          floodLayer7: showFloodArea7 ? "genangan_280cm_layer" : null,
          buildingLayer: showBuildings ? "bangunan-layer" : null,
        });
      }
    };

    updateLayers();
    map.on("moveend", updateLayers);

    return () => map.off("moveend", updateLayers);
  }, [
    map,
    showBuildings,
    showFloodArea1,
    showFloodArea2,
    showFloodArea3,
    showFloodArea4,
    showFloodArea5,
    showFloodArea6,
    showFloodArea7,
    onLayerChange,
  ]);

  return <Box ref={mapRef} sx={{ width: "100%", height: "100%" }} />;
};

export default MapComponent;

const getGeoJSON = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch data");
    return response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return { type: "FeatureCollection", features: [] };
  }
};
