import { NextResponse } from 'next/server';
import { sendEmailWithSES, generateSummary } from '@/lib/sendEmail';

async function handler(req) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }
  try {
    const { email, summary, transcript, interviewData } = await req.json();

    // If summary is not provided, generate it
    let summaryText = summary;
    if (!summaryText) {
      summaryText = await generateSummary(transcript, 'interview', interviewData);
    }

    const subject = `Your Interview Practice Session Summary`;
    const originalMessagesHtml = transcript
      .map(msg => `<p style="margin: 0.5em 0; padding: 0.5em; border-radius: 8px; background-color: ${msg.sender === 'user' ? '#e1f5fe' : '#f0f0f0'}; color: #333;"><strong style="color: ${msg.sender === 'user' ? '#0277bd' : '#555'};">${msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1)} (${new Date(msg.timestamp).toLocaleTimeString()}):</strong> ${msg.content.replace(/\n/g, "<br>")}</p>`)
      .join('');

    const htmlBody = `
      <div>
        <h1>Interview Practice Session Summary</h1>
        <h2>AI Generated Summary:</h2>
        <div>${summaryText.replace(/\n/g, '<br>')}</div>
        <hr>
        <h2>Full Conversation Transcript:</h2>
        <div>${originalMessagesHtml}</div>
        <p style="font-size:0.8em;color:#888;">This is an automated email. Please do not reply directly.</p>
      </div>
    `;

    const textBody = `
Interview Practice Session Summary

AI Generated Summary:
${summaryText}

---
Full Conversation Transcript:
${transcript.map(msg => `${msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1)} (${new Date(msg.timestamp).toLocaleTimeString()}): ${msg.content}`).join('\n\n')}
    `;

    await sendEmailWithSES({
      to: email,
      subject,
      htmlBody,
      textBody,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email.', details: error.message }, { status: 500 });
  }
}

export default handler; 