"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error;
  reset: () => void;
}>) {
  useEffect(() => {}, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ padding: 32, textAlign: "center" }}>
          <h2>Something went wrong!</h2>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: "#0070f3",
              border: "none",
              borderRadius: "4px",
              color: "white",
              cursor: "pointer",
              margin: "16px",
              padding: "8px 16px",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
