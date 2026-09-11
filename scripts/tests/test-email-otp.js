// scripts/tests/test-email-otp.js — Real Supabase Email OTP integration test
// Reads endpoint + keys from root .env (gitignored).
// Usage: node scripts/tests/test-email-otp.js <email> [<6-digit-code>]

const fs = require("fs");
const path = require("path");
const { createClient } = require("../../frontend/node_modules/@supabase/supabase-js");

const envPath = path.join(__dirname, "../../.env");
const env = fs.existsSync(envPath)
  ? fs
      .readFileSync(envPath, "utf-8")
      .split("\n")
      .reduce((acc, line) => {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m) acc[m[1]] = m[2].replace(/"|'/g, "");
        return acc;
      }, {})
  : {};

const URL   = env.SUPABASE_URL || process.env.SUPABASE_URL;
const KEY   = env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SROLE = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY || !SROLE) {
  console.error(".env is missing SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(URL, KEY);
const admin    = createClient(URL, SROLE);

const TEST_EMAIL = process.argv[2];
const OTP_CODE   = process.argv[3];

function log(label, data) {
  console.log(`\n━━━ ${label} ━━━`);
  console.log(JSON.stringify(data, null, 2));
}

async function run() {
  if (!TEST_EMAIL) {
    console.error("Usage: node scripts/tests/test-email-otp.js <email> [<6-digit-code>]");
    process.exit(1);
  }

  console.log("\n=== TEST 1: signInWithOtp (shouldCreateUser: true) ===");
  const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
    email: TEST_EMAIL,
    options: { shouldCreateUser: true },
  });
  log("signInWithOtp response", { otpData, otpError });
  if (otpError) {
    console.error("❌ Send OTP FAILED:", otpError.message);
  } else {
    console.log("✅ OTP sent — no error. (Check your inbox for the code.)");
  }

  console.log("\n=== TEST 2: verifyOtp with WRONG code (000000) ===");
  const { data: badData, error: badError } = await supabase.auth.verifyOtp({
    email: TEST_EMAIL,
    token: "000000",
    type: "email",
  });
  log("verifyOtp(wrong) response", { badData, badError });
  if (!badError) {
    console.error("❌ Expected error for wrong code, got none.");
  } else {
    const badMsg = badError.message.toLowerCase();
    const isTokenError =
      badMsg.includes("expired") || badMsg.includes("invalid") ||
      badMsg.includes("mismatch") || badMsg.includes("token");
    console.log(
      isTokenError
        ? `✅ Wrong-code returns expected token error -> "${badError.message}"`
        : `⚠️  Wrong-code error is not a token error -> "${badError.message}"`
    );
  }

  if (OTP_CODE) {
    console.log(`\n=== TEST 3: verifyOtp with actual code ${OTP_CODE} ===`);
    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
      email: TEST_EMAIL,
      token: OTP_CODE,
      type: "email",
    });
    log("verifyOtp(valid) response", {
      hasSession: !!sessionData?.session,
      user_id: sessionData?.user?.id,
      user_email: sessionData?.user?.email,
      sessionError,
    });
    if (sessionError) {
      console.error("❌ Verify FAILED:", sessionError.message);
      process.exit(1);
    }
    console.log("✅ OTP verified — session obtained.");

    if (sessionData?.user?.id) {
      const { data: prof } = await admin
        .from("profiles")
        .select("id, email, role, full_name, department, created_at")
        .eq("id", sessionData.user.id)
        .single();
      console.log("\n=== After sign-in: profiles row (from handle_new_user trigger) ===");
      if (prof) {
        console.log("✅ Profile row:", prof);
        console.log(prof.role === "APPLICANT" ? "✅ role = APPLICANT (correct)" : `❌ role is wrong: ${prof.role}`);
        console.log(prof.email === TEST_EMAIL.toLowerCase() ? "✅ email matches" : `❌ email mismatch: ${prof.email}`);
      } else {
        console.error("❌ No profile row found for", sessionData.user.id);
      }
      await supabase.auth.signOut();
      console.log("\n✅ Signed out. All tests complete.");
    }
  } else {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Happy-path test needs the code from the inbox.");
    console.log("When you have it, re-run:");
    console.log(`  node scripts/tests/test-email-otp.js ${TEST_EMAIL} <code>`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }
}

run().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
