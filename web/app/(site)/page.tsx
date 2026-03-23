


import Hero from "../../components/site/shared/hero";
import { FeatureCards,  } from "../../components/site/shared/hero-flow";

import { SmoothScroll } from "../../components/site/shared/smooth-scroll";

import TrafficPolicy from "../../components/site/shared/TrafficPolicy";

export default function Home() {
  return (
    <SmoothScroll>
      <main className="">
      <Hero />
      
      <FeatureCards />
     <TrafficPolicy />
    </main>
    </SmoothScroll>
  );
}