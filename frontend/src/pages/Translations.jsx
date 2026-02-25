import { Book, Languages, Loader2, Search, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../lib/api";

const Translations = () => {
    const [translations, setTranslations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchTranslations();
    }, []);

    const fetchTranslations = async () => {
        try {
            setLoading(true);
            const res = await api.get("/translations/user");
            setTranslations(res.data);
        } catch (err) {
            console.error("Failed to fetch translations", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this word from your dictionary?")) return;

        try {
            await api.delete(`/translations/delete/${id}`);
            setTranslations(translations.filter(t => t.id !== id));
        } catch (err) {
            console.error("Failed to delete translation", err);
            const errorMsg = err.response?.data?.detail || "Please try again.";
            alert(`Failed to delete: ${errorMsg}`);
        }
    };

    const filtered = translations.filter(t =>
        t.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.translation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="mb-10 lg:flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Book className="w-8 h-8 text-blue-600" />
                        My Dictionary
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage your global word translations across all documents.</p>
                </div>

                <div className="mt-6 lg:mt-0 flex items-center gap-4">
                    <div className="bg-blue-50 text-blue-700 px-5 py-2.5 rounded-2xl font-bold border border-blue-100 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {translations.length} Words Defined
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-10">
                <div className="p-8 border-b border-gray-50">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search your dictionary..."
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none text-sm font-bold transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-bold">Opening your dictionary...</p>
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y divide-gray-50 border-t border-gray-50">
                        {filtered.map((t) => (
                            <div key={t.id} className="p-8 hover:bg-blue-50/20 transition-all group relative">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-black text-blue-500 uppercase tracking-widest mb-1 italic">English</span>
                                    <h4 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase">{t.word}</h4>

                                    <div className="h-px w-8 bg-gray-100 my-4"></div>

                                    <span className="text-xs font-black text-green-500 uppercase tracking-widest mb-1 italic">Bangla</span>
                                    <p className="text-2xl font-black text-gray-800 leading-tight">{t.translation}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(t.id)}
                                    className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center">
                        <div className="inline-flex p-6 bg-gray-50 rounded-full mb-6">
                            <Languages className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">No translations found</h3>
                        <p className="text-gray-500 mt-2 font-medium">Start adding translations via the document view.</p>
                    </div>
                )}
            </div>

            <div className="bg-blue-600 rounded-3xl p-10 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-blue-300" />
                        Knowledge Power
                    </h3>
                    <p className="text-blue-100 text-lg font-medium leading-relaxed">
                        These translations are applied automatically whenever you upload a new document.
                        Your personal dictionary grows smarter with every word you define!
                    </p>
                </div>
                <Book className="absolute -bottom-10 -right-10 w-64 h-64 text-white/10 -rotate-12 group-hover:scale-110 transition-transform duration-500" />
            </div>
        </div>
    );
};

export default Translations;
