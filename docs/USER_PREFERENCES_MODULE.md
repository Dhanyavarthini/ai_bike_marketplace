# User Preferences & Saved Bikes Module

## Overview
This module tracks user browsing history and saved bikes to provide personalized recommendations through the AI chatbot. It enhances the user experience by understanding preferences and suggesting relevant bikes.

## Features

### 1. **Browse History Tracking**
- Automatically tracks every bike the user views
- Records viewing time spent on each bike
- Aggregates data to understand user preferences
- Maintains 30-day rolling window of viewing history

### 2. **Saved Bikes Management**
- Users can save bikes they're interested in
- Saved bikes are used to understand user preferences
- Multiple saved bikes in same category = stronger preference signal
- Existing `UserSavedBike` model is leveraged

### 3. **Personalized Recommendations**
- AI chatbot analyzes user's saved bikes and browsing history
- Recommends similar bikes based on:
  - Preferred categories
  - Preferred manufacturers (makes)
  - Price range preferences
  - Mileage preferences
- Excludes bikes user has already saved

### 4. **Context-Aware Chatbot**
- Chatbot is aware of user preferences
- Surfaces saved bikes in conversations
- Shows recently viewed bikes
- Provides intelligent recommendations

## Database Schema

### New Model: BrowseHistory
```prisma
model BrowseHistory {
  id        String   @id @default(uuid())
  userId    String   
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  bikeId    String   
  bike      Bike     @relation(fields: [bikeId], references: [id], onDelete: Cascade)
  viewedAt  DateTime @default(now())
  timeSpent Int      @default(0)  // Time spent in seconds

  @@index([userId])
  @@index([bikeId])
  @@index([userId, viewedAt])
}
```

### Updated User Model
```prisma
model User {
  // ... existing fields ...
  browseHistory BrowseHistory[]
}
```

## Server Actions (`actions/user-preferences.js`)

### `trackBikeView(bikeId, timeSpent = 0)`
Tracks when a user views a bike
- **Parameters:**
  - `bikeId`: ID of the bike being viewed
  - `timeSpent`: Time spent in seconds (optional)
- **Returns:** `{ success: true }` or `null` on error
- **Usage:** Called when user navigates to bike detail page

### `getUserSavedBikes()`
Gets user's saved bikes with full details
- **Returns:** Array of Bike objects, ordered by most recently saved
- **Max:** 20 bikes
- **Requires Auth:** Yes

### `getUserBrowseHistory()`
Gets user's browse history
- **Returns:** Array of BrowseHistory objects with bike details
- **Max:** 50 recent views
- **Requires Auth:** Yes
- **Filters:** Last 30 days only

### `getUserPreferences()`
Analyzes user's behavior to extract preferences
- **Returns:** Object with:
  - `savedBikesCount`: Number of saved bikes
  - `browsedBikesCount`: Number of browsed bikes
  - `topCategories`: Top 3 preferred bike categories
  - `topMakes`: Top 3 preferred manufacturers
  - `recentlySavedBikes`: 5 most recently saved bikes
  - `recentlyViewedBikes`: 5 most recently viewed bikes
  - `preferredPriceRange`: Min/max prices from saved bikes
  - `averagePrice`: Average price from browsing history
  - `averageMileage`: Average mileage from browsing history
- **Requires Auth:** Yes

### `getPersonalizedRecommendations()`
Gets bikes recommended based on user preferences
- **Returns:** Array of 5 recommended Bike objects
- **Algorithm:**
  1. Analyzes saved bikes to find preferred categories and makes
  2. Finds bikes matching preferences
  3. Excludes already-saved bikes
  4. Sorts by category match first, then price proximity
- **Requires Auth:** Yes

## Chatbot Utilities (`lib/chatbot-utils.js`)

### New Context Functions
- `getUserSavedBikesContext(userId)`: Gets saved bikes for context
- `getUserBrowseHistoryContext(userId)`: Gets recent views for context
- `getPersonalizedBikesContext(userId)`: Gets recommendations for context

### New Formatting Functions
- `formatSavedBikesForContext(bikes)`: Formats saved bikes as readable text
- `formatBrowseHistoryForContext(history)`: Formats browse history as readable text
- `formatRecommendationsForContext(recommendations)`: Formats recommendations as readable text

### Updated System Prompt
The chatbot now:
- Considers user's saved bikes in recommendations
- References recently viewed bikes
- Suggests similar bikes based on viewing patterns
- Makes preference-aware suggestions

## API Routes

### POST `/api/track-bike-view`
Tracks bike view with time spent
- **Request Body:**
  ```json
  {
    "bikeId": "uuid-string",
    "timeSpent": 45  // seconds
  }
  ```
- **Response:** `{ success: true }`
- **Note:** Can use `navigator.sendBeacon()` for reliability

### POST `/api/chat`
Enhanced to include preference context
- **New Behavior:**
  - Fetches user's saved bikes
  - Fetches user's browse history
  - Fetches personalized recommendations
  - Includes all in chatbot context
- **Backward Compatible:** Works with non-authenticated users

## Client-Side Hook (`hooks/use-bike-view-tracking.js`)

### `useBikeViewTracking(bikeId)`
React hook to automatically track bike views
```javascript
import { useBikeViewTracking } from '@/hooks/use-bike-view-tracking';

export default function BikePage({ bikeId }) {
  useBikeViewTracking(bikeId);
  
  return (
    <div>
      {/* Bike details */}
    </div>
  );
}
```

**Features:**
- Tracks view when component mounts
- Records time spent when user leaves page
- Uses `navigator.sendBeacon()` for reliability
- No manual API calls needed

## Implementation Steps

### Step 1: Create/Update Prisma Schema
✅ **DONE** - BrowseHistory model added

### Step 2: Create Database Migration
Run:
```bash
npx prisma migrate dev --name add_browse_history
```

### Step 3: Create Server Actions
✅ **DONE** - `actions/user-preferences.js` created

### Step 4: Update Chatbot Utilities
✅ **DONE** - Enhanced `lib/chatbot-utils.js`

### Step 5: Update Chat API Route
✅ **DONE** - Enhanced `app/api/chat/route.js`

### Step 6: Create Tracking Hook
✅ **DONE** - `hooks/use-bike-view-tracking.js` created

### Step 7: Create Tracking API Route
✅ **DONE** - `app/api/track-bike-view/route.js` created

### Step 8: Integrate Hook in Bike Pages
Add to your bike detail page components:
```javascript
import { useBikeViewTracking } from '@/hooks/use-bike-view-tracking';

export default function BikeDetailPage({ params }) {
  const { id } = params;
  useBikeViewTracking(id);
  
  // ... rest of component
}
```

## Usage Examples

### Example 1: Get User Preferences
```javascript
import { getUserPreferences } from '@/actions/user-preferences';

const preferences = await getUserPreferences();
console.log(preferences.topCategories); // ['Sport', 'Street']
console.log(preferences.averagePrice); // 450000
```

### Example 2: Track View on Page Load
```javascript
import { useBikeViewTracking } from '@/hooks/use-bike-view-tracking';

export default function BikePage({ params }) {
  useBikeViewTracking(params.id);
  return <BikeDetails bikeId={params.id} />;
}
```

### Example 3: Get Recommendations
```javascript
import { getPersonalizedRecommendations } from '@/actions/user-preferences';

const recommendations = await getPersonalizedRecommendations();
// Returns array of bikes similar to user's saved bikes
```

### Example 4: Chatbot Uses Preferences
The chat API automatically:
1. Fetches user's preferences
2. Includes context in system prompt
3. AI makes personalized suggestions
4. No additional code needed!

## Performance Considerations

### Indexes
- `BrowseHistory` table has indexes on:
  - `userId` - for quick user lookups
  - `bikeId` - for bike analytics
  - `userId, viewedAt` - for time-range queries

### Query Optimization
- Browse history limited to 30 days (performance)
- Recommendations limited to 5 results
- Saved bikes limited to 20 for context
- Browse history limited to 50 records

### Caching
Consider caching user preferences:
```javascript
// In a hook or component
const [preferences, setPreferences] = useState(null);

useEffect(() => {
  // Fetch preferences once on page load
  getUserPreferences().then(setPreferences);
}, []);
```

## Privacy & Data Handling

### Data Collected
- Which bikes user viewed
- How long they spent on each bike
- Which bikes they saved
- When they viewed/saved bikes

### Retention
- Browse history: 30-day rolling window
- Saved bikes: Until explicitly unsaved
- Cascade delete: Deletes history if user account deleted

### Usage
- Only used to personalize recommendations
- Never shared with other users
- Only visible to user and admin
- Can be cleared by deleting user account

## Future Enhancements

1. **Category-based recommendations engine**
   - Machine learning for better matching
   - A/B testing different algorithms

2. **Similar bikes suggestions**
   - "Users who viewed X also viewed Y"
   - Collaborative filtering

3. **Smart notifications**
   - Alert user when similar bike is added
   - Price drop notifications

4. **Preference analytics**
   - Heatmaps of popular categories
   - Price sensitivity analysis
   - Seasonal trends

5. **Export/Import preferences**
   - User can backup their preferences
   - Migrate across devices

## Troubleshooting

### Views not being tracked
- Ensure `useBikeViewTracking(bikeId)` is called on bike page
- Check browser console for API errors
- Verify user is authenticated

### Chatbot not using preferences
- Ensure database migration ran successfully
- Check that user has saved bikes or browse history
- Verify chat API is importing new functions

### Performance issues
- Check database indexes exist
- Consider caching preferences
- Monitor query times in production

## Support
For issues or questions, refer to the main README or contact the development team.
