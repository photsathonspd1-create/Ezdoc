const Tesseract = require('tesseract.js');
const fs = require('fs');

async function scanReceipt(imagePath) {
    if (!fs.existsSync(imagePath)) {
        console.error('File not found:', imagePath);
        return;
    }

    console.log('AI.EzDoc Vision Engine: Initializing local OCR...');
    
    try {
        const { data: { text } } = await Tesseract.recognize(
            imagePath,
            'eng+tha',
            { logger: m => {} }
        );

        const lines = text.split('\n').filter(l => l.trim().length > 0);
        
        // Advanced Regex for Thai Tax Patterns
        const taxIdMatch = text.match(/\d{13}/);
        const amountMatch = text.match(/([0-9,]+\.[0-9]{2})/);
        
        const result = {
            status: 'success',
            rawText: text,
            metadata: {
                possibleTaxId: taxIdMatch ? taxIdMatch[0] : 'Not found',
                possibleAmount: amountMatch ? amountMatch[0] : 'Not found',
                linesCount: lines.length
            }
        };

        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('Vision Error:', e);
    }
}

const args = process.argv.slice(2);
scanReceipt(args[0] || 'real_receipt.jpg');
