import db from './database';
import { randomUUID } from 'crypto';

export const seedTrainingData = () => {
  try {
    // Check if data already exists
    const existing = db.prepare('SELECT COUNT(*) as count FROM training_modules').get() as { count: number };
    if (existing.count > 0) {
      console.log('Training data already seeded');
      return;
    }

    console.log('Seeding training data...');

    // OPERATOR MODULES
    const operatorModules = [
      {
        id: randomUUID(),
        title: 'HD520 Machine Introduction',
        description: 'Learn the basics of the HD520 printing system, its components, and capabilities.',
        training_path: 'operator',
        duration_minutes: 30,
        order_index: 1,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        id: randomUUID(),
        title: 'Safety Protocols and PPE',
        description: 'Essential safety procedures, personal protective equipment requirements, and emergency protocols.',
        training_path: 'operator',
        duration_minutes: 25,
        order_index: 2,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        id: randomUUID(),
        title: 'Daily Startup and Shutdown',
        description: 'Step-by-step procedures for properly starting and shutting down the HD520 system.',
        training_path: 'operator',
        duration_minutes: 35,
        order_index: 3,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        id: randomUUID(),
        title: 'Routine Maintenance Tasks',
        description: 'Daily and weekly maintenance procedures to keep your HD520 running optimally.',
        training_path: 'operator',
        duration_minutes: 40,
        order_index: 4,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        id: randomUUID(),
        title: 'Basic Troubleshooting',
        description: 'Identify and resolve common operational issues without technical assistance.',
        training_path: 'operator',
        duration_minutes: 45,
        order_index: 5,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ];

    // TECHNICIAN MODULES
    const technicianModules = [
      {
        id: randomUUID(),
        title: 'Advanced System Diagnostics',
        description: 'In-depth diagnostic procedures for identifying complex system issues.',
        training_path: 'technician',
        duration_minutes: 60,
        order_index: 1,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        id: randomUUID(),
        title: 'Print Head Replacement',
        description: 'Complete procedure for safely replacing and calibrating print heads.',
        training_path: 'technician',
        duration_minutes: 50,
        order_index: 2,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        id: randomUUID(),
        title: 'Ink System Maintenance',
        description: 'Advanced ink system servicing, including line cleaning and pressure calibration.',
        training_path: 'technician',
        duration_minutes: 55,
        order_index: 3,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        id: randomUUID(),
        title: 'Precision Calibration Procedures',
        description: 'Master calibration techniques for optimal print quality and accuracy.',
        training_path: 'technician',
        duration_minutes: 65,
        order_index: 4,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        id: randomUUID(),
        title: 'Electronic System Repair',
        description: 'Diagnose and repair electronic components and control systems.',
        training_path: 'technician',
        duration_minutes: 70,
        order_index: 5,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ];

    const allModules = [...operatorModules, ...technicianModules];

    // Insert modules
    const insertModule = db.prepare(`
      INSERT INTO training_modules (id, title, description, training_path, duration_minutes, order_index, video_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    allModules.forEach(module => {
      insertModule.run(
        module.id,
        module.title,
        module.description,
        module.training_path,
        module.duration_minutes,
        module.order_index,
        module.video_url
      );
    });

    // Add content for first module
    const mod1 = operatorModules[0];
    const insertContent = db.prepare(`
      INSERT INTO training_content (id, module_id, section_title, section_content, section_type, order_index, video_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertContent.run(
      randomUUID(),
      mod1.id,
      'Welcome to HD520 Training',
      'The HD520 is a state-of-the-art printing system designed for high-precision industrial applications. This module will introduce you to the machine\'s core components and capabilities.',
      'text',
      1,
      null
    );

    insertContent.run(
      randomUUID(),
      mod1.id,
      'System Overview Video',
      'Watch this comprehensive overview of the HD520 system.',
      'video',
      2,
      mod1.video_url
    );

    insertContent.run(
      randomUUID(),
      mod1.id,
      'Main Components',
      'The HD520 consists of several key components:\n\n• Print Head Assembly - High-precision inkjet system\n• Ink Delivery System - Maintains consistent ink flow\n• Control Panel - User interface and system controls\n• Substrate Handling - Material feed and positioning\n• Monitoring Systems - Real-time performance tracking',
      'text',
      3,
      null
    );

    // Add quiz questions
    const insertQuiz = db.prepare(`
      INSERT INTO quiz_questions (id, module_id, question_text, question_type, options, explanation, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertQuiz.run(
      randomUUID(),
      mod1.id,
      'What is the maximum print resolution of the HD520?',
      'multiple_choice',
      JSON.stringify([
        { text: '600 DPI', is_correct: false },
        { text: '1200 DPI', is_correct: true },
        { text: '2400 DPI', is_correct: false },
        { text: '300 DPI', is_correct: false }
      ]),
      'The HD520 supports up to 1200 DPI resolution for high-quality printing.',
      1
    );

    insertQuiz.run(
      randomUUID(),
      mod1.id,
      'Which component is responsible for material feed and positioning?',
      'multiple_choice',
      JSON.stringify([
        { text: 'Print Head Assembly', is_correct: false },
        { text: 'Ink Delivery System', is_correct: false },
        { text: 'Substrate Handling', is_correct: true },
        { text: 'Control Panel', is_correct: false }
      ]),
      'The Substrate Handling system manages material feed and positioning.',
      2
    );

    insertQuiz.run(
      randomUUID(),
      mod1.id,
      'The HD520 can operate at speeds up to 150m/min.',
      'true_false',
      JSON.stringify([
        { text: 'True', is_correct: true },
        { text: 'False', is_correct: false }
      ]),
      'The HD520 maximum operating speed is 150 meters per minute.',
      3
    );

    console.log('✅ Training data seeded successfully');
  } catch (error) {
    console.error('Error seeding training data:', error);
  }
};
