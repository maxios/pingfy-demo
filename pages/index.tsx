import { useEffect, useCallback, useState, useRef } from 'react';

function checkBrowserAndDeviceType() {
  const userAgent = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  let browserType = "Unknown";
  
  if (/Chrome/i.test(userAgent)) {
    browserType = "Chrome";
  } else if (/Firefox/i.test(userAgent)) {
    browserType = "Firefox";
  } else if (/Safari/i.test(userAgent)) {
    browserType = "Safari";
  } else if (/Edge/i.test(userAgent)) {
    browserType = "Edge";
  } else if (/Opera|OPR/i.test(userAgent)) {
    browserType = "Opera";
  } else if (/MSIE|Trident/i.test(userAgent)) {
    browserType = "Internet Explorer";
  }
  
  if (isMobile) {
    console.log(`This is a ${browserType} browser on a mobile device.`);
    // You can add specific logic for mobile devices here
  } else {
    console.log(`This is a ${browserType} browser on a desktop device.`);
    // You can add specific logic for desktop devices here
  }

  return [browserType, isMobile]
}

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
      if (!navigator.serviceWorker) {
        console.log('there is no service worker support!')
        return;
      }
      return navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          // console.log('Service worker successfully registered.');
          registration.showNotification('Hi there, it is the service worker!');
          // const subscribeOptions: PushSubscriptionOptionsInit = {
          //   userVisibleOnly: true,
          //   applicationServerKey: 'BKuoQRQtmQxFY0QVySzagevEMO0gMw8iVIpEtj4bgCX1EQb_xcsKrWb4p-agefCYgi5aARZMZEuF5QsZrQAw63E'
          // };

          // console.log('will subscribe')
          // registration.pushManager.subscribe(subscribeOptions).then((pushSubscription) => {
          //   console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
          //   setSubscription(pushSubscription)
          //   sendSubscriptionToBackEnd(pushSubscription);
          // });

        })
        .catch((err) => {
          console.error('Unable to register service worker.', err);
        })

        
  }, [])

  const getRegistration = () => {
    console.log('getRegistration', )
    return navigator.serviceWorker.getRegistration('/service-worker.js');
  }


  const askNotificationPermission = useCallback(() => {
    const [browserType, isMobile] = checkBrowserAndDeviceType()
    
    console.log(browserType, isMobile)
    // Mobile chrome does not support window notification
    if (browserType === "Chrome" && isMobile) return;

    // const notificationManager = window.Notification || ServiceWorkerRegistration.showNotification()
    if (!window?.Notification) {
      return alert("This browser does not support desktop notification");
    } else if (window.Notification.permission === "granted") {
      new window.Notification("Hi theee the notification permission has been granted for pingfy!");
    } else if (window.Notification.permission == "denied") {
      window.Notification.requestPermission().then((permission: NotificationPermission) => {
        if (permission === "granted") {
          new Notification("Hi there!");
        }
      });
    }
  }, [])

  const askPermissionAndSubscribe = useCallback(async () => { 
    askNotificationPermission()
  }, [])

  const button = useRef<HTMLButtonElement>(null);

  /**
   * add event listener to button to trigger notification
   */
  useEffect(() => {
    console.log(button)

    button.current?.addEventListener('click', function() {
      console.log('is clicked!')
      if (window?.Notification) {
        window.Notification.requestPermission().then((permission: NotificationPermission) => {
          console.log('permission', permission)
          if (permission === "granted") {
            new Notification("Hi there!");
          }
        });
      }
    })
  }, [button.current])

  /**
   * register a service worker
   */
  useEffect((): void => {

    askNotificationPermission()
    registerServiceWorker();
  }, [])

  /**
   * Subscribe button
   */
  const subscribe = useCallback(async () => {
    const reg = await getRegistration();

    const subscribeOptions: PushSubscriptionOptionsInit = {
      userVisibleOnly: true,
      applicationServerKey: 'BKuoQRQtmQxFY0QVySzagevEMO0gMw8iVIpEtj4bgCX1EQb_xcsKrWb4p-agefCYgi5aARZMZEuF5QsZrQAw63E'
    };

    console.log('registration', reg)
    reg?.pushManager.subscribe(subscribeOptions).then((pushSubscription) => {
      console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
      setSubscription(pushSubscription)
      sendSubscriptionToBackEnd(pushSubscription);
    });
  }, [])

  return (
    <> 
      <p>version1</p>
      <button id="notificationButton" ref={button}>Enable Notifications</button>
      <p>permission: </p>
      <p>Subscription: </p> {JSON.stringify(subscription)}
      <button onClick={subscribe}>Subscribe</button>
    </>
  );
}
