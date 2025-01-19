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
            const updatePolygons = async () => {
                const bbox = map.getBounds();
                const ymax = bbox._ne.lat;
                const ymin = bbox._sw.lat;
                const xmax = bbox._ne.lng;
                const xmin = bbox._sw.lng;

                const geojson = await getGeoJSON(
                    `/api/bangunan?xmax=${xmax}&xmin=${xmin}&ymax=${ymax}&ymin=${ymin}`
                );

                if (map.getSource("bangunan")) {
                    map.removeLayer("bangunan-layer");
                    map.removeSource("bangunan");
                }

                map.addSource("bangunan", {
                    type: "geojson",
                    data: geojson,
                });

                map.addLayer({
                    id: "bangunan-layer",
                    type: "fill",
                    source: "bangunan",
                    paint: {
                        "fill-color": "#888888",
                        "fill-opacity": 0.4,
                    },
                });
            };

            updatePolygons();

            map.on("moveend", updatePolygons);
        }
    }, [map]);

    return (
        <Box ref={mapRef} sx={{ width: "100%", height: "100%" }}></Box>
    );
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
