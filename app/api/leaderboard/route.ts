import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { Leaderboard } from '../../models/leaderboard';

export async function GET() {
  try {
    await connectToDatabase();
    console.log('Connected to database');
    
    // Get all leaderboard entries sorted by coins
    const entries = await Leaderboard.find()
      .sort({ coins: -1 })
      .lean();
    
    console.log('Found entries:', entries.length);
    
    if (entries.length === 0) {
      console.log('No entries found in database');
      return NextResponse.json([]);
    }

    // Add ranks and rank changes
    const updatedEntries = entries.map((entry, index) => {
      const newRank = index + 1;
      let rankChange = null;
      
      if (entry.previousRank !== null) {
        if (newRank < entry.previousRank) {
          rankChange = 'up';
        } else if (newRank > entry.previousRank) {
          rankChange = 'down';
        } else {
          rankChange = 'same';
        }
      }

      return {
        ...entry,
        currentRank: newRank,
        rankChange,
      };
    });

    // Update the database with new ranks
    await Promise.all(
      updatedEntries.map((entry) =>
        Leaderboard.findByIdAndUpdate(entry._id, {
          currentRank: entry.currentRank,
          previousRank: entry.previousRank,
          rankChange: entry.rankChange,
        })
      )
    );

    console.log('Returning updated entries:', updatedEntries.length);
    return NextResponse.json(updatedEntries);
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard', details: error.message },
      { status: 500 }
    );
  }
} 