"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Track bike view when user visits a bike listing
 */
export async function trackBikeView(bikeId, timeSpent = 0) {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return null;

    // Create or update browse history
    const existingView = await db.browseHistory.findFirst({
      where: {
        userId: user.id,
        bikeId: bikeId,
        viewedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    if (existingView) {
      // Update existing view with additional time
      await db.browseHistory.update({
        where: { id: existingView.id },
        data: {
          timeSpent: existingView.timeSpent + timeSpent,
          viewedAt: new Date(),
        },
      });
    } else {
      // Create new view record
      await db.browseHistory.create({
        data: {
          userId: user.id,
          bikeId: bikeId,
          timeSpent: timeSpent,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error tracking bike view:", error);
    return null;
  }
}

/**
 * Get user's saved bikes with full details
 */
export async function getUserSavedBikes() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return [];

    const savedBikes = await db.userSavedBike.findMany({
      where: { userId: user.id },
      include: {
        bike: true,
      },
      orderBy: {
        savedAt: "desc",
      },
      take: 20,
    });

    return savedBikes.map((item) => item.bike);
  } catch (error) {
    console.error("Error fetching saved bikes:", error);
    return [];
  }
}

/**
 * Get user's browse history
 */
export async function getUserBrowseHistory() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return [];

    const history = await db.browseHistory.findMany({
      where: { userId: user.id },
      include: {
        bike: true,
      },
      orderBy: {
        viewedAt: "desc",
      },
      take: 50,
    });

    return history;
  } catch (error) {
    console.error("Error fetching browse history:", error);
    return [];
  }
}

/**
 * Get user preference data for chatbot context
 * Analyzes browsing history and saved bikes to build user preferences
 */
export async function getUserPreferences() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return null;

    // Get saved bikes
    const savedBikes = await db.userSavedBike.findMany({
      where: { userId: user.id },
      include: { bike: true },
    });

    // Get recent browse history (last 30 days)
    const browseHistory = await db.browseHistory.findMany({
      where: {
        userId: user.id,
        viewedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      include: { bike: true },
    });

    // Analyze preferences from history
    const preferences = {
      savedBikesCount: savedBikes.length,
      browsedBikesCount: browseHistory.length,
      preferredCategories: {},
      preferredMakes: {},
      preferredPriceRange: { min: Infinity, max: 0 },
      averageMileage: 0,
    };

    // Analyze saved bikes for preferences
    if (savedBikes.length > 0) {
      savedBikes.forEach((item) => {
        const bike = item.bike;
        preferences.preferredCategories[bike.category] =
          (preferences.preferredCategories[bike.category] || 0) + 1;
        preferences.preferredMakes[bike.make] =
          (preferences.preferredMakes[bike.make] || 0) + 1;
        preferences.preferredPriceRange.min = Math.min(
          preferences.preferredPriceRange.min,
          bike.price
        );
        preferences.preferredPriceRange.max = Math.max(
          preferences.preferredPriceRange.max,
          bike.price
        );
      });
    }

    // Get top browsed categories
    const topCategories = Object.entries(preferences.preferredCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((item) => item[0]);

    const topMakes = Object.entries(preferences.preferredMakes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((item) => item[0]);

    // Calculate average price and mileage from browse history
    let totalPrice = 0,
      totalMileage = 0;
    if (browseHistory.length > 0) {
      browseHistory.forEach((item) => {
        totalPrice += parseFloat(item.bike.price);
        totalMileage += item.bike.mileage;
      });
      preferences.averagePrice = totalPrice / browseHistory.length;
      preferences.averageMileage = totalMileage / browseHistory.length;
    }

    return {
      savedBikesCount: savedBikes.length,
      browsedBikesCount: browseHistory.length,
      topCategories,
      topMakes,
      recentlySavedBikes: savedBikes.slice(0, 5).map((item) => item.bike),
      recentlyViewedBikes: browseHistory.slice(0, 5).map((item) => item.bike),
      preferredPriceRange: preferences.preferredPriceRange.min !== Infinity ? preferences.preferredPriceRange : null,
      averagePrice: preferences.averagePrice || null,
      averageMileage: preferences.averageMileage || null,
    };
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return null;
  }
}

/**
 * Get personalized bike recommendations based on user preferences
 */
export async function getPersonalizedRecommendations() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return [];

    // Get user preferences
    const preferences = await getUserPreferences();
    if (!preferences || preferences.topCategories.length === 0) {
      return []; // No preferences to recommend from
    }

    // Build query based on preferences
    let recommendedBikes = await db.bike.findMany({
      where: {
        OR: [
          // Bikes from preferred categories
          {
            category: {
              in: preferences.topCategories,
            },
          },
          // Bikes from preferred makes
          {
            make: {
              in: preferences.topMakes,
            },
          },
        ],
        // Exclude already saved bikes
        savedBy: {
          none: {
            userId: user.id,
          },
        },
      },
      take: 10,
    });

    // Sort by relevance: category match first, then price proximity
    if (preferences.preferredPriceRange) {
      recommendedBikes = recommendedBikes.sort((a, b) => {
        const aCategoryMatch = preferences.topCategories.includes(a.category) ? 1 : 0;
        const bCategoryMatch = preferences.topCategories.includes(b.category) ? 1 : 0;

        if (aCategoryMatch !== bCategoryMatch) {
          return bCategoryMatch - aCategoryMatch;
        }

        // Secondary sort: price proximity
        const avgPrice = preferences.averagePrice || (preferences.preferredPriceRange.min + preferences.preferredPriceRange.max) / 2;
        const aPriceDiff = Math.abs(a.price - avgPrice);
        const bPriceDiff = Math.abs(b.price - avgPrice);

        return aPriceDiff - bPriceDiff;
      });
    }

    return recommendedBikes.slice(0, 5);
  } catch (error) {
    console.error("Error getting personalized recommendations:", error);
    return [];
  }
}
