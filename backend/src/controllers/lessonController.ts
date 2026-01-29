import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Get all lessons with user progress
export const getLessons = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { mountain_id, type, difficulty } = req.query;

    let query = `
      SELECT
        l.*,
        COALESCE(ulp.status, 'not_started') as user_status,
        COALESCE(ulp.score, 0) as user_score,
        ulp.completed_at
      FROM lessons l
      LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id AND ulp.user_id = ?
      WHERE l.is_active = true
    `;

    const params: any[] = [userId];

    if (mountain_id) {
      query += ' AND l.mountain_id = ?';
      params.push(mountain_id);
    }

    if (type) {
      query += ' AND l.type = ?';
      params.push(type);
    }

    if (difficulty) {
      query += ' AND l.difficulty = ?';
      params.push(difficulty);
    }

    query += ' ORDER BY l.order_index ASC';

    const [lessons] = await pool.query<RowDataPacket[]>(query, params);

    res.json({
      success: true,
      data: lessons
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lessons'
    });
  }
};

// Get single lesson with cards/questions
export const getLessonById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    // Get lesson details
    const [lessons] = await pool.query<RowDataPacket[]>(
      `SELECT
        l.*,
        COALESCE(ulp.status, 'not_started') as user_status,
        COALESCE(ulp.current_card_index, 0) as current_card_index,
        COALESCE(ulp.score, 0) as user_score,
        ulp.completed_at
      FROM lessons l
      LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id AND ulp.user_id = ?
      WHERE l.id = ? AND l.is_active = true`,
      [userId, id]
    );

    if (lessons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    const lesson = lessons[0];

    // Get cards for Read lessons
    if (lesson.type === 'read') {
      const [cards] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM lesson_cards WHERE lesson_id = ? ORDER BY order_index ASC',
        [id]
      );
      lesson.cards = cards;
    }

    // Get questions for Exercise/Exam lessons
    if (lesson.type === 'exercise' || lesson.type === 'exam') {
      const [questions] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM exercise_questions WHERE lesson_id = ? ORDER BY order_index ASC',
        [id]
      );
      lesson.questions = questions.map(q => ({
        ...q,
        correct_answer: JSON.parse(q.correct_answer),
        options: q.options ? JSON.parse(q.options) : null,
        hints: q.hints ? JSON.parse(q.hints) : null
      }));
    }

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson'
    });
  }
};

// Start a lesson
export const startLesson = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { lessonId } = req.body;

    // Check if progress exists
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?',
      [userId, lessonId]
    );

    if (existing.length > 0) {
      // Update to in_progress if not started
      if (existing[0].status === 'not_started') {
        await pool.query(
          'UPDATE user_lesson_progress SET status = ?, updated_at = NOW() WHERE user_id = ? AND lesson_id = ?',
          ['in_progress', userId, lessonId]
        );
      }
    } else {
      // Create new progress record
      await pool.query(
        'INSERT INTO user_lesson_progress (user_id, lesson_id, status) VALUES (?, ?, ?)',
        [userId, lessonId, 'in_progress']
      );
    }

    res.json({
      success: true,
      message: 'Lesson started'
    });
  } catch (error) {
    console.error('Error starting lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start lesson'
    });
  }
};

// Update lesson progress
export const updateProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { lessonId, currentCardIndex, timeSpent } = req.body;

    await pool.query(
      `UPDATE user_lesson_progress
       SET current_card_index = ?, time_spent = ?, updated_at = NOW()
       WHERE user_id = ? AND lesson_id = ?`,
      [currentCardIndex, timeSpent, userId, lessonId]
    );

    res.json({
      success: true,
      message: 'Progress updated'
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress'
    });
  }
};

// Submit lesson answers (for exercises/exams)
export const submitAnswers = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.user?.userId;
    const { lessonId, answers, timeSpent } = req.body;

    // Get lesson and questions
    const [lessons] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM lessons WHERE id = ?',
      [lessonId]
    );

    if (lessons.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    const lesson = lessons[0];

    // Get questions
    const [questions] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM exercise_questions WHERE lesson_id = ? ORDER BY order_index ASC',
      [lessonId]
    );

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    const results = questions.map((q) => {
      totalPoints += q.points;
      const userAnswer = answers[q.id];
      const correctAnswer = JSON.parse(q.correct_answer);

      let isCorrect = false;
      if (Array.isArray(correctAnswer)) {
        // For multiple answers (checkbox)
        isCorrect = JSON.stringify(userAnswer?.sort()) === JSON.stringify(correctAnswer.sort());
      } else {
        isCorrect = userAnswer === correctAnswer[0];
      }

      if (isCorrect) {
        earnedPoints += q.points;
      }

      return {
        questionId: q.id,
        userAnswer,
        correctAnswer,
        isCorrect,
        points: isCorrect ? q.points : 0
      };
    });

    const scorePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    // Update or insert progress
    const [existing] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?',
      [userId, lessonId]
    );

    if (existing.length > 0) {
      await connection.query(
        `UPDATE user_lesson_progress
         SET status = 'completed', score = ?, answers = ?, time_spent = ?,
             attempts = attempts + 1, last_attempt_at = NOW(), completed_at = NOW(), updated_at = NOW()
         WHERE user_id = ? AND lesson_id = ?`,
        [scorePercentage, JSON.stringify(answers), timeSpent, userId, lessonId]
      );
    } else {
      await connection.query(
        `INSERT INTO user_lesson_progress
         (user_id, lesson_id, status, score, answers, time_spent, attempts, last_attempt_at, completed_at)
         VALUES (?, ?, 'completed', ?, ?, ?, 1, NOW(), NOW())`,
        [userId, lessonId, scorePercentage, JSON.stringify(answers), timeSpent]
      );
    }

    // Award XP and coins to user
    await connection.query(
      'UPDATE users SET xp = xp + ?, coins = coins + ? WHERE id = ?',
      [lesson.xp_reward, lesson.coin_reward, userId]
    );

    // Update character XP and level
    const [characters] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM characters WHERE user_id = ?',
      [userId]
    );

    if (characters.length > 0) {
      const character = characters[0];
      const newXP = character.xp + lesson.xp_reward;
      let newLevel = character.level;
      let newTitle = character.title;

      // Level up logic (every 100 XP = 1 level)
      newLevel = Math.floor(newXP / 100) + 1;

      // Title progression
      if (newLevel >= 50) newTitle = 'Grandmaster';
      else if (newLevel >= 40) newTitle = 'Master';
      else if (newLevel >= 30) newTitle = 'Expert';
      else if (newLevel >= 20) newTitle = 'Adept';
      else if (newLevel >= 10) newTitle = 'Apprentice';
      else newTitle = 'Novice';

      await connection.query(
        'UPDATE characters SET xp = ?, level = ?, title = ? WHERE user_id = ?',
        [newXP, newLevel, newTitle, userId]
      );
    }

    // Create notification
    await connection.query(
      `INSERT INTO notifications (user_id, type, title, message, icon)
       VALUES (?, 'lesson_complete', ?, ?, '🎉')`,
      [
        userId,
        'Lesson Completed!',
        `You earned ${lesson.xp_reward} XP and ${lesson.coin_reward} coins! Score: ${scorePercentage}%`
      ]
    );

    // Check for mission progress (lesson_complete)
    await updateMissionProgress(connection, userId, 'lesson_complete', 1);

    await connection.commit();

    res.json({
      success: true,
      data: {
        score: scorePercentage,
        earnedPoints,
        totalPoints,
        results,
        rewards: {
          xp: lesson.xp_reward,
          coins: lesson.coin_reward
        }
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error submitting answers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answers'
    });
  } finally {
    connection.release();
  }
};

// Helper function to update mission progress
async function updateMissionProgress(connection: any, userId: number, targetType: string, incrementValue: number) {
  // Get active missions with this target type
  const [missions] = await connection.query<RowDataPacket[]>(
    `SELECT m.*, mo.id as objective_id, mo.target_value, mo.target_type
     FROM missions m
     JOIN mission_objectives mo ON m.id = mo.mission_id
     WHERE m.is_active = true AND mo.target_type = ?`,
    [targetType]
  );

  for (const mission of missions) {
    // Check if user has active mission progress
    const [userProgress] = await connection.query<RowDataPacket[]>(
      `SELECT * FROM user_mission_progress
       WHERE user_id = ? AND mission_id = ? AND status = 'active'`,
      [userId, mission.id]
    );

    if (userProgress.length === 0) {
      // Create new mission progress
      const progressData = { [mission.objective_id]: incrementValue };
      await connection.query(
        `INSERT INTO user_mission_progress (user_id, mission_id, progress, expires_at)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY))`,
        [userId, mission.id, JSON.stringify(progressData)]
      );
    } else {
      // Update existing progress
      const currentProgress = JSON.parse(userProgress[0].progress || '{}');
      currentProgress[mission.objective_id] = (currentProgress[mission.objective_id] || 0) + incrementValue;

      // Check if mission completed
      if (currentProgress[mission.objective_id] >= mission.target_value) {
        await connection.query(
          `UPDATE user_mission_progress
           SET progress = ?, status = 'completed', completed_at = NOW()
           WHERE id = ?`,
          [JSON.stringify(currentProgress), userProgress[0].id]
        );

        // Award mission rewards
        await connection.query(
          'UPDATE users SET xp = xp + ?, coins = coins + ? WHERE id = ?',
          [mission.xp_reward, mission.coin_reward, userId]
        );

        // Create notification
        await connection.query(
          `INSERT INTO notifications (user_id, type, title, message, icon)
           VALUES (?, 'mission_complete', ?, ?, ?)`,
          [
            userId,
            'Mission Complete!',
            `You completed "${mission.title}" and earned ${mission.xp_reward} XP and ${mission.coin_reward} coins!`,
            mission.icon
          ]
        );
      } else {
        await connection.query(
          'UPDATE user_mission_progress SET progress = ? WHERE id = ?',
          [JSON.stringify(currentProgress), userProgress[0].id]
        );
      }
    }
  }
}

export default {
  getLessons,
  getLessonById,
  startLesson,
  updateProgress,
  submitAnswers
};
