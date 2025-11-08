// pages/api/temperature/index.js
import { prisma } from '../../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { parkingId, temperature } = req.body
    
    try {
      // Verify parking exists
      const parking = await prisma.parking.findUnique({
        where: { id: parkingId }
      })
      
      if (!parking) {
        return res.status(404).json({ error: 'Parking not found' })
      }
      
      const tempRecord = await prisma.temperature.create({
        data: {
          parkingId,
          temperature: parseFloat(temperature),
        },
        include: {
          parking: true
        }
      })
      
      res.status(201).json(tempRecord)
    } catch (error) {
      res.status(500).json({ error: 'Failed to record temperature' })
    }
  }
  
  if (req.method === 'GET') {
    const { parkingId } = req.query
    
    try {
      const where = parkingId ? { parkingId } : {}
      
      const temperatures = await prisma.temperature.findMany({
        where,
        include: {
          parking: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: 100,
      })
      
      res.status(200).json(temperatures)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch temperatures' })
    }
  }
}