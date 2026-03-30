import SaaSPage from "@/components/site/shared/SaaSPage";
import { div } from "three/src/nodes/math/OperatorNode.js";
import LandingSaas from "../../components/site/shared/landing-saas";

export default function Home() {
  return (
    <main>
      <LandingSaas/>
      <SaaSPage/>
    </main>
  );
}
