import prisma from '../../../../lib/prisma'; // Adjust path if your prisma instance is located elsewhere

export async function POST(req) {
  try {
    const { sessionId, rating } = await req.json();

    if (!sessionId || rating === undefined) {
      return Response.json({ error: 'Missing sessionId or rating' }, { status: 400 });
    }

    const ratingNumber = parseInt(rating, 10);
    if (isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 10) {
      return Response.json({ error: 'Invalid rating value. Must be an integer between 1 and 10.' }, { status: 400 });
    }

    if (!prisma) {
        console.error('Prisma client is not available.');
        return Response.json({ error: 'Database client not initialized' }, { status: 500 });
    }

    const newRating = await prisma.typedUserRating.create({
      data: {
        sessionId: sessionId,
        rating: ratingNumber,
      },
    });

    return Response.json({ success: true, rating: newRating }, { status: 201 });

  } catch (error) {
    console.error('Error saving typed rating:', error);
    // Check if it's a Prisma-specific error, e.g., unique constraint, etc.
    if (error.code && error.meta) { // Basic check for Prisma error structure
        return Response.json({ error: 'Database error while saving rating.', details: error.message }, { status: 500 });
    }
    return Response.json({ error: 'Server error while saving rating' }, { status: 500 });
  }
} 