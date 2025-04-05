import { LeaderboardTable } from '@/components/leaderboard-table';

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
          Leaderboard
        </h1>
        <LeaderboardTable />
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Leaderboard updates every 5 seconds</p>
        </div>
      </div>
    </div>
  );
} 