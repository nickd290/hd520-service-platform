import { query } from './database';
import { randomUUID } from 'crypto';

export const seedKnowledgeBase = () => {
  // Check if knowledge base is already seeded
  const existing = query('SELECT COUNT(*) as count FROM knowledge_base');
  if (existing.rows[0].count > 0) {
    console.log('Knowledge base already seeded');
    return;
  }

  console.log('Seeding knowledge base...');

  const knowledgeEntries = [
    // Error Code E-247: Ink Pressure Issue
    {
      id: randomUUID(),
      title: 'E-247: Ink Pressure Low',
      content: `**Error Code:** E-247
**Issue:** Ink pressure below normal operating range

**Symptoms:**
- Inconsistent print quality
- Faded or missing characters
- Machine displays E-247 error

**Customer Steps:**
1. Check ink levels in all cartridges
2. Ensure ink cartridges are properly seated
3. Restart the machine
4. If error persists, contact technical support

**Technician Steps:**
1. Verify ink supply system pressure (should be 2.5-3.0 bar)
2. Check for air bubbles in ink lines
3. Inspect ink pump functionality
4. Test pressure sensor calibration
5. Replace faulty components as needed

**Safety:** Wear protective gloves when handling ink. Follow proper lockout/tagout procedures.`,
      category: 'error_codes',
      error_codes: JSON.stringify(['E-247']),
      tags: JSON.stringify(['ink', 'pressure', 'troubleshooting'])
    },

    // Error Code E-105: Printhead Issue
    {
      id: randomUUID(),
      title: 'E-105: Printhead Temperature Fault',
      content: `**Error Code:** E-105
**Issue:** Printhead temperature out of specification

**Symptoms:**
- Machine stops printing
- E-105 error displayed
- Print quality degradation before error

**Customer Steps:**
1. Turn off machine and wait 10 minutes to cool
2. Check for obstructions around printhead
3. Ensure adequate ventilation around machine
4. Restart machine
5. Contact support if error repeats

**Technician Steps:**
1. Verify printhead temperature sensor readings (optimal: 45-55°C)
2. Check cooling fan operation
3. Inspect thermal paste on heat sink
4. Test printhead heater resistance
5. Replace temperature sensor if faulty
6. Verify thermal management system

**Safety:** Allow printhead to cool before touching. Hot surfaces can cause burns.`,
      category: 'error_codes',
      error_codes: JSON.stringify(['E-105']),
      tags: JSON.stringify(['printhead', 'temperature', 'cooling'])
    },

    // Error Code E-320: Nozzle Check Failed
    {
      id: randomUUID(),
      title: 'E-320: Nozzle Check Failed',
      content: `**Error Code:** E-320
**Issue:** Nozzle integrity check failed

**Symptoms:**
- Poor print quality
- Missing dots in print pattern
- E-320 error code

**Customer Steps:**
1. Run automatic cleaning cycle (Menu > Maintenance > Clean)
2. Check ink levels
3. Run nozzle check pattern
4. Repeat cleaning if needed (max 3 times)
5. Contact support if unresolved

**Technician Steps:**
1. Perform manual nozzle inspection
2. Run advanced cleaning cycle with purge
3. Check for dried ink blockages
4. Inspect printhead alignment
5. Verify nozzle plate condition
6. Replace printhead if necessary

**Parts Required:** Cleaning solution (P/N: CL-520), Lint-free wipes

**Safety:** Use approved cleaning solution only. Ensure proper ventilation.`,
      category: 'error_codes',
      error_codes: JSON.stringify(['E-320']),
      tags: JSON.stringify(['nozzle', 'cleaning', 'print_quality'])
    },

    // General Troubleshooting
    {
      id: randomUUID(),
      title: 'General Print Quality Issues',
      content: `**Common Print Quality Problems and Solutions**

**Streaking or Banding:**
- Clean printhead
- Check ink levels
- Verify media settings match actual substrate
- Inspect encoder strip for contamination

**Color Inconsistency:**
- Run color calibration (Menu > Settings > Color Cal)
- Check ink expiration dates
- Verify ICC profiles are current
- Check for proper ink mixing

**Misalignment:**
- Run printhead alignment (Menu > Maintenance > Align)
- Check carriage belt tension
- Inspect linear encoder
- Verify bi-directional calibration

**Smearing:**
- Check ink drying settings
- Verify substrate compatibility
- Adjust print speed
- Check heater temperatures

**Prevention:**
- Run daily maintenance routines
- Use recommended media types
- Store ink at proper temperature (15-25°C)
- Regular cleaning schedule`,
      category: 'troubleshooting',
      error_codes: JSON.stringify([]),
      tags: JSON.stringify(['print_quality', 'maintenance', 'calibration'])
    },

    // Safety Procedures
    {
      id: randomUUID(),
      title: 'HD520 Safety Procedures',
      content: `**Essential Safety Guidelines**

**Personal Protective Equipment (PPE):**
- Safety glasses when working on machine
- Nitrile gloves when handling ink or solvents
- Closed-toe shoes in work area

**Lockout/Tagout Procedure:**
1. Notify all personnel
2. Shut down machine properly
3. Disconnect main power
4. Apply lockout device
5. Verify zero energy state
6. Attach personal danger tag

**Chemical Safety:**
- Inks contain irritants - avoid skin/eye contact
- Work in well-ventilated area
- Know SDS location for all chemicals
- Have eyewash station accessible
- Dispose of waste ink per regulations

**Electrical Safety:**
- Only qualified technicians work on electrical
- Verify power off before opening panels
- Check voltage with multimeter
- Respect high voltage warnings (400V areas)

**Moving Parts:**
- Keep hands clear during operation
- Never bypass safety interlocks
- Stop machine before reaching inside
- Watch for pinch points

**Emergency Procedures:**
- Emergency stop button locations
- Fire extinguisher (Class ABC) nearby
- Spill kit for ink leaks
- First aid kit accessible
- Emergency contact numbers posted`,
      category: 'safety',
      error_codes: JSON.stringify([]),
      tags: JSON.stringify(['safety', 'ppe', 'lockout', 'emergency'])
    },

    // Preventive Maintenance
    {
      id: randomUUID(),
      title: 'Preventive Maintenance Schedule',
      content: `**Daily Maintenance:**
- Visual inspection for leaks or damage
- Check ink levels
- Run nozzle check pattern
- Clean platen and guides
- Check waste ink levels

**Weekly Maintenance:**
- Clean encoder strip
- Lubricate carriage rails (oil P/N: LB-100)
- Inspect and clean capping station
- Check belt tension
- Clean exterior surfaces

**Monthly Maintenance:**
- Deep clean printhead assembly
- Replace wiper blades
- Check all filter status
- Verify calibration accuracy
- Backup machine settings
- Update firmware if available

**Quarterly Maintenance:**
- Replace air filters
- Check all electrical connections
- Inspect vacuum system
- Calibrate color and alignment
- Professional service inspection recommended

**Annual Maintenance:**
- Replace all consumable parts
- Full system calibration
- Update all software
- Professional overhaul inspection

**Maintenance Log:**
Always document:
- Date and time
- Tasks performed
- Parts replaced
- Technician name
- Any issues found`,
      category: 'maintenance',
      error_codes: JSON.stringify([]),
      tags: JSON.stringify(['maintenance', 'schedule', 'preventive'])
    },

    // Customer Quick Start
    {
      id: randomUUID(),
      title: 'HD520 Quick Start Guide',
      content: `**Getting Started with HD520**

**Initial Setup:**
1. Ensure machine is on level surface
2. Connect power cable (check voltage: 220V)
3. Install ink cartridges (colors: CMYK + White)
4. Run initial calibration
5. Load media properly

**Daily Startup:**
1. Power on machine
2. Wait for initialization (approx 2 min)
3. Run auto nozzle check
4. Load print job from USB or network
5. Verify media settings match substrate

**Operating Tips:**
- Always use recommended media types
- Check ink levels before large jobs
- Save custom profiles for repeat jobs
- Use print preview to verify layout
- Monitor first prints for quality

**Basic Menu Navigation:**
- Main Menu: Home button
- Job Queue: Queue button
- Settings: Settings icon
- Maintenance: Tools icon

**Common Tasks:**
- Load Media: Lift lever → Insert → Lower lever
- Change Ink: Open cover → Remove old → Install new → Close cover
- Pause Job: Press Pause button
- Cancel Job: Press Stop, confirm on screen

**When to Call Support:**
- Repeated error codes
- Physical damage
- Unusual noises or smells
- Consistent poor quality after cleaning
- Any safety concerns

**Support:** 1-800-HD520-HELP`,
      category: 'getting_started',
      error_codes: JSON.stringify([]),
      tags: JSON.stringify(['quick_start', 'setup', 'operation', 'customer'])
    }
  ];

  // Insert all knowledge base entries
  for (const entry of knowledgeEntries) {
    query(
      `INSERT INTO knowledge_base (id, title, content, category, error_codes, tags)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [entry.id, entry.title, entry.content, entry.category, entry.error_codes, entry.tags]
    );
  }

  console.log('✅ Knowledge base seeded successfully');
};
