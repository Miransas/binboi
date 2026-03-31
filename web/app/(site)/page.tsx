import SaaSPage from "@/components/site/shared/SaaSPage";

import LandingSaas from "../../components/site/shared/landing-saas";
import { SmoothScroll } from "../../components/site/shared/smooth-scroll";

export default function Home() {
  return (
    <main>
      <SmoothScroll>
        <LandingSaas />
        <SaaSPage />
      </SmoothScroll>
    </main>
  );
}
