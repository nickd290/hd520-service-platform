# Training Mode - Setup & Usage Guide

## 🎓 Overview

The Training Mode is now fully implemented with:
- **2 Training Paths**: Operator and Technician
- **10 Complete Modules**: 5 per path with content and quizzes
- **Progress Tracking**: Real-time module completion tracking
- **Quiz System**: Interactive quizzes with 70% pass threshold
- **Certificate Generation**: Automatic certificates upon completion
- **Video Integration**: YouTube video embedding in modules

## 📦 Database Setup

### 1. Update Training Schema

Run the enhanced training schema update:

```bash
psql -d hd520_platform -f server/src/config/training-schema-update.sql
```

This creates/updates:
- `training_modules` - Enhanced module table
- `training_content` - Content sections for each module
- `quiz_questions` - Quiz questions with options
- `quiz_attempts` - User quiz attempt history
- `training_progress` - Enhanced progress tracking
- `certificates` - Certificate records

### 2. Seed Training Data

Load the sample training modules:

```bash
psql -d hd520_platform -f server/src/config/training-seed.sql
```

This creates:
- 5 Operator modules with content and quizzes
- 5 Technician modules with content and quizzes
- Sample quiz questions for each module

## 🚀 Features Implemented

### Training Paths

#### Operator Training (Blue Theme)
1. HD520 Machine Introduction
2. Safety Protocols and PPE
3. Daily Startup and Shutdown
4. Routine Maintenance Tasks
5. Basic Troubleshooting

#### Technician Training (Orange Theme)
1. Advanced System Diagnostics
2. Print Head Replacement
3. Ink System Maintenance
4. Precision Calibration Procedures
5. Electronic System Repair

### Module Features

Each module includes:
- **Title & Description**
- **Duration estimate** (minutes)
- **Content Sections**:
  - Text content
  - Embedded YouTube videos
  - Checklists
  - Images (structure ready)
- **Progress Tracking**:
  - Section-by-section progress
  - Resume from last position
  - Percentage completion
- **Quiz System**:
  - Multiple choice questions
  - True/false questions
  - Immediate feedback
  - Pass/fail with 70% threshold
  - Retake option

### Progress Dashboard

- Overall progress for both paths
- Module completion status
- Quiz scores
- Certificate generation
- Download certificates (UI ready)

## 🎯 User Flow

1. **Choose Training Path** (`/training`)
   - Select Operator or Technician
   - View path overview

2. **View Modules List** (`/training/operator` or `/training/technician`)
   - See all modules with status
   - View progress percentage
   - Resume incomplete modules

3. **Complete Module** (`/training/module/:id`)
   - Navigate through content sections
   - Watch embedded videos
   - Track progress automatically
   - Take quiz at the end

4. **Pass Quiz**
   - Answer all questions
   - Submit for grading
   - Get instant results
   - Retake if needed (below 70%)

5. **Earn Certificate** (`/training/progress`)
   - Complete all modules
   - Pass all quizzes
   - Generate certificate
   - Download (ready for implementation)

## 🔧 API Endpoints

All endpoints require authentication (`Authorization: Bearer <token>`)

### Get Modules by Path
```
GET /api/training/modules/:path
```
Returns list of modules with user progress

### Get Module Details
```
GET /api/training/module/:id
```
Returns module with content sections and quiz

### Update Progress
```
POST /api/training/progress/:moduleId
{
  "status": "in_progress",
  "progress_percentage": 50,
  "last_section_viewed": 2
}
```

### Submit Quiz
```
POST /api/training/quiz/:moduleId
{
  "answers": ["answer1", "answer2", "answer3"]
}
```
Returns score, percentage, and pass/fail status

### Get Progress Summary
```
GET /api/training/progress/:path
```
Returns overall progress for a training path

### Generate Certificate
```
POST /api/training/certificate/:path
```
Generates certificate if all modules completed

### Get Certificates
```
GET /api/training/certificates
```
Returns user's earned certificates

## 🎨 UI Components Created

### Pages
- `TrainingPage.tsx` - Path selection
- `ModulesListPage.tsx` - Module list with progress
- `ModuleViewerPage.tsx` - Content viewer & quiz
- `ProgressPage.tsx` - Progress dashboard & certificates

### Features
- Dark theme with path-specific colors
- Responsive design
- Progress bars and indicators
- Interactive quiz interface
- Certificate display
- Video embedding (YouTube)

## 📊 Database Tables

### training_modules
- Module metadata
- Training path (operator/technician)
- Duration, order, video URLs

### training_content
- Content sections for each module
- Section type (text, video, checklist, image)
- Order and content data

### quiz_questions
- Questions for each module
- Multiple choice options (JSONB)
- Correct answer indicators
- Explanations

### training_progress
- User progress per module
- Status, percentage, last section
- Quiz scores and pass status
- Completion timestamps

### quiz_attempts
- History of quiz attempts
- Score and answers
- Pass/fail tracking

### certificates
- Certificate records
- Certificate number
- Issue and expiry dates
- Validation status

## 🧪 Testing the Training Mode

1. **Create a test user**:
```bash
# Register via API or create directly in database
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User",
    "role": "trainee"
  }'
```

2. **Login and get token**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

3. **Access training**:
   - Navigate to http://localhost:5173/training
   - Choose a training path
   - Complete a module
   - Take the quiz

## 🔜 Future Enhancements

- [ ] Certificate PDF generation
- [ ] Certificate email delivery
- [ ] Module video upload (instead of YouTube)
- [ ] Image content support
- [ ] Interactive simulations
- [ ] Leaderboard for quiz scores
- [ ] Time-based certificates expiry alerts
- [ ] Multi-language support
- [ ] Offline mode for content

## ✅ What's Working

- ✅ Two complete training paths
- ✅ 10 modules with rich content
- ✅ Section-by-section navigation
- ✅ YouTube video embedding
- ✅ Progress tracking
- ✅ Interactive quizzes
- ✅ Quiz grading system
- ✅ Certificate generation
- ✅ Progress dashboard
- ✅ Responsive UI
- ✅ Dark theme

## 🐛 Known Limitations

- Certificates are generated but PDF download needs implementation
- Video URLs in seed data are placeholders (update with real URLs)
- Email notifications not implemented
- No admin panel for content management yet
