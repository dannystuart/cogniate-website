import Hero from "./sections/Hero";
import Landscape from "./sections/Landscape";
import CogniateStory from "./sections/CogniateStory";
import CogniateLyraReveal from "./sections/CogniateLyraReveal";
import HowItWorks from "./sections/HowItWorks";
import Platform from "./sections/Platform";
import Benefits from "./sections/Benefits";
import Signup from "./sections/Signup";

export default function Home() {
  return (
    <main>
      <Hero />
      <Landscape />
      <CogniateStory />
      <CogniateLyraReveal />
      <HowItWorks />
      <Platform />
      <Benefits />
      <Signup />
    </main>
  );
}
