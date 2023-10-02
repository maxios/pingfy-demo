console.log('service worker works!!')

/**
 * Trigger the notification when it arrives from the push service
 */
self.addEventListener('push', function(event) {
  if (event.data) {
    console.log('This push event has data: ', event.data.text());
    // trigger notification in this service worker
    console.log(self.registration.getNotifications());
    self.registration.showNotification("Vibration Sample", {
      body: event.data.text(),
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      tag: "vibration-sample",
    });
  } else {
    console.log('This push event has no data.');
  }
});