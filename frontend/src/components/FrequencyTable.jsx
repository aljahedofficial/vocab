import { ArrowUpDown, Languages, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import TranslationModal from "./TranslationModal";

const FrequencyTable = ({ docId, data, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "frequency", direction: "desc" });
    const [selectedWord, setSelectedWord] = useState(null);

    const handleSaveTranslation = async (word, translation) => {
        if (onRefresh) await onRefresh();
    };

    const handleSort = (key) => {
        let direction = "desc";
        if (sortConfig.key === key && sortConfig.direction === "desc") {
            direction = "asc";
        }
        setSortConfig({ key, direction });
    };

    const sortedWords = [...(data || [])]
        .filter((w) => w.word.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });

    if (!data) return null;

    return (
        <>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search words..."
                            className="w-full pl-14 pr-6 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none text-sm font-medium transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-5 py-3 rounded-xl font-bold border border-blue-100">
                            <Languages className="w-4 h-4" />
                            {data.length} Unique Words
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-5 py-3 rounded-xl font-bold border border-green-100">
                            <Sparkles className="w-4 h-4" />
                            {data.filter(w => w.translation).length} Translated
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/30">
                                <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Rank</th>
                                <th
                                    className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={() => handleSort("word")}
                                >
                                    <div className="flex items-center gap-2">
                                        English Word <ArrowUpDown className="w-4 h-4 opacity-30" />
                                    </div>
                                </th>
                                <th
                                    className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={() => handleSort("frequency")}
                                >
                                    <div className="flex items-center gap-2 justify-end">
                                        Calls <ArrowUpDown className="w-4 h-4 opacity-30" />
                                    </div>
                                </th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Bangla Meaning</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sortedWords.map((row, index) => (
                                <tr key={index} className="hover:bg-blue-50/20 transition-all group">
                                    <td className="px-8 py-5 text-sm text-gray-400 font-bold tabular-nums">#{index + 1}</td>
                                    <td className="px-8 py-5">
                                        <span className="font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors text-lg">{row.word}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-black bg-blue-50 text-blue-700 border border-blue-100">
                                            {row.frequency}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {row.translation ? (
                                            <div
                                                className="flex items-center justify-end gap-2 cursor-pointer group/item"
                                                onClick={() => setSelectedWord(row.word)}
                                            >
                                                <span className="text-gray-900 font-bold text-lg border-b-2 border-green-200">{row.translation}</span>
                                                <Sparkles className="w-4 h-4 text-green-500 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedWord(row.word)}
                                                className="text-blue-600 text-xs font-black px-4 py-2 rounded-xl border-2 border-blue-100 hover:border-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                                            >
                                                ADD MEANING
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {sortedWords.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                            <Search className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-medium font-lg">No matching words found.</p>
                    </div>
                )}
            </div>

            <TranslationModal
                word={selectedWord}
                isOpen={!!selectedWord}
                onClose={() => setSelectedWord(null)}
                onSave={handleSaveTranslation}
            />
        </>
    );
};

export default FrequencyTable;
