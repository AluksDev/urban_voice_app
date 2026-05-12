// seed.js — Populates the urban_voice_app database with realistic dummy data.
//
// Prerequisites:
//   npm install mysql2 bcryptjs
//
// Usage:
//   node seed.js

const mysql  = require("mysql2/promise");
const bcrypt = require("bcryptjs");

// ── Configuration ─────────────────────────────────────────────────────────────
const DB_CONFIG = {
  host:     "localhost",
  user:     "root",
  password: "root123",
  database: "urban_voice_app",
};

const SALT_ROUNDS = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

const pick    = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Spreads locations within ~1.5 km radius around Granada city centre.
// 0.015 degrees of lat/lng ≈ 1–1.5 km in southern Spain.
const jitter = () => (Math.random() - 0.5) * 0.03;

// ── Report templates ──────────────────────────────────────────────────────────

const REPORT_TEMPLATES = [
  { title: "Pothole on main road",         description: "Large pothole causing damage to vehicles near the intersection.",    category: "road"          },
  { title: "Cracked pavement",             description: "Pavement slabs near the school are cracked and a tripping hazard.",  category: "road"          },
  { title: "Damaged road markings",        description: "Zebra crossing markings are nearly invisible and need repainting.",  category: "road"          },
  { title: "Broken street light",          description: "Street light has been out for two weeks, making the area unsafe.",   category: "lighting"      },
  { title: "Street light flickering",      description: "Light on the corner flickers constantly and may cause issues.",      category: "lighting"      },
  { title: "Illegal dumping in park",      description: "Several bags of rubbish dumped near the park entrance.",             category: "hygiene"       },
  { title: "Overfull public bins",         description: "Bins near the market overflow every weekend with no extra collection.", category: "hygiene"     },
  { title: "Dog fouling in playground",    description: "Dog mess found repeatedly inside the children's play area.",         category: "hygiene"       },
  { title: "Fly-tipping on street",        description: "Large furniture items left on the pavement for weeks.",              category: "hygiene"       },
  { title: "Damaged park bench",           description: "Bench in the main square has broken planks and is unsafe to use.",   category: "furniture"     },
  { title: "Broken bus shelter",           description: "Bus shelter roof is partially collapsed after the last storm.",       category: "furniture"     },
  { title: "Broken playground equipment",  description: "Swing set in the children's playground is broken and dangerous.",    category: "furniture"     },
  { title: "Damaged bollard",              description: "Bollard near the pedestrian zone is knocked over and a hazard.",     category: "furniture"     },
  { title: "Missing road sign",            description: "Speed limit sign at junction has been missing for over a month.",    category: "traffic-signs" },
  { title: "Faded pedestrian crossing",    description: "Zebra crossing markings are barely visible, putting walkers at risk.", category: "traffic-signs"},
  { title: "Stop sign knocked down",       description: "Stop sign at a residential junction has been knocked down.",         category: "traffic-signs" },
  { title: "Overgrown vegetation",         description: "Bushes blocking the pavement, hard for pedestrians to pass.",        category: "parks"         },
  { title: "Damaged park bench",           description: "Bench near the fountain has broken planks and is unsafe to sit on.", category: "parks"         },
  { title: "Broken irrigation system",     description: "Water sprinklers in the park are broken and flooding the path.",     category: "parks"         },
  { title: "Vandalism in park",            description: "Graffiti and broken fencing found in the public park.",              category: "parks"         },
];

const REPORT_STATUSES = ["pending", "approved", "closed", "rejected"];

// ── Notification templates ────────────────────────────────────────────────────

const NOTIF_TEMPLATES = [
  { type: "report_status", message: "Your report status has been updated to approved."  },
  { type: "report_status", message: "Your report has been reviewed and closed."         },
  { type: "report_status", message: "Your report has been rejected."                    },
  { type: "new_report",    message: "A new report was submitted in your area."          },
  { type: "new_report",    message: "A report near you has been approved."              },
  { type: "upvote",        message: "Someone upvoted your report."                      },
  { type: "upvote",        message: "Your report now has 10 upvotes!"                   },
  { type: "announcement",  message: "A new announcement has been published."            },
  { type: "announcement",  message: "Check out the latest community update."            },
  { type: "reminder",      message: "Don't forget to follow up on your open reports."   },
];

// ── Announcements ─────────────────────────────────────────────────────────────

const ANNOUNCEMENTS_DATA = [
  { title: "Scheduled maintenance on 20 May",  content: "The platform will be unavailable on 20 May from 02:00 to 04:00 for scheduled maintenance.", is_published: 1 },
  { title: "New category: Noise complaints",   content: "You can now submit reports specifically for noise issues in your neighbourhood.",           is_published: 1 },
  { title: "Community meeting — June 5th",     content: "Join us on June 5th at the town hall to discuss the most upvoted reports this month.",      is_published: 0 },
  { title: "Improved photo upload feature",    content: "You can now attach up to three photos per report for better documentation.",                 is_published: 1 },
  { title: "Response time update",             content: "Our team has reduced average report response time to 4 days. Thank you for your patience.",  is_published: 1 },
  { title: "Winter road maintenance plan",     content: "The council has published its winter road maintenance schedule. Urgent reports get priority.", is_published: 0 },
];

// ── Main Seed Function ────────────────────────────────────────────────────────

async function seed() {
  const conn = await mysql.createConnection(DB_CONFIG);

  try {
    // ── Clear existing data ──────────────────────────────────────────────────
    await conn.execute("SET FOREIGN_KEY_CHECKS = 0");
    const tables = [
      "notification_user", "notifications", "report_upvotes",
      "announcements", "reports", "locations", "users",
    ];
    for (const table of tables) {
      await conn.execute(`TRUNCATE TABLE \`${table}\``);
      console.log(`  Cleared: ${table}`);
    }
    await conn.execute("SET FOREIGN_KEY_CHECKS = 1");

    // ── 1. Insert users ──────────────────────────────────────────────────────
    // 1 admin + 49 regular users = 50 total.
    // All share the same hashed password — bcrypt is slow by design, so we
    // hash once and reuse rather than hashing 50 times during seeding.
    console.log("\nSeeding users...");

    const sharedHash = await bcrypt.hash("password123", SALT_ROUNDS);
    const userIds    = [];

    // Admin — user 1, always index 0 so we can reference it reliably later
    const [adminResult] = await conn.execute(
      `INSERT INTO users (name, surname, email, hashed_psw, role, status)
       VALUES (?, ?, ?, ?, 'admin', 'active')`,
      ["admin", "admin", "admin@test.com", sharedHash]
    );
    userIds.push(adminResult.insertId);
    console.log(`  Inserted admin: test1@test.com (id ${adminResult.insertId})`);

    // Regular users: test2 → test50
    for (let i = 1; i <= 50; i++) {
      const name   = `test${i}`;
      const email  = `test${i}@test.com`;
      const status = Math.random() < 0.1 ? "suspended" : "active"; // ~10% suspended

      const [result] = await conn.execute(
        `INSERT INTO users (name, surname, email, hashed_psw, role, status)
         VALUES (?, ?, ?, ?, 'user', ?)`,
        [name, name, email, sharedHash, status]
      );
      userIds.push(result.insertId);
    }
    console.log(`  Inserted ${userIds.length} users total`);

    const regularUserIds = userIds.slice(1); // exclude admin from report authors

    // ── 2. Insert locations ──────────────────────────────────────────────────
    // 40 locations scattered around Granada city centre (Plaza Nueva area).
    // BASE coords sit in the historic centre; jitter() spreads them up to ~1.5 km.
    console.log("\nSeeding locations...");

    const BASE_LAT    = 37.17654; // Plaza Nueva, Granada
    const BASE_LNG    = -3.59864;
    const locationIds = [];

    for (let i = 0; i < 40; i++) {
      const [result] = await conn.execute(
        "INSERT INTO locations (latitude, longitude) VALUES (?, ?)",
        [
          parseFloat((BASE_LAT + jitter()).toFixed(5)),
          parseFloat((BASE_LNG + jitter()).toFixed(5)),
        ]
      );
      locationIds.push(result.insertId);
    }
    console.log(`  Inserted ${locationIds.length} locations`);

    // ── 3. Insert reports ────────────────────────────────────────────────────
    // 100 reports — templates are reused with random user/location/status combos
    console.log("\nSeeding reports...");
    const reportIds = [];

    for (let i = 0; i < 100; i++) {
      const tpl        = pick(REPORT_TEMPLATES);
      const userId     = pick(regularUserIds);
      const locationId = pick(locationIds);
      const status     = pick(REPORT_STATUSES);

      const [result] = await conn.execute(
        `INSERT INTO reports (user_id, location_id, title, description, category, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, locationId, tpl.title, tpl.description, tpl.category, status]
      );
      reportIds.push(result.insertId);
    }
    console.log(`  Inserted ${reportIds.length} reports`);

    // ── 4. Insert report upvotes ─────────────────────────────────────────────
    // Each user upvotes 1–8 random reports. The Set prevents duplicate pairs
    // (which would violate the composite primary key on report_upvotes).
    console.log("\nSeeding report_upvotes...");
    const upvotePairs = new Set();
    let   upvoteCount = 0;

    for (const userId of userIds) {
      const numUpvotes = randInt(1, 8);
      for (let i = 0; i < numUpvotes; i++) {
        const reportId = pick(reportIds);
        const key      = `${userId}-${reportId}`;
        if (upvotePairs.has(key)) continue;

        upvotePairs.add(key);
        await conn.execute(
          "INSERT INTO report_upvotes (user_id, report_id) VALUES (?, ?)",
          [userId, reportId]
        );
        upvoteCount++;
      }
    }
    console.log(`  Inserted ${upvoteCount} upvotes`);

    // ── 5. Insert notifications ──────────────────────────────────────────────
    console.log("\nSeeding notifications...");
    const notificationIds = [];

    for (let i = 0; i < 30; i++) {
      const tpl   = pick(NOTIF_TEMPLATES);
      const refId = pick(reportIds);

      const [result] = await conn.execute(
        "INSERT INTO notifications (type, reference_id, message) VALUES (?, ?, ?)",
        [tpl.type, refId, tpl.message]
      );
      notificationIds.push(result.insertId);
    }
    console.log(`  Inserted ${notificationIds.length} notifications`);

    // ── 6. Insert notification_user ──────────────────────────────────────────
    // Each notification delivered to 1–5 random users with a random read state
    console.log("\nSeeding notification_user...");
    const notifUserPairs = new Set();
    let   nuCount        = 0;

    for (const notifId of notificationIds) {
      const recipients = new Set();
      while (recipients.size < randInt(1, 5)) {
        recipients.add(pick(userIds));
      }
      for (const userId of recipients) {
        const key = `${notifId}-${userId}`;
        if (notifUserPairs.has(key)) continue;

        notifUserPairs.add(key);
        await conn.execute(
          "INSERT INTO notification_user (notification_id, user_id, is_read) VALUES (?, ?, ?)",
          [notifId, userId, randInt(0, 1)]
        );
        nuCount++;
      }
    }
    console.log(`  Inserted ${nuCount} notification_user rows`);

    // ── 7. Insert announcements ──────────────────────────────────────────────
    console.log("\nSeeding announcements...");
    const adminId = userIds[0];

    for (const a of ANNOUNCEMENTS_DATA) {
      await conn.execute(
        `INSERT INTO announcements (title, content, is_published, created_by)
         VALUES (?, ?, ?, ?)`,
        [a.title, a.content, a.is_published, adminId]
      );
    }
    console.log(`  Inserted ${ANNOUNCEMENTS_DATA.length} announcements`);

    console.log("\n✅ Database seeded successfully!");
    console.log("   Admin login → admin@test.com / password123");

  } catch (err) {
    console.error("\n❌ Seed failed:", err.message);
    throw err;
  } finally {
    await conn.end();
  }
}

seed();