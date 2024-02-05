/* eslint-disable no-restricted-globals */
/* global self, caches */

const CACHE_NAME = 'alerts-widget-poc-v2';

// Use the install event to pre-cache all initial resources.
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    cache.addAll([
      '/',
      '/index.html',
      '/js/alerts.js',
      '/css/alerts.css',
      '/img/alerts.png',
      '/img/screenshot-first-widget.png',
    ]);
  })());
});

self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Get the resource from the cache.
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      // If the resource was not in the cache, try the network.
      const fetchResponse = await fetch(event.request);

      // Save the resource in the cache and return it.
      cache.put(event.request, fetchResponse.clone());
      return fetchResponse;
    } catch (e) {
      // The network failed.
    }

    return null;
  })());
});

// --------------------------------------------------------------
// Render the widget with the template and data.
// This function is called when the widget is installed.
// It fetches the template and data, and updates the widget.
// --------------------------------------------------------------

async function updateWidget(widget) {
  // Get the template and data URLs from the widget definition.
  const templateUrl = widget.definition.msAcTemplate;
  const dataUrl = widget.definition.data;

  // Fetch the template text and data.
  const template = await (await fetch(templateUrl)).text();
  const data = await (await fetch(dataUrl)).text();

  // Render the widget with the template and data.
  return self.widgets.updateByTag(widget.definition.tag, { template, data });
}

async function onWidgetInstall(widget) {
  // Register a periodic sync, if this wasn't done already.
  // We use the same tag for the sync registration and the widget to
  // avoid registering several periodic syncs for the same widget.
  const tags = await self.registration.periodicSync.getTags();
  if (!tags.includes(widget.definition.tag)) {
    // be careful with the minInterval, it can be any value
    // but browser will decide the final value
    // usually it will be 1 day
    await self.registration.periodicSync.register(widget.definition.tag, {
      minInterval: widget.definition.update * 1000,
    });
  }

  // And also update the instance.
  await updateWidget(widget);
}

async function onWidgetUninstall(widget) {
  // On uninstall, unregister the periodic sync.
  // If this was the last widget instance, then unregister the periodic sync.
  if (widget.instances.length === 1 && 'update' in widget.definition) {
    await self.registration.periodicSync.unregister(widget.definition.tag);
  }
}

// Listen to periodicsync events to update all widget instances
// periodically.
self.addEventListener('periodicsync', async (event) => {
  const widget = await self.widgets.getByTag(event.tag);

  if (widget && 'update' in widget.definition) {
    event.waitUntil(updateWidget(widget));
  }
});

self.addEventListener('widgetinstall', (event) => {
  event.waitUntil(onWidgetInstall(event.widget));
});

self.addEventListener('widgetuninstall', (event) => {
  event.waitUntil(onWidgetUninstall(event.widget));
});

// --------------------------------------------------------------
// Listen to the widgetclick event and handle the actions.
// --------------------------------------------------------------

async function updateWidgets() {
  // Get the widget that match the tag defined in the web app manifest.
  const widget = await self.widgets.getByTag('alerts');
  if (!widget) {
    return;
  }

  // Using the widget definition, get the template and data.
  const template = await (await fetch(widget.definition.msAcTemplate)).text();
  const data = await (await fetch(widget.definition.data)).text();

  // Render the widget with the template and data.
  await self.widgets.updateByTag(widget.definition.tag, { template, data });
}

self.addEventListener('widgetclick', (event) => {
  switch (event.action) {
    case 'refresh': {
      event.waitUntil(updateWidgets());
      break;
    }
    default:
      break;
  }
});

// Update the widgets to their initial states
// when the service worker is activated.
self.addEventListener('activate', (event) => {
  event.waitUntil(updateWidgets());
});
