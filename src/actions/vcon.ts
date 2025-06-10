"use server";

import type { EmailMessage } from "@/lib/types";
import axios from "axios";

export async function createVcon(threadId: string, emails: EmailMessage[]): Promise<void> {
    try {
        // Prepare parties (array of unique email addresses)
        const parties = Array.from(
            new Set(emails.flatMap(email => [
                email.from.address,
                ...email.to.map(to => to.address)
            ]))
        );
        // console.log("Email Body", emails[0]?.bodySnippet)

        // Prepare dialogs
        const dialogs = emails
            .map(email => ({
                originator_index: parties.indexOf(email.from.address),
                body_snippet: email.bodySnippet ?? "",
                last_modified: new Date().toISOString()
            }));

        // console.log("Thread ID:", threadId);
        // console.log("Parties:", parties);
        // console.log("Dialogs:", dialogs);

        // Send the data to the FastAPI endpoint
        const response = await axios.post("http://localhost:8000/vcon/email_thread", {
            thread_id: threadId,
            parties,
            dialogs
        });

        // Check response status
        if (response.status === 200) {
            console.log(`Vcon created/updated successfully for threadId: ${threadId}`);
        } else {
            console.error(`Failed to create/update Vcon for threadId: ${threadId}`, response.statusText);
        }
    } catch (error) {
        console.error(`Error creating/updating Vcon for threadId: ${threadId}`, error);
    }
}