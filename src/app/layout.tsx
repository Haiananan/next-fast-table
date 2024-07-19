import React from "react";

export default function Layout({ children }) {
  return (
    <html className="dark">
      <body>{children}</body>
    </html>
  );
}
