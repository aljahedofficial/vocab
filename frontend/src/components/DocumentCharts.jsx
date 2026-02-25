import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

const DocumentCharts = ({ data }) => {
    // Take top 10 words for the bar chart
    const topWords = data.slice(0, 10).map(item => ({
        name: item.word,
        value: item.frequency
    }));

    // Calculate translation coverage for a pie chart
    const translatedCount = data.filter(w => w.translation).length;
    const untranslatedCount = data.length - translatedCount;
    const coverageData = [
        { name: "Translated", value: translatedCount, color: "#2563eb" },
        { name: "Untranslated", value: untranslatedCount, color: "#f1f5f9" }
    ];

    const COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Bar Chart: Top 10 Words */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                    Top 10 Vocabulary Hits
                    <span className="text-xs font-medium text-gray-400 font-sans uppercase tracking-widest">(Frequency)</span>
                </h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topWords} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
                                interval={0}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
                            />
                            <Tooltip
                                cursor={{ fill: "#f8fafc" }}
                                contentStyle={{
                                    borderRadius: "16px",
                                    border: "none",
                                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                    padding: "12px 16px"
                                }}
                                itemStyle={{ fontWeight: 800, color: "#2563eb" }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                                {topWords.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pie Chart: Translation Progress */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-lg font-black text-gray-900 mb-2">Translation Coverage</h3>
                <p className="text-sm text-gray-400 mb-6 font-medium">How many unique words have meanings?</p>
                <div className="h-60 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={coverageData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {coverageData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black text-gray-900">
                            {Math.round((translatedCount / (data.length || 1)) * 100)}%
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Done</span>
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-500 font-medium">
                            <div className="w-2 h-2 rounded-full bg-blue-600" /> Translated
                        </span>
                        <span className="font-bold text-gray-900">{translatedCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-500 font-medium">
                            <div className="w-2 h-2 rounded-full bg-gray-200" /> Remaining
                        </span>
                        <span className="font-bold text-gray-900">{untranslatedCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentCharts;
