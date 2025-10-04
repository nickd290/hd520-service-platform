import { Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { query } from '../config/database';
import { AuthRequest } from '../types';
import { randomUUID } from 'crypto';
import { searchKnowledgeWithCache } from '../utils/knowledgeSearch';
import fs from 'fs';
import path from 'path';

// Lazy initialization of Anthropic client to ensure env vars are loaded
let anthropic: Anthropic;
const getAnthropicClient = () => {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    anthropic = new Anthropic({ apiKey });
  }
  return anthropic;
};

// Get role-specific system prompt
const getSystemPrompt = (userRole: string, knowledgeBase: any[]) => {
  const kbContext = knowledgeBase.map(kb => {
    const sourceLabel = kb.source === 'uploaded' ? '📄 Official Document' :
                       kb.source === 'manual' ? '📝 Manual Entry' : '📋 General';
    return `${sourceLabel} - ${kb.title} (${kb.relevance}% match)
Match: ${kb.match_reason}

${kb.content}`;
  }).join('\n\n---\n\n');

  const basePrompt = `You are Alex, a friendly and experienced HD520 printer technician with 15 years of hands-on experience. You're known for being patient, personable, and great at explaining things in a way that makes sense.

OPENING APPROACH - BE IMMEDIATE AND HELPFUL:
- When starting a conversation, be direct and action-oriented
- Example: "I'm here to help with your HD520. Let me guide you through the head alignment process."
- Jump straight into helping - no lengthy introductions
- Immediately identify what they need help with

KNOWLEDGE BASE (RELEVANT EXCERPTS - RANKED BY RELEVANCE):
${kbContext}

⚠️ CRITICAL ACCURACY REQUIREMENT:
- ONLY provide information that is EXPLICITLY stated in the knowledge base above
- NEVER make assumptions or use general printer knowledge
- If the knowledge base doesn't contain specific information, say: "I don't have that specific procedure in my knowledge base yet. Let me connect you with a technician who can help."
- The HD520 has unique systems (like a bulk ink system) - never assume it works like other printers
- If you're uncertain about any detail, explicitly state your uncertainty rather than guessing
- When citing information, mention the source confidence (e.g., "Based on the official HD520 service manual...")

FORMATTING REQUIREMENTS - MAKE IT VISUAL AND CLEAR:
✅ Use emojis for status and emphasis:
   - ✅ for completed steps or correct actions
   - ⚠️ for safety warnings and cautions
   - 🔧 for tools needed
   - 📋 for checklists
   - 🎥 for video references

📝 Use numbered steps for procedures:
   1. First step with clear action
   2. Second step with expected result
   3. Third step with what to check

💪 **Bold important terms** like part names, error codes, and key concepts

VISUAL REFERENCES - INCLUDE VIDEO LINKS:
When discussing procedures, reference helpful videos:
- "🎥 Here's a video showing the Basic Chart process: [Video: HD520 Head Alignment - 2:34]"
- "🎥 Watch this printhead cleaning demonstration: [Video: HD520 Printhead Maintenance - 4:15]"
- Use video references for complex visual procedures

SYSTEMATIC TROUBLESHOOTING - ASK SMART QUESTIONS:
After initial response, ask diagnostic questions ONE at a time:
- "Is the press currently running or stopped?"
- "Have you printed the **Basic Chart** yet?"
- "Are you seeing any specific error codes on the display?"
- "When did you last run a **nozzle check**?"
- "Has anything changed recently (new media, temperature, etc.)?"

SAFETY WARNINGS - ALWAYS PRIORITIZE SAFETY:
⚠️ Add safety callouts when relevant:
- "⚠️ **Safety Note:** Ensure the press is stopped before adjusting head positions"
- "⚠️ **Warning:** Wait 10 minutes for printheads to cool before touching"
- "⚠️ **Important:** Lock out power source before opening electrical panels"
- Place safety warnings BEFORE the dangerous step, not after

FOLLOW-UP ACTIONS - OFFER NEXT STEPS:
At the end of troubleshooting, always offer:
- "Would you like me to create a **service ticket** for this?"
- "Should I log this procedure to the **knowledge base** for future reference?"
- "Do you need me to schedule a **follow-up** or parts order?"
- "Would you like documentation sent to your email?"

COMMUNICATION STYLE:
- Keep responses concise but friendly (2-4 sentences unless explaining a procedure)
- Use bullet points for options and checklists
- Add context about why something matters
- Celebrate small wins: "Great! That confirms the issue is isolated to..."
- Be encouraging: "You're doing great!", "Good catch on noticing that!"`;

  if (userRole === 'customer') {
    return `${basePrompt}

USER ROLE: Customer (End User)
- Provide simple, clear instructions
- Focus on safety-first approach
- Avoid technical jargon
- Guide them through basic troubleshooting
- Recommend when to contact technical support
- Never suggest disassembly or complex repairs`;
  } else if (userRole === 'technician' || userRole === 'admin') {
    return `${basePrompt}

USER ROLE: Technician
- Provide detailed technical information
- Include part numbers and specifications
- Suggest advanced diagnostic procedures
- Reference technical manuals and procedures
- Include safety warnings for technical work
- Provide step-by-step repair instructions`;
  } else {
    return `${basePrompt}

USER ROLE: Trainee
- Balance technical detail with clear explanations
- Explain the "why" behind procedures
- Reference training materials when relevant
- Encourage learning and understanding
- Provide both immediate solutions and educational context`;
  }
};

// Create new conversation
export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { machine_serial } = req.body;

    const conversationId = randomUUID();
    const title = machine_serial
      ? `Support for ${machine_serial}`
      : 'General Support';

    query(
      `INSERT INTO conversations (id, user_id, machine_serial, title, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [conversationId, userId, machine_serial, title]
    );

    const result = query(
      'SELECT * FROM conversations WHERE id = ?',
      [conversationId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

// Send message with streaming response
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role || 'customer';
    const { conversation_id, message } = req.body;

    // Verify conversation belongs to user
    const convResult = query(
      'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
      [conversation_id, userId]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Save user message
    const userMessageId = randomUUID();
    query(
      'INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)',
      [userMessageId, conversation_id, 'user', message]
    );

    // Get conversation history
    const historyResult = query(
      'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
      [conversation_id]
    );

    // FORCE RAG: Always search knowledge base before responding
    // Use advanced fuzzy search with weighted scoring
    const knowledgeResults = await searchKnowledgeWithCache(message, {
      limit: 5,
      minRelevance: 10,
      includeGeneric: true
    });

    // If no relevant knowledge found, inform the user
    if (knowledgeResults.length === 0) {
      const noKnowledgeResponse = "I don't have specific documentation on this in my knowledge base yet. Let me connect you with a technician who can help with this specific issue.";

      // Save assistant message
      const assistantMessageId = randomUUID();
      query(
        'INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)',
        [assistantMessageId, conversation_id, 'assistant', noKnowledgeResponse]
      );

      return res.json({ message: noKnowledgeResponse });
    }

    // Format knowledge base context with confidence scores
    const knowledgeBase = knowledgeResults.map(kb => ({
      title: kb.title,
      content: kb.content,
      error_codes: kb.error_codes,
      relevance: Math.round(kb.relevance_score),
      source: kb.source,
      match_reason: kb.match_reason
    }));

    // Build messages array for Claude
    const messages: any[] = historyResult.rows.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // Get system prompt with knowledge base
    const systemPrompt = getSystemPrompt(userRole, knowledgeBase);

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let assistantResponse = '';

    // Stream response from Claude
    const client = getAnthropicClient();
    const stream = await client.messages.stream({
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages
    });

    stream.on('text', (text) => {
      assistantResponse += text;
      res.write(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`);
    });

    stream.on('end', async () => {
      // Save assistant response
      const assistantMessageId = randomUUID();
      query(
        'INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)',
        [assistantMessageId, conversation_id, 'assistant', assistantResponse]
      );

      // Update conversation timestamp
      query(
        'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [conversation_id]
      );

      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    });

    stream.on('error', (error) => {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream error occurred' })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('Send message error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
};

// Get user conversations
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const result = query(
      `SELECT
        c.*,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY timestamp DESC LIMIT 1) as last_message
       FROM conversations c
       WHERE c.user_id = ?
       ORDER BY c.updated_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// Get conversation messages
export const getConversationMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    // Verify conversation belongs to user
    const convResult = query(
      'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messagesResult = query(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
      [id]
    );

    res.json({
      conversation: convResult.rows[0],
      messages: messagesResult.rows
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Delete conversation
export const deleteConversation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    // Verify conversation belongs to user
    const convResult = query(
      'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Delete conversation (messages will be deleted via CASCADE)
    query('DELETE FROM conversations WHERE id = ?', [id]);

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};

// Upload photo and analyze with Claude Vision
export const uploadPhoto = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role || 'customer';
    const { conversation_id, message } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    // Verify conversation belongs to user
    const convResult = query(
      'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
      [conversation_id, userId]
    );

    if (convResult.rows.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const photoUrl = `/uploads/images/${req.file.filename}`;

    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    // Determine media type
    let mediaType = 'image/jpeg';
    if (req.file.mimetype === 'image/png') mediaType = 'image/png';
    else if (req.file.mimetype === 'image/heic') {
      // Note: HEIC needs conversion - for now just use as-is
      mediaType = 'image/jpeg'; // Claude doesn't support HEIC, would need conversion
    }

    // Save user message with photo
    const userMessageId = randomUUID();
    query(
      'INSERT INTO messages (id, conversation_id, role, content, photo_url) VALUES (?, ?, ?, ?, ?)',
      [userMessageId, conversation_id, 'user', message || 'Photo uploaded', photoUrl]
    );

    // FORCE RAG: Search knowledge base
    const knowledgeResults = await searchKnowledgeWithCache(message || 'photo analysis', {
      limit: 3,
      minRelevance: 10,
      includeGeneric: true
    });

    const knowledgeBase = knowledgeResults.map(kb => ({
      title: kb.title,
      content: kb.content,
      error_codes: kb.error_codes,
      relevance: Math.round(kb.relevance_score),
      source: kb.source,
      match_reason: kb.match_reason
    }));

    const systemPrompt = getSystemPrompt(userRole, knowledgeBase);

    // Get conversation history
    const historyResult = query(
      'SELECT role, content, photo_url FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
      [conversation_id]
    );

    // Build messages with vision
    const messages: any[] = [];
    for (const msg of historyResult.rows) {
      if (msg.photo_url) {
        // This is the photo message - we already have it in base64
        const isCurrentPhoto = msg.photo_url === photoUrl;
        if (isCurrentPhoto) {
          messages.push({
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image
                }
              },
              {
                type: 'text',
                text: msg.content
              }
            ]
          });
        } else {
          // For previous photos, just include the text description
          messages.push({
            role: msg.role,
            content: `[Photo: ${msg.content}]`
          });
        }
      } else {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    // Call Claude Vision API
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: systemPrompt + '\n\n🎯 PHOTO ANALYSIS MODE: Carefully analyze the uploaded photo. Identify error screens, print defects, mechanical issues, or ink problems. Extract any text from error screens. Be specific about what you see.',
      messages: messages
    });

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : '';

    // Save assistant response
    const assistantMessageId = randomUUID();
    query(
      'INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)',
      [assistantMessageId, conversation_id, 'assistant', assistantMessage]
    );

    res.json({
      message: assistantMessage,
      photo_url: photoUrl
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload and analyze photo' });
  }
};
