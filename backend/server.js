import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Server port configuration
const PORT = process.env.PORT || 5000;

// Initialize Supabase client using environment variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Demo seed accounts definition
const DEMO_USERS = [
  { email: 'dev@bugflow.ai', password: 'password123', name: 'Arun Kumar', role: 'developer' },
  { email: 'qa@bugflow.ai', password: 'password123', name: 'Meera Nair', role: 'qa' },
  { email: 'manager@bugflow.ai', password: 'password123', name: 'Rohan Kapoor', role: 'manager' },
];

// Helper: Seed demo accounts into Supabase Auth if they do not exist
async function ensureDemoAccounts() {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) return;
    const { data: userList } = await supabase.auth.admin.listUsers();
    const existingEmails = new Set((userList?.users || []).map((u) => u.email?.toLowerCase()));

    for (const demoUser of DEMO_USERS) {
      if (!existingEmails.has(demoUser.email.toLowerCase())) {
        await supabase.auth.admin.createUser({
          email: demoUser.email,
          password: demoUser.password,
          email_confirm: true,
          user_metadata: {
            name: demoUser.name,
            role: demoUser.role,
          },
        });
      }
    }
  } catch (err) {
    // Non-fatal warning for seed check
    console.warn('[Supabase Auth Seed Notice]:', err.message);
  }
}

// Enable CORS
app.use(cors());

// Enable JSON body parsing
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BugFlow AI backend is running',
  });
});

// Test endpoint for Supabase connection
app.get('/api/test-supabase', async (req, res) => {
  try {
    const { data, error, count } = await supabase
      .from('bugs')
      .select('*', { count: 'exact' });

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      count: count ?? (data ? data.length : 0),
      data: data || [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ==========================================
// AUTHENTICATION API ROUTES (Supabase Auth)
// ==========================================

/**
 * POST /api/auth/login
 * Authenticates user credentials via Supabase Auth
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: error.message || 'Invalid email or password',
      });
    }

    const authUser = data.user;
    const session = data.session;
    const role = authUser.user_metadata?.role || 'developer';
    const name = authUser.user_metadata?.name || authUser.email.split('@')[0];

    res.status(200).json({
      success: true,
      message: 'Authenticated successfully',
      user: {
        id: authUser.id,
        email: authUser.email,
        name,
        role,
      },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Authentication server error',
    });
  }
});

/**
 * POST /api/auth/register
 * Creates a new user in Supabase Auth with custom role
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const assignedRole = ['developer', 'qa', 'manager'].includes(role) ? role : 'developer';
    const displayName = name ? name.trim() : cleanEmail.split('@')[0];

    // Create confirmed user in Supabase
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        name: displayName,
        role: assignedRole,
      },
    });

    if (createError) {
      return res.status(400).json({
        success: false,
        error: createError.message || 'Failed to register user',
      });
    }

    // Automatically sign in the newly registered user
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (loginError) {
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please sign in.',
        user: {
          id: createData.user.id,
          email: createData.user.email,
          name: displayName,
          role: assignedRole,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Account created and authenticated',
      user: {
        id: loginData.user.id,
        email: loginData.user.email,
        name: displayName,
        role: assignedRole,
      },
      session: {
        access_token: loginData.session.access_token,
        refresh_token: loginData.session.refresh_token,
        expires_at: loginData.session.expires_at,
        expires_in: loginData.session.expires_in,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Registration server error',
    });
  }
});

/**
 * GET /api/auth/me
 * Returns authenticated user profile using Bearer token
 */
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header required',
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        error: error?.message || 'Invalid or expired session',
      });
    }

    const user = data.user;
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email.split('@')[0],
        role: user.user_metadata?.role || 'developer',
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Session verification error',
    });
  }
});

/**
 * POST /api/auth/logout
 * Client-side session clearing
 */
app.post('/api/auth/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// 404 JSON response for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Fallback 404 handler for any other unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start the server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await ensureDemoAccounts();
});

export default app;
