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
        id, "WADMKK" AS kota, "WADMKC" AS kecamatan, "WADMKD" AS kelurahan, 
        "KODBANG" AS kode_bangunan, "JNSBANGN" AS jenis_bangunan, 
        "UKPLKLRGA" AS umur_kepala_keluarga, "JMLKKRMH" AS jumlah_kepala_keluarga, 
        "GAJI" AS gaji, "STSRTLH" AS satus_rtlh, "KATUSIA" AS kategori_usia, 
        "CATATAN" AS catatan, "height2",
        ST_AsGeoJSON(location) AS geometry
      FROM bangunan
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
          kota: item.kota,
          kecamatan: item.kecamatan,
          kelurahan: item.kelurahan,
          kode_bangunan: item.kode_bangunan,
          jenis_bangunan: item.jenis_bangunan,
          umur_kepala_keluarga: item.umur_kepala_keluarga,
          jumlah_kepala_keluarga: item.jumlah_kepala_keluarga,
          gaji: item.gaji ? Number(item.gaji) : null,
          satus_rtlh: item.satus_rtlh,
          kategori_usia: item.kategori_usia,
          catatan: item.catatan,
          height2: item.height2,
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
