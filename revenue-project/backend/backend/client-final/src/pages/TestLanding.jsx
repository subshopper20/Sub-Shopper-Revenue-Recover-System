import { Link } from "react-router-dom";

const TestLanding = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between">
          <span className="text-white text-xl font-bold">SubShopper</span>
          <Link to="/login" className="bg-yellow-500 text-green-800 px-4 py-2 rounded-full">Sign In</Link>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-green-800 mb-4">Test Page Working!</h1>
        <p className="text-gray-600 mb-8">If you can see this, React is working.</p>
        <Link to="/login" className="bg-green-800 text-white px-6 py-3 rounded-full">Go to Login</Link>
      </div>
    </div>
  );
};

export default TestLanding;