import webpush from 'web-push';

webpush.setVapidDetails(
    'mailto:contact@mysweethotel.com',
    process.env.VAPID_PUBLIC_KEY || 'default-vapid-public-key',
    process.env.VAPID_PRIVATE_KEY || 'default-vapid-private-key'
);

export default webpush;