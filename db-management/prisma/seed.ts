// prisma/seed.ts
import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Clear existing data in correct order (respecting relations)
  await prisma.measurement.deleteMany()
  await prisma.sensor.deleteMany()
  await prisma.stay.deleteMany()
  await prisma.parkingData.deleteMany()
  await prisma.parkingSlot.deleteMany()
  await prisma.parking.deleteMany()
  await prisma.user.deleteMany()
  await prisma.avenue.deleteMany()

  // Create users - use string literals for enum values
  const user1 = await prisma.user.create({
    data: {
      name: 'john_doe',
      email: 'john@example.com',
      plateNumber: 'ABC-123',
      role: 'CLIENT'  // String literal instead of enum
    }
  })

  const user2 = await prisma.user.create({
    data: {
      name: 'jane_smith',
      email: 'jane@example.com',
      plateNumber: 'XYZ-789',
      role: 'CLIENT'  // String literal instead of enum
    }
  })

  const admin = await prisma.user.create({
    data: {
      name: 'admin',
      email: 'admin@parking.com',
      plateNumber: 'ADM-001',
      role: 'ADMIN'  // String literal instead of enum
    }
  })

  // Create parking lots
  const parking1 = await prisma.parking.create({
    data: {
      name: 'Downtown Parking',
      location: '123 Main Street'
    }
  })

  const parking2 = await prisma.parking.create({
    data: {
      name: 'Mall Parking',
      location: '456 Oak Avenue'
    }
  })

  // Create parking slots
  await Promise.all([
    prisma.parkingSlot.create({
      data: { available: true, parkingId: parking1.id }
    }),
    prisma.parkingSlot.create({
      data: { available: false, parkingId: parking1.id }
    }),
    prisma.parkingSlot.create({
      data: { available: true, parkingId: parking1.id }
    }),
    prisma.parkingSlot.create({
      data: { available: true, parkingId: parking2.id }
    }),
    prisma.parkingSlot.create({
      data: { available: true, parkingId: parking2.id }
    })
  ])

  // Create parking data
  await prisma.parkingData.create({
    data: {
      parkingId: parking1.id,
      availableSlots: 2,
      temperature: 22.5,
      humidity: 65.0,
      date: new Date()
    }
  })

  await prisma.parkingData.create({
    data: {
      parkingId: parking2.id,
      availableSlots: 5,
      temperature: 24.0,
      humidity: 60.0,
      date: new Date()
    }
  })

  // Create sensors - use string literals for enum values
  const sensor1 = await prisma.sensor.create({
    data: {
      type: 'ULTRASONIC',  // String literal instead of enum
      location: 'Entrance Gate A',
      description: 'Ultrasonic sensor for vehicle detection',
      status: 'ACTIVE'
    }
  })

  const sensor2 = await prisma.sensor.create({
    data: {
      type: 'CAMERA',  // String literal instead of enum
      location: 'Level 1 - Section B',
      description: 'Camera for license plate recognition',
      status: 'ACTIVE'
    }
  })

  // Create measurements
  await prisma.measurement.create({
    data: {
      sensorId: sensor1.id,
      value: 1.5,
      timestamp: new Date()
    }
  })

  await prisma.measurement.create({
    data: {
      sensorId: sensor2.id,
      value: 0.8,
      timestamp: new Date()
    }
  })

  // Create stays
  await prisma.stay.create({
    data: {
      startHour: new Date('2024-01-15T08:00:00Z'),
      endHour: new Date('2024-01-15T12:30:00Z'),
      userId: user1.id,
      parkingId: parking1.id
    }
  })

  await prisma.stay.create({
    data: {
      startHour: new Date('2024-01-15T09:15:00Z'),
      endHour: new Date('2024-01-15T11:45:00Z'),
      userId: user2.id,
      parkingId: parking2.id
    }
  })

  // Create avenue
  await prisma.avenue.create({
    data: {
      id: 'main-avenue'
    }
  })

  console.log('Seed completed successfully!')
  console.log(`Created:
    - 3 users
    - 2 parking lots  
    - 5 parking slots
    - 2 parking data entries
    - 2 sensors
    - 2 measurements
    - 2 stays
    - 1 avenue
  `)
}

main()
  .catch((e) => {
    console.error('Error during seed:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })