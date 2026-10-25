import Hero from "./components/Hero";
import Carousel from "./components/Carousel";
import Mission from "./components/Mission";
import HowItWorks from "./components/HowItWorks";
import OurImpact from "./components/OurImpact";
import FindYourFit from "./components/FindYourFit";
import Footer from "./components/Footer";

function Home() {
  return (
    <>
      <main>
        <Hero />
        <Carousel />
        <Mission />
        <HowItWorks />
        <OurImpact />
        <FindYourFit />
      </main>

      <Footer />
    </>
  );
}

export default Home;