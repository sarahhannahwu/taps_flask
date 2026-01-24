# analysis.py
import pandas as pd
import numpy as np
import re
import json
import io
import csv
from collections import OrderedDict

# Order definitions - source of truth for response option ordering
ORDER_DEFINITIONS = {
    "NO_YES": [
        "No",
        "Yes"
    ],
    "PHONE_USE_ORDER": [
        "Less than 1 hour",
        "1 hour to less than 2",
        "2 hours to less than 3",
        "3 hours to less than 4",
        "4 hours to less than 5",
        "5 hours to less than 6",
        "6 hours to less than 7",
        "7 hours to less than 8",
        "More than 8 hours"
    ],
    "PHONE_WHEN_ORDER": [
        "During class",
        "At lunch time",
        "At recess",
        "Each teacher/staff member decides",
        "Never (only before the first bell and after the last bell)",
        "I do not know",
        "Other:"
    ],
    "PHONE_WHERE_ORDER": [
        "No phones in building or on campus",
        "Students put their phones in a bag/container at the beginning of the school day",
        "Students keep their phones on their person in a locked pouch (such as a Yondr)",
        "Students keep their phones in their lockers (lockers only)",
        "Each teacher collects students' phones and students get them back at the end of class",
        "Students keep their phones, but phones must be out of sight ('no-show')",
        "I do not know",
        "Other:"
    ],
    "AGREEMENT_ORDER": [
        "Strongly agree",
        "Somewhat agree",
        "Neither agree nor disagree",
        "Somewhat disagree",
        "Strongly disagree"
    ],
    "APPLY_ORDER": [
        "Definitely applies",
        "Applies somewhat",
        "Neutral; not sure",
        "Does not really apply",
        "Definitely does not apply"
    ],
    "FREQUENCY_ORDER": [
        "Always",
        "Most days",
        "Most of the time",
        "About half the time",
        "Often",
        "About once a week",
        "Sometimes",
        "Less than once a week",
        "Rarely",
        "Never",
        "This did not happen to me"
    ],
    "RESTRICTIVENESS_ORDER": [
        "The policy should be much more restrictive",
        "The policy should be a little more restrictive",
        "The policy is just right",
        "The policy should be a little less restrictive",
        "The policy should be much less restrictive",
        "I prefer not to answer",
        "No Response"
    ],
    "INTENSITY_ORDER": [
        "Extremely",
        "Very",
        "Moderately",
        "Somewhat",
        "Slightly",
        "Not at all"
    ],
    "HRS_SLEEP_ORDER": [
        "Less than 1 hour",
        "1 hour to less than 2",
        "2 hours to less than 3",
        "3 hours to less than 4",
        "4 hours to less than 5",
        "5 hours to less than 6",
        "6 hours to less than 7",
        "7 hours to less than 8",
        "8 hours to less than 9",
        "9 hours to less than 10",
        "10 hours to less than 11",
        "11 hours to less than 12",
        "12 or more hours"
    ],
    "DAYS_SLEPT_POORLY_ORDER": [
        "0",
        "1-2",
        "3-4",
        "5-6",
        "7-8",
        "9-10",
        "11-12",
        "13-14"
    ],
    "SCHOOL_UNSAFE_ORDER": [
        "0",
        "1-3",
        "4-6",
        "7-9",
        "10-12",
        "13-15",
        "16-18",
        "19-21",
        "22-24",
        "25-27",
        "28-30"
    ],
    "QUALITY_ORDER": [
        "Very good",
        "Good",
        "Okay",
        "Bad",
        "Very bad"
    ],
    "UPSET_ORDER": [
        "Very upsetting",
        "A bit upsetting",
        "Not upsetting",
        "Does not apply to me (N/A)"
    ],
    "LUNCH_ORDER": [
        "All of it",
        "Most of it",
        "Some of it",
        "None of it",
    ],
    "GENDER_ORDER": [
        "Male",
        "Female",
        "Non-binary",
        "Prefer to self-describe",
        "I prefer not to answer"
    ],
    "RACE_ORDER": [
        "American Indian/Alaska Native", 
        "Asian", 
        "Black", 
        "Hispanic or Latino", 
        "Pacific Islander", 
        "White", 
        "Two or more races"
    ],
    "GRADE_ORDER": [
        "K", 
        "1", 
        "2",
        "3", 
        "4", 
        "5", 
        "6", 
        "7", 
        "8", 
        "9", 
        "10",
        "11", 
        "12", 
        "I prefer not to answer"
    ],
    "PERCENTAGE_ORDER": "numeric"  # Special marker for numeric percentage sorting
}

def apply_response_ordering(col, response_dict, question_attrs=None):
    """
    Applies the appropriate ordering to response options based on column content.
    Returns ordered list of categories or original dict if no match.
    Handles percentage columns by extracting and sorting numeric values.
    """
    col_lower = col.lower()
    
    # Check for percentage columns by detecting "give your best guess" or actual % in responses
    if "give your best guess" in col_lower:
        return sort_percentage_responses(response_dict)
    
    # Check if any responses contain % symbol (percentage responses)
    has_percentage = any("%" in str(category) for category in response_dict.keys())
    if has_percentage:
        return sort_percentage_responses(response_dict)
    
    # If question attributes provided, prefer them (explicit ordering key)
    order = None
    if question_attrs:
        # question_attrs may specify a response ordering key that matches ORDER_DEFINITIONS
        resp_order_key = question_attrs.get("response_ordering") if isinstance(question_attrs, dict) else None
        if resp_order_key:
            # If ordering is a special numeric marker
            if resp_order_key in ("GRADE_ORDER", "PERCENTAGE_ORDER"):
                if resp_order_key == "GRADE_ORDER":
                    return sort_grade_responses(response_dict)
                if resp_order_key == "PERCENTAGE_ORDER":
                    return sort_percentage_responses(response_dict)
            # Otherwise try to fetch an order definition
            order = ORDER_DEFINITIONS.get(resp_order_key)

    # If no explicit attribute ordering, fall back to legacy heuristic matching
    if order is None:
        if any(word in col_lower for word in ["agree", "satisfaction", "satisfied", "support", "care", "respect", "connected"]):
            order = ORDER_DEFINITIONS["AGREEMENT_ORDER"]
        elif any(word in col_lower for word in ["apply", "applies"]):
            order = ORDER_DEFINITIONS["APPLY_ORDER"]
        elif any(word in col_lower for word in ["often", "frequency", "how often", "occurs", "drains", "drained", "burned"]):
            order = ORDER_DEFINITIONS["FREQUENCY_ORDER"]
        elif any(word in col_lower for word in ["restrictive", "restrict"]):
            order = ORDER_DEFINITIONS["RESTRICTIVENESS_ORDER"]
        elif any(word in col_lower for word in ["important", "integration", "stress", "stressful"]):
            order = ORDER_DEFINITIONS["INTENSITY_ORDER"]
        elif any(word in col_lower for word in ["gender"]):
            order = ORDER_DEFINITIONS["GENDER_ORDER"]
        elif any(word in col_lower for word in ["grade"]):
            # Grade sorting extracts numeric values from user-entered grades
            return sort_grade_responses(response_dict)
        else:
            # No matching order, sort by frequency (descending) as default
            return sort_by_frequency(response_dict)
    
    # Apply ordering with partial matching for INTENSITY_ORDER
    if order == ORDER_DEFINITIONS["INTENSITY_ORDER"]:
        # Use partial matching for intensity levels (e.g., "Extremely stressful" matches "Extremely")
        ordered_categories = []
        for intensity_level in order:
            for cat in response_dict.keys():
                if intensity_level.lower() in cat.lower() and cat not in ordered_categories:
                    ordered_categories.append(cat)
                    break
        other_categories = [cat for cat in response_dict.keys() if cat not in ordered_categories]
    else:
        # Exact matching for all other order types
        ordered_categories = [cat for cat in order if cat in response_dict]
        other_categories = [cat for cat in response_dict.keys() if cat not in order]
    
    # Return as ordered dict
    ordered_dict = OrderedDict()
    for cat in ordered_categories + other_categories:
        ordered_dict[cat] = response_dict[cat]
    return ordered_dict

def sort_percentage_responses(response_dict):
    """
    Sorts percentage responses by extracting the numeric percentage value (digits before %).
    Handles responses like "0% (No one)", "10%", "20%", etc.
    Handles mixed percentage and non-percentage responses.
    """
    def extract_percentage_value(s):
        """Extract digits that come before the % sign."""
        match = re.search(r'(\d+)%', str(s))
        return int(match.group(1)) if match else -1
    
    # Separate percentage and non-percentage categories
    percentage_categories = []
    non_percentage_categories = []
    
    for category in response_dict.keys():
        num = extract_percentage_value(category)
        if num >= 0:
            percentage_categories.append((num, category))
        else:
            non_percentage_categories.append(category)
    
    # Sort percentage categories numerically by extracted percentage value
    percentage_categories.sort(key=lambda x: x[0])
    
    # Build ordered dict: percentages first (numeric order), then others
    ordered_dict = OrderedDict()
    for _, category in percentage_categories:
        ordered_dict[category] = response_dict[category]
    for category in non_percentage_categories:
        ordered_dict[category] = response_dict[category]
    
    return ordered_dict

def sort_by_frequency(response_dict):
    """
    Sorts responses by frequency (count) in descending order.
    Used as default ordering for columns without specific order definitions.
    """
    # Sort by count value in descending order
    sorted_dict = OrderedDict(sorted(response_dict.items(), key=lambda x: x[1], reverse=True))
    return sorted_dict

def sort_grade_responses(response_dict):
    """
    Sorts grade responses by extracting numeric values.
    Handles user-entered grades like "10", "Grade 5", "K", "5th", etc.
    """
    def extract_grade_number(s):
        """Extract numeric grade value from text like 'Grade 5', '5th', 'K', '10', etc."""
        s_lower = str(s).lower().strip()
        
        # Handle kindergarten
        if s_lower == 'k' or s_lower == 'kindergarten':
            return 0
        
        # Extract first occurrence of digits
        match = re.search(r'(\d+)', s_lower)
        if match:
            return int(match.group(1))
        
        # No numeric value found
        return -1
    
    # Separate numeric grades and non-numeric responses
    grade_categories = []
    non_grade_categories = []
    
    for category in response_dict.keys():
        num = extract_grade_number(category)
        if num >= 0:
            grade_categories.append((num, category))
        else:
            non_grade_categories.append(category)
    
    # Sort grades numerically
    grade_categories.sort(key=lambda x: x[0])
    
    # Build ordered dict: grades first (numeric order), then others
    ordered_dict = OrderedDict()
    for _, category in grade_categories:
        ordered_dict[category] = response_dict[category]
    for category in non_grade_categories:
        ordered_dict[category] = response_dict[category]
    
    return ordered_dict

def detect_survey_type(df):
    """
    Detects the survey type based on column names.
    Returns one of: 'student', 'parent', 'teacher', 'admin'
    """
    columns_str = ' '.join([col.lower() for col in df.columns])

def detect_survey_type(df):
    """
    Detects the survey type based on column names.
    Returns one of: 'student', 'parent', 'teacher', 'admin'
    """
    columns_str = ' '.join([col.lower() for col in df.columns])
    
    # Teacher-specific columns
    if any('area(s) taught' in col.lower() for col in df.columns) or \
       any('how many total years of experience do you have working in education' in col.lower() for col in df.columns) or \
       any('integration of technology to your everyday teaching practices' in col.lower() for col in df.columns):
        return 'teacher'
    
    # Admin-specific columns (if applicable)
    if (
        any('administrator' in col.lower() for col in df.columns) or 
        any('title i' in col.lower() for col in df.columns) or 
        any('average daily attendance' in col.lower() or 'ada' in col.lower() for col in df.columns) or 
        any('suspension rate' in col.lower() for col in df.columns) or 
        any('bullying incidents' in col.lower() or 'cyberbullying' in col.lower() for col in df.columns)
    ):
        return 'admin'
    
    # Parent-specific columns (if applicable)
    if any('my child' in col.lower() for col in df.columns) or any('your child' in col.lower() for col in df.columns):
        return 'parent'
    
    # Student survey (has grade and gender columns)
    if any('what grade are you in' in col.lower() for col in df.columns) or \
       any('what is your gender' in col.lower() for col in df.columns):
        return 'student'
    
    # Default fallback
    return 'student'


def load_question_attributes(source):
    """
    Load question attributes from a file path or file-like object.
    Supports JSON (dict or list of records) or CSV with columns like: id,text,data_type,display_type,response_ordering
    Returns a mapping of keys (lowered question text and id when available) to attribute dicts.
    """
    if not source:
        return {}

    # Read text from path or file-like
    text = None
    if hasattr(source, 'read'):
        try:
            text = source.read()
        except Exception:
            # If reading fails, try to access .name and open
            if hasattr(source, 'name'):
                with open(source.name, 'r', encoding='utf-8') as f:
                    text = f.read()
    else:
        # treat as path
        try:
            with open(source, 'r', encoding='utf-8') as f:
                text = f.read()
        except Exception:
            return {}

    if text is None:
        return {}

    # Try JSON
    try:
        parsed = json.loads(text)
        attrs = {}
        if isinstance(parsed, dict):
            # assume mapping from question text or id to attr dict
            for k, v in parsed.items():
                if isinstance(k, str):
                    attrs[k.lower().strip()] = v
        elif isinstance(parsed, list):
            # list of records
            for rec in parsed:
                if not isinstance(rec, dict):
                    continue
                # prefer 'text' as key, fall back to 'id'
                key = rec.get('text') or rec.get('id')
                if key:
                    attrs[str(key).lower().strip()] = rec
        return attrs
    except Exception:
        pass

    # Try CSV
    try:
        attrs = {}
        reader = csv.DictReader(io.StringIO(text))
        for row in reader:
            # accept multiple possible key column names
            key = row.get('text') or row.get('question_text') or row.get('question') or row.get('id') or row.get('unique_id')
            if not key:
                continue
            # clean up row: strip empty values
            clean_row = {k: (v if v != '' else None) for k, v in row.items()}
            text_key = str(clean_row.get('question_text') or clean_row.get('text') or key).lower().strip()
            id_key = str(clean_row.get('unique_id') or clean_row.get('id') or key).lower().strip()
            # store by both text and id when available
            attrs[text_key] = clean_row
            attrs[id_key] = clean_row
        return attrs
    except Exception:
        return {}


def find_question_attr_for_column(col, attrs_map):
    """Return attribute dict for a column by exact or substring matching against attrs_map keys."""
    if not attrs_map:
        return None
    col_key = str(col).lower().strip()
    # Normalize function: remove non-alphanumeric for safer id matching
    def normalize(s):
        return re.sub(r'[^a-z0-9]', '', s.lower()) if s else ''

    norm_col = normalize(col_key)

    # 1) Exact key match
    if col_key in attrs_map:
        return attrs_map[col_key]

    # 2) Normalized exact match (handles 'Q3' vs 'q3', punctuation)
    for k, v in attrs_map.items():
        if normalize(k) and normalize(k) == norm_col:
            return v

    # 3) Safe substring matching for longer keys (prefer question text matches)
    for k, v in attrs_map.items():
        # only consider textual keys longer than a small threshold to avoid id substring collisions
        if len(k) >= 8 and k in col_key:
            return v

    # 4) As a last resort, match if column contains a significant portion of the key
    for k, v in attrs_map.items():
        if len(k) >= 8 and col_key in k:
            return v

    return None

def process_taps_data(file_stream, question_attributes=None):
    """
    Reads the CSV, cleans it, and returns a dictionary with:
      - num_rows
      - num_columns
      - survey_type: detected survey type
      - responses: { "Column Name": {"Category": Count, ...} }
      - summary_stats: { "Column Name": { "mean": X, "min": Y, "max": Z } }
    """
    try:
        df = pd.read_csv(file_stream)
    except Exception as e:
        raise ValueError(f"Could not read CSV file: {e}")
    
    # Load question attributes (if provided)
    if isinstance(question_attributes, dict):
        attrs_map = {k.lower().strip(): v for k, v in question_attributes.items()}
    else:
        attrs_map = load_question_attributes(question_attributes)

    # Detect survey type
    survey_type = detect_survey_type(df)

    responses = {}
    summary_stats = {}

    for col in df.columns:
        if col == "Timestamp":
            continue
        # Skip placeholder columns marked for schools to customize
        if "[school to add]" in str(col).lower():
            continue
        # Skip broad-stem and stress questions not desired in analysis
        lower_col = str(col).lower()
        if "in general" in lower_col:
            continue
        if "stress at school" in lower_col:
            continue
        if "in this school" in lower_col:
            continue
        if "is this school public, private, or another category" in lower_col:
            continue
        if "is this school eligible for title" in lower_col:
            continue
        if "Please indicate how strongly you agree or disagree with the following statements about your experience as a teacher at this school." in col:
            continue
        if "Please rate the extent to which you agree with the following statements about your relationships with the administration at your school." in col:
            continue
        if "Please rate how often you experience the following:" in col:
            continue
            
        # --- 1. NUMERIC STATISTICS ---
        # Time spent on phone (hours) style questions
        if "time" in col.lower() and "spend" in col.lower():
            numeric_series = pd.to_numeric(df[col], errors='coerce')
            if not numeric_series.dropna().empty:
                summary_stats[col] = {
                    "mean": float(numeric_series.mean()),
                    "sd": float(numeric_series.std(ddof=1)) if numeric_series.dropna().shape[0] > 1 else 0.0,
                    "min": float(numeric_series.min()),
                    "max": float(numeric_series.max())
                }
            # Do not generate a categorical chart for phone time questions
            # Skip adding to responses so no graph is created on the frontend
            continue

        # Teacher experience (years) question
        if "how many total years of experience do you have working in education" in col.lower():
            numeric_series = pd.to_numeric(df[col], errors='coerce')
            if not numeric_series.dropna().empty:
                # Clean column name by removing "Years::" suffix
                clean_col_name = col.replace(" Years::", "").replace("Years::", "")
                summary_stats[clean_col_name] = {
                    "mean": float(numeric_series.mean()),
                    "sd": float(numeric_series.std(ddof=1)) if numeric_series.dropna().shape[0] > 1 else 0.0,
                    "min": float(numeric_series.min()),
                    "max": float(numeric_series.max())
                }
            # Do not generate a categorical chart for this numeric teacher experience column
            # Skip adding to responses so no graph is created on the frontend
            continue

        # Admin GPA question - parse user-provided mean and SD
        if "average gpa" in col.lower() and "standard deviation" in col.lower():
            # Parse format: extract all numeric values (handles commas, semicolons, etc.)
            gpa_values = []
            sd_values = []
            for val in df[col].dropna():
                try:
                    # Extract all numeric values (including decimals)
                    numbers = re.findall(r'\d+\.?\d*', str(val))
                    if len(numbers) >= 2:
                        gpa_values.append(float(numbers[0]))
                        sd_values.append(float(numbers[1]))
                except (ValueError, AttributeError, IndexError):
                    continue
            
            if gpa_values and sd_values:
                summary_stats["Average GPA"] = {
                    "mean": float(np.mean(gpa_values)),
                    "sd": float(np.mean(sd_values))
                }
            continue

        # Admin standardized test question - parse user-provided test name, mean, and SD
        if "average standardized test score" in col.lower() and "standard deviation" in col.lower():
            # Parse format: extract test name (text) and numeric values (handles any separator)
            test_names = []
            test_scores = []
            sd_values = []
            for val in df[col].dropna():
                try:
                    val_str = str(val)
                    # Extract all numeric values (including decimals)
                    numbers = re.findall(r'\d+\.?\d*', val_str)
                    # Extract test name: look for common test names or first word before numbers
                    test_name_match = re.search(r'([A-Za-z]+)', val_str)
                    test_name = test_name_match.group(1) if test_name_match else "Standardized Test"
                    
                    if len(numbers) >= 2:
                        test_names.append(test_name)
                        test_scores.append(float(numbers[0]))
                        sd_values.append(float(numbers[1]))
                except (ValueError, AttributeError, IndexError):
                    continue
            
            if test_scores and sd_values and test_names:
                # Use most common test name
                from collections import Counter
                most_common_test = Counter(test_names).most_common(1)[0][0] if test_names else "Standardized Test"
                summary_stats[f"Average {most_common_test} Score"] = {
                    "mean": float(np.mean(test_scores)),
                    "sd": float(np.mean(sd_values))
                }
            continue

        # Parent/admin numeric fields
        lower_col = col.lower()
        if (
            "number of times per day" in lower_col or
            "average daily attendance" in lower_col or
            " ada" in lower_col or lower_col.startswith("ada:") or
            "suspension rate" in lower_col or
            "number of incidents" in lower_col or
            "number of fights" in lower_col or
            "mental health referrals" in lower_col
        ):
            numeric_series = pd.to_numeric(df[col], errors='coerce')
            if not numeric_series.dropna().empty:
                summary_stats[col] = {
                    "mean": float(numeric_series.mean()),
                    "sd": float(numeric_series.std(ddof=1)) if numeric_series.dropna().shape[0] > 1 else 0.0,
                    "min": float(numeric_series.min()),
                    "max": float(numeric_series.max())
                }
            # Skip adding to responses for numeric columns to avoid categorical bars
            continue

        # --- 2. CATEGORICAL COUNTS (For Charts) ---
        # Fill empty cells with "No Response" so they show up in the chart
        clean_series = df[col].fillna("No Response")

        # Ensure strings BEFORE using .str accessors
        clean_series = clean_series.astype(str)
        
        # Skip rows where the response itself is the placeholder text
        clean_series = clean_series[~clean_series.str.lower().str.contains("\[school to add\]")]

        # Merge "Neither agree / disagree" variations if they exist
        clean_series = clean_series.replace("Neither agree / disagree", "Neither agree nor disagree")

        # Get counts
        counts = clean_series.value_counts()
        
        # Convert to a simple dictionary preserving the pandas series order
        # Note: value_counts() returns a Series sorted by frequency (descending)
        response_dict = {}
        for category in counts.index:
            response_dict[category] = int(counts[category])
        
        # Determine if we have attributes for this question/column
        q_attrs = find_question_attr_for_column(col, attrs_map)

        # Apply ordering to response options (prefer explicit attrs when available)
        response_dict = apply_response_ordering(col, response_dict, question_attrs=q_attrs)
        
        # Convert to list format to preserve order through JSON serialization
        # Format: [{"category": "0%", "count": 5}, {"category": "10%", "count": 3}, ...]
        response_list = [{"category": cat, "count": count} for cat, count in response_dict.items()]
        
        responses[col] = response_list

    return {
        "num_rows": int(len(df)),
        "num_columns": int(len(df.columns)),
        "survey_type": survey_type,
        "responses": responses,
        "summary_stats": summary_stats,
        "order_definitions": ORDER_DEFINITIONS,
        "question_attributes": attrs_map
    }