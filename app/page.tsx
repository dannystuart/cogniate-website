import Hero from "./sections/Hero";
import Landscape from "./sections/Landscape";
import CogniateStory from "./sections/CogniateStory";
import HowItWorks from "./sections/HowItWorks";

export default function Home() {
  return (
    <main>
      <Hero />
      <Landscape />
      <CogniateStory />
      <HowItWorks />
    </main>
  );
}
