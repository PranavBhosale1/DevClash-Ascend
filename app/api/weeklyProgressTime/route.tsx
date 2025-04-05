import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import TimeModel from "@/models/time";

export async function GET(req: Request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const roadmapId = searchParams.get("roadmapId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get date range for the past week (7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    console.log(`Fetching time data for user ${userId} from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    console.log(`Roadmap filter: ${roadmapId || 'None'}`);

    // Build query based on parameters
    const query: any = {
      userId,
      date: {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0]
      }
    };
    
    // Add roadmap filter if specified
    if (roadmapId) {
      query.roadmapId = roadmapId;
    }

    // Fetch data from MongoDB
    const timeData = await TimeModel.find(query);

    console.log(`Found ${timeData.length} time entries`);

    // Format data for LearningGraph component
    const formattedData = timeData.map(entry => ({
      date: entry.date,
      time: entry.time || 0
    }));

    // Combine entries for the same date by summing the time
    const combinedData = formattedData.reduce((acc: any[], entry) => {
      const existingEntry = acc.find(item => item.date === entry.date);
      
      if (existingEntry) {
        existingEntry.time += entry.time;
      } else {
        acc.push({ ...entry });
      }
      
      return acc;
    }, []);

    // Order by date
    combinedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log('Returning formatted data:', combinedData);
    return NextResponse.json(combinedData, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching activity data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
