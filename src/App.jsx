import { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import NeuralCanvas from './components/NeuralCanvas/NeuralCanvas';
import SkillDetail from './components/SkillDetail/SkillDetail';
import About from './components/About/About';
import TechStack from './components/TechStack/TechStack';
import Projects from './components/Projects/Projects';
import Experience from './components/Experience/Experience';
import Contact from './components/Contact/Contact';

export default function App() {
  const [activeNeuron, setActiveNeuron] = useState(null);

  const handleNeuronClick = (skillId) => {
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

