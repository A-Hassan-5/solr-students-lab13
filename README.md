# 🎓 Student Search Portal — Apache Solr + React

> **CS-347: Parallel & Distributed Computing — Lab 13**  

A full-stack search application built with **Apache Solr** as the search engine and **React** as the frontend. Demonstrates indexing, querying, faceting, filtering, sorting, and pagination on a student records dataset.

---

## 📸 Preview

> Search students by name, department, courses, or city — with real-time results powered by Apache Solr.

---

## 🚀 Features

- 🔍 **Full-text search** across name, department, city, and courses
- 🏷️ **Faceted navigation** — filter by department with live counts
- 📊 **GPA filter** — show only students above a GPA threshold
- 🔃 **Sorting** — by relevance, GPA (high/low), name, or age
- 📄 **Pagination** — 5 results per page
- 🎨 **Color-coded GPA badges** — green, yellow, red based on score
- ⚡ **Real-time results** — no page reload on filter/sort changes

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Search Engine | Apache Solr 10.x |
| Frontend | React 18.x |
| CORS Proxy | local-cors-proxy |
| Dataset | Custom CSV (15 student records) |
| Language | JavaScript (ES6+) |

---

## 📁 Project Structure

```
solr-students-lab13/
├── public/
│   └── students.csv        # Dataset used for indexing
├── src/
│   ├── App.js              # Main React component
│   ├── setupProxy.js       # Proxy configuration
│   └── index.js
├── README.md
└── package.json
```

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Apache Solr](https://solr.apache.org/) 10.x
- [Java](https://openjdk.org/) 21+
- npm

---

## 🔧 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/solr-students-lab13.git
cd solr-students-lab13
```

### 2. Install dependencies

```bash
npm install
npm install http-proxy-middleware
```

### 3. Start Apache Solr

```bash
solr start
```

Verify Solr is running at: `http://localhost:8983/solr`

### 4. Create the Solr core

```bash
solr create -c students
```

### 5. Index the dataset

```bash
curl "http://localhost:8983/solr/students/update?commit=true&header=true" \
  --data-binary @public/students.csv \
  -H "Content-type:text/csv"
```

Verify indexing at:
```
http://localhost:8983/solr/students/select?q=*:*&wt=json
```
You should see `numFound: 15`.

### 6. Start the CORS proxy (in a separate terminal)

```bash
npx local-cors-proxy --proxyUrl http://localhost:8983/solr --port 8010 --proxyPartial ""
```

### 7. Start the React app (in another terminal)

```bash
npm start
```

Open **http://localhost:3000** in your browser.

---

## 🔍 Solr Query Examples

| Query | URL |
|---|---|
| All records | `http://localhost:8983/solr/students/select?q=*:*` |
| Search by name | `http://localhost:8983/solr/students/select?q=name:Ali` |
| Filter by department | `http://localhost:8983/solr/students/select?q=*:*&fq=department:"Computer Science"` |
| GPA range filter | `http://localhost:8983/solr/students/select?q=*:*&fq=gpa:[3.5 TO *]` |
| Sort by GPA | `http://localhost:8983/solr/students/select?q=*:*&sort=gpa desc` |
| Faceted search | `http://localhost:8983/solr/students/select?q=*:*&facet=true&facet.field=department` |
| Highlighting | `http://localhost:8983/solr/students/select?q=courses:AI&hl=true&hl.fl=courses` |
| Pagination | `http://localhost:8983/solr/students/select?q=*:*&rows=5&start=5` |

---

## 📊 Dataset

A custom student records dataset with **15 records** across **8 fields**:

| Field | Type | Description |
|---|---|---|
| id | Integer | Unique student ID |
| name | Text | Full name |
| age | Integer | Age in years |
| department | Text | Academic department |
| gpa | Float | Grade Point Average (0.0 – 4.0) |
| year | Integer | Academic year (1–4) |
| city | Text | Home city |
| courses | Text | Enrolled courses |

**Departments:** Computer Science (5) · Software Engineering (4) · Electrical Engineering (3) · Mechanical Engineering (2) · Physics (1)

---

## 🧠 Concepts Demonstrated

- Apache Solr core creation and configuration
- CSV data ingestion and indexing
- Inverted index architecture
- Full-text search with tokenization
- Numeric range queries (`fq=gpa:[3.5 TO *]`)
- Faceted search and aggregation
- Term highlighting
- Pagination with `rows` and `start`
- React integration with a search backend
- CORS handling in local development

---

## 👨‍💻 Author

**Hassan** — BSCS-13AB  
CS-347: Parallel & Distributed Computing  
Submitted: 8th May 2026
