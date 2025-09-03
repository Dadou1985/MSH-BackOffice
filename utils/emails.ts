import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.IONOS_SMTP_HOST,
  port: Number(process.env.IONOS_SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.IONOS_AUTH,
    pass: process.env.IONOS_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendCheckOutEmail(email: string, logo: string, hotelName: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `${hotelName} <contact@mysweethotel.com>`,
      to: email,
      subject: 'E-mail de remerciement',
      html: `<div><p>Cher.e client.e,</p><p>Vous accueillir au sein de notre établissement fut un immense plaisir et nous tenions encore à vous remercier pour la confiance que vous nous avez accordé.</p><p>Nous espérons que nos efforts ont contribué à rendre votre séjour agréable.</p><p>Nous vous souhaitons un bon retour avec l'espoir de vous revoir très bientôt.</p><p>Cordialement</p><div><br/><br/><img src=${logo} width='100' height="100" /><p>${hotelName}</p></div></div>`,
    });
    return true;
  } catch (error) {
    console.error('Error sending checkout email:', error);
    throw new Error('Failed to send email');
  }
}