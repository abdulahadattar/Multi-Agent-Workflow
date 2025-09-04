import React from "react";
import { WorkflowRun, RunStatus } from "../types";
import WelcomeMessage from "./chat/WelcomeMessage";
import FinalOutput from "./chat/FinalOutput";

interface ChatAreaProps {
  workflowRun: WorkflowRun | null;
}

const ChatArea: React.FC<ChatAreaProps> = ({ workflowRun }) => {
  const renderContent = () => {
    if (!workflowRun) {
      return <WelcomeMessage />;
    }

    switch (workflowRun.status) {
      case RunStatus.RUNNING:
        return (
          <div className="flex items-center justify-center gap-2 p-4 text-gem-mist">
            <div className="animate-spinner rounded-full h-5 w-5 border-b-2 border-gem-sunstone"></div>
            <span>Processing...</span>
          </div>
        );

      case RunStatus.COMPLETED:
        return <FinalOutput output={workflowRun.final_output} />;

      case RunStatus.FAILED:
        return (
          <div className="bg-gem-ruby/20 border border-gem-ruby text-gem-ruby p-4 rounded-lg">
            <h3 className="font-bold">Workflow Failed</h3>
            <p>
              An error occurred during execution. Please check the process log
              for details.
            </p>
          </div>
        );

      default:
        return <WelcomeMessage />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 rounded-lg bg-gem-slate/30 min-h-0">
      <div className="w-full max-w-4xl mx-auto mt-auto">{renderContent()}</div>
    </div>
  );
};

export default ChatArea;
