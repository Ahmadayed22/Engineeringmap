import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Container, Engine } from 'tsparticles-engine';

import particlesConfig from './praticlesConfigWhite';

interface ParticlesBackgroundProps {
  id?: string;
  className?: string;
}

const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({
  id = 'tsparticles',
  className = '',
}) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (_container: Container | undefined) => {},
    []
  );

  return (
    <Particles
      id={id}
      className={className}
      init={particlesInit}
      loaded={particlesLoaded}
      // options={particlesConfigBlack}
      options={particlesConfig}
    />
  );
};

export default ParticlesBackground;
