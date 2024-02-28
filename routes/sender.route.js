import express from "express";
import {
  senderEmail,
  amazonSender,
} from "../controllers/sender.controller.js";

const router = express.Router();

router.post("/send", senderEmail);
router.post("/amazon", amazonSender);

export default router;
