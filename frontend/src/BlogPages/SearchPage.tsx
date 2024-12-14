const SearchPage = () => {
    return (
      <div className="ml-7 my-6">
        <div className="relative">
          <input
            className="pl-12 pr-4 py-2 w-[90%] bg-[#424242] rounded-full sm:ml-32 sm:w-[900px] h-12 focus:outline-solid focus:ring-gray-900 text-blue-400 font-bold text-mono text-md placeholder-gray-400"
            placeholder="Search By Category"
          />
          <span className="absolute sm:ml-32  left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </div>
      </div>
    );
  };
  
  export default SearchPage;