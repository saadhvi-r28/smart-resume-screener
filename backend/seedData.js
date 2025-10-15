const mongoose = require('mongoose');
const Resume = require('./src/models/Resume');
const JobDescription = require('./src/models/JobDescription');

// Sample resume data
const sampleResumes = [
  {
    candidateName: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0123',
    originalFileName: 'sarah_johnson_resume.pdf',
    fileType: 'pdf',
    rawText: `
      Sarah Johnson
      Senior Full-Stack Developer
      Email: sarah.johnson@email.com
      Phone: +1-555-0123

      SUMMARY
      Experienced full-stack developer with 6 years of expertise in JavaScript, React, Node.js, and cloud technologies. 
      Proven track record of leading development teams and delivering scalable web applications.

      EXPERIENCE
      Senior Full-Stack Developer - Tech Innovations Inc (2020-2023)
      • Led a team of 5 developers in building modern web applications
      • Implemented microservices architecture using Node.js and Docker
      • Developed responsive frontend applications using React and Redux
      • Improved application performance by 40% through code optimization

      Full-Stack Developer - Digital Solutions LLC (2018-2020)
      • Developed and maintained web applications using MERN stack
      • Collaborated with UX/UI designers to implement user-friendly interfaces
      • Integrated third-party APIs and payment systems

      SKILLS
      Technical: JavaScript, TypeScript, React, Node.js, Express, MongoDB, PostgreSQL, AWS, Docker, Git
      Soft Skills: Leadership, Team Management, Problem Solving, Communication

      EDUCATION
      Bachelor of Science in Computer Science - State University (2018)
      GPA: 3.8/4.0

      CERTIFICATIONS
      AWS Certified Solutions Architect (2022)
      React Developer Certification (2021)
    `,
    extractedData: {
      skills: [
        { name: 'JavaScript', category: 'technical', proficiencyLevel: 'expert' },
        { name: 'React', category: 'technical', proficiencyLevel: 'expert' },
        { name: 'Node.js', category: 'technical', proficiencyLevel: 'advanced' },
        { name: 'TypeScript', category: 'technical', proficiencyLevel: 'advanced' },
        { name: 'MongoDB', category: 'technical', proficiencyLevel: 'advanced' },
        { name: 'AWS', category: 'technical', proficiencyLevel: 'intermediate' },
        { name: 'Docker', category: 'technical', proficiencyLevel: 'intermediate' },
        { name: 'Leadership', category: 'soft', proficiencyLevel: 'expert' },
        { name: 'Problem Solving', category: 'soft', proficiencyLevel: 'advanced' }
      ],
      experience: [
        {
          company: 'Tech Innovations Inc',
          position: 'Senior Full-Stack Developer',
          duration: '2020-2023',
          description: 'Led team of 5 developers, implemented microservices architecture',
          startDate: new Date('2020-01-01'),
          endDate: new Date('2023-01-01'),
          isCurrent: false
        },
        {
          company: 'Digital Solutions LLC',
          position: 'Full-Stack Developer',
          duration: '2018-2020',
          description: 'Developed web applications using MERN stack',
          startDate: new Date('2018-01-01'),
          endDate: new Date('2020-01-01'),
          isCurrent: false
        }
      ],
      education: [
        {
          institution: 'State University',
          degree: 'Bachelor of Science in Computer Science',
          fieldOfStudy: 'Computer Science',
          graduationYear: 2018,
          gpa: '3.8'
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          issueDate: new Date('2022-06-01')
        },
        {
          name: 'React Developer Certification',
          issuer: 'React Training',
          issueDate: new Date('2021-03-01')
        }
      ],
      totalExperienceYears: 6,
      summary: 'Experienced full-stack developer with 6 years of expertise in JavaScript, React, Node.js, and cloud technologies.'
    }
  },
  {
    candidateName: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1-555-0456',
    originalFileName: 'michael_chen_resume.pdf',
    fileType: 'pdf',
    rawText: `
      Michael Chen
      Data Scientist & Machine Learning Engineer
      Email: michael.chen@email.com
      Phone: +1-555-0456

      SUMMARY
      Data scientist with 4 years of experience in machine learning, statistical analysis, and data visualization. 
      Expertise in Python, R, and cloud-based ML platforms.

      EXPERIENCE
      Senior Data Scientist - AI Corp (2021-2023)
      • Developed predictive models that improved business KPIs by 25%
      • Built recommendation systems using collaborative filtering
      • Implemented MLOps pipelines using MLflow and Kubernetes

      Data Scientist - Analytics Plus (2019-2021)
      • Performed statistical analysis on large datasets using Python and R
      • Created interactive dashboards using Tableau and Power BI
      • Collaborated with business stakeholders to define analytical requirements

      SKILLS
      Technical: Python, R, SQL, TensorFlow, PyTorch, Scikit-learn, Pandas, NumPy, Tableau, AWS, GCP
      Soft Skills: Analytical Thinking, Communication, Presentation Skills

      EDUCATION
      Master of Science in Data Science - Tech Institute (2019)
      Bachelor of Science in Statistics - University College (2017)

      CERTIFICATIONS
      Google Cloud Professional ML Engineer (2022)
      AWS Certified Machine Learning Specialty (2021)
    `,
    extractedData: {
      skills: [
        { name: 'Python', category: 'technical', proficiencyLevel: 'expert' },
        { name: 'R', category: 'technical', proficiencyLevel: 'advanced' },
        { name: 'Machine Learning', category: 'domain', proficiencyLevel: 'expert' },
        { name: 'TensorFlow', category: 'technical', proficiencyLevel: 'advanced' },
        { name: 'SQL', category: 'technical', proficiencyLevel: 'advanced' },
        { name: 'AWS', category: 'technical', proficiencyLevel: 'intermediate' },
        { name: 'Tableau', category: 'technical', proficiencyLevel: 'intermediate' },
        { name: 'Analytical Thinking', category: 'soft', proficiencyLevel: 'expert' }
      ],
      experience: [
        {
          company: 'AI Corp',
          position: 'Senior Data Scientist',
          duration: '2021-2023',
          description: 'Developed predictive models, built recommendation systems',
          startDate: new Date('2021-01-01'),
          endDate: new Date('2023-01-01')
        },
        {
          company: 'Analytics Plus',
          position: 'Data Scientist',
          duration: '2019-2021',
          description: 'Statistical analysis, dashboard creation, stakeholder collaboration',
          startDate: new Date('2019-01-01'),
          endDate: new Date('2021-01-01')
        }
      ],
      education: [
        {
          institution: 'Tech Institute',
          degree: 'Master of Science in Data Science',
          fieldOfStudy: 'Data Science',
          graduationYear: 2019
        }
      ],
      totalExperienceYears: 4,
      summary: 'Data scientist with 4 years of experience in machine learning and statistical analysis.'
    }
  },
  {
    candidateName: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1-555-0789',
    originalFileName: 'emily_rodriguez_resume.pdf',
    fileType: 'pdf',
    rawText: `
      Emily Rodriguez
      Junior Frontend Developer
      Email: emily.rodriguez@email.com

      SUMMARY
      Recent computer science graduate with internship experience in frontend development. 
      Passionate about creating user-friendly web applications using modern JavaScript frameworks.

      EXPERIENCE
      Frontend Developer Intern - StartupXYZ (2022-2023)
      • Developed responsive web components using React and CSS
      • Collaborated with design team to implement UI mockups
      • Participated in code reviews and agile development processes

      SKILLS
      Technical: HTML, CSS, JavaScript, React, Git, Figma
      Soft Skills: Teamwork, Quick Learning, Attention to Detail

      EDUCATION
      Bachelor of Science in Computer Science - City College (2023)
      GPA: 3.6/4.0
      Relevant Coursework: Web Development, Data Structures, Algorithms

      PROJECTS
      Personal Portfolio Website - Built using React and deployed on Netlify
      E-commerce App - Group project using MERN stack
    `,
    extractedData: {
      skills: [
        { name: 'JavaScript', category: 'technical', proficiencyLevel: 'intermediate' },
        { name: 'React', category: 'technical', proficiencyLevel: 'intermediate' },
        { name: 'HTML', category: 'technical', proficiencyLevel: 'advanced' },
        { name: 'CSS', category: 'technical', proficiencyLevel: 'advanced' },
        { name: 'Git', category: 'technical', proficiencyLevel: 'beginner' },
        { name: 'Teamwork', category: 'soft', proficiencyLevel: 'advanced' }
      ],
      experience: [
        {
          company: 'StartupXYZ',
          position: 'Frontend Developer Intern',
          duration: '2022-2023',
          description: 'Developed responsive web components, collaborated with design team',
          startDate: new Date('2022-06-01'),
          endDate: new Date('2023-06-01')
        }
      ],
      education: [
        {
          institution: 'City College',
          degree: 'Bachelor of Science in Computer Science',
          fieldOfStudy: 'Computer Science',
          graduationYear: 2023,
          gpa: '3.6'
        }
      ],
      totalExperienceYears: 1,
      summary: 'Recent computer science graduate with internship experience in frontend development.'
    }
  }
];

// Sample job descriptions
const sampleJobs = [
  {
    title: 'Senior Full-Stack Developer',
    company: 'Innovation Labs',
    department: 'Engineering',
    location: 'San Francisco, CA',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    salaryRange: {
      min: 120000,
      max: 160000,
      currency: 'USD'
    },
    description: `
      We are looking for an experienced Senior Full-Stack Developer to join our growing engineering team. 
      The ideal candidate will have strong experience in JavaScript, React, Node.js, and cloud technologies.
      
      You will be responsible for architecting and developing scalable web applications, mentoring junior developers, 
      and collaborating with cross-functional teams to deliver high-quality software solutions.
    `,
    requirements: {
      requiredSkills: [
        { name: 'JavaScript', category: 'technical', importance: 'must-have' },
        { name: 'React', category: 'technical', importance: 'must-have' },
        { name: 'Node.js', category: 'technical', importance: 'must-have' },
        { name: 'MongoDB', category: 'technical', importance: 'must-have' },
        { name: 'Git', category: 'technical', importance: 'must-have' }
      ],
      preferredSkills: [
        { name: 'TypeScript', category: 'technical' },
        { name: 'AWS', category: 'technical' },
        { name: 'Docker', category: 'technical' },
        { name: 'Leadership', category: 'soft' }
      ],
      minimumExperience: 5,
      educationRequirement: 'Bachelor\'s degree in Computer Science or related field',
      certifications: ['AWS certification preferred']
    },
    responsibilities: [
      'Design and develop scalable web applications',
      'Mentor and guide junior developers',
      'Collaborate with product managers and designers',
      'Participate in code reviews and architectural decisions',
      'Ensure high code quality and best practices'
    ],
    benefits: [
      'Competitive salary and equity',
      'Health, dental, and vision insurance',
      'Flexible work arrangements',
      'Professional development budget'
    ],
    applicationDeadline: new Date('2024-12-31'),
    createdBy: 'hr@innovationlabs.com'
  },
  {
    title: 'Data Scientist',
    company: 'DataTech Solutions',
    department: 'Analytics',
    location: 'Remote',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: {
      min: 90000,
      max: 130000,
      currency: 'USD'
    },
    description: `
      Join our data science team to build predictive models and extract insights from large datasets. 
      We're looking for someone with strong Python/R skills and experience with machine learning algorithms.
      
      You'll work on exciting projects involving customer analytics, fraud detection, and recommendation systems.
    `,
    requirements: {
      requiredSkills: [
        { name: 'Python', category: 'technical', importance: 'must-have' },
        { name: 'Machine Learning', category: 'domain', importance: 'must-have' },
        { name: 'SQL', category: 'technical', importance: 'must-have' },
        { name: 'Statistics', category: 'domain', importance: 'must-have' }
      ],
      preferredSkills: [
        { name: 'R', category: 'technical' },
        { name: 'TensorFlow', category: 'technical' },
        { name: 'AWS', category: 'technical' },
        { name: 'Tableau', category: 'technical' }
      ],
      minimumExperience: 3,
      educationRequirement: 'Master\'s degree in Data Science, Statistics, or related field',
      certifications: ['Cloud ML certifications preferred']
    },
    responsibilities: [
      'Develop and deploy machine learning models',
      'Analyze large datasets to extract business insights',
      'Create data visualizations and reports',
      'Collaborate with engineering teams on model deployment',
      'Present findings to stakeholders'
    ],
    benefits: [
      'Remote work flexibility',
      'Competitive compensation package',
      'Learning and development opportunities',
      'Health and wellness benefits'
    ],
    applicationDeadline: new Date('2024-11-30'),
    createdBy: 'hiring@datatechsolutions.com'
  },
  {
    title: 'Junior Frontend Developer',
    company: 'Creative Agency',
    department: 'Development',
    location: 'New York, NY',
    employmentType: 'full-time',
    experienceLevel: 'entry',
    salaryRange: {
      min: 65000,
      max: 80000,
      currency: 'USD'
    },
    description: `
      We're seeking a Junior Frontend Developer to join our creative team. This is a great opportunity 
      for a recent graduate or someone with 1-2 years of experience to grow their skills in a supportive environment.
      
      You'll work on client websites and web applications using modern frontend technologies.
    `,
    requirements: {
      requiredSkills: [
        { name: 'HTML', category: 'technical', importance: 'must-have' },
        { name: 'CSS', category: 'technical', importance: 'must-have' },
        { name: 'JavaScript', category: 'technical', importance: 'must-have' },
        { name: 'Git', category: 'technical', importance: 'must-have' }
      ],
      preferredSkills: [
        { name: 'React', category: 'technical' },
        { name: 'Responsive Design', category: 'technical' },
        { name: 'Figma', category: 'technical' }
      ],
      minimumExperience: 0,
      educationRequirement: 'Bachelor\'s degree in Computer Science, Web Development, or related field',
      certifications: []
    },
    responsibilities: [
      'Develop responsive web interfaces',
      'Collaborate with designers to implement UI mockups',
      'Write clean, maintainable code',
      'Participate in team code reviews',
      'Learn and apply best practices in web development'
    ],
    benefits: [
      'Mentorship and learning opportunities',
      'Creative work environment',
      'Health insurance',
      'Paid time off'
    ],
    applicationDeadline: new Date('2024-10-31'),
    createdBy: 'jobs@creativeagency.com'
  }
];

// Function to seed sample data
async function seedSampleData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-resume-screener');

    console.log('Clearing existing data...');
    await Promise.all([
      Resume.deleteMany({}),
      JobDescription.deleteMany({})
    ]);

    console.log('Inserting sample resumes...');
    await Resume.insertMany(sampleResumes);

    console.log('Inserting sample job descriptions...');
    await JobDescription.insertMany(sampleJobs);

    console.log('Sample data seeded successfully!');
    console.log(`Created ${sampleResumes.length} resumes and ${sampleJobs.length} job descriptions`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding sample data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  seedSampleData();
}

module.exports = { sampleResumes, sampleJobs, seedSampleData };