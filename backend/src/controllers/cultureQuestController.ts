import { Response } from 'express';
import { pool } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// @desc    Get active scenarios for user
// @route   GET /api/culture-quest/scenarios
// @access  Private
export const getActiveScenarios = async (req: AuthRequest, res: Response) => {
  try {
    const { context, limit = 1 } = req.query;

    let query = `
      SELECT s.*,
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', o.id,
            'text', o.option_text,
            'label', o.option_label,
            'emoji', o.emoji,
            'order', o.option_order
          )
        )
        FROM culture_scenario_options o
        WHERE o.scenario_id = s.id
        ORDER BY o.option_order) as options
      FROM culture_scenarios s
      WHERE s.is_active = TRUE
    `;

    const params: any[] = [];

    if (context) {
      query += ' AND s.context = ?';
      params.push(context);
    }

    // Exclude recently answered scenarios (within 24 hours)
    query += `
      AND s.id NOT IN (
        SELECT scenario_id FROM culture_responses
        WHERE user_id = ?
        AND completed_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
      )
    `;
    params.push(req.user.id);

    query += ' ORDER BY RAND() LIMIT ?';
    params.push(parseInt(limit as string));

    const [scenarios] = await pool.query<RowDataPacket[]>(query, params);

    // Parse JSON options
    const formattedScenarios = scenarios.map((s) => ({
      ...s,
      options: s.options ? JSON.parse(s.options) : [],
    }));

    res.json({
      success: true,
      data: formattedScenarios,
    });
  } catch (error: any) {
    console.error('Get scenarios error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Submit response to scenario
// @route   POST /api/culture-quest/response
// @access  Private
export const submitResponse = async (req: AuthRequest, res: Response) => {
  try {
    const { scenarioId, optionId, contextData } = req.body;

    if (!scenarioId || !optionId) {
      return res.status(400).json({
        success: false,
        error: 'scenarioId and optionId are required',
      });
    }

    // Get option details (dimension & likert value)
    const [options] = await pool.query<RowDataPacket[]>(
      `SELECT dimension_id, likert_value FROM culture_scenario_options WHERE id = ?`,
      [optionId]
    );

    if (options.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Option not found',
      });
    }

    const option = options[0];

    // Insert response
    await pool.query(
      `INSERT INTO culture_responses
       (user_id, scenario_id, option_id, dimension_id, likert_value, context_data)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        scenarioId,
        optionId,
        option.dimension_id,
        option.likert_value,
        contextData ? JSON.stringify(contextData) : null,
      ]
    );

    // Update user's culture score for this dimension
    await updateUserCultureScore(req.user.id, option.dimension_id);

    // Calculate XP reward
    const xpReward = 10;
    await pool.query(
      'UPDATE characters SET xp = xp + ? WHERE user_id = ?',
      [xpReward, req.user.id]
    );

    res.json({
      success: true,
      data: {
        message: 'Response recorded successfully',
        xpEarned: xpReward,
        dimensionUpdated: option.dimension_id,
      },
    });
  } catch (error: any) {
    console.error('Submit response error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Helper function to update aggregated culture score
async function updateUserCultureScore(userId: number, dimensionId: string) {
  // Calculate average likert score for this dimension
  const [results] = await pool.query<RowDataPacket[]>(
    `SELECT AVG(likert_value) as avg_score, COUNT(*) as count
     FROM culture_responses
     WHERE user_id = ? AND dimension_id = ?`,
    [userId, dimensionId]
  );

  const avgScore = results[0].avg_score || 0;
  const count = results[0].count || 0;

  // Normalize to 0-5 scale (since likert is already 1-5)
  const normalizedScore = avgScore / 5; // Convert to 0-1 scale

  // Upsert into user_culture_scores
  await pool.query(
    `INSERT INTO user_culture_scores (user_id, dimension_id, current_score, response_count)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       current_score = VALUES(current_score),
       response_count = VALUES(response_count),
       last_updated = CURRENT_TIMESTAMP`,
    [userId, dimensionId, normalizedScore, count]
  );
}

// @desc    Get user's culture scores
// @route   GET /api/culture-quest/scores
// @access  Private
export const getUserScores = async (req: AuthRequest, res: Response) => {
  try {
    const [scores] = await pool.query<RowDataPacket[]>(
      `SELECT
        ucs.*,
        cd.name,
        cd.description,
        cd.icon,
        cd.color
       FROM user_culture_scores ucs
       JOIN culture_dimensions cd ON ucs.dimension_id = cd.id
       WHERE ucs.user_id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: scores,
    });
  } catch (error: any) {
    console.error('Get user scores error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get radar chart data
// @route   GET /api/culture-quest/radar
// @access  Private
export const getUserRadarData = async (req: AuthRequest, res: Response) => {
  try {
    // Get user scores
    const [userScores] = await pool.query<RowDataPacket[]>(
      `SELECT
        cd.id,
        cd.name,
        cd.icon,
        cd.color,
        COALESCE(ucs.current_score, 0) as score,
        ucs.response_count
       FROM culture_dimensions cd
       LEFT JOIN user_culture_scores ucs
         ON cd.id = ucs.dimension_id AND ucs.user_id = ?
       ORDER BY cd.name`,
      [req.user.id]
    );

    // Get cohort average for comparison
    const [cohortAvg] = await pool.query<RowDataPacket[]>(
      `SELECT
        dimension_id,
        AVG(current_score) as avg_score
       FROM user_culture_scores
       GROUP BY dimension_id`
    );

    const cohortMap = new Map(cohortAvg.map((c) => [c.dimension_id, c.avg_score]));

    const radarData = userScores.map((s) => ({
      dimension: s.name,
      dimensionId: s.id,
      userScore: parseFloat(s.score) * 5, // Scale back to 0-5
      cohortAvg: (cohortMap.get(s.id) || 0) * 5,
      responseCount: s.response_count || 0,
      icon: s.icon,
      color: s.color,
    }));

    res.json({
      success: true,
      data: {
        radarData,
        totalResponses: userScores.reduce((sum, s) => sum + (s.response_count || 0), 0),
      },
    });
  } catch (error: any) {
    console.error('Get radar data error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get organization-level analytics
// @route   GET /api/culture-quest/analytics/organization
// @access  Private (Admin)
export const getOrganizationAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    // Average scores per dimension
    const [dimensionAvg] = await pool.query<RowDataPacket[]>(
      `SELECT
        cd.name,
        cd.icon,
        AVG(ucs.current_score) * 5 as avg_score,
        COUNT(DISTINCT ucs.user_id) as user_count
       FROM culture_dimensions cd
       LEFT JOIN user_culture_scores ucs ON cd.id = ucs.dimension_id
       GROUP BY cd.id, cd.name, cd.icon`
    );

    // Total responses
    const [totals] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total_responses, COUNT(DISTINCT user_id) as active_users
       FROM culture_responses`
    );

    // Trend over last 30 days
    const [trend] = await pool.query<RowDataPacket[]>(
      `SELECT
        DATE(completed_at) as date,
        COUNT(*) as responses,
        AVG(likert_value) as avg_likert
       FROM culture_responses
       WHERE completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(completed_at)
       ORDER BY date`
    );

    res.json({
      success: true,
      data: {
        dimensionAverages: dimensionAvg,
        totals: totals[0],
        trend,
      },
    });
  } catch (error: any) {
    console.error('Get organization analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get dimension trend
// @route   GET /api/culture-quest/analytics/trend/:dimensionId
// @access  Private
export const getDimensionTrend = async (req: AuthRequest, res: Response) => {
  try {
    const { dimensionId } = req.params;
    const { days = 30 } = req.query;

    const [trend] = await pool.query<RowDataPacket[]>(
      `SELECT
        DATE(completed_at) as date,
        AVG(likert_value) as avg_score,
        COUNT(*) as response_count
       FROM culture_responses
       WHERE dimension_id = ?
         AND user_id = ?
         AND completed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(completed_at)
       ORDER BY date`,
      [dimensionId, req.user.id, days]
    );

    res.json({
      success: true,
      data: trend,
    });
  } catch (error: any) {
    console.error('Get dimension trend error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
