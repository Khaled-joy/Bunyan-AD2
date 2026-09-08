import { PlacedPiece } from './store';
import { SEALED_TYPES } from './constants';

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
  const newScore = { ...currentScore };

  events.forEach(event => {
    switch (event.verb) {
      case 'object.place':
        if (event.fields.correct) {
          newScore.responsibility = Math.min(100, newScore.responsibility + 15);
        } else {
          newScore.responsibility = Math.max(0, newScore.responsibility - 5);
        }
        break;
      case 'turn.wait':
        newScore.respect = Math.min(100, newScore.respect + Math.floor(event.fields.wait_ms / 1000));
        break;
      case 'rule.violation':
        newScore.respect = Math.max(0, newScore.respect - 10);
        break;
      case 'zone.enter':
        newScore.participation = Math.min(100, newScore.participation + 5);
        break;
      case 'decision.made':
        newScore.courage = Math.min(100, newScore.courage + 10);
        break;
      case 'hint.request':
        newScore.problemSolving = Math.min(100, newScore.problemSolving + 5);
        break;
      case 'task.complete':
        newScore.problemSolving = Math.min(100, newScore.problemSolving + (event.fields.accuracy * 20));
        break;
    }
  });

  return newScore;
}
