"use strict";
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

const BLOCKED_CHANNEL_IDS_SET = new Set(BLOCKED_CHANNEL_IDS);
const BLOCKED_CHANNEL_NAMES_SET = new Set(BLOCKED_CHANNEL_NAMES.map(n => n.toLowerCase()));
Object.freeze(BLOCKED_CHANNEL_TITLE_KEYWORDS);
Object.freeze(BLOCKED_VIDEO_TITLE_KEYWORDS);
Object.freeze(BLOCKED_CHANNEL_NAMES_SET);
Object.freeze(BLOCKED_CHANNEL_IDS_SET);
Object.freeze(BLOCKED_CHANNEL_NAMES);
Object.freeze(BLOCKED_CHANNEL_IDS);

/**
 * Quickly determine if a URL matches any of the configured block lists.
 * @param {string} url - The full URL to evaluate.
 * @returns {boolean} True if the URL should be blocked.
 */
function isUrlBlocked(url) {
  try {
    // Fast pre-check to avoid unnecessary URL parsing where possible.
    if (!url.includes('youtube.com/') && !url.includes('youtu.be/')) {
      return false;
    }

    const u = new URL(url);
    const { pathname, hostname, searchParams } = u;

    // Block based on specific video/short IDs in the URL.
    if (pathname.startsWith('/shorts/')) {
      const shortId = pathname.split('/')[2];
      if (BLOCKED_VIDEO_TITLE_KEYWORDS.includes(shortId)) return true;
    }
    if (pathname === '/watch') {
      const videoId = searchParams.get('v');
      if (BLOCKED_VIDEO_TITLE_KEYWORDS.includes(videoId)) return true;
    }

    // Block based on youtu.be short links.
    if (hostname === 'youtu.be') {
      const videoId = pathname.substring(1);
      if (BLOCKED_VIDEO_TITLE_KEYWORDS.includes(videoId)) return true;
    }

    // Block based on channel ID or the new @handle format.
    if (pathname.startsWith('/channel/')) {
      const channelId = pathname.split('/')[2];
      if (BLOCKED_CHANNEL_IDS_SET.has(channelId)) return true;
    }
    if (pathname.startsWith('/@')) {
      const handle = pathname.substring(1).split('/')[0].toLowerCase();
      if (BLOCKED_CHANNEL_NAMES_SET.has(handle)) return true;
    }

  } catch (e) {
    // Ignore errors from invalid URLs to keep UX smooth.
  }
  return false;
}