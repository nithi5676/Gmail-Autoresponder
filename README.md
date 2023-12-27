# Gmail Autoresponder App

This Node.js-based app automates the process of responding to emails during your vacation. It uses the Gmail API to check for new emails, sends auto-replies to first-time email threads, and adds a specified label to the emails.

## Features

- Checks for new emails in a specified Gmail ID.
- Sends replies to emails with no prior replies.
- Adds a label to processed emails and moves them to the labeled folder.
- Runs the sequence of steps in random intervals between 45 to 120 seconds.

## Prerequisites

- Node.js installed
- Gmail API credentials (`credential.json`)
- Google Cloud project set up with the Gmail API enabled

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/gmail-autoresponder-app.git

**2.Install dependencies:**
   ``` 
   cd gmail-autoresponder-app
   npm install
```

3.Set up your credential.json file by following the instructions in Google's Gmail API documentation.
**4.Start the application:**
   ```
    node index.js
```

**Configuration**

Update the SCOPES array in index.js if additional Gmail API scopes are required.
Customize the labelName variable to set the label applied to processed emails.

**Technical Details**

Built with Node.js using modern JavaScript standards.
Utilizes the Google Cloud @google-cloud/local-auth library for authentication.
Implements the Gmail API for reading, sending, and labeling emails.

**Error Handling**

The code includes error handling for critical functions to prevent crashes and provide meaningful error messages.
