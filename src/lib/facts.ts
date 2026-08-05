function normaliseFact(value: string) {
  return value
    .toLowerCase()
    .replace(/£/g, "gbp ")
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}.]+/gu, " ")
    .trim();
}

export function factIsPreserved(output: string, fact: string) {
  const normalisedOutput = normaliseFact(output);
  const normalisedFact = normaliseFact(fact);

  if (!normalisedFact) {
    return true;
  }

  if (normalisedOutput.includes(normalisedFact)) {
    return true;
  }

  const compactOutput = normalisedOutput.replace(/\s+/g, "");
  const compactFact = normalisedFact.replace(/\s+/g, "");

  return compactOutput.includes(compactFact);
}

export function validateFactPreservation(output: string, facts: readonly string[]) {
  const missingFacts = facts.filter((fact) => !factIsPreserved(output, fact));

  return {
    ok: missingFacts.length === 0,
    missingFacts,
  };
}
