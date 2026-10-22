// Google Analytics (GA4). Loaded on every page, before Google's gtag.js.
// No ad features: ad storage and personalization are always off. In the EEA,
// the UK and Switzerland, analytics runs without cookies (Consent Mode), since
// there's no consent banner.
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

gtag("consent", "default", {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "granted"
});
gtag("consent", "default", {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
  region: [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
    "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
    "IS", "LI", "NO", "GB", "CH"
  ]
});

gtag("js", new Date());
gtag("config", "G-NVT7NBYHYV");
