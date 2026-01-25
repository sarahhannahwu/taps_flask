"""
Response orderings for survey questions.
"""

RESPONSE_ORDERINGS = {
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
        "None of it"
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
    # Numeric orderings
    "AMOUNT": [
        "0-1",
        "1-2",
        "2-3",
        "3-4",
        "4-5",
        "5-6",
        "6-7",
        "7-8",
        "8-9",
        "9-10",
        "10+"
    ],
    "PERCENT": None,
}
