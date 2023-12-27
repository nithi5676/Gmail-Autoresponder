const express = require("express");
const app = express();
const path = require("path");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://mail.google.com/",
];

const labelName = "Vacation-Mails";

// Function to handle Gmail authentication
async function authenticateGmail() {
  try {
    return await authenticate({
      keyfilePath: path.join(__dirname, "credential.json"),
      scopes: SCOPES,
    });
  } catch (error) {
    console.error('Error in authenticateGmail:', error.message);
    throw error;
  }
}

// Function to get unreplied messages
async function getUnrepliesMessages(auth) {
  try {
    console.log('Function getUnrepliesMessages got hit');
    const gmail = google.gmail({ version: "v1", auth });
    const response = await gmail.users.messages.list({
      userId: "me",
      labelIds: ["INBOX"],
      q: '-in:chats -from:me -has:userlabels',
    });
    return response.data.messages || [];
  } catch (error) {
    console.error('Error in getUnrepliesMessages:', error.message);
    throw error;
  }
}

// Function to add a label to a message
async function addLabel(auth, message, labelId) {
  try {
    const gmail = google.gmail({ version: 'v1', auth });
    await gmail.users.messages.modify({
      userId: 'me',
      id: message.id,
      requestBody: {
        addLabelIds: [labelId],
        removeLabelIds: ['INBOX'],
      },
    });
  } catch (error) {
    console.error('Error in addLabel:', error.message);
    throw error;
  }
}

// Function to create a label
async function createLabel(auth) {
  try {
    console.log('Function createLabel got hit');
    const gmail = google.gmail({ version: "v1", auth });
    const response = await gmail.users.labels.create({
      userId: "me",
      requestBody: {
        name: labelName,
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
      },
    });
    return response.data.id;
  } catch (error) {
    if (error.code === 409) {
      const response = await gmail.users.labels.list({
        userId: "me",
      });
      const label = response.data.labels.find(
        (label) => label.name === labelName
      );
      return label.id;
    } else {
      console.error('Error in createLabel:', error.message);
      throw error;
    }
  }
}

// Function to send a reply
async function sendReply(auth, message) {
  try {
    console.log('Function sendReply got hit');
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.get({
      userId: 'me',
      id: message.id,
      format: 'metadata',
      metadataHeaders: ['Subject', 'From'],
    });
    const subject = res.data.payload.headers.find(
      (header) => header.name === 'Subject'
    ).value;
    const from = res.data.payload.headers.find(
      (header) => header.name === 'From'
    ).value;

    // Check if the regex match is successful before accessing the captured group
    const matchResult = from.match(/<(.*)>/);
    const replyTo = matchResult ? matchResult[1] : from; // Use from if the match is null

    const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;
    const replyBody = `Hi, \n\nI'm currently on vacation and will get back to you soon.\n\n Best, \nNithish Kumar `;
    const rawMessage = [
      `From: me`,
      `To: ${replyTo}`,
      `Subject: ${replySubject}`,
      `In-Reply-To: ${message.id}`,
      `References: ${message.id}`,
      '',
      replyBody,
    ].join('\n');
    const encodedMessage = Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
  } catch (error) {
    console.error('Error in sendReply:', error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    const auth = await authenticateGmail();
    const labelId = await createLabel(auth);
    console.log(`Label has been created ${labelId}`);
    setInterval(async () => {
      const messages = await getUnrepliesMessages(auth);
      console.log(`Found ${messages.length} unreplied messages`);

      for (const message of messages) {
        await sendReply(auth, message);
        console.log(`Sent reply to message with id ${message.id}`);

        await addLabel(auth, message, labelId);
        console.log(`Added label to message with id ${message.id}`);
      }
    }, Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000); // Random interval between 45 and 120 seconds
  } catch (error) {
    console.error('Error in main:', error.message);
  }
}

// Express route
app.get("/api", async (req, res) => {
  res.status(200).json({ message: "API is running" });
});

// Express server
app.listen(4000, () => {
  console.log(`Server is running on port 4000`);
});

// Call the main function
main();
