import React from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

export default function CaseDetails() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex justify-center items-start">
      <motion.div
        className="max-w-3xl w-full bg-gray-900 bg-opacity-70 rounded-2xl shadow-2xl p-8 backdrop-blur-md border border-gray-700"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Header */}
        <motion.h1
          className="text-3xl font-bold text-blue-400 text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Case Details
        </motion.h1>

        {/* Case Info */}
        <motion.div
          className="bg-gray-800 rounded-xl p-4 mb-6 shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-gray-300">
            <span className="font-semibold text-blue-300">ID:</span> {id}
          </p>
          <p className="text-gray-300 mt-2">
            <span className="font-semibold text-green-400">Status:</span> Open
          </p>
        </motion.div>

        {/* Description */}
        <motion.div
          className="mb-6 bg-gray-800 rounded-xl p-5 shadow-md"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-xl font-semibold text-yellow-400 mb-2">
            Description
          </h2>
          <p className="text-gray-300">
            (Case description will display here.)
          </p>
        </motion.div>

        {/* AI Summary */}
        <motion.div
          className="mb-6 bg-gray-800 rounded-xl p-5 shadow-md"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className="text-xl font-semibold text-purple-400 mb-2">
            AI Summary
          </h2>
          <p className="text-gray-300">
            (Generated summary, keywords, sentiment, and similar cases
            placeholder.)
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          className="bg-gray-800 rounded-xl p-5 shadow-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <h2 className="text-xl font-semibold text-pink-400 mb-3">Timeline</h2>

          <ul className="space-y-3 text-gray-300">
            <li className="border-l-4 border-blue-500 pl-3">
              <span className="text-sm text-gray-400">
                2025-11-09:
              </span>{" "}
              Case created by <span className="text-blue-300">user@example.com</span>
            </li>
            <li className="border-l-4 border-green-500 pl-3">
              <span className="text-sm text-gray-400">
                2025-11-10:
              </span>{" "}
              Assigned to analyst
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}

