import { useEffect, useState } from "react";

function App() {
const [topics, setTopics] = useState([]);
const [selectedTopic, setSelectedTopic] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
fetch("http://localhost:5000/api/topics")
.then((response) => {
if (!response.ok) {
throw new Error("Failed to fetch topics");
}

    return response.json();
  })
  .then((data) => {
    setTopics(data);
    setLoading(false);
  })
  .catch((err) => {
    console.error(err);
    setError("Unable to connect to backend.");
    setLoading(false);
  });
}, []);

const getDecision = (score) => {
return score >= 70 ? "Publish" : "Skip";
};

const getReason = (score) => {
if (score >= 90) {
return "This topic has very high relevance and strong publishing potential.";
}

```
if (score >= 70) {
  return "This topic is relevant to the AI and technology audience.";
}

return "This topic does not have a high enough score for publishing.";
```

};

return ( <div className="min-h-screen bg-slate-950 text-white flex">

```
  {/* SIDEBAR */}
  <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 p-6">

    <div className="flex items-center gap-3 mb-10">
      <div className="text-3xl">🤖</div>

      <div>
        <h1 className="font-bold text-lg">
          Autonomous AI
        </h1>

        <p className="text-xs text-slate-400">
          Creator
        </p>
      </div>
    </div>

    <nav className="space-y-2">

      <button className="w-full text-left px-4 py-3 rounded-lg bg-blue-600">
        🏠 Dashboard
      </button>

      <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800">
        🔎 Topics
      </button>

      <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800">
        ✍️ Posts
      </button>

      <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800">
        🧠 Memory
      </button>

      <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800">
        📊 Analytics
      </button>

    </nav>

    <div className="mt-10 p-4 rounded-xl bg-slate-800">

      <div className="flex items-center gap-2">

        <span className="w-3 h-3 bg-green-500 rounded-full"></span>

        <span className="text-sm font-medium">
          Agent Active
        </span>

      </div>

      <p className="text-xs text-slate-400 mt-2">
        Monitoring AI & technology news...
      </p>

    </div>

  </aside>


  {/* MAIN */}
  <main className="flex-1 p-8">

    {/* HEADER */}
    <header className="flex justify-between items-center mb-8">

      <div>
        <h2 className="text-3xl font-bold">
          Autonomous AI Creator 👋
        </h2>

        <p className="text-slate-400 mt-2">
          Your AI persona is discovering and analyzing topics.
        </p>
      </div>

      <div className="flex items-center gap-3">

        <span className="text-sm text-green-400">
          ● Agent Online
        </span>

        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
          AI
        </div>

      </div>

    </header>


    {/* PERSONA */}
    <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600">

      <p className="text-blue-100 text-sm">
        CURRENT PERSONA
      </p>

      <h3 className="text-2xl font-bold mt-1">
        AI Product Analyst
      </h3>

      <p className="text-blue-100 mt-2">
        An autonomous AI analyst that discovers important AI trends,
        analyzes them and creates technology content.
      </p>

    </div>


    {/* STATS */}
    <div className="grid grid-cols-4 gap-5 mb-10">

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="text-2xl">🔎</div>

        <p className="text-slate-400 text-sm mt-4">
          Topics Found
        </p>

        <h3 className="text-3xl font-bold mt-1">
          {topics.length}
        </h3>
      </div>


      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="text-2xl">✍️</div>

        <p className="text-slate-400 text-sm mt-4">
          Posts Generated
        </p>

        <h3 className="text-3xl font-bold mt-1">
          12
        </h3>
      </div>


      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="text-2xl">🚀</div>

        <p className="text-slate-400 text-sm mt-4">
          Published
        </p>

        <h3 className="text-3xl font-bold mt-1">
          8
        </h3>
      </div>


      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="text-2xl">⏭️</div>

        <p className="text-slate-400 text-sm mt-4">
          Skipped
        </p>

        <h3 className="text-3xl font-bold mt-1">
          4
        </h3>
      </div>

    </div>


    {/* DISCOVERED TOPICS */}
    <section>

      <div className="flex justify-between items-center mb-5">

        <div>
          <h2 className="text-xl font-bold">
            🔥 Discovered Topics
          </h2>

          <p className="text-sm text-slate-400">
            Topics found by the autonomous agent
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="text-blue-400 hover:text-blue-300"
        >
          Refresh Topics →
        </button>

      </div>


      {/* LOADING */}
      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
          <p className="text-slate-400">
            Loading topics...
          </p>
        </div>
      )}


      {/* ERROR */}
      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <p className="text-red-400">
            ❌ {error}
          </p>

          <p className="text-sm text-slate-400 mt-2">
            Make sure the backend is running on port 5000.
          </p>
        </div>
      )}


      {/* TOPICS */}
      {!loading && !error && (

        <div className="space-y-4">

          {topics.map((topic) => (

            <div
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 cursor-pointer hover:border-blue-500 transition"
            >

              <div className="flex justify-between">

                <div>

                  <h3 className="font-semibold text-lg">
                    {topic.title}
                  </h3>

                  <div className="flex gap-3 mt-3">

                    <span className="text-xs bg-slate-800 px-3 py-1 rounded-full">
                      {topic.category}
                    </span>

                    <span className="text-xs text-slate-400">
                      Source: {topic.source}
                    </span>

                  </div>

                </div>


                <div className="text-right">

                  <p
                    className={`text-2xl font-bold ${
                      topic.score >= 70
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {topic.score}%
                  </p>

                  <p className="text-xs text-slate-500">
                    Publish Score
                  </p>

                </div>

              </div>


              <div className="mt-4">

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    getDecision(topic.score) === "Publish"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {getDecision(topic.score) === "Publish"
                    ? "✓ AI recommends publishing"
                    : "✕ AI recommends skipping"}
                </span>

              </div>

            </div>

          ))}

        </div>

      )}

    </section>


    {/* AI DECISION */}
    {selectedTopic && (

      <section className="mt-10">

        <h2 className="text-xl font-bold mb-5">
          🧠 AI Decision
        </h2>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <div className="flex justify-between">

            <div>

              <p className="text-sm text-slate-400">
                Selected Topic
              </p>

              <h3 className="text-xl font-bold mt-1">
                {selectedTopic.title}
              </h3>

            </div>

            <div className="text-right">

              <p className="text-green-400 font-bold text-2xl">
                {selectedTopic.score}%
              </p>

              <p className="text-xs text-slate-500">
                Confidence
              </p>

            </div>

          </div>


          <div className="mt-6 p-4 bg-slate-800 rounded-xl">

            <p className="text-sm text-blue-400 font-semibold mb-2">
              WHY AI CHOSE THIS
            </p>

            <p className="text-slate-300">
              {getReason(selectedTopic.score)}
            </p>

          </div>


          {getDecision(selectedTopic.score) === "Publish" && (

            <button className="mt-5 px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold">
              ✍️ Generate Post
            </button>

          )}

        </div>

      </section>

    )}

  </main>

</div>

);
}

export default App;
