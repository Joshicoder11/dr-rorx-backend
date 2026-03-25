const router = require("express").Router();
const { appointmentSchema } = require("../validators/appointmentSchema");
const { transporter } = require("../services/mailer");
const { doctorLabel, appointmentEmailHtml } = require("../utils/formatters");
const twilio = require("twilio");

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

function normalizePhone(phone) {
  if (!phone) return null;
  let cleaned = String(phone).trim();
  if (!cleaned.startsWith("+")) {
    cleaned = cleaned.replace(/[^0-9]/g, "");
    if (!cleaned.startsWith("91")) cleaned = `91${cleaned}`;
    cleaned = `+${cleaned}`;
  }
  return cleaned;
}

async function sendWhatsAppMessage(toPhone, message) {
  if (!twilioClient || !process.env.TWILIO_WHATSAPP_FROM) {
    throw new Error("Twilio WhatsApp credentials not configured");
  }

  const to = `whatsapp:${toPhone}`;
  const from = `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`;

  return twilioClient.messages.create({ body: message, from, to });
}

async function sendSmsMessage(toPhone, message) {
  if (!twilioClient || !process.env.TWILIO_SMS_FROM) {
    throw new Error("Twilio SMS credentials not configured");
  }

  return twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_SMS_FROM,
    to: toPhone
  });
}

router.post("/", async (req, res) => {
  try {
    const parsed = appointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message || "Invalid data";
      return res.status(400).json({ ok: false, message: msg });
    }

    const payload = parsed.data;
    const html = appointmentEmailHtml({
      ...payload,
      doctorLabel: doctorLabel(payload.doctorId)
    });

    const mailOptions = {
      from: process.env.MAIL_FROM || "contact@rorxhealthcare.com",
      to: process.env.MAIL_TO || "contact@rorxhealthcare.com",
      subject: `Appointment Request: ${payload.name} • ${payload.date} • ${payload.timeSlot}`,
      html
    };

    const info = await transporter.sendMail(mailOptions);

    const confirmationMessage = `Hello ${payload.name},\n\nThank you for booking an appointment with Dr. RorX Healthcare. Your appointment details are:\n- Doctor: ${doctorLabel(payload.doctorId)}\n- Date: ${payload.date}\n- Time: ${payload.timeSlot}\n\nWe will contact you shortly for confirmation.`;
    const normalizedPhone = normalizePhone(payload.phone);

    let whatsappResult = null;
    let smsResult = null;

    if (normalizedPhone) {
      try {
        whatsappResult = await sendWhatsAppMessage(normalizedPhone, confirmationMessage);
      } catch (whatsappErr) {
        console.warn("WhatsApp message failed, falling back to SMS:", whatsappErr.message || whatsappErr);
        try {
          smsResult = await sendSmsMessage(normalizedPhone, confirmationMessage);
        } catch (smsErr) {
          console.error("SMS fallback failed:", smsErr.message || smsErr);
        }
      }
    } else {
      console.warn("Appointment form submitted without valid phone number for WhatsApp/SMS notifications");
    }

    return res.json({
      ok: true,
      message: "Appointment request sent.",
      id: info.messageId,
      notifications: {
        whatsapp: whatsappResult ? "sent" : "failed",
        sms: smsResult ? "sent" : (whatsappResult ? "not_sent" : "not_attempted")
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Failed to send appointment request." });
  }
});

module.exports = router;