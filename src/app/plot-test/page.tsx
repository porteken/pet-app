"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const PlotLoad = dynamic(
  async () => {
    const fn = (await import("react-plotly.js/factory")).default;
    const plotly = await import("plotly.js-basic-dist-min");

    const P = plotly.default || (plotly as any);
    if (!P) {
      throw new Error("Plotly is undefined");
    }
    return fn(P as never);
  },
  { ssr: false },
);

export default function Page() {
  const [show, setShow] = useState(true);

  return (
    <div>
      <button id="toggle" onClick={() => setShow(!show)}>
        Toggle
      </button>
      {show && <PlotLoad data={[{ x: [1], y: [2] }]} layout={{}} />}
    </div>
  );
}
