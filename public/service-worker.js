console.log('service worker works!!')

const subscribeOptions = {
  userVisibleOnly: true,
  applicationServerKey:
    "BKuoQRQtmQxFY0QVySzagevEMO0gMw8iVIpEtj4bgCX1EQb_xcsKrWb4p-agefCYgi5aARZMZEuF5QsZrQAw63E",
};

/**
 * send subscription to backend to store
 */
async function sendSubscriptionToBackEnd(subscription) {
  const response = await fetch('https://gentle-island-01019-ea84504a6e5e.herokuapp.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscription),
  });
  if (!response.ok) {
    throw new Error('Bad status code from server.');
  }
  console.log(response)
  // const responseData = await response.json();
  // if (!(responseData.data && responseData.data.success)) {
  //   throw new Error('Bad response from server.');
  // }
}


// unsubscribe from current subscription
// const subscirption: PushSubscription | null = await registration.pushManager.getSubscription()
// subscription && await subscirption?.unsubscribe()
self.registration.pushManager.subscribe(subscribeOptions).then((pushSubscription) => {
  console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
  sendSubscriptionToBackEnd(pushSubscription);
});

// Force the waiting service worker to become the active service worker.
self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting()); 
});

// start the service worker and cache all of the app's content
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

/**
 * Trigger the notification when it arrives from the push service
 */
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json()

    console.log('data pushed', data);
    // trigger notification in this service worker
    self.registration.showNotification("Vibration Sample", {
      title: data.title,
      body: data.body,
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      tag: "vibration-sample",
    });
  } else {
    console.log('This push event has no data.');
  }
});