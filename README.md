# Intelligent_Excel_validator
Excel Validator AI is an intelligent, AI-powered data quality tool designed to bridge the gap between human language and structured data validation. It allows users to define complex validation rules in plain English and automatically applies them to large Excel spreadsheets
🌟 Project Overview
Traditional data validation requires writing complex Excel formulas, Regex patterns, or custom scripts. Excel Validator AI simplifies this by using Gemini 3 Flash to interpret natural language instructions (e.g., "The 'Price' column must be a positive number" or "The 'Email' column must follow a valid format") and executing them directly against your data.
🚀 Key Features
Natural Language Rules: No coding required. Simply upload a .txt file with your business rules written in plain English.
Intelligent Interpretation: Uses Google’s Gemini AI to map your text-based rules to specific columns and logic in your spreadsheet.
Real-Time Validation: Scans thousands of rows in seconds, providing a live progress bar and status updates.
Detailed Reporting: Generates a comprehensive summary showing the total number of valid vs. invalid rows.
Error Exporting: Automatically generates a new Excel file containing only the rows that failed validation, with a new column explaining exactly what went wrong for each row.
Hybrid Processing: Offers a "Browser Engine" for local, private processing and an "API Endpoint" option for server-side integration.
🛠️ Technical Stack
Frontend: React 19 & TypeScript (for a robust, type-safe UI).
AI Engine: @google/genai (Gemini 3 Flash) for rule interpretation.
Styling: Tailwind CSS (modern, responsive "Clean Utility" design).
Data Handling: xlsx (SheetJS) for high-performance spreadsheet parsing and generation.
Icons: Lucide React for a crisp, professional interface.
Build System: Vite (for lightning-fast development and optimized production builds).
💡 The Problem It Solves
Data cleaning and QA are often the most time-consuming parts of any business workflow. This project solves three main pain points:
The Technical Barrier: Non-technical staff can now perform complex data audits without needing a developer.
Rigidity: Business rules change constantly. With this tool, you just update a text file instead of rewriting code.
Efficiency: It eliminates the "human error" factor in manual data checking and turns hours of work into seconds.
🎯 Ideal Use Cases
Finance & Accounting: Validating expense reports or tax data.
HR & Operations: Checking employee records or inventory lists for consistency.
Marketing: Cleaning lead lists and verifying email formats before a campaign.
Data Migration: Ensuring data meets the target system's requirements before import.
