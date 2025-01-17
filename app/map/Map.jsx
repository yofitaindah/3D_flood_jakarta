"use client";

import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "../map/map.css";
import adminData from "../map/bgn.geojson";
import adminBoundary from "../map/admin.geojson";

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
      // Add GeoJSON source for admin 3D extrusion
      map.current.addSource("admin", {
        type: "geojson",
        data: adminData,
      });

      // Add 3D extrusion layer for admin data
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

      // Add GeoJSON source for admin boundary
      map.current.addSource("admin-boundary", {
        type: "geojson",
        data: adminBoundary,
      });

      // Add boundary layer
      map.current.addLayer({
        id: "admin-boundary-layer",
        type: "line",
        source: "admin-boundary",
        paint: {
          "line-color": "#FF0000", // Red color for boundary lines
          "line-width": 2,
        },
      });

      // Add basemap switcher buttons
      const basemapSwitcher = document.createElement("div");
      basemapSwitcher.className = "maplibregl-ctrl maplibregl-ctrl-group";

      const maptilerButton = document.createElement("button");
      maptilerButton.innerText = "MapTiler";
      maptilerButton.onclick = () => {
        map.current.setStyle(
          `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`
        );
      };

      const osmButton = document.createElement("button");
      osmButton.innerText = "OSM";
      osmButton.onclick = () => {
        if (map.current.getLayer("osm-layer")) {
          map.current.removeLayer("osm-layer");
        }

        if (map.current.getSource("osm-source")) {
          map.current.removeSource("osm-source");
        }

        map.current.addSource("osm-source", {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
        });

        map.current.addLayer({
          id: "osm-layer",
          type: "raster",
          source: "osm-source",
        });
      };

      basemapSwitcher.appendChild(maptilerButton);
      basemapSwitcher.appendChild(osmButton);

      map.current.addControl(
        {
          onAdd: () => basemapSwitcher,
          onRemove: () =>
            basemapSwitcher.parentNode.removeChild(basemapSwitcher),
        },
        "top-right"
      );
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
