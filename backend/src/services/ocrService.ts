export async function extractTextFromImage(storageUrl: string): Promise<string> {
    console.log(`[OCR] Processing image at ${storageUrl}`);

    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock responses based on keywords in filename or random
    const lowerUrl = storageUrl.toLowerCase();

    if (lowerUrl.includes('lease') || lowerUrl.includes('housing')) {
        return "LEASE AGREEMENT. Tenant must pay rent of $1200 by the 5th of every month. Landlord: John Doe.";
    }

    if (lowerUrl.includes('court') || lowerUrl.includes('summons')) {
        return "NOTICE TO APPEAR. You are hereby commanded to appear at the County Court on October 15th at 9:00 AM. Case #12345.";
    }

    if (lowerUrl.includes('receipt') || lowerUrl.includes('grocery')) {
        return "WALMART RECEIPT. Milk $3.00, Bread $2.00, Eggs $4.00. Total $9.00. Thank you for shopping.";
    }

    return "Generic document text. This contains some notes about meeting a probation officer next Tuesday at 2pm.";
}
