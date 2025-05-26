# InnovBridge Bot Platform

InnovBridge is an AI-powered platform that provides intelligent assistants to help users achieve their goals. The platform includes specialized bots for coaching, interview preparation, and FAQ support.

## Available Bots

### 1. CoachBot
- Personal AI coach following ICF guidelines
- Goal setting and achievement support
- Action plan development
- Self-awareness building

### 2. InterviewBot
- Mock interview practice
- Personalized feedback
- Multiple interview types (behavioral, technical, system design)
- Skill improvement tracking

### 3. FAQ Bot
- Instant answers based on knowledge base
- Customizable content support
- 24/7 assistance
- Admin-managed knowledge base

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Add your OpenAI API key
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## FAQ Bot Knowledge Base Management

**IMPORTANT**: The FAQ bot knowledge base should only be managed by administrators for security reasons.

### For Administrators

To update the FAQ bot's knowledge base:

1. **Direct File Editing** (Recommended):
   - Edit the file `data/faq-knowledge.txt` directly
   - Restart the application for changes to take effect
   - Ensure proper formatting with clear headings and structure

2. **File Structure**:
   ```
   data/
   └── faq-knowledge.txt  # Main knowledge base file
   ```

3. **Content Guidelines**:
   - Use clear headings and sections
   - Include specific questions and answers
   - Structure content with bullet points
   - Add examples and use cases
   - Keep information current and accurate

4. **Example Content Structure**:
   ```
   TOPIC NAME
   ==========

   Question 1?
   Answer with detailed information...

   Question 2?
   Another detailed answer...

   SUBTOPIC
   --------
   - Bullet point 1
   - Bullet point 2
   ```

### Security Notes

- The knowledge base is read-only from the user interface
- Only server administrators should have access to modify the `data/faq-knowledge.txt` file
- No API endpoints expose knowledge base modification to end users
- Consider implementing additional authentication for future admin interfaces

## Development

### Project Structure

```
app/
├── api/
│   ├── chat/          # CoachBot API
│   ├── interview/     # InterviewBot API
│   └── faq/           # FAQ Bot API
├── components/        # Shared components
├── interview/         # InterviewBot pages
├── questionnaire/     # CoachBot pages
└── faq/              # FAQ Bot pages

data/
└── faq-knowledge.txt  # FAQ knowledge base (admin-managed)
```

### Adding New Bots

1. Create API endpoints in `app/api/[bot-name]/`
2. Create frontend pages in `app/[bot-name]/`
3. Add bot configuration to `app/page.js`
4. Follow existing patterns for consistency

## Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

3. Ensure the `data/` directory is included in deployment
4. Set up proper file permissions for the knowledge base

## Environment Variables

```
OPENAI_API_KEY=your_openai_api_key_here
```

## Contributing

1. Follow the existing code structure
2. Ensure proper error handling
3. Test all bot interactions
4. Update documentation as needed
5. Maintain security best practices for knowledge base management