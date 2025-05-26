import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/api", routes);
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

app.listen(process.env.PORT, () => {
	console.log(`Server running on port ${process.env.PORT}`);
});
