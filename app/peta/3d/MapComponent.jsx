"use client";

import { Box } from "@mui/material";
import { Map } from "maplibre-gl";
import React, { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

const MapComponent = ({ showBuildings, showFloodArea }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState();

  useEffect(() => {
    const map = new Map({
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
            tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap Contributors",
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
    setMap(map);

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (map) {
      const updateLayers = async () => {
        const bbox = map.getBounds();
        const ymax = bbox._ne.lat;
        const ymin = bbox._sw.lat;
        const xmax = bbox._ne.lng;
        const xmin = bbox._sw.lng;

        const bangunanGeoJson = await getGeoJSON(
          `/api/bangunan?xmax=${xmax}&xmin=${xmin}&ymax=${ymax}&ymin=${ymin}`
        );

        const genangan40GeoJson = await getGeoJSON(
          `/api/genangan_40cm?xmax=${xmax}&xmin=${xmin}&ymax=${ymax}&ymin=${ymin}`
        );

        // Clear existing layers if any
        if (map.getSource("genangan_40cm")) {
          map.removeLayer("genangan_40cm_layer");
          map.removeSource("genangan_40cm");
        }
        if (map.getSource("bangunan")) {
          map.removeLayer("bangunan-layer");
          map.removeSource("bangunan");
        }

        // Add layers based on checkbox status
        if (showFloodArea) {
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

        if (showBuildings) {
          map.addSource("bangunan", {
            type: "geojson",
            data: bangunanGeoJson,
          });
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
      };

      updateLayers(); // Update layers on component mount and every change
      map.on("moveend", updateLayers); // Update layers on map move
    }
  }, [map, showBuildings, showFloodArea]);

  return <Box ref={mapRef} sx={{ width: "100%", height: "100%" }} />;
};

export default MapComponent;

const getGeoJSON = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    console.error("Data Belum Dimuat");
    return { type: "FeatureCollection", features: [] };
  }
  return response.json();
};
