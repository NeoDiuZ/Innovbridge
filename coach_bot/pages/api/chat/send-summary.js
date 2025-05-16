import { OpenAI } from 'openai';
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION_VAL,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_VAL,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_VAL,
  },
});

const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL;

async function generateSummary(messages) {
  // Filter out system messages and prepare the conversation for the prompt
  const conversationHistory = messages
    .filter(msg => msg.sender === 'user' || msg.sender === 'bot')
    .map(msg => `${msg.sender === 'user' ? 'User' : 'Coach'}: ${msg.content}`)
    .join('\n');

  const prompt = `
Summarize the following coaching session conversation. Focus on:
1.  The user\'s main goals or topics discussed.
2.  Key insights or advice provided by the coach.
3.  Any actionable steps or recommendations agreed upon.
Keep the summary concise and clear.

Conversation:
${conversationHistory}

Summary:
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Or your preferred model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5, // Adjust for desired creativity/factuality
      max_tokens: 300, // Adjust based on expected summary length
    });
    return completion.choices[0]?.message?.content?.trim() || "Could not generate summary.";
  } catch (error) {
    console.error("Error generating summary with OpenAI:", error);
    throw new Error("Failed to generate summary.");
  }
}

async function sendEmailWithSES({ to, subject, htmlBody, textBody }) {
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlBody,
        },
        Text: {
          Charset: "UTF-8",
          Data: textBody,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: FROM_EMAIL, // This must be a verified SES email address
  };

  try {
    const command = new SendEmailCommand(params);
    const data = await sesClient.send(command);
    console.log("Email sent successfully via SES:", data.MessageId);
    return data;
  } catch (error) {
    console.error("Error sending email with SES:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { sessionId, email, messages } = req.body;

    if (!sessionId || !email || !messages) {
      return res.status(400).json({ error: 'Missing sessionId, email, or messages' });
    }

    if (!process.env.OPENAI_API_KEY || !process.env.AWS_REGION_VAL || !process.env.AWS_ACCESS_KEY_ID_VAL || !process.env.AWS_SECRET_ACCESS_KEY_VAL || !process.env.AWS_SES_FROM_EMAIL) {
      console.error("One or more environment variables are not set.");
      return res.status(500).json({ error: 'Server configuration error. Required environment variables missing.' });
    }
    
    console.log(`Received request to send summary for session ${sessionId} to ${email}`);

    try {
      const summaryText = await generateSummary(messages);

      // Construct email content
      const subject = `Your Coaching Session Summary - Session ID: ${sessionId}`;
      const originalMessagesHtml = messages
        .map(msg => `<p style="margin: 0.5em 0; padding: 0.5em; border-radius: 8px; background-color: ${msg.sender === 'user' ? '#e1f5fe' : '#f0f0f0'}; color: #333;"><strong style="color: ${msg.sender === 'user' ? '#0277bd' : '#555'};">${msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1)} (${new Date(msg.timestamp).toLocaleTimeString()}):</strong> ${msg.content.replace(/\n/g, "<br>")}</p>`)
        .join('');
      
      const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Coaching Session Summary</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
              margin: 0;
              padding: 0;
              background-color: #f4f4f7;
              color: #333333;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            h1, h2 {
              color: #2c3e50;
            }
            h1 {
              font-size: 24px;
              border-bottom: 2px solid #eeeeee;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            h2 {
              font-size: 20px;
              margin-top: 30px;
              margin-bottom: 10px;
              color: #34495e;
            }
            p, .summary-content p {
              line-height: 1.6;
              margin-bottom: 1em;
            }
            .meta-info p {
              font-size: 0.9em;
              color: #555555;
              margin-bottom: 0.5em;
            }
            hr {
              border: 0;
              border-top: 1px solid #dddddd;
              margin: 30px 0;
            }
            .transcript-container {
              margin-top: 20px;
              padding: 15px;
              background-color: #f9f9f9;
              border-radius: 8px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 0.8em;
              color: #888888;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Coaching Session Summary</h1>
            <div class="meta-info">
              <p><strong>Session ID:</strong> ${sessionId}</p>
              <p><strong>Email:</strong> ${email}</p>
            </div>
            
            <h2>AI Generated Summary:</h2>
            <div class="summary-content">
              <p>${summaryText.replace(/\n/g, "<br>")}</p>
            </div>
            
            <hr>
            <h2>Full Conversation Transcript:</h2>
            <div class="transcript-container">
              ${originalMessagesHtml}
            </div>
            
            <p class="footer"><em>This is an automated email. Please do not reply directly.</em></p>
          </div>
        </body>
        </html>
      `;
      
      const textBody = `
Coaching Session Summary
Session ID: ${sessionId}
Email: ${email}

AI Generated Summary:
${summaryText}

---
Full Conversation Transcript:
${messages.map(msg => `${msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1)} (${new Date(msg.timestamp).toLocaleTimeString()}): ${msg.content}`).join('\n\n')}

This is an automated email. Please do not reply directly.
      `;

      await sendEmailWithSES({
        to: email,
        subject: subject,
        htmlBody: htmlBody,
        textBody: textBody,
      });

      console.log(`Summary for session ${sessionId} sent to ${email}`);
      res.status(200).json({ message: 'Summary email sent successfully.' });

    } catch (error) {
      console.error('Error processing send-summary request:', error);
      res.status(500).json({ error: 'Failed to send summary email.', details: error.message });
    }

  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Example placeholder for an email sending function (you'd use a real library)
// async function sendEmail({ to, subject, html }) {
//   console.log(`Simulating email send to: ${to}, Subject: ${subject}`);
//   // Actual email sending logic here
//   return Promise.resolve();
// } 