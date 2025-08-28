module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#388E3C", // xanh lá cây đậm
          foreground: "#ffffff", // màu chữ trên nền primary
        },
        background: "#ffffff",
        foreground: "#000000",
        secondary: {
          DEFAULT: "#f1f5f9",
          foreground: "#0f172a",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#f1f5f9",
          foreground: "#0f172a",
        },
        border: "#e2e8f0",
        input: "#e2e8f0",
        ring: "#388E3C",
      },
    },
  },
  plugins: [],
};
