import { ResponseError } from "@/error/response-error";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;

    const xmin = parseFloat(searchParams.get("xmin"));
    const xmax = parseFloat(searchParams.get("xmax"));
    const ymin = parseFloat(searchParams.get("ymin"));
    const ymax = parseFloat(searchParams.get("ymax"));

    if (request.method !== "GET") {
      throw new ResponseError(405, "Method not allowed");
    }

    // Mengambil data genangan banjir dari database
    const data = await prisma.$queryRaw`
      SELECT
        id,
        COALESCE("range_m", '') AS range_m,
        COALESCE("depth", 0) AS depth,
        ST_AsGeoJSON(location) AS geometry
      FROM genangan_240cm
      WHERE ST_Intersects(
        location,
        ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 4326))`;

    if (data.length === 0) {
      throw new ResponseError(404, "Not found");
    }

    // Serialisasi data untuk GeoJSON
    const geoJSONData = {
      type: "FeatureCollection",
      features: data.map((item) => ({
        type: "Feature",
        geometry: JSON.parse(item.geometry),
        properties: {
          id: item.id,
          range_m: item.range_m,
          depth: item.depth,
        },
      })),
    };

    return NextResponse.json(geoJSONData, { status: 200 });
  } catch (error) {
    if (error instanceof ResponseError) {
      return new NextResponse(JSON.stringify({ errors: error.message }), {
        status: error.status,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      console.error(error);
      return new NextResponse(
        JSON.stringify({ errors: "Internal Server Error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }
}
