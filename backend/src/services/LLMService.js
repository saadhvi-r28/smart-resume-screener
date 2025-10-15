
const axios = require('axios');


class LLMService {
  constructor() {
  this.apiKey = process.env.MISTRAL_API_KEY;
  this.model = process.env.MISTRAL_MODEL || 'mistral-tiny-experimental';
  this.apiUrl = process.env.MISTRAL_API_URL || 'https://experimental.api.mistral.ai/v1/chat/completions';
  }

  /**
   * Compare resume with job description and provide detailed scoring
   */
  async compareResumeWithJob(resumeData, jobDescription) {
    try {
      const prompt = this.buildComparisonPrompt(resumeData, jobDescription);
      const payload = {
        model: this.model,
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1, // Lower temperature for cost-saving
        max_tokens: 512   // Lower max_tokens for cost-saving
      };
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      };
      const response = await axios.post(this.apiUrl, payload, { headers });
      const content = response.data.choices[0].message.content;
      return this.parseResponse(content, prompt);
    } catch (error) {
      console.error('Mistral API Error:', error?.response?.data || error);
      throw new Error(`LLM analysis failed: ${error.message}`);
    }
  }

  /**
   * Get system prompt for consistent analysis
   */
  getSystemPrompt() {
    return `You are an expert HR recruiter and technical hiring manager with deep expertise in resume analysis and candidate evaluation. Your task is to analyze resumes against job descriptions with precision and provide actionable insights.

ANALYSIS FRAMEWORK:
1. Skills Assessment (40% weight): Evaluate technical and soft skills match
2. Experience Relevance (35% weight): Assess work history alignment
3. Education & Certifications (15% weight): Review educational background
4. Cultural & Role Fit (10% weight): Overall suitability assessment

SCORING GUIDELINES:
- 9-10: Exceptional match, ideal candidate
- 7-8: Strong match, highly recommended
- 5-6: Good match with some gaps, consider with reservations
- 3-4: Moderate match, significant skill gaps
- 1-2: Poor match, not recommended

RESPONSE FORMAT:
Provide your analysis in the following JSON structure:
{
  "overallScore": number (1-10),
  "skillsScore": number (1-10),
  "experienceScore": number (1-10),
  "educationScore": number (1-10),
  "reasoning": "Detailed explanation of the score",
  "strengths": ["List of candidate strengths"],
  "weaknesses": ["List of areas for improvement"],
  "recommendations": ["Actionable hiring recommendations"],
  "matchedSkills": ["Skills that align with requirements"],
  "missingSkills": ["Critical skills the candidate lacks"],
  "experienceHighlights": ["Relevant experience points"],
  "riskFactors": ["Potential concerns or red flags"]
}

Be objective, specific, and provide concrete examples to support your assessment.`;
  }

  /**
   * Build comparison prompt with resume and job data
   */
  buildComparisonPrompt(resumeData, jobDescription) {
    return `
RESUME ANALYSIS REQUEST

CANDIDATE PROFILE:
Name: ${resumeData.candidateName || 'Not specified'}
Total Experience: ${resumeData.extractedData?.totalExperienceYears || 0} years

SKILLS:
${this.formatSkills(resumeData.extractedData?.skills || [])}

EXPERIENCE:
${this.formatExperience(resumeData.extractedData?.experience || [])}

EDUCATION:
${this.formatEducation(resumeData.extractedData?.education || [])}

CERTIFICATIONS:
${this.formatCertifications(resumeData.extractedData?.certifications || [])}

SUMMARY:
${resumeData.extractedData?.summary || 'No summary available'}

---

JOB DESCRIPTION TO MATCH:

POSITION: ${jobDescription.title}
COMPANY: ${jobDescription.company}
EXPERIENCE LEVEL: ${jobDescription.experienceLevel}
MINIMUM EXPERIENCE: ${jobDescription.requirements?.minimumExperience || 0} years

REQUIRED SKILLS:
${this.formatJobSkills(jobDescription.requirements?.requiredSkills || [])}

PREFERRED SKILLS:
${this.formatJobSkills(jobDescription.requirements?.preferredSkills || [])}

JOB DESCRIPTION:
${jobDescription.description}

RESPONSIBILITIES:
${jobDescription.responsibilities?.join('\n• ') || 'Not specified'}

REQUIREMENTS:
Education: ${jobDescription.requirements?.educationRequirement || 'Not specified'}
Certifications: ${jobDescription.requirements?.certifications?.join(', ') || 'Not specified'}

---

ANALYSIS REQUEST:
Compare this resume with the job description and rate the candidate's fit on a scale of 1-10 with detailed justification. Focus on:

1. Technical skill alignment and proficiency levels
2. Relevant work experience and achievements
3. Educational background compatibility
4. Overall role suitability and growth potential

Provide specific examples and be constructive in your feedback. Consider both current fit and future potential.`;
  }

  /**
   * Format skills for prompt
   */
  formatSkills(skills) {
    if (!skills || skills.length === 0) return 'No skills listed';
    
    const grouped = skills.reduce((acc, skill) => {
      const category = skill.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(`${skill.name} (${skill.proficiencyLevel || 'unknown'})`);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([category, skillList]) => `${category.toUpperCase()}: ${skillList.join(', ')}`)
      .join('\n');
  }

  /**
   * Format experience for prompt
   */
  formatExperience(experience) {
    if (!experience || experience.length === 0) return 'No experience listed';
    
    return experience
      .map(exp => {
        const duration = exp.duration || 
          (exp.startDate && exp.endDate ? 
            `${exp.startDate.getFullYear()} - ${exp.isCurrent ? 'Present' : exp.endDate.getFullYear()}` : 
            'Unknown duration');
        
        return `• ${exp.position || 'Unknown Position'} at ${exp.company || 'Unknown Company'} (${duration})
  ${exp.description ? exp.description.substring(0, 200) + '...' : 'No description'}`;
      })
      .join('\n\n');
  }

  /**
   * Format education for prompt
   */
  formatEducation(education) {
    if (!education || education.length === 0) return 'No education listed';
    
    return education
      .map(edu => {
        return `• ${edu.degree || 'Unknown Degree'} - ${edu.institution || 'Unknown Institution'} (${edu.graduationYear || 'Unknown Year'})`;
      })
      .join('\n');
  }

  /**
   * Format certifications for prompt
   */
  formatCertifications(certifications) {
    if (!certifications || certifications.length === 0) return 'No certifications listed';
    
    return certifications
      .map(cert => `• ${cert.name} - ${cert.issuer || 'Unknown Issuer'}`)
      .join('\n');
  }

  /**
   * Format job skills for prompt
   */
  formatJobSkills(skills) {
    if (!skills || skills.length === 0) return 'None specified';
    
    return skills
      .map(skill => {
        const importance = skill.importance ? ` (${skill.importance})` : '';
        return `• ${skill.name}${importance}`;
      })
      .join('\n');
  }

  /**
   * Parse LLM response and extract structured data
   */
  parseResponse(content, originalPrompt) {
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      let parsedData = {};
      
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[0]);
        } catch (jsonError) {
          console.warn('Failed to parse JSON from LLM response, using text analysis');
          parsedData = this.extractDataFromText(content);
        }
      } else {
        parsedData = this.extractDataFromText(content);
      }

      // Ensure all required fields are present
      const result = {
        prompt: originalPrompt,
        response: content,
        reasoning: parsedData.reasoning || this.extractReasoning(content),
        overallScore: this.validateScore(parsedData.overallScore) || this.extractScore(content),
        skillsScore: this.validateScore(parsedData.skillsScore) || 5,
        experienceScore: this.validateScore(parsedData.experienceScore) || 5,
        educationScore: this.validateScore(parsedData.educationScore) || 5,
        strengths: parsedData.strengths || this.extractList(content, 'strength'),
        weaknesses: parsedData.weaknesses || this.extractList(content, 'weakness'),
        recommendations: parsedData.recommendations || this.extractList(content, 'recommend'),
        matchedSkills: parsedData.matchedSkills || [],
        missingSkills: parsedData.missingSkills || [],
        experienceHighlights: parsedData.experienceHighlights || [],
        riskFactors: parsedData.riskFactors || []
      };

      return result;
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      
      // Fallback response
      return {
        prompt: originalPrompt,
        response: content,
        reasoning: 'Analysis completed but parsing encountered issues. Please review the full response.',
        overallScore: this.extractScore(content) || 5,
        skillsScore: 5,
        experienceScore: 5,
        educationScore: 5,
        strengths: ['Analysis available in full response'],
        weaknesses: ['Manual review recommended'],
        recommendations: ['Review detailed analysis in response'],
        matchedSkills: [],
        missingSkills: [],
        experienceHighlights: [],
        riskFactors: []
      };
    }
  }

  /**
   * Extract data from unstructured text
   */
  extractDataFromText(text) {
    return {
      reasoning: this.extractReasoning(text),
      overallScore: this.extractScore(text),
      strengths: this.extractList(text, 'strength'),
      weaknesses: this.extractList(text, 'weakness'),
      recommendations: this.extractList(text, 'recommend')
    };
  }

  /**
   * Extract reasoning from text
   */
  extractReasoning(text) {
    // Look for explanation sections
    const reasoningPatterns = [
      /reasoning[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/is,
      /explanation[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/is,
      /analysis[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/is
    ];

    for (const pattern of reasoningPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim().substring(0, 500);
      }
    }

    // Fallback: take first substantial paragraph
    const paragraphs = text.split('\n\n').filter(p => p.length > 50);
    return paragraphs[0]?.substring(0, 500) || 'Analysis completed successfully.';
  }

  /**
   * Extract numerical score from text
   */
  extractScore(text) {
    // Look for score patterns
    const scorePatterns = [
      /overall\s*score[:\s]*(\d+(?:\.\d+)?)/i,
      /score[:\s]*(\d+(?:\.\d+)?)/i,
      /rate[:\s]*(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*\/\s*10/i,
      /(\d+(?:\.\d+)?)\s*out\s*of\s*10/i
    ];

    for (const pattern of scorePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const score = parseFloat(match[1]);
        if (score >= 1 && score <= 10) {
          return score;
        }
      }
    }

    return 5; // Default middle score
  }

  /**
   * Extract list items from text
   */
  extractList(text, keyword) {
    const items = [];
    const lines = text.split('\n');
    
    let inSection = false;
    const sectionRegex = new RegExp(keyword, 'i');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (sectionRegex.test(trimmed)) {
        inSection = true;
        continue;
      }
      
      if (inSection) {
        // Check if we've moved to a new section
        if (trimmed.match(/^[A-Z][A-Za-z\s]+:/) && !sectionRegex.test(trimmed)) {
          break;
        }
        
        // Extract list items
        if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+\.\s/)) {
          const item = trimmed.replace(/^[-•*\d+.\s]+/, '').trim();
          if (item.length > 5 && item.length < 200) {
            items.push(item);
          }
        }
      }
    }
    
    return items.slice(0, 5); // Limit to 5 items
  }

  /**
   * Validate score is within acceptable range
   */
  validateScore(score) {
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 1 || numScore > 10) {
      return null;
    }
    return numScore;
  }

  /**
   * Generate skill-specific analysis
   */
  async analyzeSkillGaps(candidateSkills, requiredSkills) {
    try {
      const prompt = this.buildSkillGapPrompt(candidateSkills, requiredSkills);
      const payload = {
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a technical skills assessment expert. Analyze skill gaps and provide specific learning recommendations.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1, // Lower temperature for cost-saving
        max_tokens: 512   // Lower max_tokens for cost-saving
      };
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      };
      const response = await axios.post(this.apiUrl, payload, { headers });
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Skill gap analysis error:', error?.response?.data || error);
      return 'Skill gap analysis not available at this time.';
    }
  }

  /**
   * Build skill gap analysis prompt
   */
  buildSkillGapPrompt(candidateSkills, requiredSkills) {
    return `
SKILL GAP ANALYSIS

CANDIDATE SKILLS:
${candidateSkills.map(skill => `• ${skill.name} (${skill.proficiencyLevel})`).join('\n')}

REQUIRED SKILLS:
${requiredSkills.map(skill => `• ${skill.name} (${skill.importance || 'required'})`).join('\n')}

Please analyze:
1. Which required skills the candidate has and their proficiency levels
2. Which critical skills are missing
3. Skill development recommendations with priority levels
4. Estimated timeline for skill gap closure

Provide specific, actionable advice for both the candidate and hiring manager.`;
  }

  /**
   * Determine match status based on overall score
   */
  determineMatchStatus(score) {
    if (score >= 8.5) return 'excellent';
    if (score >= 7) return 'good';
    if (score >= 5) return 'average';
    return 'poor';
  }

  /**
   * Check if candidate should be shortlisted
   */
  shouldShortlist(score, matchStatus) {
    return score >= 7 || matchStatus === 'excellent' || matchStatus === 'good';
  }
}

module.exports = LLMService;