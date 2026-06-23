"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTicketEmail = exports.generateQRCode = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const qrcode_1 = __importDefault(require("qrcode"));
const generateQRCode = async (data) => {
    try {
        return await qrcode_1.default.toDataURL(data);
    }
    catch (err) {
        console.error('QR Code generation error:', err);
        throw err;
    }
};
exports.generateQRCode = generateQRCode;
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendTicketEmail = async (email, buyerName, concertName, tickets) => {
    const mailOptions = {
        from: `"HAHAHIHIFEST" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Your Tickets for ${concertName} - HAHAHIHIFEST`,
        html: `
      <h1>Hi ${buyerName}, thank you for your purchase!</h1>
      <p>Here are your tickets for <b>${concertName}</b>:</p>
      <hr />
      ${tickets.map(t => `
        <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px;">
          <h3>Ticket #: ${t.ticketNumber}</h3>
          <p>Category: ${t.category}</p>
          <img src="cid:${t.ticketNumber}" alt="QR Code" width="200" />
        </div>
      `).join('')}
    `,
        attachments: tickets.map(t => ({
            filename: `ticket-${t.ticketNumber}.png`,
            content: t.qrBase64.split('base64,')[1],
            encoding: 'base64',
            cid: t.ticketNumber // same as in img src="cid:..."
        }))
    };
    return transporter.sendMail(mailOptions);
};
exports.sendTicketEmail = sendTicketEmail;
