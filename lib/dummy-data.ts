// Utility functions to generate dummy data for jobs and candidates

// Job titles and departments
const jobTitles = [
  { title: "Frontend Developer", department: "Engineering" },
  { title: "Backend Engineer", department: "Engineering" },
  { title: "Full Stack Developer", department: "Engineering" },
  { title: "UX Designer", department: "Design" },
  { title: "Product Manager", department: "Product" },
  { title: "DevOps Engineer", department: "Operations" },
  { title: "Data Scientist", department: "Data" },
  { title: "Marketing Specialist", department: "Marketing" },
  { title: "Sales Representative", department: "Sales" },
  { title: "HR Coordinator", department: "Human Resources" },
]

// Locations
const locations = [
  "Remote",
  "New York, NY",
  "San Francisco, CA",
  "Austin, TX",
  "Seattle, WA",
  "Boston, MA",
  "Chicago, IL",
  "Los Angeles, CA",
  "Denver, CO",
  "Atlanta, GA",
]

// Employment types
const employmentTypes = ["Full-time", "Part-time", "Contract", "Internship"]

// Experience levels
const experienceLevels = ["Entry-Level", "Mid-Level", "Senior", "Lead", "Manager"]

// Candidate statuses
const candidateStatuses = ["New", "Reviewed", "Shortlisted", "Interviewed", "Rejected"]

// First names
const firstNames = [
  "James",
  "Mary",
  "John",
  "Patricia",
  "Robert",
  "Jennifer",
  "Michael",
  "Linda",
  "William",
  "Elizabeth",
  "David",
  "Barbara",
  "Richard",
  "Susan",
  "Joseph",
  "Jessica",
  "Thomas",
  "Sarah",
  "Charles",
  "Karen",
  "Christopher",
  "Nancy",
  "Daniel",
  "Lisa",
  "Matthew",
  "Margaret",
  "Anthony",
  "Betty",
  "Mark",
  "Sandra",
  "Donald",
  "Ashley",
  "Steven",
  "Dorothy",
  "Paul",
  "Kimberly",
  "Andrew",
  "Emily",
  "Joshua",
  "Donna",
  "Kenneth",
  "Michelle",
  "Kevin",
  "Carol",
  "Brian",
  "Amanda",
  "George",
  "Melissa",
  "Emma",
  "Noah",
  "Olivia",
  "Liam",
  "Ava",
  "Ethan",
  "Sophia",
  "Mason",
  "Isabella",
  "Lucas",
]

// Last names
const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Jones",
  "Brown",
  "Davis",
  "Miller",
  "Wilson",
  "Moore",
  "Taylor",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Martin",
  "Thompson",
  "Garcia",
  "Martinez",
  "Robinson",
  "Clark",
  "Rodriguez",
  "Lewis",
  "Lee",
  "Walker",
  "Hall",
  "Allen",
  "Young",
  "Hernandez",
  "King",
  "Wright",
  "Lopez",
  "Hill",
  "Scott",
  "Green",
  "Adams",
  "Baker",
  "Gonzalez",
  "Nelson",
  "Carter",
  "Mitchell",
  "Perez",
  "Roberts",
  "Turner",
  "Phillips",
  "Campbell",
  "Parker",
  "Evans",
  "Edwards",
  "Collins",
]

// Skills by category
const skillsByCategory = {
  engineering: [
    "JavaScript",
    "TypeScript",
    "React",
    "Angular",
    "Vue.js",
    "Node.js",
    "Express",
    "Python",
    "Django",
    "Flask",
    "Java",
    "Spring Boot",
    "C#",
    ".NET",
    "PHP",
    "Laravel",
    "Ruby",
    "Rails",
    "Go",
    "Rust",
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "Git",
    "REST API",
    "GraphQL",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "Elasticsearch",
    "Microservices",
    "TDD",
    "Agile",
    "Scrum",
  ],
  design: [
    "UI Design",
    "UX Design",
    "Figma",
    "Sketch",
    "Adobe XD",
    "Photoshop",
    "Illustrator",
    "InDesign",
    "User Research",
    "Wireframing",
    "Prototyping",
    "Design Systems",
    "Accessibility",
    "Typography",
    "Color Theory",
    "Responsive Design",
    "Motion Design",
    "Interaction Design",
    "Usability Testing",
  ],
  product: [
    "Product Strategy",
    "Roadmapping",
    "User Stories",
    "Market Research",
    "Competitive Analysis",
    "A/B Testing",
    "Analytics",
    "Product Lifecycle",
    "Agile",
    "Scrum",
    "Kanban",
    "JIRA",
    "Confluence",
    "Stakeholder Management",
    "Prioritization",
    "Product Discovery",
    "OKRs",
    "KPIs",
  ],
  data: [
    "Python",
    "R",
    "SQL",
    "Pandas",
    "NumPy",
    "Scikit-learn",
    "TensorFlow",
    "PyTorch",
    "Machine Learning",
    "Deep Learning",
    "NLP",
    "Computer Vision",
    "Data Visualization",
    "Tableau",
    "Power BI",
    "Statistics",
    "A/B Testing",
    "Big Data",
    "Hadoop",
    "Spark",
    "Data Warehousing",
    "ETL",
    "Data Modeling",
  ],
  marketing: [
    "Digital Marketing",
    "Content Marketing",
    "SEO",
    "SEM",
    "Social Media Marketing",
    "Email Marketing",
    "Marketing Automation",
    "Google Analytics",
    "Google Ads",
    "Facebook Ads",
    "Instagram Ads",
    "LinkedIn Ads",
    "CRM",
    "Hubspot",
    "Marketo",
    "Mailchimp",
    "Campaign Management",
    "Brand Strategy",
    "Copywriting",
  ],
  sales: [
    "Sales Strategy",
    "Lead Generation",
    "CRM",
    "Salesforce",
    "HubSpot",
    "Cold Calling",
    "Negotiation",
    "Account Management",
    "Sales Forecasting",
    "Pipeline Management",
    "Customer Acquisition",
    "B2B Sales",
    "B2C Sales",
    "SaaS Sales",
    "Enterprise Sales",
    "Solution Selling",
    "Closing Techniques",
    "Relationship Building",
  ],
  hr: [
    "Recruiting",
    "Talent Acquisition",
    "Onboarding",
    "Employee Relations",
    "Performance Management",
    "Compensation & Benefits",
    "HRIS",
    "Workday",
    "ATS",
    "Diversity & Inclusion",
    "Employee Engagement",
    "Training & Development",
    "Succession Planning",
    "HR Compliance",
    "Labor Laws",
    "Conflict Resolution",
  ],
  operations: [
    "DevOps",
    "SRE",
    "Infrastructure",
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "Terraform",
    "Ansible",
    "Jenkins",
    "CircleCI",
    "GitHub Actions",
    "Monitoring",
    "Prometheus",
    "Grafana",
    "ELK Stack",
    "Incident Management",
    "Disaster Recovery",
    "Security",
    "Networking",
    "Load Balancing",
    "Auto Scaling",
  ],
}

// Generate a random job description
function generateJobDescription(title: string): string {
  const descriptions = [
    `We are seeking a talented ${title} to join our team. The ideal candidate will have a passion for creating innovative solutions and a strong track record of delivering high-quality work. You will be working in a collaborative environment with opportunities to grow and develop your skills.`,
    `Join our dynamic team as a ${title}. In this role, you will be responsible for developing and implementing solutions that drive our business forward. We are looking for someone who is proactive, detail-oriented, and able to work effectively in a fast-paced environment.`,
    `Exciting opportunity for a ${title} to make an impact in a growing company. You will be working on challenging projects that require creative problem-solving and technical expertise. If you are passionate about your craft and eager to learn, we want to hear from you.`,
    `We are looking for an experienced ${title} to help us build and scale our products. The successful candidate will have a strong technical background, excellent communication skills, and the ability to work collaboratively with cross-functional teams.`,
    `Are you a ${title} who thrives in a fast-paced, innovative environment? We are seeking someone with a proven track record of success to join our team. You will have the opportunity to work on cutting-edge projects and make a significant impact on our business.`,
  ]

  return descriptions[Math.floor(Math.random() * descriptions.length)]
}

// Generate random job requirements based on job title
function generateJobRequirements(title: string): string {
  let category = "engineering"

  if (title.toLowerCase().includes("design")) {
    category = "design"
  } else if (title.toLowerCase().includes("product")) {
    category = "product"
  } else if (title.toLowerCase().includes("data")) {
    category = "data"
  } else if (title.toLowerCase().includes("market")) {
    category = "marketing"
  } else if (title.toLowerCase().includes("sales")) {
    category = "sales"
  } else if (title.toLowerCase().includes("hr") || title.toLowerCase().includes("human resources")) {
    category = "hr"
  } else if (title.toLowerCase().includes("devops") || title.toLowerCase().includes("ops")) {
    category = "operations"
  }

  const skills = skillsByCategory[category as keyof typeof skillsByCategory]
  const selectedSkills = []

  // Select 5-7 random skills
  const numSkills = Math.floor(Math.random() * 3) + 5 // 5-7 skills
  for (let i = 0; i < numSkills; i++) {
    const randomSkill = skills[Math.floor(Math.random() * skills.length)]
    if (!selectedSkills.includes(randomSkill)) {
      selectedSkills.push(randomSkill)
    }
  }

  // Format requirements as bullet points
  const requirements = selectedSkills.map((skill) => `• Experience with ${skill}`)

  // Add education and experience requirements
  requirements.push(`• Bachelor's degree in a relevant field`)
  requirements.push(
    `• ${Math.floor(Math.random() * 5) + 1}-${Math.floor(Math.random() * 5) + 5} years of experience in ${title}`,
  )
  requirements.push(`• Strong communication and collaboration skills`)
  requirements.push(`• Problem-solving mindset and attention to detail`)

  return requirements.join("\n")
}

// Generate random job responsibilities
function generateJobResponsibilities(title: string): string {
  const responsibilities = [
    `• Design, develop, and maintain high-quality applications`,
    `• Collaborate with cross-functional teams to define, design, and ship new features`,
    `• Identify and resolve performance and scalability issues`,
    `• Participate in code reviews and mentor junior team members`,
    `• Write clean, maintainable, and efficient code`,
    `• Troubleshoot and debug applications`,
    `• Stay up-to-date with industry trends and technologies`,
    `• Contribute to technical documentation and knowledge sharing`,
    `• Participate in agile ceremonies and sprint planning`,
    `• Work closely with product managers to understand requirements and provide technical insights`,
  ]

  // Select 5-7 random responsibilities
  const numResponsibilities = Math.floor(Math.random() * 3) + 5 // 5-7 responsibilities
  const selectedResponsibilities = []

  for (let i = 0; i < numResponsibilities; i++) {
    const randomResponsibility = responsibilities[Math.floor(Math.random() * responsibilities.length)]
    if (!selectedResponsibilities.includes(randomResponsibility)) {
      selectedResponsibilities.push(randomResponsibility)
    }
  }

  return selectedResponsibilities.join("\n")
}

// Generate random job benefits
function generateJobBenefits(): string {
  const benefits = [
    `• Competitive salary and equity package`,
    `• Comprehensive health, dental, and vision insurance`,
    `• 401(k) matching program`,
    `• Flexible work hours and remote work options`,
    `• Generous paid time off and holidays`,
    `• Professional development and learning opportunities`,
    `• Home office stipend`,
    `• Wellness programs and gym membership reimbursement`,
    `• Parental leave`,
    `• Regular team events and activities`,
    `• Free snacks and beverages in the office`,
    `• Company-sponsored retreats`,
    `• Employee referral program`,
    `• Commuter benefits`,
    `• Pet-friendly office`,
  ]

  // Select 4-6 random benefits
  const numBenefits = Math.floor(Math.random() * 3) + 4 // 4-6 benefits
  const selectedBenefits = []

  for (let i = 0; i < numBenefits; i++) {
    const randomBenefit = benefits[Math.floor(Math.random() * benefits.length)]
    if (!selectedBenefits.includes(randomBenefit)) {
      selectedBenefits.push(randomBenefit)
    }
  }

  return selectedBenefits.join("\n")
}

// Generate a random salary range
function generateSalaryRange(): string {
  const minSalary = Math.floor(Math.random() * 50) + 50 // $50K - $100K
  const maxSalary = minSalary + Math.floor(Math.random() * 50) + 20 // $20K - $70K more than min

  return `$${minSalary},000 - $${maxSalary},000`
}

// Generate a random candidate name
function generateCandidateName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]

  return `${firstName} ${lastName}`
}

// Generate a random email based on name
function generateEmail(name: string): string {
  const [firstName, lastName] = name.split(" ")
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "example.com"]
  const domain = domains[Math.floor(Math.random() * domains.length)]

  const emailFormats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}@${domain}`,
    `${lastName.toLowerCase()}.${firstName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${Math.floor(Math.random() * 100)}@${domain}`,
  ]

  return emailFormats[Math.floor(Math.random() * emailFormats.length)]
}

// Generate a random phone number
function generatePhoneNumber(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100 // 100-999
  const prefix = Math.floor(Math.random() * 900) + 100 // 100-999
  const lineNumber = Math.floor(Math.random() * 9000) + 1000 // 1000-9999

  return `(${areaCode}) ${prefix}-${lineNumber}`
}

// Generate random candidate skills based on job requirements
function generateCandidateSkills(jobRequirements: string): string[] {
  // Extract skills from job requirements
  const requirementSkills: string[] = []
  jobRequirements.split("\n").forEach((req) => {
    if (req.includes("Experience with ")) {
      const skill = req.replace("• Experience with ", "").trim()
      requirementSkills.push(skill)
    }
  })

  // Determine how many skills the candidate has from the requirements
  const matchPercentage = Math.random()
  const numMatchedSkills = Math.floor(requirementSkills.length * matchPercentage)

  // Select random skills from requirements
  const candidateSkills = []
  const shuffledRequirementSkills = [...requirementSkills].sort(() => 0.5 - Math.random())

  for (let i = 0; i < numMatchedSkills; i++) {
    if (i < shuffledRequirementSkills.length) {
      candidateSkills.push(shuffledRequirementSkills[i])
    }
  }

  // Add some additional skills not in requirements
  const allCategories = Object.values(skillsByCategory).flat()
  const additionalSkills = allCategories.filter((skill) => !requirementSkills.includes(skill))
  const shuffledAdditionalSkills = [...additionalSkills].sort(() => 0.5 - Math.random())

  const numAdditionalSkills = Math.floor(Math.random() * 3) + 1 // 1-3 additional skills
  for (let i = 0; i < numAdditionalSkills; i++) {
    if (i < shuffledAdditionalSkills.length) {
      candidateSkills.push(shuffledAdditionalSkills[i])
    }
  }

  return candidateSkills
}

// Generate matched and missing skills
function generateMatchedAndMissingSkills(
  candidateSkills: string[],
  jobRequirements: string,
): { matched: string[]; missing: string[] } {
  // Extract skills from job requirements
  const requirementSkills: string[] = []
  jobRequirements.split("\n").forEach((req) => {
    if (req.includes("Experience with ")) {
      const skill = req.replace("• Experience with ", "").trim()
      requirementSkills.push(skill)
    }
  })

  // Determine matched skills
  const matchedSkills = candidateSkills.filter((skill) => requirementSkills.includes(skill))

  // Determine missing skills
  const missingSkills = requirementSkills.filter((skill) => !candidateSkills.includes(skill))

  return { matched: matchedSkills, missing: missingSkills }
}

// Calculate match score based on matched and missing skills
function calculateMatchScore(matched: string[], missing: string[]): number {
  if (matched.length + missing.length === 0) return 50 // Default if no skills to match

  const matchPercentage = matched.length / (matched.length + missing.length)
  // Scale to 60-95 range
  const score = Math.floor(matchPercentage * 35) + 60

  // Add some randomness
  const finalScore = Math.min(95, Math.max(60, score + (Math.floor(Math.random() * 10) - 5)))

  return finalScore
}

// Generate random experience entries
function generateExperience(): string[] {
  const companies = [
    "Google",
    "Microsoft",
    "Amazon",
    "Apple",
    "Facebook",
    "Netflix",
    "Uber",
    "Airbnb",
    "Twitter",
    "LinkedIn",
    "Salesforce",
    "Adobe",
    "Oracle",
    "IBM",
    "Intel",
    "Cisco",
    "Shopify",
    "Spotify",
    "Slack",
    "Zoom",
    "Stripe",
    "Square",
    "Twilio",
    "Atlassian",
    "Dropbox",
    "Asana",
    "Figma",
    "Canva",
    "Notion",
    "Airtable",
    "Monday.com",
    "HubSpot",
  ]

  const roles = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "UX Designer",
    "Product Manager",
    "Data Scientist",
    "DevOps Engineer",
    "Marketing Specialist",
    "Sales Representative",
    "HR Coordinator",
    "Project Manager",
    "Technical Lead",
    "Engineering Manager",
    "Director of Engineering",
    "CTO",
    "CEO",
    "COO",
    "CFO",
    "CMO",
  ]

  const numExperiences = Math.floor(Math.random() * 3) + 1 // 1-3 experiences
  const experiences = []

  for (let i = 0; i < numExperiences; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)]
    const role = roles[Math.floor(Math.random() * roles.length)]
    const years = Math.floor(Math.random() * 5) + 1 // 1-5 years
    const endYear = 2023 - i
    const startYear = endYear - years

    experiences.push(`${role} at ${company} (${startYear} - ${endYear})`)
  }

  return experiences
}

// Generate random education entries
function generateEducation(): string[] {
  const universities = [
    "Stanford University",
    "Harvard University",
    "MIT",
    "UC Berkeley",
    "Carnegie Mellon University",
    "University of Michigan",
    "University of Washington",
    "Georgia Tech",
    "University of Texas at Austin",
    "University of Illinois Urbana-Champaign",
    "Cornell University",
    "Princeton University",
    "Yale University",
    "Columbia University",
    "University of Pennsylvania",
    "University of California, Los Angeles",
    "University of Wisconsin-Madison",
    "University of Maryland",
    "Purdue University",
    "Ohio State University",
  ]

  const degrees = [
    "Bachelor of Science in Computer Science",
    "Bachelor of Arts in Design",
    "Bachelor of Business Administration",
    "Master of Science in Computer Science",
    "Master of Business Administration",
    "Master of Science in Data Science",
    "Master of Science in Information Systems",
    "PhD in Computer Science",
    "Bachelor of Science in Electrical Engineering",
    "Bachelor of Science in Mathematics",
  ]

  const numEducations = Math.floor(Math.random() * 2) + 1 // 1-2 education entries
  const educations = []

  for (let i = 0; i < numEducations; i++) {
    const university = universities[Math.floor(Math.random() * universities.length)]
    const degree = degrees[Math.floor(Math.random() * degrees.length)]
    const endYear = 2023 - i * 3 - Math.floor(Math.random() * 5) // Stagger graduation years

    educations.push(`${degree}, ${university} (${endYear})`)
  }

  return educations
}

// Generate a random summary
function generateSummary(name: string, skills: string[]): string {
  const summaries = [
    `Experienced professional with expertise in ${skills.slice(0, 3).join(", ")}. Passionate about delivering high-quality work and continuously learning new technologies.`,
    `Results-driven individual with a strong background in ${skills.slice(0, 3).join(", ")}. Proven track record of success in fast-paced environments.`,
    `Innovative problem-solver with skills in ${skills.slice(0, 3).join(", ")}. Committed to excellence and continuous improvement.`,
    `Dedicated professional with expertise in ${skills.slice(0, 3).join(", ")}. Strong analytical skills and attention to detail.`,
    `Versatile team player proficient in ${skills.slice(0, 3).join(", ")}. Excellent communication and collaboration skills.`,
  ]

  return summaries[Math.floor(Math.random() * summaries.length)]
}

// Generate random notes
function generateNotes(): string {
  const notes = [
    "Candidate showed strong technical skills during the initial screening.",
    "Great communication skills, would be a good fit for client-facing roles.",
    "Has experience with our tech stack and seems enthusiastic about the role.",
    "Needs more experience with some of our key technologies.",
    "Strong problem-solving skills demonstrated during the technical interview.",
    "Follow up in two weeks to check availability for the next round.",
    "Candidate is currently considering other offers, need to move quickly.",
    "Impressive portfolio and past projects.",
    "Might be overqualified for this position, consider for a more senior role.",
    "Good cultural fit, team liked the candidate.",
    "Schedule a follow-up technical interview to dive deeper into their experience.",
    "Candidate is relocating and will be available starting next month.",
    "References check came back positive, proceed to offer stage.",
    "Salary expectations are within our range.",
    "Candidate has a competing offer, need to expedite the process.",
  ]

  // 50% chance of having notes
  if (Math.random() < 0.5) {
    return notes[Math.floor(Math.random() * notes.length)]
  }

  return ""
}

// Generate a dummy job
export function generateDummyJob(userId: string) {
  const jobTitleObj = jobTitles[Math.floor(Math.random() * jobTitles.length)]
  const title = jobTitleObj.title
  const department = jobTitleObj.department
  const location = locations[Math.floor(Math.random() * locations.length)]
  const employmentType = employmentTypes[Math.floor(Math.random() * employmentTypes.length)]
  const experienceLevel = experienceLevels[Math.floor(Math.random() * experienceLevels.length)]
  const salaryRange = generateSalaryRange()
  const description = generateJobDescription(title)
  const responsibilities = generateJobResponsibilities(title)
  const requirements = generateJobRequirements(title)
  const benefits = generateJobBenefits()

  return {
    title,
    department,
    location,
    employment_type: employmentType,
    experience_level: experienceLevel,
    salary_range: salaryRange,
    description,
    responsibilities,
    requirements,
    benefits,
    status: "Open",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: userId,
  }
}

// Generate a dummy candidate for a specific job
export function generateDummyCandidate(userId: string, jobId: string, jobRequirements: string) {
  const name = generateCandidateName()
  const email = generateEmail(name)
  const phone = generatePhoneNumber()
  const skills = generateCandidateSkills(jobRequirements)
  const { matched, missing } = generateMatchedAndMissingSkills(skills, jobRequirements)
  const matchScore = calculateMatchScore(matched, missing)
  const status = candidateStatuses[Math.floor(Math.random() * candidateStatuses.length)]
  const experience = generateExperience()
  const education = generateEducation()
  const summary = generateSummary(name, skills)
  const notes = generateNotes()

  return {
    name,
    email,
    phone,
    job_id: jobId,
    match_score: matchScore,
    status,
    skills,
    matched_skills: matched,
    missing_skills: missing,
    experience,
    education,
    summary,
    notes,
    resume_url: null, // No actual resume file
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: userId,
  }
}

