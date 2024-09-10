console.log("LinkedIn URL Extractor content script loaded");

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Message received in content script:", request);
  if (request.action === "extract") {
    const postElements = document.querySelectorAll('.feed-shared-update-v2, .occludable-update');
    console.log("Found post elements:", postElements.length);
    
    const urls = Array.from(postElements)
      .slice(0, 10)
      .map(element => {
        const anchorElement = element.querySelector('a[data-control-name="post_message"], a[data-control-name="update_topbar_actor"], a.feed-shared-actor__container-link');
        return anchorElement ? anchorElement.href : null;
      })
      .filter(url => url !== null);

    console.log("Extracted URLs:", urls);
    sendResponse({urls: urls});
  }
  return true;  // Indicates that sendResponse will be called asynchronously
});