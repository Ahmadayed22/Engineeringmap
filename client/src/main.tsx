import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { store, presistor } from '@store/Store';
import { Provider } from 'react-redux';
import AppRouter from '@routes/AppRouter.tsx';
import { PersistGate } from 'redux-persist/integration/react';
import './service/axiois-global.js';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={presistor}>
        <AppRouter />
      </PersistGate>
    </Provider>
  </StrictMode>
);
