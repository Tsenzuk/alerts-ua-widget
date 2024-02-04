/* global document */

async function HelloWorld() {
  try {
    const response = await fetch('./api/hello-world');
    const helloWorld = await response.json();
    document.getElementById('api-response').innerText = JSON.stringify(helloWorld);
  } catch (error) {
    document.getElementById('api-response').innerText = JSON.stringify(error);
  }
}

document.addEventListener('readystatechange', (event) => {
  if (event.target.readyState === 'interactive') {
    document.getElementById('api-response').innerText = 'Loading...';
  } else if (event.target.readyState === 'complete') {
    HelloWorld();
  }
});
