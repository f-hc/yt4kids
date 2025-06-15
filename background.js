// Copyright (c) 2025 f-hc
// This software is licensed under the MIT License - Commercial Restriction (MIT-CR).
// For full license details, see the LICENSE file in the project root.

// YouTube Kids Protection - Background Script
// This script provides the first layer of protection by blocking navigation
// to known bad URLs before the page even starts to load.

importScripts('blacklists.js');

(() => {
  'use strict';

  // Listen for navigation events. The `onBeforeNavigate` event fires when a
  // navigation is about to be initiated. It's the earliest we can intercept.
  chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    // We only care about the main frame, not iframes within a page.
    if (details.frameId !== 0) {
      return;
    }

    if (shouldBlockUrl(details.url)) {
      console.log(`YT Kids Protection (Background): Blocking navigation to ${details.url}`);
      // Replace the tab's content with the YouTube homepage.
      chrome.tabs.update(details.tabId, {
        url: 'https://www.youtube.com/'
      });
    }
  });

  function shouldBlockUrl(url) {
    // This function is very performance-sensitive as it runs on every
    // navigation event. It must be fast.
    try {
      // Fast check: if "youtube" isn't in the URL, we can exit immediately.
      if (!url.includes('youtube.com/') && !url.includes('youtu.be/')) {
        return false;
      }

      const u = new URL(url);
      const pathname = u.pathname;
      const hostname = u.hostname;

      // Block based on specific video/short IDs in the URL.
      if (pathname.startsWith('/shorts/')) {
        const shortId = pathname.split('/')[2];
        if (BLOCKED_VIDEO_TITLE_KEYWORDS.includes(shortId)) return true;
      }
      if (pathname === '/watch') {
        const videoId = u.searchParams.get('v');
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
        if (BLOCKED_CHANNEL_IDS.includes(channelId)) return true;
      }
      if (pathname.startsWith('/@')) {
        const handle = pathname.substring(1).split('/')[0]; // e.g., "@1F-1F"
        if (BLOCKED_CHANNEL_NAMES.includes(handle)) return true;
      }

    } catch (e) {
      // Ignore errors from invalid URLs.
    }
    return false;
  }
})(); 