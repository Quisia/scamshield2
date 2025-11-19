export const metadata = {
  title: "ScamShield.ai",
  description: "AI scam detection tool"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
