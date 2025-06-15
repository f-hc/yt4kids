// Copyright (c) 2025 f-hc
// This software is licensed under the MIT License - Commercial Restriction (MIT-CR).
// For full license details, see the LICENSE file in the project root.

// YT4Kids - Page Injector
// This script runs in the main page world to intercept YouTube's data variables.

(() => {
  'use strict';

  // The blacklist data is passed from the content script via a DOM element.
  const dataNode = document.getElementById('yt4kids-data');
  if (!dataNode || !dataNode.dataset.blacklists) {
    return;
  }
  const bl = JSON.parse(dataNode.dataset.blacklists);
  dataNode.remove(); // Clean up the DOM immediately

  function contains(text, list) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return list.some(keyword => lowerText.includes(keyword.toLowerCase()));
  }

  function checkAndBlock(data, varName) {
    let reason = false;
    if (varName === 'ytInitialPlayerResponse') {
      reason = isBlockedByPlayerResponse(data);
    } else if (varName === 'ytInitialData') {
      // ytInitialData can be for a Watch page or a Browse page (like a channel).
      reason = isBlockedByPlayerResponse(data) || isBlockedByBrowseData(data);
    }

    if (reason) {
      console.log(`YT4Kids: Blocking content from ${varName}. Reason: [${reason}]`);
      window.stop();
      window.location.replace('https://www.youtube.com/');
    }
  }

  function isBlockedByPlayerResponse(data) {
    if (!data || !data.videoDetails) return false;
    const { videoId, title, channelId, author } = data.videoDetails;
    if (videoId && bl.videoTitle.includes(videoId)) return `Video ID: ${videoId}`;
    if (title && contains(title, bl.videoTitle)) return `Video Title: ${title}`;
    if (channelId && bl.channelIds.includes(channelId)) return `Channel ID: ${channelId}`;
    if (author && (bl.channelNames.includes(author) || contains(author, bl.channelTitle))) return `Channel Name: ${author}`;
    return false;
  }

  function isBlockedByBrowseData(data) {
    try {
      // This is for channel pages, home feed, etc.
      const header = data?.header?.c4TabbedHeaderRenderer;
      if (header) { // We are likely on a channel page
        const channelName = header.title;
        const channelId = header.channelId;
        // The handle is not always present, so we check for channel name and ID.
        if (channelId && bl.channelIds.includes(channelId)) return `Channel ID (from Browse Data): ${channelId}`;
        if (channelName && (bl.channelNames.includes(channelName) || contains(channelName, bl.channelTitle))) return `Channel Name (from Browse Data): ${channelName}`;
      }
    } catch (e) {
      // Ignore parsing errors.
    }
    return false;
  }

  // --- Polling Interceptor ---
  // This is more robust than trying to redefine a property that might be
  // non-configurable. We poll at high frequency to catch the variable
  // the moment it's defined.
  let ytidChecked = false;
  let ytiprChecked = false;
  const POLL_INTERVAL_MS = 10; // Reduced CPU usage while staying responsive.
  const poller = setInterval(() => {
    if (!ytidChecked && window.ytInitialData) {
      ytidChecked = true;
      checkAndBlock(window.ytInitialData, 'ytInitialData');
    }
    if (!ytiprChecked && window.ytInitialPlayerResponse) {
      ytiprChecked = true;
      checkAndBlock(window.ytInitialPlayerResponse, 'ytInitialPlayerResponse');
    }
    // Stop polling once both are found.
    if (ytidChecked && ytiprChecked) {
      clearInterval(poller);
    }
  }, POLL_INTERVAL_MS);

  // As a safeguard, stop polling after a reasonable time to prevent
  // the interval from running forever on non-video pages.
  setTimeout(() => clearInterval(poller), 1500);

})(); 