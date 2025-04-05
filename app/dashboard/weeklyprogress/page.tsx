'use client';

import { LearningGraph } from "@/components/LearningGraph";

export default function WeeklyProgressPage() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Weekly Learning Progress</h2>
      <LearningGraph />
    </div>
  );
}
