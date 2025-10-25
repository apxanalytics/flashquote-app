import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { CheckCircle, XCircle, Smartphone } from 'lucide-react';

export default function MobileTestPage() {
  const [tests, setTests] = useState({
    screenSize: '',
    touchSupport: false,
    cameraAvailable: false,
    geolocationAvailable: false,
    pwaInstalled: false,
    serviceWorkerActive: false,
    onlineStatus: navigator.onLine,
    devicePixelRatio: window.devicePixelRatio || 1,
    orientation: window.screen.orientation?.type || 'unknown',
  });

  useEffect(() => {
    const checkCapabilities = async () => {
      const screenSize = `${window.innerWidth}x${window.innerHeight}`;
      const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      let cameraAvailable = false;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        cameraAvailable = devices.some(device => device.kind === 'videoinput');
      } catch (e) {
        cameraAvailable = false;
      }

      const geolocationAvailable = 'geolocation' in navigator;

      const pwaInstalled = window.matchMedia('(display-mode: standalone)').matches ||
        ('standalone' in window.navigator && (window.navigator as any).standalone);

      const swRegistration = await navigator.serviceWorker?.getRegistration();
      const serviceWorkerActive = swRegistration?.active !== undefined;

      setTests({
        screenSize,
        touchSupport,
        cameraAvailable,
        geolocationAvailable,
        pwaInstalled,
        serviceWorkerActive,
        onlineStatus: navigator.onLine,
        devicePixelRatio: window.devicePixelRatio || 1,
        orientation: window.screen.orientation?.type || 'unknown',
      });
    };

    checkCapabilities();

    const handleOnline = () => setTests(prev => ({ ...prev, onlineStatus: true }));
    const handleOffline = () => setTests(prev => ({ ...prev, onlineStatus: false }));
    const handleOrientationChange = () => {
      setTests(prev => ({
        ...prev,
        orientation: window.screen.orientation?.type || 'unknown',
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  const TestRow = ({ label, value, status }: { label: string; value: string | boolean; status?: boolean }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <span className="font-medium text-gray-900">{label}</span>
      <div className="flex items-center space-x-2">
        <span className="text-gray-700">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
        {typeof value === 'boolean' && (
          value ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )
        )}
      </div>
    </div>
  );

  return (
          <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 rounded-lg p-3 mr-4">
            <Smartphone className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mobile Diagnostics</h1>
            <p className="text-gray-600">Device capabilities and PWA status</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Device Information</h2>
          <div className="space-y-3">
            <TestRow label="Screen Size" value={tests.screenSize} />
            <TestRow label="Device Pixel Ratio" value={`${tests.devicePixelRatio}x`} />
            <TestRow label="Orientation" value={tests.orientation} />
            <TestRow label="User Agent" value={navigator.userAgent.substring(0, 50) + '...'} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Feature Support</h2>
          <div className="space-y-3">
            <TestRow label="Touch Support" value={tests.touchSupport} />
            <TestRow label="Camera Available" value={tests.cameraAvailable} />
            <TestRow label="Geolocation Available" value={tests.geolocationAvailable} />
            <TestRow label="Online Status" value={tests.onlineStatus} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">PWA Status</h2>
          <div className="space-y-3">
            <TestRow label="PWA Installed" value={tests.pwaInstalled} />
            <TestRow label="Service Worker Active" value={tests.serviceWorkerActive} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-6">
          <h3 className="font-bold text-gray-900 mb-2">About This Page</h3>
          <p className="text-sm text-gray-700 mb-4">
            This diagnostic page helps developers and support staff verify that all mobile features
            and PWA capabilities are working correctly on your device.
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Expected on Mobile:</p>
              <ul className="text-gray-600 space-y-1">
                <li>✓ Touch Support</li>
                <li>✓ Camera Available</li>
                <li>✓ Geolocation</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">PWA Features:</p>
              <ul className="text-gray-600 space-y-1">
                <li>✓ Offline Mode</li>
                <li>✓ Install to Home</li>
                <li>✓ Push Notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
}
