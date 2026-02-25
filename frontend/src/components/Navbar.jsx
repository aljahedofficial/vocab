import { Book, FileText, LayoutDashboard, LogOut, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-10 px-2">
                <FileText className="w-8 h-8 text-blue-600" />
                <span className="font-bold text-xl text-gray-800">VocabDash</span>
            </div>

            <div className="flex-1 flex flex-col gap-2">
                <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium"
                >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                </Link>
                <Link
                    to="/upload"
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium"
                >
                    <Upload className="w-5 h-5" />
                    Upload Files
                </Link>
                <Link
                    to="/translations"
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium"
                >
                    <Book className="w-5 h-5" />
                    My Dictionary
                </Link>
            </div>

            <button
                onClick={handleLogout}
                className="mt-auto flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium"
            >
                <LogOut className="w-5 h-5" />
                Logout
            </button>
        </nav>
    );
};

export default Navbar;
