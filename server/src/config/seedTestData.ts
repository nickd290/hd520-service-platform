import { query } from './database';
import { randomUUID } from 'crypto';

export function seedTestData() {
  try {
    // Check if test data already exists
    const existingMachines = query('SELECT COUNT(*) as count FROM machines WHERE serial_number LIKE \'HD520-%\'');
    if ((existingMachines.rows[0] as any).count > 0) {
      console.log('Test data already seeded');
      return;
    }

    // Create 5 sample machines
    const machines = [
      { serial: 'HD520-001-2024', location: 'Production Floor A', status: 'operational', model: 'HD520-Pro' },
      { serial: 'HD520-002-2024', location: 'Production Floor B', status: 'operational', model: 'HD520-Pro' },
      { serial: 'HD520-003-2023', location: 'Quality Control Lab', status: 'maintenance', model: 'HD520-Standard' },
      { serial: 'HD520-004-2024', location: 'Production Floor C', status: 'operational', model: 'HD520-Pro' },
      { serial: 'HD520-005-2023', location: 'R&D Department', status: 'offline', model: 'HD520-Standard' }
    ];

    const machineIds: string[] = [];
    machines.forEach(m => {
      const id = randomUUID();
      machineIds.push(id);
      query(
        'INSERT INTO machines (id, serial_number, location, status, model, installation_date) VALUES (?, ?, ?, ?, ?, ?)',
        [id, m.serial, m.location, m.status, m.model, new Date().toISOString()]
      );
    });

    // Create production metrics for each machine (normalized structure)
    const metricTypes = [
      { type: 'impressions', unit: 'count', minValue: 4000, maxValue: 6000 },
      { type: 'defect_rate', unit: 'percentage', minValue: 0.5, maxValue: 2.5 },
      { type: 'uptime_percentage', unit: 'percentage', minValue: 95, maxValue: 99 },
      { type: 'ink_usage', unit: 'ml', minValue: 800, maxValue: 1200 }
    ];

    machineIds.forEach((machineId) => {
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        metricTypes.forEach(metric => {
          const value = metric.minValue + Math.random() * (metric.maxValue - metric.minValue);
          const roundedValue = metric.type === 'impressions' ? Math.floor(value) : parseFloat(value.toFixed(2));

          query(
            `INSERT INTO production_metrics (id, machine_id, metric_type, metric_value, unit, recorded_at, shift)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              randomUUID(),
              machineId,
              metric.type,
              roundedValue,
              metric.unit,
              date.toISOString(),
              i % 3 === 0 ? 'day' : (i % 3 === 1 ? 'evening' : 'night')
            ]
          );
        });
      }
    });

    // Create machine health records
    machineIds.forEach((machineId, index) => {
      const lastService = new Date();
      lastService.setDate(lastService.getDate() - Math.floor(Math.random() * 60));

      const predictedMaintenance = new Date();
      predictedMaintenance.setDate(predictedMaintenance.getDate() + 15 + Math.floor(Math.random() * 30));

      query(
        `INSERT INTO machine_health (id, machine_id, health_score, last_service, total_impressions, ink_quality_score, calibration_status, error_frequency, downtime_hours, predicted_maintenance_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          randomUUID(),
          machineId,
          85 + Math.floor(Math.random() * 15),
          lastService.toISOString().split('T')[0],
          145000 + Math.floor(Math.random() * 50000),
          92 + Math.floor(Math.random() * 7),
          index % 3 === 0 ? 'optimal' : 'good',
          Math.floor(0.5 + Math.random() * 2),
          parseFloat((2 + Math.random() * 8).toFixed(1)),
          predictedMaintenance.toISOString().split('T')[0]
        ]
      );
    });

    // Seed 10 video library entries (only if none exist)
    const existingVideos = query('SELECT COUNT(*) as count FROM video_library');
    if ((existingVideos.rows[0] as any).count === 0) {
      const videos = [
        {
          youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          title: 'HD520 Complete Head Alignment Procedure',
          start_timestamp: 154,
          end_timestamp: 420,
          related_procedures: 'head alignment, calibration',
          related_error_codes: 'E-101, E-102',
          difficulty: 'intermediate',
          category: 'maintenance'
        },
        {
          youtube_url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
          title: 'Ink System Purge and Flush',
          start_timestamp: 75,
          end_timestamp: 240,
          related_procedures: 'ink purge, system flush',
          related_error_codes: 'E-201, E-205',
          difficulty: 'beginner',
          category: 'maintenance'
        },
        {
          youtube_url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
          title: 'Nozzle Check and Cleaning',
          start_timestamp: 45,
          end_timestamp: 180,
          related_procedures: 'nozzle check, cleaning',
          related_error_codes: 'E-301',
          difficulty: 'beginner',
          category: 'troubleshooting'
        },
        {
          youtube_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
          title: 'Print Density Calibration',
          start_timestamp: 120,
          end_timestamp: 360,
          related_procedures: 'density calibration, color matching',
          related_error_codes: 'E-401, E-402',
          difficulty: 'advanced',
          category: 'calibration'
        },
        {
          youtube_url: 'https://www.youtube.com/watch?v=OPf0YbXqDm0',
          title: 'Replacing Print Head Assembly',
          start_timestamp: 200,
          end_timestamp: 600,
          related_procedures: 'print head replacement',
          related_error_codes: 'E-101, E-103',
          difficulty: 'advanced',
          category: 'repair'
        },
        {
          youtube_url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
          title: 'Daily Maintenance Checklist',
          start_timestamp: 0,
          end_timestamp: 180,
          related_procedures: 'daily maintenance',
          related_error_codes: '',
          difficulty: 'beginner',
          category: 'maintenance'
        },
        {
          youtube_url: 'https://www.youtube.com/watch?v=MejbOFk7H6c',
          title: 'Troubleshooting Color Accuracy Issues',
          start_timestamp: 90,
          end_timestamp: 300,
          related_procedures: 'color calibration, troubleshooting',
          related_error_codes: 'E-401, E-403',
          difficulty: 'intermediate',
          category: 'troubleshooting'
        },
        {
          youtube_url: 'https://www.youtube.com/watch?v=SX_ViT4Ra7k',
          title: 'Emergency Shutdown Procedure',
          start_timestamp: 30,
          end_timestamp: 120,
          related_procedures: 'emergency shutdown, safety',
          related_error_codes: 'E-999',
          difficulty: 'beginner',
          category: 'safety'
        },
        {
          youtube_url: 'https://www.youtube.com/watch?v=ZZ5LpwO-An4',
          title: 'Ink Cartridge Replacement',
          start_timestamp: 60,
          end_timestamp: 180,
          related_procedures: 'ink replacement',
          related_error_codes: 'E-203',
          difficulty: 'beginner',
          category: 'maintenance'
        },
        {
          youtube_url: 'https://www.youtube.com/watch?v=HEXWRTEbj1I',
          title: 'Advanced Diagnostic Mode',
          start_timestamp: 150,
          end_timestamp: 480,
          related_procedures: 'diagnostics, troubleshooting',
          related_error_codes: 'E-101, E-201, E-301, E-401',
          difficulty: 'advanced',
          category: 'troubleshooting'
        }
      ];

      videos.forEach(v => {
        query(
          `INSERT INTO video_library (id, youtube_url, title, start_timestamp, end_timestamp, related_procedures, related_error_codes, difficulty_level, category)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [randomUUID(), v.youtube_url, v.title, v.start_timestamp, v.end_timestamp, v.related_procedures, v.related_error_codes, v.difficulty, v.category]
        );
      });
    }

    console.log('✅ Test data seeded successfully');
    console.log('   - 5 machines created');
    console.log('   - 600 production metrics created (4 metrics × 30 days × 5 machines)');
    console.log('   - 5 machine health records created');
    console.log('   - 10 video library entries created');
  } catch (error: any) {
    console.error('Error seeding test data:', error.message);
    // Don't throw - let the app continue running
  }
}
