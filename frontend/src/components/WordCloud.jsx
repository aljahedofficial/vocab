import WordCloud from "react-d3-cloud";

const WordCloudComponent = ({ data }) => {
    // Map data to the format expected by react-d3-cloud
    const words = data.map(item => ({
        text: item.word,
        value: item.frequency,
    }));

    // Scaling the font size
    const fontSizeMapper = word => Math.log2(word.value) * 15 + 10;

    // Alternative simple linear scaling if log is too aggressive
    const simpleFontSizeMapper = word => (word.value / data[0]?.frequency) * 40 + 10;

    const rotate = () => (Math.random() > 0.5 ? 90 : 0);

    return (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md h-full min-h-[400px]">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                Vocabulary Cloud
                <span className="text-xs font-medium text-gray-400 font-sans uppercase tracking-widest">(Density)</span>
            </h3>
            <div className="w-full flex justify-center items-center overflow-hidden">
                <WordCloud
                    data={words}
                    width={500}
                    height={300}
                    font="Inter"
                    fontWeight="bold"
                    fontSize={fontSizeMapper}
                    rotate={rotate}
                    padding={2}
                    fill={(d, i) => ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#1e3a8a"][i % 5]}
                />
            </div>
        </div>
    );
};

export default WordCloudComponent;
