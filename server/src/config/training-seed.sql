-- Training Module Seed Data
-- Run this after training-schema-update.sql

-- OPERATOR TRAINING MODULES
INSERT INTO training_modules (title, description, training_path, duration_minutes, order_index, video_url) VALUES
('HD520 Machine Introduction', 'Learn the basics of the HD520 printing system, its components, and capabilities.', 'operator', 30, 1, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
('Safety Protocols and PPE', 'Essential safety procedures, personal protective equipment requirements, and emergency protocols.', 'operator', 25, 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
('Daily Startup and Shutdown', 'Step-by-step procedures for properly starting and shutting down the HD520 system.', 'operator', 35, 3, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
('Routine Maintenance Tasks', 'Daily and weekly maintenance procedures to keep your HD520 running optimally.', 'operator', 40, 4, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
('Basic Troubleshooting', 'Identify and resolve common operational issues without technical assistance.', 'operator', 45, 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');

-- TECHNICIAN TRAINING MODULES
INSERT INTO training_modules (title, description, training_path, duration_minutes, order_index, video_url) VALUES
('Advanced System Diagnostics', 'In-depth diagnostic procedures for identifying complex system issues.', 'technician', 60, 1, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
('Print Head Replacement', 'Complete procedure for safely replacing and calibrating print heads.', 'technician', 50, 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
('Ink System Maintenance', 'Advanced ink system servicing, including line cleaning and pressure calibration.', 'technician', 55, 3, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
('Precision Calibration Procedures', 'Master calibration techniques for optimal print quality and accuracy.', 'technician', 65, 4, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
('Electronic System Repair', 'Diagnose and repair electronic components and control systems.', 'technician', 70, 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');

-- Get module IDs for content insertion
DO $$
DECLARE
    mod1_id UUID;
    mod2_id UUID;
    mod3_id UUID;
    mod4_id UUID;
    mod5_id UUID;
    mod6_id UUID;
    mod7_id UUID;
    mod8_id UUID;
    mod9_id UUID;
    mod10_id UUID;
BEGIN
    -- Get operator module IDs
    SELECT id INTO mod1_id FROM training_modules WHERE title = 'HD520 Machine Introduction';
    SELECT id INTO mod2_id FROM training_modules WHERE title = 'Safety Protocols and PPE';
    SELECT id INTO mod3_id FROM training_modules WHERE title = 'Daily Startup and Shutdown';
    SELECT id INTO mod4_id FROM training_modules WHERE title = 'Routine Maintenance Tasks';
    SELECT id INTO mod5_id FROM training_modules WHERE title = 'Basic Troubleshooting';

    -- Get technician module IDs
    SELECT id INTO mod6_id FROM training_modules WHERE title = 'Advanced System Diagnostics';
    SELECT id INTO mod7_id FROM training_modules WHERE title = 'Print Head Replacement';
    SELECT id INTO mod8_id FROM training_modules WHERE title = 'Ink System Maintenance';
    SELECT id INTO mod9_id FROM training_modules WHERE title = 'Precision Calibration Procedures';
    SELECT id INTO mod10_id FROM training_modules WHERE title = 'Electronic System Repair';

    -- OPERATOR MODULE 1 CONTENT
    INSERT INTO training_content (module_id, section_title, section_content, section_type, order_index) VALUES
    (mod1_id, 'Welcome to HD520 Training', 'The HD520 is a state-of-the-art printing system designed for high-precision industrial applications. This module will introduce you to the machine''s core components and capabilities.', 'text', 1),
    (mod1_id, 'System Overview Video', 'Watch this comprehensive overview of the HD520 system.', 'video', 2),
    (mod1_id, 'Main Components', E'The HD520 consists of several key components:\n\n• Print Head Assembly - High-precision inkjet system\n• Ink Delivery System - Maintains consistent ink flow\n• Control Panel - User interface and system controls\n• Substrate Handling - Material feed and positioning\n• Monitoring Systems - Real-time performance tracking', 'text', 3),
    (mod1_id, 'Operating Specifications', 'The HD520 operates at print speeds up to 150m/min with resolution up to 1200 DPI. It supports various substrate materials and ink types.', 'text', 4);

    -- OPERATOR MODULE 2 CONTENT
    INSERT INTO training_content (module_id, section_title, section_content, section_type, order_index) VALUES
    (mod2_id, 'Safety First', 'Safety is the top priority when operating the HD520. This module covers all essential safety procedures and requirements.', 'text', 1),
    (mod2_id, 'Required PPE', E'Always wear the following personal protective equipment:\n\n• Safety glasses or face shield\n• Chemical-resistant gloves\n• Steel-toed safety shoes\n• Hearing protection in high-noise areas\n• Protective apron or coveralls', 'text', 2),
    (mod2_id, 'Safety Procedures Video', 'Watch this important safety demonstration.', 'video', 3),
    (mod2_id, 'Emergency Protocols', E'In case of emergency:\n\n1. Press the red emergency stop button\n2. Alert nearby personnel\n3. Follow evacuation procedures if necessary\n4. Contact your supervisor immediately\n5. Do not restart the machine without authorization', 'text', 4);

    -- OPERATOR MODULE 3 CONTENT
    INSERT INTO training_content (module_id, section_title, section_content, section_type, order_index) VALUES
    (mod3_id, 'Startup Procedures', 'Proper startup ensures optimal machine performance and longevity. Follow these steps carefully every time.', 'text', 1),
    (mod3_id, 'Pre-Startup Checklist', E'Before powering on:\n\n• Verify all guards and covers are in place\n• Check ink levels and supply connections\n• Inspect for any visible damage or leaks\n• Ensure workspace is clear of debris\n• Verify emergency stops are functional', 'checklist', 2),
    (mod3_id, 'Startup Sequence Video', 'Follow along with this startup demonstration.', 'video', 3),
    (mod3_id, 'Shutdown Procedures', E'Proper shutdown steps:\n\n1. Complete current print job\n2. Pause material feed\n3. Initiate cleaning cycle\n4. Power down in correct sequence\n5. Secure all access panels\n6. Complete shutdown log', 'text', 4);

    -- TECHNICIAN MODULE 6 CONTENT
    INSERT INTO training_content (module_id, section_title, section_content, section_type, order_index) VALUES
    (mod6_id, 'Advanced Diagnostics Overview', 'This module covers advanced diagnostic techniques for identifying and resolving complex system issues.', 'text', 1),
    (mod6_id, 'Diagnostic Tools', E'Essential diagnostic equipment:\n\n• Multimeter for electrical testing\n• Pressure gauge for ink system\n• Oscilloscope for signal analysis\n• Diagnostic software suite\n• Calibration test patterns', 'text', 2),
    (mod6_id, 'Diagnostic Procedures Video', 'Learn systematic diagnostic approaches.', 'video', 3),
    (mod6_id, 'Error Code Analysis', 'Understanding error codes is crucial for rapid diagnosis. The HD520 uses a hierarchical error code system where the first digit indicates the subsystem and subsequent digits specify the fault.', 'text', 4);

    -- QUIZ QUESTIONS - OPERATOR MODULE 1
    INSERT INTO quiz_questions (module_id, question_text, question_type, options, explanation, order_index) VALUES
    (mod1_id, 'What is the maximum print resolution of the HD520?', 'multiple_choice',
     '[{"text": "600 DPI", "is_correct": false}, {"text": "1200 DPI", "is_correct": true}, {"text": "2400 DPI", "is_correct": false}, {"text": "300 DPI", "is_correct": false}]',
     'The HD520 supports up to 1200 DPI resolution for high-quality printing.', 1),
    (mod1_id, 'Which component is responsible for material feed and positioning?', 'multiple_choice',
     '[{"text": "Print Head Assembly", "is_correct": false}, {"text": "Ink Delivery System", "is_correct": false}, {"text": "Substrate Handling", "is_correct": true}, {"text": "Control Panel", "is_correct": false}]',
     'The Substrate Handling system manages material feed and positioning.', 2),
    (mod1_id, 'The HD520 can operate at speeds up to 150m/min.', 'true_false',
     '[{"text": "True", "is_correct": true}, {"text": "False", "is_correct": false}]',
     'The HD520 maximum operating speed is 150 meters per minute.', 3);

    -- QUIZ QUESTIONS - OPERATOR MODULE 2
    INSERT INTO quiz_questions (module_id, question_text, question_type, options, explanation, order_index) VALUES
    (mod2_id, 'What should you do first in an emergency situation?', 'multiple_choice',
     '[{"text": "Call your supervisor", "is_correct": false}, {"text": "Press the emergency stop button", "is_correct": true}, {"text": "Save your work", "is_correct": false}, {"text": "Take a photo", "is_correct": false}]',
     'Always press the emergency stop button first to ensure safety.', 1),
    (mod2_id, 'Which of these is NOT required PPE for HD520 operation?', 'multiple_choice',
     '[{"text": "Safety glasses", "is_correct": false}, {"text": "Chemical-resistant gloves", "is_correct": false}, {"text": "Hard hat", "is_correct": true}, {"text": "Steel-toed shoes", "is_correct": false}]',
     'Hard hats are not required for HD520 operation, but the other items are mandatory PPE.', 2);

    -- QUIZ QUESTIONS - TECHNICIAN MODULE 6
    INSERT INTO quiz_questions (module_id, question_text, question_type, options, explanation, order_index) VALUES
    (mod6_id, 'What does the first digit in an HD520 error code indicate?', 'multiple_choice',
     '[{"text": "Error severity", "is_correct": false}, {"text": "Subsystem location", "is_correct": true}, {"text": "Time of error", "is_correct": false}, {"text": "Repair priority", "is_correct": false}]',
     'The first digit identifies which subsystem generated the error code.', 1),
    (mod6_id, 'Which tool is essential for electrical system diagnostics?', 'multiple_choice',
     '[{"text": "Pressure gauge", "is_correct": false}, {"text": "Multimeter", "is_correct": true}, {"text": "Ink viscosity tester", "is_correct": false}, {"text": "Torque wrench", "is_correct": false}]',
     'A multimeter is the primary tool for electrical testing and diagnostics.', 2);
END $$;
