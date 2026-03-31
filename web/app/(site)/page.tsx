import SaaSPage from "@/components/site/shared/SaaSPage";

import LandingSaas from "../../components/site/shared/landing-saas";
import { SmoothScroll } from "../../components/site/shared/smooth-scroll";
import { Footer } from "../../components/site/shared/footer";

export default function Home() {
  return (
    <main>
      <SmoothScroll>
        <LandingSaas />
        <SaaSPage />
        <Footer/>
      </SmoothScroll>
    </main>
  );
}
