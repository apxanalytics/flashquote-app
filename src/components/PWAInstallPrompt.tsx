import { useState, useEffect } from 'react';
import { X, Smartphone, Share, Plus, CheckCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const iosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const androidDevice = /Android/.test(navigator.userAgent);

    setIsIOS(iosDevice);
    setIsAndroid(androidDevice);

    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const standaloneNav = (window.navigator as any).standalone === true;

    if (standalone || standaloneNav) {
      setIsInstalled(true);
      return;
    }

    const dismissedPermanently = localStorage.getItem('pwaInstallDismissed') === 'permanent';
    if (dismissedPermanently) {
      return;
    }

    const lastDismissed = localStorage.getItem('pwaInstallLastDismissed');
    if (lastDismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    const firstProposalCreated = localStorage.getItem('firstProposalCreated');
    const firstJobCreated = localStorage.getItem('firstJobCreated');

    if (!firstProposalCreated && !firstJobCreated) {
      return;
    }

    if (androidDevice) {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);

        setTimeout(() => {
          setShowBanner(true);
        }, 2000);
      };

      window.addEventListener('beforeinstallprompt', handler);

      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    if (iosDevice) {
      setTimeout(() => {
        setShowBanner(true);
      }, 2000);
    }
  }, []);

  const handleInstallAndroid = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowBanner(false);
      localStorage.setItem('pwaInstalled', 'true');
    }

    setDeferredPrompt(null);
  };

  const handleShowIOSInstructions = () => {
    setShowIOSModal(true);
  };

  const handleMaybeLater = () => {
    setShowBanner(false);
    localStorage.setItem('pwaInstallLastDismissed', Date.now().toString());
  };

  const handleNeverShowAgain = () => {
    setShowBanner(false);
    setShowIOSModal(false);
    localStorage.setItem('pwaInstallDismissed', 'permanent');
  };

  const handleGotIt = () => {
    setShowIOSModal(false);
    setShowBanner(false);
    localStorage.setItem('pwaInstallLastDismissed', Date.now().toString());
  };

  if (isInstalled) return null;

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slideUp md:bottom-20">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl rounded-t-3xl md:max-w-md md:mx-auto md:mb-4 md:rounded-3xl">
            <div className="px-6 py-5">
              <button
                onClick={handleMaybeLater}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4 mb-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-bold mb-1">Install FlashQuote</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Add to your home screen for faster access and offline support
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                {isAndroid && deferredPrompt ? (
                  <button
                    onClick={handleInstallAndroid}
                    className="flex-1 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
                  >
                    Install Now
                  </button>
                ) : (
                  <button
                    onClick={handleShowIOSInstructions}
                    className="flex-1 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
                  >
                    Show Me How
                  </button>
                )}
                <button
                  onClick={handleMaybeLater}
                  className="px-6 py-3 rounded-xl font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showIOSModal && isIOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add to Home Screen</h2>
                <button
                  onClick={handleGotIt}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-6 space-y-8">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Tap the Share button</h3>
                </div>
                <p className="text-gray-700 mb-4 ml-13">
                  Look for the <Share className="w-4 h-4 inline-block mx-1" /> share icon at the bottom of Safari
                </p>
                <div className="bg-white rounded-xl p-4 border-2 border-blue-300">
                  <div className="flex justify-center items-center h-32 text-gray-400">
                    <div className="text-center">
                      <Share className="w-12 h-12 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm text-gray-600">Safari bottom bar</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Select "Add to Home Screen"</h3>
                </div>
                <p className="text-gray-700 mb-4 ml-13">
                  Scroll down in the share menu and tap <Plus className="w-4 h-4 inline-block mx-1" /> "Add to Home Screen"
                </p>
                <div className="bg-white rounded-xl p-4 border-2 border-green-300">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                        <Plus className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="font-semibold">Add to Home Screen</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Tap "Add"</h3>
                </div>
                <p className="text-gray-700 mb-4 ml-13">
                  Confirm by tapping the "Add" button in the top-right corner
                </p>
                <div className="bg-white rounded-xl p-4 border-2 border-purple-300">
                  <div className="flex justify-between items-center">
                    <button className="text-blue-600 font-semibold">Cancel</button>
                    <span className="font-semibold">FlashQuote</span>
                    <button className="text-blue-600 font-bold">Add</button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-2">Done!</h3>
                <p className="text-green-100">
                  FlashQuote will appear on your home screen like a native app
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-3xl">
              <button
                onClick={handleGotIt}
                className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg mb-3"
              >
                Got It!
              </button>
              <button
                onClick={handleNeverShowAgain}
                className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors"
              >
                Don't show this again
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
