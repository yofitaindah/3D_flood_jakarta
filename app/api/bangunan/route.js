import { ResponseError } from "@/error/response-error";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = request.nextUrl;

        const xmin = parseFloat(searchParams.get("xmin"))
        const xmax = parseFloat(searchParams.get("xmax"))
        const ymin = parseFloat(searchParams.get("ymin"))
        const ymax = parseFloat(searchParams.get("ymax"))

        if (request.method !== "GET") {
            throw new ResponseError(405, "Method not allowed");
        }

        const data = await prisma.$queryRaw`
            SELECT
                id,
                COALESCE("WADMKK", '') AS kota,
                COALESCE("WADMKC", '') AS kecamatan,
                COALESCE("WADMKD", '') AS kelurahan,
                COALESCE("KODBANG", '') AS kode_bangunan,
                COALESCE("JNSBANGN", '') AS jenis_bangunan,
                COALESCE("UKPLKLRGA", 0) AS umur_kepala_keluarga,
                COALESCE("JMLKKRMH", 0) AS jumlah_kepala_keluarga,
                COALESCE("GAJI", 0) AS gaji,
                COALESCE("STSRTLH", '') AS satus_rtlh,
                COALESCE("KATUSIA", '') AS kategori_usia,
                COALESCE("CATATAN", '') AS catatan,
                ST_AsGeoJSON(location) AS geometry
            FROM bangunan
            WHERE ST_Intersects(
                location,
                ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 4326)
            )
        `;

        if (data.length === 0) {
            throw new ResponseError(404, "Not found");
        }

        const serializedData = data.map(item => ({
            ...item,
            gaji: item.gaji !== null ? parseInt(item.gaji.toString()) : null,
        }));

        const geoJSONData = {
            type: 'FeatureCollection',
            features: serializedData.map(item => ({
                type: 'Feature',
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
                    gaji: item.gaji,
                    satus_rtlh: item.satus_rtlh,
                    kategori_usia: item.kategori_usia,
                    catatan: item.catatan
                }
            }))
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
            return new NextResponse(JSON.stringify({ errors: "Internal Server Error" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    }
}
