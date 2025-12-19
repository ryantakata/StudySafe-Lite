/*
import { NextRequest, NextResponse } from "next/server";
import { generateNotesFlow } from "@/ai/flows/generate-notes-flow"; // Adjust path

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    if (!body.classes || !Array.isArray(body.classes)) {
      return NextResponse.json(
        { error: "Invalid request: 'classes' array is required" },
        { status: 400 }
      );
    }

    // Call AI flow
    const notesResult = await generateNotesFlow({ classes: body.classes });

    if (!notesResult?.notes) {
      return NextResponse.json(
        { error: "AI failed to generate notes" },
        { status: 500 }
      );
    }

    return NextResponse.json({ notes: notesResult.notes });
  } catch (err: any) {
    console.error("[generate-notes API error]", err);
    return NextResponse.json(
      { error: err.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
//Now the client calls this API endpoint, not the server action itself.

*/

/* Revised code using Gemini model directly
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Initialize Gemini using environment key (same pattern as generate-schedule)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Basic input validation (same style)
    if (!body.classes || !Array.isArray(body.classes) || body.classes.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing class data." },
        { status: 400 }
      );
    }

    // ✅ Prompt generation
    const prompt = `
You are an expert academic assistant.
Generate clear, concise, and well-structured study notes for the following classes.

Each set of notes should:
- Use headings and bullet points
- Focus on key concepts, definitions, and examples
- Be easy to review for exams

Classes:
${body.classes.map((c: any) => `📘 ${c.name}`).join("\n")}
`;

    // ✅ Use the SAME Gemini model style that already works for you
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    // ✅ Generate notes
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({
      notes: text || "No notes could be generated.",
    });
  } catch (error: any) {
    console.error("❌ Gemini generation error:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "An error occurred while generating the notes.",
      },
      { status: 500 }
    );
  }
}

*/


/*
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Initialize Gemini with env key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Input validation
    if (!body.classes || !Array.isArray(body.classes) || body.classes.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing class list." },
        { status: 400 }
      );
    }

    if (body.classes.some((c: any) => !c.name || c.name.trim() === "")) {
      return NextResponse.json(
        { error: "All classes must have a valid name." },
        { status: 400 }
      );
    }

    // ✅ Prompt for BEAUTIFUL, STUDENT-FRIENDLY NOTES
    const prompt = `
You are an expert academic note-taking assistant with deep knowledge of university courses.

Generate detailed, well-organized study notes for a college student. 
The notes must be:
- Clear, concise, and easy to study from
- Structured with headings, subheadings, bullet points, and short explanations
- Tailored to the specific course content and skills required
- Written in a professional yet student-friendly tone

For each class:
1. Start with the class code and full course name as a clear heading
2. Provide:
   - A brief description of the class (what it covers, its goals, and learning outcomes)
   - Key concepts and definitions that students must know
   - Important assignments, projects, or exercises typically required
   - Example problems, coding exercises, or case studies if relevant
   - Tips for studying, common pitfalls, and what professors usually expect
3. Use markdown formatting (## for class headings, ### for sections, bullets for lists)

Classes:
${body.classes.map((c: any) => `- ${c.name}`).join("\n")}

Notes must be accurate, actionable, and reflect what a student actually needs to succeed in each course.
`;


    // ✅ Correct Gemini model
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    // ✅ Generate notes
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({
      notes: text || "No notes could be generated.",
    });
  } catch (error: any) {
    console.error("❌ Gemini Notes Error:", error);

    // ✅ Handle quota / rate-limit errors explicitly
    if (error?.message?.includes("429")) {
      return NextResponse.json(
        {
          error:
            "Daily AI usage limit reached. Please wait a bit or try again later.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error:
          error.message ||
          "An unexpected error occurred while generating notes.",
      },
      { status: 500 }
    );
  }
}
*/




/* The following implementation of a call to gemini API (ONLY)

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Initialize Gemini with env key
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

    // ✅ Input validation
    if (!body.classes || !Array.isArray(body.classes) || body.classes.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing class list." },
        { status: 400 }
      );
    }

    if (body.classes.some((c: any) => !c.name || c.name.trim() === "")) {
      return NextResponse.json(
        { error: "All classes must have a valid name." },
        { status: 400 }
      );
    }

    // ✅ Prompt (unchanged – already excellent)
    const prompt = `
You are an expert academic note-taking assistant with deep knowledge of university courses.

Generate detailed, well-organized study notes for a college student. 
The notes must be:
- Clear, concise, and easy to study from
- Structured with headings, subheadings, bullet points, and short explanations
- Tailored to the specific course content and skills required
- Written in a professional yet student-friendly tone

For each class:
1. Start with the class code and full course name as a clear heading
2. Provide:
   - A brief description of the class (what it covers, its goals, and learning outcomes)
   - Key concepts and definitions that students must know
   - Important assignments, projects, or exercises typically required
   - Example problems, coding exercises, or case studies if relevant
   - Tips for studying, common pitfalls, and what professors usually expect
3. Use markdown formatting (## for class headings, ### for sections, bullets)

Classes:
${body.classes.map((c: any) => `- ${c.name}`).join("\n")}

Notes must be accurate, actionable, and reflect what a student actually needs to succeed in each course.
`;

    // ✅ Correct Gemini model
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    // ✅ SAFE generation (fixes your 503 crash)
    const text = await generateWithRetry(model, prompt);

    return NextResponse.json({
      notes: text || "No notes could be generated.",
    });
  } catch (error: any) {
    console.error("❌ Gemini Notes Error:", error);

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


import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Initialize Gemini with env key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Retry Gemini calls on quota (429) and overload (503)
 */

/**
 * Retry Gemini calls on quota (429) and overload (503)
 * Now only tries once before giving up
 */
async function generateWithRetry(
  model: any,
  prompt: string,
  maxRetries = 1 // only 1 attempt
): Promise<string> {
  let attempt = 0;
  let delay = 15_000; // 15 seconds

  while (attempt < maxRetries) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      const msg = error?.message || "";

      if (msg.includes("429") || msg.includes("quota") || msg.includes("503") || msg.includes("overloaded")) {
        attempt++;
        console.warn(`⚠️ Gemini busy (attempt ${attempt}/${maxRetries}). Falling back if failed.`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw error; // unknown error
      }
    }
  }

  throw new Error("AI service is temporarily unavailable.");
}

/* 
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

      if (msg.includes("429") || msg.includes("quota") || msg.includes("503") || msg.includes("overloaded")) {
        attempt++;
        console.warn(`⚠️ Gemini busy (attempt ${attempt}/${maxRetries}). Retrying in ${delay / 1000}s`);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2; // exponential backoff
      } else {
        throw error; // unknown error
      }
    }
  }

  throw new Error("AI service is temporarily unavailable.");
}
*/

/**
 * Dynamic Mock Notes (fallback if Gemini fails)
 */

/**
 * Generates dynamic mock study notes when Gemini AI is unavailable.
 * Uses the user-provided class names or topics.
 */
function generateMockNotes(classes: { name: string }[]): string {
  return classes
    .map((cls, index) => {
      const topic = cls.name.trim() || `Topic ${index + 1}`;
      return `
## ${topic.toUpperCase()} – Wildfire Awareness & Safety

### Overview
This section covers key knowledge about ${topic}, especially as it relates to wildfire safety, prevention, and awareness. The goal is to help learners understand both the subject and how it connects to real-world fire safety.

### Key Concepts
- **Wildfire Causes Related to ${topic}**: Natural (lightning) vs human-made (carelessness, equipment use)
- **Fire Behavior & ${topic} Implications**: How wind, terrain, and vegetation affect wildfire spread and impact on ${topic}
- **Safety Measures for ${topic}**: Evacuation strategies, safe zones, and personal preparedness
- **Emergency Protocols**: What to do in case of sudden wildfire affecting ${topic}-related locations

### Assignments / Exercises
- Create a preparedness plan focusing on ${topic} areas at risk
- Map out safety measures for environments related to ${topic}
- Case study: Analyze a recent wildfire incident and discuss implications for ${topic}

### Example Scenarios
- **Scenario 1**: During a field activity involving ${topic}, smoke is spotted nearby. What steps do you take?
- **Scenario 2**: A wildfire threatens an area related to ${topic}. How do you follow evacuation and safety protocols?

### Study Tips
- Relate ${topic} content to real-world wildfire safety
- Use visual aids (maps, diagrams, charts) when studying
- Remember key emergency numbers and alert systems
- Discuss lessons learned from historical wildfire incidents

### Fun Fact
Some areas affected by wildfires actually benefit ecologically. Understanding how ${topic} interacts with controlled burns can improve safety and environmental outcomes.

### Recap
Studying ${topic} with wildfire safety in mind emphasizes **awareness, preparedness, and practical decision-making**. Apply this knowledge to realistic scenarios for best retention.
`;
    })
    .join("\n\n---\n\n");
}

/*
function generateMockNotes(classes: { name: string }[]) {
  if (!classes || classes.length === 0) {
    return "Please enter at least one class to generate notes.";
  }

  return classes
    .map((cls) => `
## Class: ${cls.name}
**Description:** This course covers key concepts and practical knowledge related to ${cls.name}.

### Key Concepts
- Important idea #1 for ${cls.name}
- Important idea #2 for ${cls.name}
- Common pitfalls and important tips

### Assignments & Projects
- Example assignment or project for ${cls.name}
- Case studies or exercises relevant to ${cls.name}

### Example Problems
- Problem or scenario illustrating a key concept in ${cls.name}
- Practice questions students might encounter

### Study Tips
- Summarize main points into your own words
- Highlight examples for quick review
- Focus on understanding, not memorization
`)
    .join("\n---\n");
}
*/

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Input validation
    if (!body.classes || !Array.isArray(body.classes) || body.classes.length === 0) {
      return NextResponse.json({ error: "Invalid or missing class list." }, { status: 400 });
    }

    if (body.classes.some((c: any) => !c.name || c.name.trim() === "")) {
      return NextResponse.json({ error: "All classes must have a valid name." }, { status: 400 });
    }

    // ✅ Gemini prompt
    const prompt = `
You are an expert academic note-taking assistant with deep knowledge of university courses.

Generate detailed, well-organized study notes for a college student.
The notes must be:
- Clear, concise, and easy to study from
- Structured with headings, subheadings, bullet points, and short explanations
- Tailored to the specific course content and skills required
- Written in a professional yet student-friendly tone

Classes:
${body.classes.map((c: any) => `- ${c.name}`).join("\n")}

Notes must be accurate, actionable, and reflect what a student actually needs to succeed.
`;

    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    let text: string;
    try {
      text = await generateWithRetry(model, prompt);
    } catch (e) {
      console.warn("❌ Gemini failed, using mock notes.", e);
      text = generateMockNotes(body.classes);
    }

    return NextResponse.json({ notes: text || "No notes could be generated." });
  } catch (error: any) {
    console.error("❌ Generate Notes Error:", error);
    return NextResponse.json({ error: error.message || "Unexpected error occurred." }, { status: 500 });
  }
}
// This code uses mock code incase the key fails or hits the limit
