// Scoring calculations for different game modes

export type ScoreClassification = {
  name: "Hole in One" | "Albatross" | "Eagle" | "Birdie" | "Par" | "Bogey" | "Double Bogey" | "Triple Bogey" | "Worse";
  strokesVsPar: number;
  color: string;
};

export type GameMode = "strokePlay" | "system36" | "stableford";

/**
 * Classify a score relative to par
 * @param strokes - Number of strokes taken
 * @param par - Par value for the hole
 * @returns Score classification with name, strokes vs par, and color
 */
export function classifyScore(strokes: number, par: number): ScoreClassification {
  const diff = strokes - par;

  // Special case: Hole in One
  if (strokes === 1) {
    return { name: "Hole in One", strokesVsPar: diff, color: "gold" };
  }

  // Albatross: 3 under par or better
  if (diff <= -3) {
    return { name: "Albatross", strokesVsPar: diff, color: "purple" };
  }

  // Eagle: 2 under par
  if (diff === -2) {
    return { name: "Eagle", strokesVsPar: diff, color: "blue" };
  }

  // Birdie: 1 under par
  if (diff === -1) {
    return { name: "Birdie", strokesVsPar: diff, color: "green" };
  }

  // Par: equal to par
  if (diff === 0) {
    return { name: "Par", strokesVsPar: diff, color: "yellow" };
  }

  // Bogey: 1 over par
  if (diff === 1) {
    return { name: "Bogey", strokesVsPar: diff, color: "orange" };
  }

  // Double Bogey: 2 over par
  if (diff === 2) {
    return { name: "Double Bogey", strokesVsPar: diff, color: "red" };
  }

  // Triple Bogey: 3 over par
  if (diff === 3) {
    return { name: "Triple Bogey", strokesVsPar: diff, color: "darkred" };
  }

  // Worse: 4 or more over par
  return { name: "Worse", strokesVsPar: diff, color: "black" };
}

/**
 * Calculate Stableford points
 * Formula: 2 + (Par - Strokes), minimum 0
 * @param strokes - Number of strokes taken
 * @param par - Par value for the hole
 * @returns Points earned (0 or more)
 */
export function calculateStablefordPoints(strokes: number, par: number): number {
  const points = 2 + (par - strokes);
  return Math.max(0, points);
}

/**
 * Calculate System36 points
 * - Birdie or better: 2 points
 * - Par: 2 points
 * - Bogey: 1 point
 * - Double Bogey or worse: 0 points
 * @param strokes - Number of strokes taken
 * @param par - Par value for the hole
 * @returns Points earned (0, 1, or 2)
 */
export function calculateSystem36Points(strokes: number, par: number): number {
  const diff = strokes - par;

  // Birdie or better
  if (diff <= -1) {
    return 2;
  }

  // Par
  if (diff === 0) {
    return 2;
  }

  // Bogey
  if (diff === 1) {
    return 1;
  }

  // Double Bogey or worse
  return 0;
}

/**
 * Calculate Stroke Play total
 * Simply sum all strokes
 * @param scores - Array of stroke counts
 * @returns Total strokes
 */
export function calculateStrokePlayTotal(scores: number[]): number {
  return scores.reduce((sum, strokes) => sum + strokes, 0);
}

/**
 * Calculate final score based on game mode
 * @param scores - Array of objects with strokes and par
 * @param gameMode - Game mode to use for calculation
 * @returns Final score (total strokes or total points)
 */
export function calculateFinalScore(
  scores: Array<{ strokes: number; par: number }>,
  gameMode: GameMode
): number {
  if (gameMode === "strokePlay") {
    return calculateStrokePlayTotal(scores.map((s) => s.strokes));
  }

  if (gameMode === "stableford") {
    return scores.reduce((total, score) => {
      return total + calculateStablefordPoints(score.strokes, score.par);
    }, 0);
  }

  if (gameMode === "system36") {
    return scores.reduce((total, score) => {
      return total + calculateSystem36Points(score.strokes, score.par);
    }, 0);
  }

  throw new Error(`Unknown game mode: ${gameMode}`);
}
