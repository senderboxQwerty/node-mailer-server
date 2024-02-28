import nodemailer from "nodemailer";
import dotenv from "dotenv";
import pQueue from "p-queue";

dotenv.config();

const getRandomElement = (array) =>
  array[Math.floor(Math.random() * array.length)];

export const senderEmail = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const {
      smtps,
      emailList,
      firstName,
      lastName,
      senderName,
      emailSubject,
      attachment,
      attachmentName,
      letter,
    } = req.body;

    const smtpCount = smtps.length;
    const senderCount = senderName.length;
    const subjectCount = emailSubject.length;
    const attachmentCount = attachment.length;
    const attachmentNameCount = attachmentName.length;
    const letterCount = letter.length;
    const firstNameCount = firstName.length;
    const lastNameCount = lastName.length;

    const smtpServers = smtps.map(
      ({ host, port, email, password, security }) => ({
        host,
        port,
        secure: security === "SSL" ? true : security === "Tls" ? false : false,
        auth: { user: email, pass: password },
      })
    );

    const createTransporter = (smtpConfig) =>
      nodemailer.createTransport(smtpConfig);

    const getRandomTransporter = () =>
      createTransporter(getRandomElement(smtpServers));

    const emailQueue = new pQueue({ concurrency: 100 });

    const sendEmail = async (
      email,
      senderName,
      emailSubject,
      attachment,
      attachmentName,
      letter,
      firstName,
      lastName,
    ) => {
      const transporter = getRandomTransporter();

      const personalizedLetter = letter
        .replace(/{userEmail}/g, email)
        .replace(/{firstName}/g, firstName)
        .replace(/{lastName}/g, lastName);

      const mailOptions = {
        from: {
          name: senderName,
          address: transporter.options.auth.user,
        },
        to: email,
        subject: emailSubject,
        html: personalizedLetter,
      };

      if (attachmentName && attachment) {
        mailOptions.attachments = [
          {
            filename: attachmentName,
            path: attachment,
            //encoding: 'base64',
          },
        ];
      }

      const options = {
        ...mailOptions,
        from: { ...mailOptions.from, address: transporter.options.auth.user },
      };

      try {
        const info = await transporter.sendMail(options);
        console.log(`Email sent to ${email}: ${info.response}`);
        return { email, status: "success" };
      } catch (error) {
        console.error(`Failed to send email to ${email}: ${error.message}`);
        return { email, status: "failed", error: error.message };
      }
    };

    const results = await Promise.all(
      emailList.map((email, index) =>
        emailQueue.add(() =>
          sendEmail(
            email,
            senderName[index % senderCount],
            emailSubject[index % subjectCount],
            attachment[index % attachmentCount],
            attachmentName[index % attachmentNameCount],
            letter[index % letterCount],
            firstName[index % firstNameCount],
            lastName[index % lastNameCount]
          )
        )
      )
    );

    res.status(200).json({ message: "Emails sent successfully", results });
  } catch (error) {
    console.error(`Failed to send emails: ${error.message}`);
    res
      .status(500)
      .json({ message: "Failed to send emails", error: error.message });
  }
};

export const amazonSender = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const {
      smtps,
      emailList,
      senderName,
      fromEmail,
      emailSubject,
      attachment,
      attachmentName,
      letter,
    } = req.body;

    const smtpCount = smtps.length;
    const senderCount = senderName.length;
    const fromCount = fromEmail.length;
    const subjectCount = emailSubject.length;
    const attachmentCount = attachment.length;
    const attachmentNameCount = attachmentName.length;
    const letterCount = letter.length;

    const smtpServers = smtps.map(
      ({ host, port, username, password, security }) => ({
        host,
        port,
        secure: security === "SSL" ? true : security === "Tls" ? false : false,
        auth: { user: username, pass: password },
        debug: true,
      })
    );

    const createTransporter = (smtpConfig) =>
      nodemailer.createTransport(smtpConfig);

    const getRandomTransporter = () =>
      createTransporter(getRandomElement(smtpServers));

    const emailQueue = new pQueue({ concurrency: 100 });

    const sendEmail = async (
      email,
      fromEmail,
      senderName,
      emailSubject,
      attachment,
      attachmentName,
      letter
    ) => {
      const transporter = getRandomTransporter();

      const chosenFromEmail = Array.isArray(fromEmail)
        ? getRandomElement(fromEmail)
        : fromEmail;

      const personalizedLetter = letter.replace(/{userEmail}/g, email);

      const mailOptions = {
        from: {
          name: senderName,
          address: chosenFromEmail,
        },
        to: email,
        subject: emailSubject,
        html: personalizedLetter,
      };

      if (attachmentName && attachment) {
        mailOptions.attachments = [
          {
            filename: attachmentName,
            path: attachment,
            //encoding: 'base64',
          },
        ];
      }

      const options = {
        ...mailOptions,
        from: { ...mailOptions.from, address: chosenFromEmail },
      };

      try {
        const info = await transporter.sendMail(options);
        console.log(`Email sent to ${email}: ${info.response}`);
        return { email, status: "success" };
      } catch (error) {
        console.error(`Failed to send email to ${email}: ${error.message}`);
        return { email, status: "failed", error: error.message };
      }
    };

    const results = await Promise.all(
      emailList.map((email, index) =>
        emailQueue.add(() =>
          sendEmail(
            email,
            senderName[index % senderCount],
            fromEmail[index % fromCount],
            emailSubject[index % subjectCount],
            attachment[index % attachmentCount],
            attachmentName[index % attachmentNameCount],
            letter[index % letterCount]
          )
        )
      )
    );

    res.status(200).json({ message: "Emails sent successfully", results });
  } catch (error) {
    console.error(`Failed to send emails: ${error.message}`);
    res
      .status(500)
      .json({ message: "Failed to send emails", error: error.message });
  }
};

export const senderReuseableEmail = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const {
      smtps,
      emailList,
      senderName,
      emailSubject,
      attachment,
      attachmentName,
      letter,
    } = req.body;

    const smtpServers = smtps.map(
      ({ host, port, email, password, security }) => ({
        host,
        port,
        secure: security === "SSL" ? true : security === "Tls" ? false : false,
        auth: { user: email, pass: password },
      })
    );

    const createTransporter = (smtpConfig) =>
      nodemailer.createTransport(smtpConfig);

    const getRandomTransporter = () =>
      createTransporter(getRandomElement(smtpServers));

    const emailQueue = new pQueue({ concurrency: 100 });

    const mailOptions = {
      from: {
        name: senderName,
        address: "",
      },
      subject: emailSubject,
      html: letter,
    };

    if (attachmentName && attachment) {
      mailOptions.attachments = [
        {
          filename: attachmentName,
          path: attachment,
          //encoding: 'base64',
        },
      ];
    }

    const sendEmail = async (email) => {
      const transporter = getRandomTransporter();

      const personalizedLetter = letter.replace(/{userEmail}/g, email);

      const options = {
        ...mailOptions,
        to: email,
        from: { ...mailOptions.from, address: transporter.options.auth.user },
        html: personalizedLetter,
      };

      try {
        const info = await transporter.sendMail(options);
        console.log(`Email sent to ${email}: ${info.response}`);
        return { email, status: "success" };
      } catch (error) {
        console.error(`Failed to send email to ${email}: ${error.message}`);
        return { email, status: "failed", error: error.message };
      }
    };

    const results = await Promise.all(
      emailList.map((email) => emailQueue.add(() => sendEmail(email)))
    );

    res.status(200).json({ message: "Emails sent successfully", results });
  } catch (error) {
    console.error(`Failed to send emails: ${error.message}`);
    res
      .status(500)
      .json({ message: "Failed to send emails", error: error.message });
  }
};

export const amazonReuseableSender = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const {
      smtps,
      emailList,
      senderName,
      fromEmail,
      emailSubject,
      attachment,
      attachmentName,
      letter,
    } = req.body;

    const smtpServers = smtps.map(
      ({ host, port, username, password, security }) => ({
        host,
        port,
        secure: security === "SSL" ? true : security === "Tls" ? false : false,
        auth: { user: username, pass: password },
        debug: true,
      })
    );

    const createTransporter = (smtpConfig) =>
      nodemailer.createTransport(smtpConfig);

    const getRandomTransporter = () =>
      createTransporter(getRandomElement(smtpServers));

    const emailQueue = new pQueue({ concurrency: 100 });

    const mailOptions = {
      from: {
        name: senderName,
        address: "",
      },
      subject: emailSubject,
      html: letter,
    };

    if (attachmentName && attachment) {
      mailOptions.attachments = [
        {
          filename: attachmentName,
          path: attachment,
          //encoding: 'base64',
        },
      ];
    }

    const sendEmail = async (email) => {
      const transporter = getRandomTransporter();

      const chosenFromEmail = Array.isArray(fromEmail)
        ? getRandomElement(fromEmail)
        : fromEmail;

      const personalizedLetter = letter.replace(/{userEmail}/g, email);

      const options = {
        ...mailOptions,
        to: email,
        from: { ...mailOptions.from, address: chosenFromEmail },
        html: personalizedLetter,
      };

      try {
        const info = await transporter.sendMail(options);
        console.log(`Email sent to ${email}: ${info.response}`);
        return { email, status: "success" };
      } catch (error) {
        console.error(`Failed to send email to ${email}: ${error.message}`);
        return { email, status: "failed", error: error.message };
      }
    };

    const results = await Promise.all(
      emailList.map((email) => emailQueue.add(() => sendEmail(email)))
    );

    res.status(200).json({ message: "Emails sent successfully", results });
  } catch (error) {
    console.error(`Failed to send emails: ${error.message}`);
    res
      .status(500)
      .json({ message: "Failed to send emails", error: error.message });
  }
};