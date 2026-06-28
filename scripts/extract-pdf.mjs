import fs from "fs";
import { PDFParse } from "pdf-parse";

const pdfPath = String.raw`c:\Users\Safouene\Desktop\S'Oliver - Summer lace edit -  2027.pdf`;
const buf = fs.readFileSync(pdfPath);
const parser = new PDFParse();
const data = await parser.parse(buf);
console.log("PAGES:", data.numpages);
console.log((data.text || "").slice(0, 8000));
