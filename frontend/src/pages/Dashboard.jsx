import { ArrowRight, Clock, Download, FileDown, FileSpreadsheet, FileText, Languages, Loader2, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DocumentCharts from "../components/DocumentCharts";
import FrequencyTable from "../components/FrequencyTable";
import WordCloudComponent from "../components/WordCloud";
import api from "../lib/api";

const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [docData, setDocData] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);
    const [translating, setTranslating] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    useEffect(() => {
        if (selectedDoc) {
            fetchDocData(selectedDoc.id);
        }
    }, [selectedDoc]);

    const fetchDocData = async (id) => {
        try {
            setDataLoading(true);
            const response = await api.get(`/documents/${id}/words`);
            setDocData(response.data);
        } catch (err) {
            console.error("Failed to fetch doc data", err);
        } finally {
            setDataLoading(false);
        }
    };

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await api.get("/documents/");
            setDocuments(response.data);
        } catch (err) {
            console.error("Failed to fetch documents", err);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: "Total Documents", value: documents.length.toString(), icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Total Words", value: "Calculated", icon: Languages, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Unique Authors", value: "1", icon: Users, color: "text-green-600", bg: "bg-green-50" },
        { label: "Active Sessions", value: "1", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    const handleBatchTranslate = async () => {
        if (!selectedDoc || docData.length === 0) return;

        try {
            setTranslating(true);
            const wordsToTranslate = docData
                .filter(item => !item.translation)
                .slice(0, 50) // Limit to 50 at a time for safety
                .map(item => item.word);

            if (wordsToTranslate.length === 0) {
                alert("All words are already translated!");
                return;
            }

            await api.post("/translations/batch", { words: wordsToTranslate });
            await fetchDocData(selectedDoc.id); // Refresh data
        } catch (err) {
            console.error("Batch translation failed", err);
            alert("AI Translation failed. Please try again later.");
        } finally {
            setTranslating(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent opening the document
        if (!window.confirm("Are you sure you want to delete this document? This will free up storage space in your bucket.")) return;

        try {
            await api.delete(`/documents/${id}`);
            setDocuments(documents.filter(doc => doc.id !== id));
            if (selectedDoc?.id === id) {
                setSelectedDoc(null);
            }
        } catch (err) {
            console.error("Deletion failed", err);
            alert("Failed to delete the document. Please try again.");
        }
    };

    const handleExport = async (format) => {
        try {
            const response = await api.get(`/documents/${selectedDoc.id}/export/${format}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const extension = format === 'excel' ? 'xlsx' : format;
            link.setAttribute('download', `${selectedDoc.filename}_analysis.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export failed", err);
        }
    };

    if (selectedDoc) {
        return (
            <div>
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <button
                            onClick={() => setSelectedDoc(null)}
                            className="text-sm font-bold text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-1 group transition-all"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                            Back to Library
                        </button>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{selectedDoc.filename}</h1>
                        <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold uppercase">{selectedDoc.file_type.split("/")[1]}</span>
                            Analysis results and charts
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => handleExport('csv')}
                            className="p-3 bg-white border border-gray-200 rounded-2xl hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm group relative"
                            title="Export CSV"
                        >
                            <FileText className="w-5 h-5" />
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase">CSV</span>
                        </button>
                        <button
                            onClick={() => handleExport('excel')}
                            className="p-3 bg-white border border-gray-200 rounded-2xl hover:border-green-400 hover:text-green-600 transition-all shadow-sm group relative"
                            title="Export Excel"
                        >
                            <FileSpreadsheet className="w-5 h-5" />
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase">Excel</span>
                        </button>
                        <button
                            onClick={() => handleExport('pdf')}
                            className="p-3 bg-white border border-gray-200 rounded-2xl hover:border-red-400 hover:text-red-600 transition-all shadow-sm group relative"
                            title="Export PDF"
                        >
                            <FileDown className="w-5 h-5" />
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase">PDF</span>
                        </button>

                        <button
                            onClick={handleBatchTranslate}
                            disabled={translating}
                            className={`ml-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-xl flex items-center gap-2 ${translating
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-100"
                                }`}
                        >
                            {translating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Sparkles className="w-5 h-5" />
                            )}
                            {translating ? "AI Translating..." : "Translate All (AI)"}
                        </button>

                        <button
                            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-blue-100 flex items-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Full Report
                        </button>
                    </div>
                </div>

                {dataLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="font-bold text-gray-400">Loading analysis data...</p>
                    </div>
                ) : (
                    <>
                        <DocumentCharts data={docData} />
                        <div className="mb-10 h-80">
                            <WordCloudComponent data={docData} />
                        </div>
                        <FrequencyTable docId={selectedDoc.id} initialData={docData} />
                    </>
                )}
            </div>
        );
    }

    return (
        <div>
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-2">Track your vocabulary analysis and documents.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`p-3 rounded-xl inline-block mb-4 ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-6">Your Documents</h3>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
            ) : documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-colors group cursor-pointer"
                            onClick={() => setSelectedDoc(doc)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <FileText className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{doc.filename}</h4>
                                        <p className="text-xs text-gray-500 mt-1 uppercase">{doc.file_type.split("/")[1]}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => handleDelete(e, doc.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete Document"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </div>
                    ))}
                    <Link
                        to="/upload"
                        className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-all font-medium"
                    >
                        + Upload New Document
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center py-20">
                    <div className="max-w-md mx-auto">
                        <div className="p-4 bg-gray-50 rounded-full inline-block mb-6">
                            <FileText className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No documents yet</h2>
                        <p className="text-gray-500 mb-8">Upload your first document to start analyzing word frequency and translations.</p>
                        <Link
                            to="/upload"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-100"
                        >
                            Upload Document
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
