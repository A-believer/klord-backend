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
router.post("/job-application", upload.fields([
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
        <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 24px;">
                <h2 style="color: #2a4365; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">New Job Application</h2>
                <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Name:</td>
                        <td style="padding: 8px 0;">${name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                        <td style="padding: 8px 0;">${email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                        <td style="padding: 8px 0;">${phone}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Position:</td>
                        <td style="padding: 8px 0;">${job}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Reason:</td>
                        <td style="padding: 8px 0;">${reason}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Resume:</td>
                        <td style="padding: 8px 0;">${resume}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Cover Letter:</td>
                        <td style="padding: 8px 0;">${cover}</td>
                    </tr>
                </table>
            </div>
        </div>
    `,
					});

			res.status(200).json({ success: true });
		} catch (err) {
			console.error(err);
			res.status(500).json({ success: false, message: "Submission failed" });
		}
	}
);

// Newsletter signup route
router.post("/newsletter-signup", async (req, res) => {
    const { name, email } = req.body;

     // Add validation
     if (!name || !email) {
        return res.status(400).json({ 
            success: false, 
            message: "Name and email are required fields" 
        });
    }

    try {
        await pool.execute(
            "INSERT INTO newsletter_signup (name, email) VALUES (?, ?)",
            [name, email]
        );

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: `${email} ${process.env.NOTIFY_TO}`,
            subject: "Newsletter Signup Confirmation",
            html: `
        <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 24px;">
                <h2 style="color: #2a4365;">Thank you for signing up, ${name}!</h2>
                <p style="font-size: 16px;">We're excited to have you on our newsletter list.</p>
                <hr style="margin: 24px 0;">
                <h4 style="color: #2a4365;">Your Details:</h4>
                <ul style="font-size: 15px; color: #222;">
                    <li><strong>Name:</strong> ${name}</li>
                    <li><strong>Email:</strong> ${email}</li>
                </ul>
                <p style="margin-top: 24px;">You will start receiving updates from us soon.</p>
            </div>
        </div>
    `
        });

        res.status(200).json({ success: true, message: "Newsletter Signup Successful!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Newsletter Signup failed" });
    }
});

// Get Started route
router.post("/get-started", async (req, res) => {
    const {
        first_name, last_name, job_title, email, phone_number,
        company_name, website_url, industry, team_size,
        help_needed, other_help_needed, project_description,
        project_timeline, estimated_budget
    } = req.body;

    try {
        await pool.execute(
            "INSERT INTO get_started (first_name, last_name, job_title, email, phone_number, company_name, website_url, industry, team_size, help_needed, other_help_needed, project_description, project_timeline, estimated_budget) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [first_name, last_name, job_title, email, phone_number, company_name, website_url, industry, team_size, help_needed, other_help_needed, project_description, project_timeline, estimated_budget]
        );

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.NOTIFY_TO,
            subject: "Get Started Confirmation",
            html: `
        <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 24px;">
                <h2 style="color: #2a4365;">Thank you for reaching out, ${first_name}!</h2>
                <p style="font-size: 16px;">We have received your project inquiry. Here are the details you submitted:</p>
                <hr style="margin: 24px 0;">
                <h4 style="color: #2a4365;">Your Information:</h4>
                <ul style="font-size: 15px; color: #222;">
                    <li><strong>First Name:</strong> ${first_name}</li>
                    <li><strong>Last Name:</strong> ${last_name}</li>
                    <li><strong>Job Title:</strong> ${job_title}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Phone Number:</strong> ${phone_number}</li>
                    <li><strong>Company Name:</strong> ${company_name}</li>
                    <li><strong>Website URL:</strong> ${website_url}</li>
                    <li><strong>Industry:</strong> ${industry}</li>
                    <li><strong>Team Size:</strong> ${team_size}</li>
                </ul>
                <h4 style="color: #2a4365; margin-top: 24px;">Project Details:</h4>
                <ul style="font-size: 15px; color: #222;">
                    <li><strong>Help Needed:</strong> ${help_needed}</li>
                    <li><strong>Other Help Needed:</strong> ${other_help_needed}</li>
                    <li><strong>Project Description:</strong> ${project_description}</li>
                    <li><strong>Project Timeline:</strong> ${project_timeline}</li>
                    <li><strong>Estimated Budget:</strong> ${estimated_budget}</li>
                </ul>
                <p style="margin-top: 24px;">We will contact you soon to discuss your project in more detail.</p>
            </div>
        </div>
    `
        });

        res.status(200).json({ success: true, message: "Get-started submission successful" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Get-started Submission failed" });
    }
});

// Live Chat route
router.post("/live-chat", async (req, res) => {
    const { company_name, email, full_name, postion, selectedPrompts } = req.body;

    // Basic validation
    if (!company_name || !email || !full_name || !postion || !selectedPrompts) {
        return res.status(400).json({
            success: false,
            message: "All fields are required: company_name, email, full_name, postion, selectedPrompts"
        });
    }

    try {
        // Save to DB (optional, if you have a table for live chats)
        await pool.execute(
            "INSERT INTO live_chat (company_name, email, full_name, postion, selected_prompts) VALUES (?, ?, ?, ?, ?)",
            [company_name, email, full_name, postion, JSON.stringify(selectedPrompts)]
        );

        // Send notification email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.NOTIFY_TO,
            subject: "New Live Chat Inquiry",
            html: `
                <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px;">
                    <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 24px;">
                        <h2 style="color: #2a4365;">New Live Chat Inquiry</h2>
                        <ul style="font-size: 15px; color: #222;">
                            <li><strong>Full Name:</strong> ${full_name}</li>
                            <li><strong>Email:</strong> ${email}</li>
                            <li><strong>Company Name:</strong> ${company_name}</li>
                            <li><strong>Position:</strong> ${postion}</li>
                            <li><strong>Selected Prompts:</strong>
                                <ul>
                                    ${selectedPrompts.map(p => `<li>${p}</li>`).join("")}
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            `
        });

        res.status(200).json({ success: true, message: "Live chat inquiry submitted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Live chat submission failed" });
    }
});

export default router;
