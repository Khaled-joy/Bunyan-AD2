import { useEffect, useMemo, useRef } from 'react';
import {
  createGameContext,
  startTelemetrySession,
  type AgeBand,
  type GameContext,
  type ItemHandle,
  type Language,
} from '../../../packages/telemetry/src/index.ts';

export type RuntimeProfile = { age?: string; grade?: string };

function makeId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `bunayn-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function getSafePlayerId() {
  const guest = (() => {
    try {
      return sessionStorage.getItem('bunayn-guest-mode') === 'true';
    } catch {
      return false;
    }
  })();
  const storage = guest ? sessionStorage : localStorage;
  try {
    const key = 'bunayn-telemetry-player';
    const existing = storage.getItem(key);
    if (existing) return existing;
    const created = makeId();
    storage.setItem(key, created);
    return created;
  } catch {
    return makeId();
  }
}

export function ageBandFromProfile(profile?: RuntimeProfile): AgeBand {
  const age = Number.parseInt(profile?.age ?? '', 10);
  if (Number.isFinite(age)) {
    if (age >= 13) return 'cycle3';
    if (age >= 9) return 'cycle2';
    return 'cycle1';
  }
  const grade = Number.parseInt(profile?.grade ?? '', 10);
  if (Number.isFinite(grade)) {
    if (grade >= 9) return 'cycle3';
    if (grade >= 5) return 'cycle2';
  }
  return 'cycle1';
}

export function difficultyFor(profile: RuntimeProfile | undefined, level: number, accuracy = 0.5) {
  const ageBand = ageBandFromProfile(profile);
  const ageBase = ageBand === 'cycle3' ? 3 : ageBand === 'cycle2' ? 2 : 1;
  const performanceStep = accuracy >= 0.8 ? 1 : accuracy <= 0.35 ? -1 : 0;
  return Math.max(1, Math.min(3, ageBase + level + performanceStep - 1));
}

export function useGameRuntime({
  gameId,
  lang,
  level,
  profile,
  finished,
}: {
  gameId: string;
  lang: Language;
  level: number;
  profile?: RuntimeProfile;
  finished: boolean;
}) {
  const session = useMemo(
    () => ({
      playerId: getSafePlayerId(),
      sessionId: makeId(),
      gameId,
      ageBand: ageBandFromProfile(profile),
      lang,
    }),
    [gameId],
  );
  const telemetry = useMemo<GameContext>(
    () => createGameContext({ session }),
    [session],
  );
  const endedRef = useRef(false);
  const lastLanguage = useRef(lang);

  useEffect(() => {
    const guest = (() => {
      try {
        return sessionStorage.getItem('bunayn-guest-mode') === 'true';
      } catch {
        return false;
      }
    })();
    void startTelemetrySession({ session: telemetry.session, gameVersion: '1.1.0', isGuest: guest });
    telemetry.startSession();
    return () => {
      if (!endedRef.current) {
        endedRef.current = true;
        telemetry.endSession('abandoned');
      }
    };
  }, [telemetry]);

  useEffect(() => {
    if (lastLanguage.current !== lang) {
      telemetry.languageSwitched(lang);
      lastLanguage.current = lang;
    }
  }, [lang, telemetry]);

  useEffect(() => {
    telemetry.startLevel(`level-${level + 1}`, {
      difficulty: difficultyFor(profile, level),
    });
  }, [level, profile, telemetry]);

  useEffect(() => {
    if (finished && !endedRef.current) {
      endedRef.current = true;
      telemetry.endSession('completed');
    }
  }, [finished, telemetry]);

  return {
    telemetry,
    ageBand: session.ageBand,
    difficulty: difficultyFor(profile, level),
  };
}

export function useTelemetryItem(
  telemetry: GameContext,
  itemId: string,
  meta: {
    difficulty: number;
    modality: 'text' | 'audio' | 'image' | 'mixed';
    optimalMoves?: number;
    optionCount?: number;
  },
) {
  const handleRef = useRef<ItemHandle | null>(null);
  useEffect(() => {
    handleRef.current = telemetry.startItem(itemId, meta);
    return () => {
      handleRef.current = null;
    };
  }, [itemId, meta, telemetry]);

  return useMemo(() => ({
    firstInput: () => handleRef.current?.firstInput(),
    change: (value: unknown) => handleRef.current?.change(value),
    submit: (value: unknown) => handleRef.current?.submit(value),
    resolve: (result: { correct: boolean; value?: unknown; movesUsed?: number; strategySignature?: string }) => handleRef.current?.resolve(result),
    timeout: () => handleRef.current?.timeout(),
  }), [telemetry]);
}