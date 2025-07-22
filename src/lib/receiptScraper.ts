import * as z from "zod";

export interface ScrapedReceiptData {
  referenceNumber: string | null;
  payerAccountLastDigit: string | null;
  receiverAccountLastDigit: string | null;
  transferredAmount: string | null;
  paymentDate: string | null;
}

const scrapedReceiptDataSchema = z.object({
  referenceNumber: z.string().nullable(),
  payerAccountLastDigit: z.string().nullable(),
  receiverAccountLastDigit: z.string().nullable(),
  transferredAmount: z.string().nullable(),
  paymentDate: z.string().nullable(),
});

export function scrapeReceiptData(fullContent: string): ScrapedReceiptData {
  let referenceNumber: string | null = null;
  let payerAccountLastDigit: string | null = null;
  let receiverAccountLastDigit: string | null = null;
  let transferredAmount: string | null = null;
  let paymentDate: string | null = null;

  const normalizedContent = fullContent.replace(/\s+/g, ' ').trim();

  // Reference Number
  const refNoMatch = normalizedContent.match(/Reference No\.\s*([A-Z0-9]+)/i);
  if (refNoMatch && refNoMatch[1]) {
    referenceNumber = refNoMatch[1].trim();
  }

  // Payer Account Last Digit
  const payerAccountMatch = normalizedContent.match(/Payer.*?([0-9\*]+)(?!\s*ETB|\s*\w+)/i);
  if (payerAccountMatch && payerAccountMatch[1]) {
    const fullPayerAccount = payerAccountMatch[1].trim();
    if (fullPayerAccount.length > 0) {
      payerAccountLastDigit = fullPayerAccount[fullPayerAccount.length - 1];
    }
  }

  // Receiver Account Last Digit
  const receiverAccountMatch = normalizedContent.match(/Receiver.*?([A-Z0-9\*]+)/i);
  if (receiverAccountMatch && receiverAccountMatch[1]) {
    const fullReceiverAccount = receiverAccountMatch[1].trim();
    if (fullReceiverAccount.length > 0) {
      receiverAccountLastDigit = fullReceiverAccount[fullReceiverAccount.length - 1];
    }
  }

  // Transferred Amount
  const amountMatch = normalizedContent.match(/ETB([0-9]+\.[0-9]{2})/i);
  if (amountMatch && amountMatch[1]) {
    transferredAmount = `ETB${amountMatch[1].trim()}`;
  }

  // Payment Date
  const paymentDateMatch = normalizedContent.match(/Payment Date\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*([0-9]{1,2})\s*([0-9]{4})/i);
  if (paymentDateMatch) {
    paymentDate = paymentDateMatch[0].replace('Payment Date ', '').trim();
  }

  const scrapedData: ScrapedReceiptData = {
    referenceNumber,
    payerAccountLastDigit,
    receiverAccountLastDigit,
    transferredAmount,
    paymentDate,
  };

  try {
    scrapedReceiptDataSchema.parse(scrapedData);
  } catch (error) {
    console.warn("Scraped data validation failed:", error);
  }

  return scrapedData;
}
