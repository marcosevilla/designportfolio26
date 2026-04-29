"use client";

import Hero from "./Hero";
import HomeNav from "./HomeNav";
import LedMatrix from "./LedMatrix";
import LedMatrixUI from "./music/LedMatrixUI";

function MatrixArea() {
  return (
    <div>
      <div className="relative">
        <LedMatrix />
        <LedMatrixUI />
      </div>
    </div>
  );
}

export default function HomeLayout({
  work,
  marquee,
}: {
  work: React.ReactNode;
  marquee: React.ReactNode;
}) {

  return (
    <div id="home">
      <HomeNav />
      <div className="max-w-[550px] mx-auto px-4 sm:px-8 lg:pt-12">
        <Hero matrix={<MatrixArea />}>
          <section className="mt-12" id="work">
            {work}
          </section>
          <section className="mt-28" id="playground">
            {/* Placeholder for now — anchor target for the Playground nav item. */}
          </section>
        </Hero>
      </div>
      {marquee}
    </div>
  );
}
