// Copyright (c) 2025 f-hc
// This software is licensed under the MIT License - Commercial Restriction (MIT-CR).
// For full license details, see the LICENSE file in the project root.

// YT4Kids - Content Script
// This script uses a multi-layered approach to ensure reliable blocking.

/* global BLOCKED_CHANNEL_TITLE_KEYWORDS, BLOCKED_VIDEO_TITLE_KEYWORDS,
          BLOCKED_CHANNEL_NAMES, BLOCKED_CHANNEL_IDS */

(() => {
  'use strict';

  // --- Layer 1: Immediate URL Check ---
  if (isUrlBlocked(window.location.href)) {
    blockAndRedirect(`URL (${window.location.href})`);
    return;
  }

  // --- Layer 2: Inject Page Script ---
  // To comply with YouTube's Content Security Policy (CSP), we cannot run
  // inline scripts. We must inject a script file that is declared as a
  // web accessible resource. We pass the blacklist data to it via a DOM
  // element, which is a secure way to communicate between the isolated
  // content script world and the main page world.
  injectPageScriptWithData();

  // --- Layer 3: Fallback DOM Observer ---
  // This remains as a final safety net.
  setupFallbackObserver();


  // --- Helper Functions ---

  function isUrlBlocked(url) {
    try {
      const u = new URL(url);
      if (!u.hostname.endsWith('youtube.com') && u.hostname !== 'youtu.be') {
        return false;
      }
      if (u.pathname.startsWith('/shorts/')) {
        const shortId = u.pathname.split('/shorts/')[1].split('/')[0];
        if (BLOCKED_VIDEO_TITLE_KEYWORDS.includes(shortId)) return true;
      }
      if (u.pathname === '/watch') {
        const videoId = u.searchParams.get('v');
        if (BLOCKED_VIDEO_TITLE_KEYWORDS.includes(videoId)) return true;
      }
      if (u.pathname.startsWith('/channel/')) {
        const channelId = u.pathname.split('/channel/')[1].split('/')[0];
        if (BLOCKED_CHANNEL_IDS.includes(channelId)) return true;
      }
      if (u.pathname.startsWith('/@')) {
        const handle = u.pathname.substring(1).split('/')[0];
        if (BLOCKED_CHANNEL_NAMES.includes(handle)) return true;
      }
    } catch (e) {
      // Ignore invalid URLs
    }
    return false;
  }

  function blockAndRedirect(reason) {
    console.log(`YT4Kids: Blocking content and redirecting. Reason: [${reason}]`);
    window.stop();
    window.location.replace('https://www.youtube.com/');
  }

  function injectPageScriptWithData() {
    // 1. Create a DOM element to hold the blacklist data.
    const dataNode = document.createElement('div');
    dataNode.id = 'yt4kids-data';
    dataNode.dataset.blacklists = JSON.stringify({
      channelTitle: BLOCKED_CHANNEL_TITLE_KEYWORDS,
      videoTitle: BLOCKED_VIDEO_TITLE_KEYWORDS,
      channelNames: BLOCKED_CHANNEL_NAMES,
      channelIds: BLOCKED_CHANNEL_IDS,
    });
    dataNode.style.display = 'none';
    (document.head || document.documentElement).appendChild(dataNode);

    // 2. Inject the external script that will read this data.
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('page_injector.js');
    (document.head || document.documentElement).appendChild(script);
    // 3. Clean up the script tag from the DOM once it has been loaded.
    script.onload = () => script.remove();
  }

  function setupFallbackObserver() {
    const observer = new MutationObserver(() => {
      // Check document title
      if (containsKeyword(document.title, BLOCKED_VIDEO_TITLE_KEYWORDS)) {
        blockAndRedirect(`Document Title: ${document.title}`);
        observer.disconnect();
        return;
      }
      // Check for main video title element
      const titleEl = document.querySelector('h1.ytd-watch-metadata, h1.title');
      if (titleEl && containsKeyword(titleEl.textContent, BLOCKED_VIDEO_TITLE_KEYWORDS)) {
        blockAndRedirect(`H1 Title Element: ${titleEl.textContent}`);
        observer.disconnect();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  function containsKeyword(text, list) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return list.some(keyword => lowerText.includes(keyword.toLowerCase()));
  }

})(); 