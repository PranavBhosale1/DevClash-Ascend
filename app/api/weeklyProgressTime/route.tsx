import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import TimeModel from "@/models/time";

export async function GET(req: Request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get date range for the past year
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);

    console.log(`Fetching data for user ${userId} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Fetch data from MongoDB
    const timeData = await TimeModel.find({
      userId,
      date: {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0]
      }
    });

    console.log(`Found ${timeData.length} time entries`);

    // Format data for LearningGraph component
    const formattedData = timeData.map(entry => ({
      date: entry.date,
      time: entry.time || 0
    }));

    console.log('Returning formatted data:', formattedData);
    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching activity data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
