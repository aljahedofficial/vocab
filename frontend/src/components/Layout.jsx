import { Navigate, Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Navbar />
            <main className="flex-1 ml-64 p-10">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
