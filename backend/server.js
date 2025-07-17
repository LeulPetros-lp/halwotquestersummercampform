const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Function to extract all text content
function extractAllText(text) {
  // Normalize whitespace but keep all characters
  return text.replace(/\s+/g, ' ').trim();
}

// Function to check if the receipt is a valid Telebirr receipt
function isValidTelebirrReceipt(text) {
  // Check for exact "Telebirr" as a word in the text
  // This ensures it's not part of another word and is properly capitalized
  return /(^|\s)Telebirr(\s|$)/.test(text);
}

// Upload and process PDF endpoint
app.post('/api/process-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    
    // Check file type
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ error: 'File size must be less than 5MB' });
    }

    // Extract text from PDF
    const data = await pdfParse(fileBuffer);
    const extractedText = extractAllText(data.text);
    
    if (!extractedText.trim()) {
      return res.status(400).json({ 
        error: 'No text could be extracted from the PDF',
        isTelebirr: false
      });
    }

    // Check if this is a valid Telebirr receipt
    const isTelebirr = isValidTelebirrReceipt(extractedText);
    if (!isTelebirr) {
      return res.status(400).json({ 
        error: 'Invalid receipt. Must be an official Telebirr receipt',
        isTelebirr: false
      });
    }

    res.json({
      success: true,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      previewText: extractedText.substring(0, 1000), // First 1000 chars as preview
      isTelebirr: true
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ 
      error: 'Error processing PDF',
      details: error.message 
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
