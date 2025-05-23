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

    if (isNaN(xmin) || isNaN(xmax) || isNaN(ymin) || isNaN(ymax)) {
      return new NextResponse(
        JSON.stringify({ errors: "Invalid bounding box parameters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await prisma.$queryRaw`
      SELECT 
        id, "namapa" AS nama_pintu_air,
        ST_AsGeoJSON(location) AS geometry
      FROM pintu_air
      WHERE ST_Intersects(
        location,
        ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 4326)
      )
      LIMIT 1000
    `;

    if (data.length === 0) {
      throw new ResponseError(404, "Data not found");
    }

    const geoJSONData = {
      type: "FeatureCollection",
      features: data.map((item) => ({
        type: "Feature",
        geometry: JSON.parse(item.geometry),
        properties: {
          id: item.id,
          nama_pintu_air: item.nama_pintu_air,
        },
      })),
    };

    return NextResponse.json(geoJSONData, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    const status = error instanceof ResponseError ? error.status : 500;
    const message =
      error instanceof ResponseError ? error.message : "Internal Server Error";

    return new NextResponse(JSON.stringify({ errors: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
