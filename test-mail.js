import { transporter } from "./mailer.js";
import dotenv from "dotenv";

await transporter
	.sendMail({
		from: `"Form System" <${process.env.EMAIL_USER}>`,
		to: "davidabolade29@gmail.com",
		subject: "Test Email",
		text: "This is a test email from your backend.",
	})
	.then(() => console.log("✅ Email sent"))
	.catch((err) => console.error("❌ Error:", err));
