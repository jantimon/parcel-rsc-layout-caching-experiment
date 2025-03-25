"use client";
import React from "react";
import { Link } from "../router";

export default function About() {
  return (
    <div>
      <h1>About Page</h1>
      <p>This is a proof of concept for caching RSC layouts.</p>
      <Link href="/">Go back to Home</Link>
    </div>
  );
}
