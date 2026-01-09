// --- 1. ORDER DEFINITIONS (sourced from backend response) ---

// The backend now owns the canonical order definitions; this object is
// populated from the upload response. Empty defaults keep the frontend
// defensive if the backend ever omits them.
let ORDER_DEFS = {};

// Default section priority fallback
const SECTION_PRIORITY = {
    "Demographics": 0,
    "School Phone Policy": 1,
    "Academic Outcomes": 2,
    "Social & Emotional Outcomes": 3,
    "Student Behaviors": 4
};

// --- 2. CONFIGURATION OBJECT ---

const STUDENT_DISPLAY_ORDER = [
    "Gender", "Grade", "Estimate how much time you spend on your phone on a typical school day.",
    "Q3. Do you feel you can contact your parent(s) in a timely manner when you need to during the school day? ",
    "Q12. How satisfied are you with your school’s phone policy?",
    "Q13. How fairly do teachers and staff enforce your school's phone policy? Give your best guess.",
    "Q14. What percentage of your classmates are using their phone when they shouldn’t be? Give your best guess.",
    "Q15. In your opinion, should your school's phone policy be more or less restrictive than it is now?",
    "In the following set of questions, we will ask about how you view your school experience. - In general, I pay attention in class.",
    "We are interested in understanding how you feel about your school's phone policy. Please rate your agreement with the following statements about your behavior or feelings since the\npolicy was introduced. “Since the new phone policy was introduced...” - I have felt closer to my friends.",
    "Q31a. In recent weeks, how often have you experienced the following DURING school hours? [Someone teased you or called you names.]",
    "My school is a place where... - I often feel lonely."
];

function getSurveyConfigs() {
    return {
        "student": {
            displayOrder: STUDENT_DISPLAY_ORDER,
            openEndedColumns: [
                "Please share any other thoughts"
            ],
            sectionPriority: {
                "Demographics": 0,
                "School Phone Policy": 1,
                "Academic Outcomes": 2,
                "Social & Emotional Outcomes": 3,
                "Student Behaviors": 4
            }
        },
        "parent": {
            displayOrder: [],
            openEndedColumns: [
                "Please share any other thoughts",
                "Is there anything else you want to share"
            ],
            sectionPriority: {
                "Demographics": 0,
                "School Phone Policy": 1,
                "Student Behaviors": 2,
                "Academic Outcomes": 3,
                "Parenting Experiences": 4
            }
        },
        "teacher": {
            displayOrder: [],
            openEndedColumns: [
                "What challenges have you faced",
                "Do you have any suggestions for overcoming"
            ],
            sectionPriority: {
                "Demographics": 0,
                "School Phone Policy": 1,
                "Student Behaviors": 2,
                "Academic Outcomes": 3,
                "Social & Emotional Outcomes": 4
            }
        },
        "admin": {
            displayOrder: [],
            openEndedColumns: [
                "Overall, how would you say this phone policy has changed your school",
                "Please share any other major changes",
                "Please share any other thoughts",
                "Is there anything else you want to share",
                "What challenges have you faced",
                "Do you have any suggestions for overcoming"
            ],
            sectionPriority: {
                "Demographics": 0,
                "School Phone Policy": 1,
                "Please indicate the level of stress you experience from each of the following aspects of your school's phone policy:": 2,
                "School Characteristics": 3,
                "School Experience": 4,
                "Academic Outcomes": 5,
                "Social & Emotional Outcomes": 6,
                "Student Behaviors": 7
            }
        }
    };
}

// --- 3. HELPER FUNCTIONS ---

function stripQuestionId(columnName) {
    const regex = /^Q\d+[a-zA-Z]*[\.\s\n]*\s*/;
    const cleanedName = columnName.replace(regex, '');
    return (cleanedName.length < columnName.length) ? cleanedName.trim() : columnName;
}

function extractBracketTitle(column) {
    const match = column.match(/\[(.+?)\]/);
    return match ? match[1].trim() : null;
}

function getQuestionStem(column) {
    const lower = column.toLowerCase();
    const stems = [
        {
            key: "please rate your agreement",
            title: "Please rate your agreement with the following statements",
        },
        {
            key: "please indicate how often these behaviors occur",
            title: "Please indicate how often these behaviors occur from a significant number of your students",
        },
        {
            key: "please rate how often you experience the following:",
            title: "Please rate how often you experience the following",
        },
        {
            key: "please read each statement and mark the response that best shows how much you agree",
            title: "Agreement with the following statements about your experience at this school",
        },
        {
            key: "in the past four weeks, how often has your child displayed the following behaviors?",
            title: "In the past four weeks, how often has your child displayed the following behaviors?",
        }
    ];
    const found = stems.find(s => lower.includes(s.key));
    return found ? found.title : null;
}

function isOpenEndedQuestion(column, valueCounts, config) {
    // If explicitly configured as open-ended, check for substring match
    if (config.openEndedColumns && config.openEndedColumns.length > 0) {
        const isConfigured = config.openEndedColumns.some(pattern => column.includes(pattern));
        if (isConfigured) return true;
    }

    // Convert to array format if needed
    let entries;
    if (Array.isArray(valueCounts)) {
        entries = valueCounts.map(item => [item.category, item.count]);
    } else {
        entries = Object.entries(valueCounts);
    }
    
    if (entries.length === 0) return false;

    // Heuristics to determine if a column is open-ended:
    // - Many unique responses
    // - Most responses occur only once
    // - Average response length is fairly long
    const uniqueCount = entries.length;
    const singletons = entries.filter(([, count]) => count === 1).length;
    const avgLen = entries.reduce((sum, [text]) => sum + String(text).length, 0) / uniqueCount;

    // Backend now handles all ordering and filtering, so just check heuristics
    return (uniqueCount >= 10) && (singletons / uniqueCount >= 0.6) && (avgLen >= 30);
}

function getSectionForColumn(column) {
    const lower = column.toLowerCase();

    const isDemographics = (
        lower.includes("gender") ||
        lower.includes("what is your gender") ||
        lower.includes("what grade are you in") ||
        lower.includes("grade level") ||
        lower.includes("what grade is your child in") ||
        lower.includes("relationship to the child") ||
        lower.includes("highest level of education") ||
        lower.includes("racial/ethnic") ||
        lower.includes("race") ||
        lower.includes("school type") ||
        lower.includes("public, private") ||
        lower.includes("title i") ||
        lower.includes("does your child have a cell phone") ||
        lower.includes("type of phone") ||
        lower.includes("time do you spend") ||
        lower.includes("academic level") ||
        lower.includes("years of work experience in education") ||
        lower.includes("area(s) taught") ||
        lower.includes("integration of technology to your everyday teaching practices") ||
        lower.includes("allow personal devices in your classroom")
    );

    const isStudentBehaviors = (
        lower.includes("please indicate how often these behaviors occur") ||
        lower.includes("in the past four weeks") ||
        lower.includes("acted defiant") ||
        lower.includes("easily distracted") ||
        lower.includes("did not pay attention when directly spoken") ||
        lower.includes("rushed through tasks") ||
        lower.includes("slept with their phone") ||
        lower.includes("discipline problems") ||
        lower.includes("bullying incidents") ||
        lower.includes("cyberbullying") ||
        lower.includes("fights") ||
        lower.includes("mental health referrals")
    );

    const isPerceptions = (
        lower.includes("phone policy") ||
        lower.includes("policy should be") ||
        lower.includes("restrictive") ||
        lower.includes("restrict access to phones") ||
        lower.includes("enforce your school's phone policy") ||
        lower.includes("how fairly do teachers and staff enforce") ||
        lower.includes("contact your parent") ||
        lower.includes("reach your child") ||
        lower.includes("when are students allowed to use their phones") ||
        lower.includes("overall, how would you say this phone policy has changed your school") ||
        lower.includes("percentage of your classmates") ||
        lower.includes("percentage")
    );

    const isAcademic = (
        lower.includes("pay attention") ||
        lower.includes("focus better") ||
        lower.includes("academic outcomes") ||
        lower.includes("gpa") ||
        lower.includes("standardized test score") ||
        lower.includes("average daily attendance") ||
        lower.includes("ada")
    );

    const isSocialEmotional = (
        lower.includes("closer to my friends") ||
        lower.includes("feel lonely") ||
        lower.includes("teased") ||
        lower.includes("called you names") ||
        lower.includes("how often have you experienced the following") ||
        lower.includes("better mood") ||
        lower.includes("anxious") ||
        lower.includes("less social drama") ||
        lower.includes("drains my energy") ||
        lower.includes("nervous or stressed") ||
        lower.includes("unable to control important aspects of my child's safety")
    );

    const isPerceptionsOfSchool = (
        lower.includes("q11") &&
        lower.includes("how strongly do you agree or disagree with the following statements about this school")
    );

    const isPolicyStress = (
        lower.includes("q10") &&
        lower.includes("please indicate the level of stress you experience")
    );

    // School Characteristics only for admin surveys (Q12b, Q13)
    const isSchoolCharacteristics = (
        (lower.includes("q12b") || lower.includes("please provide any other pertinent details about this school")) ||
        (lower.includes("q13") && lower.includes("how many students are currently enrolled at this school"))
    );

    if (isPolicyStress) return "Please indicate the level of stress you experience from each of the following aspects of your school's phone policy:";
    if (isPerceptionsOfSchool) return "School Experience";
    if (isSchoolCharacteristics) return "School Characteristics";
    if (isDemographics) return "Demographics";
    if (isStudentBehaviors) return "Student Behaviors";
    if (isPerceptions) return "School Phone Policy";
    if (isAcademic) return "Academic Outcomes";
    if (isSocialEmotional) {
        // Return different section name for parent surveys
        const surveyType = lastSurveyType || 'student';
        return surveyType === 'parent' ? "Parenting Experiences" : "Social & Emotional Outcomes";
    }
    return null;
}

// --- 4. SORTING LOGIC ---

function normalizeCategoryNames(data) {
    const categoryMap = new Map();
    data.forEach(item => {
        let norm = item.category;
        if (norm === "Neither agree / disagree") norm = "Neither agree nor disagree";
        if (categoryMap.has(norm)) {
            categoryMap.set(norm, categoryMap.get(norm) + item.count);
        } else {
            categoryMap.set(norm, item.count);
        }
    });
    return Array.from(categoryMap, ([category, count]) => ({ category, count }));
}



// --- 5. MAIN LOGIC ---

const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsDiv = document.getElementById('results');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');
const chartsDiv = document.getElementById('charts'); 
let lastResultsData = null;
let lastSurveyType = null;
let lastSurveyConfigs = getSurveyConfigs();

// Set up global click handler for collapsible sections (only once)
chartsDiv.addEventListener('click', (e) => {
    console.log('Click detected on charts container:', e.target);
    const header = e.target.closest('.section-header.collapsible');
    console.log('Found collapsible header:', header);
    if (header) {
        toggleSection(header);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        fileName.textContent = 'Selected: ' + e.target.files[0].name;
        analyzeBtn.disabled = false;
        resultsDiv.style.display = 'none';
        errorDiv.style.display = 'none';
        chartsDiv.style.display = 'none';
    }
});

function toggleSection(header) {
    // Robustly find the matching section-content using the data-section key
    const sectionKey = header.getAttribute('data-section');
    const icon = header.querySelector('.toggle-icon');
    const chartsContainer = document.getElementById('charts');
    const section = chartsContainer.querySelector(`.section-content[data-section="${sectionKey}"]`);

    console.log('Toggle section called for:', sectionKey);
    console.log('Found section element:', section);
    console.log('Current classList:', section ? section.classList.toString() : 'N/A');

    if (!section) {
        console.error('Could not find section-content for key:', sectionKey);
        return;
    }

    section.classList.toggle('closed');
    if (icon) icon.textContent = section.classList.contains('closed') ? '▶' : '▼';
    console.log('After toggle classList:', section.classList.toString());
}


async function uploadFile() {
    const file = fileInput.files[0];
    if (!file) return showError('Please select a file first');

    const formData = new FormData();
    formData.append('file', file);

    loadingDiv.style.display = 'block';
    resultsDiv.style.display = 'none';
    chartsDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    try {
        const response = await fetch('/api/upload_csv', { method: 'POST', body: formData });
        const data = await response.json();

        if (data.survey_type) {
            lastSurveyType = data.survey_type;
        }

        if (data.order_definitions) {
            ORDER_DEFS = { ...ORDER_DEFS, ...data.order_definitions };
            lastSurveyConfigs = getSurveyConfigs();
        }

        if (response.ok) {
            lastResultsData = data;
            displayResults(data);
        }
        else showError(data.error || 'An error occurred');
    } catch (error) {
        showError('Failed to upload file: ' + error.message);
    } finally {
        loadingDiv.style.display = 'none';
    }
}

function displayResults(data) {
    resultsDiv.innerHTML = '';
    
    // Get fresh reference to chartsDiv
    const chartsContainer = document.getElementById('charts');
    chartsContainer.innerHTML = '';

    const surveyType = lastSurveyType || 'student';
    const currentConfig = lastSurveyConfigs[surveyType];

    // --- Stats Section ---
    let html = `<h2>${surveyType.charAt(0).toUpperCase() + surveyType.slice(1)} Data Results</h2>`;
    html += `<div class="stat-item"><strong>Number of Respondents:</strong> ${data.num_rows}</div>`;
    html += `<div class="stat-item"><strong>Number of Variables:</strong> ${data.num_columns}</div>`;
    
    if (data.summary_stats && Object.keys(data.summary_stats).length > 0) {
        html += '<h3>Numerical Summary Statistics</h3>';
        for (const [column, stats] of Object.entries(data.summary_stats)) {
            let displayColumn = stripQuestionId(column);
            if (column.toLowerCase().includes("time")) displayColumn += " (Units: Hours)";
            
            if (stats.mean !== undefined) {
                // Skip GPA and test scores here - they appear in Academic Outcomes section
                if (column === "Average GPA" || column.includes("Score")) {
                    continue;
                }
                // Display stats with min/max if available, otherwise just mean and sd
                if (stats.min !== undefined && stats.max !== undefined) {
                    html += `<div class="stat-item"><strong>${displayColumn}</strong><br>
                        Mean: ${stats.mean.toFixed(2)}, Min: ${stats.min.toFixed(2)}, Max: ${stats.max.toFixed(2)}</div>`;
                } else if (stats.sd !== undefined) {
                    html += `<div class="stat-item"><strong>${displayColumn}</strong><br>
                        Mean: ${stats.mean.toFixed(2)}, SD: ${stats.sd.toFixed(2)}</div>`;
                } else {
                    html += `<div class="stat-item"><strong>${displayColumn}</strong><br>
                        Mean: ${stats.mean.toFixed(2)}</div>`;
                }
            }
        }
    }
    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
    
    // --- Charts Section ---
    if (data.responses && Object.keys(data.responses).length > 0) {
        
        // Sort columns based on displayOrder
        let columns = Object.keys(data.responses);
        columns.sort((a, b) => {
            const indexA = currentConfig.displayOrder.indexOf(a);
            const indexB = currentConfig.displayOrder.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            // Fallback to survey-specific section priority if provided
            const secA = getSectionForColumn(a) || '';
            const secB = getSectionForColumn(b) || '';
            const priority = currentConfig.sectionPriority || SECTION_PRIORITY;
            const priA = priority.hasOwnProperty(secA) ? priority[secA] : 999;
            const priB = priority.hasOwnProperty(secB) ? priority[secB] : 999;
            if (priA !== priB) return priA - priB;
            return a.localeCompare(b);
        });

        let currentSection = null;
        let chartsGenerated = false;
        const openEndedBuckets = [];
        const sectionsData = {}; // Store section structure

        for (const column of columns) {
            const valueCounts = data.responses[column];
            let displayColumn = stripQuestionId(column);
            const bracketTitle = extractBracketTitle(column);
            if (bracketTitle) displayColumn = bracketTitle;
            
            // Ignore placeholder questions meant for schools to customize
            if (column.toLowerCase().includes("[school to add]")) continue;

            if (column.toLowerCase().includes("time do you spend using your phone")) displayColumn += " (Units: Hours)";
            
            // Skip Timestamp only; show charts even with single response
            const numResponses = Array.isArray(valueCounts) ? valueCounts.length : Object.keys(valueCounts).length;
            if (column === 'Timestamp') continue;

            // Handle open-ended questions: collect and render later
            if (isOpenEndedQuestion(column, valueCounts, currentConfig)) {
                let responsesList;
                if (Array.isArray(valueCounts)) {
                    responsesList = valueCounts
                        .sort((a, b) => b.count - a.count)
                        .map(item => ({ text: item.category, count: item.count }));
                } else {
                    responsesList = Object.entries(valueCounts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([text, count]) => ({ text, count }));
                }
                openEndedBuckets.push({ column, displayColumn, responses: responsesList });
                continue;
            }

            // Section Headers - create collapsible sections
            const sectionTitle = getSectionForColumn(column);
            const stemTitle = getQuestionStem(column);
            
            // Skip columns that don't belong to any section
            if (!sectionTitle) {
                console.log('Skipping column with no section:', column);
                continue;
            }
            
            if (sectionTitle !== currentSection) {
                currentSection = sectionTitle;
                if (!sectionsData[sectionTitle]) {
                    // Use stemTitle if available, otherwise use sectionTitle
                    const displayStemTitle = stemTitle || sectionTitle;
                    sectionsData[sectionTitle] = {
                        stemTitle: displayStemTitle,
                        charts: []
                    };
                }
            }

            // Backend now sends data as array
            let chartData;
            if (Array.isArray(valueCounts)) {
                chartData = valueCounts;
            } else {
                chartData = Object.entries(valueCounts).map(([key, value]) => ({ category: key, count: value }));
            }
            
            chartData = normalizeCategoryNames(chartData);

            const chartId = `chart-${column.replace(/[^a-zA-Z0-9]/g, '_')}`;
            // For admin surveys, make "School Experience" section horizontal
            const isSchoolExperienceAdmin = (surveyType === 'admin' && sectionTitle === 'School Experience');
            const isRotated = isSchoolExperienceAdmin || column.includes("restrictive") || chartData.length > 6 || chartData.some(d => d.category.length > 15);

            if (currentSection && sectionsData[currentSection]) {
                sectionsData[currentSection].charts.push({
                    chartId,
                    displayColumn,
                    chartData,
                    column,
                    isRotated
                });
            }

            chartsGenerated = true;
        }
        
        if (chartsGenerated) {
            chartsContainer.style.display = 'block';
            
            // Build the HTML structure using proper DOM methods
            for (const [sectionTitle, sectionData] of Object.entries(sectionsData)) {
                // Create section wrapper
                const headerWrapper = document.createElement('div');
                headerWrapper.className = 'section-header-wrapper';
                
                const header = document.createElement('h3');
                header.className = 'section-header collapsible';
                header.setAttribute('data-section', sectionTitle);
                
                const icon = document.createElement('span');
                icon.className = 'toggle-icon';
                icon.textContent = '▶';
                
                header.appendChild(icon);
                header.appendChild(document.createTextNode(' ' + sectionData.stemTitle));
                headerWrapper.appendChild(header);
                chartsContainer.appendChild(headerWrapper);
                
                // Create section content div
                const contentDiv = document.createElement('div');
                contentDiv.className = 'section-content closed';
                contentDiv.setAttribute('data-section', sectionTitle);
                
                // For admin surveys, add GPA and test score stats to Academic Outcomes section
                if (surveyType === 'admin' && sectionTitle === 'Academic Outcomes' && data.summary_stats) {
                    const statsContainer = document.createElement('div');
                    statsContainer.className = 'academic-stats-container';
                    statsContainer.style.marginBottom = '2rem';
                    
                    // Check for GPA stats
                    if (data.summary_stats['Average GPA']) {
                        const stats = data.summary_stats['Average GPA'];
                        if (stats && stats.mean !== undefined && stats.sd !== undefined) {
                            const gpaDiv = document.createElement('div');
                            gpaDiv.className = 'stat-item';
                            gpaDiv.style.marginBottom = '1rem';
                            gpaDiv.innerHTML = `<strong>Average GPA</strong> ${stats.mean.toFixed(2)} (SD: ${stats.sd.toFixed(2)})`;
                            statsContainer.appendChild(gpaDiv);
                        }
                    }
                    
                    // Check for test score stats (dynamic test name)
                    for (const [key, stats] of Object.entries(data.summary_stats)) {
                        if (key.includes('Score') && key !== 'Average GPA') {
                            if (stats && stats.mean !== undefined && stats.sd !== undefined) {
                                const testDiv = document.createElement('div');
                                testDiv.className = 'stat-item';
                                testDiv.style.marginBottom = '1rem';
                                testDiv.innerHTML = `<strong>${key}</strong> ${stats.mean.toFixed(2)} (SD: ${stats.sd.toFixed(2)})`;
                                statsContainer.appendChild(testDiv);
                            }
                        }
                    }
                    
                    contentDiv.appendChild(statsContainer);
                }
                
                // Add all charts to this section
                for (const chart of sectionData.charts) {
                    const container = document.createElement('div');
                    container.className = 'chart-container';
                    
                    const heading = document.createElement('h4');
                    heading.textContent = chart.displayColumn;
                    
                    const chartDiv = document.createElement('div');
                    chartDiv.id = chart.chartId;
                    
                    container.appendChild(heading);
                    container.appendChild(chartDiv);
                    contentDiv.appendChild(container);
                }
                
                chartsContainer.appendChild(contentDiv);
            }
            
            // Now render all D3 charts
            for (const [sectionTitle, sectionData] of Object.entries(sectionsData)) {
                for (const chart of sectionData.charts) {
                    renderD3BarChart(`#${chart.chartId}`, chart.chartData, chart.column, chart.isRotated);
                }
            }
        }

        // --- Open-Ended Feedback Section ---
        if (openEndedBuckets.length > 0) {
            const header = document.createElement('h3');
            header.className = 'section-header';
            header.textContent = 'Open-Ended Feedback';
            chartsContainer.appendChild(header);

            openEndedBuckets.forEach(({ displayColumn, responses }) => {
                const container = document.createElement('div');
                container.className = 'chart-container';

                const heading = document.createElement('h4');
                heading.textContent = displayColumn;
                container.appendChild(heading);

                const ul = document.createElement('ul');
                ul.className = 'feedback-list';
                responses.forEach(r => {
                    const li = document.createElement('li');
                    li.textContent = r.text + (r.count > 1 ? ` (x${r.count})` : '');
                    ul.appendChild(li);
                });

                container.appendChild(ul);
                chartsContainer.appendChild(container);
            });
        }
    }
}

function showError(message) {
    errorDiv.textContent = 'Error: ' + message;
    errorDiv.style.display = 'block';
}

function renderD3BarChart(containerSelector, data, column, isRotated) {
    const margin = {top: 20, right: 30, bottom: isRotated ? 100 : 70, left: isRotated ? 400 : 80};
    // Make width responsive to label count; ensure minimum width
    const baseWidth = Math.max(1000, data.length * (isRotated ? 40 : 120));
    const width = baseWidth - margin.left - margin.right;
    const height = 420 - margin.top - margin.bottom;

    // Helper function to wrap text
    function wrap(text, width) {
        text.each(function() {
            const text = d3.select(this);
            const words = text.text().split(/\s+/).reverse();
            let word;
            let line = [];
            let lineNumber = 0;
            const lineHeight = 1.1; // ems
            const y = text.attr("y");
            const dy = parseFloat(text.attr("dy") || 0);
            let tspan = text.text(null).append("tspan").attr("x", -10).attr("y", y).attr("dy", dy + "em");
            
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", -10).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

    d3.select(containerSelector).selectAll("*").remove();

    const svg = d3.select(containerSelector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const maxCount = d3.max(data, d => d.count);
    
    if (isRotated) {
        // Horizontal Bars
        const x = d3.scaleLinear().domain([0, Math.max(maxCount, 1)]).range([0, width]);
        const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
        // For small counts, use exact integer ticks
        if (maxCount <= 10) {
            xAxis.tickValues(d3.range(0, maxCount + 1));
        }
        svg.append("g").attr("transform", `translate(0,${height})`).call(xAxis);

        const y = d3.scaleBand().range([height, 0]).domain(data.map(d => d.category)).padding(0.1);
        svg.append("g").call(d3.axisLeft(y))
            .selectAll(".tick text")
            .call(wrap, margin.left - 20); // Wrap text to fit in left margin

        svg.selectAll(".bar").data(data).join("rect")
            .attr("class", "bar")
            .attr("x", x(0))
            .attr("y", d => y(d.category))
            .attr("height", y.bandwidth())
            .attr("width", d => x(d.count));

        svg.selectAll(".text").data(data).enter().append("text")
          .attr("x", d => x(d.count) + 5)
          .attr("y", d => y(d.category) + y.bandwidth() / 2 + 5)
          .text(d => d.count);
    } else {
        // Vertical Bars
        const x = d3.scaleBand().range([ 0, width ]).domain(data.map(d => d.category)).padding(0.2);
        svg.append("g").attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text").attr("transform", "translate(-10,0)rotate(-45)").style("text-anchor", "end").style("font-size", "14px");

        const y = d3.scaleLinear().domain([0, Math.max(maxCount, 1)]).range([ height, 0]);
        const yAxis = d3.axisLeft(y).tickFormat(d3.format("d")).tickSizeOuter(0);
        // For small counts, use exact integer ticks
        if (maxCount <= 10) {
            yAxis.tickValues(d3.range(0, maxCount + 1));
        }
        svg.append("g").call(yAxis);

        svg.selectAll(".bar").data(data).join("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.category))
            .attr("width", x.bandwidth())
            .attr("y", d => y(d.count))
            .attr("height", d => height - y(d.count));
        
        svg.selectAll(".text").data(data).enter().append("text")
          .attr("x", d => x(d.category) + x.bandwidth() / 2)
          .attr("y", d => y(d.count) - 5)
          .attr("text-anchor", "middle")
          .text(d => d.count);
    }
}