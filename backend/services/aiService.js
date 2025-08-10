const { GoogleGenerativeAI } = require('@google/generative-ai');
const Redis = require('ioredis');
const pdfParse = require('pdf-parse');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Initialize Redis for caching
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    // Rate limiting
    this.requestQueue = [];
    this.isProcessing = false;
    this.requestsPerMinute = 60;
    this.requestCount = 0;
    this.resetTime = Date.now() + 60000;

    // Initialize Redis connection
    this.initRedis();
  }

  async initRedis() {
    try {
      await this.redis.connect();
      console.log('Redis connected for AI caching');
    } catch (error) {
      console.warn('Redis connection failed, AI caching disabled:', error.message);
      this.redis = null;
    }
  }

  // Rate limiting helper
  async checkRateLimit() {
    const now = Date.now();
    if (now > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = now + 60000;
    }

    if (this.requestCount >= this.requestsPerMinute) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    this.requestCount++;
  }

  // Cache helper
  async getCached(key) {
    if (!this.redis) return null;
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Cache get error:', error.message);
      return null;
    }
  }

  async setCached(key, data, ttl = 86400) { // 24 hours default
    if (!this.redis) return;
    try {
      await this.redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.warn('Cache set error:', error.message);
    }
  }

  // A. TENDER ANALYSIS FUNCTION
  async analyzeTender(tenderData) {
    const cacheKey = `tender_analysis_${tenderData.id}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    await this.checkRateLimit();

    const prompt = `
Analyze this government tender and provide detailed insights:

TENDER DETAILS:
Title: ${tenderData.title}
Department: ${tenderData.department}
Description: ${tenderData.description}
Budget: ${tenderData.budget}
Category: ${tenderData.category}
Location: ${tenderData.location}
Deadline: ${tenderData.deadline}
Eligibility: ${tenderData.eligibility_criteria || 'Not specified'}

Please analyze and provide a JSON response with:
1. summary: Brief 2-line executive summary (max 100 words)
2. key_requirements: Array of top 5 main requirements
3. estimated_complexity: "Low", "Medium", or "High" with reasoning
4. required_expertise: Array of technical skills needed
5. potential_challenges: Array of possible difficulties
6. recommended_team_size: Number (1-50)
7. estimated_timeline: Duration estimate (e.g., "3-6 months")
8. risk_factors: Array of potential risks
9. success_factors: Array of factors for success

Format response as valid JSON only.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean and parse JSON response
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const analysis = JSON.parse(cleanedText);

      // Cache the result
      await this.setCached(cacheKey, analysis, 86400); // 24 hours

      return analysis;
    } catch (error) {
      console.error('Tender analysis error:', error);
      return this.getFallbackAnalysis(tenderData);
    }
  }

  // B. TENDER MATCHING FUNCTION
  async matchTenderToProfile(userProfile, tenderData) {
    const cacheKey = `tender_match_${userProfile.id}_${tenderData.id}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    await this.checkRateLimit();

    const prompt = `
Match this company profile with tender requirements and provide compatibility analysis:

COMPANY PROFILE:
Company: ${userProfile.company_name || 'Individual'}
Industry: ${userProfile.industry || 'Not specified'}
Experience: ${userProfile.experience_years || 0} years
Specializations: ${userProfile.specializations?.join(', ') || 'Not specified'}
Past Projects: ${userProfile.past_projects || 'Not specified'}
Team Size: ${userProfile.team_size || 'Not specified'}
Certifications: ${userProfile.certifications?.join(', ') || 'None'}
Annual Revenue: ${userProfile.annual_revenue || 'Not specified'}

TENDER REQUIREMENTS:
Title: ${tenderData.title}
Department: ${tenderData.department}
Category: ${tenderData.category}
Budget: ${tenderData.budget}
Description: ${tenderData.description}
Eligibility: ${tenderData.eligibility_criteria || 'Not specified'}
Location: ${tenderData.location}

Provide a JSON response with:
1. match_score: Number 0-100 (percentage match)
2. matching_factors: Array of strengths that match (max 5)
3. missing_requirements: Array of gaps to address (max 5)
4. recommendations: Array of specific improvement suggestions
5. competitive_advantage: Array of unique strengths
6. risk_assessment: "Low", "Medium", or "High" with reasoning
7. bid_probability: "Low", "Medium", or "High"

Format response as valid JSON only.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const matching = JSON.parse(cleanedText);

      await this.setCached(cacheKey, matching, 43200); // 12 hours

      return matching;
    } catch (error) {
      console.error('Tender matching error:', error);
      return this.getFallbackMatching(userProfile, tenderData);
    }
  }

  // C. DOCUMENT ANALYZER
  async analyzeDocument(documentBuffer, filename) {
    const cacheKey = `doc_analysis_${Buffer.from(filename).toString('base64')}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    await this.checkRateLimit();

    try {
      let documentText = '';
      
      if (filename.toLowerCase().endsWith('.pdf')) {
        const pdfData = await pdfParse(documentBuffer);
        documentText = pdfData.text;
      } else {
        documentText = documentBuffer.toString('utf8');
      }

      const prompt = `
Analyze this tender document and extract key information:

DOCUMENT CONTENT:
${documentText.substring(0, 8000)} // Limit to avoid token limits

Extract and provide JSON response with:
1. extracted_dates: Object with key dates (submission_deadline, opening_date, etc.)
2. financial_requirements: Object with budget, EMD, security deposit details
3. technical_specifications: Array of technical requirements
4. evaluation_criteria: Object with scoring methodology
5. important_clauses: Array of critical terms and conditions
6. contact_information: Object with contact details
7. document_type: Type of document (RFP, EOI, etc.)
8. mandatory_requirements: Array of must-have requirements

Format response as valid JSON only.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const analysis = JSON.parse(cleanedText);

      await this.setCached(cacheKey, analysis, 604800); // 7 days

      return analysis;
    } catch (error) {
      console.error('Document analysis error:', error);
      return this.getFallbackDocumentAnalysis();
    }
  }

  // D. BID ASSISTANT
  async generateBidAssistance(tenderData, userProfile) {
    const cacheKey = `bid_assist_${tenderData.id}_${userProfile.id}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    await this.checkRateLimit();

    const prompt = `
Generate bid preparation assistance for this tender:

TENDER DETAILS:
${JSON.stringify(tenderData, null, 2)}

USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

Provide comprehensive bid assistance as JSON:
1. proposal_outline: Detailed structure for the proposal
2. key_points_to_address: Array of critical points to cover
3. pricing_strategy: Detailed pricing recommendations
4. competitive_advantages: How to highlight strengths
5. risk_mitigation: Strategies to address potential risks
6. document_checklist: Array of required documents
7. timeline_suggestions: Recommended project timeline
8. team_composition: Suggested team structure
9. compliance_checklist: Regulatory compliance points
10. submission_tips: Best practices for submission

Format response as valid JSON only.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const assistance = JSON.parse(cleanedText);

      await this.setCached(cacheKey, assistance, 43200); // 12 hours

      return assistance;
    } catch (error) {
      console.error('Bid assistance error:', error);
      return this.getFallbackBidAssistance(tenderData);
    }
  }

  // SEMANTIC SEARCH WITH EMBEDDINGS
  async generateEmbedding(text) {
    const cacheKey = `embedding_${Buffer.from(text).toString('base64').substring(0, 50)}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    await this.checkRateLimit();

    try {
      // Use Gemini for text embedding
      const model = this.genAI.getGenerativeModel({ model: 'embedding-001' });
      const result = await model.embedContent(text);
      const embedding = result.embedding.values;

      await this.setCached(cacheKey, embedding, 604800); // 7 days

      return embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      // Fallback to simple text similarity
      return this.generateSimpleEmbedding(text);
    }
  }

  async semanticSearch(query, tenders, limit = 10) {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      const results = [];

      for (const tender of tenders) {
        const tenderText = `${tender.title} ${tender.description} ${tender.category} ${tender.department}`;
        const tenderEmbedding = await this.generateEmbedding(tenderText);
        
        const similarity = this.cosineSimilarity(queryEmbedding, tenderEmbedding);
        results.push({
          ...tender,
          similarity_score: similarity,
          relevance: similarity > 0.7 ? 'High' : similarity > 0.5 ? 'Medium' : 'Low'
        });
      }

      return results
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, limit);
    } catch (error) {
      console.error('Semantic search error:', error);
      return this.fallbackSearch(query, tenders, limit);
    }
  }

  // UTILITY FUNCTIONS

  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  generateSimpleEmbedding(text) {
    // Simple fallback embedding based on word frequency
    const words = text.toLowerCase().split(/\W+/);
    const embedding = new Array(100).fill(0);
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word) % 100;
      embedding[hash] += 1;
    });
    
    return embedding;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // FALLBACK FUNCTIONS

  getFallbackAnalysis(tenderData) {
    const budgetNum = parseFloat(tenderData.budget?.replace(/[^\d.]/g, '')) || 0;
    
    return {
      summary: `Government tender for ${tenderData.category} in ${tenderData.department}. Budget: ${tenderData.budget}.`,
      key_requirements: [
        'Valid business registration',
        'Technical expertise in ' + tenderData.category,
        'Financial capability',
        'Compliance with eligibility criteria',
        'Timely delivery capability'
      ],
      estimated_complexity: budgetNum > 5000000 ? 'High' : budgetNum > 1000000 ? 'Medium' : 'Low',
      required_expertise: [tenderData.category, 'Project Management', 'Government Compliance'],
      potential_challenges: ['Strict compliance requirements', 'Competition', 'Timeline constraints'],
      recommended_team_size: budgetNum > 5000000 ? 15 : budgetNum > 1000000 ? 8 : 3,
      estimated_timeline: budgetNum > 5000000 ? '6-12 months' : budgetNum > 1000000 ? '3-6 months' : '1-3 months',
      risk_factors: ['Regulatory changes', 'Payment delays', 'Technical challenges'],
      success_factors: ['Strong technical team', 'Past experience', 'Competitive pricing']
    };
  }

  getFallbackMatching(userProfile, tenderData) {
    const categoryMatch = userProfile.specializations?.includes(tenderData.category) ? 30 : 0;
    const experienceMatch = (userProfile.experience_years || 0) >= 2 ? 25 : 10;
    const baseScore = 45;
    
    return {
      match_score: Math.min(100, baseScore + categoryMatch + experienceMatch),
      matching_factors: ['Industry experience', 'Technical capabilities'],
      missing_requirements: ['Specific certifications', 'Larger team size'],
      recommendations: ['Obtain relevant certifications', 'Partner with experienced firms'],
      competitive_advantage: ['Specialized expertise', 'Cost-effective solutions'],
      risk_assessment: 'Medium',
      bid_probability: 'Medium'
    };
  }

  getFallbackDocumentAnalysis() {
    return {
      extracted_dates: { submission_deadline: 'Not found', opening_date: 'Not found' },
      financial_requirements: { budget: 'Not specified', emd: 'Not specified' },
      technical_specifications: ['Standard requirements apply'],
      evaluation_criteria: { technical: 70, financial: 30 },
      important_clauses: ['Standard terms and conditions'],
      contact_information: { email: 'Not provided', phone: 'Not provided' },
      document_type: 'Tender Document',
      mandatory_requirements: ['Valid registration', 'Technical capability']
    };
  }

  getFallbackBidAssistance(tenderData) {
    return {
      proposal_outline: 'Executive Summary, Technical Approach, Team, Timeline, Budget',
      key_points_to_address: ['Technical expertise', 'Past experience', 'Team qualifications'],
      pricing_strategy: 'Competitive pricing with value proposition',
      competitive_advantages: ['Specialized expertise', 'Proven track record'],
      risk_mitigation: ['Detailed project planning', 'Quality assurance'],
      document_checklist: ['Registration certificate', 'Experience certificates', 'Financial statements'],
      timeline_suggestions: 'Phased approach with milestones',
      team_composition: 'Project manager, technical leads, support staff',
      compliance_checklist: ['Regulatory compliance', 'Quality standards'],
      submission_tips: ['Submit before deadline', 'Follow format requirements']
    };
  }

  fallbackSearch(query, tenders, limit) {
    const queryWords = query.toLowerCase().split(/\W+/);
    
    return tenders
      .map(tender => {
        const tenderText = `${tender.title} ${tender.description} ${tender.category}`.toLowerCase();
        const matches = queryWords.filter(word => tenderText.includes(word)).length;
        const score = matches / queryWords.length;
        
        return {
          ...tender,
          similarity_score: score,
          relevance: score > 0.7 ? 'High' : score > 0.3 ? 'Medium' : 'Low'
        };
      })
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, limit);
  }

  // Health check
  async healthCheck() {
    try {
      await this.checkRateLimit();
      const testResult = await this.model.generateContent('Test connection');
      return { status: 'healthy', model: 'gemini-1.5-flash' };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }
}

module.exports = new AIService();