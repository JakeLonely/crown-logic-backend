import express from 'express';
import { supabase } from '../server.js';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';

const router = express.Router();

// Validation schema
const projectSchema = Joi.object({
  name: Joi.string().required().trim().max(200),
  description: Joi.string().required().trim().max(2000),
  type: Joi.string().required().valid('mobile', 'web', 'software'),
  status: Joi.string().required().valid('upcoming', 'in-progress', 'launched'),
  technologies: Joi.array().items(Joi.string()).required(),
  image_url: Joi.string().uri().allow(null),
  project_url: Joi.string().uri().allow(null),
  metrics: Joi.object().allow(null)
});

/**
 * GET /api/projects
 * Get all projects (public)
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    res.json(data || []);
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/projects/:id
 * Get single project by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/projects
 * Create new project (admin only - should be protected)
 */
router.post('/', async (req, res) => {
  try {
    // TODO: Add authentication middleware here
    // if (!req.user || !req.user.is_admin) return res.status(401).json({ error: 'Unauthorized' });

    const { error: validationError, value } = projectSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const id = uuidv4();
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          id,
          ...value,
          published: true,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      return res.status(500).json({ error: 'Failed to create project' });
    }

    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/projects/:id
 * Update project (admin only - should be protected)
 */
router.put('/:id', async (req, res) => {
  try {
    // TODO: Add authentication middleware here

    const { id } = req.params;
    const { error: validationError, value } = projectSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { data, error } = await supabase
      .from('projects')
      .update({
        ...value,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: 'Failed to update project' });
    }

    res.json(data[0]);
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete project (admin only - should be protected)
 */
router.delete('/:id', async (req, res) => {
  try {
    // TODO: Add authentication middleware here

    const { id } = req.params;
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete project' });
    }

    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
