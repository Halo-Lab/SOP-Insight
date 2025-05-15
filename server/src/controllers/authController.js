import supabase from '../config/database.js';

export const signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.CLIENT_URL || 'http://localhost:3000'}/email-confirmation`,
      }
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error('Registration failed - no user data returned');
    }

    await supabase
      .from('profiles')
      .insert([{ id: data.user.id }]);

    res.json({
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    const { data: profile } = await supabase
      .from('profiles')
      .select('role_id')
      .eq('id', user.id)
      .single();
    res.json({ user: { ...user, role_id: profile?.role_id || null } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  const { role_id } = req.body;

  if (role_id === undefined || role_id === null) {
    return res.status(400).json({ error: 'Role ID is required' });
  }

  try {
    // Update the role_id field in the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update({ role_id: Number(role_id) })
      .eq('id', req.user.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 