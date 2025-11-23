import { motion } from "motion/react";
import { Shield } from "lucide-react";
import { BlockchainBackground } from "./BlockchainBackground";
import cyberCrimeLogo from "../assets/CYBERCRIME.png";

interface LandingPageProps {
  onRequestDemo: () => void;
}

export function LandingPage({ onRequestDemo }: LandingPageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Blockchain Background */}
      <BlockchainBackground />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="px-8 py-6 flex items-center justify-between"
        >
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <motion.img
              src={cyberCrimeLogo}
              alt="ChainGuard Logo"
              className="w-12 h-12 object-contain"
              animate={{
                filter: [
                  "drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))",
                  "drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))",
                  "drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div>
              <h1 className="text-2xl font-bold text-white">ChainGuard</h1>
              <p className="text-blue-300 text-sm">Blockchain-Secured Evidence Protection</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <motion.button
              onClick={onRequestDemo}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Request Demo
            </motion.button>
          </nav>
        </motion.header>

        {/* Hero Section */}
        <div className="px-8 py-20 flex items-center justify-between max-w-7xl mx-auto">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-1 max-w-2xl"
          >
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              ChainGuard: Blockchain-Secured Digital Evidence Protection
            </h2>
            
            <p className="text-xl text-blue-200 mb-8">
              Ensuring tamper-proof, court-ready evidence for law enforcement agencies.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
              <motion.button
                onClick={onRequestDemo}
                className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-lg transition-all text-lg shadow-xl shadow-cyan-500/40 hover:shadow-cyan-400/60"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Request a Demo
              </motion.button>
              
              <motion.button
                className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800/70 text-blue-300 font-bold rounded-lg transition-all text-lg border border-blue-500/30 backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Watch Promo Video
              </motion.button>
            </div>
          </motion.div>

          {/* Right Content - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="relative">
              {/* Dashboard Mock */}
              <div className="bg-slate-900/80 backdrop-blur-xl border border-blue-500/30 rounded-xl p-8 shadow-2xl shadow-blue-500/20 w-[500px]">
                <div className="mb-6">
                  <h3 className="text-white font-bold text-lg mb-4">ChainGuard Dashboard</h3>
                  <div className="flex items-center gap-3">
                    <div className="h-12 bg-gradient-to-r from-cyan-500/30 to-cyan-500/10 rounded-lg flex-1 border border-cyan-500/30"></div>
                    <div className="h-12 bg-gradient-to-r from-blue-500/30 to-blue-500/10 rounded-lg flex-1 border border-blue-500/30"></div>
                    <div className="h-12 bg-gradient-to-r from-purple-500/30 to-purple-500/10 rounded-lg flex-1 border border-purple-500/30"></div>
                  </div>
                </div>

                {/* Chart Areas */}
                <div className="space-y-4">
                  <div className="h-40 bg-slate-800/50 rounded-lg border border-blue-500/20 flex items-end justify-around p-4">
                    {[60, 80, 45, 90, 70, 55, 85].map((height, i) => (
                      <motion.div
                        key={i}
                        className="w-8 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t"
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 1, delay: 1 + i * 0.1 }}
                      />
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-slate-800/50 rounded-lg border border-blue-500/20 flex items-center justify-center">
                      <motion.div
                        className="w-24 h-24 rounded-full border-8 border-cyan-500/30 border-t-cyan-500"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                    <div className="h-32 bg-slate-800/50 rounded-lg border border-blue-500/20"></div>
                  </div>
                </div>
              </div>

              {/* Decorative Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl blur-3xl -z-10"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
