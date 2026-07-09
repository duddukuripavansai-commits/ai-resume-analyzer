import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function DashboardPage({ user, onBack }) {
  const [history, setHistory] = useState([]);
  const averageScore =
  history.length === 0
    ? 0
    : Math.round(
        history.reduce((sum, item) => sum + (item.match_score || 0), 0) /
          history.length
      );
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("resume_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
    } else {
      setHistory(data);
    }

    setLoading(false);
  };

  const deleteHistory = async (id) => {
    const { error } = await supabase
      .from("resume_history")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      loadHistory();
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <button onClick={onBack} className="mb-6 text-blue-600">
          ← Back to Analyzer
        </button>

        <h1 className="text-3xl font-bold mb-6">Resume History</h1>
        <div className="grid grid-cols-3 gap-4 mb-8">
  <div className="bg-blue-100 p-5 rounded-lg">
    <h2 className="font-bold text-lg">Total Analyses</h2>
    <p className="text-3xl mt-2">{history.length}</p>
  </div>

  <div className="bg-green-100 p-5 rounded-lg">
    <h2 className="font-bold text-lg">Average Match Score</h2>
    <p className="text-3xl mt-2">{averageScore}%</p>
  </div>

  <div className="bg-purple-100 p-5 rounded-lg">
    <h2 className="font-bold text-lg">Saved Reports</h2>
    <p className="text-3xl mt-2">{history.length}</p>
  </div>
</div>

        {loading ? (
          <p>Loading...</p>
        ) : history.length === 0 ? (
          <p>No history found.</p>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="border rounded-lg p-5 shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-bold text-xl">{item.resume_name}</h2>
                    <p className="text-gray-600">
                      Match Score: {item.match_score}%
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteHistory(item.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </div>

                <p className="mt-4">{item.overall_summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}