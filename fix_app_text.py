from pathlib import Path

path = Path("src/App.jsx")
text = path.read_text(encoding="utf-8")
replacements = {
    "â€”": "—",
    "Ã—": "×",
    "Â°C": "°C",
    "â€¦": "…",
    "â‰¥": "≥",
    "â€“": "–",
    "Â·": "·",
    "âœ…": "✓",
    "âœ“": "✓",
    "â—‹": "•",
    "â†’": "→",
    "â°": "⏰",
    "â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢": "••••••••",
    "â€¢": "•",
    "ðŸ’Š": "💊",
    "ðŸ“‹": "🩺",
    "ðŸ”": "⏱️",
    "ðŸŽ¯": "🎯",
    "ðŸ“…": "📅",
    "ðŸ“": "📝",
    "ðŸ””": "📝",
    "ðŸ‘¤": "👤",
    "ðŸ‘¥": "👥",
    "ðŸ”§": "🚧",
    "ðŸ¥": "🛡️",
    "ðŸ”’": "🔒",
    "ðŸ¤–": "🤖",
    "ðŸ‘¨â€âš•ï¸": "🩺",
    "â­ï¸": "⏭️",
    "â†‹": "←",
}
changes = 0
for old, new in replacements.items():
    if old in text:
        count = text.count(old)
        text = text.replace(old, new)
        changes += count
        print(f"Replaced {count} occurrences of {old!r} with {new!r}")
path.write_text(text, encoding="utf-8")
print(f"Done: {changes} replacements applied")
