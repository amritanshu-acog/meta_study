import React from 'react';

const HomePage = () => {
  return (
    <div className="w-full min-h-screen bg-white px-8">
      {/* Top navigation bar */}
      <div className="w-full flex justify-end py-8">
        <button className="text-[#7b0000] hover:text-[#590000] text-lg font-medium transition-colors duration-200">
          Explore available metastudies &gt;&gt;
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center mt-48">
        {/* Search Bar Container */}
        <div className="relative w-full max-w-lg mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a Disease / Study ..."
              className="w-full px-4 py-2 text-base rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg 
                className="text-gray-500 w-5 h-5"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Links below search bar */}
        <div className="flex flex-row space-x-8 text-[#7b0000] text-lg">
          <button className="hover:underline">
            Kawasaki Disease
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;