import React from 'react';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/saga-blue/theme.css';  // Theme
import 'primereact/resources/primereact.min.css';           // Core CSS
import 'primeicons/primeicons.css';                         // Icons

const PrimeButton = () => {
  return (
    <Button label="Click Me" icon="pi pi-check" />
  );
}

export default PrimeButton;
