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
        COALESCE("kel_kiri", '') AS kel_kiri,
        COALESCE("kel_kanan", '') AS kel_kanan,
        COALESCE("range_m", '') AS range_m,
        COALESCE("min_m", 0) AS min_m,
        COALESCE("max_m", 0) AS max_m,
        COALESCE("min_tma", 0) AS min_tma,
        COALESCE("max_tma", 0) AS max_tma,
        COALESCE("tma", 0) AS tma,
        ST_AsGeoJSON(location) AS geometry
      FROM genangan
      WHERE ST_Intersects(
        location,
        ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 4326)
      )
    `;

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
          kel_kiri: item.kel_kiri,
          kel_kanan: item.kel_kanan,
          range_m: item.range_m,
          min_m: item.min_m,
          max_m: item.max_m,
          min_tma: item.min_tma,
          max_tma: item.max_tma,
          tma: item.tma,
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
