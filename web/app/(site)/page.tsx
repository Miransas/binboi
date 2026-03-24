"use client";


import Hero from "../../components/site/shared/hero";
import { FeatureCards,  } from "../../components/site/shared/hero-flow";
import Laser from "../../components/site/shared/laser";
import SaaSPage from "../../components/site/shared/SaaSPage";

import { SmoothScroll } from "../../components/site/shared/smooth-scroll";

import TrafficPolicy from "../../components/site/shared/TrafficPolicy";

export default function Home() {
  return (
    <SmoothScroll>
      <main className="">
        <SaaSPage/> 
      {/* <Hero /> */}
      
      <FeatureCards />
     <TrafficPolicy />
    
    </main>
    </SmoothScroll>
  );
}