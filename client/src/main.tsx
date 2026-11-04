import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { store, presistor } from '@store/Store';
import { Provider } from 'react-redux';
import AppRouter from '@routes/AppRouter.tsx';
import { I18nProvider } from './i18n/I18nProvider';
import { PersistGate } from 'redux-persist/integration/react';
import './service/apiClient';
import { registerSW } from 'virtual:pwa-register';

// Offline support: caches the app so study plans open without a connection,
// and updates itself in the background after each deploy.
registerSW({ immediate: true });
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={presistor}>
        <I18nProvider>
          <AppRouter />
        </I18nProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
