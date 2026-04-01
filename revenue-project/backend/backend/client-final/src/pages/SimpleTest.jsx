function SimpleTest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-12 rounded-2xl shadow-2xl text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">✅ React is Working!</h1>
        <p className="text-gray-600">The component is rendering correctly.</p>
        <button 
          onClick={() => alert('Working!')}
          className="mt-6 bg-primary text-white px-6 py-3 rounded-full hover:bg-primary-light"
        >
          Click Me
        </button>
      </div>
    </div>
  );
}

export default SimpleTest;