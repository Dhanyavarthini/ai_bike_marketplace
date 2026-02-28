# Usage Examples - User Preferences Module

## Example 1: Basic Bike Page with Tracking

### Simple Implementation
```javascript
// app/(main)/bikes/[id]/page.jsx
'use client';

import { useBikeViewTracking } from '@/hooks/use-bike-view-tracking';
import BikeDetails from './_components/bike-details';

export default function BikePage({ params }) {
  const { id } = params;
  
  // Track this view automatically
  useBikeViewTracking(id);

  return (
    <div className="container mx-auto p-6">
      <BikeDetails bikeId={id} />
    </div>
  );
}
```

---

## Example 2: Advanced Page with Time Tracking

```javascript
// app/(main)/bikes/[id]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useBikeViewTracking } from '@/hooks/use-bike-view-tracking';
import BikeDetails from './_components/bike-details';

export default function BikePage({ params }) {
  const { id } = params;
  const [timeSpent, setTimeSpent] = useState(0);
  
  // Track views
  useBikeViewTracking(id);
  
  // Optional: Track time spent locally for UI
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="text-xs text-gray-500 mb-4">
        Time spent: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
      </div>
      <BikeDetails bikeId={id} />
    </div>
  );
}
```

---

## Example 3: Get User Preferences (Server Component)

```javascript
// app/(main)/user/dashboard/page.jsx
import { getUserPreferences } from '@/actions/user-preferences';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  const preferences = await getUserPreferences();

  if (!preferences) {
    return <div>Start browsing bikes to see your preferences!</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {preferences.topCategories.length > 0 ? (
            <ul className="list-disc list-inside">
              {preferences.topCategories.map(cat => (
                <li key={cat}>{cat}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Browse bikes to discover your preferences</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Top Makes</CardTitle>
        </CardHeader>
        <CardContent>
          {preferences.topMakes.length > 0 ? (
            <ul className="list-disc list-inside">
              {preferences.topMakes.map(make => (
                <li key={make}>{make}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No makes yet</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Bikes Browsed: {preferences.browsedBikesCount}</p>
          <p>Bikes Saved: {preferences.savedBikesCount}</p>
          {preferences.averagePrice && (
            <p>Avg Price: ₹{Math.round(preferences.averagePrice).toLocaleString('en-IN')}</p>
          )}
        </CardContent>
      </Card>

      {preferences.recentlyViewedBikes && (
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recently Viewed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {preferences.recentlyViewedBikes.map(bike => (
                <div key={bike.id} className="border rounded p-3">
                  <h4 className="font-semibold">{bike.make} {bike.model}</h4>
                  <p className="text-sm text-gray-600">{bike.year}</p>
                  <p className="text-sm">Category: {bike.category}</p>
                  <p className="text-sm font-semibold">₹{bike.price.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## Example 4: Recommendations Page

```javascript
// app/(main)/recommendations/page.jsx
import { getPersonalizedRecommendations } from '@/actions/user-preferences';
import BikeCard from '@/components/bike-card';

export default async function RecommendationsPage() {
  const recommendations = await getPersonalizedRecommendations();

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">No Recommendations Yet</h1>
        <p className="text-gray-600">
          Browse and save some bikes to get personalized recommendations!
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Recommended for You</h1>
      <p className="text-gray-600 mb-6">
        Based on your browsing history and saved bikes
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map(bike => (
          <BikeCard key={bike.id} bike={bike} />
        ))}
      </div>
    </div>
  );
}
```

---

## Example 5: Chatbot with Preference Context

### How It Works Automatically
The chatbot automatically uses preference context. This is handled in `/api/chat` route.

### Example Chat Flow
```
User: "What bikes would you recommend for me?"

Bot: "Based on your saved bikes (Honda Shine, Bajaj Pulsar) 
and your recent browsing history, I notice you're interested in 
Street bikes in the ₹150,000-200,000 price range.

Here are some bikes I think you'd love:
- Yamaha FZ v4 - [View Listing](/bikes/abc123)
- Hero Xtreme 160R - [View Listing](/bikes/def456)
- Bajaj Dominar 250 - [View Listing](/bikes/ghi789)

Would you like to book a test drive for any of these?"
```

---

## Example 6: Browse History Page

```javascript
// app/(main)/user/history/page.jsx
import { getUserBrowseHistory } from '@/actions/user-preferences';
import Link from 'next/link';

export default async function BrowseHistoryPage() {
  const history = await getUserBrowseHistory();

  if (!history || history.length === 0) {
    return <div>No browsing history yet. Start exploring!</div>;
  }

  // Group by date
  const groupedByDate = history.reduce((acc, item) => {
    const date = new Date(item.viewedAt).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Your Browse History</h1>
      
      {Object.entries(groupedByDate).map(([date, items]) => (
        <div key={date} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{date}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <Link 
                key={item.id}
                href={`/bikes/${item.bikeId}`}
                className="border rounded p-4 hover:shadow-lg transition"
              >
                <h3 className="font-semibold">
                  {item.bike.make} {item.bike.model}
                </h3>
                <p className="text-sm text-gray-600">{item.bike.year}</p>
                <p className="text-sm">{item.bike.category}</p>
                <p className="text-sm font-semibold">
                  ₹{item.bike.price.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Viewed: {new Date(item.viewedAt).toLocaleTimeString()}
                </p>
                {item.timeSpent > 0 && (
                  <p className="text-xs text-gray-500">
                    Time spent: {Math.round(item.timeSpent / 60)}m
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Example 7: Saved Bikes with Recommendations

```javascript
// app/(main)/user/saved-bikes/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { getUserSavedBikes, getPersonalizedRecommendations } from '@/actions/user-preferences';
import BikeCard from '@/components/bike-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SavedBikesPage() {
  const [savedBikes, setSavedBikes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const saved = await getUserSavedBikes();
      const recs = await getPersonalizedRecommendations();
      setSavedBikes(saved);
      setRecommendations(recs);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Your Saved Bikes</h1>

      <Tabs defaultValue="saved">
        <TabsList>
          <TabsTrigger value="saved">
            Saved ({savedBikes.length})
          </TabsTrigger>
          <TabsTrigger value="recommended">
            Recommended ({recommendations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved">
          {savedBikes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedBikes.map(bike => (
                <BikeCard key={bike.id} bike={bike} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">
                No saved bikes yet. Browse our collection and save your favorites!
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommended">
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map(bike => (
                <BikeCard key={bike.id} bike={bike} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">
                Save some bikes to get personalized recommendations!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## Example 8: Preference-Based Filters

```javascript
// Component to show bikes similar to saved preferences
'use client';

import { useEffect, useState } from 'react';
import { getUserPreferences } from '@/actions/user-preferences';
import { db } from '@/lib/prisma';

export async function SimilarBikesWidget() {
  const preferences = await getUserPreferences();
  
  if (!preferences || preferences.topCategories.length === 0) {
    return null;
  }

  // This would typically be in a server action
  const similarBikes = await db.bike.findMany({
    where: {
      category: {
        in: preferences.topCategories,
      },
    },
    take: 3,
  });

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-3">
        Bikes in Your Favorite Categories
      </h3>
      <div className="space-y-2">
        {similarBikes.map(bike => (
          <a 
            key={bike.id}
            href={`/bikes/${bike.id}`}
            className="block p-2 hover:bg-gray-100 rounded"
          >
            <p className="font-medium">{bike.make} {bike.model}</p>
            <p className="text-sm text-gray-600">{bike.category}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
```

---

## Common Patterns

### Pattern 1: Check if User Has Preferences
```javascript
const prefs = await getUserPreferences();
const hasPreferences = prefs && 
  (prefs.savedBikesCount > 0 || prefs.browsedBikesCount > 0);
```

### Pattern 2: Conditional Rendering
```javascript
if (preferences?.topCategories.length > 0) {
  // Show preference-based recommendations
} else {
  // Show general recommendations
}
```

### Pattern 3: Format Price for Display
```javascript
const formattedPrice = bike.price.toLocaleString('en-IN', {
  style: 'currency',
  currency: 'INR'
});
```

### Pattern 4: Calculate Browse Time
```javascript
const minutesSpent = Math.round(item.timeSpent / 60);
const secondsSpent = item.timeSpent % 60;
```

---

## Tips & Best Practices

1. **Use Server Components for Preferences**
   - Fetch preferences server-side when possible
   - Reduces client-side API calls

2. **Cache Preference Data**
   - Don't fetch preferences on every render
   - Use React hooks or Next.js caching

3. **Graceful Degradation**
   - Always have fallbacks if no preferences exist
   - Provide helpful messages to new users

4. **Performance**
   - Only fetch what you need
   - Use indexes effectively
   - Limit history to 30 days

5. **User Privacy**
   - Be transparent about data collection
   - Allow users to clear history
   - Don't share preferences with others

---

For more details, see:
- `docs/USER_PREFERENCES_MODULE.md` - Full API reference
- `QUICK_START.md` - Quick setup guide
- Individual file comments - Implementation details
