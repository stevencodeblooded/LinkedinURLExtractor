chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extract") {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          function: extractUrls
        }, (results) => {
          if (chrome.runtime.lastError) {
            sendResponse({error: chrome.runtime.lastError.message});
          } else if (results && results[0]) {
            sendResponse({urls: results[0].result.urls});
          } else {
            sendResponse({error: "No results found"});
          }
        });
      });
      return true; // Indicates that we will send a response asynchronously
    }
  });
  
  function extractUrls() {
    const postContainers = document.querySelectorAll('.feed-shared-update-v2');
    let urls = [];
  
    postContainers.forEach((container, index) => {
      // Update progress
      chrome.runtime.sendMessage({
        action: "updateProgress",
        progress: Math.round((index + 1) / postContainers.length * 100)
      });
  
      // Method 1: Try to find a direct link to the post
      const directLink = container.querySelector('a[href*="/feed/update/"]');
      if (directLink && directLink.href) {
        urls.push(directLink.href);
      } else {
        // Method 2: Look for data-urn attribute
        const dataUrn = container.getAttribute('data-urn');
        if (dataUrn) {
          const activityId = dataUrn.split(':').pop();
          const constructedUrl = `https://www.linkedin.com/feed/update/urn:li:activity:${activityId}/`;
          urls.push(constructedUrl);
        } else {
          // Method 3: Look for any button or element with an onclick attribute containing the post URL
          const elementsWithOnclick = container.querySelectorAll('[onclick*="/feed/update/"]');
          if (elementsWithOnclick.length > 0) {
            const onclickAttr = elementsWithOnclick[0].getAttribute('onclick');
            const match = onclickAttr.match(/(?:(?:https?:)?\/\/)?(?:[^\/\s]+\/)*(?:feed\/update\/urn:li:activity:(\d+))/);
            if (match) {
              const postUrl = `https://www.linkedin.com/feed/update/urn:li:activity:${match[1]}/`;
              urls.push(postUrl);
            }
          }
        }
      }
    });
  
    return {urls: urls};
  }