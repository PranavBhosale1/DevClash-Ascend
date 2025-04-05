import connectToDB from "@/lib/mongodb";
import TimeModel from "@/models/time";

export async function GET(req: Request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date"); // ✅ Ensure date is sent from frontend

    if (!userId || !date) {
      return new Response(JSON.stringify({ error: "User ID and date are required" }), { status: 400 });
    }

    // ✅ Ensure `YYYY-MM-DD` format for querying
    const formattedDate = date.split("T")[0];

    // ✅ Find the record for the given user and date
    const userTime = await TimeModel.findOne({ userId, date: formattedDate });

    if (!userTime) {
      return new Response(JSON.stringify({ learningTime: 0, timestamps: [] }), { status: 200 });
    }

    return new Response(JSON.stringify({ learningTime: userTime.time, timestamps: userTime.timestamps }), { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching time:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDB();
    const { userId, date, time } = await req.json(); // ✅ Extract `date` from request

    if (!userId || time === undefined || !date) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
    }

    // ✅ Ensure we only store `YYYY-MM-DD` format
    const formattedDate = date.split("T")[0];

    // ✅ Find or update the record correctly
    const userTime = await TimeModel.findOneAndUpdate(
      { userId, date: formattedDate },
      { $set: { time, lastUpdated: new Date() } },
      { upsert: true, new: true }
    );

    console.log("✅ Updated time in MongoDB:", userTime);

    return new Response(JSON.stringify({ success: true, userTime }), { status: 200 });
  } catch (error) {
    console.error("❌ Error saving time:", error);
    return new Response(JSON.stringify({ error: "Failed to update MongoDB" }), { status: 500 });
  }
}
