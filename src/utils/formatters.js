exports.doctorLabel = (doctorId) => {
  if (doctorId === "aman") return "Dr. Aman Ror (General Physician & Pediatric Specialist)";
  if (doctorId === "shiba") return "Dr. Shiba Aman Ror (Gynecologist & Obstetrics Specialist)";
  return "Unknown Doctor";
};

exports.appointmentEmailHtml = (payload) => {
  const rows = [
    ["Name", payload.name],
    ["Phone", payload.phone],
    ["Email", payload.email],
    ["Doctor", payload.doctorLabel],
    ["Preferred Date", payload.date],
    ["Time Slot", payload.timeSlot],
    ["Message", payload.message || "—"]
  ];

  const tr = rows
    .map(
      ([k, v]) => `
      <tr>
        <td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:700;">${k}</td>
        <td style="padding:10px 12px;border:1px solid #e2e8f0;">${String(v).replace(/</g, "&lt;")}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#0f172a;">
    <h2 style="margin:0 0 10px;">New Appointment Request — Dr. RorX Healthcare</h2>
    <p style="margin:0 0 16px;color:#334155;">
      A new appointment request has been submitted from the website.
    </p>
    <table style="border-collapse:collapse;width:100%;max-width:720px;">
      ${tr}
    </table>
    <p style="margin-top:16px;color:#64748b;font-size:12px;">
      Sent automatically from the clinic website booking form.
    </p>
  </div>`;
};