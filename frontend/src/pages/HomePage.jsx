import { useNavigate } from "react-router-dom"; // 1. Import the useNavigate hook
import logo from "../assets/logo.png";
import hero from "../assets/hero.png";
import workflowimage from "../assets/workflow.png";

export default function HomePage() {
  const navigate = useNavigate(); // 2. Initialize the navigate function

  return (
    <>
      <div className="relative flex items-center justify-center min-h-[70vh] text-center text-white p-4 flex-col ">
        <img
          src={hero}
          alt="Workflow illustration"
          className="absolute inset-0 object-cover w-full h-full opacity-20"
        />

        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Streamline Your Workflow
            <br />
            <span className="text-transparent bg-gradient-to-r from-primary to-white bg-clip-text">
              All in One Place
            </span>
          </h1>
          <p className="max-w-lg mt-4 text-xl text-slate-300">
            Efficiently manage your tasks and boost productivity.
          </p>
          {/* 5. Add onClick handler to navigate to the workflow page */}
          <button
            onClick={() => navigate("/workflow")}
            className="px-8 py-3 mt-8 font-bold transition-colors rounded-lg text-brand-dark bg-primary hover:bg-opacity-90"
          >
            Get Started
          </button>
        </div>
        <img src={workflowimage} className="z-20 mt-32 mb-24 rounded-xl" />
      </div>
      <div className="w-[64rem] text-center mt-24 text-4xl font-bold mx-auto mb-44">
        Our node based system lets you build exactly what you need, when you
        need it,
        <span className="text-gray-500">
          with every connection as intuitive as your own thought process.
        </span>
      </div>
    </>
  );
}
