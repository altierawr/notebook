/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: generateScale("blue"),
        gray: {
          0: "var(--gray-0)",
          ...generateScale("slate"),
        },
        success: generateScale("green"),
        alert: generateScale("yellow"),
        error: generateScale("red"),
        red: generateScale("red"),
      },
      spacing: generateSpacing(),
    },
    fontFamily: {
      sans: ["SourceSans3", "sans-serif"],
    },
  },
  corePlugins: {
    // We provide our own css resets
    preflight: false,
  },
  plugins: [],
};

function generateSpacing() {
  const spacing = {};

  for (let i = 1; i <= 10; ++i) {
    spacing[i] = `var(--space-${i})`;
  }

  return spacing;
}

function generateScale(name) {
  let scale = Array.from({ length: 12 }, (_, i) => {
    let id = i + 1;
    return [
      [id, `var(--${name}-${id})`],
      [`a${id}`, `var(--${name}A-${id})`],
    ];
  }).flat();

  return Object.fromEntries(scale);
}
