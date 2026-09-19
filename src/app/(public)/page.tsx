import Hero from "@/components/home/Hero";
import SobreNosotros from "@/components/home/SobreNosotros";
import PorQueNosotros from "@/components/home/PorQueNosotros";
import Experiencias from "@/components/home/Experiencias";
import ComoInscribirse from "@/components/home/ComoInscribirse";
import Contacto from "@/components/home/Contacto";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SobreNosotros />
      <PorQueNosotros />
      <Experiencias />
      <ComoInscribirse />
      <Contacto />
    </>
  );
}