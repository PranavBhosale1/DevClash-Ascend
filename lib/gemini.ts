// This is a mock implementation for Gemini AI integration
// In a real application, this would connect to the Gemini API

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { supabase } from "@/lib/supabase";
import mongoose from 'mongoose';



// Define interfaces for the learning path structure
export interface LearningResource {
  id?: string;
  title: string;
  type?: string;
  resourceType?: string;
  url?: string;
  content?: string;
  description: string;
  difficultyLevel?: string;
  estimatedTime?: number;
}

export interface LearningModule {
  id?: string;
  title: string;
  description: string;
  duration?: string;
  resources: LearningResource[];
  position?: number;
}

export interface LearningPath {
  id?: string;
  title: string;
  skill?: string[];
  description?: string;
  time?: string;
  modules: LearningModule[];
}

export interface GeminiGenerateParams {
  skill: string;
  time: string;
  userId: string;
  roadmapId: string;
}

// Add these types at the top of your file where other interfaces are defined
export interface TopicWithQueries {
  name: string;
  queries: string[];
  links?: string[][];
}

// Check if Gemini API key is configured and valid
export async function checkGeminiConfig(): Promise<{ 
  hasKey: boolean;
  isValid: boolean;
  modelVersion: string;
}> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      return { hasKey: false, isValid: false, modelVersion: 'none' };
    }
    
    // Initialize the Google AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Test with a simple prompt
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Simple validation check
    const result = await model.generateContent("Say 'API key is valid' if you can read this.");
    const text = result.response.text();
    
    return { 
      hasKey: true, 
      isValid: text.includes('API key is valid'), 
      modelVersion: 'gemini-2.0-flash'
    };
  } catch (error) {
    console.error("Error checking Gemini API key:", error);
    return {
      hasKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      isValid: false,
      modelVersion: 'gemini-2.0-flash'
    };
  }
}

// Generate a learning path using Gemini
export async function generateLearningPath(
  prompt: string,
  skill:string,
  customHours: string,
  creator: string,
  userId?: string,
  roadmapId?: string,
 
): Promise<LearningPath> {
  console.log('=== STARTING LEARNING PATH GENERATION ===');


  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not found. Check your environment variables.");
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
   
    // Define the prompt properly
    

    console.log('Making API call to Gemini...');
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      ],
      generationConfig: {
        temperature: 1.0,
        topK: 150,
        topP: 1.0,
        maxOutputTokens: 100000,
      },
    });

    if (!result.response) {
      throw new Error('No response received from Gemini API');
    }

    const textResponse = await result.response.text();
    console.log('Raw response:', textResponse);

    // Process the response
    const cleanedString = textResponse.replace(/\\"/g, '"').replace(/\\n/g, '\n');
    
    console.log('Extracting topics and queries...');
    const topicMatches = [...cleanedString.matchAll(/Topic Name:\s*(.*?)(?=\n|$)/g)];
    const topics = topicMatches.map(match => match[1].trim());
    
    console.log(`Found ${topics.length} topics:`, topics);

    const searchQueries = cleanedString.match(/To search: "([^"]+)"/g)?.map(item => 
      item.match(/To search: "(.*?)"/)?.[1] || ''
    ) || [];
    
    // Append creator to each search query
    searchQueries.push(`of ${creator}`);
    console.log(`Found ${searchQueries.length} search queries:`, searchQueries);

    let results: TopicWithQueries[] = [];
    let queryIndex = 0;

    topics.forEach((topic, i) => {
      let queries = [];
      while (queryIndex < searchQueries.length) {
        if (i < topics.length - 1 && cleanedString.indexOf(topics[i + 1]) < cleanedString.indexOf(searchQueries[queryIndex])) {
          break;
        }
        queries.push(searchQueries[queryIndex]);
        queryIndex++;
      }
      results.push({ name: topic, queries });
    });

    console.log('Processed results:', results);

    // Save to MongoDB if IDs are provided
      if (userId && roadmapId) {
      console.log('Saving to MongoDB...');
      try {
        await saveToMongoDB(results, roadmapId, userId);
        console.log('Successfully saved to MongoDB');
      } catch (error) {
        console.error('Failed to save to MongoDB:', error);
      }
    }

    const learningPath: LearningPath = {
      title: `Learning Path for ${Array.isArray(skill) ? skill.join(', ') : skill}`,
      skill: Array.isArray(skill) ? skill : [skill],
      description: `A comprehensive learning path for ${Array.isArray(skill) ? skill.join(', ') : skill}`,
      time: customHours,
      modules: results.map((result, index) => ({
        id: `module-${index}`,
        title: result.name,
        description: `Learning resources for ${result.name}`,
        position: index,
        resources: result.queries.map((query: string, queryIndex: number) => ({
          id: `resource-${index}-${queryIndex}`,
          title: query,
          description: `Search query: ${query}`,
          resourceType: 'video',
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
          difficultyLevel: index === 0 ? 'beginner' : 
                          index === results.length - 1 ? 'advanced' : 
                          'intermediate',
          estimatedTime: 30
        }))
      }))
    };

    console.log('=== LEARNING PATH GENERATION COMPLETE ===');
    return learningPath;

  } catch (error) {
    console.error('=== ERROR IN LEARNING PATH GENERATION ===');
    console.error('Error details:', error);
    throw error;
  }
}

// Save to MongoDB instead of Supabase
async function saveToMongoDB(processedData: TopicWithQueries[], roadmapId: string, userId: string) {
  console.log('=== SAVING TO MONGODB ===');
  try {
    // Check if we should skip YouTube API calls due to quota limits or errors
    let skipYouTubeAPI = process.env.NEXT_PUBLIC_SKIP_YOUTUBE_API === 'true';
    
    // TEST PHASE: Try 1-2 YouTube API calls first to verify the API key works
    if (!skipYouTubeAPI) {
      console.log('Testing YouTube API with 1-2 queries first...');
      
      // Take a sample query from the data
      const sampleTopic = processedData[0];
      const sampleQuery = sampleTopic?.queries?.[0];
      
      if (sampleQuery) {
        try {
          console.log(`Testing YouTube API with sample query: "${sampleQuery}"`);
          const testResult = await fetchYouTubeLink(sampleQuery);
          
          if (testResult.length > 0 && !testResult[0].includes('dQw4w9WgXcQ')) {
            console.log('✅ YouTube API test successful! Proceeding with all queries.');
          } else {
            console.warn('⚠️ YouTube API test returned mock data. Using mock data for all queries.');
            // Update local variable instead of process.env
            skipYouTubeAPI = true;
          }
        } catch (error) {
          console.error('❌ YouTube API test failed:', error);
          // Update local variable instead of process.env
          skipYouTubeAPI = true;
        }
      }
    }
    
    // MAIN PHASE: Process all topics based on test results
    console.log('Fetching YouTube links for queries...');
    
    // Use the local variable
    const finalSkipYouTubeAPI = skipYouTubeAPI;
    
    let processedTopicsWithLinks;
    
    if (finalSkipYouTubeAPI) {
      console.log('Using mock YouTube links for all queries');
      // Create mock links instead
      processedTopicsWithLinks = processedData.map(topic => ({
        ...topic,
        links: (topic.queries || []).map(query => getMockYouTubeLinks(query))
      }));
    } else {
      try {
        // Only process first few days/topics for initial testing
        const limitTopics = true; // Set to false to process all topics
        const topicsToProcess = limitTopics ? processedData.slice(0, 2) : processedData;
        
        if (limitTopics) {
          console.log(`⚠️ TESTING MODE: Only processing first ${topicsToProcess.length} topics`);
        }
        
        processedTopicsWithLinks = await processTopics(topicsToProcess);
        
        // If we're in testing mode, add mock data for the rest
        if (limitTopics && processedData.length > topicsToProcess.length) {
          const remainingTopics = processedData.slice(topicsToProcess.length).map(topic => ({
            ...topic,
            links: (topic.queries || []).map(query => getMockYouTubeLinks(query))
          }));
          
          processedTopicsWithLinks = [...processedTopicsWithLinks, ...remainingTopics];
          console.log(`Added mock data for remaining ${remainingTopics.length} topics`);
        }
      } catch (error) {
        console.error('Error processing topics for YouTube links:', error);
        // Fallback to mock links
        processedTopicsWithLinks = processedData.map(topic => ({
          ...topic,
          links: (topic.queries || []).map(query => getMockYouTubeLinks(query))
        }));
      }
    }
    
    // Create proper API URL for Next.js app
    const apiUrl = '/api/roadmaps/save';
    
    console.log('Making API request to:', apiUrl);
    
    const topicsToSave = processedTopicsWithLinks.map((topic, index) => ({
      name: topic.name,
      queries: topic.queries,
      links: topic.links || [],
      day: index + 1,
      position: index
    }));
    
    // Instead of directly connecting to MongoDB from the client, use an API route
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roadmapId,
        userId,
        title: `Roadmap ${roadmapId}`,
        description: `Generated roadmap with ${processedData.length} topics`,
        topics: topicsToSave
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      throw new Error(errorData.message || `Failed to save to MongoDB: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('API Response:', result);
    
    console.log('=== SUCCESSFULLY SAVED TO MONGODB ===');
    return true;
  } catch (error) {
    console.error('=== ERROR SAVING TO MONGODB ===');
    console.error('Error details:', error);
    return false;
  }
}

// Fetch YouTube links for each query
async function fetchYouTubeLink(query: string): Promise<string[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "AIzaSyARjEHDfb4VdEpGE00zXYJqlmNzSsidKn4";
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${apiKey}&maxResults=5`;
    
    console.log(`Fetching YouTube links for query: "${query}"`);
    
    const response = await fetch(searchUrl);
    
    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`YouTube API error (${response.status}): ${errorText}`);
      return getMockYouTubeLinks(query);
    }
    
    const data = await response.json();
    
    // Check if items exists and is not empty
    if (!data.items || data.items.length === 0) {
      console.warn(`No YouTube results found for query: "${query}"`);
      return getMockYouTubeLinks(query);
    }
    
    // Extract video IDs from the search response
    const videoIds = data.items.map((item: any) => item.id.videoId).join(",");
    
    if (!videoIds) {
      console.warn(`No valid video IDs found for query: "${query}"`);
      return getMockYouTubeLinks(query);
    }
    
    // Fetch video details to get duration
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`;
    const detailsResponse = await fetch(detailsUrl);
    
    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text();
      console.error(`YouTube API details error (${detailsResponse.status}): ${errorText}`);
      return getMockYouTubeLinks(query);
    }
    
    const detailsData = await detailsResponse.json();
    
    if (!detailsData.items || detailsData.items.length === 0) {
      console.warn(`No YouTube video details found for query: "${query}"`);
      return getMockYouTubeLinks(query);
    }
    
    let validVideos: string[] = [];
    
    // Filter videos that are 5 minutes or longer
    for (const video of detailsData.items) {
      if (!video.contentDetails || !video.contentDetails.duration) continue;
      
      const duration = video.contentDetails.duration; // Example: "PT21M45S"
      const match = duration.match(/PT(\d+)M(\d+)?S?/);
      
      if (!match) continue;
      
      const minutes = parseInt(match[1]) || 0;
      if (minutes >= 5) { // Filter for videos at least 5 minutes long
        validVideos.push(`https://www.youtube.com/watch?v=${video.id}`);
      }
    }
    
    if (validVideos.length === 0) {
      console.warn(`No valid videos (5+ min) found for query: "${query}"`);
      return getMockYouTubeLinks(query);
    }
    
    console.log(`Found ${validVideos.length} valid YouTube videos for query: "${query}"`);
    return validVideos;
  } catch (error) {
    console.error("Error fetching YouTube links:", error);
    return getMockYouTubeLinks(query);
  }
}

// Generate mock YouTube links for when the API fails
function getMockYouTubeLinks(query: string): string[] {
  console.log(`Using mock YouTube links for query: "${query}"`);
  
  // Return actual YouTube links for common DSA topics
  const encodedQuery = encodeURIComponent(query);
  
  // Generate 2-3 links based on the query
  return [
    `https://www.youtube.com/watch?v=0IAPZzGSbME&q=${encodedQuery}`, // Generic programming video 1
    `https://www.youtube.com/watch?v=8hly31xKli0&q=${encodedQuery}`, // Generic programming video 2
    `https://www.youtube.com/watch?v=RBSGKlAvoiM&q=${encodedQuery}`  // Generic programming video 3
  ];
}

async function processTopics(topicsData: TopicWithQueries[]): Promise<Array<TopicWithQueries & { links: string[][] }>> {
  const newFormat = [];
  let processedCount = 0;
  const totalTopics = topicsData.length;
   // Use the global variable

  console.log(`Processing ${totalTopics} topics to fetch YouTube links...`);

  for (const topic of topicsData) {
    processedCount++;
    const topicName = topic.name;
    const queries = topic.queries || [];
    const links: string[][] = [];

    console.log(`[${processedCount}/${totalTopics}] Processing topic: "${topicName}" with ${queries.length} queries`);

    // Fetch YouTube links for each query
    for (const query of queries) {
      try {
        const videoLinks = await fetchYouTubeLink(query);
        links.push(videoLinks);
      } catch (error) {
        console.error(`Error processing query "${query}":`, error);
        // Add mock links as fallback
        links.push(getMockYouTubeLinks(query));
      }
    }

    // Push formatted data
    newFormat.push({
      name: topicName,
      queries: queries,
      links: links
    });

    // Log progress
    if (processedCount % 5 === 0 || processedCount === totalTopics) {
      console.log(`Progress: ${processedCount}/${totalTopics} topics processed (${Math.round(processedCount/totalTopics*100)}%)`);
    }
  }

  console.log(`Completed processing ${totalTopics} topics with YouTube links`);
  return newFormat;
}

// Fallback to mock data if API key is missing or an error occurs
function getMockLearningPath(skill: string[] | string, time: string): LearningPath {
  // Normalize skill to array
  const skillsArray = Array.isArray(skill) ? skill : [skill];
  
  return {
    title: `Learning Path for ${skillsArray.join(' & ')}`,
    skill: skillsArray,
    description: `A comprehensive learning path to master ${skillsArray.join(', ')} in ${time}`,
    time: time,
    modules: [
      {
        id: "module-0",
        title: "Fundamentals",
        description: "Core concepts and basics",
        duration: "30% of your time commitment",
        position: 0,
        resources: [
          {
            id: "resource-0-0",
            title: "Getting Started Guide",
            description: "Comprehensive introduction to the fundamentals",
            resourceType: "article",
            url: "https://example.com/guide",
            difficultyLevel: "beginner",
            estimatedTime: 30
          },
          {
            id: "resource-0-1",
            title: "Basic Concepts Video Course",
            description: "Visual explanations of core concepts",
            resourceType: "video",
            url: "https://example.com/videos",
            difficultyLevel: "beginner",
            estimatedTime: 30
          }
        ]
      },
      {
        id: "module-1",
        title: "Intermediate Concepts",
        description: "Building on the basics",
        duration: "40% of your time commitment",
        position: 1,
        resources: [
          {
            id: "resource-1-0",
            title: "Intermediate Tutorials",
            description: "Detailed tutorials on intermediate topics",
            resourceType: "course",
            url: "https://example.com/intermediate",
            difficultyLevel: "intermediate",
            estimatedTime: 40
          },
          {
            id: "resource-1-1",
            title: "Practice Project",
            description: "Hands-on project to apply your knowledge",
            resourceType: "project",
            url: "https://example.com/project",
            difficultyLevel: "intermediate",
            estimatedTime: 40
          }
        ]
      },
      {
        id: "module-2",
        title: "Advanced Applications",
        description: "Taking your skill to the next level",
        duration: "30% of your time commitment",
        position: 2,
        resources: [
          {
            id: "resource-2-0",
            title: "Advanced Techniques",
            description: "In-depth exploration of advanced topics",
            resourceType: "article",
            url: "https://example.com/advanced",
            difficultyLevel: "advanced",
            estimatedTime: 30
          },
          {
            id: "resource-2-1",
            title: "Real-world Application",
            description: "Build a comprehensive application using your skill",
            resourceType: "project",
            url: "https://example.com/application",
            difficultyLevel: "advanced",
            estimatedTime: 30
          }
        ]
      }
    ]
  };
}


// lib/gemini.ts



const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateResponseFromTranscript(transcript: string) {
  console.log("Starting generateResponseFromTranscript...");
  try {
    const prompt = `Generate notes for the following transcript in points: ${transcript}`;
    console.log("Prompt generated:", prompt);

    console.log("Sending prompt to Gemini...");
    const result = await model.generateContent(prompt);
    console.log("Gemini response received.");

    const response = await result.response;
    console.log("Extracted response object.");

    const text = response.text();
    console.log("Extracted response text:", text);

    console.log("generateResponseFromTranscript completed successfully.");
    return text;
  } catch (error) {
    console.error("Error in generateResponseFromTranscript:", error);
    console.error("Error Details:", error); // Log the full error object for debugging
    console.log("generateResponseFromTranscript failed.");
    return "An error occurred while generating the response."; // Or throw error
  }
}