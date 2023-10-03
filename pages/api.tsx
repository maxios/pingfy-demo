
/**
 * send subscription to backend to store
 */
export async function sendSubscriptionToBackEnd(subscription: PushSubscription) {
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