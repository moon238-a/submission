import { convertBase64ToUint8Array } from './index.js';
import CONFIG from '../config.js';
import { isServiceWorkerAvailable } from './index.js';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api.js';

export function isNotificationAvailable() {
    return 'Notification' in window;
}

export function isNotificationGranted() {
    return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
    if (!isNotificationAvailable()) {
        console.error('Notification API unsupported.');
        return false;
    }

    if (isNotificationGranted()) {
        return true;
    }

    const status = await Notification.requestPermission();
    
    if (status === 'denied') {
        alert('Izin notifikasi ditolak.');
        return false;
    }

    if (status === 'default') {
        alert('Izin notifikasi ditutup atau diabaikan.');
        return false;
    }

    return true;
}

export async function getPushSubscription() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    console.log('Push subscription:', subscription);
    return subscription;
}

export async function isCurrentPushSubscriptionAvailable() {
    return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
    return {
        userVisibleOnly: true,
        applicationServerKey: convertBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEYS),
    };
}

export async function subscribe() {
    if (!(await requestNotificationPermission())) {
        return;
    }

    if (await isCurrentPushSubscriptionAvailable()) {
        alert('Sudah berlangganan push notification.');
        return;
    }

    console.log('Mulai berlangganan push notification...');

    const failureSubscribeMessage = 'Langganan push notification gagal diaktifkan.';
    const successSubscribeMessage = 'Langganan push notification berhasil diaktifkan.';

    let pushSubscription;

    try {
        const registration = await navigator.serviceWorker.ready;
        pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());

        const { endpoint, keys } = pushSubscription.toJSON();
        const response = await subscribePushNotification({ endpoint, keys });

        console.log('Subscribe response:', response);
        console.log('Subscribe berhasil:', response.ok);

        if (!response.ok) {
            console.error('subscribe: response:', response);
            
            await pushSubscription.unsubscribe();
            alert(failureSubscribeMessage);

            return;
        }

        alert(successSubscribeMessage);

        await showAppNotification({
            title: 'Berhasil Berlangganan',
            body: 'Anda berhasil berlangganan notifikasi aplikasi.',
        });

    } catch (error) {
        console.error('subscribe: error:', error);
        alert(failureSubscribeMessage);

        if (pushSubscription) {
            await pushSubscription.unsubscribe();
        }
    }
}

export async function unsubscribe() {
    const failureUnsubscribeMessage = 'Langganan push notification gagal dinonaktifkan.';
    const successUnsubscribeMessage = 'Langganan push notification berhasil dinonaktifkan.';

    try {
        const pushSubscription = await getPushSubscription();

        if (!pushSubscription) {
            alert('Tidak bisa memutus langganan push notification karena belum berlangganan sebelumnya.');
            return;
        }

        const { endpoint, keys } = pushSubscription.toJSON();
        const response = await unsubscribePushNotification({ endpoint });

        if (!response.ok) {
            alert(failureUnsubscribeMessage);
            console.error('unsubscribe: response:', response);

            return;
        }

        const unsubscribed = await pushSubscription.unsubscribe();

        if (!unsubscribed) {
            alert(failureUnsubscribeMessage);
            await subscribePushNotification({ endpoint, keys });

            return;
        }

        alert(successUnsubscribeMessage);

        await showAppNotification({
            title: 'Berhasil Berhenti Berlangganan',
            body: 'Anda sudah tidak berlangganan notifikasi aplikasi.',
        });
    } catch (error) {
        alert(failureUnsubscribeMessage);
        console.error('unsubscribe: error:', error);
    }
}

export async function showAppNotification({
    title,
    body,
    data = {},
}) {
    if (!isServiceWorkerAvailable() || !isNotificationAvailable() || !isNotificationGranted()) {
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;

        await registration.showNotification(title, {
            body,
            icon: './images/icons/maskable-icon-x192.png',
            badge: './images/icons/maskable-icon-x48.png',
            data,
        });
    } catch (error) {
        console.error('showAppNotification:', error);
    }
}