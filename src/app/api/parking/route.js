// app/api/parking/route.js
import { prisma } from '../../../../lib/prisma'

export async function POST(request) {
  try {
    const { name, location } = await request.json()

    const parking = await prisma.parking.create({
      data: { name, location },
    })

    return new Response(JSON.stringify(parking), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: 'Failed to create parking' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function GET() {
  try {
    const parkings = await prisma.parking.findMany({
      include: {
        _count: {
          select: {
            parkingSlots: true,
            parkingData: true,
            stays: true,
          },
        },
      },
    })

    return new Response(JSON.stringify(parkings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: 'Failed to fetch parkings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
