import SaaSPage from "@/components/site/shared/SaaSPage";
import LandingSaas from "../../components/site/shared/landing-saas";
import { SmoothScroll } from "../../components/site/shared/smooth-scroll";

import { HowItWorks, FaqSection, CtaSection } from "../../components/site/shared/landing-sections";

export default function Home() {
  return (
    <main>
      <SmoothScroll>
        <LandingSaas />
        <SaaSPage />
        <HowItWorks />
        <FaqSection />
        <CtaSection />
        {/* <Footer/> */}
      </SmoothScroll>
    </main>
  );
}
