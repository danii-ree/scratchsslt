import "./globals.css";

export const metadata = {
  title: "scratchsslt",
  description: "A platform to enhance student learning",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={``}>
        {children}
      </body>
    </html>
  );
}
