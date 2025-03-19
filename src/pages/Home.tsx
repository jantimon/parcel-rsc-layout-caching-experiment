"use client";

import React, { useState } from "react";
import { router } from "../router";

const { Link } = router;

export default function Home({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  const incrementCount = () => {
    setCount((prev) => prev + 1);
  };

  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the RSC caching experiment!</p>

      <div style={{ marginTop: "20px" }}>
        <p>Counter: {count}</p>
        <button
          onClick={incrementCount}
          style={{
            padding: "8px 16px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Increment
        </button>

        <p style={{ marginTop: "20px" }}>
          Value from inital props: {value} (with artificial delay)
        </p>

        <Link href="/about" style={{ marginLeft: "20px" }}>
          Go to About
        </Link>
      </div>
    </div>
  );
}

export const getInitialProps = async () => {
  // Simulate some data fetching
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    value: (Math.random() * 100).toFixed(0),
  };
};
