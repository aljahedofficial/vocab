import { AlertCircle, CheckCircle, File, Loader2, Upload as UploadIcon, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const Upload = () => {
    const [file, setFile] = useState(null);
    const [step, setStep] = useState(0); // 0: idle, 1: uploading, 2: processing, 3: done
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setSuccess(false);
            setError("");
            setStep(0);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError("");
        setStep(1); // Uploading

        try {
            // 1. Upload Document
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await api.post("/documents/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const docId = uploadRes.data.id;

            setStep(2); // Analysis

            // 2. Process Document
            await api.post(`/documents/${docId}/process`);

            setStep(3); // Success
            setSuccess(true);
            setFile(null);
        } catch (err) {
            setError(err.response?.data?.detail || "Upload failed. Please try again.");
            setStep(0);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
                <p className="text-gray-500 mt-2">Supported formats: PDF, DOCX, TXT (Max 50MB)</p>
            </div>

            <div className="max-w-2xl">
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center relative group hover:border-blue-400 transition-colors">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.docx,.txt"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="inline-flex p-4 bg-blue-50 rounded-full mb-6 group-hover:scale-110 transition-transform">
                        <UploadIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Click or drag to upload</h2>
                    <p className="text-gray-500">Your file will be processed automatically after upload.</p>
                </div>

                {error && (
                    <div className="mt-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {file && (
                    <div className="mt-8 bg-white border border-gray-100 rounded-3xl p-8 shadow-2xl shadow-blue-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                                    <File className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-gray-900">{file.name}</p>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                            </div>
                            {!uploading && !success && (
                                <button
                                    onClick={() => setFile(null)}
                                    className="p-3 hover:bg-red-50 hover:text-red-500 rounded-2xl text-gray-300 transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            )}
                        </div>

                        {uploading ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between text-sm font-black uppercase tracking-widest">
                                    <span className="text-blue-600">
                                        {step === 1 ? "Uploading to Cloud..." : "Analyzing Vocabulary..."}
                                    </span>
                                    <span className="text-gray-300">
                                        {step === 1 ? "45%" : "85%"}
                                    </span>
                                </div>
                                <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden p-1">
                                    <div
                                        className={`h-full bg-blue-600 rounded-full transition-all duration-1000 ${step === 2 ? 'w-[85%]' : 'w-[45%]'}`}
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Please wait, extracting {file.name.split('.').pop().toUpperCase()} metadata...
                                </div>
                            </div>
                        ) : success ? (
                            <div className="text-center py-4">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 scale-110 animate-in zoom-in-75 duration-500">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Extraction Complete!</h3>
                                <p className="text-gray-500 font-medium mb-8">Your document is ready for analysis in the dashboard.</p>
                                <div className="flex items-center gap-3 justify-center">
                                    <button
                                        onClick={() => setFile(null)}
                                        className="px-8 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                                    >
                                        Upload Another
                                    </button>
                                    <button
                                        onClick={() => navigate("/")}
                                        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all"
                                    >
                                        Go to Dashboard
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleUpload}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                <UploadIcon className="w-6 h-6" />
                                Start Analysis Engine
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-12">
                <h3 className="text-lg font-bold text-gray-900 mb-6 px-1">Upload Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: "Clean Text", desc: "Ensure your document has selectable text (not scanned images)." },
                        { title: "Privacy", desc: "Your data is stored securely in Supabase with encrypted access." },
                        { title: "Free Tier", desc: "Files up to 50MB are processed free of cost on our servers." },
                    ].map((item, i) => (
                        <div key={i} className="bg-gray-50 p-6 rounded-2xl">
                            <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Upload;
