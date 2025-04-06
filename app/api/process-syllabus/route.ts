import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as os from 'os';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Define the API route for POST requests
export async function POST(request: NextRequest) {
  let tempFilePath = null;
  
  try {
    console.log("API: Process syllabus request received");
    
    // Get form data from the request
    const formData = await request.formData();
    const file = formData.get("file");
    console.log("📁 File received:", file);
    
    if (!file || !(file instanceof File) || file.size === 0) {
      console.error("API: Invalid file received");
      return NextResponse.json({ error: "No valid file provided" }, { status: 400 });
    }

    console.log(`API: File received - Name: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);

    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'pdf' && fileType !== 'docx') {
      console.error(`API: Unsupported file type: ${fileType}`);
      return NextResponse.json({ error: "Only PDF and DOCX files are supported" }, { status: 400 });
    }

    // Create a temporary directory
    const tempDir = join(os.tmpdir(), 'syllabus-processing');
    await fs.mkdir(tempDir, { recursive: true }).catch(err => {
      console.error("API: Error creating temp directory:", err);
      // Continue even if directory already exists
    });

    console.log(`API: Using temp directory at ${tempDir}`);

    // Generate a unique filename
    const uniqueFilename = `${uuidv4()}.${fileType}`;
    tempFilePath = join(tempDir, uniqueFilename);

    // Save the file
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(tempFilePath, buffer);
      console.log(`API: File saved to ${tempFilePath}`);
    } catch (err) {
      console.error("API: Error saving file:", err);
      return NextResponse.json({ error: "Failed to save uploaded file" }, { status: 500 });
    }
    
    // Use a simplified approach: directly extract and summarize the text
    try {
      // Get the script path
      const scriptPath = join(process.cwd(), 'backend', 'pdf-syllabus.py');
      
      try {
        await fs.access(scriptPath);
        console.log(`API: Script found at ${scriptPath}`);
      } catch (err) {
        console.error(`API: Script not found at ${scriptPath}:`, err);
        return NextResponse.json({ 
          error: `Python script not found at ${scriptPath}. Please check if the file exists.`
        }, { status: 500 });
      }

      // Execute the Python script with the file path
      const pythonCommand = process.platform === 'win32' 
        ? `python "${scriptPath}" "${tempFilePath}"`
        : `python3 "${scriptPath}" "${tempFilePath}"`;
      console.log(`API: Executing command: ${pythonCommand}`);
      
      try {
        console.log("API: Starting Python script execution...");
        const { stdout, stderr } = await execPromise(pythonCommand, { timeout: 90000 }); // Increase timeout to 90 seconds
        
        console.log("API: Python script finished execution");
        console.log("API: Python script executed with stdout length:", stdout.length);
        console.log("API: Python script stderr:", stderr || "No stderr output");
        
        if (stdout.length > 0) {
          console.log("API: First 500 chars of stdout:", stdout.substring(0, 500));
        } else {
          console.log("API: Warning - Empty stdout received");
        }
        
        // Check if stderr contains errors (ignore warnings)
        if (stderr && !stderr.includes("Warning") && stderr.length > 0) {
          console.error("API: Python script error:", stderr);
          return NextResponse.json({ 
            error: stderr,
            fallbackSummary: `File: ${file.name}. The system encountered an error while processing this file.` 
          }, { status: 500 });
        }
        
        // Try to get the summary from stdout
        const summaryMatch = stdout.match(/Final Summary:\n\n([\s\S]*)/);
        
        if (!summaryMatch || !summaryMatch[1] || summaryMatch[1].trim().length === 0) {
          console.error("API: Failed to extract summary from output");
          
          // Return a fallback summary instead of failing
          return NextResponse.json({ 
            success: true, 
            summary: `File processed: ${file.name}. The system was unable to extract detailed content from this file format. Your learning path will be created using the filename and basic information.`
          });
        }
        
        const summary = summaryMatch[1].trim();
        console.log(`API: Successfully extracted summary (${summary.length} chars)`);
        
        return NextResponse.json({ 
          success: true, 
          summary: summary 
        });
        
      } catch (execError: any) {
        console.error("API: Error executing Python script:", execError);
        
        // Check for specific errors
        const errorMessage = execError.message || "";
        if (errorMessage.includes("ENOENT")) {
          console.error("API: Python executable not found. Check if Python is installed.");
          return NextResponse.json({ 
            error: "Python is not installed or not in PATH",
            fallbackSummary: `File: ${file.name}. Processing error: Python environment issue.`
          }, { status: 500 });
        }
        
        if (errorMessage.includes("timed out")) {
          console.error("API: Python script execution timed out");
          return NextResponse.json({ 
            error: "Processing timed out - file may be too large or complex",
            fallbackSummary: `File: ${file.name}. Processing timed out. The file may be too large or complex.`
          }, { status: 500 });
        }
        
        // Fallback - always return a usable response even on error
        return NextResponse.json({ 
          success: true,
          summary: `File processed: ${file.name}. Limited information could be extracted due to processing constraints. Your learning path will be created using the filename and basic information.`
        });
      }
      
    } catch (execError: any) {
      console.error("API: Error processing file:", execError);
      return NextResponse.json({ 
        error: `Error processing file: ${execError.message}`
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error("API: Error in main processing:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to process file"
    }, { status: 500 });
  } finally {
    // Clean up temp file
    if (tempFilePath) {
      fs.unlink(tempFilePath).catch(e => console.error("API: Error deleting temp file:", e));
    }
  }
} 