---
type: project
project_type: bayreuth
title: DRE MongoDB Dashboard
status: planning
date_start: 2026
date_end:
collaborators: []
parent_project:
tags:
  - DRE
  - data-visualization
  - MongoDB
---
# DRE MongoDB Dashboard

Interactive visualisation dashboard for Africa Multiple Cluster research data stored in MongoDB, adapting the approach from the [[Islam West Africa Dashboard]].

## Goal

Offer interactive visualisation dashboards as a DRE service for researchers with collections in MongoDB.

---

## Test Data: UBT Projects

Two exports from MongoDB Compass serve as proof-of-concept:

| Project | Documents | Type | Date range | Focus |
|---------|-----------|------|------------|-------|
| **UBT_ArtWorld2019** | 182 | Image (146), Text (19), Audio (17) | 1939–2019 | Ulli & Georgina Beier art collection estate |
| **UBT_CLnCK2019** | 105 | Text only | 1916–1966 | Colonial Letters and Contact of Knowledges |

**Location:** `C:\Users\frede\Downloads\projects_metadata_ubt\`

### Schema Comparison

Both exports use **identical field structure**, enabling a unified dashboard:

```
_id, dre_id, bitstream, security, collection, sponsor, project,
citation, url, titleInfo, dateInfo, name, note, subject,
relatedItems, identifier, location, accessCondition, typeOfResource,
genre, language, physicalDescription, abstract, tableOfContents,
targetAudience, tags, updatedBy
```

### Key Fields for Visualisation

| Field | Structure | Visualisation potential |
|-------|-----------|------------------------|
| `dateInfo.issue` | `{start, end}` as ISO dates | Timeline |
| `location.origin` | `[{l1: country, l2: region, l3: city}]` | Map |
| `name` | `[{name: {label, qualifier}, affl: [], role}]` | Network, contributor list |
| `subject` | `[{uri, authority, origLabel, authLabel}]` | Word cloud, bar chart, network |
| `typeOfResource` | String (Image, Text, Audio) | Bar chart, filter |
| `language` | Array of ISO codes | Bar chart, filter |
| `tags` | Array of strings | Word cloud |
| `project` | `{id, name}` | Filter, comparison |

---

## Data Analysis

### ArtWorld2019

**Resource types:**
- Image: 146
- Text: 19
- Audio: 17

**Top subjects (Library of Congress headings):**
- Artists (112), Art (94), Photographs (87), Africa (85)
- Art--Collectors and collecting (70), Interior decoration (41)
- Painting (39), Sculpture (39), Women artists (37)
- Wood sculpture, Yoruba (32), Exhibitions (31)

**Key people:**
- Katharina Greven (160 docs) — Photographer
- Ulli Beier (123) — Author/Associated name
- Georgina Beier (83) — Associated name

**Geographic origins:**
- Sydney, Australia (40)
- Bayreuth, Germany (34)
- Osogbo, Nigeria (26)
- Ile-Ife, Nigeria (7)
- Papua New Guinea (7+)

**Languages:** English (100), German (10), Yoruba, Hebrew, Turkish, Igbo, Latin

### CLnCK2019

**Resource types:** Text only (105 documents)

**Subjects (all documents tagged with):**
- Archives, Colonisation, Letters, Social norms, Discourse analysis (105 each)
- Petitions (8)

**Research team (all 11 appear in every document):**
- Eric Anchimbe (Research team head) — University of Bayreuth
- Team members from: University of Yaoundé I (3), University of Buea (2), University of Bayreuth (1), Humboldt University Berlin (1), University of Ghana (1), University of Abuja (1), University of Nigeria Nsukka (1)

**Geographic origins:**
- Buea, Cameroon (63)
- Enugu, Nigeria (24)
- Ibadan, Nigeria (17)
- London, UK (1)

**Languages:** English (105), German (4)

---

## Proposed Visualisations

### Core Views

| View | Description | Fields used |
|------|-------------|-------------|
| **Timeline** | Document distribution over time; slider for date range filtering | `dateInfo.issue` |
| **Map** | Geographic origins with clustering; click to filter | `location.origin` |
| **Subject distribution** | Bar chart of top subjects; click to filter | `subject.authLabel` |
| **Resource types** | Pie/bar chart breakdown | `typeOfResource` |
| **Word cloud** | Visual summary of themes | `tags`, `subject.authLabel` |

### Advanced Views

| View | Description | Fields used |
|------|-------------|-------------|
| **People network** | Graph connecting people to documents and subjects | `name`, `subject` |
| **Institutional collaboration** | Network of affiliations and contributors | `name.affl`, `name.label` |
| **Faceted browse** | Searchable table with filters | All metadata |
| **Project comparison** | Side-by-side stats for multiple projects | `project.id` |

### Cross-Collection Features

Since schemas are identical:
- Single dashboard supporting multiple projects
- Toggle between individual project view and combined view
- Compare distributions across projects
- Filter by `project.id`

---

## Technical Approach

### Data Pipeline

```
MongoDB Compass → Export JSON → Python processing → Dashboard
```

**Export options:**
- JSON Array: `[{doc1}, {doc2}, ...]` — for smaller collections
- Newline-delimited JSON: one doc per line — for larger collections

**Loading in Python:**
```python
import json

# JSON Array
with open("export.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Newline-delimited
with open("export.jsonl", "r", encoding="utf-8") as f:
    data = [json.loads(line) for line in f]
```

### Dashboard Stack Options

| Option | Pros | Cons |
|--------|------|------|
| **Dash (Python)** | Familiar from IWAC dashboard, quick iteration | Less polished UI |
| **React + D3** | Full control, modern UI | More development effort |
| **Streamlit** | Very fast prototyping | Limited customisation |
| **Observable** | Great for exploration, shareable notebooks | Less suitable for production |

**Recommendation:** Start with Dash for rapid prototyping, matching IWAC Dashboard approach.

### Data Cleaning Considerations

From the exports, some fields contain `{"$numberDouble": "NaN"}` for missing values. Processing script should:
- Replace NaN placeholders with `None`/empty
- Normalise date formats
- Handle nested location structures with missing l2/l3 values

---

## Implementation Roadmap

### Phase 1: Prototype
- [ ] Load and clean both JSON exports
- [ ] Build basic Dash app with timeline and bar charts
- [ ] Add map visualisation for locations
- [ ] Implement filtering by project

### Phase 2: Enhancements
- [ ] Add network graph for people/subjects
- [ ] Implement faceted search table
- [ ] Add word cloud view
- [ ] Cross-collection comparison features

### Phase 3: Production
- [ ] Connect directly to MongoDB (instead of static exports)
- [ ] Deploy as DRE service
- [ ] Documentation for adding new project collections
- [ ] Template system for reusable dashboard components

---

## Questions to Explore

- What are the common data structures across other Cluster projects in MongoDB?
- Should this be a reusable template or custom development per project?
- How frequently is data updated? (Static export vs. live MongoDB connection)
- Who are the target users? (Researchers, public, both?)

---

## Related

- [[Islam West Africa Dashboard]] — proof-of-concept for this approach
- [[New projects ideas]] — DRE retreat project planning
