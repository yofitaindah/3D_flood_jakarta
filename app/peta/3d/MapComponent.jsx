"use client";

import { Box, Button } from "@mui/material";
import { Map } from "maplibre-gl";
import React, { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

const MapComponent = () => {
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
        // Ganti nama fungsi dari updatePolygons menjadi updateLayers
        const bbox = map.getBounds();
        const ymax = bbox._ne.lat;
        const ymin = bbox._sw.lat;
        const xmax = bbox._ne.lng;
        const xmin = bbox._sw.lng;

        const bangunanGeoJson = await getGeoJSON(
          `/api/bangunan?xmax=${xmax}&xmin=${xmin}&ymax=${ymax}&ymin=${ymin}`
        );

        const genanganGeoJson = await getGeoJSON(
          `/api/genangan?xmax=${xmax}&xmin=${xmin}&ymax=${ymax}&ymin=${ymin}`
        );

        if (map.getSource("bangunan")) {
          map.removeLayer("bangunan-layer");
          map.removeSource("bangunan");
        }

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
              20,
              "peru",
              40,
              "burlywood",
            ],
            "fill-extrusion-height": ["get", "height2"], // Height attribute for extrusion
            "fill-extrusion-base": 0, // Base of extrusion
          },
        });

        // Add flood inundation layer
        if (map.getSource("genangan")) {
          map.removeLayer("genangan-layer");
          map.removeSource("genangan");
        }
        map.addSource("genangan", {
          type: "geojson",
          data: genanganGeoJson,
        });
        map.addLayer({
          id: "genangan-layer",
          type: "fill",
          source: "genangan",
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "max_m"],
              0,
              "lightblue",
              1.4,
              "blue",
              2.8,
              "darkblue",
            ],
            "fill-opacity": 0.5,
          },
        });
      };

      updateLayers(); // Panggil updateLayers di sini

      map.on("moveend", updateLayers); // Pasang event listener untuk update layer saat peta bergerak
    }
  }, [map]);

  return <Box ref={mapRef} sx={{ width: "100%", height: "100%" }}></Box>;
};

export default MapComponent;

const getGeoJSON = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    console.error("Failed to fetch GeoJSON data");
    return { type: "FeatureCollection", features: [] };
  }
  return response.json();
};
