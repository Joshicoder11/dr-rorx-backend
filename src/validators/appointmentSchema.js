const { z } = require("zod");

const phoneRegex = /^[0-9+\-\s()]{8,18}$/;

exports.appointmentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
  email: z.string().email("Invalid email"),
  doctorId: z.enum(["aman", "shiba"], { errorMap: () => ({ message: "Select a doctor" }) }),
  date: z.string().min(4, "Select a date"),
  timeSlot: z.string().min(3, "Select a time slot"),
  message: z.string().optional().default("")
});
``