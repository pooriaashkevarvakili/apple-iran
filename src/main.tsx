import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider } from 'antd';
import App from './App';
import { UIProvider } from './context/UIProvider';
import { DatasetProvider } from './context/DatasetProvider';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity, retry: false, refetchOnWindowFocus: false }
  }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#4f46e5',
            borderRadius: 10,
            fontFamily: "'Inter', system-ui, sans-serif"
          }
        }}
      >
        <AntApp>
          <BrowserRouter>
            <UIProvider>
              <DatasetProvider>
                <App />
              </DatasetProvider>
            </UIProvider>
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>
);