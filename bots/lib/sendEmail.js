import { OpenAI } from 'openai';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sesClient = new SESClient({
  region: process.env.AWS_REGION_VAL,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_VAL,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_VAL,
  },
});

const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL;

export async function generateSummary(messages, promptType = 'coaching', interviewData = null) {
  let conversationHistory = messages
    .filter(msg => msg.sender === 'user' || msg.sender === 'bot')
    .map(msg => `${msg.sender === 'user' ? (promptType === 'interview' ? 'Candidate' : 'User') : (promptType === 'interview' ? 'Interviewer' : 'Coach')}: ${msg.content}`)
    .join('\n');

  let prompt = '';
  if (promptType === 'interview') {
    prompt = `Summarize the following mock interview session${interviewData ? ` for a ${interviewData.role} (${interviewData.interviewType}) at ${interviewData.experience} level` : ''}. Highlight strengths, areas for improvement, and actionable next steps. Use markdown formatting.\n\nSession:\n${conversationHistory}`;
  } else {
    prompt = `As a helpful assistant, please craft a personalized summary of the following coaching session conversation. The summary should be written in a warm, supportive tone and should:\n\n1. Focus on the user's journey, challenges, and achievements\n2. Highlight key insights and breakthroughs from the conversation\n3. Include 2-3 specific, actionable recommendations based on the user's unique situation\n4. Use "you" and "your" to make it more personal and direct\n5. Acknowledge the user's progress and growth\n6. End with an encouraging note\n7. Do not use greetings (like 'Dear User') or sign-offs (like 'Warm regards') in your summary\n\nPlease present this as a flowing narrative, not as a bulleted list. This summary will be sent to the user in an email after their coaching session.\n\nConversation:\n${conversationHistory}\n\nPersonalized Summary and Recommendations:`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });
    return completion.choices[0]?.message?.content?.trim() || 'Could not generate summary.';
  } catch (error) {
    console.error('Error generating summary with OpenAI:', error);
    throw new Error('Failed to generate summary.');
  }
}

export async function sendEmailWithSES({ to, subject, htmlBody, textBody }) {
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: htmlBody,
        },
        Text: {
          Charset: 'UTF-8',
          Data: textBody,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: FROM_EMAIL,
  };

  try {
    const command = new SendEmailCommand(params);
    const data = await sesClient.send(command);
    console.log('Email sent successfully via SES:', data.MessageId);
    return data;
  } catch (error) {
    console.error('Error sending email with SES:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
} 