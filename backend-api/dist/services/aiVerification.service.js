// src/services/aiVerification.service.ts
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// --- Helper Function 1: Get Company Data from Clearbit ---
// This function finds the official domain for a company.
async function getCompanyData(companyName) {
    try {
        const url = `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(companyName)}`;
        const response = await axios.get(url);
        if (response.data && response.data.length > 0) {
            return { domain: response.data[0].domain, name: response.data[0].name };
        }
        return null;
    }
    catch (error) {
        console.error("AI Verification Error (Clearbit API):", error);
        return null;
    }
}
// --- Helper Function 2: Verify Domain with Screenshot ---
// This function checks if a domain corresponds to a real website.
async function verifyDomain(domain) {
    try {
        const apiKey = process.env.SCREENSHOTONE_API_KEY;
        if (!apiKey) {
            console.error("AI Verification Error: SCREENSHOTONE_API_KEY is not set.");
            return false;
        }
        const url = `https://api.screenshotone.com/take?access_key=${apiKey}&url=https://${domain}&full_page=false&block_ads=true&block_cookie_banners=true`;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        // A valid screenshot should be larger than a few kilobytes.
        return response.status === 200 && response.data.byteLength > 2048;
    }
    catch (error) {
        console.error(`AI Verification Error (Screenshot API for ${domain}):`, error);
        return false;
    }
}
// --- Main AI Verification Logic ---
export const runAiVerification = async (organizationId, userEmail, organizationName) => {
    let approvalScore = 0;
    let verificationNotes = [];
    const userDomain = userEmail.split('@')[1];
    console.log(`[AI Verification Started] for Org: "${organizationName}" by User: ${userEmail}`);
    // Check 1: Find the official company domain via Clearbit
    const companyData = await getCompanyData(organizationName);
    if (companyData && companyData.domain) {
        verificationNotes.push(`Found official domain via Clearbit: ${companyData.domain}`);
        // Check 2: The "Domain Match" - does the user's email domain match the company's?
        if (userDomain.toLowerCase() === companyData.domain.toLowerCase()) {
            approvalScore += 2; // High score for a direct match
            verificationNotes.push(`SUCCESS: User email domain matches official company domain.`);
            console.log(`✅ [AI Check PASSED] Domain match for ${userDomain}.`);
        }
        else {
            verificationNotes.push(`WARNING: User email domain (${userDomain}) does not match official domain (${companyData.domain}).`);
            console.log(`❌ [AI Check FAILED] Domain mismatch.`);
        }
    }
    else {
        verificationNotes.push(`FAILURE: Could not find company data for "${organizationName}" in Clearbit.`);
        console.log(`🟡 [AI Check INFO] Could not find "${organizationName}" in Clearbit. Proceeding to fallback check.`);
    }
    // Check 3 (Fallback): If no match yet, verify the user's email domain is at least a real website.
    if (approvalScore === 0) {
        const isDomainReal = await verifyDomain(userDomain);
        if (isDomainReal) {
            approvalScore += 1; // Lower score, as this is less certain
            verificationNotes.push(`INFO: User's email domain (${userDomain}) is a valid, live website.`);
            console.log(`✅ [AI Check PASSED - Fallback] User domain ${userDomain} is a valid website.`);
        }
        else {
            verificationNotes.push(`FAILURE: User's email domain (${userDomain}) does not appear to be a valid website.`);
            console.log(`❌ [AI Check FAILED - Fallback] User domain ${userDomain} is not a valid website.`);
        }
    }
    // Final Decision Logic: Require a score of at least 1 to pass.
    const finalStatus = approvalScore >= 1 ? "APPROVED" : "REJECTED";
    console.log(`[AI Verification Complete] Final Score: ${approvalScore}. Decision: ${finalStatus}`);
    // Update the status of the Organization, its default Factory, and its first User.
    await prisma.organization.update({
        where: { id: organizationId },
        data: {
            status: finalStatus,
            factories: {
                updateMany: { where: { status: "PENDING" }, data: { status: finalStatus } }
            },
            users: {
                updateMany: { where: { status: "PENDING" }, data: { status: finalStatus } }
            }
        }
    });
    return { finalStatus, notes: verificationNotes };
};
//# sourceMappingURL=aiVerification.service.js.map