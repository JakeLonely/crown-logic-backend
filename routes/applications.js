import express from 'express';
import { supabase } from '../server.js';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';

const router = express.Router();

// Validation schema
const appSchema = Joi.object({
  name: Joi.string().required().trim().max(200),
  description: Joi.string().required().trim().max(2000),
  url: Joi.string().uri().required(),
  status: Joi.string().required().valid('development', 'beta', 'production'),
  icon_url: Joi.string().uri().allow(null),
  category: Joi.string().required().max(100),
  featured: Joi.boolean().default(false)
});

/**
 * GET /api/applications
 * Get all applications
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch applications' });
    }

    res.json(data || []);
  } catch (err) {
    console.error('Get applications error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/applications/:id
 * Get single application
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('Get application error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/applications
 * Create new application (admin only)
 */
router.post('/', async (req, res) => {
  try {
    // TODO: Add authentication middleware

    const { error: validationError, value } = appSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const id = uuidv4();
    const { data, error } = await supabase
      .from('applications')
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
      return res.status(500).json({ error: 'Failed to create application' });
    }

    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Create application error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
