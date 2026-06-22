require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize clients
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const prisma = new PrismaClient();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json());

// FIX: schema definitions force Gemini to return valid, properly-escaped JSON
// instead of relying on the prompt text alone to "ask nicely" for JSON shape.
const ANALYZE_SCHEMA = {
    type: "OBJECT",
    properties: {
        summary: { type: "STRING" },
        language: { type: "STRING" },
        complexity: { type: "STRING" },
        vulnerability: { type: "STRING" },
        tags: { type: "ARRAY", items: { type: "STRING" } }
    },
    required: ["summary", "language", "complexity", "vulnerability", "tags"]
};

const REFACTOR_SCHEMA = {
    type: "OBJECT",
    properties: {
        optimizedCode: { type: "STRING" },
        explanation: { type: "STRING" }
    },
    required: ["optimizedCode", "explanation"]
};

// Small helper so both routes report the REAL parse error instead of a generic 500.
function safeParseAIJson(rawText) {
    const cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    try {
        return JSON.parse(cleanText);
    } catch (err) {
        console.error("Failed to parse AI JSON. Raw output was:\n", cleanText);
        throw new Error("The AI returned a response that could not be parsed as JSON.");
    }
}

// NEW: Gemini sometimes double-escapes newlines inside JSON string fields —
// e.g. it emits the literal two characters \ and n instead of a real line break,
// especially for large multi-line code blocks embedded in a JSON string.
// This detects that pattern (way more literal "\n" sequences than real newlines)
// and converts them back into actual line breaks.
function normalizeEscapedNewlines(text) {
    if (typeof text !== 'string') return text;
    const actualNewlines = (text.match(/\n/g) || []).length;
    const literalEscapes = (text.match(/\\n/g) || []).length;
    if (literalEscapes > actualNewlines) {
        return text
            .replace(/\\r\\n/g, '\n')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t');
    }
    return text;
}

// Applies the normalizer to every string field of a parsed AI JSON object.
function normalizeAIResponse(obj) {
    const normalized = { ...obj };
    for (const key in normalized) {
        normalized[key] = normalizeEscapedNewlines(normalized[key]);
    }
    return normalized;
}

// NEW: detects transient Gemini errors (model overloaded / rate limited) that are
// safe to retry, as opposed to real bugs (bad prompt, bad auth, etc.)
function isTransientAIError(error) {
    const code = error?.status || error?.code;
    if (code === 503 || code === 429 || code === 'UNAVAILABLE' || code === 'RESOURCE_EXHAUSTED') {
        return true;
    }
    // The @google/genai SDK sometimes only exposes this inside a stringified message
    const message = String(error?.message || '');
    return message.includes('"status":"UNAVAILABLE"')
        || message.includes('"code":503')
        || message.includes('"code":429')
        || message.includes('RESOURCE_EXHAUSTED');
}

// NEW: wraps ai.models.generateContent with retry + exponential backoff,
// but ONLY for transient errors. Real errors (bad prompt, invalid key, etc.) fail immediately.
async function generateContentWithRetry(params, maxRetries = 3) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await ai.models.generateContent(params);
        } catch (error) {
            const isLastAttempt = attempt === maxRetries;
            if (!isTransientAIError(error) || isLastAttempt) {
                throw error;
            }
            const delayMs = 500 * Math.pow(2, attempt); // 500ms, 1s, 2s...
            console.warn(`Gemini overloaded (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
}

// 1. Route to Analyze and SAVE to Database
app.post('/api/analyze', async (req, res) => {
    try {
        const { codeSnippet } = req.body;
        const userId = req.headers['x-user-id'];

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: Missing User ID." });
        }

        if (!codeSnippet) {
            return res.status(400).json({ error: "No code provided." });
        }

        console.log(`Analyzing snippet for user: ${userId}...`);

        const prompt = `
        Analyze the following code snippet. 
        You must respond ONLY with a valid JSON object using this exact structure:
        {
            "summary": "A 1-2 sentence explanation in easy. Use markdown for code terms.",
            "language": "The programming language detected.",
            "complexity": "The Big-O time complexity.",
            "vulnerability": "Any obvious security risks or 'None detected'.",
            "tags": ["tag1", "tag2", "tag3"]
        }
        
        Code to analyze:
        \n\n${codeSnippet}
        `;
        // FIX: added the missing comma after "vulnerability" above ^ (was breaking the example JSON shown to the model)

        const response = await generateContentWithRetry({ // FIX: auto-retries on transient overload
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: ANALYZE_SCHEMA // FIX: enforce schema-conformant JSON output
            }
        });

        const aiAnalysis = normalizeAIResponse(safeParseAIJson(response.text)); // FIX: un-escape double-escaped newlines

        console.log("AI Analysis Complete. Saving to database...");

        // Save to PostgreSQL
        const savedSnippet = await prisma.snippet.create({
            data: {
                userId: userId,
                rawCode: codeSnippet,
                summary: String(aiAnalysis.summary),
                language: String(aiAnalysis.language),
                timeComplexity: String(aiAnalysis.complexity),
                vulnerabilities: String(aiAnalysis.vulnerability),
                tags: aiAnalysis.tags || []
            }
        });

        console.log("Successfully saved to Vault with ID:", savedSnippet.id);
        res.json(aiAnalysis);

    } catch (error) {
        console.error("AI Analysis or Database Error:", error);
        if (isTransientAIError(error)) { // FIX: clear message for "model busy" vs real errors
            return res.status(503).json({ error: "The AI model is currently busy. Please try again in a moment." });
        }
        res.status(500).json({ error: error.message || "Failed to process and save code." });
    }
});

// 2. Route to Refactor code
app.post('/api/refactor', async (req, res) => {
    try {
        const { codeSnippet } = req.body;
        const userId = req.headers['x-user-id'];

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        if (!codeSnippet) {
            return res.status(400).json({ error: "No code provided." });
        }

        const prompt = `
        You are a senior engineer. Refactor and optimize this code.
        Fix vulnerabilities and improve time complexity.
        Respond ONLY with a valid JSON object using this exact structure:
        {
            "optimizedCode": "The fully refactored raw code here.",
            "explanation": "A short markdown explanation of what you optimized."
        }
        Code:
        \n\n${codeSnippet}
        `;

        const response = await generateContentWithRetry({ // FIX: auto-retries on transient overload
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: REFACTOR_SCHEMA // FIX: enforce schema-conformant JSON output
            }
        });

        const refactored = normalizeAIResponse(safeParseAIJson(response.text)); // FIX: un-escape double-escaped newlines
        res.json(refactored);
    } catch (error) {
        console.error("Refactor Error:", error);
        if (isTransientAIError(error)) { // FIX: clear message for "model busy" vs real errors
            return res.status(503).json({ error: "The AI model is currently busy. Please try again in a moment." });
        }
        res.status(500).json({ error: error.message || "Refactor Failed" });
    }
});

// 3. Fetch all saved snippets for the Sidebar
app.get('/api/snippets', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const snippets = await prisma.snippet.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(snippets);
    } catch (error) {
        console.error("Failed to fetch snippets:", error);
        res.status(500).json({ error: "Failed to load Vault history." });
    }
});

// 4. Delete snippet
app.delete('/api/snippets/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        // deleteMany ensures we check BOTH the snippet ID and that the user owns it
        await prisma.snippet.deleteMany({
            where: { id: req.params.id, userId: userId }
        });
        res.json({ success: true });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: "Delete Failed" });
    }
});

// 5. Export documentation
app.get('/api/export', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Fetch snippets in chronological order so it reads like a manual
        const snippets = await prisma.snippet.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Render the EJS template and send the HTML block directly to the frontend
        res.render('docs', { snippets });

    } catch (error) {
        console.error("Failed to export manual:", error);
        res.status(500).json({ error: "Failed to generate export." });
    }
});

app.listen(PORT, () => {
    console.log(`Vault OS Backend running on http://localhost:${PORT}`);
});