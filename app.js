// Loyalty Event Contract Validator — MVP Version with scenarios and side-by-side comparison

// --- Event Templates (valid examples) ---

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

// --- Invalid / drifted examples (to demonstrate failures) ---

const invalidTemplates = {
  earn: {
    user_id: "12345",
    amount_spent: "100",           // wrong type (string instead of number)
    // currency missing entirely
    partner_id: "partner_001",
    tier: "Gold",
    timestamp: "2025-11-22T10:00:00Z",
    debug_flag: true               // unexpected field
  },

  redeem: {
    user_id: "12345",
    points_used: "500",            // wrong type
    // reward_id missing
    partner_id: "partner_001",
    timestamp: "2025-11-22T10:05:00Z",
    promo_code: "SPRING24"        // unexpected field
  },

  tier_update: {
    user_id: "12345",
    old_tier: "Silver",
    new_tier: 123,                 // wrong type (number instead of string)
    // partner_id missing
    effective_date: "2025-11-22",
    notes: "VIP override"          // unexpected field
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

// --- DOM references ---

const eventTypeSelect = document.getElementById("eventType");
const scenarioSelect = document.getElementById("scenario");
const payloadBox = document.getElementById("eventPayload");
const output = document.getElementById("output");
const expectedBox = document.getElementById("expectedBox");
const receivedBox = document.getElementById("receivedBox");

// --- Helper: update payload + expected contract ---

function updatePayloadAndExpected() {
  const type = eventTypeSelect.value;

  if (!type) {
    payloadBox.value = "";
    expectedBox.textContent = "Select an event type to see the expected shape.";
    receivedBox.textContent = "This will mirror the JSON being validated.";
    return;
  }

  const scenario = scenarioSelect.value || "valid";
  const source = scenario === "invalid" ? invalidTemplates : templates;
  const payload = source[type];

  // Fill the textarea and both side-by-side boxes
  const payloadString = JSON.stringify(payload, null, 2);
  payloadBox.value = payloadString;
  receivedBox.textContent = payloadString;

  const expectedString = JSON.stringify(contracts[type], null, 2);
  expectedBox.textContent = expectedString;
}

// Update when event type or scenario changes
eventTypeSelect.addEventListener("change", updatePayloadAndExpected);
scenarioSelect.addEventListener("change", updatePayloadAndExpected);

// --- Validation Logic ---

document.getElementById("validateBtn").addEventListener("click", () => {
  const type = eventTypeSelect.value;

  if (!type) {
    output.textContent = "Select an event type before validating.";
    return;
  }

  let payload;
  try {
    payload = JSON.parse(payloadBox.value);
  } catch (err) {
    output.textContent = "Invalid JSON. Please fix formatting.";
    return;
  }

  // Keep the received box in sync with whatever we're actually validating
  receivedBox.textContent = JSON.stringify(payload, null, 2);

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
      const expectedType = contract[field];
      const actualType = typeof payload[field];
      if (actualType !== expectedType) {
        wrongTypes.push(`${field} (expected ${expectedType}, got ${actualType})`);
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
  messages.push(`Scenario: ${scenarioSelect.value}`);

  if (missing.length === 0 && wrongTypes.length === 0 && unexpected.length === 0) {
    messages.push("\n✓ Event matches the expected contract.");
  } else {
    if (missing.length) {
      messages.push("\nMissing fields:\n- " + missing.join("\n- "));
    }
    if (wrongTypes.length) {
      messages.push("\nType mismatches:\n- " + wrongTypes.join("\n- "));
    }
    if (unexpected.length) {
      messages.push("\nUnexpected fields:\n- " + unexpected.join("\n- "));
    }
  }

  output.textContent = messages.join("\n");
});
