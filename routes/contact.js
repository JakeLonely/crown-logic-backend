import express from 'express';
import Joi from 'joi';
import { supabase } from '../server.js';

const router = express.Router();

// Validation schema
const contactSchema = Joi.object({
  name: Joi.string().required().trim().max(100),
  email: Joi.string().email().required().lowercase(),
  company: Joi.string().allow('').max(100),
  message: Joi.string().required().trim().max(5000)
});

/**
 * POST /api/contact
 * Submit a contact form
 */
router.post('/', async (req, res) => {
  try {
    // Validate input
    const { error, value } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, company, message } = value;

    // Store in Supabase
    const { data, error: dbError } = await supabase
      .from('submissions')
      .insert([
        {
          name,
          email,
          company: company || null,
          message,
          status: 'new'
        }
      ])
      .select();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Failed to submit contact form' });
    }

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to user

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting Crown Logic. We will be in touch shortly.',
      id: data[0]?.id
    });

  } catch (err) {
    console.error('Contact route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/contact/:id
 * Get submission by ID (admin only - should be protected)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('Get contact error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
