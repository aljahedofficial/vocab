import { Check, Loader2, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../lib/api";

const TranslationModal = ({ word, isOpen, onClose, onSave }) => {
    const [translation, setTranslation] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && word) {
            setTranslation(""); // Reset
            fetchSuggestions();
        }
    }, [isOpen, word]);

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/translations/suggestions/${word}`);
            setSuggestions(res.data.suggestions);
        } catch (err) {
            console.error("Failed to fetch suggestions", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!translation.trim()) return;

        try {
            setSaving(true);
            await api.post("/translations/", { word, translation });
            onSave(word, translation);
            onClose();
        } catch (err) {
            console.error("Failed to save translation", err);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Add Translation</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Define Bangla meaning for "{word}"</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-8">
                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bangla Translation</label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="সরকার, প্রশাসন..."
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all text-lg font-medium"
                            value={translation}
                            onChange={(e) => setTranslation(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Fetching suggestions...
                        </div>
                    ) : suggestions.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-3 uppercase tracking-wider">
                                <Sparkles className="w-4 h-4" />
                                Suggestions
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setTranslation(s)}
                                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors border border-blue-100"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            type="button"
                            className="flex-1 py-4 px-6 text-gray-600 font-bold hover:bg-gray-100 rounded-2xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !translation.trim()}
                            className="flex-[2] py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                            Save Translation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TranslationModal;
