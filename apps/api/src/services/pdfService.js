import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { env } from '../config/env.js';

/**
 * Generates printable PDF warranty certificate
 */
export async function generateWarrantyPdf(warranty, qrTokenString) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Generate QR Code data URL
      const verifyUrl = `${env.WEB_URL}/verify/${qrTokenString}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 140, margin: 1 });
      const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

      // Header Banner
      doc.rect(40, 40, 515, 60).fill('#092032');
      doc.fillColor('#f1a501').fontSize(22).font('Helvetica-Bold').text('MW — My Warranty', 55, 53);
      doc.fillColor('#f1a501').fontSize(10).font('Helvetica').text('Official Digital Warranty Certificate', 55, 82);

      // Issuing Company Info
      doc.fillColor('#0f2744').fontSize(14).font('Helvetica-Bold').text(warranty.companySnapshot?.businessName || 'Authorized Retailer', 40, 120);
      doc.fillColor('#64748b').fontSize(9).font('Helvetica').text(`Contact: ${warranty.companySnapshot?.contactEmail || 'N/A'}`, 40, 137);

      // Certificate Details Box
      doc.rect(40, 155, 515, 110).strokeColor('#cbd5e1').stroke();
      
      // Left Column
      doc.fillColor('#334155').fontSize(9).font('Helvetica-Bold').text('WARRANTY NUMBER:', 50, 165);
      doc.fillColor('#0f2744').fontSize(13).font('Helvetica-Bold').text(warranty.warrantyNumber, 50, 178);

      doc.fillColor('#334155').fontSize(9).font('Helvetica-Bold').text('CUSTOMER NAME:', 50, 200);
      doc.fillColor('#0f2744').fontSize(10).font('Helvetica').text(warranty.customerSnapshot?.fullName || 'N/A', 50, 212);

      doc.fillColor('#334155').fontSize(9).font('Helvetica-Bold').text('CUSTOMER EMAIL:', 50, 230);
      doc.fillColor('#0f2744').fontSize(10).font('Helvetica').text(warranty.customerSnapshot?.email || 'N/A', 50, 242);

      // Middle Column
      doc.fillColor('#334155').fontSize(9).font('Helvetica-Bold').text('PRODUCT:', 210, 165);
      doc.fillColor('#0f2744').fontSize(10).font('Helvetica-Bold').text(`${warranty.product?.brand} ${warranty.product?.name}`, 210, 178);

      doc.fillColor('#334155').fontSize(9).font('Helvetica-Bold').text('MODEL / SERIAL:', 210, 200);
      doc.fillColor('#0f2744').fontSize(10).font('Helvetica').text(`${warranty.product?.model || 'N/A'} / ${warranty.product?.serialNumber || 'Unspecified'}`, 210, 212);

      doc.fillColor('#334155').fontSize(9).font('Helvetica-Bold').text('PURCHASE DATE:', 210, 230);
      doc.fillColor('#0f2744').fontSize(10).font('Helvetica').text(new Date(warranty.purchase?.purchaseDate).toLocaleDateString(), 210, 242);

      // QR Code
      doc.image(qrBuffer, 400, 140, { width: 120 });
      doc.fontSize(8).fillColor('#64748b').text('Scan to Verify', 438, 260);

      // Validity & Coverage Section
      doc.fillColor('#0f2744').fontSize(12).font('Helvetica-Bold').text('Warranty Duration & Expiry', 40, 280);
      doc.rect(40, 295, 515, 45).fill('#f8fafc');
      doc.fillColor('#334155').fontSize(9).font('Helvetica-Bold').text('VALID FROM:', 50, 305);
      doc.fillColor('#0f2744').fontSize(10).font('Helvetica').text(new Date(warranty.warranty?.startDate).toLocaleDateString(), 50, 318);

      doc.fillColor('#334155').fontSize(9).font('Helvetica-Bold').text('EXPIRATION DATE:', 210, 305);
      doc.fillColor('#0d9488').fontSize(11).font('Helvetica-Bold').text(new Date(warranty.warranty?.expiryDate).toLocaleDateString(), 210, 318);

      doc.fillColor('#334155').fontSize(9).font('Helvetica-Bold').text('DURATION:', 370, 305);
      doc.fillColor('#0f2744').fontSize(10).font('Helvetica').text(`${warranty.warranty?.duration} ${warranty.warranty?.durationUnit}`, 370, 318);

      // Policy Terms & Clauses
      doc.fillColor('#0f2744').fontSize(12).font('Helvetica-Bold').text(`Issued Policy Terms (${warranty.policySnapshot?.name})`, 40, 355);

      let currentY = 375;
      const clauses = warranty.policySnapshot?.clauses || [];

      for (const clause of clauses.slice(0, 6)) {
        doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold').text(`• [${clause.type.toUpperCase()}] ${clause.title}`, 45, currentY);
        currentY += 13;
        doc.fillColor('#475569').fontSize(8).font('Helvetica').text(clause.text, 55, currentY, { width: 490 });
        currentY += Math.max(22, Math.ceil(clause.text.length / 90) * 11);
      }

      // Security & Digital Integrity Footer
      doc.rect(40, 720, 515, 60).fill('#f1f5f9');
      doc.fillColor('#0f2744').fontSize(8).font('Helvetica-Bold').text('CRYPTOGRAPHIC INTEGRITY & VERIFICATION', 50, 728);
      doc.fillColor('#64748b').fontSize(7).font('Helvetica').text(`SHA-256 Record Hash: ${warranty.recordIntegrity?.recordHash || 'N/A'}`, 50, 740);
      doc.text(`Digital Signature Key ID: ${warranty.recordIntegrity?.keyId || 'N/A'} (Algorithm: ${warranty.recordIntegrity?.algorithm || 'RSA-SHA256'})`, 50, 752);
      doc.text(`Public Verification URL: ${verifyUrl}`, 50, 764);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

