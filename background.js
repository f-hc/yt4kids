// Copyright (c) 2025 f-hc
// This software is licensed under the MIT License - Commercial Restriction (MIT-CR).
// For full license details, see the LICENSE file in the project root.

// YT4Kids - Background Script
// This script provides the first layer of protection by blocking navigation
// to known bad URLs before the page even starts to load.

importScripts('blacklists.js');

(() => {
  'use strict';

  // Listen for navigation events. The `onBeforeNavigate` event fires when a
  // navigation is about to be initiated. It's the earliest we can intercept.
  chrome.webNavigation.onBeforeNavigate.addListener(({ frameId, url, tabId }) => {
    if (frameId !== 0) return;
    if (isUrlBlocked(url)) {
      chrome.tabs.update(tabId, { url: 'https://www.youtube.com/' });
    }
  });
})(); 