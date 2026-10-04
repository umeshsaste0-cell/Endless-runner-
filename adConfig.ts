/**
 * Google AdSense / HTML5 Games Ads Configuration
 * 
 * Edit your Publisher ID and settings here or change it directly in the
 * in-game "Google HTML5 Ads Settings" panel.
 */

export interface GoogleH5AdsConfig {
  publisherId: string;
  customerId: string;
  testMode: boolean;
  frequencyHint: string;
}

export const DEFAULT_ADS_CONFIG: GoogleH5AdsConfig = {
  // Google AdSense Publisher ID
  publisherId: typeof window !== 'undefined' && localStorage.getItem('google_ads_pub_id') 
    ? localStorage.getItem('google_ads_pub_id')! 
    : 'ca-pub-1897225080989873',
  
  // Google AdSense Customer ID
  customerId: typeof window !== 'undefined' && localStorage.getItem('google_ads_customer_id')
    ? localStorage.getItem('google_ads_customer_id')!
    : '6725053853',
  
  // Set to true while testing, false for live ads on your approved domain
  testMode: typeof window !== 'undefined' && localStorage.getItem('google_ads_test_mode') !== null
    ? localStorage.getItem('google_ads_test_mode') === 'true'
    : false,

  frequencyHint: '30s'
};

export function getActivePublisherId(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('google_ads_pub_id');
    if (saved && saved.trim()) return saved.trim();
  }
  return DEFAULT_ADS_CONFIG.publisherId;
}

export function savePublisherId(newPubId: string, newCustomerId?: string): void {
  if (typeof window !== 'undefined') {
    let cleanId = newPubId.trim();
    if (cleanId && !cleanId.startsWith('ca-pub-') && cleanId.startsWith('pub-')) {
      cleanId = `ca-${cleanId}`;
    }
    localStorage.setItem('google_ads_pub_id', cleanId);
    if (newCustomerId) {
      localStorage.setItem('google_ads_customer_id', newCustomerId.trim());
    }
    
    // Update or insert script tag dynamically
    const existingScript = document.getElementById('google-adsense-script') as HTMLScriptElement | null;
    if (existingScript && cleanId) {
      existingScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cleanId}`;
    }
  }
}
