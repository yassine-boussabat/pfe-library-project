const axios = require('axios');

class LocalAiService {
  constructor() {
    this.ollamaUrl = 'http://localhost:11434';
    this.model = 'qwen2.5:7b';
  }

  async checkOllamaConnection() {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      const models = response.data.models || [];
      const hasModel = models.some(m => m.name.includes('qwen2.5:7b'));
      
      if (hasModel) {
        console.log('Ollama connected with Qwen2.5:7B model');
        return true;
      } else {
        console.log(' Ollama connected but Qwen2.5:7B model not found');
        console.log('Available models:', models.map(m => m.name));
        console.log(' Please run: ollama pull qwen2.5:7b');
        return false;
      }
    } catch (error) {
      console.error(' Ollama connection failed:', error.message);
      return false;
    }
  }

  async generateSummaryAndKeywords(text, filename = '') {
    try {
      
      const filenameInfo = this.extractInfoFromFilename(filename);
      
      const prompt = `Tu es un expert en analyse de documents PFE. Analyse ce document et extrais UNIQUEMENT les technologies de cette liste:

TECHNOLOGIES AUTORISÉES: JavaScript, React, Angular, Vue.js, Python, Java, C++, C#, PHP, MySQL, MongoDB, PostgreSQL, Firebase, AWS, Azure, Docker, Kubernetes, Git, Machine Learning, Deep Learning, IoT, Blockchain, Cybersécurité, DevOps, API REST, Microservices, UI/UX, Bootstrap, Tailwind CSS, Figma, Linux, Redis, GraphQL, Jenkins, Unity, Flutter, Swift, Kotlin, Go, Rust, Ruby

Document: ${text.substring(0, 2500)}

IMPORTANT: Utilise SEULEMENT les technologies de la liste ci-dessus. N'invente pas de nouveaux termes.

Format exact:
SUJET: [Résume le contenu de ce PDF en 2-3 phrases maximum]
TECHNOLOGIES: [Seulement de la liste autorisée, séparées par des virgules]
DOMAINE: [Informatique, Génie Électrique, Génie Mécanique, etc.]`;

      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 120,
          num_ctx: 6144,
          top_k: 10,
          top_p: 0.8,
          repeat_penalty: 1.15,
          stop: ['\n\n', 'Document:', 'Analyse:', 'Instructions:', 'IMPORTANT:']
        }
      }, {
        timeout: 60000
      });

      let aiResponse = response.data.response.trim();
      console.log(' Qwen2.5:7B response:', aiResponse.substring(0, 200) + '...');
      
      let parsed = this.parseQwenResponse(aiResponse);
      
      return {
        summary: parsed.summary || this.extractSubject(text) || 'Analyse du projet PFE en cours',
        keywords: this.enhanceKeywords(parsed.technologies, text),
        department: parsed.department || this.extractDepartment(text),
        projectType: this.determineProjectType(parsed.summary, parsed.technologies),
        author: filenameInfo.author,
        year: filenameInfo.year,
        confidence: this.calculateConfidence(parsed, text)
      };

    } catch (error) {
      console.error('Qwen2.5:7B processing failed:', error.message);
      return this.fallbackExtraction(text, filename);
    }
  }

  parseQwenResponse(response) {
    try {
      const result = {};
      
      const patterns = {
        summary: [
          /SUJET:\s*([^\n]+)/i,
          /SUBJECT:\s*([^\n]+)/i,
          /PROJET:\s*([^\n]+)/i,
          /PROJECT:\s*([^\n]+)/i,
          /RÉSUMÉ:\s*([^\n]+)/i,
          /SUMMARY:\s*([^\n]+)/i
        ],
        technologies: [
          /TECHNOLOGIES:\s*([^\n]+)/i,
          /TECH:\s*([^\n]+)/i,
          /OUTILS:\s*([^\n]+)/i,
          /TOOLS:\s*([^\n]+)/i
        ],
        department: [
          /DOMAINE:\s*([^\n]+)/i,
          /DOMAIN:\s*([^\n]+)/i,
          /DÉPARTEMENT:\s*([^\n]+)/i,
          /DEPARTMENT:\s*([^\n]+)/i,
          /FIELD:\s*([^\n]+)/i
        ]
      };

      for (const [field, fieldPatterns] of Object.entries(patterns)) {
        for (const pattern of fieldPatterns) {
          const match = response.match(pattern);
          if (match && match[1]) {
            if (field === 'technologies') {
              const techText = match[1].replace(/[\[\]]/g, '');
              const extractedTechs = techText.split(/[,;]/)
                                           .map(t => t.trim())
                                           .filter(t => t.length > 0);
              
              result[field] = this.validateTechnologies(extractedTechs);
            } else {
              result[field] = match[1].trim().replace(/['"]/g, '');
            }
            break;
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('Failed to parse Qwen2.5 response:', error);
      return {};
    }
  }

  validateTechnologies(extractedTechs) {
    const validKeywordNames = [
      'JavaScript', 'React', 'Angular', 'Vue.js', 'Python', 'Java', 'C++', 'C#', 'PHP',
      'MySQL', 'MongoDB', 'PostgreSQL', 'SQL Server', 'Firebase', 'AWS', 'Azure',
      'Docker', 'Kubernetes', 'Git', 'Machine Learning', 'Deep Learning', 'IoT',
      'Blockchain', 'Cybersécurité', 'DevOps', 'API REST', 'Microservices', 'UI/UX',
      'Bootstrap', 'Tailwind CSS', 'SASS/SCSS', 'Figma', 'Linux', 'Redis', 'GraphQL',
      'Jenkins', 'Nginx', 'Apache', 'Elasticsearch', 'Kafka', 'Terraform', 'Ansible',
      'Unity', 'Flutter', 'Swift', 'Kotlin', 'Go', 'Rust', 'Ruby', 'Scala', 'R',
      'MATLAB', 'Tableau', 'Power BI', 'Photoshop', 'Illustrator', 'Sketch', 'InVision'
    ];

    const validTechs = [];
    
    for (const tech of extractedTechs) {
      const exactMatch = validKeywordNames.find(valid => 
        valid.toLowerCase() === tech.toLowerCase()
      );
      
      if (exactMatch) {
        validTechs.push(exactMatch);
      }
    }

    return validTechs.slice(0, 6);
  }

  enhanceKeywords(aiKeywords, text) {
    const ruleBasedKeywords = this.extractKeywords(text);
    const validKeywords = new Set();
    
    const validKeywordNames = [
      'JavaScript', 'React', 'Angular', 'Vue.js', 'Python', 'Java', 'C++', 'C#', 'PHP',
      'MySQL', 'MongoDB', 'PostgreSQL', 'SQL Server', 'Firebase', 'AWS', 'Azure',
      'Docker', 'Kubernetes', 'Git', 'Machine Learning', 'Deep Learning', 'IoT',
      'Blockchain', 'Cybersécurité', 'DevOps', 'API REST', 'Microservices', 'UI/UX',
      'Bootstrap', 'Tailwind CSS', 'SASS/SCSS', 'Figma', 'Linux', 'Redis', 'GraphQL',
      'Jenkins', 'Nginx', 'Apache', 'Elasticsearch', 'Kafka', 'Terraform', 'Ansible',
      'Unity', 'Flutter', 'Swift', 'Kotlin', 'Go', 'Rust', 'Ruby', 'Scala', 'R',
      'MATLAB', 'Tableau', 'Power BI', 'Photoshop', 'Illustrator', 'Sketch', 'InVision'
    ];
    
    if (aiKeywords && Array.isArray(aiKeywords)) {
      aiKeywords.forEach(keyword => {
        if (keyword && validKeywordNames.includes(keyword)) {
          validKeywords.add(keyword);
        }
      });
    }
    
    ruleBasedKeywords.forEach(k => validKeywords.add(k));
    
    const result = Array.from(validKeywords).slice(0, 6);
    return result.length > 0 ? result : [];
  }

  determineProjectType(summary, technologies) {
    if (!summary && !technologies) return 'Projet Fin Études';
    
    const combinedText = `${summary || ''} ${(technologies || []).join(' ')}`.toLowerCase();
    
    const projectTypes = {
      'Application Web': ['web', 'site', 'html', 'css', 'javascript', 'react', 'angular', 'vue', 'php'],
      'Application Mobile': ['mobile', 'android', 'ios', 'flutter', 'react native', 'app', 'swift', 'kotlin'],
      'Système de Gestion': ['gestion', 'management', 'erp', 'crm', 'administration'],
      'Intelligence Artificielle': ['ai', 'machine learning', 'deep learning', 'neural', 'ia'],
      'Base de Données': ['database', 'sql', 'mongodb', 'mysql', 'postgresql'],
      'Système Embarqué': ['arduino', 'raspberry', 'iot', 'embedded', 'microcontroller'],
      'Analyse de Données': ['data analysis', 'analytics', 'visualization', 'tableau', 'r'],
      'Sécurité Informatique': ['security', 'cybersécurité', 'encryption', 'firewall'],
      'Infrastructure': ['docker', 'kubernetes', 'aws', 'azure', 'devops', 'linux'],
      'Jeu Vidéo': ['unity', 'game', 'gaming'],
      'Design UI/UX': ['figma', 'ui/ux', 'photoshop', 'illustrator', 'sketch']
    };

    let bestMatch = 'Application Logicielle';
    let maxScore = 0;

    for (const [type, keywords] of Object.entries(projectTypes)) {
      let score = 0;
      for (const keyword of keywords) {
        if (combinedText.includes(keyword)) score++;
      }
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = type;
      }
    }

    return bestMatch;
  }

  calculateConfidence(parsed, text) {
    let confidence = 0;
    
    if (parsed.summary && parsed.summary.length > 20) confidence += 40;
    if (parsed.technologies && parsed.technologies.length > 0) confidence += 30;
    if (parsed.department) confidence += 20;
    if (text.length > 500) confidence += 10;
    
    return Math.min(confidence, 100);
  }

  fallbackExtraction(text, filename) {
    
    const filenameInfo = this.extractInfoFromFilename(filename);
    
    return {
      summary: this.extractSubject(text) || 'Document PFE détecté - analyse en cours',
      keywords: this.extractKeywords(text),
      department: this.extractDepartment(text),
      projectType: 'Projet Fin Études',
      author: filenameInfo.author,
      year: filenameInfo.year,
      confidence: 60
    };
  }

  extractInfoFromFilename(filename) {
    let author = 'Auteur Inconnu';
    let year = 2025;

    try {
      if (!filename) return { author, year };
      
      const cleanName = filename.replace(/\.pdf$/i, '').trim();
      
      const patterns = [
        /(\d{4})\s*[-_]\s*(.+)$/i,
        /(.+)\s*[-_]\s*(\d{4})$/i,
        /PFE\s*[-_]\s*(\d{4})\s*[-_]\s*(.+)/i,
        /(.+)\s*PFE\s*(\d{4})/i
      ];
      
      for (const pattern of patterns) {
        const match = cleanName.match(pattern);
        if (match) {
          if (/^\d{4}/.test(match[1])) {
            year = parseInt(match[1]) || 2025;
            author = match[2] || 'Auteur Inconnu';
          } else {
            author = match[1] || 'Auteur Inconnu';
            year = parseInt(match[2]) || 2025;
          }
          break;
        }
      }
      
      if (author && author !== 'Auteur Inconnu') {
        author = author
          .replace(/[^\w\s\-'.,]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (author.length > 0) {
          author = author
            .split(/[\s\-_]/)
            .map(word => word.length > 0 ? 
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word)
            .join(' ');
        }
      }
      
    } catch (error) {
      console.error(' Enhanced filename parsing error:', error);
    }

    return { author, year };
  }

  extractSubject(text) {
    const subjectPatterns = [
      /sujet\s*du\s*projet\s*:(.+)/i,
      /sujet\s*:(.+)/i,
      /titre\s*du\s*projet\s*:(.+)/i,
      /titre\s*:(.+)/i,
      /thème\s*:(.+)/i,
      /problématique\s*:(.+)/i,
      /objectif\s*principal\s*:(.+)/i,
      /objectif\s*:(.+)/i,
      /but\s*du\s*projet\s*:(.+)/i,
      /contexte\s*et\s*objectif\s*:(.+)/i,
      /project\s*title\s*:(.+)/i,
      /subject\s*:(.+)/i,
      /title\s*:(.+)/i,
      /theme\s*:(.+)/i,
      /objective\s*:(.+)/i,
      /goal\s*:(.+)/i,
      /purpose\s*:(.+)/i
    ];

    const lines = text.split('\n').slice(0, 150);
    
    for (const line of lines) {
      for (const pattern of subjectPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          let subject = match[1].trim()
                                .replace(/[^\w\s\-.,()àáâãäèéêëìíîïòóôõöùúûüýÿç]/g, '')
                                .replace(/\s+/g, ' ');
          if (subject.length > 15 && subject.length < 400) {
            return subject;
          }
        }
      }
    }
    
    const contextPatterns = [
      /(?:contexte|context)(?:\s*générale?)?\s*:?\s*([^.!?]{30,300}[.!?])/i,
      /(?:introduction|présentation)\s*:?\s*([^.!?]{40,350}[.!?])/i,
      /(?:résumé|abstract|summary)\s*:?\s*([^.!?]{50,400}[.!?])/i,
      /(?:ce\s*projet|this\s*project)\s+(?:consiste|consists|vise|aims)\s+([^.!?]{30,300}[.!?])/i
    ];

    const fullText = text.substring(0, 4000);
    for (const pattern of contextPatterns) {
      const match = fullText.match(pattern);
      if (match && match[1]) {
        let context = match[1].trim().replace(/\s+/g, ' ');
        if (context.length > 30 && context.length < 350) {
          return context;
        }
      }
    }
    
    return 'Sujet du projet non spécifié dans le document';
  }

  extractDepartment(text) {
    const textLower = text.toLowerCase();
    
    const departmentMap = {
      'Informatique': [
        'informatique', 'computer science', 'software', 'programming', 'développement',
        'logiciel', 'système d\'information', 'web', 'mobile', 'app', 'application',
        'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node', 'php',
        'database', 'base de données', 'api', 'frontend', 'backend', 'full stack',
        'algorithme', 'structure de données', 'génie logiciel', 'sécurité informatique'
      ],
      'Génie Électrique': [
        'électrique', 'electrical', 'électronique', 'electronic', 'circuit',
        'microcontroller', 'microcontrôleur', 'arduino', 'raspberry', 'embedded',
        'iot', 'internet of things', 'sensor', 'capteur', 'automation', 'automatisation',
        'robotique', 'robotics', 'signal processing', 'traitement du signal'
      ],
      'Génie Mécanique': [
        'mécanique', 'mechanical', 'industriel', 'manufacturing', 'production',
        'design', 'conception', 'cao', 'cad', 'solidworks', 'autocad', 'catia',
        'thermodynamique', 'mécanique des fluides', 'résistance des matériaux'
      ],
      'Génie Civil': [
        'civil', 'construction', 'bâtiment', 'génie civil', 'architecture',
        'infrastructure', 'travaux publics', 'béton', 'structure', 'charpente'
      ],
      'Sciences des Données': [
        'data science', 'machine learning', 'intelligence artificielle', 'ai', 'ia',
        'deep learning', 'neural network', 'analytics', 'big data', 'statistiques',
        'data mining', 'apprentissage automatique', 'analyse de données'
      ],
      'Gestion et Administration': [
        'gestion', 'management', 'business', 'finance', 'marketing', 'commerce',
        'économie', 'administration', 'entreprise', 'comptabilité', 'ressources humaines'
      ],
      'Télécommunications': [
        'télécommunications', 'telecommunications', 'réseau', 'network', 'wifi',
        'protocole', 'tcp', 'ip', 'communication', 'antenne', 'radio fréquence'
      ]
    };

    let bestMatch = 'Informatique';
    let maxScore = 0;

    for (const [department, keywords] of Object.entries(departmentMap)) {
      let score = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(textLower)) {
          score += keyword.length > 10 ? 2 : 1;
        }
      }
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = department;
      }
    }

    return bestMatch;
  }

  extractKeywords(text) {
    const cleanText = text
      .toLowerCase()
      .replace(/[^\w\s\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
      
    console.log('🔍 Cleaned text sample:', cleanText.substring(0, 500));
    
    const foundKeywords = new Set();

    const keywordMap = {
      'Angular': [
        'angular', 
        'angular pour le frontend',
        'frontend angular',
        'connaissances angular'
      ],
      'Spring Boot': [
        'spring boot', 
        'springboot',
        'spring boot pour le backend',
        'backend spring boot',
        'connaissances spring boot'
      ],
      'SQL': [
        'sql',
        'connaissances sql',
        'base de données sql'
      ],
      'Java': ['java', 'jee', 'j2ee'],
      'Python': ['python'],
      'JavaScript': ['javascript', 'js'],
      'React': ['react', 'reactjs'],
      'Vue.js': ['vue', 'vuejs'],
      'C++': ['c++', 'cpp'],
      'C#': ['c#', 'csharp'],
      'PHP': ['php'],
      'MySQL': ['mysql'],
      'MongoDB': ['mongodb', 'mongo'],
      'PostgreSQL': ['postgresql', 'postgres'],
      'Firebase': ['firebase'],
      'AWS': ['aws'],
      'Azure': ['azure'],
      'Docker': ['docker'],
      'Git': ['git', 'github'],
      'Machine Learning': ['machine learning', 'ml', 'intelligence artificielle', 'ai', 'ia'],
      'Deep Learning': ['deep learning', 'neural network'],
      'IoT': ['iot', 'arduino', 'raspberry pi'],
      'API REST': ['rest api', 'restful', 'web service'],
      'UI/UX': ['ui', 'ux', 'design', 'ux ui'],
      'Bootstrap': ['bootstrap'],
      'CSS': ['css'],
      'HTML': ['html']
    };

    for (const [category, terms] of Object.entries(keywordMap)) {
      let found = false;
      
      for (const term of terms) {
        const termLower = term.toLowerCase();
        
        if (cleanText.includes(termLower)) {
          foundKeywords.add(category);
          found = true;
          break;
        }
        
        if (term.includes(' ') && !found) {
          const words = term.split(' ');
          const allWordsFound = words.every(word => cleanText.includes(word));
          if (allWordsFound) {
            foundKeywords.add(category);
            found = true;
            break;
          }
        }
        
        if (!found && !term.includes(' ')) {
          const regex = new RegExp(termLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          if (regex.test(cleanText)) {
            foundKeywords.add(category);
            found = true;
            break;
          }
        }
      }
    }

    const result = Array.from(foundKeywords).slice(0, 8);
    console.log('FINAL RESULT - Extracted keywords:', result);
    
    return result;
  }

  async extractTextFromPDF(pdfBuffer) {
    const pdf = require('pdf-parse');
    try {
      const data = await pdf(pdfBuffer, {
        max: 20,
      });
      
      const cleanText = data.text
        .replace(/\s+/g, ' ')
        .replace(/[^\x20-\x7E\u00C0-\u017F]/g, '')
        .trim();
      
      return cleanText;
    } catch (error) {
      console.error('Enhanced PDF text extraction failed:', error);
      return 'Échec de l\'extraction du texte PDF';
    }
  }

  extractMetadataFromText(text) {
    return {
      author: 'Auteur Inconnu',
      department: this.extractDepartment(text),
      year: 2025,
      wordCount: text.split(/\s+/).length,
      hasStructuredContent: text.includes(':') && text.includes('\n')
    };
  }
}

module.exports = new LocalAiService();
