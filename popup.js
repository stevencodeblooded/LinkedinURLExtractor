let extractedUrls = [];

document.getElementById('extract').addEventListener('click', function() {
  document.getElementById('progressBar').style.display = 'block';
  document.getElementById('progressBar').firstElementChild.style.width = '0%';
  
  chrome.runtime.sendMessage({action: "extract"}, function(response) {
    document.getElementById('progressBar').style.display = 'none';
    
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      document.getElementById('result').textContent = 'Error: ' + chrome.runtime.lastError.message;
      return;
    }
    if (response.error) {
      document.getElementById('result').textContent = 'Error: ' + response.error;
    } else if (response.urls && response.urls.length > 0) {
      extractedUrls = response.urls;
      const csvContent = "data:text/csv;charset=utf-8," 
        + extractedUrls.map(url => url).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "linkedin_urls.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      document.getElementById('urlCount').textContent = `URLs found: ${extractedUrls.length}`;
      document.getElementById('result').textContent = `${extractedUrls.length} URLs have been extracted and downloaded.`;
      document.getElementById('testUrls').style.display = 'block';
    } else {
      document.getElementById('result').textContent = 'No URLs found. Make sure you\'re on a LinkedIn search results page and scroll to load posts.';
    }
  });
});

document.getElementById('testUrls').addEventListener('click', function() {
  const urlsToTest = extractedUrls.slice(0, 3);  // Test first 3 URLs
  urlsToTest.forEach(url => {
    chrome.tabs.create({ url: url, active: false });
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "updateProgress") {
    document.getElementById('progressBar').firstElementChild.style.width = `${request.progress}%`;
  }
});