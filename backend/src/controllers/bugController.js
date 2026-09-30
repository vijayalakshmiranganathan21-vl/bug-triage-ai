import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Get all bugs
export const getAllBugs = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('bugs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Get bug by ID
export const getBugById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('bugs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found',
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new bug
export const createBug = async (req, res, next) => {
  try {
    const {
      title,
      description,
      source,
      severity,
      priority,
      team,
      assigned_developer,
      expected_behavior,
      actual_behavior,
      environment,
      reproduction_steps,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    // Generate bug code
    const bugCode = `BUG-${Date.now()}`;

    const { data, error } = await supabase
      .from('bugs')
      .insert([
        {
          bug_code: bugCode,
          title,
          description,
          source,
          severity: severity || 'Medium',
          priority: priority || 'Medium',
          status: 'New',
          ai_status: 'Pending',
          team,
          assigned_developer,
          expected_behavior,
          actual_behavior,
          environment,
          reproduction_steps,
          reproduction_status: 'Not Run',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Bug created successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Update bug status
export const updateBugStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const { data, error } = await supabase
      .from('bugs')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found',
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bug status updated successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllBugs,
  getBugById,
  createBug,
  updateBugStatus,
};