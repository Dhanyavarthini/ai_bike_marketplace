import { trackBikeView } from '@/actions/user-preferences';

export async function POST(request) {
  try {
    const data = await request.json();
    const { bikeId, timeSpent } = data;

    if (!bikeId) {
      return Response.json(
        { error: 'Bike ID is required' },
        { status: 400 }
      );
    }

    const result = await trackBikeView(bikeId, timeSpent || 0);

    if (!result) {
      return Response.json(
        { error: 'Failed to track bike view' },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error tracking bike view:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
