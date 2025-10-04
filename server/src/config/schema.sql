-- HD520 Service Platform Database Schema (SQLite)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'technician', 'trainee', 'admin')),
    credential_code TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Machines table
CREATE TABLE IF NOT EXISTS machines (
    id TEXT PRIMARY KEY,
    serial_number TEXT UNIQUE NOT NULL,
    model TEXT NOT NULL,
    installation_date DATE,
    location TEXT,
    customer_id TEXT REFERENCES users(id),
    status TEXT DEFAULT 'operational',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service tickets table
CREATE TABLE IF NOT EXISTS service_tickets (
    id TEXT PRIMARY KEY,
    ticket_number TEXT UNIQUE NOT NULL,
    machine_id TEXT REFERENCES machines(id),
    created_by TEXT REFERENCES users(id),
    assigned_to TEXT REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    error_code TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    resolution TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME
);

-- Knowledge base entries table
CREATE TABLE IF NOT EXISTS kb_entries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    error_codes TEXT, -- JSON array as string
    tags TEXT, -- JSON array as string
    created_by TEXT REFERENCES users(id),
    requires_credential INTEGER DEFAULT 0,
    credential_level TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Training modules table
CREATE TABLE IF NOT EXISTS training_modules (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    training_path TEXT NOT NULL CHECK (training_path IN ('operator', 'technician')),
    duration_minutes INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    thumbnail_url TEXT,
    video_url TEXT,
    is_published INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Training content sections table
CREATE TABLE IF NOT EXISTS training_content (
    id TEXT PRIMARY KEY,
    module_id TEXT REFERENCES training_modules(id) ON DELETE CASCADE,
    section_title TEXT NOT NULL,
    section_content TEXT NOT NULL,
    section_type TEXT CHECK (section_type IN ('text', 'video', 'image', 'checklist')),
    order_index INTEGER NOT NULL,
    video_url TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id TEXT PRIMARY KEY,
    module_id TEXT REFERENCES training_modules(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false')),
    options TEXT NOT NULL, -- JSON array as string
    explanation TEXT,
    order_index INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Training progress table
CREATE TABLE IF NOT EXISTS training_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    module_id TEXT REFERENCES training_modules(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_percentage INTEGER DEFAULT 0,
    last_section_viewed INTEGER DEFAULT 0,
    quiz_score INTEGER,
    quiz_passed INTEGER DEFAULT 0,
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, module_id)
);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    module_id TEXT REFERENCES training_modules(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage INTEGER NOT NULL,
    passed INTEGER NOT NULL,
    answers TEXT, -- JSON as string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    training_path TEXT NOT NULL CHECK (training_path IN ('operator', 'technician')),
    certificate_number TEXT UNIQUE NOT NULL,
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    is_valid INTEGER DEFAULT 1
);

-- Production metrics table
CREATE TABLE IF NOT EXISTS production_metrics (
    id TEXT PRIMARY KEY,
    machine_id TEXT REFERENCES machines(id),
    metric_type TEXT NOT NULL,
    metric_value REAL NOT NULL,
    unit TEXT,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    shift TEXT
);

-- Documents table (for uploaded manuals, PDFs)
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    category TEXT,
    uploaded_by TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    machine_serial TEXT,
    title TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    photo_url TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge base table
CREATE TABLE IF NOT EXISTS knowledge_base (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    error_codes TEXT, -- JSON array as string
    tags TEXT, -- JSON array as string
    source TEXT DEFAULT 'manual', -- 'manual', 'uploaded', 'generic'
    confidence_score REAL DEFAULT 0.5, -- 0.0 to 1.0
    last_used DATETIME,
    usage_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pending knowledge base entries (for admin review)
CREATE TABLE IF NOT EXISTS pending_kb_entries (
    id TEXT PRIMARY KEY,
    conversation_id TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    error_codes TEXT,
    tags TEXT,
    photos TEXT,
    issue_description TEXT,
    solution_steps TEXT,
    parts_used TEXT,
    time_to_resolve INTEGER,
    machine_serial TEXT,
    submitted_by TEXT,
    user_role TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by TEXT,
    review_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME
);

-- Shift handoffs table
CREATE TABLE IF NOT EXISTS shift_handoffs (
    id TEXT PRIMARY KEY,
    machine_id TEXT REFERENCES machines(id),
    from_user TEXT REFERENCES users(id),
    to_user TEXT REFERENCES users(id),
    shift_date DATE NOT NULL,
    shift_type TEXT CHECK (shift_type IN ('day', 'night', 'swing')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_machines_serial ON machines(serial_number);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON service_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_machine ON service_tickets(machine_id);
CREATE INDEX IF NOT EXISTS idx_training_modules_path ON training_modules(training_path);
CREATE INDEX IF NOT EXISTS idx_training_modules_order ON training_modules(order_index);
CREATE INDEX IF NOT EXISTS idx_training_content_module ON training_content(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_module ON quiz_questions(module_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_user ON training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_module ON training_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_machine ON production_metrics(machine_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
