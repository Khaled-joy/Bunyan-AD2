import { createGameContext, startTelemetrySession } from "../src";

export async function createColorFocusTelemetry(session: {
  playerId: string;
  sessionId: string;
  ageBand: "cycle1" | "cycle2" | "cycle3";
  lang: "ar" | "en";
}) {
  const telemetry = createGameContext({
    session: { ...session, gameId: "color-focus" },
  });
  await startTelemetrySession({
    session: telemetry.session,
    gameVersion: "1.0.0",
  });
  return {
    telemetry,
    startRound(itemId: string, canvas: HTMLElement, difficulty: number) {
      const item = telemetry.startItem(itemId, { difficulty, modality: "image", optionCount: 4 });
      const stopPointerTracking = telemetry.trackPointer(canvas);
      return {
        choose(value: string, correct: boolean) {
          item.firstInput();
          item.submit(value);
          item.resolve({ correct, value, strategySignature: "color-match" });
          stopPointerTracking();
        },
      };
    },
  };
}