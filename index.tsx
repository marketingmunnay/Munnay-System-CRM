import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DateConfigProvider } from './src/context/DateConfigContext';
import { Provider } from 'react-redux';
import { store } from './src/store';

const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <Provider store={store}>
                <DateConfigProvider>
                    <App />
                </DateConfigProvider>
            </Provider>
        </React.StrictMode>
    );
} else {
    console.error('Failed to find the root element to mount the React application.');
}
