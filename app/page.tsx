import Hero from "./sections/Hero";
import Landscape from "./sections/Landscape";
import CogniateStory from "./sections/CogniateStory";
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
      <HowItWorks />
      <Platform />
      <Benefits />
      <Signup />
    </main>
  );
}
