// src/App.tsx
import React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { createAppTheme } from './styles/theme';
import Layout from './components/layout/Layout';
import Hero from './components/sections/Hero';
import Carousel from './components/sections/Carousel';
import TeaserContent from './components/sections/TeaserContent';
import SocialLinks from './components/sections/SocialLinks';
import ValueProposition from './components/sections/ValueProposition';
import TeamSection from './components/sections/TeamSection';

// Create theme with default light mode
const theme = createAppTheme('dark');

const App: React.FC = () => {
  return (
    <CssVarsProvider theme={theme} defaultMode="dark">
      <CssBaseline />
      <Layout>
        <Hero />
        {/*<Carousel />*/}
        {/*<TeaserContent />*/}
        {/*<SocialLinks />*/}
        {/*<ValueProposition />*/}
        {/*<TeamSection />*/}
      </Layout>
    </CssVarsProvider>
  );
};

export default App;