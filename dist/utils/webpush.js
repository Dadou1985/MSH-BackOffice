import webpush from 'web-push';
const pub = (process.env.VAPID_PUBLIC_KEY || '').trim();
const priv = (process.env.VAPID_PRIVATE_KEY || '').trim();
const b64 = pub.replace(/-/g, '+').replace(/_/g, '/');
const buf = Buffer.from(b64 + '='.repeat((4 - b64.length % 4) % 4), 'base64');
console.log('VAPID public len =', buf.length); // doit afficher 65
webpush.setVapidDetails('mailto:contact@mysweethotel.com', pub, priv);
export default webpush;
