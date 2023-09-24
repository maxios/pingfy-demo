import { useEffect, useCallback, useState } from 'react';

export default function Home() {
  const [subscription, setSubscription] = useState({});

  /**
   *  Ask for notification permission
   */
  const askPermission = useCallback((): Promise<NotificationPermission> => Notification.requestPermission(), [])


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

  const registerServiceWorker = useCallback(() => {
      return navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service worker successfully registered.');
          const subscribeOptions: PushSubscriptionOptionsInit = {
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              'BKuoQRQtmQxFY0QVySzagevEMO0gMw8iVIpEtj4bgCX1EQb_xcsKrWb4p-agefCYgi5aARZMZEuF5QsZrQAw63E'),
          };
          // unsubscribe from current subscription
          // const subscirption: PushSubscription | null = await registration.pushManager.getSubscription()
          // subscription && await subscirption?.unsubscribe()
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


  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * ask for permission
   */
  useEffect(() => {
    if (!("Notification" in window)) {
      console.log('what is permission', Notification.permission)
      alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
      new Notification("Hi there!");
    } else if (Notification.permission !== "denied") {
      askPermission().then((permission: NotificationPermission) => {
        console.log('permission', permission)
        if (permission === "granted") {
          new Notification("Hi there!");
        }
      });
    }

    registerServiceWorker();
  }, [])

  return (
    <> 
      <p>permission: </p>
      <p>Subscription: </p> {JSON.stringify(subscription)}
    </>
  );
}
