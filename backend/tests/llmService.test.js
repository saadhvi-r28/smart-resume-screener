const LLMService = require('../src/services/LLMService');

describe('LLMService', () => {
  let llmService;

  beforeEach(() => {
    llmService = new LLMService();
  });

  describe('compareResumeWithJob', () => {
    const mockResume = {
      candidateName: 'John Doe',
      extractedData: {
        skills: [
          { name: 'JavaScript', category: 'technical', proficiencyLevel: 'advanced' },
          { name: 'React', category: 'technical', proficiencyLevel: 'intermediate' },
          { name: 'Leadership', category: 'soft', proficiencyLevel: 'expert' }
        ],
        experience: [
          {
            company: 'Tech Corp',
            position: 'Senior Developer',
            duration: '2020-2023',
            description: 'Led development team'
          }
        ],
        education: [
          { degree: 'Bachelor of Science in Computer Science', institution: 'Tech University' }
        ],
        totalExperienceYears: 5,
        summary: 'Experienced software developer with strong technical skills'
      }
    };

    const mockJob = {
      title: 'Senior Full Stack Developer',
      company: 'Innovation Labs',
      experienceLevel: 'senior',
      description: 'Looking for experienced developer with JavaScript and React skills',
      requirements: {
        requiredSkills: [
          { name: 'JavaScript', importance: 'must-have' },
          { name: 'React', importance: 'must-have' },
          { name: 'Node.js', importance: 'nice-to-have' }
        ],
        minimumExperience: 3,
        educationRequirement: 'Bachelor degree in Computer Science or related field'
      },
      responsibilities: ['Develop web applications', 'Lead technical decisions']
    };

    it('should return structured analysis result', async () => {
      const result = await llmService.compareResumeWithJob(mockResume, mockJob);

      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('weaknesses');
      expect(result).toHaveProperty('recommendations');

      expect(typeof result.overallScore).toBe('number');
      expect(result.overallScore).toBeGreaterThanOrEqual(1);
      expect(result.overallScore).toBeLessThanOrEqual(10);

      expect(Array.isArray(result.strengths)).toBe(true);
      expect(Array.isArray(result.weaknesses)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should handle missing data gracefully', async () => {
      const incompleteResume = {
        candidateName: 'Jane Doe',
        extractedData: {
          skills: [],
          experience: [],
          education: [],
          totalExperienceYears: 0
        }
      };

      const result = await llmService.compareResumeWithJob(incompleteResume, mockJob);

      expect(result).toHaveProperty('overallScore');
      expect(typeof result.overallScore).toBe('number');
    });
  });

  describe('formatSkills', () => {
    it('should format skills by category', () => {
      const skills = [
        { name: 'JavaScript', category: 'technical', proficiencyLevel: 'advanced' },
        { name: 'React', category: 'technical', proficiencyLevel: 'intermediate' },
        { name: 'Leadership', category: 'soft', proficiencyLevel: 'expert' }
      ];

      const formatted = llmService.formatSkills(skills);

      expect(formatted).toContain('TECHNICAL:');
      expect(formatted).toContain('SOFT:');
      expect(formatted).toContain('JavaScript (advanced)');
      expect(formatted).toContain('React (intermediate)');
      expect(formatted).toContain('Leadership (expert)');
    });

    it('should handle empty skills array', () => {
      const formatted = llmService.formatSkills([]);
      expect(formatted).toBe('No skills listed');
    });
  });

  describe('validateScore', () => {
    it('should accept valid scores', () => {
      const validScores = [1, 5.5, 10, '7.3', '9'];
      
      validScores.forEach(score => {
        const result = llmService.validateScore(score);
        expect(result).not.toBeNull();
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(10);
      });
    });

    it('should reject invalid scores', () => {
      const invalidScores = [0, -1, 11, 'invalid', null, undefined];
      
      invalidScores.forEach(score => {
        const result = llmService.validateScore(score);
        expect(result).toBeNull();
      });
    });
  });

  describe('determineMatchStatus', () => {
    it('should determine correct match status', () => {
      const testCases = [
        { score: 9.5, expected: 'excellent' },
        { score: 8.0, expected: 'good' },
        { score: 7.5, expected: 'good' },
        { score: 6.0, expected: 'average' },
        { score: 4.0, expected: 'poor' },
        { score: 2.0, expected: 'poor' }
      ];

      testCases.forEach(({ score, expected }) => {
        const status = llmService.determineMatchStatus(score);
        expect(status).toBe(expected);
      });
    });
  });

  describe('shouldShortlist', () => {
    it('should shortlist high-scoring candidates', () => {
      expect(llmService.shouldShortlist(8.5, 'excellent')).toBe(true);
      expect(llmService.shouldShortlist(7.2, 'good')).toBe(true);
      expect(llmService.shouldShortlist(9.0, 'excellent')).toBe(true);
    });

    it('should not shortlist low-scoring candidates', () => {
      expect(llmService.shouldShortlist(5.0, 'average')).toBe(false);
      expect(llmService.shouldShortlist(3.0, 'poor')).toBe(false);
      expect(llmService.shouldShortlist(2.0, 'poor')).toBe(false);
    });
  });

  describe('parseResponse', () => {
    it('should parse valid JSON response', () => {
      const jsonResponse = JSON.stringify({
        overallScore: 8.5,
        reasoning: 'Good candidate with relevant skills',
        strengths: ['Strong technical background'],
        weaknesses: ['Limited leadership experience']
      });

      const result = llmService.parseResponse(jsonResponse, 'test prompt');

      expect(result.overallScore).toBe(8.5);
      expect(result.reasoning).toBe('Good candidate with relevant skills');
      expect(result.strengths).toContain('Strong technical background');
    });

    it('should handle malformed JSON gracefully', () => {
      const malformedResponse = 'This is not JSON but contains score: 7.5';
      
      const result = llmService.parseResponse(malformedResponse, 'test prompt');

      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('reasoning');
      expect(result.overallScore).toBe(7.5); // Should extract score from text
    });

    it('should provide fallback for completely invalid response', () => {
      const invalidResponse = 'Random text without any useful information';
      
      const result = llmService.parseResponse(invalidResponse, 'test prompt');

      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('reasoning');
      expect(result.overallScore).toBe(5); // Default fallback score
    });
  });
});