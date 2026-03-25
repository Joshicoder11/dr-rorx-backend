const nodemailer = require("nodemailer");

function bool(v) {
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() === "true";
}

exports.transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: bool(process.env.SMTP_SECURE), // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});