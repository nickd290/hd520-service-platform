# 📚 Import Documents into Knowledge Base

## Quick Start

### 1️⃣ Create a Folder on Your Desktop

```bash
# Create the default folder
mkdir ~/Desktop/HD520-Knowledge
```

Or create it anywhere and specify the path later.

### 2️⃣ Add Your Documents

Drop your files into the folder:
- **PDFs** (.pdf)
- **Word Docs** (.docx, .doc)
- **Text files** (.txt)

**Supported formats:**
- ✅ PDF files
- ✅ Microsoft Word (.docx, .doc)
- ✅ Plain text (.txt)

### 3️⃣ Run the Import

```bash
# From the server directory
cd server

# Import from default location (~/Desktop/HD520-Knowledge)
npm run import-knowledge

# Or specify a custom folder
npm run import-knowledge "/path/to/your/folder"
```

---

## 📝 Smart Features

### Automatic Metadata Extraction

The script automatically extracts information from filenames:

**Example 1: Error Code**
```
Filename: "E-247 Ink Pressure Troubleshooting.pdf"
→ Title: "E 247 Ink Pressure Troubleshooting"
→ Category: "troubleshooting"
→ Error Codes: ["E-247"]
```

**Example 2: Maintenance**
```
Filename: "Weekly_Maintenance_Schedule.docx"
→ Title: "Weekly Maintenance Schedule"
→ Category: "maintenance"
→ Error Codes: []
```

**Example 3: Safety**
```
Filename: "Safety Procedures HD520.pdf"
→ Title: "Safety Procedures HD520"
→ Category: "safety"
→ Error Codes: []
```

### Filename Tips for Best Results

**Include error codes in filename:**
- ✅ `E-247 Ink System.pdf`
- ✅ `Troubleshoot E-105 E-320.pdf`

**Use descriptive names:**
- ✅ `Printhead Cleaning Procedure.pdf`
- ✅ `Daily Maintenance Checklist.docx`

**Use keywords for auto-categorization:**
- `troubleshoot`, `error` → Category: "troubleshooting"
- `maintenance`, `service` → Category: "maintenance"
- `safety` → Category: "safety"
- `install`, `setup` → Category: "getting_started"

---

## 📊 What Happens During Import

```
📂 Importing knowledge from: /Users/you/Desktop/HD520-Knowledge

📄 Processing: E-247 Ink Pressure.pdf
  ✅ Imported: "E 247 Ink Pressure" (troubleshooting)
     Error codes: E-247
     Content length: 2,847 characters

📄 Processing: Printhead Maintenance.docx
  ✅ Imported: "Printhead Maintenance" (maintenance)
     Content length: 1,423 characters

📄 Processing: Same File.pdf
  ℹ️  Already exists, skipping: "Same File"

⏭️  Skipped (unsupported): image.png

📊 Import Summary:
   ✅ Imported: 2
   ⏭️  Skipped: 1
   ❌ Errors: 0
   📁 Total files: 3
```

---

## 🎯 Example Workflow

### Step 1: Organize Your Documents

```
~/Desktop/HD520-Knowledge/
├── E-247 Ink Pressure Low.pdf
├── E-105 Printhead Temperature.pdf
├── E-320 Nozzle Check Failed.pdf
├── Weekly Maintenance.docx
├── Safety Lockout Tagout.pdf
└── Quick Start Guide.txt
```

### Step 2: Run Import

```bash
cd server
npm run import-knowledge
```

### Step 3: Verify Import

```bash
# The chatbot will now have access to all this knowledge!
# Test it by asking about content from your documents
```

---

## 🔍 Advanced Usage

### Import from Multiple Folders

```bash
# Import from different locations
npm run import-knowledge ~/Desktop/Manuals
npm run import-knowledge ~/Desktop/ErrorCodes
npm run import-knowledge ~/Desktop/Procedures
```

### Re-import with Updates

```bash
# The script skips files that already exist (by title)
# To update:
# 1. Delete from knowledge base via API or database
# 2. Re-run import
```

---

## 🛠️ Troubleshooting

### "No content extracted, skipping"
**Problem:** PDF or Word doc couldn't be read

**Solutions:**
- Make sure file isn't password-protected
- Try converting to plain text first
- Check if file is corrupted
- Some scanned PDFs need OCR first

### "Already exists, skipping"
**Problem:** Knowledge entry with same title already in database

**Solutions:**
- This is normal! Script won't create duplicates
- To update: Delete old entry first, then re-import
- Or rename the file to create a new entry

### Import takes long time
**Normal!** PDFs and Word docs take time to parse

For example:
- Small PDF (5 pages): ~1-2 seconds
- Large PDF (100 pages): ~10-20 seconds
- Word doc: ~1-5 seconds

---

## 📋 Supported Content Types

### Great for importing:
- ✅ Service manuals
- ✅ Troubleshooting guides
- ✅ Error code references
- ✅ Maintenance procedures
- ✅ Safety documents
- ✅ Training materials
- ✅ Technical specifications
- ✅ Installation guides

### Not suitable:
- ❌ Images/photos (use photo diagnosis feature instead)
- ❌ Videos (link to them in text documents)
- ❌ Spreadsheets (convert to PDF or text first)

---

## 💡 Pro Tips

1. **Organize First**
   - Review and organize documents before importing
   - Use consistent naming conventions
   - Remove duplicates manually

2. **Quality Over Quantity**
   - Import well-written, accurate documents
   - Clean up formatting in Word docs before converting
   - Keep content focused and specific

3. **Test After Import**
   - Ask chatbot about imported topics
   - Verify it can find and use the information
   - Add more context if needed

4. **Batch by Category**
   ```
   Manuals/
   ├── Installation/
   ├── Maintenance/
   ├── Troubleshooting/
   └── Safety/
   ```

5. **Use Descriptive Filenames**
   - ❌ `doc1.pdf`, `manual.pdf`
   - ✅ `HD520-Installation-Guide-v2.pdf`
   - ✅ `Error-Code-E-247-Ink-Pressure.pdf`

---

## 🚀 What Happens After Import?

1. **Content is stored** in the `knowledge_base` table
2. **Chatbot has access** to all imported knowledge
3. **Users can search** using the knowledge base API
4. **Alex (the bot)** references this content in responses

The chatbot will automatically use this knowledge when:
- User mentions an error code from your docs
- User asks about topics covered in your docs
- User needs troubleshooting help
- Related keywords are detected

---

## 📞 Need Help?

If you run into issues:
1. Check the console output for specific errors
2. Verify file permissions (should be readable)
3. Try with a single test file first
4. Check if packages installed correctly: `npm list pdf-parse mammoth`

Happy importing! 🎉
