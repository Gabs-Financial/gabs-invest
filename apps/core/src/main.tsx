import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import QueryProvider from './context/QueryProvider.tsx';
import { ThemeProvider } from './context/theme-provider.tsx';
import { Toaster } from './components/ui/sonner.tsx';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <ThemeProvider defaultTheme="system" storageKey="gabs_ui_theme">
        <App />
        <Toaster />
      </ThemeProvider>
    </QueryProvider>
  </StrictMode>
);
