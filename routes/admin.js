import express from 'express';
import { supabase } from '../server.js';

const router = express.Router();

// TODO: Add authentication middleware
// const authMiddleware = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ error: 'Unauthorized' });
//   // Verify JWT token
//   next();
// };

/**
 * GET /api/admin/dashboard
 * Get dashboard statistics
 */
router.get('/dashboard', async (req, res) => {
  try {
    // TODO: Add auth middleware

    // Get counts
    const [submissions, projects, applications] = await Promise.all([
      supabase.from('submissions').select('count').eq('status', 'new'),
      supabase.from('projects').select('count').eq('published', true),
      supabase.from('applications').select('count').eq('published', true)
    ]);

    res.json({
      newSubmissions: submissions.count || 0,
      totalProjects: projects.count || 0,
      totalApplications: applications.count || 0
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

/**
 * GET /api/admin/submissions
 * Get all contact submissions
 */
router.get('/submissions', async (req, res) => {
  try {
    // TODO: Add auth middleware

    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch submissions' });
    }

    res.json(data || []);
  } catch (err) {
    console.error('Get submissions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/admin/submissions/:id
 * Update submission status
 */
router.put('/submissions/:id', async (req, res) => {
  try {
    // TODO: Add auth middleware

    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'reviewed', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data, error } = await supabase
      .from('submissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: 'Failed to update submission' });
    }

    res.json(data[0]);
  } catch (err) {
    console.error('Update submission error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/admin/submissions/:id
 * Delete a submission
 */
router.delete('/submissions/:id', async (req, res) => {
  try {
    // TODO: Add auth middleware

    const { id } = req.params;
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete submission' });
    }

    res.json({ success: true, message: 'Submission deleted' });
  } catch (err) {
    console.error('Delete submission error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
