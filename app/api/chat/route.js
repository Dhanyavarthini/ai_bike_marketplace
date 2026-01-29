import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { getBikesContext, getUserBookingsContext, generateSystemPrompt, formatBikesForContext } from "@/lib/chatbot-utils";

export async function POST(request) {
  try {
    const { messages, searchQuery } = await request.json();

    if (!messages || messages.length === 0) {
      return Response.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    // Get user context
    let userId = null;
    try {
      const session = await auth();
      userId = session?.userId;
    } catch (authError) {
      console.warn("Auth error (continuing without auth):", authError.message);
      // Continue without user context if auth fails
    }

    // Fetch bikes context for the chatbot
    let bikesContext = null;
    try {
      bikesContext = await getBikesContext(searchQuery);
    } catch (dbError) {
      console.warn("Error fetching bikes context:", dbError.message);
      // Continue without bike context if database fails
    }

    let userContext = null;
    if (userId) {
      try {
        userContext = await getUserBookingsContext(userId);
      } catch (dbError) {
        console.warn("Error fetching user bookings:", dbError.message);
        // Continue without user context if database fails
      }
    }

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: generateSystemPrompt({ userId }),
    });

    // Format messages for Gemini
    const chatHistory = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Validate and filter chat history - must start with user and alternate
    let validHistory = [];
    for (const msg of chatHistory.slice(0, -1)) {
      if (validHistory.length === 0 && msg.role !== "user") {
        continue;
      }
      validHistory.push(msg);
    }

    // Get the last message from the user
    const lastMessage = chatHistory[chatHistory.length - 1];

    // Build context for the request
    let contextualMessage = lastMessage.parts[0].text;
    if (bikesContext && bikesContext.length > 0) {
      contextualMessage = `[Available Bikes]: ${formatBikesForContext(bikesContext)}\n\nUser Query: ${contextualMessage}`;
    }

    // Create chat session with validated history
    const chat = model.startChat({
      history: validHistory,
    });

    // Send the message with context and get response
    const result = await chat.sendMessage(contextualMessage);
    const responseText = result.response.text();

    return Response.json({
      role: "assistant",
      content: responseText,
    });

  } catch (error) {
    console.error("Chat API error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return Response.json(
      { 
        error: "Failed to process chat message", 
        details: error.message,
        type: error.name,
      },
      { status: 500 }
    );
  }
}
