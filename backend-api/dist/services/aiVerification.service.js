import axios from 'axios';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
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
async function verifyDomain(domain) {
    try {
        const apiKey = process.env.SCREENSHOTONE_API_KEY;
        if (!apiKey) {
            console.error("AI Verification Error: SCREENSHOTONE_API_KEY is not set.");
            return false;
        }
        const url = `https://api.screenshotone.com/take?access_key=${apiKey}&url=https://${domain}&full_page=false&block_ads=true&block_cookie_banners=true`;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return response.status === 200 && response.data.byteLength > 2048;
    }
    catch (error) {
        console.error(`AI Verification Error (Screenshot API for ${domain}):`, error);
        return false;
    }
}
export const runAiVerification = async (organizationId, userEmail, organizationName) => {
    let approvalScore = 0;
    let verificationNotes = [];
    const userDomain = userEmail.split('@')[1];
    console.log(`[AI Verification Started] for Org: "${organizationName}" by User: ${userEmail}`);
    const companyData = await getCompanyData(organizationName);
    if (companyData && companyData.domain) {
        verificationNotes.push(`Found official domain via Clearbit: ${companyData.domain}`);
        if (userDomain.toLowerCase() === companyData.domain.toLowerCase()) {
            approvalScore += 2;
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
    if (approvalScore === 0) {
        const isDomainReal = await verifyDomain(userDomain);
        if (isDomainReal) {
            approvalScore += 1;
            verificationNotes.push(`INFO: User's email domain (${userDomain}) is a valid, live website.`);
            console.log(`✅ [AI Check PASSED - Fallback] User domain ${userDomain} is a valid website.`);
        }
        else {
            verificationNotes.push(`FAILURE: User's email domain (${userDomain}) does not appear to be a valid website.`);
            console.log(`❌ [AI Check FAILED - Fallback] User domain ${userDomain} is not a valid website.`);
        }
    }
    const finalStatus = approvalScore >= 1 ? "APPROVED" : "REJECTED";
    console.log(`[AI Verification Complete] Final Score: ${approvalScore}. Decision: ${finalStatus}`);
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