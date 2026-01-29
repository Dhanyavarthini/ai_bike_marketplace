import { db } from "@/lib/prisma";

// Get context about bikes for the chatbot
export async function getBikesContext(searchQuery = "") {
  try {
    const bikes = await db.bike.findMany({
      take: 20,
      where: searchQuery ? {
        OR: [
          { make: { contains: searchQuery, mode: "insensitive" } },
          { model: { contains: searchQuery, mode: "insensitive" } },
          { category: { contains: searchQuery, mode: "insensitive" } },
        ],
      } : {},
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        category: true,
        price: true,
        mileage: true,
        description: true,
      },
    });

    return bikes.length > 0 ? bikes : null;
  } catch (error) {
    console.error("Error fetching bikes context:", error);
    return null;
  }
}

// Get user test drive bookings
export async function getUserBookingsContext(userId) {
  try {
    const testDrives = await db.testDriveBooking.findMany({
      where: { userId },
      take: 10,
      select: {
        id: true,
        bike: { select: { make: true, model: true } },
        bookingDate: true,
        status: true,
      },
    });

    return { testDrives };
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return { testDrives: [] };
  }
}

// Generate system prompt with context
export function generateSystemPrompt(userContext = {}) {
  return `You are a helpful AI chatbot for a bike marketplace platform. Assist users with bike search, recommendations, test drive bookings, and general inquiries. Be friendly, professional, and use the provided bike database information when answering questions.`;
}

// Format bike data for context
export function formatBikesForContext(bikes) {
  if (!bikes || bikes.length === 0) return "";

  return "Available bikes:\n" + bikes.map(bike => 
    `- ${bike.make} ${bike.model} (${bike.year}) - ₹${bike.price} - ${bike.category}`
  ).join("\n");
}
