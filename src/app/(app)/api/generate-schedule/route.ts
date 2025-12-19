/*
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Initialize Gemini using environment key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic input validation
    if (!body.classes || !Array.isArray(body.classes) || body.classes.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing class data." },
        { status: 400 }
      );
    }

    // Prompt generation
    const prompt = `
You are an expert AI academic planner and time management coach. 
Create a detailed, realistic, hour-by-hour weekly study schedule for a college student, optimized for learning and productivity.

Guidelines:
- Each study session should:
  - Include realistic time blocks (morning, afternoon, evening)
  - Be subject-specific and task-focused (e.g., "Review algorithms for CPSC 335," "Solve practice problems for MATH 338," "Work on project for CPSC 491")
  - Include a variety of activities: note review, problem-solving, reading, coding, rest, and short breaks
  - Avoid overlapping with class times
  - Balance workload fairly across the week to prevent burnout
  - Prioritize more difficult or upcoming assignments/exams earlier in the week

- Clearly format each day with time intervals (e.g., 8:00–9:00, 9:00–10:30)
- Include optional tips for effective study during each session (e.g., "Focus on key definitions," "Use Pomodoro technique," "Work on past exam questions")

Classes and schedule information:
${body.classes
  .map(
    (c: any) =>
      `📘 ${c.name} — ${c.days} (${c.startTime} to ${c.endTime})`
  )
  .join("\n")}

Additional context:
- Consider the typical difficulty and workload for each course
- Include tasks tailored to what students actually need to do for each class (projects, coding exercises, problem sets, readings, review)
- Ensure breaks, meals, and rest periods are realistic for a full week

Generate the schedule in a clear, structured format (Markdown or plain text) that can be easily followed.
`;


    // ✅ Use the correct Gemini model
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    // ✅ Generate the schedule
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({
      schedule: text || "No schedule could be generated.",
    });
  } catch (error: any) {
    console.error("❌ Gemini generation error:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "An error occurred while generating the schedule.",
      },
      { status: 500 }
    );
  }
}
*/


/*
import { NextResponse } from "next/server"; 
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Initialize Gemini using environment key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function generateWithRetry(model: any, prompt: string, maxRetries = 3) {
  let attempt = 0;
  let waitTime = 15000; // initial wait 15s

  while (attempt < maxRetries) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      // Handle quota exceeded / 429 errors
      if (error.message?.includes("quota") || error.message?.includes("429")) {
        attempt++;
        const retryAfter = error?.retryDelay ? parseInt(error.retryDelay) * 1000 : waitTime;
        console.warn(`⚠️ Quota limit reached. Retry attempt ${attempt} in ${retryAfter / 1000}s.`);
        await new Promise(res => setTimeout(res, retryAfter));
        waitTime *= 2; // exponential backoff
      } else {
        throw error; // re-throw other errors
      }
    }
  }

  throw new Error("Failed to generate content after multiple retries due to quota limits.");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic input validation
    if (!body.classes || !Array.isArray(body.classes) || body.classes.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing class data." },
        { status: 400 }
      );
    }

    // Prompt generation
    const prompt = `
You are an expert AI academic planner and time management coach. 
Create a detailed, realistic, hour-by-hour weekly study schedule for a college student, optimized for learning and productivity.

Guidelines:
- Each study session should:
  - Include realistic time blocks (morning, afternoon, evening)
  - Be subject-specific and task-focused (e.g., "Review algorithms for CPSC 335," "Solve practice problems for MATH 338," "Work on project for CPSC 491")
  - Include a variety of activities: note review, problem-solving, reading, coding, rest, and short breaks
  - Avoid overlapping with class times
  - Balance workload fairly across the week to prevent burnout
  - Prioritize more difficult or upcoming assignments/exams earlier in the week

- Clearly format each day with time intervals (e.g., 8:00–9:00, 9:00–10:30)
- Include optional tips for effective study during each session (e.g., "Focus on key definitions," "Use Pomodoro technique," "Work on past exam questions")

Classes and schedule information:
${body.classes
  .map(
    (c: any) =>
      `📘 ${c.name} — ${c.days} (${c.startTime} to ${c.endTime})`
  )
  .join("\n")}

Additional context:
- Consider the typical difficulty and workload for each course
- Include tasks tailored to what students actually need to do for each class (projects, coding exercises, problem sets, readings, review)
- Ensure breaks, meals, and rest periods are realistic for a full week

Generate the schedule in a clear, structured format (Markdown or plain text) that can be easily followed.
`;

    // ✅ Use the correct Gemini model
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    // ✅ Generate the schedule with retry for quota errors
    const text = await generateWithRetry(model, prompt);

    return NextResponse.json({
      schedule: text || "No schedule could be generated.",
    });
  } catch (error: any) {
    console.error("❌ Gemini generation error:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "An error occurred while generating the schedule.",
      },
      { status: 500 }
    );
  }
}
*/



/* Code that calls the API 3 times ONLY
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Initialize Gemini using environment key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Retry Gemini calls on quota (429) and overload (503)
 

async function generateWithRetry(
  model: any,
  prompt: string,
  maxRetries = 3
): Promise<string> {
  let attempt = 0;
  let delay = 15_000; // 15 seconds

  while (attempt < maxRetries) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      const msg = error?.message || "";

      if (
        msg.includes("429") ||
        msg.includes("quota") ||
        msg.includes("503") ||
        msg.includes("overloaded")
      ) {
        attempt++;
        console.warn(
          `⚠️ Gemini busy (attempt ${attempt}/${maxRetries}). Retrying in ${
            delay / 1000
          }s`
        );
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2; // exponential backoff
      } else {
        throw error; // unknown error
      }
    }
  }

  throw new Error(
    "AI service is temporarily unavailable. Please try again later."
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Basic input validation
    if (!body.classes || !Array.isArray(body.classes) || body.classes.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing class data." },
        { status: 400 }
      );
    }

    // ✅ Prompt generation (course-aware + realistic)
    const prompt = `
You are an expert AI academic planner and time management coach.

Create a realistic, hour-by-hour weekly study schedule for a college student.
Assume you understand what each course typically requires (projects, exams, homework, labs, reading, coding).

Guidelines:
- Do NOT overlap with class meeting times
- Balance workload across the week
- Prioritize harder or project-heavy courses
- Include breaks, meals, and rest
- Vary activities (review, practice, reading, coding, planning)

Format:
- Clearly label each day
- Use time blocks (e.g., 9:00–10:30)
- Keep it easy to follow

Classes:
${body.classes
  .map(
    (c: any) =>
      `📘 ${c.name} — ${c.days} (${c.startTime} to ${c.endTime})`
  )
  .join("\n")}

Generate the schedule in clean, readable Markdown.
`;

    // ✅ Correct Gemini model
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    // ✅ SAFE generation (fixes your 503 error)
    const text = await generateWithRetry(model, prompt);

    return NextResponse.json({
      schedule: text || "No schedule could be generated.",
    });
  } catch (error: any) {
    console.error("❌ Gemini Schedule Error:", error);

    return NextResponse.json(
      {
        error:
          error.message ||
          "The AI service is temporarily unavailable. Please try again later.",
      },
      { status: 503 }
    );
  }
}

*/

//Code that calls the API once and then resorts to mock ai
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Single API call function
async function callGeminiOnce(model: any, prompt: string): Promise<string> {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// Mock AI fallback
function generateMockSchedule(
  classes: { name: string; days: string; startTime: string; endTime: string }[]
): string {
  return classes
    .map((cls) => {
      const name = cls.name.trim() || "Unnamed Class";
      const days = cls.days || "Mon–Fri";
      const start = cls.startTime || "09:00 AM";
      const end = cls.endTime || "10:30 AM";

      return `
### 📘 ${name} (${days} ${start}–${end})

**Morning:** Review key concepts and practice problems for ${name}. Include wildfire safety awareness tips, such as safe study breaks and outdoor safety if applicable.  
**Late Morning:** Work on assignments, labs, or coding exercises. Relate examples to real-world scenarios, including environmental awareness or fire prevention.  
**Afternoon:** Take a healthy break. Read about wildfire prevention, emergency preparedness, and safety protocols.  
**Late Afternoon:** Continue studying ${name} with active problem solving or case studies. Include reflection on wildfire lessons if relevant.  
**Evening:** Summarize the day's learning. Note key insights and how wildfire safety knowledge applies to daily life.

💡 **Tip:** Understanding wildfires is crucial. Incorporate safe practices, environmental awareness, and disaster readiness wherever possible.
`;
    })
    .join("\n\n---\n\n");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Input validation
    if (!body.classes || !Array.isArray(body.classes) || body.classes.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one class with name, days, and times." },
        { status: 400 }
      );
    }

    const prompt = `
You are an AI academic planner and time management assistant.
Create a detailed weekly study schedule for a college student using their exact class info.

Guidelines:
- Use the exact class names, days, and times provided
- Include breaks, meals, varied study sessions
- Incorporate wildfire awareness and safety tips
- Make it visually appealing, easy to read, and fun

Classes:
${body.classes
      .map(
        (c: any) =>
          `📘 ${c.name} — ${c.days} (${c.startTime} to ${c.endTime})`
      )
      .join("\n")}
`;

    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    let scheduleText: string;

    try {
      // SINGLE Gemini API call
      scheduleText = await callGeminiOnce(model, prompt);
    } catch (error) {
      console.warn("⚠️ Gemini unavailable, using mock AI.");
      // fallback to mock AI
      scheduleText = generateMockSchedule(body.classes);
    }

    return NextResponse.json({
      schedule: scheduleText || "No schedule could be generated.",
    });
  } catch (error: any) {
    console.error("❌ Schedule generation error:", error);

    return NextResponse.json(
      {
        error:
          error.message ||
          "The service is temporarily unavailable. Please try again later.",
      },
      { status: 503 }
    );
  }
}
