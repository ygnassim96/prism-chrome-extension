# Prism Extension - 4-Step Analysis Process

The Prism extension now follows a systematic 4-step process for analyzing web pages and generating data visualizations:

## Process Overview

### Step 1: Analyze Page
**Button:** "Analyze Page"
**Action:** `summarizeContent`
**Purpose:** Extract and categorize all quantitative data from the webpage

**What happens:**
- Uses Chrome Prompt API to analyze the page content
- Extracts all numbers, percentages, dates, and counts
- Categorizes data by type and significance (high/medium/low)
- Identifies main topics and categories
- Performs sentiment analysis
- Stores analysis data for next step

**Output:** Analysis results showing data points extracted, topics, categories, and sentiment

### Step 2: Identify Key Insights
**Button:** "Identify Insights"
**Action:** `identifyInsights`
**Purpose:** Find the most important patterns and insights from the analyzed data

**What happens:**
- Uses Chrome Prompt API to analyze the extracted data
- Identifies 3-5 most significant insights
- Looks for patterns, trends, and relationships
- Ranks insights by significance
- Provides reasoning for each insight
- Stores insights data for next step

**Output:** Key insights with titles, descriptions, significance ratings, and reasoning

### Step 3: Identify Visualization Methods
**Button:** "Plan Visualizations"
**Action:** `identifyVisualizations`
**Purpose:** Determine the best chart types for each key insight

**What happens:**
- Uses Chrome Prompt API to plan visualizations
- Determines optimal chart type for each insight
- Prepares data in the format needed for charts
- Explains why each chart type is optimal
- Prioritizes visualizations by importance
- Plans layout and arrangement
- Stores visualization plan for next step

**Output:** Visualization plan showing chart types, data preparation, and layout

### Step 4: Generate Data Visualizations
**Button:** "Generate Charts"
**Action:** `generateVisualizations`
**Purpose:** Create and display the actual charts and graphs

**What happens:**
- Generates Chart.js compatible chart configurations
- Creates charts based on the visualization plan
- Renders interactive charts in the popup
- Shows final data visualizations
- Completes the analysis process

**Output:** Interactive charts and graphs displaying the key insights

## Technical Implementation

### Background Script (`background.js`)
- **4 separate functions** for each step
- **Chrome Prompt API integration** for AI-powered analysis
- **Data storage** between steps using `chrome.storage.local`
- **Chart generation** using Chart.js compatible format

### Popup Script (`popup.js`)
- **Progressive UI updates** showing results of each step
- **Dynamic button text** indicating current step
- **Step-specific display functions** for different data types
- **Chart rendering** using Chart.js

### Data Flow
1. **Raw Content** → Step 1 → **Analysis Data**
2. **Analysis Data** → Step 2 → **Insights Data**
3. **Insights Data** → Step 3 → **Visualization Plan**
4. **Visualization Plan** → Step 4 → **Final Charts**

## User Experience

1. **Click "Extract Content"** → Gets raw page content
2. **Click "Analyze Page"** → Shows analysis results
3. **Click "Identify Insights"** → Shows key insights
4. **Click "Plan Visualizations"** → Shows visualization plan
5. **Click "Generate Charts"** → Shows final charts

Each step builds upon the previous one, creating a systematic approach to data analysis and visualization.

## Benefits

- **Systematic approach** ensures thorough analysis
- **AI-powered insights** using Chrome Prompt API
- **Clear progression** with step-by-step feedback
- **Focused visualizations** based on identified insights
- **Transparent process** showing reasoning at each step
