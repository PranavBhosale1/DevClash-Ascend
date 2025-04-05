import { NextResponse } from 'next/server';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import path from 'path';

const exec = promisify(execCallback);

export async function POST(request: Request) {
    try {
        console.log('✅ Request received');  // Debug log

        const { videoUrl }: { videoUrl: string } = await request.json();
        console.log('📌 Video URL:', videoUrl);  // Debug log

        if (!videoUrl) {
            console.error('❌ Error: Video URL is required');
            return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
        }

        const videoId = new URL(videoUrl).searchParams.get("v");
        console.log('📌 Video ID:', videoId);  // Debug log

        if (!videoId) {
            console.error('❌ Error: Invalid YouTube URL');
            return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
        }

        const scriptPath = path.resolve('./scripts/get_transcript.py');
        console.log('📂 Script Path:', scriptPath);  // Debug log

        try {
            const { stdout, stderr } = await exec(`python ${scriptPath} ${videoId}`);
            console.log('📄 stdout:', stdout);  // Debug log
            if (stderr) {
                console.error('⚠️ stderr:', stderr);
                return NextResponse.json({ error: `Error fetching transcript: ${stderr}` }, { status: 500 });
            }

            const transcript = JSON.parse(stdout);
            return NextResponse.json({ transcript }, { status: 200 });

        } catch (execError: any) {
            console.error('❌ Exec Error:', execError.message);
            return NextResponse.json({ error: 'Error executing Python script: ' + execError.message }, { status: 500 });
        }

    } catch (error: any) {
        console.error('❌ Unexpected Error:', error.message);
        return NextResponse.json({ error: 'An unexpected error occurred: ' + error.message }, { status: 500 });
    }
}
