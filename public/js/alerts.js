/* global document */

async function HelloWorld() {
  try {
    const response = await fetch('./api/alerts-image');
    const apiResponse = await response.json();
    document.querySelector('#api-response > img').src = apiResponse.mapUrl;
    document.querySelector('#api-response > figcaption').innerText = apiResponse.message;
  } catch (error) {
    document.querySelector('#api-response > img').src = '';
    document.querySelector('#api-response > figcaption').innerText = JSON.stringify(error);
  }
}

document.addEventListener('readystatechange', (event) => {
  if (event.target.readyState === 'interactive') {
    document.querySelector('#api-response > figcaption').innerText = 'Loading...';
  } else if (event.target.readyState === 'complete') {
    HelloWorld();
  }
});
