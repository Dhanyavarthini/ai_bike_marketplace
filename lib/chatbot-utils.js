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

// Get user saved bikes context
export async function getUserSavedBikesContext(userId) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    const savedBikes = await db.userSavedBike.findMany({
      where: { userId },
      include: {
        bike: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            category: true,
            price: true,
          },
        },
      },
      take: 10,
      orderBy: { savedAt: "desc" },
    });

    return savedBikes.length > 0 ? savedBikes.map((s) => s.bike) : null;
  } catch (error) {
    console.error("Error fetching user saved bikes:", error);
    return null;
  }
}

// Get user browse history context
export async function getUserBrowseHistoryContext(userId) {
  try {
    const history = await db.browseHistory.findMany({
      where: { userId },
      include: {
        bike: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            category: true,
            price: true,
          },
        },
      },
      take: 8,
      orderBy: { viewedAt: "desc" },
    });

    return history.length > 0 ? history.map((h) => h.bike) : null;
  } catch (error) {
    console.error("Error fetching user browse history:", error);
    return null;
  }
}

// Get personalized recommendations based on user preferences
export async function getPersonalizedBikesContext(userId) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    // Get user's saved bikes to understand preferences
    const savedBikes = await db.userSavedBike.findMany({
      where: { userId },
      include: { bike: true },
      take: 20,
    });

    if (savedBikes.length === 0) return null;

    // Extract preferred categories and makes
    const categories = new Map();
    const makes = new Map();
    let totalPrice = 0;

    savedBikes.forEach((saved) => {
      const bike = saved.bike;
      categories.set(bike.category, (categories.get(bike.category) || 0) + 1);
      makes.set(bike.make, (makes.get(bike.make) || 0) + 1);
      totalPrice += parseFloat(bike.price);
    });

    const topCategories = Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map((e) => e[0]);

    const topMakes = Array.from(makes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map((e) => e[0]);

    // Get recommendations based on preferences
    const recommendations = await db.bike.findMany({
      where: {
        OR: [
          { category: { in: topCategories } },
          { make: { in: topMakes } },
        ],
        savedBy: {
          none: { userId },
        },
      },
      take: 5,
    });

    return recommendations.length > 0 ? recommendations : null;
  } catch (error) {
    console.error("Error fetching personalized bikes context:", error);
    return null;
  }
}

// Generate system prompt with context
export function generateSystemPrompt(userContext = {}) {
<<<<<<< Updated upstream
  return `You are a helpful AI chatbot for a bike marketplace platform. Assist users with bike search, recommendations, test drive bookings, and general inquiries. Be friendly, professional, and use the provided bike database information when answering questions.`;
=======
  return `You are a helpful AI chatbot for a bike marketplace platform.
   Assist users with bike search, recommendations, test drive bookings, and general inquiries. 
   Be friendly, professional, and use the provided bike database information when answering questions.
   
   PREFERENCE-BASED RECOMMENDATIONS: When making suggestions, consider the user's saved bikes, browsing history, and previously viewed bikes.
   Recommend similar categories, makes, or price ranges that the user has shown interest in.
   If a user has saved bikes or viewed bikes, mention that you've noticed their preferences and offer personalized suggestions.
   
   SAVED BIKES: Reference the user's saved bikes when relevant. If they ask for recommendations, suggest bikes similar to what they've saved.
   
   BROWSING HISTORY: Use their recent bike views to understand their interests and make contextual recommendations.
   
   IMPORTANT: If the user ask for test drive, only provide the information about booking process. 
   Do not attempt to book test drives on behalf of users. 
   If the user is not logged in, prompt them to sign in before booking a test drive. 
   Use the following user context when relevant: ${JSON.stringify(userContext)}.
   IMPORTANT: Do not complete bookings on behalf of users automatically. 
   Instead, ask clarifying questions, request explicit confirmation, 
   and direct users to the appropriate booking page or prompt them to sign in before booking. 
   IMPORTANT: When you include links to bike pages, use Markdown link format only — for example: [View Listing - Honda Shine](/bikes/{id}) or [Browse Bikes](/bikes). Do NOT include /test-drive links; always point users to /bikes/{id} or /bikes to complete bookings. 
   IMPORTANT: Do not use Markdown for emphasis (bold/italic), backticks, or HTML tags — only use Markdown links as described.`;
>>>>>>> Stashed changes
}

// Format bike data for context
export function formatBikesForContext(bikes) {
  if (!bikes || bikes.length === 0) return "";

  return "Available bikes:\n" + bikes.map(bike => 
    `- ${bike.make} ${bike.model} (${bike.year}) - ₹${bike.price} - ${bike.category}`
  ).join("\n");
}

// Format saved bikes for context
export function formatSavedBikesForContext(savedBikes) {
  if (!savedBikes || savedBikes.length === 0) return "";

  return (
    "User's Saved Bikes:\n" +
    savedBikes
      .map(
        (bike) =>
          `- ${bike.make} ${bike.model} (${bike.year}) - ₹${bike.price} - ${bike.category}`
      )
      .join("\n")
  );
}

// Format browse history for context
export function formatBrowseHistoryForContext(history) {
  if (!history || history.length === 0) return "";

  return (
    "Recently Viewed Bikes:\n" +
    history
      .map(
        (bike) =>
          `- ${bike.make} ${bike.model} (${bike.year}) - ₹${bike.price} - ${bike.category}`
      )
      .join("\n")
  );
}

// Format recommendations for context
export function formatRecommendationsForContext(recommendations) {
  if (!recommendations || recommendations.length === 0) return "";

  return (
    "Recommended for You (based on your preferences):\n" +
    recommendations
      .map(
        (bike) =>
          `- ${bike.make} ${bike.model} (${bike.year}) - ₹${bike.price} - ${bike.category} - [View Listing](/bikes/${bike.id})`
      )
      .join("\n")
  );
}
