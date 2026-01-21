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
    "Q30. What grade are you in? ",
    "Q33. What is your gender?",
    "Q1. Do you have a cell phone?",
    "Q2. If yes, is it a smartphone with apps and access to the internet?",
    "Q3. Do you feel you can contact your parent(s) in a timely manner when you need to during the school day? ",
    "Do you bring a phone to school?",
    "If you bring a phone to school, do you use it for school purposes, like classwork?",
    "If you bring a phone to school, do you use it for personal reasons, like social media or talking to friends?",
    "Q5. On an average school day (from when you arrive at school to when you leave), how much time do you spend using your phone? (in hours)",
    "Q7. Do you have a job? ",
    "Q10. Does your school have a phone policy? ",
    "Q12. How satisfied are you with your school's phone policy?",
    "Q14. How consistently do teachers and staff enforce your school's phone policy? Give your best guess. ",
    "Q15. What percentage of your classmates are using their phone when they shouldn't be? Give your best guess. ",
    "Q16. In your opinion, should your school's phone policy be more or less restrictive than it is now?",
    "Q17. In the following set of questions, we will ask about how you view your school experience. [In general, I pay attention in class.]",
    "Q17. In the following set of questions, we will ask about how you view your school experience. [I feel like I belong at school.]",
    "Q17. In the following set of questions, we will ask about how you view your school experience. [I often feel lonely at school.]",
    "Q17. In the following set of questions, we will ask about how you view your school experience. [In general, I enjoy going to school.]",
    "Q21. On school nights, how many hours of sleep do you usually get? (in hours) ",
    "Q23. During the past 7 days, on how many days were you physically active for a total of at least 60 minutes per day? (Add up all the time you spent in any kind of physical activity that increased your heart rate and made you breathe hard some of the time.)",
    "Q25. Now, here are some questions about you. [Overall, I am happy with myself.]",
    "Q26. In the past four weeks, how often have you experienced the following? [I have no energy for things.]",
    "Q26. In the past four weeks, how often have you experienced the following? [I feel sad or empty.]",
    "Q27. In recent weeks, how often have you experienced the following during school? [Someone teased you or called you names.]",
    "Q1. Overall, how would you say your school's phone policy has changed your school?",
    "Q2. Please rate your agreement with the following statements about your behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] … [I have focused better in class.]",
    "Q2. Please rate your agreement with the following statements about your behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] … [I have had fewer distractions.]",
    "Q2. Please rate your agreement with the following statements about your behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] … [I have felt closer to my friends.]",
    "Q2. Please rate your agreement with the following statements about your behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] … [I have felt less stressed.]",
    "Q2. Please rate your agreement with the following statements about your behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] … [My grades have improved.]"
];

const TEACHER_DISPLAY_ORDER = [
    "Q24. What grade level(s) do you primarily teach? ",
    "Q28. What is your gender?",
    "Q1. Currently, do you allow personal devices in your classroom to be used by students for educational purposes on a daily basis? ",
    "Q2. How important is the integration of technology to your everyday teaching practices?  (e.g., showing a YouTube video as an example, Google Classroom, Kahoot, etc.)",
    "Q3. Does your school have a phone policy?",
    "Q6. Overall, how satisfied are you with your school's phone policy? ",
    "Q7. How consistently do teachers and staff enforce your school's phone policy? Give your best guess. ",
    "Q8. What percentage of your students are using their phone when they shouldn't be? Give your best guess. ",
    "Q9. In your opinion, should your school's phone policy be more or less restrictive than it is now?",
    "Q12. Please rate the extent to which you agree that the following statements apply to your students.  A significant number of my students\u2026 [Seem interested in school]",
    "Q12. Please rate the extent to which you agree that the following statements apply to your students.  A significant number of my students\u2026 [Maintain positive and respectful relationships with each other]",
    "Q12. Please rate the extent to which you agree that the following statements apply to your students.  A significant number of my students\u2026 [Seem to care about grades]",
    "Q12. Please rate the extent to which you agree that the following statements apply to your students.  A significant number of my students\u2026 [Have good attendance]",
    "Q12. Please rate the extent to which you agree that the following statements apply to your students.  A significant number of my students\u2026 [Are respectful to staff]",
    "Q13. Please rate the extent to which the following statements apply to your relationship with your students in general.  [I share warm relationships with my students.]",
    "Q13. Please rate the extent to which the following statements apply to your relationship with your students in general.  [My students and I always seem to be struggling with each other.]",
    "Q13. Please rate the extent to which the following statements apply to your relationship with your students in general.  [Dealing with my students drains my energy.]",
    "Q14. Please indicate how often these behaviors occur from a significant number of your students. [Have difficulty staying on task]",
    "Q14. Please indicate how often these behaviors occur from a significant number of your students. [Are easily distracted]",
    "Q14. Please indicate how often these behaviors occur from a significant number of your students. [Act defiant when told to do something]",
    "Q15. Please read each statement and mark the response that best shows how much you agree. In this school\u2026 [Adults who work in this school care about the students.]",
    "Q15. Please read each statement and mark the response that best shows how much you agree. In this school\u2026 [Students feel safe.]",
    "Q15. Please read each statement and mark the response that best shows how much you agree. In this school\u2026 [The school rules are fair.]",
    "Q16. Please indicate how strongly you agree or disagree with the following statements about your experience as a teacher at this school.  [I am satisfied with my co-workers' competence.]",
    "Q16. Please indicate how strongly you agree or disagree with the following statements about your experience as a teacher at this school.  [I am satisfied with the behavior among my students.]",
    "Q16. Please indicate how strongly you agree or disagree with the following statements about your experience as a teacher at this school.  [I feel supported by my school's  administration with respect to our phone policy.]",
    "Q16. Please indicate how strongly you agree or disagree with the following statements about your experience as a teacher at this school.  [I enjoy teaching.]",
    "Q16. Please indicate how strongly you agree or disagree with the following statements about your experience as a teacher at this school.  [Teaching often drains my energy.]",
    "Q17. Please rate the extent to which you agree with the following statements about your relationships with the administration at your school. [I feel supported by the administration at my school.]",
    "Q19. Please rate your level of agreement with the following statements about your stress at school. I feel stressed for\u2026  [having to manage student behaviors.]",
    "Q19. Please rate your level of agreement with the following statements about your stress at school. I feel stressed for\u2026  [having too much teaching work to do.]",
    "Q19. Please rate your level of agreement with the following statements about your stress at school. I feel stressed for\u2026  [not being able to meet the diverse learning needs of my students.]",
    "Q20. Please rate how often you experience the following. [I feel emotionally drained from my work.]",
    "Q20. Please rate how often you experience the following. [I feel used up at the end of the workday.]",
    "Q20. Please rate how often you experience the following. [I feel burned out from my work.]",
    "Q1. Overall, how would you say this new phone policy has changed your school?",
    "Q2. Please rate your agreement with the following statements about your students' behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] \u2026 [Students seem more focused in class.]",
    "Q2. Please rate your agreement with the following statements about your students' behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] \u2026 [Students seem less distracted.]",
    "Q2. Please rate your agreement with the following statements about your students' behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] \u2026 [Students have developed better social skills.]",
    "Q2. Please rate your agreement with the following statements about your students' behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] \u2026 [Students have formed closer bonds with their peers.]",
    "Q2. Please rate your agreement with the following statements about your students' behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] \u2026 [There have been fewer discipline problems at my school.]",
    "Q2. Please rate your agreement with the following statements about your students' behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] \u2026 [Academic outcomes have improved.]",
];

const PARENT_DISPLAY_ORDER = [
    "Q1. What grade is your child in?",
    "Q16. What is the highest level of education you have completed?",
    "Q14. What is your relationship to the child whose school is administering this survey?",
    "Q2. Does your child have a cell phone? ",
    "Q3. At what age did your child get their first smartphone (with apps and can access the internet)? ",
    "Q4. What type of phone does your child use?",
    "Q5. Do they bring their phone to school?  ",
    "Q6. During a typical school day, how many times a day do you contact your child by phone (e.g., text messages, phone calls)?",
    "Q7. When you have conflicts with your child, how often are they related to their cell phone use? (e.g., screen time, boundaries, or access)",
    "Q8. Do you feel you can reach your child in a timely manner during the school day when needed? ",
    "Q9. In the past four weeks, how often has your child displayed the following behaviors? [Acted defiant or resistant to rules]",
    "Q9. In the past four weeks, how often has your child displayed the following behaviors? [Was easily distracted]",
    "Q9. In the past four weeks, how often has your child displayed the following behaviors? [Did not pay attention when directly spoken to]",
    "Q9. In the past four weeks, how often has your child displayed the following behaviors? [Rushed through tasks in order to get back to their phone]",
    "Q9. In the past four weeks, how often has your child displayed the following behaviors? [Slept with their phone in bedroom]",
    "Q10. Please rate how strongly you agree or disagree with the following statements about your child's teacher. (If your child has multiple teachers, please consider the one your family interacts with most frequently.) [We have a close and mutually respectful relationship.]",
    "Q10. Please rate how strongly you agree or disagree with the following statements about your child's teacher. (If your child has multiple teachers, please consider the one your family interacts with most frequently.) [I feel that the teacher pays attention to my suggestions and concerns.]",
    "Q10. Please rate how strongly you agree or disagree with the following statements about your child's teacher. (If your child has multiple teachers, please consider the one your family interacts with most frequently.) [My child's teacher is doing good things for my child.]",
    "Q11. In the last month, how often have you experienced the following?  [I've felt that I'm unable to control important aspects of my child's safety while they're at school.]",
    "Q11. In the last month, how often have you experienced the following?  [I've felt nervous or stressed about not being able to communicate with my child during school hours.]",
    "Q11. In the last month, how often have you experienced the following?  [I've felt confident in my ability to handle parenting challenges.]",
    "Q1. Please rate your agreement with the following statements about your child's behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] … [My child seems to be able to focus better.]",
    "Q1. Please rate your agreement with the following statements about your child's behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] … [My child has used their phone more before and after school.]",
    "Q1. Please rate your agreement with the following statements about your child's behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] … [My child seems to be in a better mood.]"
];

const ADMIN_DISPLAY_ORDER = [
    "Q27. What is your gender?",
    "Q26. How many total years of experience do you have working in education (any role)?",
    "Q1. Which of the following devices are restricted under your school's phone policy? Check all that apply.",
    "Q2. Under your school's phone policy, when are students allowed to use their phones at school? Select all that apply.",
    "Q3. How does your school restrict access to phones? Select all that apply.",
    "Q4. Has your school's phone policy changed since the previous academic year?",
    "Q5. How satisfied are you with your school's phone policy?",
    "Q6. How consistently do teachers and staff enforce your school's phone policy? Give your best guess.",
    "Q7. What percentage of your students are using their phone when they shouldn't be? Give your best guess.",
    "Q8. In your opinion, should your school's phone policy be more or less restrictive than it is now?",
    "Q10. Please indicate the level of stress you experience from each of the following aspects of your school's phone policy: [Complying with state, federal, and organizational rules and policies]",
    "Q10. Please indicate the level of stress you experience from each of the following aspects of your school's phone policy: [Trying to resolve parent/school conflicts]",
    "Q10. Please indicate the level of stress you experience from each of the following aspects of your school's phone policy: [Handling student discipline problems]",
    "Q11. How strongly do you agree or disagree with the following statements about this school? [I have positive relationships with the faculty at my school.]",
    "Q11. How strongly do you agree or disagree with the following statements about this school? [I have positive relationships with the parents/guardians of the kids at my school.]",
    "Q11. How strongly do you agree or disagree with the following statements about this school? [Overall, I have good relationships with the students at my school.]",
    "Q11. How strongly do you agree or disagree with the following statements about this school? [Dealing with the students at my school drains my energy.]",
    "Q11. How strongly do you agree or disagree with the following statements about this school? [Students are talking with each other between classes.]",
    "Q15. What is the average GPA at this school, including the standard deviation?",
    "Q16. What is the average standardized test score at this school, including the standard deviation? (Please specify the test used and average score.)",
    "Q17. For this school year, what is the Average Daily Attendance (ADA) percentage at this school? (Round to the nearest whole percent)",
    "Q18. For this school year, what is this school's suspension rate? (Round to the nearest whole percent)",
    "Q19. How many reported bullying incidents have there been this school year? ",
    "Q20. How many reported cyberbullying incidents have there been this school year? ",
    "Q21. For this school year, how many documented fights occurred at school?",
    "Q22.  For this school year, how many mental health referrals were recorded?",
    "Q1. Overall, how would you say this phone policy has changed your school?",
    "Q2. Please rate your agreement with the following statements about your students' behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] \u2026 [Students seem more focused in class.]",
    "Q2. Please rate your agreement with the following statements about your students' behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] \u2026 [Students seem less distracted.]",
    "Q2. Please rate your agreement with the following statements about your students' behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] \u2026 [Students have developed better social skills.]",
    "Q2. Please rate your agreement with the following statements about your students' behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] \u2026 [Students have formed closer bonds with their peers.]",
    "Q2. Please rate your agreement with the following statements about your students' behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] \u2026 [There have been fewer discipline problems at my school.]",
    "Q2. Please rate your agreement with the following statements about your students' behavior or feelings since the _____ [school to add] policy was introduced. \"Since the new phone policy that was introduced in _______ [school to add] \u2026 [Academic outcomes have improved.]",
];


function getSurveyConfigs() {
    return {
        "student": {
            displayOrder: STUDENT_DISPLAY_ORDER,
            openEndedColumns: [
                "Please share any other thoughts",
                "Is there anything else you want to share"
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
            displayOrder: PARENT_DISPLAY_ORDER,
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
            displayOrder: TEACHER_DISPLAY_ORDER,
            openEndedColumns: [
                "What challenges have you faced",
                "Do you have any suggestions for overcoming",
                "Please share any other major changes",
                "Please share any other thoughts",
                "Is there anything else you want to share"
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
            displayOrder: ADMIN_DISPLAY_ORDER,
            openEndedColumns: [
                "Overall, how would you say",
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
                "School Experience": 3,
                "School Metrics": 4,
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
        lower.includes("unable to control important aspects of my child's safety") ||
        lower.includes("warm relationships with my students") ||
        lower.includes("struggling with each other") ||
        lower.includes("formed closer bonds") ||
        lower.includes("left out or excluded")
    );

    const isTeacherSchoolClimate = (
        lower.includes("q12.") && lower.includes("significant number of my students") ||
        lower.includes("q13.") && lower.includes("relationship with your students") ||
        lower.includes("q15.") && lower.includes("in this school") ||
        lower.includes("adults who work in this school") ||
        lower.includes("students feel safe") ||
        lower.includes("school rules are fair") ||
        lower.includes("students are friendly")
    );

    const isTeacherExperience = (
        lower.includes("q16.") && lower.includes("experience as a teacher") ||
        lower.includes("q17.") && lower.includes("administration") ||
        lower.includes("q18.") && lower.includes("parents of your students") ||
        lower.includes("satisfied with my co-workers") ||
        lower.includes("feel supported by my school") ||
        lower.includes("feel supported by the administration") ||
        lower.includes("comfortable talking with") ||
        lower.includes("confidence in") ||
        lower.includes("enjoy teaching") ||
        lower.includes("i enjoy talking with")
    );

    const isTeacherStress = (
        lower.includes("q19.") && lower.includes("stress at school") ||
        lower.includes("q20.") && lower.includes("emotionally drained") ||
        lower.includes("feel used up") ||
        lower.includes("burned out from my work") ||
        lower.includes("feel stressed for") ||
        lower.includes("end of my rope")
    );

    const isParentChildBehavior = (
        lower.includes("q9.") && lower.includes("past four weeks") ||
        lower.includes("acted defiant or resistant") ||
        lower.includes("easily distracted") ||
        lower.includes("did not pay attention when directly spoken") ||
        lower.includes("rushed through tasks") ||
        lower.includes("slept with their phone")
    );

    const isParentTeacherRelationship = (
        lower.includes("q10.") && lower.includes("child's teacher") ||
        lower.includes("close and mutually respectful relationship") ||
        lower.includes("teacher pays attention to my suggestions")
    );

    const isParentStress = (
        lower.includes("q11.") && lower.includes("last month") ||
        lower.includes("unable to control important aspects of my child's safety") ||
        lower.includes("nervous or stressed about not being able to communicate")
    );

    const isPerceptionsOfSchool = (
        lower.includes("q11") &&
        lower.includes("how strongly do you agree or disagree with the following statements about this school")
    );

    const isPolicyStress = (
        lower.includes("q10") &&
        lower.includes("please indicate the level of stress you experience")
    );

    // School Metrics only for admin surveys (Q15-Q22)
    const isSchoolMetrics = (
        (lower.includes("q15") && lower.includes("average gpa")) ||
        (lower.includes("q16") && lower.includes("standardized test score")) ||
        (lower.includes("q17") && lower.includes("average daily attendance")) ||
        (lower.includes("q18") && lower.includes("suspension rate")) ||
        (lower.includes("q19") && lower.includes("bullying incidents")) ||
        (lower.includes("q20") && lower.includes("cyberbullying")) ||
        (lower.includes("q21") && lower.includes("fights")) ||
        (lower.includes("q22") && lower.includes("mental health referrals"))
    );

    if (isPolicyStress) return "Please indicate the level of stress you experience from each of the following aspects of your school's phone policy:";
    if (isPerceptionsOfSchool) return "School Experience";
    if (isSchoolMetrics) return "School Metrics";
    if (isDemographics) return "Demographics";
    if (isParentStress) return "Parental Stress & Concerns";
    if (isParentTeacherRelationship) return "Parent-Teacher Relationship";
    if (isParentChildBehavior) return "Child Behaviors";
    if (isTeacherStress) return "Teacher Stress & Burnout";
    if (isTeacherExperience) return "Teacher Experience & Support";
    if (isTeacherSchoolClimate) return "School Climate & Student Outcomes";
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

            if (currentSection && sectionsData[currentSection]) {
                sectionsData[currentSection].charts.push({
                    chartId,
                    displayColumn,
                    chartData,
                    column
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
                    renderD3BarChart(`#${chart.chartId}`, chart.chartData, chart.column);
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

function renderD3BarChart(containerSelector, data, column) {
    // Always use vertical bars: categories on x-axis, frequencies on y-axis
    const margin = {top: 20, right: 30, bottom: 180, left: 80};
    // Make width responsive to label count; ensure minimum width
    const baseWidth = Math.max(1000, data.length * 120);
    const width = baseWidth - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Helper function to wrap text - splits on whitespace and also handles explicit newlines
    function wrapLabels(text, width) {
        text.each(function() {
            const text = d3.select(this);
            const fullText = text.text();
            const words = fullText.split(/\s+/);
            let line = [];
            let lineNumber = 0;
            const lineHeight = 1.1; // ems
            const y = text.attr("y");
            const dy = parseFloat(text.attr("dy") || 0);
            
            text.text(null);
            let tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            
            words.forEach((word, i) => {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            });
        });
    }

    d3.select(containerSelector).selectAll("*").remove();

    const svg = d3.select(containerSelector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const maxCount = d3.max(data, d => d.count);
    
    // Vertical Bars: Categories on X-axis, Frequencies on Y-axis
    const x = d3.scaleBand().range([ 0, width ]).domain(data.map(d => d.category)).padding(0.2);
    svg.append("g").attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "14px")
        .call(wrapLabels, 80); // Wrap labels to fit in bottom margin

    const y = d3.scaleLinear().domain([0, Math.max(maxCount, 1)]).range([ height, 0]);
    const yAxis = d3.axisLeft(y).tickFormat(d3.format("d")).tickSizeOuter(0);
    // For small counts, use exact integer ticks
    if (maxCount <= 10) {
        yAxis.tickValues(d3.range(0, maxCount + 1));
    }
    svg.append("g").call(yAxis);

    // Add axis labels
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of responses");

    // Calculate total for percentage
    const totalCount = d3.sum(data, d => d.count);

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
      .style("font-size", "14px")
      .text(d => {
        const percentage = ((d.count / totalCount) * 100).toFixed(1);
        return percentage + "%";
      });
}