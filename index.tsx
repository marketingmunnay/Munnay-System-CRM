import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ScheduleProvider } from './components/shared/ScheduleContext';

const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <ScheduleProvider>
                <App />
            </ScheduleProvider>
        </React.StrictMode>
    );
} else {
    console.error('Failed to find the root element to mount the React application.');
}
