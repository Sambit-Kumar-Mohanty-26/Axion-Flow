import { Hero } from './sections/Hero';
import { ProblemSection } from './sections/ProblemSection';
import { SolutionSection } from './sections/SolutionSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { CTASection } from './sections/CTASection';
import { Footer } from './sections/Footer';

function App() {
  return (
    <div>
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}

export default App;