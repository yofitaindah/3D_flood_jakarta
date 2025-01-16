"use client";

import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "../map/map.css";
import adminData from "../map/bgn.geojson";

const MapComponent = () => {
  const mapRef = useRef(null);
  const map = useRef(null);
  const lng = 106.862; // Longitude Jakarta
  const lat = -6.2222; // Latitude Jakarta
  const zoom = 15; // Zoom level
  const pitch = 45;
  const bearing = -17.6;
  const API_KEY = "LwdMyEmnYMoMgeVadnRo"; // MapTiler API Key

  useEffect(() => {
    if (map.current) return; // Prevent map from initializing more than once

    map.current = new maplibregl.Map({
      container: mapRef.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
      center: [lng, lat],
      zoom: zoom,
      pitch: pitch,
      bearing: bearing,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      // Add GeoJSON source
      map.current.addSource("admin", {
        type: "geojson",
        data: adminData,
      });

      // Add 3D extrusion layer
      map.current.addLayer({
        id: "admin-extrusion-layer",
        type: "fill-extrusion",
        source: "admin",
        paint: {
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["get", "height2"],
            0,
            "lightgray",
            15,
            "royalblue",
            40,
            "lightblue",
          ],
          "fill-extrusion-height": ["get", "height2"], // Height attribute for extrusion
          "fill-extrusion-base": 0, // Base of extrusion
        },
      });

      // Uncomment the following code if you want to add a stroke layer
      /*
      map.current.addLayer({
        id: "admin-stroke-layer",
        type: "line",
        source: "admin",
        paint: {
          "line-color": "red", // Stroke color
          "line-width": 1.5, // Stroke width
        },
      });
      */
    });
  }, [API_KEY, lng, lat, zoom, pitch, bearing]);

  return (
    <div
      ref={mapRef}
      className="map"
      style={{ height: "100vh", width: "100%" }}
    />
  );
};

export default MapComponent;
