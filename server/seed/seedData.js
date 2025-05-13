export const roles = [
  {
    name: "Sales Manager",
    description: "Responsible for qualifying leads, handling objections, and closing deals through effective conversation analysis."
  },
  {
    name: "Customer Support Specialist",
    description: "Ensures customer issues are resolved efficiently and empathetically by analyzing support conversations."
  },
  {
    name: "Recruiter",
    description: "Analyzes candidate interviews to assess motivation, skills, and fit for the company."
  },
  {
    name: "SMM Specialist",
    description: "Monitors brand mentions, feedback, and engagement opportunities in social conversations."
  },
  {
    name: "Team Lead",
    description: "Oversees team communication, process compliance, and coaching opportunities through conversation analysis."
  }
];

export const sops = [
  // Sales Manager SOPs
  {
    role_name: "Sales Manager",
    name: "Lead Qualification SOP",
    goal: "Determine if the lead matches the ideal customer profile.",
    steps: [
      "Identify questions about the client's needs.",
      "Check for mentions of budget, timeline, and decision authority.",
      "Mark signs of interest or objections."
    ],
    analysis_target: "Signs of ICP fit, budget, timeline, decision-making."
  },
  {
    role_name: "Sales Manager",
    name: "Objection Handling SOP",
    goal: "Evaluate how objections are handled during the call.",
    steps: [
      "Find objections raised by the client.",
      "Check if the manager clarifies the reason for objection.",
      "Mark if relevant arguments are provided."
    ],
    analysis_target: "Objection handling quality, client reactions."
  },
  {
    role_name: "Sales Manager",
    name: "Next Steps Confirmation SOP",
    goal: "Ensure next steps are agreed upon at the end of the call.",
    steps: [
      "Locate the final part of the conversation.",
      "Check if next actions are agreed upon.",
      "Mark who is responsible for the next step."
    ],
    analysis_target: "Clarity of agreements, responsibility."
  },
  {
    role_name: "Sales Manager",
    name: "Product Value Communication SOP",
    goal: "Check if the product value is clearly communicated.",
    steps: [
      "Identify how the product is described.",
      "Mark if key benefits are mentioned.",
      "Check if the presentation matches client needs."
    ],
    analysis_target: "Value communication, relevance."
  },
  {
    role_name: "Sales Manager",
    name: "Closing Techniques SOP",
    goal: "Assess how the manager attempts to close the deal.",
    steps: [
      "Find final questions or proposals.",
      "Check if the manager asks for a decision or next step.",
      "Mark the client's response."
    ],
    analysis_target: "Closing techniques, call outcome."
  },

  // Customer Support Specialist SOPs
  {
    role_name: "Customer Support Specialist",
    name: "Issue Identification SOP",
    goal: "Ensure the customer's issue is clearly identified.",
    steps: [
      "Find the customer's problem description.",
      "Mark clarifying questions from the specialist.",
      "Check if the issue is clearly formulated."
    ],
    analysis_target: "Information gathering, clarity."
  },
  {
    role_name: "Customer Support Specialist",
    name: "Empathy Demonstration SOP",
    goal: "Evaluate if empathy is shown during the conversation.",
    steps: [
      "Identify supportive or understanding phrases.",
      "Mark if the specialist apologizes for inconvenience.",
      "Check for positive client reactions."
    ],
    analysis_target: "Empathy, client response."
  },
  {
    role_name: "Customer Support Specialist",
    name: "Solution Clarity SOP",
    goal: "Check if the solution is explained clearly.",
    steps: [
      "Find the solution explanation.",
      "Mark if step-by-step instructions are given.",
      "Check if the client confirms understanding."
    ],
    analysis_target: "Solution clarity, feedback."
  },
  {
    role_name: "Customer Support Specialist",
    name: "Escalation SOP",
    goal: "Ensure proper escalation of complex issues.",
    steps: [
      "Identify unresolved or complex questions.",
      "Check if escalation is offered.",
      "Mark if the client is informed about next steps."
    ],
    analysis_target: "Escalation procedure compliance."
  },
  {
    role_name: "Customer Support Specialist",
    name: "Follow-up SOP",
    goal: "Ensure follow-up support is offered.",
    steps: [
      "Find final statements.",
      "Mark if further assistance is offered.",
      "Check if contact information is provided."
    ],
    analysis_target: "Conversation closure, care."
  },

  // Recruiter SOPs
  {
    role_name: "Recruiter",
    name: "Candidate Motivation SOP",
    goal: "Identify the candidate's motivation for job change.",
    steps: [
      "Find questions about reasons for job search.",
      "Mark the candidate's answers.",
      "Check if answers match job requirements."
    ],
    analysis_target: "Motivation, expectation fit."
  },
  {
    role_name: "Recruiter",
    name: "Skills Verification SOP",
    goal: "Verify if the candidate has required skills.",
    steps: [
      "Identify questions about experience and skills.",
      "Mark specific examples from experience.",
      "Check if skills match requirements."
    ],
    analysis_target: "Relevant experience, hard/soft skills."
  },
  {
    role_name: "Recruiter",
    name: "Cultural Fit SOP",
    goal: "Assess if the candidate fits the company culture.",
    steps: [
      "Find questions about values and work style.",
      "Mark the candidate's answers.",
      "Check if answers match company values."
    ],
    analysis_target: "Value match, communication style."
  },
  {
    role_name: "Recruiter",
    name: "Salary Expectation SOP",
    goal: "Identify the candidate's salary expectations.",
    steps: [
      "Find questions about salary expectations.",
      "Mark the candidate's answer.",
      "Check if expectations fit the company's budget."
    ],
    analysis_target: "Salary numbers, candidate flexibility."
  },
  {
    role_name: "Recruiter",
    name: "Next Steps SOP",
    goal: "Ensure the candidate understands the next steps.",
    steps: [
      "Find final statements.",
      "Mark if next stages are explained.",
      "Check if the candidate agrees with the plan."
    ],
    analysis_target: "Communication clarity, candidate understanding."
  },

  // SMM Specialist SOPs
  {
    role_name: "SMM Specialist",
    name: "Brand Mention SOP",
    goal: "Identify brand mentions in the conversation.",
    steps: [
      "Find all brand or product mentions.",
      "Mark the context (positive/negative).",
      "Check for interlocutor's reaction."
    ],
    analysis_target: "Frequency, context, brand reaction."
  },
  {
    role_name: "SMM Specialist",
    name: "Customer Feedback SOP",
    goal: "Collect customer feedback about the product or service.",
    steps: [
      "Identify product evaluation phrases.",
      "Mark positive and negative feedback.",
      "Check for improvement suggestions."
    ],
    analysis_target: "Sentiment, suggestions."
  },
  {
    role_name: "SMM Specialist",
    name: "Crisis Signal SOP",
    goal: "Identify potential crisis or negative signals.",
    steps: [
      "Find negative mentions or complaints.",
      "Mark if negativity is repeated.",
      "Check for calls to action (boycott, complaints)."
    ],
    analysis_target: "Crisis signs, negativity repetition."
  },
  {
    role_name: "SMM Specialist",
    name: "Influencer Mention SOP",
    goal: "Identify influencer or opinion leader mentions.",
    steps: [
      "Find names of well-known people.",
      "Mark the context of the mention.",
      "Check for audience reaction."
    ],
    analysis_target: "Influence, interlocutor reaction."
  },
  {
    role_name: "SMM Specialist",
    name: "Engagement Opportunity SOP",
    goal: "Identify opportunities for audience engagement.",
    steps: [
      "Find unanswered questions.",
      "Mark engagement suggestions.",
      "Check for content ideas."
    ],
    analysis_target: "Engagement moments, content ideas."
  },

  // Team Lead SOPs
  {
    role_name: "Team Lead",
    name: "Coaching Opportunity SOP",
    goal: "Identify coaching moments for team members.",
    steps: [
      "Find mistakes or uncertainty in answers.",
      "Mark how the employee reacts to difficult questions.",
      "Check for improvement opportunities."
    ],
    analysis_target: "Coaching moments, challenge response."
  },
  {
    role_name: "Team Lead",
    name: "Process Compliance SOP",
    goal: "Check compliance with company standards.",
    steps: [
      "Identify key process stages.",
      "Mark if all SOPs are followed.",
      "Check for deviations from the standard."
    ],
    analysis_target: "SOP compliance, process violations."
  },
  {
    role_name: "Team Lead",
    name: "Conflict Resolution SOP",
    goal: "Identify and analyze conflict situations.",
    steps: [
      "Find signs of conflict in the conversation.",
      "Mark how the situation is resolved.",
      "Check if a compromise is reached."
    ],
    analysis_target: "Conflict signs, resolution effectiveness."
  },
  {
    role_name: "Team Lead",
    name: "Motivation Check SOP",
    goal: "Assess employee motivation level.",
    steps: [
      "Identify mentions of satisfaction/dissatisfaction.",
      "Mark positive/negative signals.",
      "Check for improvement suggestions."
    ],
    analysis_target: "Motivational signals, suggestions."
  },
  {
    role_name: "Team Lead",
    name: "Feedback Quality SOP",
    goal: "Check the quality of employee feedback.",
    steps: [
      "Find feedback fragments.",
      "Mark if feedback is constructive.",
      "Check if feedback is considered in the conversation."
    ],
    analysis_target: "Constructiveness, conversation impact."
  }
];