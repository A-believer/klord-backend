import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const port = Number(process.env.EMAIL_PORT) || 587;
const isSecure = port === 465; // true for 465, false for other ports

export const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: port,
	secure: isSecure,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
	tls: !isSecure
		? { rejectUnauthorized: false }
		: undefined, // Only set TLS options if not using SSL
});

// Verify connection configuration
transporter.verify(function (error, success) {
	if (error) {
		console.log("SMTP Server connection error: ", error);
	} else {
		console.log("SMTP Server is ready to take our messages");
	}
});
