import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PUBLIC_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com',
  'live.com', 'msn.com'
];

async function getCompanyData(companyName: string): Promise<{ domain: string | null; name: string } | null> {
  try {
    const url = `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(companyName)}`;
    const response = await axios.get(url);
    if (response.data && response.data.length > 0) {
      return { domain: response.data[0].domain, name: response.data[0].name };
    }
    return null;
  } catch (error) {
    console.error("AI Verification Error (Clearbit API):", error);
    return null;
  }
}

async function verifyDomain(domain: string): Promise<boolean> {
  try {
    const apiKey = process.env.SCREENSHOTONE_API_KEY;
    if (!apiKey) return false;
    const url = `https://api.screenshotone.com/take?access_key=${apiKey}&url=https://${domain}&full_page=false&block_ads=true&block_cookie_banners=true`;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return response.status === 200 && response.data.byteLength > 2048;
  } catch (error) {
    return false;
  }
}

export const runAiVerification = async (organizationId: string, userEmail: string, organizationName: string) => {
  let finalStatus = "PENDING";
  let verificationNotes: string[] = [];
  const userDomain = userEmail.split('@')[1].toLowerCase();

  console.log(`[AI Verification Started] for Org: "${organizationName}" by User: ${userEmail}`);

  if (PUBLIC_EMAIL_DOMAINS.includes(userDomain)) {
    finalStatus = "REJECTED";
    verificationNotes.push(`FAILURE: Public email domain (${userDomain}) is not allowed.`);
    console.log(`❌ [AI Check FAILED] Blocked public domain.`);
  } 
  else {
    const companyData = await getCompanyData(organizationName);

    if (companyData && companyData.domain) {
      if (userDomain === companyData.domain.toLowerCase()) {
        finalStatus = "APPROVED";
        verificationNotes.push(`SUCCESS: Validated employee of ${companyData.name} (${companyData.domain}).`);
        console.log(`✅ [AI Check PASSED] Strict domain match confirmed.`);
      } else {
        finalStatus = "REJECTED";
        verificationNotes.push(`FAILURE: Domain mismatch. Official is ${companyData.domain}, user is ${userDomain}.`);
        console.log(`❌ [AI Check FAILED] Domain mismatch.`);
      }
    } else {

      console.log(`🟡 [AI Check INFO] Unknown company. Checking domain validity via ScreenshotOne.`);
      
      const isDomainReal = await verifyDomain(userDomain);

      if (isDomainReal) {
        finalStatus = "APPROVED";
        verificationNotes.push(`SUCCESS: "${organizationName}" not in database, but ${userDomain} is a valid active website.`);
        console.log(`✅ [AI Check PASSED] Validated unknown business domain.`);
      } else {
        finalStatus = "REJECTED";
        verificationNotes.push(`FAILURE: Company unknown and domain (${userDomain}) is inactive.`);
        console.log(`❌ [AI Check FAILED] Domain invalid.`);
      }
    }
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      status: finalStatus,
      factories: { updateMany: { where: { status: "PENDING" }, data: { status: finalStatus } } },
      users: { updateMany: { where: { status: "PENDING" }, data: { status: finalStatus } } }
    }
  });

  return { finalStatus, notes: verificationNotes };
};