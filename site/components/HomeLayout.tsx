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
}: {
  work: React.ReactNode;
}) {

  return (
    <div id="home">
      <HomeNav />
      <div className="max-w-[600px] mx-auto px-4 sm:px-8 lg:pt-12 min-h-screen flex flex-col">
        <Hero matrix={<MatrixArea />} />
      </div>
      <section
        id="projects"
        className="max-w-[600px] mx-auto px-4 sm:px-8 min-h-screen pt-16 lg:pt-24"
      >
        {work}
      </section>
      <section
        id="playground"
        className="max-w-[600px] mx-auto px-4 sm:px-8 min-h-screen pt-16 lg:pt-24"
      >
        {/* Placeholder for now — anchor target for the Playground nav item. */}
      </section>
    </div>
  );
}
