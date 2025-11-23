// Loyalty Event Contract Validator — upgraded layout version

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
const expectedBox = document.getElementById("expectedBox");
const receivedBox = document.getElementById("receivedBox");

const statusEl = document.getElementById("validate-status");
const summaryEl = document.getElementById("summary");
const missingLine = document.getElementById("missing-line");
const typesLine = document.getElementById("types-line");
const unexpectedLine = document.getElementById("unexpected-line");
const rawOutput = document.getElementById("raw-output");

// --- Helper: update payload + expected contract ---

function updatePayloadAndExpected() {
  const type = eventTypeSelect.value;

  if (!type) {
    payloadBox.value = "";
    expectedBox.textContent = "Select an event type to see the expected shape.";
    receivedBox.textContent = "This will mirror the JSON being validated.";
    statusEl.textContent = "Select an event type to begin.";
    resetSummary();
    return;
  }

  const scenario = scenarioSelect.value || "valid";
  const source = scenario === "invalid" ? invalidTemplates : templates;
  const payload = source[type];

  const payloadString = JSON.stringify(payload, null, 2);
  payloadBox.value = payloadString;
  receivedBox.textContent = payloadString;

  const expectedString = JSON.stringify(contracts[type], null, 2);
  expectedBox.textContent = expectedString;

  statusEl.textContent = `Loaded ${scenario} example for "${type}" event. Click Validate Event to run checks.`;
  resetSummary();
}

function resetSummary() {
  summaryEl.innerHTML = `
    <div class="summary-badge summary-badge-idle">
      No validation run yet.
    </div>
  `;
  missingLine.textContent =
    "Required fields that are absent from the payload will appear here.";
  typesLine.textContent =
    "Fields with wrong types (string vs number, etc.) will be listed here.";
  unexpectedLine.textContent =
    "Extra fields not defined in the contract show up here.";
  rawOutput.textContent =
    "Select an event type and scenario, then click \"Validate Event\" to see checks.";
}

// Update when event type or scenario changes
eventTypeSelect.addEventListener("change", updatePayloadAndExpected);
scenarioSelect.addEventListener("change", updatePayloadAndExpected);

// --- Validation Logic ---

document.getElementById("validateBtn").addEventListener("click", () => {
  const type = eventTypeSelect.value;

  if (!type) {
    statusEl.textContent = "Select an event type before validating.";
    summaryEl.innerHTML = `
      <div class="summary-badge summary-badge-fail">
        No event type selected.
      </div>
    `;
    return;
  }

  let payload;
  try {
    payload = JSON.parse(payloadBox.value || "");
  } catch (err) {
    statusEl.textContent = "Invalid JSON. Please fix formatting.";
    summaryEl.innerHTML = `
      <div class="summary-badge summary-badge-fail">
        Cannot validate: invalid JSON.
      </div>
    `;
    rawOutput.textContent = "Invalid JSON. Error: " + (err.message || "Parse error.");
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
  messages.push(`Scenario: ${scenarioSelect.value || "custom"}`);

  const allClean =
    missing.length === 0 && wrongTypes.length === 0 && unexpected.length === 0;

  if (allClean) {
    messages.push("");
    messages.push("✓ Event matches the expected contract.");
  } else {
    if (missing.length) {
      messages.push("");
      messages.push("Missing fields:");
      missing.forEach((f) => messages.push("- " + f));
    }
    if (wrongTypes.length) {
      messages.push("");
      messages.push("Type mismatches:");
      wrongTypes.forEach((t) => messages.push("- " + t));
    }
    if (unexpected.length) {
      messages.push("");
      messages.push("Unexpected fields:");
      unexpected.forEach((u) => messages.push("- " + u));
    }
  }

  // Update status text
  statusEl.textContent = allClean
    ? "Validation passed. Event matches the contract."
    : "Validation complete. Issues detected.";

  // Update summary badge
  summaryEl.innerHTML = "";
  const badge = document.createElement("div");
  if (allClean) {
    badge.className = "summary-badge summary-badge-ok";
    badge.textContent = "Event matches the expected contract.";
  } else {
    const issueCount =
      missing.length + wrongTypes.length + unexpected.length;
    badge.className = "summary-badge summary-badge-fail";
    badge.innerHTML = `
      <span class="count">${issueCount}</span> issue${
      issueCount === 1 ? "" : "s"
    } detected across contract checks.
    `;
  }
  summaryEl.appendChild(badge);

  // Update the three contract lines
  if (missing.length === 0) {
    missingLine.textContent = "No missing fields.";
  } else {
    missingLine.innerHTML =
      "Missing:<br /><strong>" + missing.join(", ") + "</strong>";
  }

  if (wrongTypes.length === 0) {
    typesLine.textContent = "No type mismatches.";
  } else {
    typesLine.innerHTML =
      "Type mismatches:<br /><strong>" +
      wrongTypes.join(", ") +
      "</strong>";
  }

  if (unexpected.length === 0) {
    unexpectedLine.textContent = "No unexpected fields.";
  } else {
    unexpectedLine.innerHTML =
      "Unexpected fields:<br /><strong>" +
      unexpected.join(", ") +
      "</strong>";
  }

  // Raw report
  rawOutput.textContent = messages.join("\n");
});

// Optional: preload an example for instant demo (earn + valid)
(function preload() {
  eventTypeSelect.value = "earn";
  scenarioSelect.value = "valid";
  updatePayloadAndExpected();
})();
