import { useState, useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import NeuralCanvas from './components/NeuralCanvas/NeuralCanvas';
import SkillDetail from './components/SkillDetail/SkillDetail';
import About from './components/About/About';
import TechStack from './components/TechStack/TechStack';
import Projects from './components/Projects/Projects';
import Experience from './components/Experience/Experience';
import Contact from './components/Contact/Contact';
import { initScrollDepthTracking, trackNeuronClick } from './utils/analytics';

export default function App() {
  const [activeNeuron, setActiveNeuron] = useState(null);

  // Initialize scroll depth tracking once
  useEffect(() => {
    initScrollDepthTracking();
  }, []);

  const handleNeuronClick = (skillId) => {
    trackNeuronClick(skillId);
    setActiveNeuron(prev => prev === skillId ? null : skillId);
  };

  const handleCloseSkill = () => {
    setActiveNeuron(null);
  };

  return (
    <>
      <Navbar />
      <main>
        <NeuralCanvas
          onNeuronClick={handleNeuronClick}
          activeNeuron={activeNeuron}
        />
        <About />
        <TechStack />
        <Projects />
        <Experience />
        <Contact />
      </main>
      {activeNeuron && (
        <SkillDetail
          skillId={activeNeuron}
          onClose={handleCloseSkill}
        />
      )}
    </>
  );
}

