const repairPairs = [
  ["â€¢", "•"],
  ["â€”", "—"],
  ["â†’", "→"],
  ["âœ“", "✓"],
  ["â—‹", "○"],
  ["â–¼", "▼"],
  ["ðŸ”", "🔍"],
  ["âš¡", "⚡"],
  ["â¬¡", "⬡"],
  ["â˜…", "★"],
  ["âˆ‘", "∑"],
  ["ðŸ—„", "🗄"],
  ["âš™", "⚙"],
  ["ðŸ“±", "📱"],
  ["Â·", "·"],
  ["Â²", "²"],
  ["â†", "←"],
];

export function repairText(input: string) {
  let output = input;
  for (const [from, to] of repairPairs) {
    output = output.split(from).join(to);
  }
  return output;
}
