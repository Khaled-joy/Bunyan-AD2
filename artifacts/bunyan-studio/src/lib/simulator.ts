import { PlacedPiece } from './store';
import { PIECES } from './constants';
import { SCORING_VERSION } from './scoring';

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSessionEvents(placedPieces: PlacedPiece[]) {
  const events: any[] = [];
  let t = 0;
  
  // Base details
  const sessionId = crypto.randomUUID();
  const besVersion = SCORING_VERSION;
  
  events.push({
    t,
    type: 'session.start',
    payload: { session_id: sessionId, pseudonym_id: 'child_42', age_segment: '8-10', game_id: 'sim_1', game_version: '1.0', bes_version: besVersion, device: 'tablet' }
  });
  
  const rounds = randomInt(5, 7);
  
  for (let r = 0; r < rounds; r++) {
    t += randomInt(400, 2000);
    
    // Agent move
    if (placedPieces.some(p => p.key === 'agent')) {
      events.push({
        t, type: 'movement.sample',
        payload: { x: randomInt(10, 90), y: randomInt(10, 90), heading: randomInt(0, 359), speed: 4.5, dt: 100 }
      });
    }

    t += randomInt(200, 1500);

    // Pick and Place
    if (placedPieces.some(p => p.key === 'carryable') && placedPieces.some(p => p.key === 'bin')) {
      events.push({ t, type: 'object.pick', payload: { object_id: 'obj_1', pick_latency_ms: randomInt(400, 1500), from_zone: 'zone_a' } });
      t += randomInt(1000, 3800);
      events.push({ t, type: 'object.place', payload: { bin_id: 'bin_1', object_id: 'obj_1', correct: Math.random() > 0.2, latency_ms: randomInt(800, 2500), attempt_index: 1 } });
    }

    t += randomInt(500, 1500);

    // Queue wait
    if (placedPieces.some(p => p.key === 'queue')) {
      events.push({ t, type: 'turn.wait', payload: { wait_ms: randomInt(2000, 8000), position_in_queue: randomInt(1, 4) } });
    }

    // Rules
    if (placedPieces.some(p => p.key === 'rule') && Math.random() > 0.6) {
      events.push({ t, type: 'rule.violation', payload: { rule_id: 'keep_clean', severity: 'low' } });
      if (Math.random() > 0.5) {
        t += randomInt(1000, 3000);
        events.push({ t, type: 'self.correction', payload: { rule_id: 'keep_clean', corrected_within_ms: randomInt(1000, 2500) } });
      }
    }

    t += randomInt(500, 1500);

    // Zone
    if (placedPieces.some(p => p.key === 'zone')) {
      events.push({ t, type: 'zone.enter', payload: { zone_id: 'zone_opt' } });
      t += randomInt(800, 4000);
      events.push({ t, type: 'zone.exit', payload: { zone_id: 'zone_opt', dwell_ms: randomInt(800, 4000) } });
    }

    t += randomInt(400, 1200);

    // Choice
    if (placedPieces.some(p => p.key === 'choice')) {
      events.push({ t, type: 'prompt.presented', payload: { stimulus_id: 'q_1', presented_at: t, modality: 'visual' } });
      t += randomInt(1500, 3800);
      events.push({ t, type: 'decision.made', payload: { choice_id: 'opt_A', options_shown: 3, latency_ms: randomInt(1500, 3800), changed_mind_count: randomInt(0, 2) } });
    }

    // Hint
    if (placedPieces.some(p => p.key === 'hint') && Math.random() > 0.7) {
      events.push({ t, type: 'hint.request', payload: { elapsed_ms: t, attempt_index: 1 } });
    }
  }

  t += randomInt(1000, 3000);
  
  if (placedPieces.some(p => p.key === 'goal')) {
    events.push({ t, type: 'task.complete', payload: { duration_ms: t, accuracy: 0.85, optimal_path_ratio: 0.9 } });
  }
  
  events.push({ t, type: 'session.end', payload: { duration_ms: t, event_count: events.length } });

  return events;
}
