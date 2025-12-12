
# Participant Randomization Logic

This document describes the randomization procedure used in the FAConLDQ experiment to assign participants to one of four experimental conditions in a 2x2 factorial design.

## Design

- **Factor 1: Advisory Source**: `ai` vs `human`
- **Factor 2: Scenario**: `xyz` vs `techtrend`
- **Blocking Variable**: `ROLE_LEVEL` (collected in the initial assessment step)

## Procedure: Deterministic Block Randomization

The study employs a deterministic assignment method based on the participant's unique anonymous ID and their self-reported `ROLE_LEVEL`. This ensures a balanced distribution of participants with different seniority levels across the four experimental cells, while also guaranteeing that the assignment is reproducible.

The logic is implemented in `src/app/start/page.tsx`.

### Steps:

1.  **Data Collection**: The participant first completes the "Role & Experience" section of the initial assessment, providing their `ROLE_LEVEL` (e.g., 'Manager', 'Executive').

2.  **Assignment Trigger**: Upon successful submission of this section, the `assignCondition` function is triggered.

3.  **Hashing**: Two numerical hashes are generated:
    -   `userHash`: A 32-bit integer hash is created from the participant's unique anonymous Firebase UID (e.g., `simpleHash('eLpGapAWClOgo42kZkSBfGe23f72')`).
    -   `roleHash`: A 32-bit integer hash is created from the participant's `ROLE_LEVEL` string (e.g., `simpleHash('Manager')`).

4.  **Condition Assignment**: The hashes are combined, and the modulo operator (`%`) is used to deterministically assign the condition:
    -   **Advisory Source (`ai` or `human`)**: Assigned based on `(userHash + roleHash) % 2`. This distributes participants of a given role level evenly between the AI and Human conditions.
    -   **Scenario (`xyz` or `techtrend`)**: Assigned based on `Math.floor((userHash + roleHash) / 2) % 2`. This further divides the groups into the two scenarios.

### Example Code Snippet:

```typescript
// From src/app/start/page.tsx

const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const assignCondition = (roleLevel: string) => {
    if (!user || !sessionData) return;

    const sources: ExperimentalCondition['advisorySource'][] = ['ai', 'human'];
    const scenarios: ExperimentalCondition['scenario'][] = ['xyz', 'techtrend'];

    const userHash = simpleHash(user.uid);
    const roleHash = simpleHash(roleLevel);
    const combinedHash = userHash + roleHash;

    const assignedSource = sources[combinedHash % sources.length];
    const assignedScenario = scenarios[Math.floor(combinedHash / sources.length) % scenarios.length];

    const assignedCondition: ExperimentalCondition = {
        advisorySource: assignedSource,
        scenario: assignedScenario,
    };
    
    updateSessionData({ condition: assignedCondition });
};
```

This method ensures that the assignment is pseudo-random, reproducible for any given participant ID and role, and balanced across conditions as the number of participants grows.
