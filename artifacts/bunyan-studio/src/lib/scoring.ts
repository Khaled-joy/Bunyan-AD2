export const SCORING_VERSION = '1.0';

export interface ScoreState {
  responsibility: number;
  respect: number;
  participation: number;
  courage: number;
  problemSolving: number;
}

export const initialScore: ScoreState = {
  responsibility: 0,
  respect: 0,
  participation: 0,
  courage: 0,
  problemSolving: 0,
};

export function updateScores(events: any[], currentScore: ScoreState): ScoreState {
  let score = { ...currentScore };

  // This is a naive implementation matching the constraints
  // of SCORING_VERSION = '1.0'.
  // We deduce scores purely from the simulated events.

  for (const event of events) {
    switch (event.type) {
      case 'object.place':
        if (event.payload?.correct) score.responsibility = Math.min(100, score.responsibility + 15);
        else score.responsibility = Math.max(0, score.responsibility - 5);
        break;
      case 'rule.violation':
        score.respect = Math.max(0, score.respect - 20);
        break;
      case 'self.correction':
        score.respect = Math.min(100, score.respect + 25);
        break;
      case 'turn.wait':
        score.respect = Math.min(100, score.respect + 10);
        break;
      case 'decision.made':
        score.courage = Math.min(100, score.courage + 15);
        break;
      case 'hint.request':
        score.problemSolving = Math.max(0, score.problemSolving - 5);
        score.participation = Math.min(100, score.participation + 5);
        break;
      case 'task.complete':
        score.problemSolving = Math.min(100, score.problemSolving + 30);
        score.participation = Math.min(100, score.participation + 20);
        break;
      case 'zone.enter':
        score.participation = Math.min(100, score.participation + 10);
        break;
    }
  }

  return score;
}
