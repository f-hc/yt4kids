// Copyright (c) 2025 f-hc
// This software is licensed under the MIT License - Commercial Restriction (MIT-CR).
// For full license details, see the LICENSE file in the project root.

// Lists for filtering inappropriate content
const BLOCKED_CHANNEL_TITLE_KEYWORDS = [
  "adult",
  "mature",
  "explicit",
  "18+",
  "nsfw",
  "xxx",
  "porn",
  "sex",
  "gambling",
  "casino",
  "betting",
  "alcohol",
  "drugs",
];

const BLOCKED_VIDEO_TITLE_KEYWORDS = [
  "sprunki",
  "adult only",
  "not for kids",
  "nsfw",
  "xxx",
  "porn",
  "sex",
  "mature content",
  "18+",
  "drugs",
  "gambling",

  // --- Block Specific Video IDs ---
  // For immediate, 100% reliable blocking, add video/short IDs here.
  // The two example IDs are included below for demonstration.
  // "bKitktXKELo", // Example "normal" video ID
  // "S2FTcZlt2Hw", // Example "short" video ID
];

const BLOCKED_CHANNEL_NAMES = [
  "@1F-1F",
  "@adnanmalik0101",
];

const BLOCKED_CHANNEL_IDS = [
  "UCYHjrFQUdDzQXqim-FvD43Q",
];