import { PrismaClient, Parking, ParkingSlot, User } from "../generated/prisma/client"
import "dotenv/config"

const prisma = new PrismaClient()

async function main() {
  // Create a single parking
  const parking: Parking = await prisma.parking.create({
    data: { name: "Central Park", location: "Av. Principal 100" },
  })

  // Create 5 parking slots for this parking
  const slotInputs = [
    { available: true, ultrasonicId: 101 },
    { available: false, ultrasonicId: 102 },
    { available: true, ultrasonicId: 103 },
    { available: true, ultrasonicId: 104 },
    { available: false, ultrasonicId: 105 },
  ]

  const parkingSlots: ParkingSlot[] = []
  for (const s of slotInputs) {
    const created = await prisma.parkingSlot.create({
      data: {
        available: s.available,
        ultrasonicId: s.ultrasonicId,
        parkingId: parking.id,
      },
    })
    parkingSlots.push(created)
  }

  // Create 5 parking data entries (status records)
  const now = new Date()
  const parkingDataInputs = Array.from({ length: 5 }).map((_, i) => ({
    parkingId: parking.id,
    availableSlots: Math.max(0, 10 - i),
    temperature: (20 + i * 0.7).toFixed(1),
    humidity: (40 + i * 1.5).toFixed(1),
    date: new Date(now.getTime() - i * 1000 * 60 * 60),
  }))

  for (const pd of parkingDataInputs) {
    await prisma.parkingData.create({ data: pd })
  }

  // Create 5 users
  const userInputs = [
    { name: "Ana Pérez", email: "ana.perez@example.com", plateNumber: "ABC-123", role: "CLIENT" as const },
    { name: "Carlos Gómez", email: "carlos.gomez@example.com", plateNumber: "DEF-456", role: "CLIENT" as const },
    { name: "María Ruiz", email: "maria.ruiz@example.com", plateNumber: "GHI-789", role: "CLIENT" as const },
    { name: "Administrador", email: "admin@example.com", plateNumber: null, role: "ADMIN" as const },
    { name: "Jorge Lopez", email: "jorge.lopez@example.com", plateNumber: "JKL-012", role: "CLIENT" as const },
  ]

  const users: User[] = []
  for (const u of userInputs) {
    const created = await prisma.user.create({ data: u })
    users.push(created)
  }

  // Create 5 stays linking users, the same parking, and parking slots
  const staysInputs = [
    {
      startHour: new Date(now.getTime() - 1000 * 60 * 60 * 3),
      endHour: new Date(now.getTime() - 1000 * 60 * 60 * 2),
      plateNumber: users[0].plateNumber ?? "ABC-123",
      userId: users[0].id,
      parkingId: parking.id,
      parkingSlotId: parkingSlots[0].id,
    },
    {
      startHour: new Date(now.getTime() - 1000 * 60 * 60 * 5),
      endHour: null,
      plateNumber: users[1].plateNumber ?? "DEF-456",
      userId: users[1].id,
      parkingId: parking.id,
      parkingSlotId: parkingSlots[1].id,
    },
    {
      startHour: new Date(now.getTime() - 1000 * 60 * 30),
      endHour: null,
      plateNumber: users[2].plateNumber ?? "GHI-789",
      userId: users[2].id,
      parkingId: parking.id,
      parkingSlotId: parkingSlots[2].id,
    },
    {
      startHour: new Date(now.getTime() - 1000 * 60 * 60 * 24),
      endHour: new Date(now.getTime() - 1000 * 60 * 60 * 23),
      plateNumber: users[4].plateNumber ?? "JKL-012",
      userId: users[4].id,
      parkingId: parking.id,
      parkingSlotId: parkingSlots[3].id,
    },
    {
      startHour: new Date(now.getTime() - 1000 * 60 * 60 * 2),
      endHour: new Date(now.getTime() - 1000 * 60 * 60 * 1),
      plateNumber: "XYZ-999",
      userId: users[3].id,
      parkingId: parking.id,
      parkingSlotId: parkingSlots[4].id,
    },
  ]

  for (const s of staysInputs) {
    await prisma.stay.create({ data: s })
  }

  console.log("Seed completed successfully:", {
    parking: 1,
    parkingSlots: parkingSlots.length,
    parkingData: parkingDataInputs.length,
    users: users.length,
    stays: staysInputs.length,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
