import { useEffect, useCallback, useState, useRef, useMemo } from 'react';

function checkBrowserAndDeviceType() {
  const userAgent = window.navigator.userAgent;
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
  const response = await fetch('https://gentle-island-01019-ea84504a6e5e.herokuapp.com/subscribe/general', {
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
  const subscribeButton = useRef<HTMLButtonElement>(null);
    const [browserType, isMobile] = useMemo(checkBrowserAndDeviceType, [])

  /** 
   * unsubscribe from current subscription
   */ 
  // const unsubscribe = useCallback(async () => {
  //   const subscirption: PushSubscription | null = await registration.pushManager.getSubscription()
  //   subscription && await subscirption?.unsubscribe()
  // }, [])

  const registerServiceWorker = useCallback(() => {
      if (!window.navigator.serviceWorker) {
        console.log('there is no service worker support!')
        return;
      }
      return window.navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          // will skip waiting and activate the service worker immediately
          registration.update();

          console.log('Service worker successfully registered.');
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
    return window.navigator.serviceWorker.getRegistration('/service-worker.js');
  }


  const askNotificationPermission = useCallback((): Promise<void> | void => {
    console.log(browserType, isMobile)
    // Mobile chrome does not support window notification
    if (browserType === "Chrome" && isMobile) return;

    // const notificationManager = window.Notification || ServiceWorkerRegistration.showNotification()
    return new Promise ((resolve, reject) => {
      console.log('inside the promise', window?.Notification?.permission)
      if (!window?.Notification) {
        const message = 'This browser does not support desktop notification'
        alert(message);
        console.log(message)
        reject(message)
      } else if (window.Notification.permission === "granted") {
        console.log('permission granted')
        new window.Notification("Hi theee the notification permission has been granted for pingfy!");
        resolve()
      } else if (["denied", "default"].includes(window.Notification.permission)) {
        console.log('permission denied')
        window.Notification.requestPermission().then((permission: NotificationPermission) => {
          if (permission === "granted") {
            new Notification("Permission granted for pingfy!");

            resolve()
          }
        });
      }
    })
  }, [])

  /**
   * Subscribe handling
   */
  const subscribe = useCallback(async (): Promise<PushSubscription | undefined> => {
    const reg = await getRegistration();

    const subscribeOptions: PushSubscriptionOptionsInit = {
      userVisibleOnly: true,
      applicationServerKey: 'BKuoQRQtmQxFY0QVySzagevEMO0gMw8iVIpEtj4bgCX1EQb_xcsKrWb4p-agefCYgi5aARZMZEuF5QsZrQAw63E'
    };

    console.log('gonna subscribe with reg', reg);
    return reg?.pushManager.subscribe(subscribeOptions);
  }, [])

  /**
   * persist subscription
   */
  const persistSubscription = useCallback(
    async (pushSubscription: PushSubscription | undefined) => {
      // Guard
      if (!pushSubscription) {
        console.log("No subscription");
        return;
      }

      // log
      console.log(
        "Received PushSubscription: ",
        JSON.stringify(pushSubscription)
      );

      // persist
      setSubscription(pushSubscription);
      sendSubscriptionToBackEnd(pushSubscription);
    },
    []
  );

  /**
   * Flow of subscribing to notification channel
   */
  const askPermissionAndSubscribe = useCallback(async () => { 

    // only ask permission that way if it is not mobile safari
    console.log(browserType, isMobile)
    if (!(browserType === "Safari" && isMobile)) {
      await askNotificationPermission()
    }
    subscribe().then(persistSubscription)
  }, [])


  /**
   * add event listener to button to trigger notification
   */
  useEffect(() => {
    // Mobile chrome does not support window notification
    subscribeButton.current?.addEventListener('click', askPermissionAndSubscribe)

  }, [subscribeButton.current])

  /**
   * register a service worker
   */
  useEffect((): void => {
    registerServiceWorker();
  }, [])



  return (
    <> 
      <p>version1</p>
      <button id="notificationButton" ref={subscribeButton}>Subscribe</button>
      <p>permission: </p>
      <p>Subscription: </p> {JSON.stringify(subscription)}
    </>
  );
}
