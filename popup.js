document.getElementById('extract').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "extract"}, function(response) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        document.getElementById('result').textContent = 'Error: ' + chrome.runtime.lastError.message;
        return;
      }
      if (response.error) {
        document.getElementById('result').textContent = 'Error: ' + response.error;
      } else if (response.urls && response.urls.length > 0) {
        const csvContent = "data:text/csv;charset=utf-8," 
          + response.urls.map(url => url).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "linkedin_urls.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        document.getElementById('result').textContent = `Extracted ${response.urls.length} URLs. These are direct links to LinkedIn posts.`;
      } else {
        document.getElementById('result').textContent = 'No URLs found. Make sure you\'re on a LinkedIn search results page and scroll to load posts.';
      }
      
      // Display debug information
      if (response.debug) {
        console.log("Debug info:", response.debug);
        let debugInfo = `Page URL: ${response.debug.pageUrl}\n`;
        debugInfo += `Body Classes: ${response.debug.bodyClasses}\n`;
        debugInfo += "Potential Elements:\n";
        for (let [selector, count] of Object.entries(response.debug.potentialElements)) {
          debugInfo += `  ${selector}: ${count}\n`;
        }
        debugInfo += "\nExtracted URLs:\n";
        response.debug.elementDetails.forEach((detail, index) => {
          if (detail.extractedUrl) {
            debugInfo += `${index + 1}. ${detail.extractedUrl}\n`;
          } else {
            debugInfo += `${index + 1}. No URL extracted (see console for element details)\n`;
          }
        });
        document.getElementById('debug').textContent = debugInfo;
      }
    });
  });