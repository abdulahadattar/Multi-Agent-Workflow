import React from "react";
import { DiamondIcon } from "../icons/Icons";

const WelcomeMessage: React.FC = () => {
  return (
    <div className="text-center p-6 sm:p-10 m-auto bg-gem-slate/50 rounded-2xl shadow-lg max-w-2xl">
      {/* Icon */}
      <DiamondIcon className="h-16 w-16 text-gem-sunstone mx-auto mb-4 animate-pulse" />

      {/* Title */}
      <h2 className="text-3xl font-bold text-gem-sky mb-3">
        Welcome to Gems
      </h2>

      {/* Subtitle */}
      <p className="text-gem-mist leading-relaxed">
        Select a <span className="text-gem-sunstone font-semibold">Gem</span>{" "}
        from the dropdown above, type your prompt below, and let your
        multi-agent team get to work.
      </p>
    </div>
  );
};

export default WelcomeMessage;
