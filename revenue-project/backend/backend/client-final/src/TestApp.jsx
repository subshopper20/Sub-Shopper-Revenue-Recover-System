function TestApp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark">
      <div className="bg-white p-12 rounded-2xl shadow-2xl text-center max-w-md">
        <h1 className="text-3xl font-bold text-primary mb-4">✅ Revenue Recovery System</h1>
        <p className="text-gray-600 mb-6">Vite + React + Tailwind is working!</p>
        <button 
          onClick={() => alert('Working!')}
          className="bg-accent text-primary px-6 py-3 rounded-full font-semibold hover:bg-accent-light transition-all"
        >
          Test Button
        </button>
      </div>
    </div>
  );
}

export default TestApp;