# Quick Integration Guide

## 1️⃣ Run Database Migration

```bash
npx prisma migrate dev --name add_browse_history
```

**What it does:**
- Creates `BrowseHistory` table
- Sets up indexes for performance
- Updates Prisma client

---

## 2️⃣ Add Tracking Hook to Bike Detail Page

Find your bike detail page component. It's likely here:
- `app/(main)/bikes/[id]/page.jsx` or
- `app/(main)/bikes/[id]/_components/bike-detail.jsx`

Add this code at the top of your component:

```javascript
'use client';

import { useBikeViewTracking } from '@/hooks/use-bike-view-tracking';

export default function BikeDetailPage({ params }) {
  const { id } = params;
  
  // Add this line - it automatically tracks the view
  useBikeViewTracking(id);
  
  // Rest of your existing code...
  return (
    <div>
      {/* Your bike details JSX */}
    </div>
  );
}
```

**That's it!** The hook now:
- ✅ Tracks when user views the bike
- ✅ Records how long they spend on the page
- ✅ Sends data to the database
- ✅ Data feeds into recommendations

---

## 3️⃣ Test It Works

### Test Tracking:
1. Navigate to a bike detail page
2. Spend some time there (at least 5 seconds)
3. Leave the page
4. Check your database:
   ```sql
   SELECT * FROM "BrowseHistory" ORDER BY "viewedAt" DESC LIMIT 5;
   ```
5. You should see entries with:
   - Your user ID
   - The bike ID
   - Current timestamp
   - Time spent in seconds

### Test Recommendations:
1. Save a few bikes in the same category
2. Chat with the bot
3. Ask about bike recommendations
4. Bot should mention similar bikes to ones you saved!

### Test Context in Chat:
1. Browse/save some bikes
2. Open the chatbot
3. Ask: "What bikes do you think I'd like?"
4. Bot should reference your viewed/saved bikes

---

## 4️⃣ (Optional) Show User Their Preferences

Create a new page at `app/(main)/preferences/page.jsx`:

```javascript
'use client';

import { useEffect, useState } from 'react';
import { getUserPreferences } from '@/actions/user-preferences';
import { Card, CardContent } from '@/components/ui/card';

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      const prefs = await getUserPreferences();
      setPreferences(prefs);
      setLoading(false);
    };
    fetchPreferences();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!preferences) return <div>No preference data yet. Browse some bikes!</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Your Bike Preferences</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Favorite Categories</h3>
            <p>{preferences.topCategories.join(', ') || 'None yet'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Favorite Makes</h3>
            <p>{preferences.topMakes.join(', ') || 'None yet'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Browsed Bikes</h3>
            <p>{preferences.browsedBikesCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Saved Bikes</h3>
            <p>{preferences.savedBikesCount}</p>
          </CardContent>
        </Card>

        {preferences.preferredPriceRange && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Price Range</h3>
              <p>₹{preferences.preferredPriceRange.min.toLocaleString('en-IN')} - ₹{preferences.preferredPriceRange.max.toLocaleString('en-IN')}</p>
            </CardContent>
          </Card>
        )}

        {preferences.averagePrice && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Average Price Viewed</h3>
              <p>₹{Math.round(preferences.averagePrice).toLocaleString('en-IN')}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {preferences.recentlyViewedBikes && preferences.recentlyViewedBikes.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Recently Viewed</h2>
          <div className="grid grid-cols-3 gap-4">
            {preferences.recentlyViewedBikes.map((bike) => (
              <Card key={bike.id}>
                <CardContent className="pt-6">
                  <p className="font-semibold">{bike.make} {bike.model}</p>
                  <p className="text-sm text-gray-600">{bike.year}</p>
                  <p className="text-sm">₹{bike.price.toLocaleString('en-IN')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 5️⃣ Check What's Working

### View the Chatbot Using Preferences

Open your chat and you'll see:
- Bot mentions your saved bikes
- Bot suggests similar bikes
- Bot references your viewed bikes
- Recommendations are personalized!

---

## Troubleshooting

### Views not being tracked?
- ✅ Check you added `useBikeViewTracking(id)` to the page
- ✅ Verify the page is in 'use client' mode
- ✅ Check browser DevTools Network tab for `/api/track-bike-view` requests

### Chatbot not showing preferences?
- ✅ Make sure database migration ran: `npx prisma generate`
- ✅ Check you have at least 1 saved bike or 1 view
- ✅ Clear browser cache and reload

### Database errors?
```bash
# Regenerate Prisma client
npx prisma generate

# Check schema is valid
npx prisma validate
```

---

## What Happens Behind the Scenes

```
┌─────────────────────────────────────────────────────────┐
│ User Views Bike Detail Page                             │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
         useBikeViewTracking(id)
                 │
                 ▼
         trackBikeView() runs
                 │
                 ▼
    BrowseHistory entry created
                 │
                 ▼
    User spends time on page
                 │
                 ▼
    navigator.sendBeacon() sends timeSpent
                 │
                 ▼
    ┌──────────────────────────────────────┐
    │ Database Updated with:               │
    │ - userId                             │
    │ - bikeId                             │
    │ - viewedAt (timestamp)               │
    │ - timeSpent (seconds)                │
    └──────────────────────────────────────┘
                 │
                 ▼
    When User Chats with Bot:
                 │
    ┌──────────────────────────────────────┐
    │ Chat API fetches:                    │
    │ - User's saved bikes                 │
    │ - Browse history                     │
    │ - Recommendations                    │
    │ - Preferences                        │
    └──────────────────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────────┐
    │ AI Bot responds with:                │
    │ - Preference-aware suggestions       │
    │ - Personalized recommendations       │
    │ - Similar bikes to saved ones        │
    │ - Tailored suggestions               │
    └──────────────────────────────────────┘
```

---

## You're All Set! 🎉

The User Preferences & Saved Bikes module is now:
- ✅ Integrated
- ✅ Tracking views
- ✅ Making recommendations
- ✅ Enhancing chatbot

Just remember:
1. ✅ Run the migration
2. ✅ Add the hook to bike pages
3. ✅ Test it works
4. ✅ Enjoy personalized recommendations!

For detailed documentation, see: `docs/USER_PREFERENCES_MODULE.md`
