import LegacyFrame from './LegacyFrame';

export default function DavesDay() {
  return (
    <LegacyFrame
      file="daves-day.html"
      gameId="daves-day"
      scoresKey="davesday:scoreboard"
      title="Dave's Day"
      titleJa="デイブの一日"
      maxScore={18}
    />
  );
}
