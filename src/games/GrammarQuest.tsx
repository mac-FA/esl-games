import LegacyFrame from './LegacyFrame';

export default function GrammarQuest() {
  return (
    <LegacyFrame
      file="grammar-quest.html"
      gameId="grammar-quest"
      scoresKey="grammarquest:scoreboard"
      title="Grammar Quest"
      titleJa="グラマー・クエスト"
      maxScore={12}
    />
  );
}
