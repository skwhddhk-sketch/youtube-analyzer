# CAPCUT_AGENT_INTEGRATION.md

# CapCut Agent Integration Guide

Last Updated: 2026-07-02

---

## Purpose

This document defines how Viral Radar communicates with the local CapCut Agent.

Viral Radar performs:

- Research
- Filtering
- Ranking
- Analysis
- Planning

CapCut Agent performs:

- Video Download
- Silence/Filler Removal
- Whisper Subtitle Generation
- Automatic Timeline Assembly
- CapCut Project Preparation

These projects are independent but designed to integrate.

---

# Workflow

Viral Radar

↓

Research Candidate Videos

↓

Analyze

↓

Rank

↓

Export URL List

↓

CapCut Agent

↓

Download

↓

Subtitle

↓

Edit

↓

Publish

---

# Output Format

When exporting for CapCut Agent, the final output MUST contain:

- One YouTube URL per line
- No numbering
- No bullets
- No Markdown
- No explanation
- No blank text mixed into the URL block

Correct:

https://www.youtube.com/watch?v=xxxxxxxxxxx
https://www.youtube.com/watch?v=yyyyyyyyyyy

Incorrect:

1. https://www.youtube.com/watch?v=xxxxxxxxxxx

- https://www.youtube.com/watch?v=yyyyyyyyyyy

Recommended:
https://www.youtube.com/watch?v=xxxxxxxxxxx

---

# Candidate Selection Rules

Prefer:

- Public videos
- Downloadable videos
- Shorts
- Videos under 30 minutes
- Recent uploads
- Strong engagement

Avoid:

- Private videos
- Age-restricted videos
- Login-required videos
- Extremely long videos
- Videos likely to fail download

---

# Export Rule

If explanations are required:

Explain first.

Then output a dedicated section containing ONLY URLs.

Never mix explanations with URL lines.

---

# Future Integration

Future communication between Viral Radar and CapCut Agent should support:

- URL export
- JSON export
- Clipboard export
- Local API communication
- Batch processing

---

# Design Principle

Viral Radar should never perform editing.

CapCut Agent should never perform research.

Keep responsibilities clearly separated.

Research → Viral Radar

Editing → CapCut Agent

---

End of Document.
