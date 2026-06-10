const fs = require('fs');

if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {
    constructor() {}
  };
}

const pdfParse = require('pdf-parse');
console.log('pdfParse loaded successfully');
process.exit(0);
