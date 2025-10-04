# 🤖 Chatbot Customization Guide

## Three Ways to Customize Your AI Technician

### 1️⃣ Add Knowledge via API (Easiest - No Code!)

**Use these endpoints to manage knowledge:**

```bash
# Get all knowledge
GET /api/kb

# Search knowledge
GET /api/kb/search?q=printhead

# Add new knowledge (technician/admin only)
POST /api/kb
{
  "title": "How to Clean Encoder Strip",
  "content": "Detailed step-by-step cleaning procedure...",
  "category": "maintenance",
  "error_codes": ["E-105", "E-320"],
  "tags": ["cleaning", "encoder", "maintenance"]
}

# Update knowledge
PUT /api/kb/:id

# Delete knowledge (admin only)
DELETE /api/kb/:id
```

**Using cURL example:**
```bash
curl -X POST http://localhost:5001/api/kb \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ink System Maintenance",
    "content": "Weekly: Check ink levels\nMonthly: Clean ink lines\nQuarterly: Replace filters",
    "category": "maintenance",
    "tags": ["ink", "preventive"]
  }'
```

---

### 2️⃣ Customize Bot Personality

**Edit:** `server/src/controllers/chat.controller.ts`

**Change the bot's name and personality:**
```typescript
const basePrompt = `You are Alex, a friendly and experienced HD520 printer technician...`
```

**Personality traits you can customize:**
- Name (Alex, Sarah, Mike, etc.)
- Years of experience
- Communication style (formal, casual, friendly)
- Favorite phrases
- Empathy level
- Teaching approach

**Example personalities:**

**The Mentor:**
```typescript
You are Sarah, a patient mentor with 20 years of experience. You love teaching
and always explain the "why" behind each step. You're known for your analogies
that make complex concepts easy to understand.
```

**The Efficiency Expert:**
```typescript
You are Mike, a no-nonsense technician who values efficiency. You get straight
to the point, prioritize the most likely causes, and have seen every trick in
the book. You're fast, accurate, and always professional.
```

**The Encouraging Coach:**
```typescript
You are Jamie, an enthusiastic tech who makes troubleshooting feel like solving
a puzzle together. You celebrate every small win, ask great questions, and make
users feel confident they can handle issues themselves.
```

---

### 3️⃣ Add Knowledge via Seed File (For Bulk Updates)

**Edit:** `server/src/config/seedKnowledgeBase.ts`

**To add new knowledge entries, add to the `knowledgeEntries` array:**

```typescript
{
  id: randomUUID(),
  title: 'Your Topic Here',
  content: `
# Your Detailed Content

**Problem:** Description
**Symptoms:** What users see
**Solution:** Step by step

**Tips:**
- Pro tip 1
- Pro tip 2

**Common Mistakes to Avoid:**
- Don't do X
- Always do Y
  `,
  category: 'troubleshooting',
  error_codes: JSON.stringify(['E-123', 'E-456']),
  tags: JSON.stringify(['tag1', 'tag2', 'tag3'])
}
```

**After editing, reset the database:**
```bash
# Delete the database file
rm server/database.sqlite

# Restart server (will recreate and reseed)
npm run dev
```

---

## 📝 Content Format Best Practices

### Structure Your Knowledge Like This:

```markdown
**Problem:** Clear description of the issue

**Symptoms:**
- Specific observable signs
- Error messages
- Performance issues

**Customer Steps:**
1. Simple, safe steps anyone can do
2. No tools required
3. When to call support

**Technician Steps:**
1. Detailed diagnostic procedures
2. Required tools/parts
3. Safety precautions
4. Technical specifications

**Pro Tips:**
- Shortcuts learned from experience
- Common gotchas to avoid
- Time-saving tricks

**Related Issues:**
- Link to similar problems
- Preventive measures
```

---

## 🎯 Tips for Great Knowledge Content

1. **Use Real Scenarios:**
   - "I've seen this happen when..."
   - "One time a customer had..."
   - "The most common cause is..."

2. **Include Context:**
   - WHY something happens
   - WHEN to use different approaches
   - WHAT to check first

3. **Add Troubleshooting Trees:**
   ```
   Issue: Poor print quality
   ├─ Is nozzle check clean? → Yes → Check media settings
   │                        → No → Run cleaning cycle
   └─ Still bad? → Check ink levels → Replace cartridge
   ```

4. **Safety First:**
   - Always mention safety requirements
   - PPE needed
   - Lockout/tagout procedures
   - When to call for help

5. **Part Numbers Matter:**
   - Include exact part numbers
   - Alternative compatible parts
   - Where to order

---

## 🚀 Quick Start Examples

### Example 1: Add Machine-Specific Quirk
```typescript
{
  title: 'HD520 Model A Quirk: Printhead Alignment',
  content: `**Quirk:** Model A requires manual alignment after every 1000 prints

  **Why:** Early models had a slight belt tension issue

  **Fix:**
  1. Menu → Maintenance → Alignment
  2. Print test pattern
  3. Measure offset (should be < 0.5mm)
  4. Adjust using hex key (P/N: TOOL-123)

  **Pro Tip:** Do this during lunch break - takes 5 minutes and prevents issues`,
  category: 'quirks',
  tags: ['model-a', 'alignment', 'preventive']
}
```

### Example 2: Customer Success Story
```typescript
{
  title: 'Case Study: Mysterious Color Shift',
  content: `**Problem:** Customer reported gradual color shift over 2 weeks

  **Investigation:**
  - Checked calibration ✅
  - Checked ink expiry ✅
  - Checked profiles ✅
  - Asked about environment → FOUND IT!

  **Root Cause:** They moved the printer near a window. Direct sunlight was
  heating the printhead unevenly!

  **Solution:** Moved printer 6 feet from window. Problem solved.

  **Lesson:** Always ask about environmental changes!`,
  category: 'case_studies',
  tags: ['troubleshooting', 'environmental', 'color']
}
```

---

## 🔧 Testing Your Customizations

After adding knowledge, test by asking the bot:
- "Tell me about [your topic]"
- "How do I fix [problem you added]"
- "What's error code [code you added]"

The bot should reference your knowledge in its responses!

---

## 📊 Monitoring Bot Performance

**Check if bot is using your knowledge:**
1. Ask a question related to your content
2. Bot should quote or reference it
3. If not, check:
   - Knowledge was saved correctly
   - No typos in error codes/tags
   - Content is clear and specific

**Improve over time:**
- Track common questions users ask
- Add those to knowledge base
- Update based on real conversations
- Get feedback from users

---

## 🎨 Advanced: Multi-Bot Personalities

You can create different bots for different scenarios by modifying the system prompt based on:

```typescript
// In chat.controller.ts
const getSystemPrompt = (userRole: string, conversationContext: any, knowledgeBase: any[]) => {

  // Different bot for different machine types
  if (conversationContext.machine_serial?.startsWith('HD520-A')) {
    return 'You are specialized in Model A quirks...'
  }

  // Different bot for emergency situations
  if (conversationContext.priority === 'critical') {
    return 'You are in rapid-response mode. Prioritize getting machine running...'
  }

  // Different bot for training mode
  if (conversationContext.mode === 'training') {
    return 'You are in teaching mode. Focus on helping user learn...'
  }
}
```

---

## 🆘 Need Help?

The chatbot learns from:
1. **Knowledge Base** - Facts and procedures you add
2. **System Prompt** - Personality and approach
3. **Conversation History** - Context from earlier messages

If bot isn't responding well:
- ✅ Add more specific knowledge
- ✅ Refine system prompt instructions
- ✅ Use clearer categories/tags
- ✅ Include more examples in content

Happy customizing! 🚀
