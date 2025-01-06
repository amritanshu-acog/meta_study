import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import AsyncSelect from "react-select/async";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Function to truncate text to the first 6 words
  const truncateText = (text, wordLimit = 6) => {
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + " ...";
  };

  // Function to load options dynamically from the API
  const loadOptions = async (inputValue) => {
    try {
      // Fetch the data from the API
      const response = await axios.get("/api/search-box-data");
      const { disease_names, studies } = response.data;

      // Filter diseases based on the input value
      const diseaseOptions = disease_names
        .filter((disease) =>
          disease.toLowerCase().includes(inputValue.toLowerCase())
        )
        .map((disease) => ({
          label: disease,
          value: disease,
          type: "disease",
          category: "In diseases",
        }));

      // Filter studies based on the input value
      const studyOptions = studies
        .filter(([_, title]) =>
          title.toLowerCase().includes(inputValue.toLowerCase())
        )
        .map(([id, title]) => ({
          label: truncateText(title),
          value: id,
          type: "study",
          category: "In studies",
        }));

      // Return combined options
      return [...diseaseOptions, ...studyOptions];
    } catch (error) {
      console.error("Error fetching search data:", error);
      return [];
    }
  };

  // Handle selection of an option
  const handleSelection = (selectedOption) => {
    if (!selectedOption) return;

    if (selectedOption.type === "disease") {
      navigate(`/all-studies?disease=${selectedOption.value}`);
    } else if (selectedOption.type === "study") {
      navigate(`/study/${selectedOption.value}`);
    }
  };

  return (
    <AnimatePresence>
      {isLoaded && (
        <motion.div
          className="flex flex-col items-center min-h-screen bg-gradient-to-b from-blue-50/50 to-white"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={containerVariants}
        >
          <motion.div
            className="text-center mt-16 lg:mt-24 mb-12 px-4"
            variants={itemVariants}
          >
            <motion.div
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                AI-Powered Analysis
              </span>
            </motion.div>
            <motion.h1
              className="text-4xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 mb-6 lg:leading-normal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Single-cell data to insights with AI
            </motion.h1>
          </motion.div>

          <motion.div
            className="relative w-full max-w-2xl mb-12 px-4"
            variants={itemVariants}
          >
            <AsyncSelect
              cacheOptions
              loadOptions={loadOptions}
              defaultOptions={true}
              onChange={handleSelection}
              placeholder="Search for a Disease / Study ..."
              isClearable
              components={{
                DropdownIndicator: () => (
                  <FiSearch className="text-blue-500 mr-2 ml-2 h-5 w-5" />
                ),
                SingleValue: ({ data }) => (
                  <div className="flex justify-between w-full">
                    <span>{data.label}</span>
                    <span className="text-gray-500 text-sm">
                      {data.category}
                    </span>
                  </div>
                ),
                Option: ({ data, innerRef, innerProps }) => (
                  <div
                    ref={innerRef}
                    {...innerProps}
                    className="flex justify-between items-center px-4 py-2 hover:bg-blue-50"
                  >
                    <span>{data.label}</span>
                    <span className="text-gray-500 text-sm">
                      {data.category}
                    </span>
                  </div>
                ),
              }}
              styles={{
                control: (provided) => ({
                  ...provided,
                  borderRadius: "12px",
                  padding: "8px",
                  fontSize: "18px",
                  height: "64px",
                  borderColor: "#e2e8f0",
                  backgroundColor: "white",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  "&:hover": {
                    borderColor: "#3182ce",
                    boxShadow: "0 4px 12px -1px rgba(0, 0, 0, 0.1)",
                  },
                }),
                menu: (provided) => ({
                  ...provided,
                  marginTop: "10px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  border: "none",
                  borderRadius: "12px",
                }),
                option: (provided, state) => ({
                  ...provided,
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: "1px dotted #E5E7EB",
                  backgroundColor: state.isFocused ? "#EBF8FF" : "white",
                  color: state.isFocused ? "#3182ce" : "#1a202c",
                }),
              }}
              noOptionsMessage={() => "No options found"}
            />
          </motion.div>

          <motion.div
            className="flex flex-col items-center text-lg mb-16"
            variants={itemVariants}
          >
            <p className="mb-6 text-gray-700">Try exploring these diseases:</p>
            <div className="flex flex-wrap justify-center gap-4">
              {["Kawasaki", "Sarcoidosis"].map((disease) => (
                <motion.div
                  key={disease}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={`/all-studies?disease=${disease}`}
                    className="inline-flex items-center px-6 py-3 rounded-full bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                  >
                    {disease}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
