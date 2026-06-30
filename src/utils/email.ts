import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(data);
  } catch (err) {
    console.error('QR Code generation error:', err);
    throw err;
  }
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendTicketEmail = async (email: string, buyerName: string, concertName: string, tickets: any[]) => {
  const mailOptions = {
    from: `"HAHAHIHIFEST" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your Tickets for ${concertName} - HAHAHIHIFEST`,
    html: `
    <body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Helvetica Neue',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:30px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.08);">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#6C2BD9,#FF3D81);padding:35px 30px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">HAHAHIHIFEST</h1>
                  <p style="color:#f0e6ff;margin:8px 0 0;font-size:14px;">Official E-Ticket Confirmation</p>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="padding:30px 30px 10px;">
                  <p style="font-size:16px;color:#222;margin:0;">Hi <b>${buyerName}</b>, 🎉</p>
                  <p style="font-size:14px;color:#555;margin:8px 0 0;line-height:1.5;">
                    Terima kasih sudah membeli tiket untuk <b>${concertName}</b>. Tunjukkan QR code di bawah ini saat masuk venue.
                  </p>
                </td>
              </tr>

              <!-- Tickets -->
              <tr>
                <td style="padding:10px 30px 20px;">
                  ${tickets.map(t => `
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-radius:10px;overflow:hidden;border:1px solid #eee;">
                      <tr>
                        <!-- Left: ticket info -->
                        <td style="background:#1A1A2E;padding:20px;width:65%;vertical-align:middle;">
                          <p style="color:#9D8CFF;font-size:11px;letter-spacing:1px;margin:0 0 4px;text-transform:uppercase;">${t.category}</p>
                          <p style="color:#ffffff;font-size:18px;font-weight:bold;margin:0 0 10px;">${concertName}</p>
                          <p style="color:#aaaaaa;font-size:12px;margin:0;font-family:monospace;letter-spacing:1px;">
                            TICKET # ${t.ticketNumber}
                          </p>
                        </td>
                        <!-- Divider (perforated look) -->
                        <td style="width:0;border-left:2px dashed #444;"></td>
                        <!-- Right: QR -->
                        <td style="background:#16162A;padding:15px;width:35%;text-align:center;vertical-align:middle;">
                          <img src="cid:${t.ticketNumber}" alt="QR Code" width="110" height="110" style="background:#fff;padding:6px;border-radius:8px;display:block;margin:0 auto;" />
                        </td>
                      </tr>
                    </table>
                  `).join('')}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 30px 30px;border-top:1px solid #eee;">
                  <p style="font-size:12px;color:#888;margin:0;line-height:1.6;">
                    Simpan email ini sebagai bukti tiket kamu. QR code juga tersedia sebagai lampiran (attachment) jika dibutuhkan untuk dicetak.<br/>
                    Sampai jumpa di <b>${concertName}</b>! 🎶
                  </p>
                </td>
              </tr>

            </table>
            <p style="font-size:11px;color:#aaa;margin-top:15px;">&copy; ${new Date().getFullYear()} HAHAHIHIFEST. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
    `,
    attachments: tickets.map(t => ({
      filename: `ticket-${t.ticketNumber}.png`,
      content: t.qrBase64.split('base64,')[1],
      encoding: 'base64',
      cid: t.ticketNumber
    }))
  };

  return transporter.sendMail(mailOptions);
};
