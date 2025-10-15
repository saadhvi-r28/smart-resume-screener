const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

class ResumeParserService {
  constructor() {
    // Common skill categories and patterns
    this.skillCategories = {
      technical: [
        // Programming Languages
        'javascript', 'python', 'java', 'c\\+\\+', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'typescript',
        // Frameworks & Libraries
        'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel', '.net',
        // Databases
        'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sql server',
        // Cloud & DevOps
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible',
        // Other Technical
        'git', 'linux', 'windows', 'html', 'css', 'sass', 'webpack', 'babel'
      ],
      soft: [
        'leadership', 'communication', 'teamwork', 'problem solving', 'analytical thinking',
        'project management', 'time management', 'adaptability', 'creativity', 'collaboration'
      ],
      domain: [
        'machine learning', 'data science', 'artificial intelligence', 'cybersecurity',
        'blockchain', 'mobile development', 'web development', 'devops', 'ui/ux design'
      ]
    };

    // Experience keywords
    this.experienceKeywords = [
      'experience', 'worked', 'developed', 'managed', 'led', 'created', 'designed',
      'implemented', 'delivered', 'coordinated', 'supervised', 'established'
    ];

    // Education keywords
    this.educationKeywords = [
      'bachelor', 'master', 'phd', 'mba', 'degree', 'university', 'college',
      'certification', 'certificate', 'diploma', 'graduated'
    ];
  }

  /**
   * Parse resume from file buffer
   */
  async parseResume(fileBuffer, fileName, fileType) {
    try {
      let text = '';

      switch (fileType.toLowerCase()) {
        case 'pdf':
          text = await this.parsePDF(fileBuffer);
          break;
        case 'txt':
          text = fileBuffer.toString('utf-8');
          break;
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      const extractedData = await this.extractStructuredData(text);
      
      return {
        rawText: text,
        extractedData,
        metadata: {
          fileName,
          fileType,
          parsedAt: new Date(),
          wordCount: text.split(' ').length
        }
      };
    } catch (error) {
      throw new Error(`Resume parsing failed: ${error.message}`);
    }
  }

  /**
   * Parse PDF file
   */
  async parsePDF(buffer) {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  /**
   * Extract structured data from raw text
   */
  async extractStructuredData(text) {
    const cleanText = this.cleanText(text);
    
    return {
      name: this.extractName(text), // Extract from original text (case-sensitive)
      email: this.extractEmail(text), // Extract from original text (case-sensitive)
      phone: this.extractPhone(text), // Extract from original text
      skills: this.extractSkills(cleanText),
      experience: this.extractExperience(cleanText),
      education: this.extractEducation(cleanText),
      certifications: this.extractCertifications(cleanText),
      totalExperienceYears: this.calculateTotalExperience(cleanText),
      summary: this.extractSummary(cleanText)
    };
  }

  /**
   * Clean and normalize text
   */
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim()
      .toLowerCase();
  }

  /**
   * Extract email address
   */
  extractEmail(text) {
    // Match any email pattern - very permissive
    // Handles: user@domain.com, user.name@sub.domain.co.uk, user+tag@domain.io, etc.
    const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/gi;
    const matches = text.match(emailRegex);
    
    if (matches && matches.length > 0) {
      // Return the first valid-looking email
      // Filter out common false positives
      const validEmails = matches.filter(email => {
        // Must have at least one character before @
        // Must have at least one character between @ and .
        // Must have valid TLD (2+ characters)
        return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
      });
      
      return validEmails.length > 0 ? validEmails[0].toLowerCase() : null;
    }
    
    return null;
  }

  /**
   * Extract candidate name from resume
   */
  extractName(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Try first few lines (usually name is at the top)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      
      // Skip lines with email, phone, or URLs
      if (line.match(/@|http|www|\+?\d{10}|linkedin|github/i)) {
        continue;
      }
      
      // Look for name pattern: 2-4 words, starting with capital letters
      const nameMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/);
      if (nameMatch && nameMatch[1].length >= 4 && nameMatch[1].length <= 50) {
        return nameMatch[1];
      }
      
      // Alternative: Any line with capitalized words (more permissive)
      if (i < 3) { // Only check first 3 lines
        const words = line.split(/\s+/);
        if (words.length >= 2 && words.length <= 4) {
          const isLikelyName = words.every(word => 
            /^[A-Z][a-z]+$/.test(word) && word.length >= 2
          );
          if (isLikelyName) {
            return words.join(' ');
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Extract phone number
   */
  extractPhone(text) {
    // Match various phone number formats
    // Handles: +91-9876543210, (123) 456-7890, 123.456.7890, +1 234 567 8900, etc.
    const phonePatterns = [
      /\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,  // International format
      /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,                    // US format
      /\+?\d{1,3}[-.\s]?\d{10}/g,                                 // +91 9876543210
      /\d{10}/g,                                                   // 9876543210
    ];
    
    for (const pattern of phonePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        // Return the first match, cleaned up
        const phone = matches[0].trim();
        // Validate it has at least 10 digits
        const digitsOnly = phone.replace(/\D/g, '');
        if (digitsOnly.length >= 10) {
          return phone;
        }
      }
    }
    
    return null;
  }

  /**
   * Extract skills with categories
   */
  extractSkills(text) {
    const skills = [];
    const foundSkills = new Set();

    // Extract skills by category
    Object.entries(this.skillCategories).forEach(([category, skillList]) => {
      skillList.forEach(skill => {
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (regex.test(text) && !foundSkills.has(skill.toLowerCase())) {
          skills.push({
            name: skill.charAt(0).toUpperCase() + skill.slice(1),
            category: category,
            proficiencyLevel: this.estimateProficiency(text, skill)
          });
          foundSkills.add(skill.toLowerCase());
        }
      });
    });

    // Extract skills from common sections
    const skillSections = this.extractSections(text, ['skills', 'technical skills', 'competencies', 'technologies']);
    skillSections.forEach(section => {
      const extractedSkills = this.parseSkillSection(section);
      extractedSkills.forEach(skill => {
        if (!foundSkills.has(skill.name.toLowerCase())) {
          skills.push(skill);
          foundSkills.add(skill.name.toLowerCase());
        }
      });
    });

    return skills;
  }

  /**
   * Estimate proficiency level based on context
   */
  estimateProficiency(text, skill) {
    const skillContext = this.getSkillContext(text, skill);
    
    if (skillContext.includes('expert') || skillContext.includes('advanced') || skillContext.includes('lead')) {
      return 'expert';
    } else if (skillContext.includes('proficient') || skillContext.includes('experienced')) {
      return 'advanced';
    } else if (skillContext.includes('intermediate') || skillContext.includes('working knowledge')) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }

  /**
   * Get context around a skill mention
   */
  getSkillContext(text, skill) {
    const regex = new RegExp(`.{0,50}\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b.{0,50}`, 'gi');
    const matches = text.match(regex);
    return matches ? matches.join(' ').toLowerCase() : '';
  }

  /**
   * Extract experience information
   */
  extractExperience(text) {
    const experience = [];
    const lines = text.split('\n');
    
    // Look for experience patterns
    const experienceSection = this.extractSections(text, ['experience', 'work experience', 'employment', 'career history']);
    
    experienceSection.forEach(section => {
      const jobs = this.parseExperienceSection(section);
      experience.push(...jobs);
    });

    return experience;
  }

  /**
   * Parse experience section
   */
  parseExperienceSection(section) {
    const jobs = [];
    const lines = section.split('\n').filter(line => line.trim().length > 0);
    
    let currentJob = null;
    
    lines.forEach(line => {
      line = line.trim();
      
      // Check if line contains job title and company
      if (this.isJobTitleLine(line)) {
        if (currentJob) {
          jobs.push(currentJob);
        }
        currentJob = this.parseJobTitleLine(line);
      } else if (currentJob && this.isDateLine(line)) {
        const dates = this.parseDates(line);
        Object.assign(currentJob, dates);
      } else if (currentJob && line.length > 10) {
        // Add to job description
        currentJob.description = (currentJob.description || '') + ' ' + line;
      }
    });
    
    if (currentJob) {
      jobs.push(currentJob);
    }
    
    return jobs;
  }

  /**
   * Check if line contains job title
   */
  isJobTitleLine(line) {
    const jobIndicators = ['developer', 'engineer', 'manager', 'analyst', 'specialist', 'consultant', 'director', 'lead'];
    return jobIndicators.some(indicator => line.toLowerCase().includes(indicator));
  }

  /**
   * Parse job title line
   */
  parseJobTitleLine(line) {
    // Simple parsing - can be enhanced with more sophisticated NLP
    const parts = line.split(/\sat\s|\s-\s|\s\|\s/i);
    if (parts.length >= 2) {
      return {
        position: parts[0].trim(),
        company: parts[1].trim(),
        description: ''
      };
    }
    return {
      position: line.trim(),
      company: 'Unknown',
      description: ''
    };
  }

  /**
   * Check if line contains dates
   */
  isDateLine(line) {
    const dateRegex = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{1,2}\/\d{1,4}|\d{4})\b/i;
    return dateRegex.test(line);
  }

  /**
   * Parse dates from line
   */
  parseDates(line) {
    const result = { duration: line.trim() };
    
    // Extract year patterns
    const yearMatches = line.match(/\b(19|20)\d{2}\b/g);
    if (yearMatches && yearMatches.length >= 2) {
      result.startDate = new Date(yearMatches[0], 0, 1);
      result.endDate = new Date(yearMatches[1], 0, 1);
    } else if (yearMatches && yearMatches.length === 1) {
      result.startDate = new Date(yearMatches[0], 0, 1);
      if (line.toLowerCase().includes('present') || line.toLowerCase().includes('current')) {
        result.isCurrent = true;
        result.endDate = new Date();
      }
    }
    
    return result;
  }

  /**
   * Extract education information
   */
  extractEducation(text) {
    const education = [];
    const educationSection = this.extractSections(text, ['education', 'academic background', 'qualifications']);
    
    educationSection.forEach(section => {
      const degrees = this.parseEducationSection(section);
      education.push(...degrees);
    });
    
    return education;
  }

  /**
   * Parse education section
   */
  parseEducationSection(section) {
    const degrees = [];
    const lines = section.split('\n').filter(line => line.trim().length > 0);
    
    lines.forEach(line => {
      if (this.isDegree(line)) {
        const degree = this.parseDegree(line);
        if (degree) {
          degrees.push(degree);
        }
      }
    });
    
    return degrees;
  }

  /**
   * Check if line contains degree information
   */
  isDegree(line) {
    const degreeKeywords = ['bachelor', 'master', 'phd', 'mba', 'bs', 'ms', 'ba', 'ma', 'degree'];
    return degreeKeywords.some(keyword => line.toLowerCase().includes(keyword));
  }

  /**
   * Parse degree information
   */
  parseDegree(line) {
    const yearMatch = line.match(/\b(19|20)\d{2}\b/);
    const gpaMatch = line.match(/gpa\s*:?\s*(\d+\.?\d*)/i);
    
    return {
      degree: line.trim(),
      institution: 'Unknown', // Would need more sophisticated parsing
      fieldOfStudy: 'Unknown',
      graduationYear: yearMatch ? parseInt(yearMatch[0]) : null,
      gpa: gpaMatch ? gpaMatch[1] : null
    };
  }

  /**
   * Extract certifications
   */
  extractCertifications(text) {
    const certifications = [];
    const certSection = this.extractSections(text, ['certifications', 'certificates', 'licenses']);
    
    certSection.forEach(section => {
      const certs = this.parseCertificationSection(section);
      certifications.push(...certs);
    });
    
    return certifications;
  }

  /**
   * Parse certification section
   */
  parseCertificationSection(section) {
    const certifications = [];
    const lines = section.split('\n').filter(line => line.trim().length > 0);
    
    lines.forEach(line => {
      if (line.trim().length > 5) { // Avoid short/empty lines
        certifications.push({
          name: line.trim(),
          issuer: 'Unknown',
          issueDate: null,
          expiryDate: null
        });
      }
    });
    
    return certifications;
  }

  /**
   * Calculate total years of experience
   */
  calculateTotalExperience(text) {
    // Look for explicit experience mentions first (most reliable)
    const expMatches = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/gi);
    if (expMatches) {
      const years = expMatches.map(match => {
        const num = match.match(/\d+/);
        return num ? parseInt(num[0]) : 0;
      });
      const maxYears = Math.max(...years);
      
      // Sanity check: if > 50 years, it's likely wrong
      if (maxYears > 50) {
        return 0;
      }
      return maxYears;
    }
    
    // Only calculate from work history dates if we find an experience section
    const experienceSection = this.extractExperienceSection(text);
    if (!experienceSection || experienceSection.length < 50) {
      // No experience section found or too short, assume fresh graduate
      return 0;
    }
    
    // Look for year ranges specifically in experience section (YYYY-YYYY or YYYY - YYYY)
    const dateRanges = experienceSection.match(/\b(20\d{2})\s*[-–—]\s*(20\d{2}|present|current)/gi);
    if (dateRanges && dateRanges.length > 0) {
      let totalYears = 0;
      
      dateRanges.forEach(range => {
        const years = range.match(/20\d{2}/g);
        if (years && years.length >= 1) {
          const startYear = parseInt(years[0]);
          const endYear = range.match(/present|current/i) 
            ? new Date().getFullYear() 
            : (years[1] ? parseInt(years[1]) : new Date().getFullYear());
          
          const duration = endYear - startYear;
          // Sanity check: each job should be between 0-20 years
          if (duration >= 0 && duration <= 20) {
            totalYears += duration;
          }
        }
      });
      
      return Math.min(totalYears, 50); // Cap at 50 years max
    }
    
    // If we found an experience section but no clear date ranges,
    // try to find individual years only in that section
    const yearMatches = experienceSection.match(/\b(20\d{2})\b/g);
    if (yearMatches && yearMatches.length >= 2) {
      const years = yearMatches.map(y => parseInt(y)).sort();
      const calculatedYears = new Date().getFullYear() - years[0];
      
      // Only accept if reasonable (0-50 years)
      if (calculatedYears >= 0 && calculatedYears <= 50) {
        return calculatedYears;
      }
    }
    
    return 0; // Default to 0 if nothing found
  }

  /**
   * Extract the experience/work history section from resume text
   */
  extractExperienceSection(text) {
    const lines = text.split('\n');
    const experienceHeaders = [
      'experience', 'work experience', 'employment', 'work history', 
      'professional experience', 'career history', 'employment history'
    ];
    
    let startIndex = -1;
    let endIndex = lines.length;
    
    // Find where experience section starts
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().toLowerCase();
      if (experienceHeaders.some(header => line === header || line.startsWith(header))) {
        startIndex = i;
        break;
      }
    }
    
    if (startIndex === -1) {
      return ''; // No experience section found
    }
    
    // Find where experience section ends (next major section)
    const sectionHeaders = [
      'education', 'skills', 'certifications', 'projects', 
      'publications', 'awards', 'references', 'interests'
    ];
    
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim().toLowerCase();
      if (sectionHeaders.some(header => line === header || line.startsWith(header))) {
        endIndex = i;
        break;
      }
    }
    
    // Extract the experience section
    return lines.slice(startIndex, endIndex).join('\n');
  }

  /**
   * Extract summary/objective
   */
  extractSummary(text) {
    const summarySection = this.extractSections(text, ['summary', 'objective', 'profile', 'about']);
    return summarySection.length > 0 ? summarySection[0].substring(0, 500) : '';
  }

  /**
   * Extract sections by headers
   */
  extractSections(text, headers) {
    const sections = [];
    const lines = text.split('\n');
    
    headers.forEach(header => {
      const headerRegex = new RegExp(`^\\s*${header}\\s*:?\\s*$`, 'i');
      const headerIndex = lines.findIndex(line => headerRegex.test(line));
      
      if (headerIndex !== -1) {
        let content = '';
        for (let i = headerIndex + 1; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Stop if we hit another section header
          if (this.isSectionHeader(line)) {
            break;
          }
          
          content += line + '\n';
        }
        
        if (content.trim()) {
          sections.push(content.trim());
        }
      }
    });
    
    return sections;
  }

  /**
   * Check if line is a section header
   */
  isSectionHeader(line) {
    const commonHeaders = [
      'experience', 'education', 'skills', 'certifications', 'projects',
      'achievements', 'awards', 'languages', 'interests', 'references'
    ];
    
    return commonHeaders.some(header => {
      const regex = new RegExp(`^\\s*${header}\\s*:?\\s*$`, 'i');
      return regex.test(line);
    });
  }

  /**
   * Parse skills from skills section
   */
  parseSkillSection(section) {
    const skills = [];
    const skillItems = section.split(/[,;•\n]/).filter(item => item.trim().length > 0);
    
    skillItems.forEach(item => {
      const skill = item.trim().replace(/^[-•]\s*/, '');
      if (skill.length > 1 && skill.length < 50) {
        skills.push({
          name: skill.charAt(0).toUpperCase() + skill.slice(1),
          category: this.categorizeSkill(skill),
          proficiencyLevel: 'intermediate'
        });
      }
    });
    
    return skills;
  }

  /**
   * Categorize a skill
   */
  categorizeSkill(skill) {
    const lowerSkill = skill.toLowerCase();
    
    for (const [category, skillList] of Object.entries(this.skillCategories)) {
      if (skillList.some(s => lowerSkill.includes(s) || s.includes(lowerSkill))) {
        return category;
      }
    }
    
    return 'other';
  }
}

module.exports = ResumeParserService;