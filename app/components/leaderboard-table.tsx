"use client";

import { useEffect, useState } from 'react';
import { Trophy, ArrowUp, ArrowDown, Minus, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LeaderboardEntry {
  _id: string;
  userId: string;
  name: string;
  coins: number;
  currentRank: number;
  rankChange: 'up' | 'down' | 'same' | null;
}

export function LeaderboardTable() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        console.log('Fetching leaderboard data...');
        const response = await fetch('/api/leaderboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received leaderboard data:', data);
        setEntries(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground">No entries found in the leaderboard</div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted">
              <th className="py-3 px-4 text-left">Rank</th>
              <th className="py-3 px-4 text-left">User</th>
              <th className="py-3 px-4 text-right">Coins</th>
              <th className="py-3 px-4 text-center w-16">Change</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={entry._id}
                className={cn(
                  'border-t transition-colors',
                  entry.rankChange === 'up' && 'bg-green-900/30',
                  entry.rankChange === 'down' && 'bg-red-900/30',
                  index === 0 && 'bg-gradient-to-r from-yellow-900/20 to-transparent',
                  index === 1 && 'bg-gradient-to-r from-gray-700/10 to-transparent',
                  index === 2 && 'bg-gradient-to-r from-amber-800/10 to-transparent'
                )}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <span
                      className={cn(
                        'font-bold',
                        index === 0 && 'text-yellow-400 text-xl',
                        index === 1 && 'text-gray-300 text-lg',
                        index === 2 && 'text-amber-600 text-lg'
                      )}
                    >
                      {entry.currentRank}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="relative">
                      <AvatarFallback>{entry.name[0]}</AvatarFallback>
                      {index === 0 && (
                        <Trophy className="absolute -top-2 -right-2 w-4 h-4 text-yellow-400" />
                      )}
                    </Avatar>
                    <span className="font-medium">{entry.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="font-mono text-yellow-500 font-bold">
                      {entry.coins.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex justify-center">
                    {entry.rankChange === 'up' ? (
                      <ArrowUp className="w-4 h-4 text-green-400" />
                    ) : entry.rankChange === 'down' ? (
                      <ArrowDown className="w-4 h-4 text-red-400" />
                    ) : (
                      <Minus className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 