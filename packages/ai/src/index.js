import { AI_RECOMMENDATION } from '@ewnet/shared';

/**
 * Investigates a support ticket against historical warranty snapshot
 * Produces structured report with exact clause references
 */
export async function investigateSupportCase({ ticket, warranty, policySnapshot, evidence = [] }) {
  const policyClauses = policySnapshot?.clauses || [];
  const complaint = (ticket.description || '').toLowerCase();
  const subject = (ticket.subject || '').toLowerCase();
  const fullText = `${subject} ${complaint}`;

  // Check if warranty is expired
  const now = new Date();
  const expiryDate = new Date(warranty?.warranty?.expiryDate || now);
  const isExpired = now > expiryDate;

  // Identify matching coverage and exclusion clauses
  const matchingCoverages = policyClauses.filter(c => 
    c.type === 'coverage' && fullText.split(' ').some(w => w.length > 3 && c.text.toLowerCase().includes(w))
  );

  const matchingExclusions = policyClauses.filter(c => 
    c.type === 'exclusion' && (
      fullText.includes('water') || fullText.includes('drop') || fullText.includes('crack') ||
      fullText.includes('spill') || fullText.includes('surge') || fullText.includes('unauthorized')
    )
  );

  let recommendation = AI_RECOMMENDATION.NEEDS_MANUAL_INVESTIGATION;
  let summary = `Customer reported: "${ticket.subject}". Product: ${warranty?.product?.brand || ''} ${warranty?.product?.model || ''}.`;
  let reasoning = '';
  const missingInformation = [];
  const contradictions = [];
  const policyReferences = [];

  if (isExpired) {
    recommendation = AI_RECOMMENDATION.RECOMMEND_REJECTION;
    reasoning = `The warranty expired on ${expiryDate.toISOString().slice(0, 10)}. Support claim was submitted after the expiration date.`;
    policyReferences.push({
      policyVersionId: policySnapshot?.policyVersionId || 'unknown',
      clauseId: 'term-duration',
      quotedOrReferencedText: `Policy duration: ${warranty?.warranty?.duration || 12} ${warranty?.warranty?.durationUnit || 'months'}`,
      explanation: 'Warranty period has elapsed.'
    });
  } else if (matchingExclusions.length > 0) {
    recommendation = AI_RECOMMENDATION.RECOMMEND_REJECTION;
    const ex = matchingExclusions[0];
    reasoning = `The customer complaint indicates potential physical/liquid or excluded damage matching policy exclusion clause "${ex.title}".`;
    policyReferences.push({
      policyVersionId: policySnapshot?.policyVersionId || 'unknown',
      clauseId: ex.clauseId,
      quotedOrReferencedText: ex.text,
      explanation: `Customer symptoms relate to excluded conditions defined in ${ex.title}.`
    });
  } else if (matchingCoverages.length > 0) {
    if (evidence.length === 0) {
      recommendation = AI_RECOMMENDATION.REQUEST_MORE_INFORMATION;
      reasoning = `The symptom matches covered hardware issues under clause "${matchingCoverages[0].title}", but no diagnostic photo/video or proof of defect has been uploaded yet.`;
      missingInformation.push('Clear photographs or video showing the device condition and failure state.');
      missingInformation.push('Confirmation whether the device experienced any liquid contact or drops.');
    } else {
      recommendation = AI_RECOMMENDATION.RECOMMEND_APPROVAL;
      reasoning = `The reported defect falls under documented hardware coverage ("${matchingCoverages[0].title}") and diagnostic evidence was submitted. The warranty is active until ${expiryDate.toISOString().slice(0, 10)}.`;
    }
    policyReferences.push({
      policyVersionId: policySnapshot?.policyVersionId || 'unknown',
      clauseId: matchingCoverages[0].clauseId,
      quotedOrReferencedText: matchingCoverages[0].text,
      explanation: `Reported issue aligns with coverage terms in ${matchingCoverages[0].title}.`
    });
  } else {
    recommendation = AI_RECOMMENDATION.REQUEST_MORE_INFORMATION;
    reasoning = 'The complaint does not provide enough diagnostic details to match specific coverage clauses or exclude unauthorized tampering.';
    missingInformation.push('Detailed description of how and when the failure occurred.');
    missingInformation.push('Device serial number verification photo.');
  }

  return {
    recommendation,
    summary,
    reasoning,
    policyReferences,
    evidenceReviewed: evidence.map((ev, idx) => ({
      evidenceId: ev._id || `ev-${idx}`,
      observation: `Attachment: ${ev.originalFilename || 'Document'} (${ev.mimeType || 'unknown'})`
    })),
    missingInformation,
    contradictions,
    suggestedNextStep: recommendation === AI_RECOMMENDATION.RECOMMEND_APPROVAL 
      ? 'Invite customer to bring device for authorized hardware assessment or replacement.'
      : recommendation === AI_RECOMMENDATION.REQUEST_MORE_INFORMATION
      ? 'Request customer to supply the missing diagnostic photos and error descriptions.'
      : 'Review exclusion clause and explain policy boundaries to the customer.',
    humanDecisionRequired: true,
    analyzedAt: new Date().toISOString()
  };
}

/**
 * Customer Warranty Assistant
 * Answers customer questions strictly using their own warranty records
 */
export async function answerCustomerQuery({ query, warranties = [] }) {
  const q = (query || '').toLowerCase();
  
  if (warranties.length === 0) {
    return {
      answer: "You currently have no claimed warranties in your account. You can claim a warranty by scanning your QR code or entering your Warranty ID on the 'Claim Warranty' page.",
      suggestedActions: ['Claim Warranty']
    };
  }

  // Find relevant warranty if query mentions a brand or product
  const matchedWarranty = warranties.find(w => 
    q.includes(w.product?.name?.toLowerCase() || '') ||
    q.includes(w.product?.brand?.toLowerCase() || '') ||
    q.includes(w.warrantyNumber?.toLowerCase() || '')
  ) || warranties[0];

  const now = new Date();
  const expiry = new Date(matchedWarranty.warranty?.expiryDate || now);
  const isExpired = now > expiry;
  const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  if (q.includes('expire') || q.includes('when') || q.includes('date') || q.includes('valid')) {
    return {
      answer: `Your warranty for ${matchedWarranty.product?.brand} ${matchedWarranty.product?.name} (${matchedWarranty.warrantyNumber}) is ${isExpired ? 'expired' : `active and expires on ${expiry.toLocaleDateString()}`}. ${isExpired ? 'The warranty coverage period has concluded.' : `You have ${daysLeft} days remaining.`}`,
      warrantyNumber: matchedWarranty.warrantyNumber
    };
  }

  if (q.includes('cover') || q.includes('included') || q.includes('what')) {
    const coverageClauses = (matchedWarranty.policySnapshot?.clauses || [])
      .filter(c => c.type === 'coverage')
      .map(c => `• **${c.title}**: ${c.text}`)
      .join('\n');

    return {
      answer: `Here is the coverage defined in your issued policy for **${matchedWarranty.product?.name}**:\n\n${coverageClauses || 'Standard manufacturer and retailer hardware defects.'}\n\n*Note: An authorized company representative assesses all claims.*`,
      warrantyNumber: matchedWarranty.warrantyNumber
    };
  }

  if (q.includes('exclude') || q.includes('water') || q.includes('drop') || q.includes('accident')) {
    const exclusionClauses = (matchedWarranty.policySnapshot?.clauses || [])
      .filter(c => c.type === 'exclusion')
      .map(c => `• **${c.title}**: ${c.text}`)
      .join('\n');

    return {
      answer: `Here are the exclusions under your warranty policy:\n\n${exclusionClauses || 'Physical impact, liquid submersion, power surge, and unauthorized tampering.'}`,
      warrantyNumber: matchedWarranty.warrantyNumber
    };
  }

  return {
    answer: `Regarding your **${matchedWarranty.product?.brand} ${matchedWarranty.product?.name}** (Warranty: ${matchedWarranty.warrantyNumber}):\n- Status: ${matchedWarranty.recordStatus || 'Active'}\n- Expiry: ${expiry.toLocaleDateString()}\n- Issuing Company: ${matchedWarranty.companySnapshot?.businessName || 'Authorized Retailer'}\n\nIf you are experiencing an issue, you can submit a support request directly from your dashboard.`,
    warrantyNumber: matchedWarranty.warrantyNumber
  };
}

/**
 * Company Policy Assistant
 * Suggests structured clauses for retailer policies
 */
export async function suggestPolicyClauses({ category = 'electronics', durationMonths = 12 }) {
  return {
    suggestedDuration: durationMonths,
    suggestedDurationUnit: 'months',
    suggestedClauses: [
      {
        clauseId: 'cov-motherboard',
        title: 'Core Hardware & Motherboard Failure',
        text: 'Covers internal hardware failures, defective motherboards, processors, and factory assembly defects occurring under normal operational conditions.',
        type: 'coverage'
      },
      {
        clauseId: 'cov-display',
        title: 'Display and Screen Hardware Defect',
        text: 'Covers internal display panel malfunctions, pixel lines, and touch sensor failure not resulting from external physical impact.',
        type: 'coverage'
      },
      {
        clauseId: 'excl-liquid',
        title: 'Liquid and Moisture Damage',
        text: 'Excludes damage caused by water ingress, spills, high humidity, condensation, or immersion.',
        type: 'exclusion'
      },
      {
        clauseId: 'excl-drop',
        title: 'Physical Impact and Accidental Damage',
        text: 'Excludes cracked screens, bent chassis, dented enclosures, or internal breakage resulting from drops, falls, or excessive pressure.',
        type: 'exclusion'
      },
      {
        clauseId: 'proc-claim',
        title: 'Service Request Procedure',
        text: 'Customer must present or submit the digital warranty QR code, invoice reference, and detailed photographic evidence of the defect through Ewnet portal.',
        type: 'procedure'
      }
    ]
  };
}

