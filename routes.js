import express from "express";
import multer from "multer";
import { pool } from "./db.js";
import { transporter } from "./mailer.js";

const router = express.Router();

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, "uploads/"),
	filename: (req, file, cb) =>
		cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`),
});
const upload = multer({ storage });

// Job application route
router.post(
	"/job-application",
	upload.fields([
		{ name: "resume", maxCount: 1 },
		{ name: "cover", maxCount: 1 },
	]),
	async (req, res) => {
		const { name, email, phone, job, reason } = req.body;
		const resume = req.files.resume?.[0]?.filename || null;
		const cover = req.files.cover?.[0]?.filename || null;

		try {
			await pool.execute(
				"INSERT INTO job_applications (name, email, phone, job, reason, resume, cover) VALUES (?, ?, ?, ?, ?, ?, ?)",
				[name, email, phone, job, reason, resume, cover]
			);

			await transporter.sendMail({
				from: process.env.EMAIL_USER,
				to: process.env.NOTIFY_TO,
				subject: "New Job Application Received",
				html: `
        <strong>Name:</strong> ${name}<br/>
        <strong>Email:</strong> ${email}<br/>
        <strong>Phone:</strong> ${phone}<br/>
        <strong>Position:</strong> ${job}<br/>
        <strong>Reason:</strong> ${reason}<br/>
        <strong>Resume:</strong> ${resume}<br/>
        <strong>Cover Letter:</strong> ${cover}
      `,
			});

			res.json({ success: true });
		} catch (err) {
			console.error(err);
			res.status(500).json({ success: false, message: "Submission failed" });
		}
	}
);

export default router;
