import { useEffect, useCallback, useState } from 'react';

/**
 * send subscription to backend to store
 */
async function sendSubscriptionToBackEnd(subscription: PushSubscription) {
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
export default function Home() {
  const [subscription, setSubscription] = useState({});


  /** 
   * unsubscribe from current subscription
   */ 
  // const unsubscribe = useCallback(async () => {
  //   const subscirption: PushSubscription | null = await registration.pushManager.getSubscription()
  //   subscription && await subscirption?.unsubscribe()
  // }, [])

  const registerServiceWorker = useCallback(() => {
      if (!navigator.serviceWorker) return;
      return navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service worker successfully registered.');
          registration.showNotification('Hi there!');
          const subscribeOptions: PushSubscriptionOptionsInit = {
            userVisibleOnly: true,
            applicationServerKey: 'BKuoQRQtmQxFY0QVySzagevEMO0gMw8iVIpEtj4bgCX1EQb_xcsKrWb4p-agefCYgi5aARZMZEuF5QsZrQAw63E'
          };

          console.log('will subscribe')
          registration.pushManager.subscribe(subscribeOptions).then((pushSubscription) => {
            console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
            setSubscription(pushSubscription)
            sendSubscriptionToBackEnd(pushSubscription);
          });

        })
        .catch((err) => {
          console.error('Unable to register service worker.', err);
        })

        
  }, [])


  // const askNotificationPermission = useCallback(() => {
  //   // const notificationManager = window.Notification || ServiceWorkerRegistration.showNotification()
  //   if (!window?.Notification) {
  //     return alert("This browser does not support desktop notification");
  //   } else if (window.Notification.permission === "granted") {
  //     new window.Notification("Hi theee the notification permission has been granted for pingfy!");
  //   } else if (window.Notification.permission == "denied") {
  //     window.Notification.requestPermission().then((permission: NotificationPermission) => {
  //       if (permission === "granted") {
  //         new Notification("Hi there!");
  //       }
  //     });
  //   }
  // }, [])

  const askPermissionAndSubscribe = useCallback(async () => { }, [])

  /**
   * register a service worker
   */
  useEffect((): void => {
    // askNotificationPermission()
    registerServiceWorker();
  }, [])

  return (
    <> 
      <p>version1</p>
      <button id="notificationButton">Enable Notifications</button>
      <p>permission: </p>
      <p>Subscription: </p> {JSON.stringify(subscription)}
      <button onClick={askPermissionAndSubscribe}>Subscribe</button>
    </>
  );
}
