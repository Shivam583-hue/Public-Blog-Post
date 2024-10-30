const More = () => {
    return (
      <div className="mx-4 md:ml-8">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-serif p-4 font-bold bg-gradient-to-br from-gray-800 to-cyan-500 bg-clip-text text-transparent shadow-lg">
              Aur Kya Chahiye?
          </h1>
          <div className="w-full max-w-2xl">
              <video 
                className="w-full h-auto rounded-lg shadow-lg"
                src="/SlowClap.mp4" 
                autoPlay 
                loop 
              >
                Your browser does not support the video tag.
              </video>
          </div>
      </div>
    );
  }
  
export default More;
  