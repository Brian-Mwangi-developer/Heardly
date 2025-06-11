import { z } from "zod";

import { ChatOpenAI } from "@langchain/openai";

export interface RulesConfig {
    potential: string[]
    query: string[]
    dead: string[]
}

export const defaultRules: RulesConfig = {
    potential: [
        "Mentions budget or willingness to pay/invest",
        "Asks for pricing, quotes, or cost information",
        "Expresses urgency or timeline for implementation",
        "Mentions decision-making authority or team involvement",
        "Requests demos, trials, or consultations",
        "Discusses specific business needs or pain points",
        "Shows interest in premium features or services",
        "Mentions competitors or comparison shopping",
        "Asks about implementation or onboarding process",
        "References company growth or scaling needs",
    ],
    query: [
        "Asks general questions about products/services",
        "Requests information without buying signals",
        "Seeks educational content or resources",
        "Asks for opinions or recommendations",
        "Shares industry news or updates",
        "Requests clarification on features",
        "Asks about compatibility or technical specs",
        "Seeks best practices or guidance",
        "Mentions research or exploration phase",
        "Asks for comparisons without urgency",
    ],
    dead: [
        "Explicitly states not interested or not buying",
        "Mentions budget constraints or no budget",
        "Says they found another solution",
        "Indicates they are just students or hobbyists",
        "Mentions they are not decision makers",
        "Expresses satisfaction with current solution",
        "States they are not ready to make changes",
        "Mentions company hiring freeze or budget cuts",
        "Indicates they are just collecting information",
        "Shows no engagement despite multiple follow-ups",
    ],
}

function truncateEmailContent(text: string, maxTokens: number = 2000): string {
    // Rough estimate: 1 token ≈ 4 characters for English text
    const maxChars = maxTokens * 4;

    if (text.length <= maxChars) {
        return text;
    }

    // Truncate and add indication
    return text.substring(0, maxChars) + "\n\n[Content truncated due to length...]";
}

export interface EmailThread {
    subject: string;
    body: string;
    sender?: string;
    timestamp?: string;
}


const EmailAnalysisSchema = z.object({
    overallCategory: z.enum(["potential", "query", "dead"]).describe("Overall category of the email thread based on the analysis"),

    potentialCriteriaMet: z.array(z.object({
        criteria: z.string().describe("The Specific Potential criteria that was met"),
        quote: z.string().describe("The Exact text from the Email that matched the criteria")
    })).describe("List of Potential lead criteria that were met with supporting quotes"),

    queryCriteriaMet: z.array(z.object({
        criteria: z.string().describe("The specific query criteria that was met"),
        quote: z.string().describe("The exact text from the email that meets this criteria")
    })).describe("List of query criteria that were met with supporting quotes"),

    deadCriteriaMet: z.array(z.object({
        criteria: z.string().describe("The specific dead lead criteria that was met"),
        quote: z.string().describe("The exact text from the email that meets this criteria")
    })).describe("List of dead lead criteria that were met with supporting quotes"),

    conditionsNotMet: z.array(z.string()).describe("List of important criteria that were not satisfied in this email thread"),

    keyRecommendations: z.array(z.string()).describe("Specific actionable recommendations for the sales rep to pursue this potential customer"),

    urgencyLevel: z.enum(["high", "medium", "low"]).describe("The urgency level for sales follow-up"),

    nextSteps: z.array(z.string()).describe("Suggested immediate next steps for the sales representative")

})

export interface StreamingCallback {
    onProgress?: (step: string, progress: number) => void;
    onEmailStart?: (emailIndex: number, total: number, subject: string) => void;
    onEmailComplete?: (emailIndex: number, analysis: any) => void;
    onError?: (error: string) => void;
}

export async function analyzeEmailThread(
    emailThread: EmailThread,
    rules: RulesConfig = defaultRules,
    callbacks?: StreamingCallback
): Promise<z.infer<typeof EmailAnalysisSchema>> {
    const llm = new ChatOpenAI({
        modelName: "gpt-4",
        temperature: 0.1,
        openAIApiKey: process.env.OPENAI_API_KEY,
    });
    const truncatedEmailThread = {
        ...emailThread,
        body: truncateEmailContent(emailThread.body, 1500), // Limit body to ~1500 tokens
        subject: emailThread.subject.length > 200 ? emailThread.subject.substring(0, 200) + "..." : emailThread.subject
    };
    const prompt =
        `
    You are an expert sales representative analyzer tasked with reviewing email threads to identify lead potential and provide actionable recommendations.

## YOUR ROLE ##
As a seasoned sales professional, you excel at reading between the lines of customer communications to identify buying signals, pain points, and opportunity levels. Your analysis directly impacts sales strategy and resource allocation.

## ANALYSIS CRITERIA ##

### POTENTIAL LEAD INDICATORS (High Priority):
${rules.potential.map((rule, index) => `${index + 1}. ${rule}`).join('\n')}

### QUERY/INFORMATION SEEKING INDICATORS (Medium Priority):
${rules.query.map((rule, index) => `${index + 1}. ${rule}`).join('\n')}

### DEAD LEAD INDICATORS (Low Priority):
${rules.dead.map((rule, index) => `${index + 1}. ${rule}`).join('\n')}

## INSTRUCTIONS ##

1. **CAREFULLY ANALYZE** the provided email thread for evidence of each criteria
2. **EXTRACT EXACT QUOTES** - When you identify criteria being met, provide the precise text from the email that supports your conclusion
3. **PRIORITIZE ACCURACY** - Only mark criteria as met if there is clear evidence in the text
4. **THINK LIKE A SALES REP** - Consider the customer's journey, pain points, and readiness to buy
5. **FORMAT QUOTES PROPERLY** - Use <quote>exact email content</quote> format for all supporting evidence
6. **BE SPECIFIC** - Provide actionable, specific recommendations based on the email content

## EMAIL THREAD TO ANALYZE ##

**Subject:** ${truncatedEmailThread.subject}
**Body:** ${truncatedEmailThread.body}
${truncatedEmailThread.sender ? `**Sender:** ${truncatedEmailThread.sender}` : ''}
${truncatedEmailThread.timestamp ? `**Timestamp:** ${truncatedEmailThread.timestamp}` : ''}

## OUTPUT REQUIREMENTS ##

Analyze this email thread against all criteria and provide:
- Overall categorization (potential/query/dead)
- Specific criteria met with exact supporting quotes
- Conditions not satisfied
- Key recommendations for sales approach
- Urgency assessment
- Immediate next steps

Remember: Your analysis will guide sales strategy, so be thorough and accurate. Focus on what the customer is actually communicating, not what you hope they might mean.
`;
    const structuredLLM = llm.withStructuredOutput(EmailAnalysisSchema);
    try {

        callbacks?.onProgress?.("Starting email analysis...", 10);

        let streamedContent = "";
        const result = await structuredLLM.invoke(prompt, {
            callbacks: [{
                handleLLMNewToken(token: string) {
                    streamedContent += token;
                    // You can parse partial content here if needed
                    callbacks?.onProgress?.("Processing analysis...", Math.min(90, 10 + (streamedContent.length / 100)));
                }
            }]
        });
        callbacks?.onProgress?.("Analysis complete!", 100);
        return result;
    } catch (error) {
        callbacks?.onError?.(`Failed to analyze email thread: ${error}`);
        console.error("Error analyzing email thread:", error);
        throw new Error(`Failed to analyze email thread: ${error}`);
    }
}

export function formatAnalysisResults(analysis: z.infer<typeof EmailAnalysisSchema>): string {
    let formatted = "";

    formatted += `## OVERALL CATEGORY: ${analysis.overallCategory.toUpperCase()}\n\n`;
    if (analysis.potentialCriteriaMet.length > 0) {
        formatted += "### 🎯 POTENTIAL LEAD CRITERIA MET:\n";
        analysis.potentialCriteriaMet.forEach((item, index) => {
            formatted += `${index + 1}. **${item.criteria}**\n`;
            formatted += `   Supporting Evidence: <quote>${item.quote}</quote>\n\n`;
        });
    }

    if (analysis.queryCriteriaMet.length > 0) {
        formatted += "### ❓ QUERY CRITERIA MET:\n";
        analysis.queryCriteriaMet.forEach((item, index) => {
            formatted += `${index + 1}. **${item.criteria}**\n`;
            formatted += `   Supporting Evidence: <quote>${item.quote}</quote>\n\n`;
        });
    }

    if (analysis.deadCriteriaMet.length > 0) {
        formatted += "### ❌ DEAD LEAD CRITERIA MET:\n";
        analysis.deadCriteriaMet.forEach((item, index) => {
            formatted += `${index + 1}. **${item.criteria}**\n`;
            formatted += `   Supporting Evidence: <quote>${item.quote}</quote>\n\n`;
        });
    }

    if (analysis.conditionsNotMet.length > 0) {
        formatted += "### ⚠️ CONDITIONS NOT SATISFIED:\n";
        analysis.conditionsNotMet.forEach((condition, index) => {
            formatted += `• ${condition}\n`;
        });
        formatted += "\n";
    }
    formatted += `### 🚨 URGENCY LEVEL: ${analysis.urgencyLevel.toUpperCase()}\n\n`;

    if (analysis.keyRecommendations.length > 0) {
        formatted += "### 💡 KEY RECOMMENDATIONS:\n";
        analysis.keyRecommendations.forEach((rec, index) => {
            formatted += `${index + 1}. ${rec}\n`;
        });
        formatted += "\n";
    }

    if (analysis.nextSteps.length > 0) {
        formatted += "### 🎯 IMMEDIATE NEXT STEPS:\n";
        analysis.nextSteps.forEach((step, index) => {
            formatted += `${index + 1}. ${step}\n`;
        });
    }
    return formatted;
}



