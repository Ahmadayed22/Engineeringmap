// components/FireParticles.tsx
import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import type { Engine } from 'tsparticles-engine';
import { loadFirePreset } from 'tsparticles-preset-fire';

const FireParticles = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    // Load the fire preset
    await loadFirePreset(engine);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          preset: 'fire',
          fullScreen: { enable: true }, // Optional
        }}
      />
    </div>
  );
};

export default FireParticles;
