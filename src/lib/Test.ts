// import { analyzeEmailThread, type EmailThread } from "./analyse";

// // Example usage function
// export async function analyzeEmailExample() {
//     const sampleEmail: EmailThread = {
//         subject: "Interested in your enterprise solution",
//         body: "Hi, I'm the CTO at TechCorp and we're looking for a new customer management system. We have a budget of $50k and need to implement something within the next 3 months. Could you send me pricing information and schedule a demo? We're currently using Salesforce but it's not meeting our needs.",
//         sender: "john.doe@techcorp.com"
//     };


//     try {
//         const analysis = await analyzeEmailThread(sampleEmail, defaultRules);
//         const formattedResults = formatAnalysisResults(analysis);
//         console.log(formattedResults);
//         return analysis;
//     } catch (error) {
//         console.error("Analysis failed:", error);
//     }
// }

// // Export types for external use
// export type EmailAnalysisResult = z.infer<typeof EmailAnalysisSchema>;

// if (require.main === module) {
//     analyzeEmailExample();
// }