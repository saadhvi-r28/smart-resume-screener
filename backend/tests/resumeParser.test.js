const ResumeParserService = require('../src/services/ResumeParserService');

describe('ResumeParserService', () => {
  let parserService;

  beforeEach(() => {
    parserService = new ResumeParserService();
  });

  describe('extractStructuredData', () => {
    it('should extract skills from resume text', async () => {
      const resumeText = `
        John Doe
        Software Engineer
        Skills: JavaScript, React, Node.js, Python, Leadership, Communication
        Experience: 5 years in web development
      `;

      const result = await parserService.extractStructuredData(resumeText);

      expect(result).toHaveProperty('skills');
      expect(Array.isArray(result.skills)).toBe(true);
      expect(result.skills.length).toBeGreaterThan(0);
      
      const skillNames = result.skills.map(skill => skill.name.toLowerCase());
      expect(skillNames).toContain('javascript');
      expect(skillNames).toContain('react');
      expect(skillNames).toContain('node.js');
    });

    it('should extract experience information', async () => {
      const resumeText = `
        Experience:
        Senior Developer at Tech Corp (2020-2023)
        Led development of web applications using React and Node.js
        
        Junior Developer at StartUp Inc (2018-2020)
        Developed mobile applications
      `;

      const result = await parserService.extractStructuredData(resumeText);

      expect(result).toHaveProperty('experience');
      expect(Array.isArray(result.experience)).toBe(true);
      expect(result.experience.length).toBeGreaterThan(0);
    });

    it('should calculate total experience years', async () => {
      const resumeText = `
        John Doe has 5 years of experience in software development.
        Worked at various companies from 2018 to 2023.
      `;

      const result = await parserService.extractStructuredData(resumeText);

      expect(result).toHaveProperty('totalExperienceYears');
      expect(typeof result.totalExperienceYears).toBe('number');
      expect(result.totalExperienceYears).toBeGreaterThan(0);
    });
  });

  describe('categorizeSkill', () => {
    it('should categorize technical skills correctly', () => {
      const technicalSkills = ['javascript', 'python', 'react', 'mongodb'];
      
      technicalSkills.forEach(skill => {
        const category = parserService.categorizeSkill(skill);
        expect(category).toBe('technical');
      });
    });

    it('should categorize soft skills correctly', () => {
      const softSkills = ['leadership', 'communication', 'teamwork'];
      
      softSkills.forEach(skill => {
        const category = parserService.categorizeSkill(skill);
        expect(category).toBe('soft');
      });
    });

    it('should return other for unknown skills', () => {
      const unknownSkill = 'some-unknown-skill-xyz';
      const category = parserService.categorizeSkill(unknownSkill);
      expect(category).toBe('other');
    });
  });

  describe('cleanText', () => {
    it('should normalize whitespace and convert to lowercase', () => {
      const dirtyText = '  This   is   SOME   text  with\n\n\nextra   spaces\n  ';
      const cleanedText = parserService.cleanText(dirtyText);
      
      expect(cleanedText).toBe('this is some text with\nextra spaces');
    });
  });

  describe('parseResume', () => {
    it('should handle text files', async () => {
      const textContent = 'John Doe\nSoftware Engineer\nSkills: JavaScript, Python';
      const buffer = Buffer.from(textContent, 'utf-8');

      const result = await parserService.parseResume(buffer, 'resume.txt', 'txt');

      expect(result).toHaveProperty('rawText');
      expect(result).toHaveProperty('extractedData');
      expect(result).toHaveProperty('metadata');
      expect(result.rawText).toContain('John Doe');
    });

    it('should throw error for unsupported file types', async () => {
      const buffer = Buffer.from('some content');

      await expect(
        parserService.parseResume(buffer, 'resume.xyz', 'xyz')
      ).rejects.toThrow('Unsupported file type: xyz');
    });
  });

  describe('extractSkills', () => {
    it('should find skills in different text formats', () => {
      const texts = [
        'Skills: JavaScript, Python, React',
        'Technical Skills: Node.js, MongoDB, AWS',
        'I have experience with JavaScript and Python programming',
        'Proficient in React, Angular, and Vue.js frameworks'
      ];

      texts.forEach(text => {
        const skills = parserService.extractSkills(text.toLowerCase());
        expect(Array.isArray(skills)).toBe(true);
        expect(skills.length).toBeGreaterThan(0);
      });
    });

    it('should not return duplicate skills', () => {
      const text = 'javascript, JavaScript, JAVASCRIPT, JS, React, react, REACT';
      const skills = parserService.extractSkills(text.toLowerCase());
      
      const skillNames = skills.map(skill => skill.name.toLowerCase());
      const uniqueSkills = [...new Set(skillNames)];
      
      expect(skillNames.length).toBe(uniqueSkills.length);
    });
  });
});