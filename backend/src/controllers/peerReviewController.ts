import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import {
  SubmitPeerReviewRequest,
  PeerReviewWithDetails,
  AriseRadarData,
  ReviewJourney,
  EmployeeListItem,
  UserAriseScore
} from '../types/peerReview.js';

interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    username: string;
  };
}

// Get list of employees available to review
export const getEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const [employees] = await pool.query<RowDataPacket[]>(`
      SELECT
        u.id,
        u.username,
        u.email,
        u.avatar_url,
        c.level,
        c.title,
        EXISTS(
          SELECT 1 FROM peer_reviews pr
          WHERE pr.reviewer_id = ?
          AND pr.reviewee_id = u.id
          AND pr.status = 'submitted'
        ) as has_reviewed,
        (
          SELECT MAX(pr.submitted_at)
          FROM peer_reviews pr
          WHERE pr.reviewer_id = ?
          AND pr.reviewee_id = u.id
        ) as last_reviewed_at,
        (
          SELECT AVG(uas.average_score)
          FROM user_arise_scores uas
          WHERE uas.user_id = u.id
        ) as average_arise_score
      FROM users u
      LEFT JOIN characters c ON u.id = c.user_id
      WHERE u.id != ?
      ORDER BY u.username ASC
    `, [userId, userId, userId]);

    res.json(employees as EmployeeListItem[]);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
};

// Get reviews submitted by current user
export const getMyReviews = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const [reviews] = await pool.query<RowDataPacket[]>(`
      SELECT
        pr.*,
        u.username as reviewee_name,
        u.email as reviewee_email,
        u.avatar_url as reviewee_avatar
      FROM peer_reviews pr
      JOIN users u ON pr.reviewee_id = u.id
      WHERE pr.reviewer_id = ?
      ORDER BY pr.submitted_at DESC
    `, [userId]);

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching my reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

// Get reviews received by user
export const getReviewsAboutMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const [reviews] = await pool.query<RowDataPacket[]>(`
      SELECT
        pr.*,
        u.username as reviewer_name,
        u.email as reviewer_email,
        u.avatar_url as reviewer_avatar
      FROM peer_reviews pr
      JOIN users u ON pr.reviewer_id = u.id
      WHERE pr.reviewee_id = ?
      ORDER BY pr.submitted_at DESC
    `, [userId]);

    // Get ratings for each review
    for (const review of reviews) {
      const [ratings] = await pool.query<RowDataPacket[]>(`
        SELECT
          prr.*,
          ast.statement_text,
          ad.name as dimension_name
        FROM peer_review_ratings prr
        JOIN arise_statements ast ON prr.statement_id = ast.id
        JOIN arise_dimensions ad ON prr.dimension_id = ad.id
        WHERE prr.review_id = ?
        ORDER BY ad.order_index, ast.order_index
      `, [review.id]);
      review.ratings = ratings;
    }

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews about me:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

// Submit a peer review
export const submitPeerReview = async (req: AuthRequest, res: Response) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { reviewee_id, review_cycle, overall_comment, ratings }: SubmitPeerReviewRequest = req.body;

    // Validation
    if (!reviewee_id) {
      return res.status(400).json({ message: 'Reviewee ID is required' });
    }

    if (reviewee_id === userId) {
      return res.status(400).json({ message: 'You cannot review yourself' });
    }

    if (!ratings || ratings.length === 0) {
      return res.status(400).json({ message: 'At least one rating is required' });
    }

    // Validate all ratings are 1-5
    const invalidRating = ratings.find(r => r.rating < 1 || r.rating > 5);
    if (invalidRating) {
      return res.status(400).json({ message: 'All ratings must be between 1 and 5' });
    }

    await connection.beginTransaction();

    // Insert peer review
    const [reviewResult] = await connection.query<ResultSetHeader>(`
      INSERT INTO peer_reviews (reviewer_id, reviewee_id, review_cycle, overall_comment, status)
      VALUES (?, ?, ?, ?, 'submitted')
    `, [userId, reviewee_id, review_cycle || null, overall_comment || null]);

    const reviewId = reviewResult.insertId;

    // Insert ratings
    for (const rating of ratings) {
      await connection.query(`
        INSERT INTO peer_review_ratings (review_id, statement_id, dimension_id, rating, comment)
        VALUES (?, ?, ?, ?, ?)
      `, [reviewId, rating.statement_id, rating.dimension_id, rating.rating, rating.comment || null]);
    }

    // Update user_arise_scores for reviewee
    const dimensionScores = ratings.reduce((acc, rating) => {
      if (!acc[rating.dimension_id]) {
        acc[rating.dimension_id] = [];
      }
      acc[rating.dimension_id].push(rating.rating);
      return acc;
    }, {} as Record<string, number[]>);

    for (const [dimensionId, scores] of Object.entries(dimensionScores)) {
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

      // Check if score exists
      const [existing] = await connection.query<RowDataPacket[]>(`
        SELECT id, average_score, total_reviews FROM user_arise_scores
        WHERE user_id = ? AND dimension_id = ?
      `, [reviewee_id, dimensionId]);

      if (existing.length > 0) {
        // Update existing score
        const currentScore = parseFloat(existing[0].average_score);
        const totalReviews = existing[0].total_reviews;
        const newAvg = ((currentScore * totalReviews) + avgScore) / (totalReviews + 1);

        await connection.query(`
          UPDATE user_arise_scores
          SET average_score = ?, total_reviews = total_reviews + 1, last_review_at = NOW()
          WHERE user_id = ? AND dimension_id = ?
        `, [newAvg, reviewee_id, dimensionId]);
      } else {
        // Insert new score
        await connection.query(`
          INSERT INTO user_arise_scores (user_id, dimension_id, average_score, total_reviews, last_review_at)
          VALUES (?, ?, ?, 1, NOW())
        `, [reviewee_id, dimensionId, avgScore]);
      }
    }

    // Award XP and coins to reviewer
    const xpReward = 50;
    const coinReward = 20;

    await connection.query(`
      UPDATE users SET xp = xp + ?, coins = coins + ?
      WHERE id = ?
    `, [xpReward, coinReward, userId]);

    await connection.query(`
      UPDATE characters SET xp = xp + ?
      WHERE user_id = ?
    `, [xpReward, userId]);

    // Check for badge awards (async, don't block response)
    checkBadgeAwards(reviewee_id, connection).catch(console.error);
    checkReviewerBadges(userId, connection).catch(console.error);

    // Create notification for reviewee
    await connection.query(`
      INSERT INTO notifications (user_id, type, title, message, action_url, icon)
      VALUES (?, 'peer_review_received', 'New Peer Review', ?, '/peer-review/results/me', '🌟')
    `, [reviewee_id, `${req.user?.username} has completed a peer review about you!`]);

    await connection.commit();

    res.status(201).json({
      message: 'Peer review submitted successfully',
      reviewId,
      xp_earned: xpReward,
      coins_earned: coinReward
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error submitting peer review:', error);
    res.status(500).json({ message: 'Error submitting peer review' });
  } finally {
    connection.release();
  }
};

// Get ARISE radar data for a user
export const getAriseRadar = async (req: AuthRequest, res: Response) => {
  try {
    const targetUserId = req.params.userId ? parseInt(req.params.userId) : req.user?.userId;

    if (!targetUserId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const [scores] = await pool.query<RowDataPacket[]>(`
      SELECT
        uas.dimension_id,
        uas.average_score,
        uas.total_reviews,
        ad.name as dimension_name,
        ad.icon,
        ad.color
      FROM user_arise_scores uas
      JOIN arise_dimensions ad ON uas.dimension_id = ad.id
      ORDER BY ad.order_index
    `, [targetUserId]);

    const dimensions = scores.map((s: any) => ({
      dimension: s.dimension_name,
      score: parseFloat(s.average_score),
      total_reviews: s.total_reviews,
      color: s.color,
      icon: s.icon
    }));

    const overallAverage = dimensions.length > 0
      ? dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
      : 0;

    const radarData: AriseRadarData = {
      dimensions,
      overall_average: Math.round(overallAverage * 100) / 100
    };

    res.json(radarData);
  } catch (error) {
    console.error('Error fetching ARISE radar:', error);
    res.status(500).json({ message: 'Error fetching ARISE radar data' });
  }
};

// Get user's review journey
export const getReviewJourney = async (req: AuthRequest, res: Response) => {
  try {
    const targetUserId = req.params.userId ? parseInt(req.params.userId) : req.user?.userId;

    if (!targetUserId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get total reviews
    const [reviewCounts] = await pool.query<RowDataPacket[]>(`
      SELECT
        (SELECT COUNT(*) FROM peer_reviews WHERE reviewee_id = ?) as received,
        (SELECT COUNT(*) FROM peer_reviews WHERE reviewer_id = ?) as given
    `, [targetUserId, targetUserId]);

    // Get review history
    const [reviews] = await pool.query<RowDataPacket[]>(`
      SELECT
        pr.id,
        pr.submitted_at,
        u.username as reviewer_name
      FROM peer_reviews pr
      JOIN users u ON pr.reviewer_id = u.id
      WHERE pr.reviewee_id = ?
      ORDER BY pr.submitted_at DESC
      LIMIT 20
    `, [targetUserId]);

    // Get dimension scores for each review
    for (const review of reviews) {
      const [dimScores] = await pool.query<RowDataPacket[]>(`
        SELECT
          prr.dimension_id,
          AVG(prr.rating) as avg_rating
        FROM peer_review_ratings prr
        WHERE prr.review_id = ?
        GROUP BY prr.dimension_id
      `, [review.id]);

      review.dimension_scores = dimScores.reduce((acc: any, ds: any) => {
        acc[ds.dimension_id] = parseFloat(ds.avg_rating);
        return acc;
      }, {});
    }

    // Get score history per dimension
    const [dimensions] = await pool.query<RowDataPacket[]>(`
      SELECT id, name FROM arise_dimensions ORDER BY order_index
    `);

    const scoreHistory = [];
    for (const dim of dimensions) {
      const [history] = await pool.query<RowDataPacket[]>(`
        SELECT
          pr.submitted_at as review_date,
          AVG(prr.rating) as score
        FROM peer_review_ratings prr
        JOIN peer_reviews pr ON prr.review_id = pr.id
        WHERE pr.reviewee_id = ? AND prr.dimension_id = ?
        GROUP BY pr.id, pr.submitted_at
        ORDER BY pr.submitted_at ASC
      `, [targetUserId, dim.id]);

      scoreHistory.push({
        dimension_id: dim.id,
        dimension_name: dim.name,
        scores_over_time: history.map((h: any) => ({
          review_date: h.review_date,
          score: parseFloat(h.score)
        }))
      });
    }

    const journey: ReviewJourney = {
      user_id: targetUserId,
      total_reviews_received: reviewCounts[0].received,
      total_reviews_given: reviewCounts[0].given,
      reviews: reviews as any,
      score_history: scoreHistory
    };

    res.json(journey);
  } catch (error) {
    console.error('Error fetching review journey:', error);
    res.status(500).json({ message: 'Error fetching review journey' });
  }
};

// Get ARISE dimensions and statements
export const getAriseDimensions = async (req: Request, res: Response) => {
  try {
    const [dimensions] = await pool.query<RowDataPacket[]>(`
      SELECT * FROM arise_dimensions ORDER BY order_index
    `);

    for (const dim of dimensions) {
      const [statements] = await pool.query<RowDataPacket[]>(`
        SELECT * FROM arise_statements
        WHERE dimension_id = ? AND is_active = TRUE
        ORDER BY order_index
      `, [dim.id]);
      dim.statements = statements;
    }

    res.json(dimensions);
  } catch (error) {
    console.error('Error fetching ARISE dimensions:', error);
    res.status(500).json({ message: 'Error fetching ARISE dimensions' });
  }
};

// Helper function to check for badge awards
async function checkBadgeAwards(userId: number, connection: any) {
  try {
    // Get user's current scores
    const [scores] = await connection.query<RowDataPacket[]>(`
      SELECT dimension_id, average_score, total_reviews
      FROM user_arise_scores
      WHERE user_id = ?
    `, [userId]);

    const scoreMap = scores.reduce((acc: any, s: any) => {
      acc[s.dimension_id] = {
        score: parseFloat(s.average_score),
        reviews: s.total_reviews
      };
      return acc;
    }, {});

    // Get all badges
    const [badges] = await connection.query<RowDataPacket[]>(`
      SELECT * FROM arise_badges WHERE is_active = TRUE
    `);

    for (const badge of badges) {
      // Check if user already has this badge
      const [existing] = await connection.query<RowDataPacket[]>(`
        SELECT id FROM user_arise_badges
        WHERE user_id = ? AND badge_id = ?
      `, [userId, badge.id]);

      if (existing.length > 0) continue;

      const criteria = badge.criteria;
      let earned = false;

      if (badge.badge_type === 'dimension_master') {
        const dimScore = scoreMap[criteria.dimension];
        if (dimScore && dimScore.score >= criteria.min_score && dimScore.reviews >= criteria.min_reviews) {
          earned = true;
        }
      } else if (badge.badge_type === 'team_player') {
        const totalReviews = Object.values(scoreMap).reduce((sum: number, s: any) => sum + s.reviews, 0);
        const avgScore = Object.values(scoreMap).reduce((sum: number, s: any) => sum + s.score, 0) / scores.length;
        if (totalReviews >= criteria.reviews_received && avgScore >= criteria.min_avg) {
          earned = true;
        }
      } else if (badge.badge_type === 'special') {
        // ARISE Legend: all dimensions >= 4.5
        if (scores.length === 5) {
          earned = scores.every((s: any) => parseFloat(s.average_score) >= criteria.all_dimensions_min && s.total_reviews >= criteria.min_reviews);
        }
      }

      if (earned) {
        await connection.query(`
          INSERT INTO user_arise_badges (user_id, badge_id)
          VALUES (?, ?)
        `, [userId, badge.id]);

        // Award XP and coins
        await connection.query(`
          UPDATE users SET xp = xp + ?, coins = coins + ?
          WHERE id = ?
        `, [badge.xp_reward, badge.coin_reward, userId]);

        // Create notification
        await connection.query(`
          INSERT INTO notifications (user_id, type, title, message, action_url, icon)
          VALUES (?, 'badge_earned', 'New Badge Earned!', ?, '/badges', ?)
        `, [userId, `You've earned the "${badge.name}" badge!`, badge.icon]);
      }
    }
  } catch (error) {
    console.error('Error checking badge awards:', error);
  }
}

// Helper function to check reviewer badges
async function checkReviewerBadges(userId: number, connection: any) {
  try {
    const [reviewCount] = await connection.query<RowDataPacket[]>(`
      SELECT COUNT(*) as count FROM peer_reviews WHERE reviewer_id = ?
    `, [userId]);

    const count = reviewCount[0].count;

    // Get reviewer badges
    const [badges] = await connection.query<RowDataPacket[]>(`
      SELECT * FROM arise_badges
      WHERE badge_type = 'reviewer_active' AND is_active = TRUE
    `);

    for (const badge of badges) {
      const requiredReviews = badge.criteria.reviews_given;
      if (count >= requiredReviews) {
        // Check if already earned
        const [existing] = await connection.query<RowDataPacket[]>(`
          SELECT id FROM user_arise_badges
          WHERE user_id = ? AND badge_id = ?
        `, [userId, badge.id]);

        if (existing.length === 0) {
          await connection.query(`
            INSERT INTO user_arise_badges (user_id, badge_id)
            VALUES (?, ?)
          `, [userId, badge.id]);

          await connection.query(`
            UPDATE users SET xp = xp + ?, coins = coins + ?
            WHERE id = ?
          `, [badge.xp_reward, badge.coin_reward, userId]);

          await connection.query(`
            INSERT INTO notifications (user_id, type, title, message, action_url, icon)
            VALUES (?, 'badge_earned', 'New Badge Earned!', ?, '/badges', ?)
          `, [userId, `You've earned the "${badge.name}" badge!`, badge.icon]);
        }
      }
    }
  } catch (error) {
    console.error('Error checking reviewer badges:', error);
  }
}
