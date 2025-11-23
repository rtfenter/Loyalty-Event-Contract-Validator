// Loyalty Event Contract Validator — MVP Version

// --- Event Templates (auto-filled when user selects type) ---

const templates = {
  earn: {
    user_id: "12345",
    amount_spent: 100,
    currency: "USD",
    partner_id: "partner_001",
    tier: "Gold",
    timestamp: "2025-11-22T10:00:00Z"
  },

  redeem: {
    user_id: "12345",
    points_used: 500,
    reward_id: "reward_abc",
    partner_id: "partner_001",
    timestamp: "2025-11-22T10:05:00Z"
  },

  tier_update: {
    user_id: "12345",
    old_tier: "Silver",
    new_tier: "Gold",
    partner_id: "partner_001",
    effective_date: "2025-11-22"
  }
};

// --- Simple Contracts for Validation ---

const contracts = {
  earn: {
    user_id: "string",
    amount_spent: "number",
    currency: "string",
    partner_id: "string",
    tier: "string",
    timestamp: "string"
  },

  redeem: {
    user_id: "string",
    points_used: "number",
    reward_id: "string",
    partner_id: "string",
    timestamp: "string"
  },

  tier_update: {
    user_id: "string",
    old_tier: "string",
    new_tier: "string",
    partner_id: "string",
    effective_date: "string"
  }
};

// --- Auto-fill template whenever event type changes ---

document.getElementById("eventType").addEventListener("change", function () {
  const type = this.value;
  const box = document.getElementById("eventPayload");

  if (!type) {
    box.value = "";
    return;
  }

  box.value = JSON.stringify(templates[type], null, 2);
});

// --- Validation Logic ---

document.getElementById("validateBtn").addEventListener("click", () => {
  const type = document.getElementById("eventType").value;
  const output = document.getElementById("output");

  if (!type) {
    output.textContent = "Select an event type before validating.";
    return;
  }

  let payload;
  try {
    payload = JSON.parse(document.getElementById("eventPayload").value);
  } catch (err) {
    output.textContent = "Invalid JSON. Please fix formatting.";
    return;
  }

  const contract = contracts[type];
  let messages = [];
  let missing = [];
  let wrongTypes = [];
  let unexpected = [];

  // Check required fields + types
  for (let field in contract) {
    if (!(field in payload)) {
      missing.push(field);
    } else {
      const expected = contract[field];
      const actual = typeof payload[field];
      if (actual !== expected) {
        wrongTypes.push(`${field} (expected ${expected}, got ${actual})`);
      }
    }
  }

  // Check unexpected fields
  for (let field in payload) {
    if (!(field in contract)) {
      unexpected.push(field);
    }
  }

  // Build output
  messages.push(`Event Type: ${type}`);

  if (missing.length === 0 && wrongTypes.length === 0 && unexpected.length === 0) {
    messages.push("✓ Event matches the expected contract.");
  } else {
    if (missing.length) messages.push("\nMissing fields:\n- " + missing.join("\n- "));
    if (wrongTypes.length) messages.push("\nType mismatches:\n- " + wrongTypes.join("\n- "));
    if (unexpected.length) messages.push("\nUnexpected fields:\n- " + unexpected.join("\n- "));
  }

  output.textContent = messages.join("\n");
});
