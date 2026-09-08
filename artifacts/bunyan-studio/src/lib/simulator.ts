import { PlacedPiece } from './store';
import { SEALED_TYPES, EVENT_CONTRACTS } from './constants';

function randId() {
  return Math.random().toString(36).substring(2, 9);
}

export function generateSessionEvents(pieces: PlacedPiece[], ageGroup: string, gameId: string) {
  const events: any[] = [];
  let t = 0;

  const sessionId = 'sess_' + randId();
  const pseudonymId = 'p_' + randId();
  const common = { bes_version: '1.0' };

  events.push({
    ...common,
    t,
    verb: 'session.start',
    fields: { session_id: sessionId, pseudonym_id: pseudonymId, age_segment: ageGroup, game_id: gameId, game_version: '1', bes_version: '1.0', device: 'web' }
  });

  for (let i = 0; i < 20; i++) {
    t += Math.floor(Math.random() * 2000) + 500;
    
    if (pieces.length === 0) break;
    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    const typeDef = SEALED_TYPES[piece.sealedType];
    
    if (!typeDef || typeDef.alwaysRecords.length === 0) continue;
    
    const verb = typeDef.alwaysRecords[Math.floor(Math.random() * typeDef.alwaysRecords.length)];
    
    let fields: any = {};
    if (verb === 'zone.enter') fields = { zone_id: piece.id };
    else if (verb === 'zone.exit') fields = { zone_id: piece.id, dwell_ms: 5000 };
    else if (verb === 'npc.approach') fields = { npc_id: piece.id };
    else if (verb === 'npc.interact') fields = { npc_id: piece.id, latency_ms: 1200 };
    else if (verb === 'object.pick') fields = { object_id: piece.id, pick_latency_ms: 800, from_zone: 'z1' };
    else if (verb === 'object.drop') fields = { object_id: piece.id, to_zone: 'z1' };
    else if (verb === 'object.place') fields = { container_id: piece.id, object_id: 'obj1', correct: Math.random() > 0.3, latency_ms: 1500, attempt_index: 1 };
    else if (verb === 'object.use') fields = { tool_id: piece.id, latency_ms: 900 };
    else if (verb === 'prompt.presented') fields = { stimulus_id: piece.id, presented_at: t, modality: 'visual' };
    else if (verb === 'decision.made') fields = { choice_id: piece.id, options_shown: 3, latency_ms: 2500, changed_mind_count: 0 };
    else if (verb === 'rule.violation') fields = { rule_id: piece.id, severity: 2 };
    else if (verb === 'self.correction') fields = { rule_id: piece.id, corrected_within_ms: 4000 };
    else if (verb === 'turn.wait') fields = { wait_ms: 8000, position_in_queue: 2 };
    else if (verb === 'turn.skip') fields = { position_in_queue: 1 };
    else if (verb === 'hint.request') fields = { elapsed_ms: 12000, attempt_index: 2 };
    else if (verb === 'movement.sample') fields = { x: 10, y: 20, heading: 90, speed: 4.5, dt: 100 };
    else if (verb === 'task.complete') fields = { duration_ms: 45000, accuracy: 0.9, optimal_path_ratio: 0.8 };
    else if (verb === 'task.fail') fields = { duration_ms: 15000, attempt_index: 1 };

    // Fill missing required fields with defaults to ensure we never emit empty payloads
    const contract = EVENT_CONTRACTS[verb];
    contract.forEach((key: string) => {
      if (fields[key] === undefined) {
        fields[key] = typeof key === 'string' && key.endsWith('_ms') ? 1000 : 'default';
      }
    });

    events.push({
      ...common,
      t,
      verb,
      fields
    });
  }

  t += 1000;
  events.push({
    ...common,
    t,
    verb: 'session.end',
    fields: { duration_ms: t, event_count: events.length + 1 }
  });

  return events;
}
