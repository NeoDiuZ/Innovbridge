import { NextResponse } from 'next/server';
import { sendEmailWithSES, generateSummary } from '@/lib/sendEmail';
import { marked } from 'marked';

export async function POST(req) {
  try {
    const { email, summary, transcript, interviewData } = await req.json();

    // Generate a comprehensive summary if not provided
    let summaryMarkdown = summary;
    let summaryHtml = summary ? marked.parse(summary) : '';
    if (!summaryMarkdown) {
      const generated = await generateSummary(transcript, 'interview', interviewData);
      summaryMarkdown = generated.summaryMarkdown;
      summaryHtml = generated.summaryHtml;
    }

    const subject = `Your ${interviewData.interviewType || 'Interview'} Practice Session Summary`;
    
    // Format the transcript with clear visual separation and timestamps
    const originalMessagesHtml = transcript
      .map(msg => `
        <div style="margin: 1em 0; padding: 1em; border-radius: 8px; background-color: ${msg.sender === 'user' ? '#f3f4f6' : '#f0f7ff'};">
          <div style="font-weight: bold; margin-bottom: 0.5em; color: ${msg.sender === 'user' ? '#374151' : '#1e40af'};">
            ${msg.sender === 'user' ? 'You' : 'Interviewer'} (${new Date(msg.timestamp).toLocaleTimeString()})
          </div>
          <div style="white-space: pre-wrap;">${msg.content.replace(/\n/g, "<br>")}</div>
        </div>
      `)
      .join('');

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
          ${interviewData.interviewType || 'Interview'} Practice Session Summary
        </h1>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #1e40af; padding: 20px; margin: 20px 0;">
          <h2 style="color: #1e40af; margin-top: 0;">Session Overview</h2>
          <p><strong>Role:</strong> ${interviewData.role || 'Not specified'}</p>
          <p><strong>Experience Level:</strong> ${interviewData.experience || 'Not specified'}</p>
          <p><strong>Focus Areas:</strong> ${interviewData.focusAreas?.join(', ') || 'Not specified'}</p>
        </div>

        <h2 style="color: #1e40af; margin-top: 30px;">Performance Summary & Feedback</h2>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          ${summaryHtml}
        </div>

        <h2 style="color: #1e40af; margin-top: 30px;">Full Session Transcript</h2>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          ${originalMessagesHtml}
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 0.9em; color: #64748b;">
          <p>This is an automated email from your interview practice session. For the best experience, please ensure you can view HTML emails.</p>
        </div>
      </div>
    `;

    const textBody = `
${interviewData.interviewType || 'Interview'} Practice Session Summary

Session Overview
---------------
Role: ${interviewData.role || 'Not specified'}
Experience Level: ${interviewData.experience || 'Not specified'}
Focus Areas: ${interviewData.focusAreas?.join(', ') || 'Not specified'}

Performance Summary & Feedback
----------------------------
${summaryMarkdown}

Full Session Transcript
----------------------
${transcript.map(msg => `${msg.sender === 'user' ? 'You' : 'Interviewer'} (${new Date(msg.timestamp).toLocaleTimeString()}):
${msg.content}`).join('\n\n')}

Note: This is an automated email from your interview practice session.
    `;

    await sendEmailWithSES({
      to: email,
      subject,
      htmlBody,
      textBody,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
} 