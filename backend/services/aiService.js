import { GoogleGenerativeAI } from '@google/generative-ai'
import Doubt from '../models/Doubt.js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const analyzeDoubtWithAI = async (doubtId, title, description, existingTags = []) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log('Gemini API key not configured, skipping AI analysis')
      return
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
    Analyze this programming/technical doubt and provide structured feedback:

    Title: ${title}
    Description: ${description}
    Existing Tags: ${existingTags.join(', ')}

    Please provide your analysis in the following JSON format:
    {
      "suggestedTags": ["tag1", "tag2", "tag3"],
      "difficulty": "beginner|intermediate|advanced",
      "estimatedTime": "time estimate to resolve",
      "requiredSkills": ["skill1", "skill2"],
      "category": "programming|mathematics|science|other"
    }

    Focus on:
    1. Identifying relevant technical tags based on the content
    2. Assessing the complexity level
    3. Estimating how long it might take to solve
    4. What skills/knowledge would be needed

    Keep tags concise and relevant. Only suggest 3-5 most important tags.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const aiAnalysis = JSON.parse(jsonMatch[0])

      // Update the doubt with AI analysis
      await Doubt.findByIdAndUpdate(doubtId, {
        $set: {
          aiAnalysis: {
            suggestedTags: aiAnalysis.suggestedTags || [],
            difficulty: aiAnalysis.difficulty || 'intermediate',
            estimatedTime: aiAnalysis.estimatedTime || 'Unknown',
            requiredSkills: aiAnalysis.requiredSkills || []
          }
        }
      })

      console.log(`AI analysis completed for doubt ${doubtId}`)
    }
  } catch (error) {
    console.error('AI analysis error:', error)
    // Don't throw error to avoid breaking the doubt creation process
  }
}

export const generateSmartResponse = async (doubtTitle, doubtDescription, userSkills = []) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return null
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
    As a helpful mentor, provide guidance for this technical doubt:

    Title: ${doubtTitle}
    Description: ${doubtDescription}
    Mentor Skills: ${userSkills.join(', ')}

    Provide a helpful response that:
    1. Acknowledges the question
    2. Offers practical guidance or solution approaches
    3. Suggests next steps or resources
    4. Maintains an encouraging tone

    Keep the response concise but comprehensive (2-3 paragraphs maximum).
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Smart response generation error:', error)
    return null
  }
}