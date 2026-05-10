import { useState, useEffect } from "react";

const SOLR_URL = "http://localhost:8010/students/select";

// Helper: Solr returns most fields as arrays, this safely extracts the value
const val = (field) => Array.isArray(field) ? field[0] : field;

export default function App() {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [minGpa, setMinGpa] = useState("");
  const [sortBy, setSortBy] = useState("score desc");
  const [results, setResults] = useState([]);
  const [facets, setFacets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const rowsPerPage = 5;

  const search = async (newPage = 0) => {
    setLoading(true);
    setPage(newPage);

    const params = new URLSearchParams({
      q: query.trim() ? `name:*${query.trim()}* OR department:*${query.trim()}* OR city:*${query.trim()}* OR courses:*${query.trim()}*` : "*:*",
      wt: "json",
      rows: rowsPerPage,
      start: newPage * rowsPerPage,
      sort: sortBy,
      facet: "true",
      "facet.field": "department",
      hl: "true",
      "hl.fl": "name,courses,department",
    });

    if (department) params.append("fq", `department:"${department}"`);
    if (minGpa) params.append("fq", `gpa:[${minGpa} TO *]`);

    try {
      const res = await fetch(`${SOLR_URL}?${params}`);
      const data = await res.json();

      setResults(data.response.docs);
      setTotal(data.response.numFound);

      // Parse facet counts
      const deptFacets = data.facet_counts?.facet_fields?.department || [];
      const parsed = [];
      for (let i = 0; i < deptFacets.length; i += 2) {
        if (deptFacets[i + 1] > 0) {
          parsed.push({ name: deptFacets[i], count: deptFacets[i + 1] });
        }
      }
      setFacets(parsed);
    } catch (err) {
      console.error("Solr fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load all records on first render
  useEffect(() => {
    search(0);
  }, []);

  const gpaColor = (gpa) => {
    const g = parseFloat(gpa);
    if (g >= 3.7) return "#1e8e3e";
    if (g >= 3.5) return "#34a853";
    if (g >= 3.0) return "#f9ab00";
    return "#ea4335";
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: 960, margin: "30px auto", padding: "0 20px" }}>

      {/* Header */}
      <div style={{ borderBottom: "3px solid #1a73e8", paddingBottom: 16, marginBottom: 24 }}>
        <h1 style={{ color: "#1a73e8", margin: 0, fontSize: 28 }}>🎓 Student Search Portal</h1>
        <p style={{ color: "#666", margin: "4px 0 0" }}>Powered by Apache Solr — {total} students in database</p>
      </div>

      {/* Search Bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search(0)}
          placeholder="Search by name, department, courses, city..."
          style={{
            flex: 1, padding: "10px 16px", fontSize: 16,
            border: "2px solid #1a73e8", borderRadius: 8, outline: "none"
          }}
        />
        <button
          onClick={() => search(0)}
          style={{
            padding: "10px 28px", background: "#1a73e8", color: "#fff",
            border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer", fontWeight: "bold"
          }}
        >
          Search
        </button>
        <button
          onClick={() => { setQuery(""); setDepartment(""); setMinGpa(""); setSortBy("score desc"); search(0); }}
          style={{
            padding: "10px 16px", background: "#f1f3f4", color: "#444",
            border: "1px solid #ccc", borderRadius: 8, fontSize: 14, cursor: "pointer"
          }}
        >
          Reset
        </button>
      </div>

      {/* Filters Row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ fontSize: 13, color: "#555", fontWeight: "bold" }}>Filters:</label>

        <select
          value={department}
          onChange={e => setDepartment(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
        >
          <option value="">All Departments</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Software Engineering">Software Engineering</option>
          <option value="Electrical Engineering">Electrical Engineering</option>
          <option value="Mechanical Engineering">Mechanical Engineering</option>
        </select>

        <select
          value={minGpa}
          onChange={e => setMinGpa(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
        >
          <option value="">Any GPA</option>
          <option value="3.7">GPA 3.7+</option>
          <option value="3.5">GPA 3.5+</option>
          <option value="3.0">GPA 3.0+</option>
        </select>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
        >
          <option value="score desc">Sort: Relevance</option>
          <option value="gpa desc">Sort: GPA High → Low</option>
          <option value="gpa asc">Sort: GPA Low → High</option>
          <option value="name asc">Sort: Name A → Z</option>
          <option value="age asc">Sort: Age (Youngest First)</option>
        </select>

        <button
          onClick={() => search(0)}
          style={{
            padding: "8px 20px", background: "#34a853", color: "#fff",
            border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: "bold"
          }}
        >
          Apply
        </button>
      </div>

      {/* Main Layout */}
      <div style={{ display: "flex", gap: 24 }}>

        {/* Facet Sidebar */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div style={{ background: "#f8f9fa", border: "1px solid #e0e0e0", borderRadius: 10, padding: 16 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#333", borderBottom: "2px solid #1a73e8", paddingBottom: 8 }}>
              By Department
            </h3>
            {facets.length === 0 && <p style={{ fontSize: 13, color: "#999" }}>No facets available</p>}
            {facets.map(f => (
              <div
                key={f.name}
                onClick={() => { setDepartment(f.name); search(0); }}
                style={{
                  padding: "6px 8px", cursor: "pointer", borderRadius: 6,
                  background: department === f.name ? "#e8f0fe" : "transparent",
                  color: department === f.name ? "#1a73e8" : "#333",
                  fontWeight: department === f.name ? "bold" : "normal",
                  fontSize: 13, marginBottom: 4,
                  display: "flex", justifyContent: "space-between"
                }}
              >
                <span>{f.name}</span>
                <span style={{
                  background: department === f.name ? "#1a73e8" : "#e0e0e0",
                  color: department === f.name ? "#fff" : "#555",
                  borderRadius: 10, padding: "1px 7px", fontSize: 11
                }}>
                  {f.count}
                </span>
              </div>
            ))}
            {department && (
              <button
                onClick={() => { setDepartment(""); search(0); }}
                style={{
                  marginTop: 10, width: "100%", padding: "6px", background: "#ea4335",
                  color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12
                }}
              >
                Clear Filter ✕
              </button>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div style={{ flex: 1 }}>
          <p style={{ color: "#666", marginBottom: 12, fontSize: 14 }}>
            {loading ? "Searching..." : `Showing ${results.length} of ${total} results`}
            {department && <span style={{ color: "#1a73e8", fontWeight: "bold" }}> — {department}</span>}
            {minGpa && <span style={{ color: "#34a853", fontWeight: "bold" }}> — GPA {minGpa}+</span>}
          </p>

          {/* No Results */}
          {!loading && results.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: "#999" }}>
              <div style={{ fontSize: 48 }}>🔍</div>
              <p>No students found. Try a different search or clear the filters.</p>
            </div>
          )}

          {/* Result Cards */}
          {results.map(s => {
            const gpa = parseFloat(val(s.gpa));
            return (
              <div
                key={s.id}
                style={{
                  background: "#fff", border: "1px solid #e0e0e0",
                  borderLeft: `4px solid ${gpaColor(gpa)}`,
                  borderRadius: 10, padding: 20, marginBottom: 14,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ margin: "0 0 6px", color: "#1a1a2e", fontSize: 18 }}>
                      {val(s.name)}
                    </h3>
                    <span style={{
                      background: "#e8f0fe", color: "#1a73e8",
                      borderRadius: 12, padding: "2px 10px", fontSize: 12, fontWeight: "bold"
                    }}>
                      {val(s.department)}
                    </span>
                  </div>
                  <div style={{
                    textAlign: "center", background: gpaColor(gpa),
                    color: "#fff", borderRadius: 10, padding: "8px 16px", minWidth: 60
                  }}>
                    <div style={{ fontSize: 20, fontWeight: "bold" }}>{gpa.toFixed(1)}</div>
                    <div style={{ fontSize: 10 }}>GPA</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap", fontSize: 13, color: "#555" }}>
                  <span>📅 Year {val(s.year)}</span>
                  <span>🎂 Age {val(s.age)}</span>
                  <span>📍 {val(s.city)}</span>
                </div>

                {s.courses && (
                  <div style={{ marginTop: 10, fontSize: 13, color: "#666" }}>
                    📚 <strong>Courses:</strong> {val(s.courses)}
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {total > rowsPerPage && (
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "center", alignItems: "center" }}>
              <button
                disabled={page === 0}
                onClick={() => search(page - 1)}
                style={{
                  padding: "8px 20px", borderRadius: 6, border: "1px solid #ccc",
                  cursor: page === 0 ? "not-allowed" : "pointer",
                  background: page === 0 ? "#f5f5f5" : "#fff", color: page === 0 ? "#aaa" : "#333"
                }}
              >
                ← Prev
              </button>
              <span style={{ padding: "8px 16px", color: "#555", fontSize: 14 }}>
                Page <strong>{page + 1}</strong> of <strong>{Math.ceil(total / rowsPerPage)}</strong>
              </span>
              <button
                disabled={(page + 1) * rowsPerPage >= total}
                onClick={() => search(page + 1)}
                style={{
                  padding: "8px 20px", borderRadius: 6, border: "1px solid #ccc",
                  cursor: (page + 1) * rowsPerPage >= total ? "not-allowed" : "pointer",
                  background: (page + 1) * rowsPerPage >= total ? "#f5f5f5" : "#fff",
                  color: (page + 1) * rowsPerPage >= total ? "#aaa" : "#333"
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}