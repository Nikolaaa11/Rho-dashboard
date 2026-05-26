"use client";

import { useState } from "react";
import TopNav from "@/components/TopNav";
import Hero from "@/components/Hero";
import OverviewView from "@/components/OverviewView";
import DesembolsosView from "@/components/DesembolsosView";
import ProyectosView from "@/components/ProyectosView";
import CategoriasView from "@/components/CategoriasView";
import OCView from "@/components/OCView";
import MovimientosView from "@/components/MovimientosView";
import AnaliticaView from "@/components/AnaliticaView";
import CartaView from "@/components/CartaView";
import BancaView from "@/components/BancaView";
import PortafolioMapView from "@/components/PortafolioMapView";
import RiskView from "@/components/RiskView";
import ESGView from "@/components/ESGView";
import AuditView from "@/components/AuditView";
import DecisionesView from "@/components/DecisionesView";
import Footer from "@/components/Footer";

export default function HomePage() {
  const [active, setActive] = useState("overview");

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-app)" }}>
      <TopNav active={active} setActive={setActive} />

      {active === "overview" && (
        <>
          <Hero />
          <OverviewView />
        </>
      )}
      {active === "carta" && <CartaView />}
      {active === "banca" && <BancaView />}
      {active === "desembolsos" && <DesembolsosView />}
      {active === "proyectos" && <ProyectosView />}
      {active === "mapa" && <PortafolioMapView />}
      {active === "categorias" && <CategoriasView />}
      {active === "oc" && <OCView />}
      {active === "movimientos" && <MovimientosView />}
      {active === "analitica" && <AnaliticaView />}
      {active === "risk" && <RiskView />}
      {active === "esg" && <ESGView />}
      {active === "audit" && <AuditView />}
      {active === "decisiones" && <DecisionesView />}

      <Footer />
    </main>
  );
}
